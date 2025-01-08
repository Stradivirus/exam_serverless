// pages/AWSResult.tsx
import { useState, useEffect } from 'react';
import { 
 ResultHeader, 
 QuestionReviewCard, 
 ResultData, 
 LoadingMessage,
 formatStoredResults 
} from '../components/commontxtResult';
import styles from '../components/commontxtResult.module.css';

function AWSResult() {
 const [result, setResult] = useState<ResultData | null>(null);

 useEffect(() => {
   const storedResults = sessionStorage.getItem('quizResults');
   if (storedResults) {
     setResult(formatStoredResults(storedResults));
   }
 }, []);

 if (!result) {
   return <LoadingMessage />;
 }

 return (
   <div className={styles.container}>
     <ResultHeader
       title="AWS Solution Architect Associate 시험 결과"
       score={result.score}
       total={result.total}
       passPercentage={0.65}
       quizPath="/aws/quiz"
     />

     <div className={styles.mainContent}>
       <h2 className={styles.reviewTitle}>문제 리뷰</h2>
       {result.results.map((item, index) => (
         <QuestionReviewCard
           key={index}
           questionNumber={index + 1}
           questionText={item.question_text}
           choices={item.choices}
           userAnswer={item.user_answer}
           correctAnswer={item.correct_answer}
           isCorrect={item.is_correct}
           userAnswerText={item.user_answer_text}
           correctAnswerText={item.correct_answer_text}
         />
       ))}
     </div>
   </div>
 );
}

export default AWSResult;