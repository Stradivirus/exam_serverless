import React, { useEffect, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import {
  BookOpen,
  Cloud,
  Database,
  History,
  Home,
  Zap,
  RefreshCw,
} from 'lucide-react';
import { checkLambdaStatus } from '../api/examApi';
import { getWrongNotes } from '../utils/examStorage';

const Navbar: React.FC = () => {
  const location = useLocation();
  const [lambdaInfo, setLambdaInfo] = useState<{ online: boolean; latencyMs: number }>({
    online: true,
    latencyMs: 45,
  });
  const [checking, setChecking] = useState(false);
  const [wrongCount, setWrongCount] = useState(0);

  const pingLambda = async () => {
    setChecking(true);
    const status = await checkLambdaStatus();
    setLambdaInfo(status);
    setTimeout(() => setChecking(false), 250);
  };

  useEffect(() => {
    setWrongCount(getWrongNotes().length);
  }, [location.pathname]);

  useEffect(() => {
    pingLambda();
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-slate-800/80 bg-slate-950/85 backdrop-blur-md">
      {/* Top Multi-Cloud Serverless Telemetry Bar */}
      <div className="border-b border-indigo-500/15 bg-slate-900/90 px-4 py-1.5 text-xs">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/10 px-2.5 py-0.5 font-medium text-emerald-300">
              <span className="h-2 w-2 animate-pulse rounded-full bg-emerald-400" />
              Multi-Cloud Serverless: <strong className="text-white">AWS S3 · CloudFront</strong>
            </span>
            <span className="hidden items-center gap-1.5 text-slate-300 sm:inline-flex">
              <Zap className="h-3.5 w-3.5 text-amber-400" />
              Compute: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-amber-300">AWS Lambda (Python)</code>
            </span>
            <span className="hidden items-center gap-1.5 text-slate-300 md:inline-flex">
              <Database className="h-3.5 w-3.5 text-emerald-400" />
              NoSQL Pool: <code className="rounded bg-slate-800 px-1.5 py-0.5 text-emerald-300">MongoDB Atlas</code>
              {lambdaInfo.latencyMs > 0 && (
                <span className="text-slate-400">({lambdaInfo.latencyMs}ms)</span>
              )}
            </span>
          </div>

          <button
            type="button"
            onClick={pingLambda}
            className="inline-flex items-center gap-1.5 rounded-md border border-slate-700 bg-slate-800/90 px-2.5 py-0.5 text-xs font-medium text-slate-200 transition hover:border-indigo-400/50 hover:text-indigo-300"
          >
            <RefreshCw className={`h-3 w-3 ${checking ? 'animate-spin text-indigo-400' : ''}`} />
            <span>Lambda 상태 확인</span>
          </button>
        </div>
      </div>

      {/* Main Nav */}
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
        <Link to="/" className="group flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-indigo-500 to-cyan-500 text-white shadow-lg shadow-indigo-500/20 transition group-hover:scale-105">
            <Cloud className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-extrabold tracking-tight text-white group-hover:text-indigo-300 transition">
                Serverless CBT
              </span>
              <span className="rounded-full border border-indigo-500/30 bg-indigo-500/15 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-indigo-300">
                Multi-Cloud
              </span>
            </div>
            <p className="text-xs text-slate-400">
              클라우드(NCA · AWS) & 국가공인(리눅스 · 네트워크) 실전 모의고사 플랫폼
            </p>
          </div>
        </Link>

        <nav className="flex items-center gap-2">
          <Link
            to="/"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              location.pathname === '/'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'text-slate-300 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <Home className="h-4 w-4" />
            <span>과목 선택</span>
          </Link>

          <Link
            to="/history"
            className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              location.pathname === '/history'
                ? 'bg-indigo-500 text-white shadow-md shadow-indigo-500/25'
                : 'border border-slate-800 bg-slate-900/80 text-slate-300 hover:border-slate-700 hover:bg-slate-800 hover:text-white'
            }`}
          >
            <History className="h-4 w-4 text-indigo-400" />
            <span>오답노트 · 응시이력</span>
            {wrongCount > 0 && (
              <span className="rounded-full bg-rose-500/20 border border-rose-500/40 px-1.5 py-0.5 text-[10px] font-bold text-rose-300">
                {wrongCount}
              </span>
            )}
          </Link>
        </nav>
      </div>
    </header>
  );
};

export default Navbar;
