// pages/AWSSysOpsQuiz.tsx
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
  shuffledChoices?: Array<{ key: string; value: string }>;
}

function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

function AWSSysOpsQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState(0);

  const shuffleChoices = (questions: Question[]): Question[] => {
    return questions.map(question => {
      const choicesArray = [
        { key: 'A', value: question.choice_a },
        { key: 'B', value: question.choice_b },
        { key: 'C', value: question.choice_c },
        { key: 'D', value: question.choice_d }
      ];
      return {
        ...question,
        shuffledChoices: shuffleArray(choicesArray)
      };
    });
  };

  useEffect(() => {
    fetch(`${API_URL}/awssysops/questions`)
      .then(response => {
        if (!response.ok) {
          throw new Error('Network response was not ok');
        }
        return response.json();
      })
      .then(data => {
        if (!data) {
          throw new Error('No data received');
        }
        
        const questionsData = Array.isArray(data) ? data : data.questions;
        
        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found in data');
        }

        const shuffledQuestions = shuffleChoices(questionsData);
        setQuestions(shuffledQuestions);
        setIsLoading(false);
        setError(null);
      })
      .catch(error => {
        console.error('Error fetching questions:', error);
        setIsLoading(false);
        setError(error.message);
        setQuestions([]);
      });
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const originalAnswers = Object.fromEntries(
        Object.entries(answers).map(([questionId, selectedValue]) => {
          const question = questions.find(q => q.id === questionId);
          if (!question?.shuffledChoices) return [questionId, selectedValue];
          
          const originalChoice = question.shuffledChoices.find(
            choice => choice.value === selectedValue
          );
          return [questionId, originalChoice?.key || selectedValue];
        })
      );

      const response = await fetch(`${API_URL}/awssysops/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(originalAnswers)
      });

      const result = await response.json();
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate('/awssysops/result');
    } catch (error) {
      console.error('Error submitting answers:', error);
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
        title="AWS SysOps Administrator 기출문제"
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

export default AWSSysOpsQuiz;