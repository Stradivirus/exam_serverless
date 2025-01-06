// src/pages/NetworkResult.tsx
import { useState, useEffect } from 'react';
import { Link, useParams } from 'react-router-dom';

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

function NetworkResult() {
  const { filename } = useParams();
  const [result, setResult] = useState<QuizResponse | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const parsedResults = JSON.parse(storedResults);
      // 문제 번호 기준으로 정렬
      parsedResults.results.sort((a: QuizResult, b: QuizResult) => 
        a.question_number - b.question_number
      );
      setResult(parsedResults);
    }
  }, []);

  if (!result) {
    return <div style={{ fontSize: '1.3rem' }}>결과를 불러오는 중...</div>;
  }

  const percentage = (result.score / result.total) * 100;
  const isPassed = percentage >= 60; // 네트워크관리사도 60점 이상이 합격

  return (
    <div style={{ display: 'flex', height: '100vh' }}>
      {/* PDF 뷰어 */}
      <div style={{ 
        flex: 3, 
        height: '100%',
        position: 'relative',
        overflow: 'auto',
        display: 'flex',
        justifyContent: 'center'
      }}>
        <iframe
          src={`/pdf/${filename}`}
          style={{ 
            width: '130%',
            height: '100%',
            border: 'none',
            margin: 'auto'
          }}
          title="PDF Viewer"
        />
      </div>

      {/* 결과 패널 */}
      <div style={{ 
        flex: 1,
        padding: '20px',
        overflowY: 'auto',
        borderLeft: '1px solid #eee',
        display: 'flex',
        flexDirection: 'column'
      }}>
        {/* 헤더 */}
        <div style={{
          position: 'sticky',
          top: 0,
          backgroundColor: 'white',
          padding: '20px 0',
          borderBottom: '1px solid #eee',
          marginBottom: '20px',
          zIndex: 10
        }}>
          <h1 style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            marginBottom: '10px'
          }}>
            네트워크관리사 2급 {filename?.match(/\d{8}/)?.[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일')} 시험 결과
          </h1>
          <div style={{
            fontSize: '1.3rem',
            color: isPassed ? '#28a745' : '#dc3545',
            marginBottom: '20px'
          }}>
            총점: {result.score} / {result.total} ({percentage.toFixed(2)}%) 
            {isPassed ? " (합격)" : " (불합격)"}
          </div>
          <div style={{
            display: 'flex',
            gap: '10px'
          }}>
            <Link 
              to={`/view_pdf/${filename}`}
              style={{
                padding: '12px 24px',
                backgroundColor: '#9C27B0', // 네트워크관리사 테마 색상으로 변경
                color: 'white',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                flex: 1,
                textAlign: 'center'
              }}
            >
              다시 시작하기
            </Link>
            <Link 
              to="/"
              style={{
                padding: '12px 24px',
                backgroundColor: '#2196F3',
                color: 'white',
                borderRadius: '5px',
                textDecoration: 'none',
                fontSize: '1.1rem',
                fontWeight: '500',
                flex: 1,
                textAlign: 'center'
              }}
            >
              홈으로
            </Link>
          </div>
        </div>

        {/* 문제 리뷰 */}
        <div>
          <h2 style={{
            fontSize: '1.3rem',
            fontWeight: 'bold',
            marginBottom: '20px'
          }}>
            문제 리뷰
          </h2>
          {result.results.map((item) => (
            <div 
              key={item.question_number}
              style={{
                marginBottom: '10px',
                padding: '12px',
                backgroundColor: item.is_correct ? 'rgba(40, 167, 69, 0.1)' : 'rgba(220, 53, 69, 0.1)',
                borderRadius: '8px',
                border: `1px solid ${item.is_correct ? '#28a745' : '#dc3545'}`,
                display: 'flex',
                alignItems: 'center',
                gap: '20px'
              }}
            >
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                width: '100px'
              }}>
                문제 {item.question_number}번
              </div>
              <div style={{
                fontSize: '1.1rem',
                width: '100px'
              }}>
                제출한 답: {item.user_answer}
              </div>
              <div style={{
                fontSize: '1.1rem',
                fontWeight: 'bold',
                width: '100px'
              }}>
                정답: {item.correct_answer}
              </div>
              <div style={{
                marginLeft: 'auto',
                fontSize: '1.1rem',
                color: item.is_correct ? '#28a745' : '#dc3545',
                fontWeight: 'bold'
              }}>
                {item.is_correct ? '정답' : '오답'}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default NetworkResult;