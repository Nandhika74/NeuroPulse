import React from 'react';
import { ShieldAlert, Database, Upload, RefreshCw, CheckCircle2, Sparkles, FileText, FlaskConical, Home, LayoutDashboard } from 'lucide-react';
import { PipelineOutput } from '../types';

interface HeaderProps {
  pipelineData: PipelineOutput | null;
  onOpenUpload: () => void;
  onLoadSynthetic: () => void;
  onResetOasis: () => void;
  onRunEvaluation: () => void;
  onOpenSanityTests: () => void;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isLoading: boolean;
}

export const Header: React.FC<HeaderProps> = ({
  pipelineData,
  onOpenUpload,
  onLoadSynthetic,
  onResetOasis,
  onRunEvaluation,
  onOpenSanityTests,
  activeTab,
  setActiveTab,
  isLoading,
}) => {
  const isSynthetic = pipelineData?.isSyntheticData ?? false;

  return (
    <header className="bg-[#0F172A] text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
      {/* Top Banner: Research Honesty & Non-Diagnostic Mandate */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 sm:px-6 py-1.5 text-xs text-slate-300 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 font-medium">
          <ShieldAlert className="w-3.5 h-3.5 text-amber-400 shrink-0" />
          <span className="text-slate-200">
            <strong className="text-slate-100">Research prototype.</strong> Not for clinical diagnosis or medical decision-making. Prioritizes diagnostic review ordering.
          </span>
        </div>
        <div className="hidden md:flex items-center gap-3 text-slate-400 font-mono text-[10px]">
          <span>Dataset: {isSynthetic ? 'Synthetic Demo' : 'OASIS-2 (Longitudinal)'}</span>
          <span>•</span>
          <span>Seed: 42</span>
          <span>•</span>
          <span>Norm: Mungas/Pedraza</span>
        </div>
      </div>

      {/* Main Header Bar */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
        <button
          onClick={() => setActiveTab('landing')}
          className="flex items-center gap-3 text-left group cursor-pointer focus:outline-none"
          title="Return to Landing Page"
        >
          <div className="w-8 h-8 bg-teal-500 group-hover:bg-teal-400 rounded flex items-center justify-center font-bold text-base text-white shadow-sm transition-colors">
            N
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-lg font-semibold tracking-tight text-white flex items-center gap-1.5 group-hover:text-teal-200 transition-colors">
                NeuroPulse <span className="text-teal-400 font-light italic text-xs">v1.0.4</span>
              </h1>
              <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-teal-950/80 border border-teal-600/60 text-teal-300">
                Cognitive Triage
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Explainable, education-adjusted patient referral-prioritization dashboard
            </p>
          </div>
        </button>

        {/* Dataset Provenance & Action Buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Data Source Badge */}
          <div
            id="data-source-badge"
            className={`flex items-center gap-1.5 px-2.5 py-1 rounded text-[11px] font-medium border ${
              isSynthetic
                ? 'bg-amber-950/50 border-amber-600/50 text-amber-300'
                : 'bg-teal-950/60 border-teal-600/50 text-teal-300'
            }`}
            title={isSynthetic ? 'Synthetic fallback dataset loaded' : 'Real OASIS-2 longitudinal cohort loaded'}
          >
            <Database className="w-3 h-3 text-teal-400" />
            <span className="font-mono">
              {isSynthetic ? 'Synthetic Demo' : 'OASIS-2 Real'}
            </span>
            <span className="text-[10px] text-slate-400 font-mono">
              ({pipelineData?.results.length ?? 0} pts)
            </span>
          </div>

          {/* Action Buttons */}
          <button
            id="btn-upload-csv"
            onClick={onOpenUpload}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-sm transition-colors cursor-pointer"
          >
            <Upload className="w-3 h-3" />
            <span>Upload CSV</span>
          </button>

          <button
            id="btn-load-synthetic"
            onClick={onLoadSynthetic}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Generate fresh synthetic cohort"
          >
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="hidden sm:inline">Synthetic Demo</span>
          </button>

          <button
            id="btn-reset-oasis"
            onClick={onResetOasis}
            disabled={isLoading}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white text-xs font-medium border border-slate-700 transition-colors cursor-pointer disabled:opacity-50"
            title="Reset to bundled OASIS-2 longitudinal dataset"
          >
            <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
            <span className="hidden sm:inline">Reset OASIS-2</span>
          </button>

          <button
            id="btn-open-sanity"
            onClick={onOpenSanityTests}
            className="flex items-center gap-1 px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-emerald-300 text-xs font-medium border border-emerald-800/70 hover:border-emerald-600 transition-colors cursor-pointer"
            title="Run verification sanity suite"
          >
            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
            <span>Sanity Tests</span>
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 flex items-center gap-1 overflow-x-auto border-t border-slate-800/80 pt-0.5 text-xs">
        <button
          id="nav-tab-landing"
          onClick={() => setActiveTab('landing')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
            activeTab === 'landing'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Home className="w-3.5 h-3.5 text-teal-400" />
          <span>Landing Overview</span>
        </button>

        <button
          id="nav-tab-triage"
          onClick={() => setActiveTab('triage')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
            activeTab === 'triage'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <LayoutDashboard className="w-3.5 h-3.5" />
          <span>Patient Prioritization Queue</span>
        </button>

        <button
          id="nav-tab-evaluation"
          onClick={() => setActiveTab('evaluation')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
            activeTab === 'evaluation'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
          <span>Live Held-Out Evaluation (AUC: {pipelineData?.evaluation?.auc !== undefined ? pipelineData.evaluation.auc.toFixed(3) : '...'})</span>
        </button>

        <button
          id="nav-tab-architecture"
          onClick={() => setActiveTab('architecture')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
            activeTab === 'architecture'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FlaskConical className="w-3.5 h-3.5 text-indigo-400" />
          <span>Architecture & Math</span>
        </button>

        <button
          id="nav-tab-references"
          onClick={() => setActiveTab('references')}
          className={`px-3 py-1.5 font-medium border-b-2 transition-colors cursor-pointer whitespace-nowrap flex items-center gap-1.5 text-xs ${
            activeTab === 'references'
              ? 'border-teal-400 text-teal-300 bg-slate-800/60 font-semibold'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5 text-amber-400" />
          <span>Research Citations</span>
        </button>
      </div>
    </header>
  );
};
