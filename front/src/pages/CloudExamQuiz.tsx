import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  AlertCircle,
  BookOpen,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Clock,
  Flag,
  LayoutGrid,
  List,
  Send,
  Sparkles,
} from 'lucide-react';
import { fetchQuestions, submitAnswers } from '../api/examApi';
import { Question } from '../types/question';

export interface CloudExamConfig {
  examType: 'nca' | 'awssaa' | 'awssysops';
  title: string;
  subtitle: string;
  badgeText: string;
  accentColor: 'cyan' | 'amber' | 'indigo';
  shuffleChoices: boolean;
  resultPath: string;
  durationSec?: number;
}

interface ShuffledQuestion extends Question {
  displayChoices: Array<{ displayKey: string; originalKey: string; value: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

const DISPLAY_KEYS = ['A', 'B', 'C', 'D'];

const CloudExamQuiz: React.FC<{ config: CloudExamConfig }> = ({ config }) => {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  // answers stores questionId -> originalKey ('A' | 'B' | 'C' | 'D')
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [flagged, setFlagged] = useState<Record<string, boolean>>({});
  const [currentIdx, setCurrentIdx] = useState(0);
  const [viewMode, setViewMode] = useState<'single' | 'scroll'>('single');
  const [timeLeft, setTimeLeft] = useState(config.durationSec ?? 1800);
  const [isLoading, setIsLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setIsLoading(true);
    fetchQuestions(config.examType)
      .then((data) => {
        const rawList: Question[] = Array.isArray(data) ? data : data.questions;
        if (!rawList || rawList.length === 0) {
          throw new Error('출제된 문항 데이터가 없습니다.');
        }

        const prepared: ShuffledQuestion[] = rawList.map((q) => {
          const basePairs = [
            { originalKey: 'A', value: q.choice_a },
            { originalKey: 'B', value: q.choice_b },
            { originalKey: 'C', value: q.choice_c },
            { originalKey: 'D', value: q.choice_d },
          ];
          const ordered = config.shuffleChoices ? shuffleArray(basePairs) : basePairs;
          return {
            ...q,
            displayChoices: ordered.map((item, idx) => ({
              displayKey: DISPLAY_KEYS[idx],
              originalKey: item.originalKey,
              value: item.value,
            })),
          };
        });

        setQuestions(prepared);
        sessionStorage.setItem(`quizQuestions_${config.examType}`, JSON.stringify(rawList));
        setIsLoading(false);
        setError(null);
      })
      .catch((err) => {
        setIsLoading(false);
        setError(err.message || '문제를 불러오는데 실패했습니다.');
      });
  }, [config.examType, config.shuffleChoices]);

  // Countdown timer
  useEffect(() => {
    if (isLoading || error || questions.length === 0) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [isLoading, error, questions.length]);

  const handleSelectChoice = useCallback(
    (questionId: string, originalKey: string, qIndex: number) => {
      setAnswers((prev) => ({
        ...prev,
        [questionId]: originalKey,
      }));
      if (viewMode === 'single' && qIndex === currentIdx && qIndex < questions.length - 1) {
        setTimeout(() => setCurrentIdx(qIndex + 1), 180);
      }
    },
    [viewMode, currentIdx, questions.length]
  );

  const toggleFlag = useCallback((questionId: string) => {
    setFlagged((prev) => ({
      ...prev,
      [questionId]: !prev[questionId],
    }));
  }, []);

  // Keyboard shortcuts (1~4 or A~D, Left/Right arrows)
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (isLoading || submitting || questions.length === 0) return;
      if (['INPUT', 'TEXTAREA'].includes((e.target as HTMLElement)?.tagName)) return;

      const currentQ = questions[currentIdx];
      if (!currentQ) return;

      const upper = e.key.toUpperCase();
      const keyMap: Record<string, number> = {
        '1': 0,
        '2': 1,
        '3': 2,
        '4': 3,
        A: 0,
        B: 1,
        C: 2,
        D: 3,
      };

      if (upper in keyMap) {
        e.preventDefault();
        const choiceIdx = keyMap[upper];
        const targetChoice = currentQ.displayChoices[choiceIdx];
        if (targetChoice) {
          handleSelectChoice(currentQ.id, targetChoice.originalKey, currentIdx);
        }
      } else if (e.key === 'ArrowRight' && viewMode === 'single') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1));
      } else if (e.key === 'ArrowLeft' && viewMode === 'single') {
        e.preventDefault();
        setCurrentIdx((prev) => Math.max(0, prev - 1));
      }
    };

    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [isLoading, submitting, questions, currentIdx, viewMode, handleSelectChoice]);

  const handleSubmit = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (questions.length === 0 || submitting) return;

    const answeredCount = Object.keys(answers).length;
    if (answeredCount === 0) {
      alert('최소 1문제 이상 답안을 선택해주세요.');
      return;
    }

    setSubmitting(true);
    try {
      const result = await submitAnswers(config.examType, answers);
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate(config.resultPath);
    } catch (err: any) {
      setError(err.message || '답안 제출 중 오류가 발생했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const answeredCount = Object.keys(answers).length;
  const progressPct = questions.length > 0 ? Math.round((answeredCount / questions.length) * 100) : 0;

  const formatTimer = (sec: number) => {
    const m = Math.floor(sec / 60);
    const s = sec % 60;
    return `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  };

  const jumpToQuestion = (idx: number) => {
    setCurrentIdx(idx);
    if (viewMode === 'scroll') {
      const el = document.getElementById(`cbt-q-${idx}`);
      el?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  // Sentence break helper for readability
  const renderFormattedQuestion = useMemo(() => {
    return (text: string) => {
      const sentences = text.split(/(?<=\. )/);
      if (sentences.length >= 2) {
        return (
          <>
            <span>{sentences.slice(0, -1).join('')}</span>
            <span className="mt-2 block font-semibold text-white">
              {sentences[sentences.length - 1]}
            </span>
          </>
        );
      }
      return text;
    };
  }, []);

  if (isLoading) {
    return (
      <div className="flex min-h-[calc(100vh-110px)] flex-col items-center justify-center px-4 text-center">
        <div className="h-12 w-12 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <h2 className="mt-4 text-lg font-bold text-white">
          MongoDB Atlas 문제 풀에서 랜덤 20문항을 출제하고 있습니다...
        </h2>
        <p className="mt-1 text-xs text-slate-400">AWS Lambda Serverless Function 호출 중</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mx-auto max-w-xl px-4 py-16 text-center">
        <div className="rounded-3xl border border-rose-500/30 bg-rose-500/10 p-8">
          <AlertCircle className="mx-auto h-12 w-12 text-rose-400" />
          <h2 className="mt-4 text-xl font-bold text-white">문제 로딩 중 오류가 발생했습니다</h2>
          <p className="mt-2 text-sm text-rose-200">{error}</p>
          <div className="mt-6 flex justify-center gap-3">
            <button
              type="button"
              onClick={() => window.location.reload()}
              className="rounded-xl bg-indigo-500 px-5 py-2.5 text-sm font-bold text-white hover:bg-indigo-400"
            >
              다시 시도
            </button>
            <Link
              to="/"
              className="rounded-xl border border-slate-700 bg-slate-800 px-5 py-2.5 text-sm font-semibold text-slate-200 hover:bg-slate-700"
            >
              홈으로 돌아가기
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const renderQuestionCard = (q: ShuffledQuestion, idx: number) => {
    const selectedOrigKey = answers[q.id];
    const isFlagged = !!flagged[q.id];

    return (
      <div
        key={q.id}
        id={`cbt-q-${idx}`}
        onClick={() => setCurrentIdx(idx)}
        className={`rounded-3xl border p-6 sm:p-8 transition ${
          currentIdx === idx
            ? 'border-indigo-500/60 bg-slate-900/95 shadow-xl shadow-indigo-950/30'
            : 'border-slate-800 bg-slate-900/70 hover:border-slate-700'
        }`}
      >
        {/* Question Card Header */}
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-2.5">
            <span className="inline-flex h-8 w-8 items-center justify-center rounded-xl bg-indigo-500/20 font-mono text-sm font-extrabold text-indigo-300 border border-indigo-500/30">
              Q{idx + 1}
            </span>
            <span className="text-xs font-medium text-slate-400">
              전체 {questions.length}문항 중 {idx + 1}번째
            </span>
            {selectedOrigKey && (
              <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-[11px] font-bold text-emerald-300">
                <CheckCircle2 className="h-3 w-3" />
                선택 완료
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              toggleFlag(q.id);
            }}
            className={`inline-flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-semibold transition ${
              isFlagged
                ? 'border-amber-400/50 bg-amber-500/15 text-amber-300'
                : 'border-slate-700 bg-slate-800/80 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Flag className="h-3.5 w-3.5" />
            <span>{isFlagged ? '검토 표시됨' : '나중에 다시 보기'}</span>
          </button>
        </div>

        {/* Question Text */}
        <div className="mt-5 text-base sm:text-lg leading-relaxed text-slate-200">
          {renderFormattedQuestion(q.question)}
        </div>

        {/* 4 Choices */}
        <div className="mt-6 space-y-3">
          {q.displayChoices.map((choice) => {
            const isSelected = selectedOrigKey === choice.originalKey;
            return (
              <button
                key={choice.displayKey}
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleSelectChoice(q.id, choice.originalKey, idx);
                }}
                className={`flex w-full items-start gap-3.5 rounded-2xl border p-4 text-left transition ${
                  isSelected
                    ? 'border-indigo-400 bg-indigo-500/15 text-white ring-2 ring-indigo-400/30'
                    : 'border-slate-800 bg-slate-950/75 text-slate-300 hover:border-slate-700 hover:bg-slate-900'
                }`}
              >
                <span
                  className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-lg font-mono text-xs font-extrabold transition ${
                    isSelected
                      ? 'bg-indigo-500 text-white'
                      : 'border border-slate-700 bg-slate-900 text-slate-400'
                  }`}
                >
                  {choice.displayKey}
                </span>
                <span className="flex-1 text-sm sm:text-base leading-relaxed">
                  {choice.value}
                </span>
              </button>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-8 sm:px-6">
      {/* Top Exam Control Header */}
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-slate-800 bg-slate-900/85 px-6 py-4 shadow-lg">
        <div>
          <div className="flex items-center gap-2">
            <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2.5 py-0.5 text-xs font-bold text-indigo-300">
              {config.badgeText}
            </span>
            <span className="text-xs text-slate-400">키보드 1~4 또는 A~D 단축키 지원</span>
          </div>
          <h1 className="mt-1 text-xl sm:text-2xl font-extrabold text-white">{config.title}</h1>
        </div>

        {/* View Mode Switch & Timer */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setViewMode('single')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'single'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <BookOpen className="h-3.5 w-3.5" />
              <span>1문제씩 집중 모드</span>
            </button>
            <button
              type="button"
              onClick={() => setViewMode('scroll')}
              className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-bold transition ${
                viewMode === 'scroll'
                  ? 'bg-indigo-500 text-white'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <List className="h-3.5 w-3.5" />
              <span>20문제 전체 스크롤</span>
            </button>
          </div>

          <div className="inline-flex items-center gap-2 rounded-xl border border-slate-700 bg-slate-950 px-4 py-2 font-mono text-sm font-bold text-amber-300">
            <Clock className="h-4 w-4 text-amber-400" />
            <span>{formatTimer(timeLeft)}</span>
          </div>
        </div>
      </div>

      {/* Main Two-Column Exam Layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start">
        {/* Left: Question Area */}
        <div className="lg:col-span-8 space-y-6">
          {viewMode === 'single' ? (
            <>
              {questions[currentIdx] && renderQuestionCard(questions[currentIdx], currentIdx)}

              {/* Single Mode Prev / Next Navigation */}
              <div className="flex items-center justify-between rounded-2xl border border-slate-800 bg-slate-900/80 px-5 py-3.5">
                <button
                  type="button"
                  disabled={currentIdx === 0}
                  onClick={() => setCurrentIdx((prev) => Math.max(0, prev - 1))}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2 text-xs sm:text-sm font-bold text-slate-200 transition hover:bg-slate-700 disabled:opacity-40"
                >
                  <ChevronLeft className="h-4 w-4" />
                  <span>이전 문제</span>
                </button>

                <span className="text-xs font-semibold text-slate-400">
                  <strong className="text-white">{currentIdx + 1}</strong> / {questions.length}
                </span>

                {currentIdx < questions.length - 1 ? (
                  <button
                    type="button"
                    onClick={() => setCurrentIdx((prev) => Math.min(questions.length - 1, prev + 1))}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2 text-xs sm:text-sm font-bold text-white transition hover:bg-indigo-400"
                  >
                    <span>다음 문제</span>
                    <ChevronRight className="h-4 w-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => handleSubmit()}
                    disabled={submitting || answeredCount === 0}
                    className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-5 py-2 text-xs sm:text-sm font-extrabold text-white shadow-md transition hover:brightness-110 disabled:opacity-50"
                  >
                    <Send className="h-4 w-4" />
                    <span>답안 최종 제출</span>
                  </button>
                )}
              </div>
            </>
          ) : (
            <div className="space-y-6">
              {questions.map((q, idx) => renderQuestionCard(q, idx))}
            </div>
          )}
        </div>

        {/* Right: Sticky OMR Answer Palette & Progress */}
        <div className="lg:col-span-4 lg:sticky lg:top-28 space-y-4">
          <div className="rounded-3xl border border-slate-800 bg-slate-900/85 p-6 shadow-xl">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <LayoutGrid className="h-4 w-4 text-indigo-400" />
                <h2 className="text-sm font-bold text-white">OMR 답안 현황판</h2>
              </div>
              <span className="text-xs font-bold text-indigo-300">
                {answeredCount} / {questions.length} 완료 ({progressPct}%)
              </span>
            </div>

            {/* Progress Bar */}
            <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>

            {/* 20-Question Number Grid */}
            <div className="mt-5 grid grid-cols-5 gap-2">
              {questions.map((q, idx) => {
                const isAnswered = !!answers[q.id];
                const isCurrent = currentIdx === idx;
                const isFlagged = !!flagged[q.id];

                return (
                  <button
                    key={q.id}
                    type="button"
                    onClick={() => jumpToQuestion(idx)}
                    className={`relative flex h-10 items-center justify-center rounded-xl border font-mono text-xs font-bold transition ${
                      isCurrent
                        ? 'border-indigo-400 bg-indigo-500/25 text-white ring-2 ring-indigo-400/40'
                        : isAnswered
                        ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                        : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    <span>{idx + 1}</span>
                    {isFlagged && (
                      <span className="absolute -right-1 -top-1 flex h-3.5 w-3.5 items-center justify-center rounded-full bg-amber-400 text-[9px] text-slate-950">
                        ⚑
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Legend */}
            <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-t border-slate-800 pt-3 text-[11px] text-slate-400">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-emerald-400/80" /> 답변 완료 ({answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-slate-700" /> 미답변 ({questions.length - answeredCount})
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-full bg-amber-400" /> 검토 표시
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="button"
              onClick={() => handleSubmit()}
              disabled={submitting || answeredCount === 0}
              className="mt-5 flex w-full items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-indigo-500 via-blue-500 to-cyan-500 px-5 py-3.5 text-sm font-extrabold text-white shadow-lg shadow-indigo-500/25 transition hover:brightness-110 disabled:opacity-40"
            >
              <Send className="h-4 w-4" />
              <span>
                {submitting
                  ? '채점 진행 중...'
                  : answeredCount === questions.length
                  ? '20문항 답안 최종 제출하기'
                  : `답안 제출하기 (${answeredCount}/${questions.length} 선택됨)`}
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CloudExamQuiz;
