import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  Award,
  BookOpen,
  ChevronRight,
  Clock,
  Cloud,
  Cpu,
  FileText,
  Keyboard,
  Network,
  Shuffle,
  Sparkles,
  Terminal,
} from 'lucide-react';
import Navbar from './components/Navbar';
import NCAQuiz from './pages/NCAQuiz';
import NCAResult from './pages/NCAResult';
import AWSQuiz from './pages/AWSSAAQuiz';
import AWSResult from './pages/AWSSAAResult';
import AWSSysOpsQuiz from './pages/AWSSysOpsQuiz';
import AWSSysOpsResult from './pages/AWSSysOpsResult';
import PDFViewer from './components/PDFViewer';
import LinuxResult from './pages/LinuxResult';
import NetworkResult from './pages/NetworkResult';
import HistoryNotePage from './pages/HistoryNotePage';
import { getAttemptHistory, getWrongNotes } from './utils/examStorage';

const CLOUD_EXAMS = [
  {
    id: 'nca',
    badge: 'NAVER CLOUD',
    title: 'NCA 공인 아소시에이트',
    fullName: 'NAVER Cloud Platform Certified Associate',
    path: '/nca/quiz',
    questions: '랜덤 20문항',
    duration: '30분',
    passCut: '65% (13문항)',
    features: ['MongoDB Atlas 실시간 랜덤 출제', '1문제 집중 / 전체 스크롤 모드', '키보드 단축키(1~4, A~D)'],
    gradient: 'from-emerald-500/20 via-teal-500/10 to-slate-900',
    border: 'border-emerald-500/30 hover:border-emerald-400',
    btnClass: 'bg-emerald-500 text-slate-950 hover:bg-emerald-400',
  },
  {
    id: 'awssaa',
    badge: 'AWS ASSOCIATE',
    title: 'AWS Solutions Architect (SAA-C03)',
    fullName: 'AWS Certified Solutions Architect - Associate',
    path: '/awssaa/quiz',
    questions: '랜덤 20문항',
    duration: '30분',
    passCut: '70% (14문항)',
    features: ['매 응시마다 보기(A~D) 자동 셔플', '실전 아키텍처 시나리오 문제 풀', '오답노트 자동 수집 지원'],
    gradient: 'from-amber-500/20 via-orange-500/10 to-slate-900',
    border: 'border-amber-500/30 hover:border-amber-400',
    btnClass: 'bg-amber-500 text-slate-950 hover:bg-amber-400',
  },
  {
    id: 'awssysops',
    badge: 'AWS ASSOCIATE',
    title: 'AWS SysOps Administrator',
    fullName: 'AWS Certified SysOps Administrator - Associate',
    path: '/awssysops/quiz',
    questions: '랜덤 20문항',
    duration: '30분',
    passCut: '70% (14문항)',
    features: ['매 응시마다 보기(A~D) 자동 셔플', '클라우드 운영·모니터링·보안 기출', '오답노트 자동 수집 지원'],
    gradient: 'from-indigo-500/20 via-cyan-500/10 to-slate-900',
    border: 'border-indigo-500/30 hover:border-indigo-400',
    btnClass: 'bg-indigo-500 text-white hover:bg-indigo-400',
  },
];

const LINUX_EXAMS = [
  { text: '2020년 제 1회 기출', sub: '100문항 · 100분', pdf: 'linux1.pdf' },
  { text: '2020년 제 2회 기출', sub: '100문항 · 100분', pdf: 'linux2.pdf' },
  { text: '2022년 정기 기출', sub: '100문항 · 100분', pdf: 'linux3.pdf' },
  { text: '2023년 정기 기출', sub: '100문항 · 100분', pdf: 'linux4.pdf' },
];

const NETWORK_EXAMS = [
  { text: '2024년 8월 25일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20240825(학생용).pdf' },
  { text: '2024년 5월 19일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20240519(학생용).pdf' },
  { text: '2024년 2월 25일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20240225(학생용).pdf' },
  { text: '2023년 11월 5일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20231105(학생용).pdf' },
  { text: '2023년 8월 20일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20230820(학생용).pdf' },
  { text: '2023년 5월 21일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20230521(학생용).pdf' },
  { text: '2023년 2월 26일 기출', sub: '50문항 · 60분', pdf: '네트워크관리사2급20230226(학생용).pdf' },
];

function HomePage() {
  const attempts = getAttemptHistory();
  const wrongNotes = getWrongNotes();

  return (
    <div className="mx-auto max-w-7xl px-4 pb-20 pt-10 sm:px-6 space-y-12">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-3xl border border-slate-800 bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950/60 p-8 sm:p-10 shadow-2xl">
        <div className="flex flex-col justify-between gap-6 lg:flex-row lg:items-center">
          <div className="max-w-2xl">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 px-3.5 py-1 text-xs font-bold text-indigo-300">
              <Sparkles className="h-3.5 w-3.5" />
              MULTI-CLOUD SERVERLESS CBT PLATFORM
            </span>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-white sm:text-4xl">
              클라우드 & 국가공인 IT 자격증 실전 CBT 모의고사
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-slate-300 sm:text-base">
              <strong className="text-indigo-300">AWS S3 + CloudFront</strong> 정적 CDN과{' '}
              <strong className="text-amber-300">AWS Lambda (Python)</strong> 서버리스 연산,{' '}
              <strong className="text-emerald-300">MongoDB Atlas</strong> 문서형 문제 은행을 결합하여
              인프라 유휴 비용 $0로 동작하는 고성능 CBT 환경입니다.
            </p>

            <div className="mt-5 flex flex-wrap items-center gap-2.5 text-xs text-slate-300">
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <Keyboard className="h-3.5 w-3.5 text-indigo-400" />
                키보드 빠른 마킹 (1~4 / A~D)
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <Shuffle className="h-3.5 w-3.5 text-amber-400" />
                문제 & 선택지 실시간 셔플
              </span>
              <span className="inline-flex items-center gap-1.5 rounded-xl border border-slate-800 bg-slate-950/80 px-3 py-1.5">
                <BookOpen className="h-3.5 w-3.5 text-rose-400" />
                틀린 문제 오답노트 자동 저장
              </span>
            </div>
          </div>

          {/* Quick Local Stats Widget */}
          <div className="flex shrink-0 flex-col gap-3 rounded-2xl border border-slate-800 bg-slate-950/85 p-5 sm:min-w-[260px]">
            <div className="text-xs font-bold uppercase tracking-wider text-slate-400">
              My Study Status
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <div className="text-[11px] text-slate-400">누적 응시</div>
                <div className="mt-0.5 text-2xl font-black text-white">{attempts.length}회</div>
              </div>
              <div className="rounded-xl border border-slate-800 bg-slate-900 p-3">
                <div className="text-[11px] text-slate-400">오답노트</div>
                <div className="mt-0.5 text-2xl font-black text-rose-400">{wrongNotes.length}문항</div>
              </div>
            </div>
            <Link
              to="/history"
              className="inline-flex items-center justify-between rounded-xl border border-indigo-500/30 bg-indigo-500/15 px-3.5 py-2 text-xs font-bold text-indigo-300 transition hover:bg-indigo-500 hover:text-white"
            >
              <span>오답노트 복습 & 성적표 보기</span>
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* Section 1: Cloud Certification 4-Choice CBT (NCA, AWS SAA, AWS SysOps) */}
      <section className="space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <Cloud className="h-6 w-6 text-indigo-400" />
            <div>
              <h2 className="text-xl font-extrabold text-white">
                클라우드 자격증 객관식 CBT (NCA · AWS)
              </h2>
              <p className="text-xs text-slate-400">
                MongoDB Atlas `$sample` 파이프라인에서 매 회차 20문항을 실시간 랜덤 추출합니다.
              </p>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
          {CLOUD_EXAMS.map((exam) => (
            <div
              key={exam.id}
              className={`flex flex-col justify-between rounded-3xl border bg-gradient-to-b ${exam.gradient} ${exam.border} p-6 shadow-xl transition`}
            >
              <div>
                <div className="flex items-center justify-between">
                  <span className="rounded-full border border-white/15 bg-slate-950/60 px-3 py-0.5 text-[11px] font-extrabold text-slate-200">
                    {exam.badge}
                  </span>
                  <span className="inline-flex items-center gap-1 text-xs font-semibold text-slate-300">
                    <Clock className="h-3.5 w-3.5" /> {exam.duration}
                  </span>
                </div>

                <h3 className="mt-4 text-xl font-extrabold text-white">{exam.title}</h3>
                <p className="mt-1 text-xs text-slate-400">{exam.fullName}</p>

                <div className="mt-4 flex items-center gap-3 rounded-2xl border border-slate-800/80 bg-slate-950/70 px-3.5 py-2.5 text-xs">
                  <div>
                    <span className="text-slate-400">문항 수:</span>{' '}
                    <strong className="text-white">{exam.questions}</strong>
                  </div>
                  <div className="h-3 w-px bg-slate-800" />
                  <div>
                    <span className="text-slate-400">합격 기준:</span>{' '}
                    <strong className="text-emerald-300">{exam.passCut}</strong>
                  </div>
                </div>

                <ul className="mt-4 space-y-1.5 text-xs text-slate-300">
                  {exam.features.map((f) => (
                    <li key={f} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-indigo-400" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
              </div>

              <Link
                to={exam.path}
                className={`mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-3.5 text-sm font-extrabold shadow-lg transition ${exam.btnClass}`}
              >
                <span>실전 모의고사 시작하기</span>
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Section 2: PDF + OMR Split-Screen Exams (Linux 1급 & 네트워크관리사 2급) */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Linux Master Level 1 (4 Exams) */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 sm:p-7 lg:col-span-5 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                <Terminal className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  리눅스 마스터 1급 기출 (4회분)
                </h2>
                <p className="text-xs text-slate-400">
                  좌측 원본 시험지 PDF + 우측 키보드 OMR 답안지 동시 제공
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {LINUX_EXAMS.map((item) => (
                <Link
                  key={item.pdf}
                  to={`/view_pdf/${item.pdf}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-emerald-500/50 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <FileText className="h-4 w-4 text-emerald-400" />
                    <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-emerald-300" />
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-bold text-white group-hover:text-emerald-300">
                      {item.text}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
            💡 숫자키 <strong className="text-emerald-300">1 ~ 4</strong>만 누르면 마우스 클릭 없이 100문항을 빠르게 마킹할 수 있습니다.
          </div>
        </section>

        {/* Network Advisor Level 2 (7 Exams) */}
        <section className="rounded-3xl border border-slate-800 bg-slate-900/75 p-6 sm:p-7 lg:col-span-7 flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-purple-500/15 text-purple-400 border border-purple-500/30">
                <Network className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-white">
                  네트워크 관리사 2급 기출문제 (7회분)
                </h2>
                <p className="text-xs text-slate-400">
                  2023년 ~ 2024년 최신 기출 PDF 뷰어 & 50문항 실시간 자동 채점
                </p>
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-2 md:grid-cols-3">
              {NETWORK_EXAMS.map((item) => (
                <Link
                  key={item.pdf}
                  to={`/view_pdf/${item.pdf}`}
                  className="group flex flex-col justify-between rounded-2xl border border-slate-800 bg-slate-950/80 p-4 transition hover:border-purple-500/50 hover:bg-slate-900"
                >
                  <div className="flex items-center justify-between">
                    <Cpu className="h-4 w-4 text-purple-400" />
                    <ChevronRight className="h-4 w-4 text-slate-500 transition group-hover:translate-x-0.5 group-hover:text-purple-300" />
                  </div>
                  <div className="mt-3">
                    <div className="text-sm font-bold text-white group-hover:text-purple-300">
                      {item.text}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-400">{item.sub}</div>
                  </div>
                </Link>
              ))}
            </div>
          </div>

          <div className="mt-5 rounded-2xl border border-slate-800 bg-slate-950/60 px-4 py-3 text-xs text-slate-400">
            ⚡ 제출 즉시 AWS Lambda가 MongoDB Atlas 정답 맵과 대조하여 0.1초 내에 채점 리포트를 생성합니다.
          </div>
        </section>
      </div>
    </div>
  );
}

function App() {
  return (
    <Router>
      <div className="min-h-screen bg-slate-950 text-slate-100">
        <Navbar />
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/history" element={<HistoryNotePage />} />
          <Route path="/nca/quiz" element={<NCAQuiz />} />
          <Route path="/nca/result" element={<NCAResult />} />
          <Route path="/awssaa/quiz" element={<AWSQuiz />} />
          <Route path="/awssaa/result" element={<AWSResult />} />
          <Route path="/awssysops/quiz" element={<AWSSysOpsQuiz />} />
          <Route path="/awssysops/result" element={<AWSSysOpsResult />} />
          <Route path="/view_pdf/:filename" element={<PDFViewer />} />
          <Route path="/linux/result/:filename" element={<LinuxResult />} />
          <Route path="/network/result/:filename" element={<NetworkResult />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
