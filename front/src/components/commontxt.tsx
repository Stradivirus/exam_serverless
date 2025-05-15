// components/commontxt.tsx
import React, { useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './commontxt.module.css';

export const API_URL = 'https://exam-serverless-916058497164.asia-northeast3.run.app';

export const LoadingContainer: React.FC = () => (
  <div className={styles.loadingContainer}>
    문제를 불러오는 중...
  </div>
);

interface QuizHeaderProps {
  title: string;
  isSubmittable: boolean;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({ title, isSubmittable }) => (
  <div className={styles.header}>
    <div className={styles.headerContent}>
      <h1 className={styles.headerTitle}>{title}</h1>
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
);

interface Question {
  id: string;
  question: string;
  choice_a: string;
  choice_b: string;
  choice_c: string;
  choice_d: string;
}

interface QuizQuestionProps {
  question: Question;
  index: number;
  answers: {[key: string]: string};
  setAnswers: React.Dispatch<React.SetStateAction<{[key: string]: string}>>;
  questions: Question[];
  currentQuestion: number;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
}

const formatQuestionText = (text: string): string => {
  // '. '로 문장을 분리 (마침표 뒤에 공백이 있는 경우만)
  const sentences = text.split(/(?<=\. )/);
  
  if (sentences.length >= 3) {
    // 마지막 문장을 제외한 모든 문장을 결합
    const mainText = sentences.slice(0, -1).join('');
    // 마지막 문장
    const lastSentence = sentences[sentences.length - 1];
    // 줄바꿈을 추가하여 결합
    return `${mainText}\n${lastSentence}`;
  }
  
  return text;
};

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
  question, 
  index, 
  answers, 
  setAnswers,
  questions,
  currentQuestion,
  setCurrentQuestion
}) => {
  const handleAnswerSelect = useCallback((answerKey: string) => {
    setAnswers(prev => ({
      ...prev,
      [question.id]: answerKey
    }));

    if (index < questions.length - 1) {
      const nextUnansweredIndex = questions.findIndex((q, idx) => 
        idx > index && !answers[q.id]
      );
      if (nextUnansweredIndex !== -1) {
        setCurrentQuestion(nextUnansweredIndex);
        const element = document.getElementById(`question-${nextUnansweredIndex}`);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }
  }, [question.id, index, questions, answers, setAnswers, setCurrentQuestion]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (currentQuestion !== index) return;
  
    if (
      document.activeElement?.tagName === 'INPUT' ||
      document.activeElement?.tagName === 'TEXTAREA' ||
      (document.activeElement as HTMLElement)?.contentEditable === 'true'
    ) {
      return;
    }
  
    // Firefox의 페이지 내 검색 기능 방지
    event.preventDefault();
  
    // key 값으로 직접 체크
    const validKeys = ['1', '2', '3', '4'];
    if (validKeys.includes(event.key)) {
      const numToLetter: { [key: string]: string } = {
        '1': 'A',
        '2': 'B',
        '3': 'C',
        '4': 'D'
      };
      handleAnswerSelect(numToLetter[event.key]);
    }
  }, [currentQuestion, index, handleAnswerSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const formattedQuestion = formatQuestionText(question.question);

  return (
    <div 
      id={`question-${index}`}
      className={`${styles.questionCard} ${currentQuestion === index ? styles.currentQuestion : ''}`}
    >
      <h3 className={styles.questionTitle}>
        {index + 1}. {formattedQuestion}
        {!answers[question.id] && (
          <span className={styles.unansweredTag}>미선택</span>
        )}
        {currentQuestion === index && (
          <span className={styles.keyboardHint}>
            (1-4 키를 눌러 답안 선택)
          </span>
        )}
      </h3>
      <div className={styles.choicesContainer}>
        {[
          { key: 'A', value: question.choice_a, num: '1' },
          { key: 'B', value: question.choice_b, num: '2' },
          { key: 'C', value: question.choice_c, num: '3' },
          { key: 'D', value: question.choice_d, num: '4' }
        ].map(choice => (
          <label key={choice.key} className={styles.choiceLabel}>
            <input
              type="radio"
              name={`question_${question.id}`}
              value={choice.key}
              checked={answers[question.id] === choice.key}
              onChange={() => handleAnswerSelect(choice.key)}
              className={styles.choiceInput}
            />
            <span className={styles.choiceText}>
              {choice.key}. {choice.value}
            </span>
          </label>
        ))}
      </div>
    </div>
  );
};