// components/commontxt.tsx
import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import styles from './commontxt.module.css';

export const API_URL = 'https://asia-northeast3-master-coder-441716-a4.cloudfunctions.net/examhandler';

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
 questions: Question[]; // questions 배열 추가
 currentQuestion: number; // 현재 문제 번호 추가
 setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>; // 현재 문제 설정 함수 추가
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ 
 question, 
 index, 
 answers, 
 setAnswers,
 questions,
 currentQuestion,
 setCurrentQuestion
}) => {
 // 답안 선택 및 다음 문제 이동 처리
 const handleAnswerSelect = useCallback((answerKey: string) => {
   setAnswers(prev => ({
     ...prev,
     [question.id]: answerKey
   }));

   // 현재 문제가 마지막이 아니면 다음 미답변 문제로 이동
   if (index < questions.length - 1) {
     const nextUnansweredIndex = questions.findIndex((q, idx) => 
       idx > index && !answers[q.id]
     );
     if (nextUnansweredIndex !== -1) {
       setCurrentQuestion(nextUnansweredIndex);
       // 해당 문제로 스크롤
       const element = document.getElementById(`question-${nextUnansweredIndex}`);
       if (element) {
         element.scrollIntoView({ behavior: 'smooth', block: 'center' });
       }
     }
   }
 }, [question.id, index, questions, answers, setAnswers, setCurrentQuestion]);

 // 키보드 이벤트 처리
 const handleKeyPress = useCallback((event: KeyboardEvent) => {
   if (currentQuestion !== index) return;  // 현재 문제가 아니면 무시

   if (
     document.activeElement?.tagName === 'INPUT' ||
     document.activeElement?.tagName === 'TEXTAREA' ||
     (document.activeElement as HTMLElement)?.contentEditable === 'true'
   ) {
     return;
   }

   const isRegularNumber = event.code.startsWith('Digit') && ['1', '2', '3', '4'].includes(event.key);
   const isNumpadNumber = event.code.startsWith('Numpad') && ['1', '2', '3', '4'].includes(event.key);
   
   if (isRegularNumber || isNumpadNumber) {
     const numToLetter: { [key: string]: string } = {
       '1': 'A',
       '2': 'B',
       '3': 'C',
       '4': 'D'
     };
     handleAnswerSelect(numToLetter[event.key]);
   }
 }, [currentQuestion, index, handleAnswerSelect]);

 // 키보드 이벤트 리스너 등록
 useEffect(() => {
   window.addEventListener('keydown', handleKeyPress);
   return () => window.removeEventListener('keydown', handleKeyPress);
 }, [handleKeyPress]);

 return (
   <div 
     id={`question-${index}`}
     className={`${styles.questionCard} ${currentQuestion === index ? styles.currentQuestion : ''}`}
   >
     <h3 className={styles.questionTitle}>
       {index + 1}. {question.question}
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