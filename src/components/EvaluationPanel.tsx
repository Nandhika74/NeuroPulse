import React, { useState } from 'react';
import {
  CheckCircle2,
  RefreshCw,
  Clock,
  ShieldAlert,
  BarChart3,
  TrendingUp,
  Award,
  HelpCircle,
  Cpu,
} from 'lucide-react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts';
import { EvaluationMetrics } from '../types';

interface EvaluationPanelProps {
  evaluation: EvaluationMetrics;
  onRecompute: () => void;
  isRecomputing: boolean;
}

export const EvaluationPanel: React.FC<EvaluationPanelProps> = ({
  evaluation,
  onRecompute,
  isRecomputing,
}) => {
  return (
    <div className="space-y-4">
      {/* Top Banner explaining Held-Out Protocol */}
      <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <div>
            <div className="flex items-center gap-2">
              <Award className="w-4 h-4 text-teal-600" />
              <h2 className="text-sm font-bold text-slate-900">Live Held-Out Evaluation Ledger</h2>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 font-mono">
                ZERO HARDCODED METRICS
              </span>
            </div>
            <p className="text-xs text-slate-600 mt-1 leading-relaxed max-w-3xl">
              All metrics below are computed dynamically at request time via <code className="text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 font-mono">evaluateOnHeldOut()</code> on strictly held-out OASIS-2 subjects (~30% split, fixed seed 42). Subjects in the held-out partition were never seen during regression norm fitting or threshold tuning.
            </p>
          </div>

          <button
            id="btn-recompute-eval"
            onClick={onRecompute}
            disabled={isRecomputing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold shadow-xs transition-colors cursor-pointer disabled:opacity-50 shrink-0 self-start md:self-auto"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRecomputing ? 'animate-spin' : ''}`} />
            <span>Re-run Held-Out Evaluation</span>
          </button>
        </div>

        <div className="flex items-center gap-3 mt-3 pt-2.5 border-t border-slate-100 text-xs text-slate-500">
          <div className="flex items-center gap-1 font-mono">
            <Clock className="w-3.5 h-3.5 text-teal-600" />
            <span>Evaluated At: {new Date(evaluation.evaluatedAt).toLocaleTimeString()}</span>
          </div>
          <span>•</span>
          <div>
            Held-Out Subjects: <strong className="text-slate-800 font-mono">{evaluation.heldOutCount}</strong> (Design Cohort: <span className="text-slate-600 font-mono">{evaluation.designCount}</span>)
          </div>
        </div>
      </div>

      {/* Key Metric Scorecards Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3">
        {/* Area Under ROC Curve (AUC) */}
        <div className="bg-teal-50/60 border border-teal-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-teal-700 uppercase tracking-wider mb-1">
            Held-Out AUC
          </div>
          <div className="text-2xl font-bold font-mono text-teal-900 mb-0.5">
            {evaluation.auc.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500">
            Trapezoidal ROC integration
          </div>
        </div>

        {/* Sensitivity (Recall) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Sensitivity (Recall)
          </div>
          <div className="text-2xl font-bold font-mono text-emerald-600 mb-0.5">
            {(evaluation.sensitivity * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">
            {evaluation.truePositives} / {evaluation.truePositives + evaluation.falseNegatives} true positives caught
          </div>
        </div>

        {/* Specificity */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Specificity
          </div>
          <div className="text-2xl font-bold font-mono text-teal-600 mb-0.5">
            {(evaluation.specificity * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">
            {evaluation.trueNegatives} / {evaluation.trueNegatives + evaluation.falsePositives} true negatives cleared
          </div>
        </div>

        {/* Precision (PPV) */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Precision (PPV)
          </div>
          <div className="text-2xl font-bold font-mono text-purple-600 mb-0.5">
            {(evaluation.precision * 100).toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500">
            Positive predictive value
          </div>
        </div>

        {/* F1 Score */}
        <div className="bg-white border border-slate-200 rounded-lg p-3.5 shadow-2xs flex flex-col justify-between col-span-2 lg:col-span-1">
          <div className="text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            F1 Score
          </div>
          <div className="text-2xl font-bold font-mono text-orange-600 mb-0.5">
            {evaluation.f1Score.toFixed(3)}
          </div>
          <div className="text-[10px] text-slate-500">
            Harmonic mean of Sens & Prec
          </div>
        </div>
      </div>

      {/* Confusion Matrix & ROC Curve Visualization */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Confusion Matrix Card */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Held-Out Confusion Ledger</h3>
            <span className="text-xs text-slate-500 font-mono">
              N = {evaluation.heldOutCount} Held-out Subjects
            </span>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            {/* True Positive */}
            <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
              <div className="text-xs font-semibold text-emerald-800 mb-0.5 flex items-center justify-between">
                <span>True Positive (TP)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-emerald-900 mb-0.5">
                {evaluation.truePositives}
              </div>
              <p className="text-[11px] text-emerald-700">
                Cognitive decline correctly flagged for priority referral review.
              </p>
            </div>

            {/* False Positive */}
            <div className="p-3 rounded-lg bg-slate-50 border border-slate-200">
              <div className="text-xs font-semibold text-slate-700 mb-0.5 flex items-center justify-between">
                <span>False Positive (FP)</span>
                <span className="text-[10px] text-slate-500">Type I error</span>
              </div>
              <div className="text-2xl font-bold font-mono text-slate-800 mb-0.5">
                {evaluation.falsePositives}
              </div>
              <p className="text-[11px] text-slate-500">
                Nondemented subject escalated to secondary review.
              </p>
            </div>

            {/* False Negative */}
            <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
              <div className="text-xs font-semibold text-rose-800 mb-0.5 flex items-center justify-between">
                <span>False Negative (FN)</span>
                <span className="text-[10px] text-rose-600 font-bold">Type II error</span>
              </div>
              <div className="text-2xl font-bold font-mono text-rose-900 mb-0.5">
                {evaluation.falseNegatives}
              </div>
              <p className="text-[11px] text-rose-700">
                Decline case missed or held (target of optimization).
              </p>
            </div>

            {/* True Negative */}
            <div className="p-3 rounded-lg bg-teal-50 border border-teal-200">
              <div className="text-xs font-semibold text-teal-800 mb-0.5 flex items-center justify-between">
                <span>True Negative (TN)</span>
                <CheckCircle2 className="w-3.5 h-3.5 text-teal-600" />
              </div>
              <div className="text-2xl font-bold font-mono text-teal-900 mb-0.5">
                {evaluation.trueNegatives}
              </div>
              <p className="text-[11px] text-teal-700">
                Healthy control correctly cleared at Stage 1 / Stage 2.
              </p>
            </div>
          </div>

          <p className="text-[11px] text-slate-500 italic">
            Ground truth defined by OASIS-2 longitudinal Clinical Dementia Rating (CDR ≥ 0.5 or Converted/Demented classification).
          </p>
        </div>

        {/* ROC Curve Chart */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-slate-800 text-xs uppercase tracking-wider">Receiver Operating Characteristic (ROC)</h3>
            <span className="text-xs font-mono text-teal-700 font-bold bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200">
              AUC = {evaluation.auc.toFixed(3)}
            </span>
          </div>

          <div className="h-56 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={evaluation.rocCurve} margin={{ top: 10, right: 20, left: -10, bottom: 10 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
                <XAxis
                  dataKey="fpr"
                  stroke="#64748b"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'False Positive Rate (1 - Specificity)', position: 'insideBottom', offset: -5, fontSize: 10, fill: '#64748b' }}
                />
                <YAxis
                  dataKey="tpr"
                  stroke="#64748b"
                  type="number"
                  domain={[0, 1]}
                  tick={{ fontSize: 10 }}
                  label={{ value: 'True Positive Rate (Sensitivity)', angle: -90, position: 'insideLeft', fontSize: 10, fill: '#64748b' }}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#ffffff', borderColor: '#cbd5e1', borderRadius: '6px', fontSize: '11px', color: '#1e293b' }}
                />
                {/* Diagonal Chance line */}
                <Line
                  type="monotone"
                  dataKey="fpr"
                  stroke="#94a3b8"
                  strokeDasharray="4 4"
                  dot={false}
                  name="Random Chance (AUC 0.50)"
                />
                {/* Empirical ROC Curve */}
                <Line
                  type="monotone"
                  dataKey="tpr"
                  stroke="#0d9488"
                  strokeWidth={2.5}
                  dot={{ r: 3, fill: '#0d9488' }}
                  name="NeuroPulse Triage Model"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="text-[10px] text-slate-400 text-center">
            Computed by dynamic threshold sweeping across patient Priority & Clinical Risk distribution.
          </p>
        </div>
      </div>
    </div>
  );
};
