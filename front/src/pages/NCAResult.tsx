import CloudExamResult from './CloudExamResult';

function NCAResult() {
  return (
    <CloudExamResult
      config={{
        examType: 'nca',
        title: 'NCA (NAVER Cloud Certified Associate) 시험 결과',
        passPercentage: 0.65,
        quizPath: '/nca/quiz',
      }}
    />
  );
}

export default NCAResult;
