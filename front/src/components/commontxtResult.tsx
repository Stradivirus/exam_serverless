// components/commontxtResult.tsx
import React from 'react';
import { Link } from 'react-router-dom';
import styles from './commontxtResult.module.css';

export interface ResultData {
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

export const LoadingMessage: React.FC = () => (
  <div className={styles.loadingMessage}>결과를 불러오는 중...</div>
);

interface ResultHeaderProps {
  title: string;
  score: number;
  total: number;
  passPercentage: number;
  quizPath: string;
}

export const ResultHeader: React.FC<ResultHeaderProps> = ({ 
  title, 
  score, 
  total, 
  passPercentage,
  quizPath 
}) => {
  const passScore = Math.ceil(total * passPercentage);
  const isPassed = score >= passScore;

  return (
    <div className={styles.header}>
      <div className={styles.headerContent}>
        <div>
          <h1 className={styles.headerTitle}>{title}</h1>
          <div className={isPassed ? styles.scoreTextPassed : styles.scoreTextFailed}>
            총점: {score} / {total} {isPassed ? "(합격)" : "(불합격)"}
          </div>
        </div>

        <div className={styles.buttonGroup}>
          <Link to={quizPath} className={styles.button}>다시 시작하기</Link>
          <Link to="/" className={styles.button}>홈으로</Link>
        </div>
      </div>
    </div>
  );
};

interface QuestionReviewCardProps {
  questionNumber: number;
  questionText: string;
  choices: { [key: string]: string };
  userAnswer: string;
  correctAnswer: string;
  isCorrect: boolean;
  userAnswerText?: string;
  correctAnswerText?: string;
}

export const QuestionReviewCard: React.FC<QuestionReviewCardProps> = ({
  questionNumber,
  questionText,
  choices,
  userAnswer,
  correctAnswer,
  isCorrect,
  userAnswerText,
  correctAnswerText
}) => {
  const formatText = (text: string) => {
    const sentences = text.split('.');
    if (sentences.length <= 3) return text;

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
  };

  return (
    <div className={isCorrect ? styles.questionCardCorrect : styles.questionCardIncorrect}>
      <h3 className={styles.questionNumber}>문제 {questionNumber}</h3>
      <div className={styles.questionText}>
        {formatText(questionText)}
      </div>
      
      <div className={styles.choicesContainer}>
        {Object.entries(choices).map(([key, value]) => {
          let choiceClassName = styles.choiceItem;
          if (value === correctAnswerText) {
            choiceClassName = styles.choiceCorrect;
          } else if (value === userAnswerText && !isCorrect) {
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
  );
};

export function formatStoredResults(storedResults: string): ResultData | null {
  if (!storedResults) return null;
  
  const quizResults = JSON.parse(storedResults);
  return {
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
}