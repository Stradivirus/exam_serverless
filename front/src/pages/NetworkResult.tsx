// pages/NetworkResult.tsx
import PDFResult from '../components/PDFResult';

function NetworkResult() {
  const getTitle = (filename: string | undefined) => {
    const date = filename?.match(/\d{8}/)?.[0].replace(/(\d{4})(\d{2})(\d{2})/, '$1년 $2월 $3일');
    return `네트워크관리사 2급 ${date} 시험 결과`;
  };

  return (
    <PDFResult 
      type="network"
      getTitle={getTitle}
      buttonColor="#9C27B0"
    />
  );
}

export default NetworkResult;