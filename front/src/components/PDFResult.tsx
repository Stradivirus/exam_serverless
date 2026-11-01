import { useState, useEffect, useMemo } from 'react';
import { Link, useParams } from 'react-router-dom';
import {
  Award,
  CheckCircle2,
  Home,
  RotateCcw,
  XCircle,
} from 'lucide-react';
import { saveAttemptRecord } from '../utils/examStorage';

interface QuizResult {
  question_number: number;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
}

interface QuizResponse {
  results: QuizResult[];
  score: number;
  total: number;
}

interface PDFResultProps {
  type: string;
  getTitle: (filename: string | undefined) => string;
  buttonColor?: string;
}

function PDFResult({ type, getTitle }: PDFResultProps) {
  const { filename } = useParams();
  const [result, setResult] = useState<QuizResponse | null>(null);
  const [filterMode, setFilterMode] = useState<'all' | 'wrong'>('all');

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults: QuizResponse = JSON.parse(storedResults);
      parsedResults.results.sort(
        (a: QuizResult, b: QuizResult) => a.question_number - b.question_number
      );
      setResult(parsedResults);

      const pct =
        parsedResults.total > 0
          ? Math.round((parsedResults.score / parsedResults.total) * 100)
          : 0;
      saveAttemptRecord({
        examType: type,
        examTitle: getTitle(filename),
        score: parsedResults.score,
        total: parsedResults.total,
        percentage: pct,
        passed: pct >= 60,
      });
    }
  }, [filename, getTitle, type]);

  const filteredResults = useMemo(() => {
    if (!result) return [];
    if (filterMode === 'wrong') {
      return result.results.filter((r) => !r.is_correct);
    }
    return result.results;
  }, [result, filterMode]);

  if (!result) {
    return (
      <div className="flex min-h-[calc(100vh-110px)] items-center justify-center text-sm text-slate-400">
        결과를 불러오는 중...
      </div>
    );
  }

  const percentage = result.total > 0 ? (result.score / result.total) * 100 : 0;
  const isPassed = percentage >= 60;
  const wrongCount = result.results.filter((r) => !r.is_correct).length;

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex h-[calc(100vh-120px)] flex-col gap-4 lg:flex-row overflow-hidden">
        {/* Left: PDF Document Panel */}
        <div className="h-1/2 lg:h-full lg:flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <iframe
            src={`/pdf/${filename}`}
            className="h-full w-full border-0"
            title="PDF Exam Review"
          />
        </div>

        {/* Right: Score & OMR Grading Review Panel */}
        <div className="flex h-1/2 lg:h-full lg:w-[440px] xl:w-[480px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        <div className="border-b border-slate-800 bg-slate-900/90 p-5 space-y-4">
          <div className="flex items-start justify-between gap-2">
            <div>
              <span
                className={`inline-flex items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-extrabold ${
                  isPassed
                    ? 'border-emerald-500/40 bg-emerald-500/15 text-emerald-300'
                    : 'border-rose-500/40 bg-rose-500/15 text-rose-300'
                }`}
              >
                <Award className="h-3.5 w-3.5" />
                {isPassed ? '합격 (60% 이상)' : '불합격 (60% 미만)'}
              </span>
              <h1 className="mt-2 text-lg font-extrabold text-white">
                {getTitle(filename)}
              </h1>
            </div>

            <div className="rounded-2xl border border-slate-800 bg-slate-950 px-4 py-2 text-right">
              <div className="text-[11px] text-slate-400">총점 / 정답률</div>
              <div
                className={`text-xl font-black ${
                  isPassed ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {result.score}/{result.total}{' '}
                <span className="text-xs text-slate-300">({percentage.toFixed(1)}%)</span>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-2">
            <div className="inline-flex rounded-xl border border-slate-800 bg-slate-950 p-1 text-xs font-bold">
              <button
                type="button"
                onClick={() => setFilterMode('all')}
                className={`rounded-lg px-3 py-1 transition ${
                  filterMode === 'all' ? 'bg-indigo-500 text-white' : 'text-slate-400'
                }`}
              >
                전체 ({result.results.length})
              </button>
              <button
                type="button"
                onClick={() => setFilterMode('wrong')}
                className={`rounded-lg px-3 py-1 transition ${
                  filterMode === 'wrong' ? 'bg-rose-500 text-white' : 'text-slate-400'
                }`}
              >
                오답만 ({wrongCount})
              </button>
            </div>

            <div className="flex items-center gap-2">
              <Link
                to={`/view_pdf/${filename}`}
                className="inline-flex items-center gap-1 rounded-xl bg-indigo-500 px-3 py-1.5 text-xs font-bold text-white hover:bg-indigo-400"
              >
                <RotateCcw className="h-3.5 w-3.5" />
                <span>다시 풀기</span>
              </Link>
              <Link
                to="/"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-3 py-1.5 text-xs font-semibold text-slate-200 hover:bg-slate-700"
              >
                <Home className="h-3.5 w-3.5" />
                <span>홈</span>
              </Link>
            </div>
          </div>
        </div>

        {/* OMR Review List */}
        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          {filteredResults.map((item) => (
            <div
              key={item.question_number}
              className={`flex items-center justify-between rounded-2xl border px-4 py-3 text-xs ${
                item.is_correct
                  ? 'border-emerald-500/25 bg-slate-900/70'
                  : 'border-rose-500/40 bg-rose-950/15'
              }`}
            >
              <div className="flex items-center gap-3">
                <span className="rounded-lg bg-slate-800 px-2.5 py-1 font-mono font-extrabold text-white">
                  {item.question_number}번
                </span>
                <span className="text-slate-300">
                  제출 답안: <strong className="font-mono text-white">{item.user_answer}</strong>
                </span>
                <span className="text-slate-400">
                  정답: <strong className="font-mono text-amber-300">{item.correct_answer}</strong>
                </span>
              </div>

              {item.is_correct ? (
                <span className="inline-flex items-center gap-1 font-bold text-emerald-400">
                  <CheckCircle2 className="h-4 w-4" /> 정답
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 font-bold text-rose-400">
                  <XCircle className="h-4 w-4" /> 오답
                </span>
              )}
            </div>
          ))}
        </div>
      </div>
      </div>
    </div>
  );
}

export default PDFResult;
