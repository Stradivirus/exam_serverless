import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import styles from './AWSQuiz.module.css';

const API_URL = 'https://asia-northeast3-master-coder-441716-a4.cloudfunctions.net/examhandler';

interface Question {
  id: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
  shuffledChoices?: Array<{ key: string; value: string }>;
}

// Fisher-Yates 셔플 알고리즘
function shuffleArray<T>(array: T[]): T[] {
  const newArray = [...array];
  for (let i = newArray.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [newArray[i], newArray[j]] = [newArray[j], newArray[i]];
  }
  return newArray;
}

// 텍스트 줄바꿈 처리 함수
function formatText(text: string) {
  const sentences = text.split('.');
  if (sentences.length <= 3) return text;

  const firstLine = `${sentences[0]}.${sentences[1]}.`;
  const remainingText = sentences.slice(2).join('.');
  
  return (
    <>
      <div>{firstLine}</div>
      <div>{remainingText}</div>
    </>
  );
}

function AWSQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 선택지를 섞는 함수
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
    fetch(`${API_URL}/aws/questions`)
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

        // 문제를 받아온 후 선택지를 섞어서 저장
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
      // answers 객체의 각 답안을 원래의 선택지 키(A,B,C,D)로 변환
      const originalAnswers = Object.fromEntries(
        Object.entries(answers).map(([questionId, selectedValue]) => {
          const question = questions.find(q => q.id === questionId);
          if (!question?.shuffledChoices) return [questionId, selectedValue];
          
          // 선택된 값에 해당하는 원래 선택지 키 찾기
          const originalChoice = question.shuffledChoices.find(
            choice => choice.value === selectedValue
          );
          return [questionId, originalChoice?.key || selectedValue];
        })
      );

      const response = await fetch(`${API_URL}/aws/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(originalAnswers)
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const result = await response.json();
      sessionStorage.setItem('quizResults', JSON.stringify(result));
      navigate('/aws/result');
    } catch (error) {
      console.error('Error submitting answers:', error);
    }
  };

  const isSubmittable = questions.length > 0 && Object.keys(answers).length === questions.length;

  if (isLoading) {
    return <div className={styles.loadingContainer}>문제를 불러오는 중...</div>;
  }

  if (error || questions.length === 0) {
    return (
      <div className={styles.errorContainer}>
        <div>문제를 불러오는데 실패했습니다.</div>
        <div className={styles.errorMessage}>
          {error || '문제 데이터를 받아오지 못했습니다.'}
        </div>
        <Link to="/" className={styles.button}>홈으로 돌아가기</Link>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <h1 className={styles.headerTitle}>
            AWS Solution Architect Associate 기출문제
          </h1>
          
          <div className={styles.buttonGroup}>
            <button
              type="submit"
              form="quiz-form"
              disabled={!isSubmittable}
              className={styles.submitButton}
            >
              답안 제출
            </button>
            
            <Link to="/" className={styles.button}>홈으로</Link>
          </div>
        </div>
      </div>

      <form id="quiz-form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div key={question.id} className={styles.questionCard}>
            <h3 className={styles.questionTitle}>
              {(() => {
                const sentences = question.question.split('.');
                const firstLine = `${index + 1}. ${sentences[0]}.${sentences[1]}.`;
                const middleText = sentences.slice(2, -1).join('.') + '.';
                const lastLine = sentences[sentences.length - 1];

                return (
                  <>
                    <div>{firstLine}</div>
                    {middleText && <div>{middleText}</div>}
                    <div>{lastLine}</div>
                  </>
                );
              })()}
              
              {!answers[question.id] && (
                <span className={styles.unansweredTag}>미선택</span>
              )}
            </h3>

            <div className={styles.choicesContainer}>
              {question.shuffledChoices?.map(choice => (
                <label key={choice.key} className={styles.choiceLabel}>
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={choice.value}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [question.id]: e.target.value
                    })}
                    className={styles.choiceInput}
                  />
                  <span className={styles.choiceText}>
                    {formatText(choice.value)}
                  </span>
                </label>
              ))}
            </div>
          </div>
        ))}
      </form>
    </div>
  );
}

export default AWSQuiz;