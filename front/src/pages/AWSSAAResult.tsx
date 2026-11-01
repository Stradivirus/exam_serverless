import CloudExamResult from './CloudExamResult';

function AWSSAAResult() {
  return (
    <CloudExamResult
      config={{
        examType: 'awssaa',
        title: 'AWS Solutions Architect Associate (SAA) 시험 결과',
        passPercentage: 0.7,
        quizPath: '/awssaa/quiz',
      }}
    />
  );
}

export default AWSSAAResult;
