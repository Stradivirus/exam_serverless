// components/commontxt.tsx
import {useCallback, useEffect} from 'react';
import styles from '../style/commontxt.module.css';
import {Question} from '../types/question';

export const LoadingContainer: React.FC = () => (
    <div className={styles.loadingContainer}>
        문제를 불러오는 중...
    </div>
);

interface QuizHeaderProps {
    title: string;
    isSubmittable: boolean;
}

export const QuizHeader: React.FC<QuizHeaderProps> = ({title, isSubmittable}) => (
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

interface QuizQuestionProps {
    question: Question;
    index: number;
    answers: { [key: string]: string };
    setAnswers: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
    questions: Question[];
    currentQuestion: number;
    setCurrentQuestion: React.Dispatch<React.SetStateAction<number>>;
}

// 마지막 문장만 줄 바꿈 처리
const formatQuestionText = (text: string): JSX.Element => {
    // '. '로 문장 분리 (마침표+공백)
    const sentences = text.split(/(?<=\. )/);

    if (sentences.length >= 2) {
        // 마지막 문장 앞에 줄 바꿈 추가
        return (
            <>
                {sentences.slice(0, -1).join('')}
                <br/>
                {sentences[sentences.length - 1]}
            </>
        );
    }

    return <>{text}</>;
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
    }, [question.id, index, questions, setAnswers, setCurrentQuestion, currentQuestion]);

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
                {(['a', 'b', 'c', 'd'] as const).map(key => (
                    <label key={key.toUpperCase()} className={styles.choiceLabel}>
                        <input
                            type="radio"
                            name={`question-${question.id}`}
                            value={key.toUpperCase()}
                            checked={answers[question.id] === key.toUpperCase()}
                            onChange={() => handleAnswerSelect(key.toUpperCase())}
                        />
                        <span className={styles.choiceKey}>{key.toUpperCase()}.</span> {question[`choice_${key}`]}
                    </label>
                ))}
            </div>
        </div>
    );
};