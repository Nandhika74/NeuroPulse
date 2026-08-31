import React from 'react';
import { ArrowRight, ChevronRight, UserCheck, ShieldCheck, AlertTriangle, ArrowDownRight, Layers, Sparkles } from 'lucide-react';
import { FunnelCounts } from '../types';

interface FunnelVisualizerProps {
  funnel: FunnelCounts;
  onFilterByStage?: (stage: string) => void;
  selectedStageFilter?: string;
}

export const FunnelVisualizer: React.FC<FunnelVisualizerProps> = ({
  funnel,
  onFilterByStage,
  selectedStageFilter,
}) => {
  const stage1Passers = funnel.stage1Input - funnel.stage1LowRiskExit;
  const stage2Passers = funnel.stage2Input - funnel.stage2ReassuringHold;

  return (
    <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-3">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xs font-bold text-slate-400 uppercase tracking-widest">
              4-Stage Diagnostic Prioritization Funnel
            </h2>
            <span className="text-[10px] px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-mono font-bold">
              {funnel.totalPatients} Total Patients
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            Patients are systematically filtered; only cases with persistent or escalating evidence advance through successive tiers.
          </p>
        </div>

        {selectedStageFilter && (
          <button
            onClick={() => onFilterByStage && onFilterByStage('ALL')}
            className="text-xs text-teal-600 hover:text-teal-700 font-semibold underline self-start sm:self-auto cursor-pointer"
          >
            Clear stage filter
          </button>
        )}
      </div>

      {/* Funnel Pipeline Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-3 relative">
        {/* STAGE 1: Cognitive Screening (Real OASIS-2 Data) */}
        <div
          id="funnel-stage-1"
          onClick={() => onFilterByStage && onFilterByStage('STAGE1')}
          className={`relative rounded-lg p-3.5 border transition-all cursor-pointer ${
            selectedStageFilter === 'STAGE1'
              ? 'ring-2 ring-teal-500 bg-teal-50/50 border-teal-500 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-l-4 border-l-teal-500 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono">
              Stage 1 • Real Data
            </span>
            <span className="text-xs font-mono text-teal-600 font-bold">100%</span>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-1">Cognitive Screening</h3>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
            Education-adjusted regression norm (Mungas/Pedraza) + MMSE slope check (ref: -1.68/yr).
          </p>

          <div className="bg-slate-50 rounded p-2 border border-slate-200 mb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-600">Screened Cohort</span>
              <span className="text-lg font-bold font-mono text-slate-800">{funnel.stage1Input}</span>
            </div>
          </div>

          {/* Exit Box */}
          <div className="flex items-start gap-1.5 p-1.5 rounded bg-emerald-50 border border-emerald-200 text-[10px] text-emerald-800">
            <ArrowDownRight className="w-3.5 h-3.5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{funnel.stage1LowRiskExit} Exited (Low Risk)</span>
              <p className="text-[9px] text-emerald-700">Within expected demographic norm</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
            <span>Escalated to Stage 2:</span>
            <span className="font-mono font-bold text-xs text-teal-800">{stage1Passers} pts</span>
          </div>
        </div>

        {/* STAGE 2: Plasma Biomarkers (Simulated Research Layer) */}
        <div
          id="funnel-stage-2"
          onClick={() => onFilterByStage && onFilterByStage('STAGE2')}
          className={`relative rounded-lg p-3.5 border transition-all cursor-pointer ${
            selectedStageFilter === 'STAGE2'
              ? 'ring-2 ring-orange-400 bg-orange-50/50 border-orange-400 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-l-4 border-l-orange-400 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-orange-50 text-orange-700 border border-orange-200 font-mono flex items-center gap-1">
              <Sparkles className="w-2.5 h-2.5 text-orange-500" />
              Stage 2 • Simulated
            </span>
            <span className="text-xs font-mono text-orange-600 font-bold">
              {funnel.stage1Input > 0 ? `${Math.round((stage1Passers / funnel.stage1Input) * 100)}%` : '0%'}
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-1">Plasma Biomarkers</h3>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
            Simulated pTau217 & Aβ42/40 ratio (NIA-AA ATN research framework).
          </p>

          <div className="bg-slate-50 rounded p-2 border border-slate-200 mb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-600">Biomarker Screened</span>
              <span className="text-lg font-bold font-mono text-slate-800">{funnel.stage2Input}</span>
            </div>
          </div>

          {/* Held Box */}
          <div className="flex items-start gap-1.5 p-1.5 rounded bg-orange-50 border border-orange-200 text-[10px] text-orange-800">
            <ShieldCheck className="w-3.5 h-3.5 text-orange-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">{funnel.stage2ReassuringHold} Held at Stage 2</span>
              <p className="text-[9px] text-orange-700">Biomarkers reassuring (double neg)</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-orange-700 font-semibold">
            <span>Escalated to Stage 3:</span>
            <span className="font-mono font-bold text-xs text-orange-800">{stage2Passers} pts</span>
          </div>
        </div>

        {/* STAGE 3: Structural MRI Evaluation (Real OASIS-2 Data) */}
        <div
          id="funnel-stage-3"
          onClick={() => onFilterByStage && onFilterByStage('STAGE3')}
          className={`relative rounded-lg p-3.5 border transition-all cursor-pointer ${
            selectedStageFilter === 'STAGE3'
              ? 'ring-2 ring-teal-500 bg-teal-50/50 border-teal-500 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-l-4 border-l-teal-500 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-teal-50 text-teal-700 border border-teal-200 font-mono">
              Stage 3 • Real Data
            </span>
            <span className="text-xs font-mono text-teal-600 font-bold">
              {funnel.stage1Input > 0 ? `${Math.round((stage2Passers / funnel.stage1Input) * 100)}%` : '0%'}
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-1">MRI Morphometry</h3>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
            Real nWBV volume loss rate (threshold: nWBV slope ≤ -0.010/yr upgrades to High).
          </p>

          <div className="bg-slate-50 rounded p-2 border border-slate-200 mb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-slate-600">MRI Evaluated</span>
              <span className="text-lg font-bold font-mono text-slate-800">{funnel.stage3Input}</span>
            </div>
          </div>

          {/* Upgrades Box */}
          <div className="flex items-start gap-1.5 p-1.5 rounded bg-teal-50 border border-teal-200 text-[10px] text-teal-800">
            <AlertTriangle className="w-3.5 h-3.5 text-teal-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">+{funnel.stage3MediumToHighUpgrade} Atrophy Upgrades</span>
              <p className="text-[9px] text-teal-700">Rapid brain volume decline</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-teal-700 font-semibold">
            <span>Reviewed in Stage 4:</span>
            <span className="font-mono font-bold text-xs text-teal-800">{funnel.stage4Input} pts</span>
          </div>
        </div>

        {/* STAGE 4: Confirmatory Pathway & Budget Allocation (Simulated / Gated) */}
        <div
          id="funnel-stage-4"
          onClick={() => onFilterByStage && onFilterByStage('STAGE4')}
          className={`relative rounded-lg p-3.5 border transition-all cursor-pointer ${
            selectedStageFilter === 'STAGE4'
              ? 'ring-2 ring-purple-500 bg-purple-50/50 border-purple-500 shadow-sm'
              : 'bg-white hover:bg-slate-50 border-l-4 border-l-purple-500 border-slate-200'
          }`}
        >
          <div className="flex items-center justify-between gap-1 mb-1.5">
            <span className="text-[9px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200 font-mono">
              Stage 4 • Prioritization
            </span>
            <span className="text-xs font-mono text-purple-600 font-bold">
              {funnel.stage1Input > 0 ? `${Math.round((funnel.stage4ConfirmatoryEligible / funnel.stage1Input) * 100)}%` : '0%'}
            </span>
          </div>

          <h3 className="text-xs font-bold text-slate-800 mb-1">Confirmatory Eligibility</h3>
          <p className="text-[11px] text-slate-500 mb-2.5 leading-tight">
            High Tier + high biomarker concern + rapid progression (gated by imaging budget).
          </p>

          <div className="bg-slate-50 rounded p-2 border border-slate-200 mb-2">
            <div className="flex items-baseline justify-between">
              <span className="text-[11px] font-medium text-purple-700">Referral Suggested</span>
              <span className="text-lg font-bold font-mono text-purple-700">{funnel.stage4ConfirmatoryEligible}</span>
            </div>
          </div>

          {/* Capacity Allocation Box */}
          <div className="flex items-start gap-1.5 p-1.5 rounded bg-purple-50 border border-purple-200 text-[10px] text-purple-800">
            <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0 mt-0.5" />
            <div>
              <span className="font-bold">Top {funnel.stage4ImagingBudgetSlots} Priority Slots</span>
              <p className="text-[9px] text-purple-700">Ordered by Severity × Urgency</p>
            </div>
          </div>

          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-purple-700 font-semibold">
            <span>Funnel Ratio:</span>
            <span className="font-mono font-bold text-[10px] text-purple-800">
              {funnel.stage1Input} → {stage1Passers} → {stage2Passers} → {funnel.stage4ConfirmatoryEligible}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
