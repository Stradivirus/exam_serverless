// components/commontxt.tsx
import React from 'react';
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
}

export const QuizQuestion: React.FC<QuizQuestionProps> = ({ question, index, answers, setAnswers }) => (
 <div className={styles.questionCard}>
   <h3 className={styles.questionTitle}>
     {index + 1}. {question.question}
     {!answers[question.id] && (
       <span className={styles.unansweredTag}>미선택</span>
     )}
   </h3>
   <div className={styles.choicesContainer}>
     {[
       { key: 'A', value: question.choice_a },
       { key: 'B', value: question.choice_b },
       { key: 'C', value: question.choice_c },
       { key: 'D', value: question.choice_d }
     ].map(choice => (
       <label key={choice.key} className={styles.choiceLabel}>
         <input
           type="radio"
           name={`question_${question.id}`}
           value={choice.key}
           onChange={(e) => setAnswers({
             ...answers,
             [question.id]: e.target.value
           })}
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