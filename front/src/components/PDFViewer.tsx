import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import styles from '../style/PDFViewer.module.css';

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

  // 다음 답안이 없는 문제 찾기 (메모이제이션)
  const getNextUnansweredQuestion = useCallback((current: number, answers: Record<string, string>) => {
    let next = current + 1;
    while (next <= questionCount && answers[next]) {
      next++;
    }
    return next <= questionCount ? next : current;
  }, [questionCount]);

  // 컴포넌트 마운트 시 답안 영역으로 포커스
  useEffect(() => {
    answerListRef.current?.focus();
  }, []);

  // 키보드 이벤트 핸들러 (메모이제이션)
  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    // 입력 필드에서는 동작하지 않도록
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      (document.activeElement as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }

    // Firefox의 페이지 내 검색 기능 방지
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

  // 키보드 이벤트 리스너
  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  // 타이머 설정 (최적화)
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
  }, []);

  // 답안 선택 핸들러 (메모이제이션)
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

  // 제출 핸들러
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
      const response = await fetch(
        // `https://examgo-916058497164.asia-northeast3.run.app/${examType}/check/${checkPath}`,
        `http://localhost:8080/${examType}/check/${checkPath}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(answers),
        }
      );

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`제출 실패: ${errorData}`);
      }

      const results = await response.json();
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      navigate(`/${examType}/result/${filename}`);
    } catch (error) {
      console.error('Error:', error);
      alert('답안 제출 중 오류가 발생했습니다. ' + error);
    }
  };

  // 스크롤 핸들러 (메모이제이션)
  const scrollToQuestion = useCallback((questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    const container = answerListRef.current;

    if (element && container) {
      // 요소의 offsetTop을 기준으로 스크롤 위치 계산
      const scrollPosition = element.offsetTop - (container.clientHeight / 2) + (element.clientHeight / 2);

      // requestAnimationFrame을 사용하여 다음 프레임에서 스크롤 실행
      requestAnimationFrame(() => {
        container.scrollTo({
          top: scrollPosition,
          behavior: 'smooth'
        });
      });

      // 현재 질문 번호 업데이트
      setCurrentQuestion(questionNumber);
    }
  }, []);

  const hasAnswers = Object.keys(answers).length > 0;

  // 미답변 문제 버튼 목록 (메모이제이션)
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

  // 답안 선택 영역 (메모이제이션)
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
      {/* PDF 뷰어 */}
      <div className={styles.pdfPanel}>
        <iframe
          src={`/pdf/${filename}#toolbar=0&search=0&find=0`}
          className={styles.pdfFrame}
          title="PDF Viewer"
        />
      </div>

      {/* 중앙 패널 - 미답변 문제 */}
      <div className={styles.sidePanel}>
        <h3 className={styles.sidePanelTitle}>
          미답변 문제
        </h3>
        <div className={styles.unansweredList}>
          {unansweredButtons}
        </div>
      </div>

      {/* 답안 입력 패널 */}
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