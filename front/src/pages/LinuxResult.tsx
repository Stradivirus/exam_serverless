// pages/LinuxResult.tsx
import PDFResult from '../components/PDFResult';

function LinuxResult() {
 const getTitle = (filename: string | undefined) => 
   `LINUX ${filename?.replace('.pdf', '')} 시험 결과`;

 return (
   <PDFResult 
     type="linux"
     getTitle={getTitle}
     buttonColor="#4CAF50"
   />
 );
}

export default LinuxResult;