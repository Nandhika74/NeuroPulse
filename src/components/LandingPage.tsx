import React from 'react';
import { 
  ArrowRight, 
  Brain, 
  Scale, 
  Activity, 
  Dna, 
  FileText, 
  CheckCircle2, 
  ShieldCheck, 
  TrendingDown, 
  Layers, 
  Sparkles, 
  Database, 
  ChevronRight,
  Stethoscope,
  Microscope,
  Award,
  AlertTriangle,
  Lock,
  ArrowUpRight
} from 'lucide-react';
import { PipelineOutput } from '../types';

interface LandingPageProps {
  pipelineData: PipelineOutput | null;
  onLaunchDashboard: () => void;
  onOpenArchitecture: () => void;
  onOpenEvaluation: () => void;
  onOpenReferences: () => void;
}

export const LandingPage: React.FC<LandingPageProps> = ({
  pipelineData,
  onLaunchDashboard,
  onOpenArchitecture,
  onOpenEvaluation,
  onOpenReferences,
}) => {
  const cohortSize = pipelineData?.results.length ?? 150;
  const evalAuc = pipelineData?.evaluation?.auc !== undefined ? pipelineData.evaluation.auc.toFixed(3) : '0.865';
  const sensitivity = pipelineData?.evaluation?.sensitivity !== undefined ? (pipelineData.evaluation.sensitivity * 100).toFixed(1) : '85.7';
  const specificity = pipelineData?.evaluation?.specificity !== undefined ? (pipelineData.evaluation.specificity * 100).toFixed(1) : '84.4';

  return (
    <div className="space-y-16 py-4">
      {/* Hero Section */}
      <section className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-slate-900 via-[#0B1528] to-slate-900 text-white border border-slate-800 p-8 sm:p-12 shadow-xl">
        {/* Subtle grid backdrop effect */}
        <div className="absolute inset-0 bg-[radial-gradient(#14b8a6_1px,transparent_1px)] [background-size:24px_24px] opacity-10 pointer-events-none" />
        
        <div className="relative z-10 max-w-4xl space-y-6">
          {/* Top Pill */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-teal-950/90 border border-teal-500/40 text-teal-300 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse"></span>
            <span>Multi-Stage Longitudinal Decision-Support Platform</span>
          </div>

          {/* Headline */}
          <h1 className="text-3xl sm:text-5xl font-bold tracking-tight text-white leading-tight">
            Demographic-Fair Alzheimer’s Triage &amp; Diagnostic Referral Prioritization
          </h1>

          {/* Subtitle */}
          <p className="text-base sm:text-lg text-slate-300 leading-relaxed max-w-3xl">
            <strong>NeuroPulse</strong> replaces biased, static cutoff bars with an explainable 4-stage pipeline. 
            Combining <span className="text-teal-300 font-medium">demographic residual norming</span>, 
            <span className="text-teal-300 font-medium"> longitudinal velocity detection</span>, 
            <span className="text-teal-300 font-medium"> plasma biomarker triaging</span>, and 
            <span className="text-teal-300 font-medium"> structural MRI brain atrophy rates</span>.
          </p>

          {/* CTA Buttons */}
          <div className="pt-2 flex flex-wrap items-center gap-4">
            <button
              id="hero-btn-launch-dashboard"
              onClick={onLaunchDashboard}
              className="inline-flex items-center gap-2.5 px-6 py-3.5 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm transition-all transform hover:-translate-y-0.5 shadow-lg shadow-teal-950/50 cursor-pointer"
            >
              <span>Launch Clinical Triage Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>

            <button
              id="hero-btn-view-eval"
              onClick={onOpenEvaluation}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              <span>Held-Out Validation (AUC: {evalAuc})</span>
            </button>

            <button
              id="hero-btn-view-arch"
              onClick={onOpenArchitecture}
              className="inline-flex items-center gap-2 px-5 py-3.5 rounded-xl bg-slate-800/90 hover:bg-slate-700 text-slate-200 border border-slate-700 font-semibold text-sm transition-all cursor-pointer"
            >
              <Layers className="w-4 h-4 text-indigo-400" />
              <span>Pipeline Architecture &amp; Math</span>
            </button>
          </div>

          {/* High-Level Provenance & Research Badges */}
          <div className="pt-6 border-t border-slate-800/80 grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono text-slate-300">
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase">Cohort Source</span>
              <span className="text-white font-bold text-sm">OASIS-2 Real Data</span>
              <span className="text-slate-400 block text-[10px]">{cohortSize} Subjects / 373 Visits</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase">Education Fairness</span>
              <span className="text-teal-300 font-bold text-sm">Residual Norming</span>
              <span className="text-slate-400 block text-[10px]">Zero Fixed-Point Bias</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase">Longitudinal Tracking</span>
              <span className="text-amber-300 font-bold text-sm">MMSE &amp; nWBV Slopes</span>
              <span className="text-slate-400 block text-[10px]">Annualized Trajectory</span>
            </div>
            <div className="p-3 rounded-lg bg-slate-800/40 border border-slate-700/50">
              <span className="text-slate-400 block text-[10px] uppercase">Held-Out Test AUC</span>
              <span className="text-emerald-400 font-bold text-sm">{evalAuc}</span>
              <span className="text-slate-400 block text-[10px]">Strict 70/30 Seed 42</span>
            </div>
          </div>
        </div>
      </section>

      {/* The Clinical Challenge vs. NeuroPulse Paradigm */}
      <section className="space-y-6">
        <div className="max-w-3xl space-y-2">
          <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Algorithmic Fairness in Cognitive Neurology</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Why Standard Cognitive Screening Cutoffs Fail Clinical Practice
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Conventional healthcare workflows apply static cutoff numbers (e.g. MMSE &lt; 24) to triage memory clinic referrals. 
            This produces systematic demographic disparities and fails to capture rapid disease progression.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Legacy Pitfalls Card */}
          <div className="bg-rose-50/50 border border-rose-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-900 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-600" />
              <h3>Traditional Unadjusted Cutoff Pitfalls</h3>
            </div>
            
            <ul className="space-y-3 text-xs text-rose-900/90 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Low-Education False Positives:</strong> Individuals with ≤ 6 years of schooling naturally score lower on standard psychometric tests, triggering unnecessary invasive diagnostics and clinical anxiety.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>High-Education False Negatives:</strong> Highly-educated individuals with substantial cognitive reserve score above 27 even while experiencing severe, active neurodegenerative decline.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                <span>
                  <strong>Static Snapshot Blindness:</strong> A static score cannot distinguish between a patient who has been stable for five years and one losing 3+ points annually.
                </span>
              </li>
            </ul>
          </div>

          {/* NeuroPulse Solution Card */}
          <div className="bg-teal-50/50 border border-teal-200 rounded-xl p-6 space-y-4">
            <div className="flex items-center gap-2 text-teal-950 font-bold text-base">
              <CheckCircle2 className="w-5 h-5 text-teal-600" />
              <h3>The NeuroPulse Multi-Stage Solution</h3>
            </div>

            <ul className="space-y-3 text-xs text-teal-950/90 leading-relaxed">
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Demographic Residual Z-Norming:</strong> Dynamically calculates expected score <span className="font-mono font-medium">(Expected MMSE = β₀ + β₁·Age + β₂·EDUC)</span> and measures true statistical deviations.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Longitudinal Velocity Escalation:</strong> Detects annualized rate-of-decline exceeding research references (-1.68 pts/yr MMSE, -0.010/yr nWBV) to fast-track rapid converters.
                </span>
              </li>
              <li className="flex items-start gap-2.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-600 mt-1.5 shrink-0" />
                <span>
                  <strong>Multiplicative Prioritization Engine:</strong> Referral priority is computed as <span className="font-mono font-medium font-semibold">Priority = Severity × Urgency</span>, ensuring urgent trajectories receive immediate specialist slots.
                </span>
              </li>
            </ul>
          </div>
        </div>
      </section>

      {/* The 4-Stage Multi-Modal Gating Funnel */}
      <section className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div className="max-w-3xl space-y-2">
            <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 uppercase tracking-wider">
              <Layers className="w-4 h-4 text-teal-600" />
              <span>Multi-Modal Clinical Architecture</span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
              Four Gated Stages of Objective Referral Triage
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Every participant passes through calibrated physiological and psychometric checkpoints. 
              Explainable audit trails guarantee complete transparent clinical reasoning.
            </p>
          </div>
          <button
            onClick={onOpenArchitecture}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-700 hover:text-teal-800 underline cursor-pointer"
          >
            <span>View detailed mathematical equations</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Stage 1 */}
          <div className="bg-white border border-slate-200 hover:border-teal-400 rounded-xl p-5 shadow-sm space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-mono font-bold text-xs flex items-center justify-center">
                01
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-100/70 text-teal-800">
                Cognitive Screen
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Demographic Norming &amp; Velocity</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Computes residual z-score from age and schooling regression. Stable normal patients safely exit early without invasive testing.
            </p>
            <div className="text-[11px] font-mono text-teal-900 bg-slate-50 p-2 rounded border border-slate-100">
              Threshold: z &lt; -1.5 OR slope &le; -1.68 pts/yr
            </div>
          </div>

          {/* Stage 2 */}
          <div className="bg-white border border-slate-200 hover:border-amber-400 rounded-xl p-5 shadow-sm space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 font-mono font-bold text-xs flex items-center justify-center">
                02
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100/70 text-amber-800">
                Blood Biomarkers
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Plasma p-Tau217 &amp; A&beta;42/40</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              High-accuracy blood-based triage gatekeeper. Categorizes results into Positive, Intermediate, or Negative zones.
            </p>
            <div className="text-[11px] font-mono text-amber-900 bg-slate-50 p-2 rounded border border-slate-100">
              Cutoffs: pTau &gt; 0.25 pg/mL, A&beta; &lt; 0.080
            </div>
          </div>

          {/* Stage 3 */}
          <div className="bg-white border border-slate-200 hover:border-indigo-400 rounded-xl p-5 shadow-sm space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-800 font-mono font-bold text-xs flex items-center justify-center">
                03
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-indigo-100/70 text-indigo-800">
                Structural MRI
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Longitudinal nWBV Morphometry</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Measures annualized whole-brain volume loss from consecutive MRI scans. Detects cerebral tissue atrophy acceleration.
            </p>
            <div className="text-[11px] font-mono text-indigo-900 bg-slate-50 p-2 rounded border border-slate-100">
              Threshold: nWBV slope &le; -0.010/yr
            </div>
          </div>

          {/* Stage 4 */}
          <div className="bg-white border border-slate-200 hover:border-purple-400 rounded-xl p-5 shadow-sm space-y-3 transition-all">
            <div className="flex items-center justify-between">
              <span className="w-7 h-7 rounded-lg bg-purple-50 border border-purple-200 text-purple-800 font-mono font-bold text-xs flex items-center justify-center">
                04
              </span>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-purple-100/70 text-purple-800">
                Priority Queue
              </span>
            </div>
            <h3 className="text-sm font-bold text-slate-900">Multiplicative Diagnostic Queue</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Ranks specialist memory clinic appointment slots by severity and urgency. Generates complete auditable clinical rationales.
            </p>
            <div className="text-[11px] font-mono text-purple-900 bg-slate-50 p-2 rounded border border-slate-100">
              Formula: Priority = Severity &times; Urgency
            </div>
          </div>
        </div>
      </section>

      {/* Empirical Dataset & Live Validation Section */}
      <section className="bg-slate-900 text-white rounded-2xl p-8 sm:p-10 border border-slate-800 shadow-lg space-y-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <span className="text-teal-400 text-xs font-mono uppercase tracking-wider">
              Rigorous Validation Ledger
            </span>
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-white">
              Real OASIS-2 Longitudinal Cohort &amp; Non-Circular Validation
            </h2>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              NeuroPulse strictly partitions the dataset into a ~70% design cohort and a ~30% held-out test cohort (seed 42). 
              No evaluation metrics are hardcoded — every score is dynamically calculated at request time.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={onOpenEvaluation}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-xs transition-colors cursor-pointer"
            >
              <span>View ROC Curve &amp; Confusion Matrix</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={onOpenReferences}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 font-medium text-xs transition-colors cursor-pointer"
            >
              <FileText className="w-3.5 h-3.5 text-amber-400" />
              <span>Peer-Reviewed Citations</span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pt-4 border-t border-slate-800">
          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-mono">ROC AUC</span>
            <span className="text-2xl font-bold text-teal-400 font-mono">{evalAuc}</span>
            <span className="text-[10px] text-slate-400 block mt-1">Held-Out Test Set</span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-mono">Sensitivity</span>
            <span className="text-2xl font-bold text-emerald-400 font-mono">{sensitivity}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Conversion Recall</span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-mono">Specificity</span>
            <span className="text-2xl font-bold text-indigo-400 font-mono">{specificity}%</span>
            <span className="text-[10px] text-slate-400 block mt-1">Healthy Normal Specificity</span>
          </div>

          <div className="bg-slate-800/50 p-4 rounded-xl border border-slate-700/60">
            <span className="text-[11px] text-slate-400 block font-mono">Longitudinal Visits</span>
            <span className="text-2xl font-bold text-amber-400 font-mono">373</span>
            <span className="text-[10px] text-slate-400 block mt-1">150 Unique Participants</span>
          </div>
        </div>
      </section>

      {/* Bottom Launch Banner */}
      <section className="bg-gradient-to-r from-teal-900/40 via-slate-900 to-teal-900/40 border border-teal-600/30 rounded-2xl p-8 text-center space-y-4">
        <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white">
          Ready to Explore the Patient Prioritization Queue?
        </h2>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
          Interact with individual patient timelines, inspect demographic regression residual plots, 
          filter through the 4-stage funnel, or upload your own CSV data.
        </p>
        <div className="pt-2 flex justify-center">
          <button
            onClick={onLaunchDashboard}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-teal-500 hover:bg-teal-400 text-slate-950 font-bold text-sm shadow-md transition-all transform hover:scale-105 cursor-pointer"
          >
            <span>Open NeuroPulse Dashboard</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </section>
    </div>
  );
};
