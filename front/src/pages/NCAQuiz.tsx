// pages/NCAQuiz.tsx
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { API_URL, LoadingContainer, QuizHeader, QuizQuestion } from '../components/commontxt';
import styles from '../components/commontxt.module.css';

interface Question {
  id: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
}

function NCAQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`${API_URL}/nca/questions`)
      .then(response => response.json())
      .then(data => {
        setQuestions(data);
        setIsLoading(false);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
        setIsLoading(false);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const response = await fetch(`${API_URL}/nca/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
      });

      const result = await response.json();
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate('/nca/result');
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const isSubmittable = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (isLoading) {
    return <LoadingContainer />;
  }

  return (
    <div className={styles.container}>
      <QuizHeader 
        title="NAVER Cloud Platform Certified Associate 기출문제 (117문제 중 20문제)" 
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
          />
        ))}
      </form>
    </div>
  );
}

export default NCAQuiz;