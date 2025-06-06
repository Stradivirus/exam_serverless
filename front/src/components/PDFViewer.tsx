import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../style/PDFViewer.module.css';
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
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>(
      Array.from({ length: questionCount }, (_, i) => i + 1)
  );

  const getNextUnansweredQuestion = useCallback((current: number, answers: Record<string, string>) => {
    let next = current + 1;
    while (next <= questionCount && answers[next]) {
      next++;
    }
    return next <= questionCount ? next : current;
  }, [questionCount]);

  useEffect(() => {
    answerListRef.current?.focus();
  }, []);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (
        document.activeElement?.tagName === 'INPUT' ||
        document.activeElement?.tagName === 'TEXTAREA' ||
        (document.activeElement as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }
    event.preventDefault();

    const validKeys = ['1', '2', '3', '4'];
    if (validKeys.includes(event.key)) {
      setAnswers(prev => {
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

      setUnansweredQuestions(prev => prev.filter(q => q !== currentQuestion));
    }
  }, [currentQuestion, questionCount, getNextUnansweredQuestion]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimer(prev => {
        if (prev <= 0) {
          if (timerRef.current) {
            clearInterval(timerRef.current);
          }
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
    // eslint-disable-next-line
  }, []);

  const handleAnswerSelect = useCallback((questionNumber: number, answer: string) => {
    setAnswers(prev => {
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

    setUnansweredQuestions(prev => prev.filter(q => q !== questionNumber));
    answerListRef.current?.focus();
  }, [currentQuestion, questionCount, getNextUnansweredQuestion]);

  // api.ts의 submitAnswers 사용
  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('답안을 선택해주세요.');
      return;
    }

    const examType = isNetworkExam ? 'network' : 'linux';
    const pdfNumber = filename?.replace('.pdf', '').slice(-1);
    const checkPath = isNetworkExam
        ? filename?.match(/\d{8}/)?.[0]
        : `pdf${pdfNumber}`;

    try {
      const results = await submitAnswers(
          examType,
          answers,
          checkPath
      );
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      navigate(`/${examType}/result/${filename}`);
    } catch (error) {
      console.error('Error:', error);
      alert('답안 제출 중 오류가 발생했습니다. ' + error);
    }
  };

  const scrollToQuestion = useCallback((questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    const container = answerListRef.current;

    if (element && container) {
      const scrollPosition = element.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);
      requestAnimationFrame(() => {
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      });
      setCurrentQuestion(questionNumber);
    }
  }, []);

  const hasAnswers = Object.keys(answers).length > 0;

  const unansweredButtons = useMemo(() =>
      unansweredQuestions.map(q => (
          <button
              key={q}
              onClick={() => {
                scrollToQuestion(q);
                answerListRef.current?.focus();
              }}
              className={styles.unansweredButton}
          >
            {q}
          </button>
      )), [unansweredQuestions, scrollToQuestion]);

  const answerButtons = useMemo(() =>
      Array.from({ length: questionCount }, (_, i) => i + 1).map(questionNumber => (
          <div
              key={questionNumber}
              id={`question-${questionNumber}`}
              className={`${styles.questionContainer} ${currentQuestion === questionNumber ? styles.current : ''}`}
          >
            <div className={styles.questionHeader}>
              <span>{questionNumber}번</span>
              {currentQuestion === questionNumber && (
                  <span className={styles.keyboardHint}>
              (1-4 키를 눌러 답안 선택)
            </span>
              )}
            </div>
            <div className={styles.choiceGrid}>
              {[1, 2, 3, 4].map(choice => (
                  <button
                      key={choice}
                      onClick={() => {
                        handleAnswerSelect(questionNumber, choice.toString());
                        answerListRef.current?.focus();
                      }}
                      className={`${styles.choiceButton} ${answers[questionNumber] === choice.toString() ? styles.selected : ''
                      }`}
                  >
                    {choice}
                  </button>
              ))}
            </div>
          </div>
      )), [questionCount, currentQuestion, answers, handleAnswerSelect]);

  return (
      <div className={styles.container}>
        <div className={styles.pdfPanel}>
          <iframe
              src={`/pdf/${filename}#toolbar=0&search=0&find=0`}
              className={styles.pdfFrame}
              title="PDF Viewer"
          />
        </div>

        <div className={styles.sidePanel}>
          <h3 className={styles.sidePanelTitle}>
            미답변 문제
          </h3>
          <div className={styles.unansweredList}>
            {unansweredButtons}
          </div>
        </div>

        <div className={styles.answerPanel}>
          <div className={styles.controlsHeader}>
            <div className={styles.controlsContainer}>
              <div className={styles.timer}>
                {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
              </div>
              <div className={styles.buttonsContainer}>
                <button
                    onClick={handleSubmit}
                    disabled={!hasAnswers}
                    className={styles.submitButton}
                >
                  제출하기
                </button>
                <Link to="/" className={styles.homeButton}>
                  홈으로
                </Link>
              </div>
            </div>
          </div>

          <div
              ref={answerListRef}
              className={styles.answerList}
              tabIndex={-1}
          >
            {answerButtons}
          </div>
        </div>
      </div>
  );
}

export default PDFViewer;