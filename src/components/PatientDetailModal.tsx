import React, { useState } from 'react';
import {
  X,
  Sparkles,
  Bot,
  Brain,
  Layers,
  Clock,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Scale,
  ShieldCheck,
  TrendingDown,
  Info,
  Calendar,
  FileText,
  Zap,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { TriageResult } from '../types';

interface PatientDetailModalProps {
  patientResult: TriageResult | null;
  onClose: () => void;
}

export const PatientDetailModal: React.FC<PatientDetailModalProps> = ({
  patientResult,
  onClose,
}) => {
  const [aiExplanation, setAiExplanation] = useState<string | null>(null);
  const [isGeneratingAi, setIsGeneratingAi] = useState<boolean>(false);
  const [aiError, setAiError] = useState<string | null>(null);

  if (!patientResult) return null;

  const { patient, stage1, stage2, stage3, stage4 } = patientResult;

  // Prepare chart data for longitudinal trajectory
  const chartData = patient.visits.map(v => ({
    visitLabel: `Visit ${v.visit} (yr ${v.mrDelayYears.toFixed(1)})`,
    visit: v.visit,
    years: v.mrDelayYears,
    age: v.age,
    mmse: v.mmse,
    nwbv: Math.round(v.nwbv * 1000) / 1000,
    cdr: v.cdr,
    expectedMmse: stage1.expectedMmse,
  }));

  const handleGenerateGeminiNarrative = async () => {
    setIsGeneratingAi(true);
    setAiError(null);
    try {
      const res = await fetch('/api/explain', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          patientData: patientResult,
          reasoningString: patientResult.reasoningString,
        }),
      });
      const data = await res.json();
      if (data.explanation) {
        setAiExplanation(data.explanation);
      } else if (data.error) {
        setAiError(data.error);
      }
    } catch (err: any) {
      setAiError(err.message || 'Failed to generate AI synthesis');
    } finally {
      setIsGeneratingAi(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        id="patient-detail-modal"
        className="bg-white border border-slate-200 rounded-xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Modal Header */}
        <div className="p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded bg-purple-100 border border-purple-200 flex items-center justify-center text-purple-700 font-mono font-bold text-sm">
              #{patientResult.priorityRank ?? '-'}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-bold text-slate-900 font-mono">{patientResult.subjectId}</h2>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                    patientResult.clinicalRiskTier === 'High'
                      ? 'bg-amber-100/90 text-amber-900 border border-amber-300'
                      : patientResult.clinicalRiskTier === 'Medium'
                      ? 'bg-stone-100 text-stone-700 border border-stone-300'
                      : 'bg-teal-50 text-teal-700 border border-teal-200'
                  }`}
                >
                  {patientResult.clinicalRiskTier} Risk Tier
                </span>
                <span
                  className={`text-[10px] px-2 py-0.5 rounded ${
                    patientResult.isHeldOut
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                      : 'bg-slate-100 text-slate-600 border border-slate-200'
                  }`}
                >
                  {patientResult.isHeldOut ? 'Held-Out Test' : 'Design Norming'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                {patient.latestAge} yrs old • {patient.gender === 'F' ? 'Female' : 'Male'} • {patient.educ} yrs educ (SES {patient.ses ?? 'N/A'}) • Group: {patient.group} • {patient.visits.length} Longitudinal Visits
              </p>
            </div>
          </div>

          <button
            id="btn-close-modal"
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 overflow-y-auto space-y-4 text-xs flex-1">
          {/* Dual Score Highlight Card: Clinical Risk vs Priority Rank */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {/* Clinical Risk */}
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-amber-900 font-semibold">
                  <Activity className="w-4 h-4 text-amber-700" />
                  <span>Clinical Risk (Severity Snapshot)</span>
                </div>
                <span className="text-[10px] text-teal-700 font-mono font-semibold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
                  Real Data Driven
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold font-mono text-slate-800">
                  {patientResult.clinicalRiskScore}%
                </span>
                <span className="text-xs text-slate-500">
                  (Tier: <strong className="text-slate-700">{patientResult.clinicalRiskTier}</strong>)
                </span>
              </div>
              <p className="text-[11px] text-slate-500 leading-tight">
                Derived from MMSE education-adjusted deficit (residual z = {stage1.residualZ.toFixed(2)}) and structural brain atrophy level.
              </p>
            </div>

            {/* Priority Rank & Multiplicative Formula */}
            <div className="bg-purple-50/70 border border-purple-200 rounded-lg p-3.5 flex flex-col justify-between">
              <div className="flex items-center justify-between mb-1.5">
                <div className="flex items-center gap-1.5 text-purple-700 font-semibold">
                  <Zap className="w-4 h-4 text-purple-600" />
                  <span>Priority Rank & Score (Referral Order)</span>
                </div>
                <span className="text-[10px] text-purple-700 font-mono font-bold bg-purple-100 px-1.5 py-0.5 rounded border border-purple-200">
                  Rank #{patientResult.priorityRank ?? '-'}
                </span>
              </div>
              <div className="flex items-baseline gap-2 mb-1">
                <span className="text-2xl font-bold font-mono text-purple-800">
                  {patientResult.priorityScore.toFixed(2)}
                </span>
                <span className="text-[11px] text-purple-700 font-mono font-semibold">
                  = Severity ({patientResult.severityComponent.toFixed(2)}) × Urgency ({patientResult.urgencyComponent.toFixed(2)})
                </span>
              </div>
              <p className="text-[11px] text-slate-600 leading-tight">
                Multiplicative model: Prioritizes rapid disease progression so rapidly declining mild cases outrank stable chronic cases.
              </p>
            </div>
          </div>

          {/* Explainability & Gemini AI Synthesis Section */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Brain className="w-4 h-4 text-teal-600" />
                <h3 className="font-semibold text-slate-800 text-sm">Explainability & Clinical Reasoning</h3>
              </div>

              <button
                id="btn-gemini-explain"
                onClick={handleGenerateGeminiNarrative}
                disabled={isGeneratingAi}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
              >
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{isGeneratingAi ? 'Synthesizing with Gemini...' : 'Generate Clinician Narrative (AI)'}</span>
              </button>
            </div>

            {/* Deterministic Rule-Based Reasoning */}
            <div className="bg-white rounded p-3 border border-slate-200">
              <div className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 mb-1 flex items-center gap-1">
                <Info className="w-3 h-3 text-teal-600" />
                <span>Deterministic Computed Flags (Source of Truth)</span>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed font-mono">
                {patientResult.reasoningString}
              </p>
            </div>

            {/* AI Generated Clinician Narrative */}
            {aiExplanation && (
              <div className="bg-teal-50 border border-teal-200 rounded p-3">
                <div className="flex items-center justify-between text-[11px] font-semibold text-teal-800 mb-1.5">
                  <div className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-teal-600" />
                    <span>Gemini Decision-Support Synthesis</span>
                  </div>
                  <span className="text-[10px] text-teal-700 font-mono">gemini-3.7-flash</span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed">
                  {aiExplanation}
                </p>
              </div>
            )}

            {aiError && (
              <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs">
                {aiError}
              </div>
            )}
          </div>

          {/* Longitudinal Trajectory Charts (MMSE and nWBV over visits) */}
          {patient.visits.length >= 2 ? (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-teal-600" />
                  <h3 className="font-semibold text-slate-800 text-sm">Longitudinal Trajectory across Visits</h3>
                </div>
                <div className="flex items-center gap-3 text-[11px]">
                  <span className="text-teal-700 font-mono font-semibold">
                    MMSE Slope: {patient.mmseSlope >= 0 ? `+${patient.mmseSlope.toFixed(2)}` : patient.mmseSlope.toFixed(2)} pts/yr
                  </span>
                  <span className="text-purple-700 font-mono font-semibold">
                    nWBV Slope: {patient.nwbvSlope.toFixed(4)}/yr
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {/* MMSE Trajectory Chart */}
                <div className="bg-white rounded p-3 border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Cognitive Score (MMSE) vs Expected Norm</h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="visitLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis domain={[10, 30]} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '6px', fontSize: '11px', color: '#1e293b' }}
                        />
                        <ReferenceLine y={stage1.expectedMmse} label={{ value: 'Expected Norm', fill: '#0d9488', fontSize: 10 }} stroke="#0d9488" strokeDasharray="4 4" />
                        <Line type="monotone" dataKey="mmse" stroke="#0284c7" strokeWidth={2} dot={{ r: 3.5, fill: '#0284c7' }} name="Observed MMSE" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* nWBV Brain Volume Chart */}
                <div className="bg-white rounded p-3 border border-slate-200">
                  <h4 className="text-xs font-semibold text-slate-700 mb-2">Normalized Whole-Brain Volume (nWBV)</h4>
                  <div className="h-44 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                        <XAxis dataKey="visitLabel" stroke="#64748b" tick={{ fontSize: 10 }} />
                        <YAxis domain={['auto', 'auto']} stroke="#64748b" tick={{ fontSize: 10 }} />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '6px', fontSize: '11px', color: '#1e293b' }}
                        />
                        <Line type="monotone" dataKey="nwbv" stroke="#7c3aed" strokeWidth={2} dot={{ r: 3.5, fill: '#7c3aed' }} name="nWBV Volume" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-500 text-xs flex items-center gap-2">
              <Info className="w-4 h-4 text-slate-400" />
              <span>Single baseline visit record available — slope checks utilize baseline residual norming.</span>
            </div>
          )}

          {/* Real vs Simulated Data Field Provenance */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">Data Provenance Breakdown</h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Real Data Block */}
              <div className="p-3 rounded bg-teal-50 border border-teal-200 space-y-1.5">
                <div className="flex items-center justify-between text-teal-800 font-semibold text-xs">
                  <span>Real OASIS-2 Dataset Fields</span>
                  <span className="text-[10px] bg-teal-100 text-teal-700 px-1.5 py-0.2 rounded border border-teal-300 font-bold font-mono">
                    REAL DATA
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700 font-mono">
                  <div>Observed MMSE: <strong className="text-slate-900">{patient.latestMmse} / 30</strong></div>
                  <div>Subject Age / EDUC: <strong className="text-slate-900">{patient.latestAge}yo, {patient.educ} yrs</strong></div>
                  <div>nWBV Brain Volume: <strong className="text-slate-900">{patient.latestNwbv}</strong></div>
                  <div>Longitudinal nWBV Slope: <strong className="text-slate-900">{patient.nwbvSlope.toFixed(4)}/yr</strong></div>
                  <div>Ground-Truth CDR: <strong className="text-slate-900">{patient.latestCdr} ({patient.group})</strong></div>
                </div>
              </div>

              {/* Simulated Data Block */}
              <div className="p-3 rounded bg-orange-50 border border-orange-200 space-y-1.5">
                <div className="flex items-center justify-between text-orange-800 font-semibold text-xs">
                  <span>Simulated Research Demonstrations</span>
                  <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.2 rounded border border-orange-300 font-bold font-mono">
                    SIMULATED
                  </span>
                </div>
                <div className="space-y-1 text-[11px] text-slate-700 font-mono">
                  <div>
                    Plasma pTau217:{' '}
                    <strong className="text-slate-900">
                      {stage2 ? `${stage2.biomarkers.pTau217Zone} (${stage2.biomarkers.pTau217Value} pg/mL)` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    Plasma Aβ42/40 Ratio:{' '}
                    <strong className="text-slate-900">
                      {stage2 ? `${stage2.biomarkers.amyloidRatioZone} (${stage2.biomarkers.amyloidRatioValue})` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    Biomarker Concern Score:{' '}
                    <strong className="text-slate-900">
                      {stage2 ? `${(stage2.biomarkers.biomarkerConcernScore * 100).toFixed(0)}%` : 'N/A'}
                    </strong>
                  </div>
                  <div>
                    Confirmatory Referral Eligible:{' '}
                    <strong className="text-slate-900">
                      {stage4?.eligibleForConfirmatory ? 'Yes (Referral Suggested)' : 'No'}
                    </strong>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 4-Stage Step-by-Step Audit Trail */}
          <div className="bg-slate-50 border border-slate-200 rounded-lg p-3.5 space-y-3">
            <h3 className="font-semibold text-slate-800 text-sm">4-Stage Pipeline Audit Trail</h3>
            <div className="space-y-2">
              {patientResult.auditTrail.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2.5 rounded bg-white border border-slate-200 flex items-start gap-2 text-xs"
                >
                  <span className="w-5 h-5 rounded bg-slate-100 flex items-center justify-center text-[10px] font-mono font-bold text-slate-600 shrink-0 mt-0.5 border border-slate-200">
                    {idx + 1}
                  </span>
                  <div className="flex-1">
                    <div className="flex items-center justify-between gap-2">
                      <span className="font-semibold text-slate-800">{item.stage}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                          item.isSimulated
                            ? 'bg-orange-50 text-orange-700 border border-orange-200'
                            : 'bg-teal-50 text-teal-700 border border-teal-200'
                        }`}
                      >
                        {item.isSimulated ? 'Simulated' : 'Real OASIS-2'}
                      </span>
                    </div>
                    <p className="text-slate-700 mt-0.5 font-medium">{item.action}</p>
                    <p className="text-slate-500 text-[11px] mt-0.5 font-sans italic">{item.reason}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Decision support prototype for diagnostic evaluation routing only.</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors cursor-pointer shadow-xs"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
