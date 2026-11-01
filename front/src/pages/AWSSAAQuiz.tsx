import CloudExamQuiz from './CloudExamQuiz';

function AWSSAAQuiz() {
  return (
    <CloudExamQuiz
      config={{
        examType: 'awssaa',
        title: 'AWS Certified Solutions Architect - Associate (SAA-C03)',
        subtitle: 'AWS 솔루션즈 아키텍트 어소시에이트 실전 20문항 (선택지 랜덤 셔플)',
        badgeText: 'AWS · SAA-C03',
        accentColor: 'amber',
        shuffleChoices: true,
        resultPath: '/awssaa/result',
      }}
    />
  );
}

export default AWSSAAQuiz;
