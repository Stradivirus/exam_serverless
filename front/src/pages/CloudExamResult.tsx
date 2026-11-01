import React, { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Filter,
  History,
  Home,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { formatStoredResults, ResultData } from '../components/commontxtResult';
import { fetchQuestions } from '../api/examApi';
import { saveAttemptRecord, saveWrongNotes } from '../utils/examStorage';

export interface CloudExamResultConfig {
  examType: 'nca' | 'awssaa' | 'awssysops';
  title: string;
  passPercentage: number;
  quizPath: string;
}

const CloudExamResult: React.FC<{ config: CloudExamResultConfig }> = ({ config }) => {
  const [result, setResult] = useState<ResultData | null>(null);
  const [loading, setLoading] = useState(true);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong' | 'correct'>('all');

  useEffect(() => {
    async function load() {
      setLoading(true);
      const storedResults = sessionStorage.getItem('quizResults');
      const cachedQuestionsRaw = sessionStorage.getItem(`quizQuestions_${config.examType}`);
      let questionsData = [];
      if (cachedQuestionsRaw) {
        try {
          questionsData = JSON.parse(cachedQuestionsRaw);
        } catch {
          questionsData = [];
        }
      }
      if (!questionsData || questionsData.length === 0) {
        try {
          questionsData = await fetchQuestions(config.examType);
        } catch {
          questionsData = [];
        }
      }

      if (storedResults) {
        const formatted = formatStoredResults(storedResults, questionsData);
        setResult(formatted);

        if (formatted) {
          const pct = formatted.total > 0 ? Math.round((formatted.score / formatted.total) * 100) : 0;
          const passed = formatted.score >= Math.ceil(formatted.total * config.passPercentage);

          saveAttemptRecord({
            examType: config.examType,
            examTitle: config.title,
            score: formatted.score,
            total: formatted.total,
            percentage: pct,
            passed,
          });

          const wrongItems = formatted.results
            .filter((r) => !r.is_correct)
            .map((r) => ({
              id: r.question_id,
              examType: config.examType,
              examTitle: config.title,
              questionText: r.question_text,
              choices: r.choices || {},
              userAnswer: r.user_answer,
              correctAnswer: r.correct_answer,
            }));

          if (wrongItems.length > 0) {
            saveWrongNotes(wrongItems);
          }
        }
      }
      setLoading(false);
    }
    load();
  }, [config.examType, config.passPercentage, config.title]);

  const filteredItems = useMemo(() => {
    if (!result) return [];
    return result.results
      .map((item, idx) => ({ ...item, number: idx + 1 }))
      .filter((item) => {
        if (filterMode === 'wrong') return !item.is_correct;
        if (filterMode === 'correct') return item.is_correct;
        return true;
      });
  }, [result, filterMode]);

  if (loading || !result) {
    return (
      <div className="flex min-h-[calc(100vh-120px)] flex-col items-center justify-center px-4 text-center">
        <div className="h-10 w-10 animate-spin rounded-full border-4 border-indigo-500 border-t-transparent" />
        <p className="mt-4 text-sm font-semibold text-slate-300">채점 결과를 불러오는 중...</p>
      </div>
    );
  }

  const passScore = Math.ceil(result.total * config.passPercentage);
  const isPassed = result.score >= passScore;
  const pct = result.total > 0 ? Math.round((result.score / result.total) * 100) : 0;
  const wrongCount = result.results.filter((r) => !r.is_correct).length;

  return (
    <div className="mx-auto max-w-5xl px-4 py-10 sm:px-6 space-y-8">
      {/* Score Summary Banner */}
      <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/90 p-6 sm:p-8 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <span
              className={`inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-extrabold ${
                isPassed
                  ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                  : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
              }`}
            >
              <Award className="h-4 w-4" />
              {isPassed ? 'PASS · 합격 기준 달성!' : 'FAIL · 조금만 더 보완해보세요'}
            </span>
            <h1 className="mt-3 text-2xl sm:text-3xl font-extrabold text-white">{config.title}</h1>
            <p className="mt-1 text-xs text-slate-400">
              합격 기준: {Math.round(config.passPercentage * 100)}% 이상 ({passScore}문항 이상 정답) · 틀린 문제는 오답노트에 자동 보관되었습니다.
            </p>
          </div>

          <div className="flex items-center gap-6 rounded-2xl border border-slate-800 bg-slate-950/90 px-6 py-4">
            <div className="text-center">
              <div className="text-xs text-slate-400">최종 점수</div>
              <div
                className={`mt-1 text-3xl font-black ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.score} <span className="text-lg font-semibold text-slate-500">/ {result.total}</span>
              </div>
            </div>
            <div className="h-10 w-px bg-slate-800" />
            <div className="text-center">
              <div className="text-xs text-slate-400">정답률</div>
              <div className="mt-1 text-3xl font-black text-white">{pct}%</div>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="mt-6 flex flex-wrap items-center justify-between gap-3 border-t border-slate-800 pt-5">
          <div className="flex flex-wrap items-center gap-2">
            <Link
              to={config.quizPath}
              className="inline-flex items-center gap-1.5 rounded-xl bg-indigo-500 px-4 py-2.5 text-xs sm:text-sm font-bold text-white shadow transition hover:bg-indigo-400"
            >
              <RotateCcw className="h-4 w-4" />
              <span>새로운 20문항 다시 풀기</span>
            </Link>
            <Link
              to="/history"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-800 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              <History className="h-4 w-4 text-indigo-400" />
              <span>내 오답노트 & 응시이력 보기</span>
            </Link>
          </div>

          <Link
            to="/"
            className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950 px-4 py-2.5 text-xs sm:text-sm font-semibold text-slate-300 hover:bg-slate-800"
          >
            <Home className="h-4 w-4" />
            <span>홈으로</span>
          </Link>
        </div>
      </div>

      {/* Review Filter Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <BookOpen className="h-5 w-5 text-indigo-400" />
          <h2 className="text-lg font-bold text-white">문항별 상세 오답 리뷰</h2>
        </div>

        <div className="inline-flex rounded-xl border border-slate-800 bg-slate-900 p-1 text-xs font-bold">
          <button
            type="button"
            onClick={() => setFilterMode('all')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filterMode === 'all' ? 'bg-indigo-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            전체 ({result.results.length})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('wrong')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filterMode === 'wrong' ? 'bg-rose-500 text-white' : 'text-slate-400 hover:text-white'
            }`}
          >
            오답만 보기 ({wrongCount})
          </button>
          <button
            type="button"
            onClick={() => setFilterMode('correct')}
            className={`rounded-lg px-3 py-1.5 transition ${
              filterMode === 'correct'
                ? 'bg-emerald-500 text-slate-950'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            정답만 보기 ({result.results.length - wrongCount})
          </button>
        </div>
      </div>

      {/* Review Cards */}
      <div className="space-y-4">
        {filteredItems.map((item) => (
          <div
            key={item.question_id || item.number}
            className={`rounded-3xl border p-6 transition ${
              item.is_correct
                ? 'border-emerald-500/30 bg-slate-900/75'
                : 'border-rose-500/40 bg-rose-950/10'
            }`}
          >
            <div className="flex items-center justify-between gap-2">
              <span className="inline-flex items-center gap-2 font-mono text-sm font-extrabold text-white">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1">문항 {item.number}</span>
              </span>
              {item.is_correct ? (
                <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-3 py-0.5 text-xs font-bold text-emerald-300">
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  정답
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-3 py-0.5 text-xs font-bold text-rose-300">
                  <XCircle className="h-3.5 w-3.5" />
                  오답 (내 선택: {item.user_answer} / 정답: {item.correct_answer})
                </span>
              )}
            </div>

            <p className="mt-4 text-base font-medium leading-relaxed text-slate-100">
              {item.question_text}
            </p>

            <div className="mt-4 space-y-2">
              {Object.entries(item.choices || {}).map(([key, value]) => {
                const isUser = item.user_answer === key;
                const isCorrectChoice = item.correct_answer === key;

                return (
                  <div
                    key={key}
                    className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm ${
                      isCorrectChoice
                        ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-semibold'
                        : isUser && !isCorrectChoice
                        ? 'border-rose-500/50 bg-rose-500/10 text-rose-200'
                        : 'border-slate-800 bg-slate-950/60 text-slate-400'
                    }`}
                  >
                    <span>
                      <strong className="mr-2 font-mono">{key}.</strong>
                      {value}
                    </span>
                    <div className="shrink-0 text-xs font-bold">
                      {isCorrectChoice && isUser && (
                        <span className="text-emerald-300">✓ 내 답안 (정답)</span>
                      )}
                      {isCorrectChoice && !isUser && (
                        <span className="text-emerald-300">✓ 정답</span>
                      )}
                      {!isCorrectChoice && isUser && (
                        <span className="text-rose-300">✗ 내 선택</span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CloudExamResult;
