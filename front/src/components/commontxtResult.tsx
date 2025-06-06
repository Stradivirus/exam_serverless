// components/commontxtResult.tsx

import React from 'react';
import styles from '../style/commontxtResult.module.css';
import { Question } from '../types/question';

export interface ResultData {
  score: number;
  total: number;
  results: {
    question_id: string;
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
            <div className={styles.headerTitle}>{title}</div>
            <div
                className={
                  isPassed
                      ? styles.scoreTextPassed
                      : styles.scoreTextFailed
                }
            >
              점수: {score} / {total} ({Math.round((score / total) * 100)}%)
            </div>
          </div>
          <div className={styles.buttonGroup}>
            <a href={quizPath} className={styles.button}>
              다시 풀기
            </a>
            <a href="/" className={styles.button}>
              홈으로
            </a>
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
  const formatText = (text: string | undefined) =>
      (text ?? '').split('\n').map((line, idx) => (
          <React.Fragment key={idx}>
            {line}
            <br />
          </React.Fragment>
      ));

  return (
      <div
          className={
            isCorrect
                ? styles.questionCardCorrect
                : styles.questionCardIncorrect
          }
      >
        <div className={styles.questionNumber}>{questionNumber}번</div>
        <div className={styles.questionText}>{formatText(questionText)}</div>
        <div className={styles.choicesContainer}>
          {Object.entries(choices).map(([key, value]) => {
            const isUser = userAnswer === key;
            const isCorrectChoice = correctAnswer === key;
            return (
                <div
                    key={key}
                    className={[
                      styles.choiceItem,
                      isCorrectChoice ? styles.choiceCorrect : '',
                      isUser && !isCorrectChoice ? styles.choiceIncorrect : ''
                    ].join(' ')}
                >
              <span>
                {key}. {value}
              </span>
                  {isUser && (
                      <span>
                  {isCorrectChoice
                      ? ' (선택, 정답)'
                      : ' (내 답안)'}
                </span>
                  )}
                  {!isUser && isCorrectChoice && <span> (정답)</span>}
                </div>
            );
          })}
        </div>
        {userAnswerText && (
            <div>
              <strong>내 답안:</strong> {userAnswerText}
            </div>
        )}
        {correctAnswerText && (
            <div>
              <strong>정답:</strong> {correctAnswerText}
            </div>
        )}
      </div>
  );
};

// 결과 데이터 포맷 함수: 문제 지문이 반드시 포함되도록!
export function formatStoredResults(storedResults: string, questions: Question[]): ResultData | null {
  if (!storedResults) return null;
  const quizResults = JSON.parse(storedResults);

  if (quizResults?.results) {
    quizResults.results = quizResults.results.map((r: any) => {
      if (!r.question_text) {
        // r.question이 있으면 우선 사용, 없으면 questions 배열에서 찾아서 사용
        const q = questions.find(q => q.id === r.question_id);
        return {
          ...r,
          question_text: r.question || (q ? q.question : ''),
        };
      }
      return r;
    });
  }

  return quizResults;
}