import React from 'react';
import { Info, Sparkles, Brain, Scale } from 'lucide-react';

export const LegendBar: React.FC = () => {
  return (
    <div className="bg-white border border-slate-200 rounded-lg p-3 shadow-sm text-xs">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 font-semibold text-slate-700">
          <Info className="w-3.5 h-3.5 text-teal-600" />
          <span className="text-[11px] uppercase tracking-wider text-slate-500 font-bold">Data Provenance & Layer Legend:</span>
        </div>

        <div className="flex flex-wrap items-center gap-4">
          {/* Real Data Stage (Teal) */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-500"></span>
            <div className="flex items-center gap-1.5 text-slate-700 text-xs">
              <span className="font-semibold text-slate-800">Real Data (OASIS-2)</span>
              <span className="text-[10px] text-teal-700 bg-teal-50 px-2 py-0.5 rounded border border-teal-200 font-mono">
                Stages 1 & 3: MMSE, Age, EDUC, nWBV, CDR
              </span>
            </div>
          </div>

          {/* Simulated Research Stage (Orange / Amber) */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-orange-400"></span>
            <div className="flex items-center gap-1.5 text-slate-700 text-xs">
              <span className="font-semibold text-slate-800">Simulated Research</span>
              <span className="text-[10px] text-orange-700 bg-orange-50 px-2 py-0.5 rounded border border-orange-200 font-mono flex items-center gap-1">
                <Sparkles className="w-2.5 h-2.5 text-orange-500" />
                Stages 2 & 4: pTau217, Aβ42/40, PET Gating
              </span>
            </div>
          </div>

          {/* Ranking & Triage Output (Purple) */}
          <div className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
            <div className="flex items-center gap-1.5 text-slate-700 text-xs">
              <span className="font-semibold text-slate-800">Decision Priority</span>
              <span className="text-[10px] text-purple-700 bg-purple-50 px-2 py-0.5 rounded border border-purple-200 font-mono">
                Severity × Urgency
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
