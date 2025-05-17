// pages/AWSSysOpsResult.tsx
import { useState, useEffect } from 'react';
import {
  ResultHeader,
  QuestionReviewCard,
  ResultData,
  LoadingMessage,
  formatStoredResults
} from '../components/commontxtResult';
import styles from '../style/commontxtResult.module.css';
import { fetchQuestions } from '../api/examApi';
import { Question } from '../types/question';

function AWSSysOpsResult() {
  const [result, setResult] = useState<ResultData | null>(null);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      setLoading(true);
      try {
        // 문제 데이터 불러오기
        const data = await fetchQuestions('awssysops');
        const questionsData = Array.isArray(data) ? data : data.questions;
        setQuestions(questionsData || []);
        // 결과 데이터 불러오기 및 포맷
        const storedResults = sessionStorage.getItem('quizResults');
        if (storedResults) {
          setResult(formatStoredResults(storedResults, questionsData || []));
        }
      } catch (e) {
        setResult(null);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  if (loading || !result) {
    return <LoadingMessage />;
  }

  return (
      <div className={styles.container}>
        <ResultHeader
            title="AWS SysOps Administrator 시험 결과"
            score={result.score}
            total={result.total}
            passPercentage={0.7}
            quizPath="/awssysops/quiz"
        />

        <div className={styles.mainContent}>
          <h2 className={styles.reviewTitle}>문제 리뷰</h2>
          {result.results.map((item, index) => (
              <QuestionReviewCard
                  key={index}
                  questionNumber={index + 1}
                  questionText={item.question_text}
                  choices={item.choices}
                  userAnswer={item.user_answer}
                  correctAnswer={item.correct_answer}
                  isCorrect={item.is_correct}
                  userAnswerText={item.user_answer_text}
                  correctAnswerText={item.correct_answer_text}
              />
          ))}
        </div>
      </div>
  );
}

export default AWSSysOpsResult;