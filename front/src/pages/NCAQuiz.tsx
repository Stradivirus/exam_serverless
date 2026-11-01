import CloudExamQuiz from './CloudExamQuiz';

function NCAQuiz() {
  return (
    <CloudExamQuiz
      config={{
        examType: 'nca',
        title: 'NAVER Cloud Platform Certified Associate (NCA)',
        subtitle: '네이버 클라우드 플랫폼 공인 아소시에이트 실전 20문항',
        badgeText: 'NAVER CLOUD · NCA',
        accentColor: 'cyan',
        shuffleChoices: false,
        resultPath: '/nca/result',
      }}
    />
  );
}

export default NCAQuiz;
