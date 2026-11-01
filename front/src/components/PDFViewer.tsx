import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import {
  Clock,
  FileText,
  Home,
  Keyboard,
  Send,
  AlertCircle,
} from 'lucide-react';
import { submitAnswers } from '../api/examApi';

function PDFViewer() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const answerListRef = useRef<HTMLDivElement>(null);
  const timerRef = useRef<ReturnType<typeof setTimeout>>();

  const isNetworkExam = filename?.includes('네트워크관리사');
  const questionCount = isNetworkExam ? 50 : 100;
  const examTime = isNetworkExam ? 3600 : 6000;

  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState<number>(examTime);
  const [currentQuestion, setCurrentQuestion] = useState<number>(1);
  const [submitting, setSubmitting] = useState(false);

  const unansweredQuestions = useMemo(() => {
    const list: number[] = [];
    for (let i = 1; i <= questionCount; i++) {
      if (!answers[i]) list.push(i);
    }
    return list;
  }, [answers, questionCount]);

  const getNextUnansweredQuestion = useCallback(
    (current: number, currentAnswers: Record<string, string>) => {
      let next = current + 1;
      while (next <= questionCount && currentAnswers[next]) {
        next++;
      }
      return next <= questionCount ? next : current;
    },
    [questionCount]
  );

  const scrollToQuestion = useCallback((questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    const container = answerListRef.current;

    if (element && container) {
      const scrollPosition =
        element.offsetTop - container.clientHeight / 2 + element.clientHeight / 2;
      requestAnimationFrame(() => {
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth',
        });
      });
      setCurrentQuestion(questionNumber);
    }
  }, []);

  useEffect(() => {
    answerListRef.current?.focus();
  }, []);

  const handleKeyPress = useCallback(
    (event: KeyboardEvent) => {
      if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true'
      ) {
        return;
      }

      const validKeys = ['1', '2', '3', '4'];
      if (validKeys.includes(event.key)) {
        event.preventDefault();
        setAnswers((prev) => {
          const newAnswers = { ...prev, [currentQuestion]: event.key };

          if (currentQuestion < questionCount) {
            const nextQuestion = getNextUnansweredQuestion(currentQuestion, newAnswers);
            requestAnimationFrame(() => {
              setCurrentQuestion(nextQuestion);
              scrollToQuestion(nextQuestion);
            });
          }

          return newAnswers;
        });
      }
    },
    [currentQuestion, questionCount, getNextUnansweredQuestion, scrollToQuestion]
  );

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0 || submitting) {
      alert('답안을 최소 1문항 이상 선택해주세요.');
      return;
    }

    const examType = isNetworkExam ? 'network' : 'linux';
    const pdfNumber = filename?.replace('.pdf', '').slice(-1);
    const checkPath = isNetworkExam
      ? filename?.match(/\d{8}/)?.[0]
      : `pdf${pdfNumber}`;

    setSubmitting(true);
    try {
      const results = await submitAnswers(examType, answers, checkPath);
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      navigate(`/${examType}/result/${filename}`);
    } catch (error) {
      alert('답안 제출 중 오류가 발생했습니다: ' + error);
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          if (timerRef.current) clearInterval(timerRef.current);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  const handleAnswerSelect = useCallback(
    (questionNumber: number, answer: string) => {
      setAnswers((prev) => {
        const newAnswers = { ...prev, [questionNumber]: answer };

        if (questionNumber === currentQuestion && questionNumber < questionCount) {
          const nextQuestion = getNextUnansweredQuestion(questionNumber, newAnswers);
          requestAnimationFrame(() => {
            setCurrentQuestion(nextQuestion);
            scrollToQuestion(nextQuestion);
          });
        }

        return newAnswers;
      });

      answerListRef.current?.focus();
    },
    [currentQuestion, questionCount, getNextUnansweredQuestion, scrollToQuestion]
  );

  const answeredCount = Object.keys(answers).length;
  const progressPct = Math.round((answeredCount / questionCount) * 100);

  const examTitle = useMemo(() => {
    if (isNetworkExam) {
      const d = filename?.match(/\d{8}/)?.[0];
      if (d) {
        return `네트워크관리사 2급 (${d.slice(0, 4)}.${d.slice(4, 6)}.${d.slice(6, 8)})`;
      }
      return '네트워크관리사 2급 기출문제';
    }
    const num = filename?.replace('.pdf', '').slice(-1);
    return `리눅스 마스터 1급 기출문제 (제 ${num}회)`;
  }, [filename, isNetworkExam]);

  return (
    <div className="mx-auto max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="flex h-[calc(100vh-120px)] flex-col gap-4 lg:flex-row overflow-hidden">
        {/* Left: PDF Viewer Panel */}
        <div className="h-1/2 lg:h-full lg:flex-1 overflow-hidden rounded-2xl border border-slate-800 bg-slate-900 shadow-xl">
          <iframe
            src={`/pdf/${filename}#toolbar=0&search=0&find=0`}
            className="h-full w-full border-0"
            title="PDF Exam Viewer"
          />
        </div>

        {/* Right: OMR Answer Sheet & Unanswered Navigator */}
        <div className="flex h-1/2 lg:h-full lg:w-[430px] xl:w-[460px] shrink-0 flex-col overflow-hidden rounded-2xl border border-slate-800 bg-slate-950 shadow-xl">
        {/* Top Controls Header */}
        <div className="border-b border-slate-800 bg-slate-900/90 p-4 space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 min-w-0">
              <FileText className="h-4 w-4 shrink-0 text-indigo-400" />
              <h2 className="truncate text-sm font-extrabold text-white">{examTitle}</h2>
            </div>

            <div className="flex items-center gap-2 shrink-0">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-700 bg-slate-950 px-3 py-1 font-mono text-xs font-bold text-amber-300">
                <Clock className="h-3.5 w-3.5 text-amber-400" />
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </span>
              <Link
                to="/"
                className="inline-flex items-center gap-1 rounded-xl border border-slate-700 bg-slate-800 px-2.5 py-1 text-xs font-semibold text-slate-300 hover:bg-slate-700"
              >
                <Home className="h-3.5 w-3.5" />
                <span>홈</span>
              </Link>
            </div>
          </div>

          {/* Progress Bar */}
          <div>
            <div className="flex items-center justify-between text-xs">
              <span className="flex items-center gap-1 text-slate-400">
                <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
                키보드 <strong className="text-slate-200">1~4</strong> 입력 시 자동 다음 문항 이동
              </span>
              <span className="font-bold text-indigo-300">
                {answeredCount} / {questionCount} ({progressPct}%)
              </span>
            </div>
            <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-800">
              <div
                className="h-full rounded-full bg-gradient-to-r from-indigo-500 to-cyan-400 transition-all duration-300"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>

          {/* Unanswered Quick Chips */}
          {unansweredQuestions.length > 0 && (
            <div className="rounded-xl border border-slate-800 bg-slate-950/90 p-2.5">
              <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1.5">
                <span className="flex items-center gap-1 font-semibold text-amber-300">
                  <AlertCircle className="h-3 w-3" />
                  미답변 문항 ({unansweredQuestions.length}개) — 클릭 시 이동
                </span>
              </div>
              <div className="flex gap-1.5 overflow-x-auto pb-1">
                {unansweredQuestions.map((q) => (
                  <button
                    key={q}
                    type="button"
                    onClick={() => {
                      scrollToQuestion(q);
                      answerListRef.current?.focus();
                    }}
                    className={`shrink-0 rounded-lg border px-2 py-0.5 font-mono text-[11px] font-bold transition ${
                      currentQuestion === q
                        ? 'border-indigo-400 bg-indigo-500 text-white'
                        : 'border-slate-800 bg-slate-900 text-slate-400 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Submit Button */}
          <button
            type="button"
            onClick={handleSubmit}
            disabled={answeredCount === 0 || submitting}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 py-2.5 text-xs font-extrabold text-white shadow-md shadow-indigo-500/20 transition hover:brightness-110 disabled:opacity-40"
          >
            <Send className="h-3.5 w-3.5" />
            <span>
              {submitting
                ? '채점 중...'
                : `OMR 답안 제출 및 채점하기 (${answeredCount}/${questionCount})`}
            </span>
          </button>
        </div>

        {/* Scrollable OMR Answer List */}
        <div
          ref={answerListRef}
          tabIndex={-1}
          className="flex-1 overflow-y-auto p-3 space-y-2 focus:outline-none"
        >
          {Array.from({ length: questionCount }, (_, i) => i + 1).map((qNum) => {
            const isCurrent = currentQuestion === qNum;
            const selected = answers[qNum];

            return (
              <div
                key={qNum}
                id={`question-${qNum}`}
                onClick={() => setCurrentQuestion(qNum)}
                className={`flex items-center justify-between rounded-2xl border px-4 py-2.5 transition ${
                  isCurrent
                    ? 'border-indigo-500 bg-indigo-500/15 ring-1 ring-indigo-500/40'
                    : selected
                    ? 'border-slate-800 bg-slate-900/80'
                    : 'border-slate-900 bg-slate-900/40 hover:border-slate-800'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`inline-flex h-7 w-10 items-center justify-center rounded-lg font-mono text-xs font-extrabold ${
                      isCurrent
                        ? 'bg-indigo-500 text-white'
                        : selected
                        ? 'bg-emerald-500/20 text-emerald-300'
                        : 'bg-slate-800 text-slate-400'
                    }`}
                  >
                    {qNum}번
                  </span>
                  {isCurrent && (
                    <span className="text-[11px] font-medium text-indigo-300">
                      키보드 1~4
                    </span>
                  )}
                </div>

                <div className="flex items-center gap-2">
                  {[1, 2, 3, 4].map((choice) => {
                    const isPicked = selected === String(choice);
                    return (
                      <button
                        key={choice}
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleAnswerSelect(qNum, String(choice));
                        }}
                        className={`flex h-8 w-8 items-center justify-center rounded-full border font-mono text-xs font-extrabold transition ${
                          isPicked
                            ? 'border-indigo-400 bg-indigo-500 text-white shadow shadow-indigo-500/30'
                            : 'border-slate-700 bg-slate-950 text-slate-400 hover:border-slate-500 hover:text-white'
                        }`}
                      >
                        {choice}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>
      </div>
    </div>
  );
}

export default PDFViewer;
