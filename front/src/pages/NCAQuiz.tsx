import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingContainer, QuizHeader, QuizQuestion } from '../components/commontxt';
import styles from '../style/commontxt.module.css';
import { fetchQuestions, submitAnswers } from '../api/examApi';
import { Question } from '../types/question';

function NCAQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  useEffect(() => {
    fetchQuestions('nca')
      .then(data => {
        const questionsData = Array.isArray(data) ? data : data.questions;
        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found in data');
        }
        setQuestions(questionsData);
        setIsLoading(false);
        setError(null);
      })
      .catch(error => {
        setIsLoading(false);
        setError(error.message || '문제 불러오기 실패');
        setQuestions([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const result = await submitAnswers('nca', answers);
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate('/nca/result');
    } catch (error: any) {
      setError(error.message || '답안 제출 실패');
    }
  };

  const isSubmittable = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (isLoading) {
    return <LoadingContainer />;
  }

  if (error) {
    return (
      <div className={styles.errorContainer}>
        <div>문제 로딩 중 오류가 발생했습니다</div>
        <div className={styles.errorMessage}>{error}</div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <QuizHeader
        title="Naver Cloud Platform Associate 기출문제"
        isSubmittable={isSubmittable}
      />
      <form id="quiz-form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <QuizQuestion
            key={question.id}
            question={question}
            index={index}
            answers={answers}
            setAnswers={setAnswers}
            questions={questions}
            currentQuestion={currentQuestion}
            setCurrentQuestion={setCurrentQuestion}
          />
        ))}
      </form>
    </div>
  );
}

export default NCAQuiz;