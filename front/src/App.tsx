// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NCAQuiz from "./pages/NCAQuiz";
import NCAResult from "./pages/NCAResult";
import AWSQuiz from "./pages/AWSQuiz";
import AWSResult from "./pages/AWSResult";
import PDFViewer from "./pages/PDFViewer";    // 추가
import LinuxResult from "./pages/LinuxResult"; // 추가

function HomePage() {
 const buttonStyle = {
   padding: '15px 30px',
   border: 'none',
   borderRadius: '5px',
   color: 'white',
   cursor: 'pointer',
   fontSize: '18px',
   fontWeight: '500' as const,
   textDecoration: 'none',
   display: 'inline-block'
 };

 return (
   <div style={{ 
     padding: '20px',
     maxWidth: '1200px',
     margin: '0 auto',
     display: 'flex',
     flexDirection: 'column',
     alignItems: 'center',
     marginTop: '40px'
   }}>
     <h1 style={{
       fontSize: '2.5rem',
       fontWeight: 'bold',
       marginBottom: '40px'
     }}>
       NCA, AWS 기출문제
     </h1>
     
     <div style={{ 
       display: 'flex',
       gap: '20px',
       justifyContent: 'center'
     }}>
       <Link 
         to="/nca/quiz" 
         style={{...buttonStyle, backgroundColor: '#2196F3'}}
       >
         NAVER Cloud Platform Certified Associate<br></br> (117문제 중 20문제)
       </Link>
       
       <Link 
         to="/aws/quiz" 
         style={{...buttonStyle, backgroundColor: '#F7931E'}}
       >
         AWS Solution Architect Associate<br></br> (195문제 중 20문제)
       </Link>
     </div>

     <div style={{
       marginTop: '60px',
       width: '100%',
       display: 'flex',
       flexDirection: 'column',
       alignItems: 'center'
     }}>
       <h2 style={{
         fontSize: '2rem',
         fontWeight: 'bold',
         marginBottom: '30px'
       }}>
         LINUX 1급 기출문제 (총 4회)
       </h2>
       <div style={{
         display: 'flex',
         gap: '20px',
         flexWrap: 'wrap',
         justifyContent: 'center'
       }}>
         {[
           { text: '2020년 1회', pdf: 'linux1.pdf' },
           { text: '2020년 2회', pdf: 'linux2.pdf' },
           { text: '2022년', pdf: 'linux3.pdf' },
           { text: '2023년', pdf: 'linux4.pdf' }
         ].map((item) => (
           <Link 
             key={item.text} 
             to={`/view_pdf/${item.pdf}`}
             style={{...buttonStyle, backgroundColor: '#4CAF50'}}
           >
             {item.text}
           </Link>
         ))}
       </div>
     </div>
   </div>
 );
}

function App() {
 return (
   <Router>
     <Routes>
       <Route path="/" element={<HomePage />} />
       <Route path="/nca/quiz" element={<NCAQuiz />} />
       <Route path="/nca/result" element={<NCAResult />} />
       <Route path="/aws/quiz" element={<AWSQuiz />} />
       <Route path="/aws/result" element={<AWSResult />} />
       <Route path="/view_pdf/:filename" element={<PDFViewer />} />
       <Route path="/linux/result/:filename" element={<LinuxResult />} />
     </Routes>
   </Router>
 );
}

export default App;