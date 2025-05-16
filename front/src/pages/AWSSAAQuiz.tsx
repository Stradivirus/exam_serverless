import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { LoadingContainer, QuizHeader} from '../components/commontxt';
import styles from '../style/commontxt.module.css';
import { fetchQuestions, submitAnswers } from '../api/examApi';
import { Question } from '../types/question';

interface ShuffledQuestion extends Question {
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

function AWSSAAQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<ShuffledQuestion[]>([]);
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const shuffleChoices = (questions: Question[]): ShuffledQuestion[] => {
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
    fetchQuestions('awssaa')
      .then(data => {
        const questionsData = Array.isArray(data) ? data : data.questions;
        if (!questionsData || questionsData.length === 0) {
          throw new Error('No questions found in data');
        }
        setQuestions(shuffleChoices(questionsData));
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
      // 선택지 셔플을 원래대로 복원
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
      const result = await submitAnswers('awssaa', originalAnswers);
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate('/awssaa/result');
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
        title="AWS Solution Architect Associate 기출문제"
        isSubmittable={isSubmittable}
      />
      <form id="quiz-form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={question.id}>
            <div className={styles.questionCard}>
              <div className={styles.questionNumber}>{index + 1}번</div>
              <div className={styles.questionText}>{question.question}</div>
              <div className={styles.choices}>
                {question.shuffledChoices
                  ? question.shuffledChoices.map(choice => (
                      <label key={choice.key} className={styles.choiceLabel}>
                        <input
                          type="radio"
                          name={`question-${question.id}`}
                          value={choice.value}
                          checked={answers[question.id] === choice.value}
                          onChange={() =>
                            setAnswers(prev => ({
                              ...prev,
                              [question.id]: choice.value,
                            }))
                          }
                        />
                        <span className={styles.choiceKey}>{choice.key}.</span> {choice.value}
                      </label>
                    ))
                  : null}
              </div>
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}

export default AWSSAAQuiz;