// src/pages/AWSQuiz.tsx
import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';

const API_URL = 'https://asia-northeast3-master-coder-441716-a4.cloudfunctions.net/examhandler';

interface Question {
  id: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
}

function AWSQuiz() {
  const navigate = useNavigate();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [answers, setAnswers] = useState<{[key: string]: string}>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

        setQuestions(questionsData);
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
      const response = await fetch(`${API_URL}/aws/check`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers)
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
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        fontSize: '1.3rem'
      }}>
        문제를 불러오는 중...
      </div>
    );
  }

  if (error || questions.length === 0) {
    return (
      <div style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        height: '100vh',
        flexDirection: 'column',
        gap: '20px',
        fontSize: '1.3rem'
      }}>
        <div>문제를 불러오는데 실패했습니다.</div>
        <div style={{ fontSize: '1rem', color: '#666' }}>
          {error || '문제 데이터를 받아오지 못했습니다.'}
        </div>
        <Link 
          to="/"
          style={{
            padding: '12px 24px',
            backgroundColor: '#F7931E',
            color: 'white',
            borderRadius: '5px',
            textDecoration: 'none',
            fontSize: '1.2rem'
          }}
        >
          홈으로 돌아가기
        </Link>
      </div>
    );
  }

  return (
    <div style={{
      maxWidth: '1500px',
      margin: '0 auto',
      padding: '20px',
      paddingTop: '100px',
    }}>
      {/* 고정 헤더 */}
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        zIndex: 1000,
        borderBottom: '1px solid #eee',
        padding: '20px 0'
      }}>
        <div style={{
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '0 20px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center'
        }}>
          <h1 style={{ 
            fontSize: '1.5rem',
            fontWeight: 'bold',
          }}>
            AWS Solution Architect Associate 기출문제 (195문제 중 20문제)
          </h1>
          
          <div style={{
            display: 'flex',
            gap: '15px',
          }}>
            <button
              type="submit"
              form="quiz-form"
              disabled={!isSubmittable}
              style={{
                padding: '12px 24px',
                backgroundColor: isSubmittable ? '#F7931E' : '#cccccc',
                color: 'white',
                border: 'none',
                borderRadius: '5px',
                cursor: isSubmittable ? 'pointer' : 'not-allowed',
                fontSize: '1.2rem',
                fontWeight: '500',
                textDecoration: 'none',
                transition: 'background-color 0.2s'
              }}
            >
              답안 제출
            </button>
            
            <Link 
              to="/"
              style={{
                padding: '12px 24px',
                backgroundColor: '#F7931E',
                color: 'white',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '1.2rem',
                fontWeight: '500'
              }}
            >
              홈으로
            </Link>
          </div>
        </div>
      </div>

      {/* 메인 콘텐츠 */}
      <form id="quiz-form" onSubmit={handleSubmit}>
        {questions.map((question, index) => (
          <div 
            key={question.id}
            style={{
              marginBottom: '30px',
              padding: '20px',
              backgroundColor: '#f8f9fa',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
            }}
          >
            <h3 style={{
  fontSize: '1.3rem',
  fontWeight: 'bold',
  marginBottom: '20px',
  display: 'flex',
  flexDirection: 'column',
  gap: '10px'
}}>
  {/* 문자열을 . 기준으로 나누기 */}
  {(() => {
    const sentences = question.question.split('.');
    
    // 첫 두 문장을 합쳐서 첫 줄로 (문제 번호와 첫 문장)
    const firstLine = `${index + 1}. ${sentences[0]}.${sentences[1]}.`;
    
    // 중간 문장들 (마지막 문장 제외)
    const middleText = sentences.slice(2, -1).join('.') + '.';
    
    // 마지막 문장 (질문)
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
    <span style={{
      fontSize: '1rem',
      color: '#dc3545',
      backgroundColor: 'rgba(220, 53, 69, 0.1)',
      padding: '4px 8px',
      borderRadius: '4px',
      alignSelf: 'flex-start'
    }}>
      미선택
    </span>
  )}
</h3>

            <div style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {[
                { key: 'A', value: question.choice_a },
                { key: 'B', value: question.choice_b },
                { key: 'C', value: question.choice_c },
                { key: 'D', value: question.choice_d }
              ].map(choice => (
                <label
                  key={choice.key}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    padding: '15px',
                    backgroundColor: 'white',
                    borderRadius: '5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                >
                  <input
                    type="radio"
                    name={`question_${question.id}`}
                    value={choice.key}
                    onChange={(e) => setAnswers({
                      ...answers,
                      [question.id]: e.target.value
                    })}
                    style={{ 
                      marginRight: '15px',
                      width: '20px',
                      height: '20px'
                    }}
                  />
                  <span style={{ fontSize: '1.2rem' }}>
                    {choice.key}. {choice.value}
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