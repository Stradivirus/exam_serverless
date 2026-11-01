import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  CheckCircle2,
  Eye,
  EyeOff,
  History,
  Trash2,
  XCircle,
} from 'lucide-react';
import {
  clearAttemptHistory,
  clearWrongNotes,
  ExamAttemptRecord,
  getAttemptHistory,
  getWrongNotes,
  removeWrongNote,
  WrongNoteItem,
} from '../utils/examStorage';

const HistoryNotePage: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'wrong' | 'history'>('wrong');
  const [wrongNotes, setWrongNotes] = useState<WrongNoteItem[]>([]);
  const [attempts, setAttempts] = useState<ExamAttemptRecord[]>([]);
  const [showAnswers, setShowAnswers] = useState<Record<string, boolean>>({});
  const [examFilter, setExamFilter] = useState<string>('all');

  useEffect(() => {
    setWrongNotes(getWrongNotes());
    setAttempts(getAttemptHistory());
  }, []);

  const filteredWrongNotes = wrongNotes.filter((item) =>
    examFilter === 'all' ? true : item.examType === examFilter
  );

  const passCount = attempts.filter((a) => a.passed).length;
  const avgPercentage =
    attempts.length > 0
      ? Math.round(attempts.reduce((acc, cur) => acc + cur.percentage, 0) / attempts.length)
      : 0;

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 space-y-8">
      {/* Top KPI Cards */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-xs font-semibold text-slate-400">누적 모의고사 응시</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-white">{attempts.length}</span>
            <span className="text-xs text-slate-400">회 (합격 {passCount}회)</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-xs font-semibold text-slate-400">평균 정답률</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-indigo-400">{avgPercentage}%</span>
            <span className="text-xs text-slate-400">전체 응시 평균</span>
          </div>
        </div>

        <div className="rounded-3xl border border-slate-800 bg-slate-900/80 p-5">
          <span className="text-xs font-semibold text-slate-400">오답노트 보관 문항</span>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-3xl font-black text-rose-400">{wrongNotes.length}</span>
            <span className="text-xs text-slate-400">문항 (자동 수집됨)</span>
          </div>
        </div>
      </div>

      {/* Mode Switch Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4">
        <div className="inline-flex rounded-2xl border border-slate-800 bg-slate-900 p-1">
          <button
            type="button"
            onClick={() => setActiveTab('wrong')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === 'wrong'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BookOpen className="h-4 w-4" />
            <span>오답노트 복습 ({wrongNotes.length})</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('history')}
            className={`inline-flex items-center gap-2 rounded-xl px-4 py-2 text-sm font-bold transition ${
              activeTab === 'history'
                ? 'bg-indigo-500 text-white shadow'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <History className="h-4 w-4" />
            <span>최근 응시 기록 ({attempts.length})</span>
          </button>
        </div>

        {activeTab === 'wrong' && wrongNotes.length > 0 && (
          <div className="flex items-center gap-2">
            <select
              value={examFilter}
              onChange={(e) => setExamFilter(e.target.value)}
              className="rounded-xl border border-slate-700 bg-slate-900 px-3 py-2 text-xs font-semibold text-slate-200"
            >
              <option value="all">전체 과목</option>
              <option value="nca">NCA (NAVER Cloud)</option>
              <option value="awssaa">AWS SAA-C03</option>
              <option value="awssysops">AWS SysOps</option>
            </select>
            <button
              type="button"
              onClick={() => {
                clearWrongNotes();
                setWrongNotes([]);
              }}
              className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
            >
              <Trash2 className="h-3.5 w-3.5" />
              <span>전체 비우기</span>
            </button>
          </div>
        )}

        {activeTab === 'history' && attempts.length > 0 && (
          <button
            type="button"
            onClick={() => {
              clearAttemptHistory();
              setAttempts([]);
            }}
            className="inline-flex items-center gap-1 rounded-xl border border-rose-500/30 bg-rose-500/10 px-3 py-2 text-xs font-semibold text-rose-300 hover:bg-rose-500/20"
          >
            <Trash2 className="h-3.5 w-3.5" />
            <span>응시 기록 초기화</span>
          </button>
        )}
      </div>

      {/* Tab Content */}
      {activeTab === 'wrong' ? (
        filteredWrongNotes.length === 0 ? (
          <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
            <BookOpen className="mx-auto h-10 w-10 text-slate-500" />
            <h3 className="mt-3 text-base font-bold text-white">
              보관된 오답 문항이 없습니다
            </h3>
            <p className="mt-1 text-xs text-slate-400">
              NCA, AWS SAA, AWS SysOps 모의고사를 풀고 틀린 문항이 생기면 이곳에 자동으로 저장됩니다.
            </p>
            <Link
              to="/"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-indigo-500 px-5 py-2.5 text-xs font-bold text-white hover:bg-indigo-400"
            >
              모의고사 풀러 가기 →
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {filteredWrongNotes.map((item) => {
              const key = `${item.examType}:${item.id}`;
              const revealed = !!showAnswers[key];

              return (
                <div
                  key={key}
                  className="rounded-3xl border border-slate-800 bg-slate-900/80 p-6 space-y-4"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-3 py-0.5 text-xs font-bold text-indigo-300">
                      {item.examTitle}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setShowAnswers((prev) => ({ ...prev, [key]: !prev[key] }))
                        }
                        className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
                      >
                        {revealed ? (
                          <>
                            <EyeOff className="h-3.5 w-3.5 text-amber-400" />
                            <span>정답 가리기</span>
                          </>
                        ) : (
                          <>
                            <Eye className="h-3.5 w-3.5 text-indigo-400" />
                            <span>정답 확인</span>
                          </>
                        )}
                      </button>

                      <button
                        type="button"
                        onClick={() =>
                          setWrongNotes(removeWrongNote(item.examType, item.id))
                        }
                        className="rounded-xl border border-slate-800 bg-slate-950 p-1.5 text-slate-400 hover:text-rose-400"
                        title="오답노트에서 삭제"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-base font-medium leading-relaxed text-white">
                    {item.questionText}
                  </p>

                  <div className="space-y-2">
                    {Object.entries(item.choices || {}).map(([cKey, cVal]) => {
                      const isCorrect = item.correctAnswer === cKey;
                      const isUser = item.userAnswer === cKey;

                      return (
                        <div
                          key={cKey}
                          className={`flex items-start justify-between gap-3 rounded-2xl border px-4 py-3 text-sm transition ${
                            revealed && isCorrect
                              ? 'border-emerald-500/50 bg-emerald-500/10 text-emerald-200 font-semibold'
                              : revealed && isUser && !isCorrect
                              ? 'border-rose-500/40 bg-rose-500/10 text-rose-200'
                              : 'border-slate-800 bg-slate-950/70 text-slate-300'
                          }`}
                        >
                          <span>
                            <strong className="mr-2 font-mono">{cKey}.</strong>
                            {cVal}
                          </span>
                          {revealed && isCorrect && (
                            <span className="shrink-0 text-xs font-bold text-emerald-300">
                              ✓ 정답
                            </span>
                          )}
                          {revealed && isUser && !isCorrect && (
                            <span className="shrink-0 text-xs font-bold text-rose-300">
                              ✗ 당시 내 선택
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              );
            })}
          </div>
        )
      ) : attempts.length === 0 ? (
        <div className="rounded-3xl border border-slate-800 bg-slate-900/60 p-12 text-center">
          <Award className="mx-auto h-10 w-10 text-slate-500" />
          <h3 className="mt-3 text-base font-bold text-white">아직 응시 기록이 없습니다</h3>
          <p className="mt-1 text-xs text-slate-400">
            시험을 제출하면 과목별 점수와 합격 여부가 이곳에 기록됩니다.
          </p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-3xl border border-slate-800 bg-slate-900/80">
          <table className="w-full text-left text-xs sm:text-sm">
            <thead className="border-b border-slate-800 bg-slate-950/80 text-xs uppercase text-slate-400">
              <tr>
                <th className="px-5 py-3.5">과목명</th>
                <th className="px-5 py-3.5">점수</th>
                <th className="px-5 py-3.5">정답률</th>
                <th className="px-5 py-3.5">결과</th>
                <th className="px-5 py-3.5">응시 일시</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/70">
              {attempts.map((a) => (
                <tr key={a.id} className="hover:bg-slate-800/40">
                  <td className="px-5 py-4 font-bold text-white">{a.examTitle}</td>
                  <td className="px-5 py-4 font-mono text-slate-200">
                    {a.score} / {a.total}
                  </td>
                  <td className="px-5 py-4 font-mono font-bold text-indigo-300">
                    {a.percentage}%
                  </td>
                  <td className="px-5 py-4">
                    {a.passed ? (
                      <span className="inline-flex items-center gap-1 rounded-full bg-emerald-500/15 px-2.5 py-0.5 text-xs font-bold text-emerald-300">
                        <CheckCircle2 className="h-3.5 w-3.5" /> 합격
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 rounded-full bg-rose-500/15 px-2.5 py-0.5 text-xs font-bold text-rose-300">
                        <XCircle className="h-3.5 w-3.5" /> 불합격
                      </span>
                    )}
                  </td>
                  <td className="px-5 py-4 text-xs text-slate-400">
                    {new Date(a.timestamp).toLocaleString('ko-KR')}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default HistoryNotePage;
