import CloudExamQuiz from './CloudExamQuiz';

function AWSSysOpsQuiz() {
  return (
    <CloudExamQuiz
      config={{
        examType: 'awssysops',
        title: 'AWS Certified SysOps Administrator - Associate',
        subtitle: 'AWS 시스옵스 어드민 어소시에이트 실전 20문항 (선택지 랜덤 셔플)',
        badgeText: 'AWS · SYSOPS',
        accentColor: 'amber',
        shuffleChoices: true,
        resultPath: '/awssysops/result',
      }}
    />
  );
}

export default AWSSysOpsQuiz;
