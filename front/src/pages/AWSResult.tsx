// src/pages/AWSResult.tsx
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';

interface ResultData {
 score: number;
 total: number;
 results: {
   question_text: string;
   choices: {
     A: string;
     B: string;
     C: string;
     D: string;
   };
   user_answer: string;
   correct_answer: string;
   is_correct: boolean;
 }[];
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
         choices: {
           A: result.choices?.A || '',
           B: result.choices?.B || '',
           C: result.choices?.C || '',
           D: result.choices?.D || ''
         },
         user_answer: result.user_answer,
         correct_answer: result.correct_answer,
         is_correct: result.is_correct
       }))
     };
     
     setResult(formattedResult);
   }
 }, []);

 if (!result) {
   return <div style={{ fontSize: '1.3rem' }}>결과를 불러오는 중...</div>;
 }

 const passScore = Math.ceil(result.total * 0.65);
 const isPassed = result.score >= passScore;

 return (
   <div>
     {/* 고정 헤더 */}
     <div style={{
       position: 'fixed',
       top: 0,
       left: 0,
       right: 0,
       backgroundColor: '#E6F3FF',
       borderBottom: '1px solid #eee',
       padding: '10px 0',
       zIndex: 1000
     }}>
       <div style={{
         maxWidth: '1200px',
         margin: '0 auto',
         display: 'flex',
         justifyContent: 'space-between',
         alignItems: 'center',
         padding: '0 20px'
       }}>
         <div>
           <h1 style={{
             fontSize: '1.5rem',
             fontWeight: 'bold',
             marginBottom: '8px'
           }}>
             AWS Certified Cloud Practitioner 시험 결과
           </h1>
           <div style={{
             fontSize: '1.3rem',
             color: isPassed ? '#28a745' : '#dc3545'
           }}>
             총점: {result.score} / {result.total} {isPassed ? "(합격)" : "(불합격)"}
           </div>
         </div>

         <div style={{
           display: 'flex',
           gap: '15px'
         }}>
           <Link 
             to="/aws/quiz"
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
             다시 시작하기
           </Link>
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
     <div style={{
       padding: '20px',
       maxWidth: '1200px',
       margin: '0 auto',
       marginTop: '120px'
     }}>
       <h2 style={{
         fontSize: '1.5rem',
         marginBottom: '20px'
       }}>
         문제 리뷰
       </h2>

       {result.results.map((item, index) => (
         <div 
           key={index}
           style={{
             marginBottom: '20px',
             padding: '20px',
             backgroundColor: item.is_correct ? 'rgba(209, 231, 221, 0.5)' : 'rgba(248, 215, 218, 0.3)',
             borderColor: item.is_correct ? '#c3e6cb' : '#f5c6cb',
             borderRadius: '10px',
             border: `1px solid ${item.is_correct ? '#c3e6cb' : '#f5c6cb'}`
           }}
         >
           <h3 style={{ 
             fontSize: '1.4rem',
             fontWeight: 'bold',
             marginBottom: '15px'
           }}>
             문제 {index + 1}
           </h3>
           <p style={{ 
             marginBottom: '15px',
             fontSize: '1.3rem',
             lineHeight: '1.6'
           }}>
             {item.question_text}
           </p>
           
           <div style={{ marginBottom: '15px' }}>
             {Object.entries(item.choices).map(([key, value]) => (
               <div 
                 key={key}
                 style={{
                   padding: '12px',
                   marginBottom: '8px',
                   backgroundColor: 
                     key === item.correct_answer 
                       ? 'rgba(40, 167, 69, 0.9)'
                       : key === item.user_answer && !item.is_correct
                         ? 'rgba(220, 53, 69, 0.4)'
                         : 'white',
                   color: 
                     (key === item.correct_answer || 
                     (key === item.user_answer && !item.is_correct))
                       ? 'white'
                       : 'black',
                   borderRadius: '5px',
                   border: '1px solid rgba(0,0,0,0.1)',
                   fontSize: '1.3rem',
                   lineHeight: '1.4',
                   cursor: 'default',
                   boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
                   transition: 'background-color 0.2s'
                 }}
               >
                 {key}: {value}
               </div>
             ))}
           </div>

           <div style={{
             display: 'flex',
             gap: '20px',
             fontSize: '1.2rem',
             padding: '10px 15px',
             backgroundColor: 'rgba(0,0,0,0.03)',
             borderRadius: '5px',
             marginTop: '20px'
           }}>
             <p>
               <span style={{ fontWeight: 'bold', marginRight: '5px' }}>제출한 답:</span> 
               {item.user_answer}
             </p>
             <p>
               <span style={{ fontWeight: 'bold', marginRight: '5px' }}>정답:</span> 
               {item.correct_answer}
             </p>
           </div>
         </div>
       ))}
     </div>
   </div>
 );
}

export default AWSResult;