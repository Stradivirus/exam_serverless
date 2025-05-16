// components/commontxt.tsx
import { useCallback, useEffect } from 'react';
import styles from '../style/commontxt.module.css';

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
  [key: `choice_${string}`]: string;
}

interface QuizQuestionProps {
  question: Question;
  index: number;
  answers: { [key: string]: string };
  setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  questions: Question[];
  currentQuestion: number;
  setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
}

const formatQuestionText = (text: string): string => {
  // '. '로 문장을 분리 (마침표 뒤에 공백이 있는 경우만)
  const sentences = text.split(/(?<=\. )/);

  if (sentences.length >= 3) {
    // 마지막 문장을 제외한 모든 문장을 결합
    return sentences.slice(0, -1).join('') + sentences[sentences.length - 1];
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
      [question.id]: answerKey,
    }));
    // 다음 문제로 이동
    if (currentQuestion === index && index < questions.length - 1) {
      setCurrentQuestion(index + 1);
    }
  }, [question.id, index, questions, answers, setAnswers, setCurrentQuestion, currentQuestion]);

  const handleKeyPress = useCallback((event: KeyboardEvent) => {
    if (currentQuestion !== index) return;
    const key = event.key.toUpperCase();
    if (['A', 'B', 'C', 'D'].includes(key)) {
      handleAnswerSelect(key);
    }
  }, [currentQuestion, index, handleAnswerSelect]);

  useEffect(() => {
    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [handleKeyPress]);

  const formattedQuestion = formatQuestionText(question.question);

  return (
    <div className={styles.questionCard}>
      <div className={styles.questionNumber}>{index + 1}번</div>
      <div className={styles.questionText}>{formattedQuestion}</div>
      <div className={styles.choices}>
        {(['A', 'B', 'C', 'D'] as const).map(key => (
          <label key={key} className={styles.choiceLabel}>
            <input
              type="radio"
              name={`question-${question.id}`}
              value={key}
              checked={answers[question.id] === key}
              onChange={() => handleAnswerSelect(key)}
            />
            <span className={styles.choiceKey}>{key}.</span> {question[`choice_${key.toLowerCase()}`]}
          </label>
        ))}
      </div>
    </div>
  );
};