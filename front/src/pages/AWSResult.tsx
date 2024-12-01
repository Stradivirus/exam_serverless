import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import styles from './AWSResult.module.css';

interface ResultData {
  score: number;
  total: number;
  results: {
    question_text: string;
    choices: {
      [key: string]: string;
    };
    user_answer: string;
    correct_answer: string;
    is_correct: boolean;
    user_answer_text?: string;
    correct_answer_text?: string;
  }[];
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

function AWSResult() {
  const [result, setResult] = useState<ResultData | null>(null);

  useEffect(() => {
    const storedResults = sessionStorage.getItem('quizResults');
    if (storedResults) {
      const quizResults = JSON.parse(storedResults);
      
      const formattedResult: ResultData = {
        score: quizResults.score,
        total: quizResults.total,
        results: quizResults.results.map((result: any) => ({
          question_text: result.question,
          choices: result.choices || {},
          user_answer: result.user_answer,
          correct_answer: result.correct_answer,
          is_correct: result.is_correct,
          user_answer_text: result.choices?.[result.user_answer] || '',
          correct_answer_text: result.choices?.[result.correct_answer] || ''
        }))
      };
      
      setResult(formattedResult);
    }
  }, []);

  if (!result) {
    return <div className={styles.loadingMessage}>결과를 불러오는 중...</div>;
  }

  const passScore = Math.ceil(result.total * 0.65);
  const isPassed = result.score >= passScore;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div className={styles.headerContent}>
          <div>
            <h1 className={styles.headerTitle}>
              AWS Solution Architect Associate 시험 결과
            </h1>
            <div className={isPassed ? styles.scoreTextPassed : styles.scoreTextFailed}>
              총점: {result.score} / {result.total} {isPassed ? "(합격)" : "(불합격)"}
            </div>
          </div>

          <div className={styles.buttonGroup}>
            <Link to="/aws/quiz" className={styles.button}>다시 시작하기</Link>
            <Link to="/" className={styles.button}>홈으로</Link>
          </div>
        </div>
      </div>

      <div className={styles.mainContent}>
        <h2 className={styles.reviewTitle}>문제 리뷰</h2>

        {result.results.map((item, index) => (
          <div 
            key={index}
            className={item.is_correct ? styles.questionCardCorrect : styles.questionCardIncorrect}
          >
            <h3 className={styles.questionNumber}>문제 {index + 1}</h3>
            <div className={styles.questionText}>
              {(() => {
                const sentences = item.question_text.split('.');
                const firstLine = `${sentences[0]}.${sentences[1]}.`;
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
            </div>
            
            <div className={styles.choicesContainer}>
              {Object.entries(item.choices).map(([key, value]) => {
                let choiceClassName = styles.choiceItem;
                if (value === item.correct_answer_text) {
                  choiceClassName = styles.choiceCorrect;
                } else if (value === item.user_answer_text && !item.is_correct) {
                  choiceClassName = styles.choiceIncorrect;
                }

                return (
                  <div key={key} className={choiceClassName}>
                    {formatText(value)}
                  </div>
                );
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default AWSResult;