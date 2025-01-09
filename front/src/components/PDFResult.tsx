// components/PDFResult.tsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';
import styles from './PDFResult.module.css';

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

function PDFResult({ getTitle, buttonColor = '#4CAF50' }: PDFResultProps) {
  const { filename } = useParams();
  const [result, setResult] = useState<QuizResponse | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      parsedResults.results.sort((a: QuizResult, b: QuizResult) => 
        a.question_number - b.question_number
      );
      setResult(parsedResults);
    }
  }, []);

  if (!result) {
    return <div className={styles.loading}>결과를 불러오는 중...</div>;
  }

  const percentage = (result.score / result.total) * 100;
  const isPassed = percentage >= 60;

  return (
    <div className={styles.container}>
      <div className={styles.pdfPanel}>
        <iframe
          src={`/pdf/${filename}`}
          className={styles.pdfFrame}
          title="PDF Viewer"
        />
      </div>

      <div className={styles.resultPanel}>
        <div className={styles.header}>
          <h1 className={styles.title}>
            {getTitle(filename)}
          </h1>
          <div className={`${styles.score} ${isPassed ? styles.passed : styles.failed}`}>
            총점: {result.score} / {result.total} ({percentage.toFixed(2)}%) 
            {isPassed ? " (합격)" : " (불합격)"}
          </div>
          <div className={styles.buttonContainer}>
            <Link 
              to={`/view_pdf/${filename}`}
              className={styles.retryButton}
              style={{ backgroundColor: buttonColor }}
            >
              다시 시작하기
            </Link>
            <Link to="/" className={styles.homeButton}>
              홈으로
            </Link>
          </div>
        </div>

        <div className={styles.reviewSection}>
          <h2 className={styles.reviewTitle}>문제 리뷰</h2>
          {result.results.map((item) => (
            <div 
              key={item.question_number}
              className={`${styles.questionItem} ${item.is_correct ? styles.correct : styles.incorrect}`}
            >
              <div className={styles.questionNumber}>
                문제 {item.question_number}번
              </div>
              <div className={styles.userAnswer}>
                제출한 답: {item.user_answer}
              </div>
              <div className={styles.correctAnswer}>
                정답: {item.correct_answer}
              </div>
              <div className={`${styles.result} ${item.is_correct ? styles.resultCorrect : styles.resultIncorrect}`}>
                {item.is_correct ? '정답' : '오답'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PDFResult;