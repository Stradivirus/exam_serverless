// src/pages/PDFViewer.tsx
import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';

function PDFViewer() {
  const { filename } = useParams();
  const navigate = useNavigate();
  const [answers, setAnswers] = useState<{ [key: string]: string }>({});
  const [timer, setTimer] = useState<number>(6000); // 100분 = 6000초
  const [unansweredQuestions, setUnansweredQuestions] = useState<number[]>(
    Array.from({length: 100}, (_, i) => i + 1)
  );

  useEffect(() => {
    const timerInterval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 0) {
          clearInterval(timerInterval);
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timerInterval);
  }, []);

  const handleAnswerSelect = (questionNumber: number, answer: string) => {
    setAnswers(prev => ({...prev, [questionNumber]: answer}));
    setUnansweredQuestions(prev => prev.filter(q => q !== questionNumber));
  };

  const handleSubmit = async () => {
    if (Object.keys(answers).length === 0) {
      alert('최소 한 문제 이상 답안을 선택해주세요.');
      return;
    }

    const pdfNumber = filename?.replace('.pdf', '').slice(-1);
    
    try {
      const response = await fetch(`https://asia-northeast3-master-coder-441716-a4.cloudfunctions.net/examhandler/linux/check/pdf${pdfNumber}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(answers),
      });

      if (!response.ok) {
        const errorData = await response.text();
        throw new Error(`제출 실패: ${errorData}`);
      }

      const results = await response.json();
      sessionStorage.setItem('quizResults', JSON.stringify(results));
      navigate(`/linux/result/${filename}`);
    } catch (error) {
      console.error('Error:', error);
      alert('답안 제출 중 오류가 발생했습니다. ' + error);
    }
  };

  const scrollToQuestion = (questionNumber: number) => {
    const element = document.getElementById(`question-${questionNumber}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const hasAnswers = Object.keys(answers).length > 0;

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* PDF 뷰어 */}
      <div style={{ 
        flex: 3, 
        height: '100%',
        position: 'relative',
        overflow: 'auto',
        display: 'flex',  // 추가
        justifyContent: 'center'  // 추가
      }}>
      <iframe
        src={`/pdf/${filename}`}
          style={{ 
          width: '130%',
          height: '100%',
          border: 'none',
          margin: 'auto'  // 추가
      }}
      title="PDF Viewer"
    />
    </div>

      {/* 중앙 패널 - 미답변 문제 */}
      <div style={{ 
        flex: 0.2, 
        borderLeft: '1px solid #eee',
        borderRight: '1px solid #eee',
        padding: '10px',
        overflowY: 'auto',
        display: 'flex',
        flexDirection: 'column'
      }}>
        <h3 style={{ 
          marginBottom: '15px',
          fontSize: '1.2rem',
          fontWeight: 'bold',
          textAlign: 'center'
        }}>
          미답변 문제
        </h3>
        <div style={{ 
          display: 'flex', 
          flexDirection: 'column',
          gap: '8px',
          alignItems: 'center',
          overflowY: 'auto'
        }}>
          {unansweredQuestions.map(q => (
            <button
              key={q}
              onClick={() => scrollToQuestion(q)}
              style={{ 
                width: '100px',
                padding: '8px 0',
                background: '#1976D2', 
                color: 'white', 
                borderRadius: '5px',
                fontSize: '1rem',
                border: 'none',
                cursor: 'pointer',
                textAlign: 'center'
              }}
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* 답안 입력 패널 */}
      <div style={{ flex: 0.8, display: 'flex', flexDirection: 'column' }}>
        {/* 고정된 타이머와 버튼들 */}
        <div style={{ 
          position: 'sticky', 
          top: 0,
          background: 'white',
          borderBottom: '1px solid #eee',
          padding: '20px',
          zIndex: 10
        }}>
          <div style={{ 
            display: 'flex',
            alignItems: 'center',
            gap: '15px'
          }}>
            <div style={{ 
              fontSize: '2rem', 
              fontWeight: 'bold'
            }}>
              {Math.floor(timer / 60)}:{(timer % 60).toString().padStart(2, '0')}
            </div>
            <div style={{
              display: 'flex',
              gap: '10px',
              flex: 1
            }}>
              <button
                onClick={handleSubmit}
                disabled={!hasAnswers}
                style={{
                  padding: '12px 24px',
                  background: hasAnswers ? '#4CAF50' : '#cccccc',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: hasAnswers ? 'pointer' : 'not-allowed',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  flex: 1,
                  opacity: hasAnswers ? 1 : 0.7
                }}
              >
                제출하기
              </button>
              <Link 
                to="/"
                style={{
                  padding: '12px 24px',
                  background: '#2196F3',
                  color: 'white',
                  border: 'none',
                  borderRadius: '5px',
                  cursor: 'pointer',
                  fontSize: '1.1rem',
                  fontWeight: 'bold',
                  textDecoration: 'none',
                  textAlign: 'center',
                  flex: 1
                }}
              >
                홈으로
              </Link>
            </div>
          </div>
        </div>

        {/* 답안 선택 영역 */}
        <div style={{ 
          padding: '20px',
          overflowY: 'auto',
          flex: 1
        }}>
          {Array.from({length: 100}, (_, i) => i + 1).map(questionNumber => (
            <div 
              key={questionNumber} 
              id={`question-${questionNumber}`}
              style={{ 
                marginBottom: '20px',
                scrollMarginTop: '100px'
              }}
            >
              <div style={{ 
                marginBottom: '10px', 
                fontSize: '1.1rem',
                fontWeight: 'bold'
              }}>
                {questionNumber}번
              </div>
              <div style={{ 
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '10px'
              }}>
                {[1, 2, 3, 4].map(choice => (
                  <button
                    key={choice}
                    onClick={() => handleAnswerSelect(questionNumber, choice.toString())}
                    style={{
                      width: '100%',
                      padding: '10px',
                      border: answers[questionNumber] === choice.toString() 
                        ? '2px solid #4CAF50' 
                        : '1px solid #ddd',
                      borderRadius: '4px',
                      background: answers[questionNumber] === choice.toString() 
                        ? '#e8f5e9' 
                        : 'white',
                      cursor: 'pointer'
                    }}
                  >
                    {choice}
                  </button>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default PDFViewer;