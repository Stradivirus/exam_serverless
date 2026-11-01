import CloudExamResult from './CloudExamResult';

function AWSSysOpsResult() {
  return (
    <CloudExamResult
      config={{
        examType: 'awssysops',
        title: 'AWS SysOps Administrator 시험 결과',
        passPercentage: 0.7,
        quizPath: '/awssysops/quiz',
      }}
    />
  );
}

export default AWSSysOpsResult;
