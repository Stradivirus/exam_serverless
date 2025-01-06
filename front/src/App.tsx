// src/App.tsx
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import NCAQuiz from "./pages/NCAQuiz";
import NCAResult from "./pages/NCAResult";
import AWSQuiz from "./pages/AWSQuiz";
import AWSResult from "./pages/AWSResult";
import PDFViewer from "./pages/PDFViewer";    
import LinuxResult from "./pages/LinuxResult"; 
import NetworkResult from "./pages/NetworkResult";
import { ReactNode } from 'react'; // children 타입을 위해 추가
import './App.css';

function HomePage() {
  const buttonStyle = {
    padding: '15px 30px',
    border: 'none',
    borderRadius: '5px',
    color: 'white',
    cursor: 'pointer',
    fontSize: '18px',
    fontWeight: '500',
    textDecoration: 'none',
    display: 'inline-block',
    textAlign: 'center' as const // 타입 명시
  };

  return (
    <div className="home-container">
      <h1 className="main-title">
        NCA, AWS 기출문제
      </h1>
      
      <div className="button-container">
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
          AWS Solution Architect Associate<br></br> (331문제 중 20문제)
        </Link>
      </div>

      <div className="section-container">
        <h2 className="section-title">
          LINUX 1급 기출문제 (총 4회)
        </h2>
        <div className="button-grid">
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

      <div className="section-container">
        <h2 className="section-title">
          네트워크 관리사 2급 기출문제 (총 7회)
        </h2>
        <div className="button-grid">
          {[
            { text: '2024년 8월', pdf: '네트워크관리사2급20240825(학생용).pdf' },
            { text: '2024년 5월', pdf: '네트워크관리사2급20240519(학생용).pdf' },
            { text: '2024년 2월', pdf: '네트워크관리사2급20240225(학생용).pdf' },
            { text: '2023년 11월', pdf: '네트워크관리사2급20231105(학생용).pdf' },
            { text: '2023년 8월', pdf: '네트워크관리사2급20230820(학생용).pdf' },
            { text: '2023년 5월', pdf: '네트워크관리사2급20230521(학생용).pdf' },
            { text: '2023년 2월', pdf: '네트워크관리사2급20230226(학생용).pdf' }
          ].map((item) => (
            <Link 
              key={item.text} 
              to={`/view_pdf/${item.pdf}`}
              style={{...buttonStyle, backgroundColor: '#9C27B0'}}
            >
              {item.text}
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

// Layout 컴포넌트의 props 타입 정의
interface LayoutProps {
  children: ReactNode;
}

function Layout({ children }: LayoutProps) {
  return (
    <div className="layout">
      <div className="layout-side"></div>
      <div className="layout-content">
        {children}
      </div>
      <div className="layout-side"></div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/nca/quiz" element={<NCAQuiz />} />
          <Route path="/nca/result" element={<NCAResult />} />
          <Route path="/aws/quiz" element={<AWSQuiz />} />
          <Route path="/aws/result" element={<AWSResult />} />
          <Route path="/view_pdf/:filename" element={<PDFViewer />} />
          <Route path="/linux/result/:filename" element={<LinuxResult />} />
          <Route path="/network/result/:filename" element={<NetworkResult />} />
        </Routes>
      </Layout>
    </Router>
  );
}

export default App;