import React from 'react';
import { Layers, Brain, Scale, TrendingDown, CheckCircle2, ShieldCheck, Zap, ArrowRight, Code } from 'lucide-react';
import { RegressionModel } from '../types';

interface ArchitecturePanelProps {
  regression?: RegressionModel;
}

export const ArchitecturePanel: React.FC<ArchitecturePanelProps> = ({ regression }) => {
  const beta0 = regression?.intercept ?? regression?.beta0 ?? 27.2;
  const betaAge = regression?.betaAge ?? -0.045;
  const betaEduc = regression?.betaEduc ?? 0.21;
  const rmse = regression?.rmse ?? regression?.residualStd ?? 1.45;
  const rSquared = regression?.rSquared ?? 0.38;
  const sampleSize = regression?.sampleSize ?? 105;
  return (
    <div className="space-y-4">
      {/* 4-Stage Architectural Overview Banner */}
      <div className="bg-white border border-slate-200 rounded-lg p-5 shadow-sm">
        <h2 className="text-sm font-bold text-slate-900 mb-1">EquiTrace Multi-Stage Architectural Blueprint</h2>
        <p className="text-xs text-slate-600 leading-relaxed max-w-4xl">
          EquiTrace replaces raw cognitive cutoffs with an equity-grounded, multi-modal pipeline. It couples demographic residual norming with longitudinal velocity checks, plasma biomarker gatekeeping, and quantitative structural MRI atrophy detection.
        </p>

        {/* Pipeline Diagram */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
          <div className="p-3 rounded bg-teal-50 border border-teal-200 relative">
            <div className="text-[9px] font-bold uppercase text-teal-700 font-mono mb-0.5">Stage 1 (Real)</div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">Cognitive Norming</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Education-adjusted MMSE residual regression (Pedraza 2012) + trajectory slope evaluation (ref: -1.68 pts/yr).
            </p>
            <div className="mt-2 text-[10px] font-mono text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
              Z = (MMSE - MMSE_exp) / RMSE
            </div>
          </div>

          <div className="p-3 rounded bg-orange-50 border border-orange-200 relative">
            <div className="text-[9px] font-bold uppercase text-orange-700 font-mono mb-0.5">Stage 2 (Simulated)</div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">Plasma Biomarkers</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              pTau217 & Aβ42/40 ratio tri-zone scoring (NIA-AA ATN research framework). Reassuring double-negatives held safely.
            </p>
            <div className="mt-2 text-[10px] font-mono text-orange-800 bg-orange-100/70 px-1.5 py-0.5 rounded border border-orange-200 font-semibold">
              Biomarker Concern Score (0-100%)
            </div>
          </div>

          <div className="p-3 rounded bg-teal-50 border border-teal-200 relative">
            <div className="text-[9px] font-bold uppercase text-teal-700 font-mono mb-0.5">Stage 3 (Real)</div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">MRI Morphometry</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Longitudinal normalized whole-brain volume (nWBV) slope. Slope ≤ -0.010/yr upgrades Medium to High tier.
            </p>
            <div className="mt-2 text-[10px] font-mono text-teal-800 bg-teal-100/70 px-1.5 py-0.5 rounded border border-teal-200 font-semibold">
              nWBV Slope = ΔnWBV / ΔYears
            </div>
          </div>

          <div className="p-3 rounded bg-purple-50 border border-purple-200 relative">
            <div className="text-[9px] font-bold uppercase text-purple-700 font-mono mb-0.5">Stage 4 (Prioritized)</div>
            <h3 className="text-xs font-bold text-slate-800 mb-1">Multiplicative Queue</h3>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Orders diagnostic referral queue via multiplicative interaction between Clinical Severity and Progression Urgency.
            </p>
            <div className="mt-2 text-[10px] font-mono text-purple-800 bg-purple-100/70 px-1.5 py-0.5 rounded border border-purple-200 font-semibold">
              Priority = Severity × Urgency
            </div>
          </div>
        </div>
      </div>

      {/* Mathematics Section 1: Education-Adjusted Regression Model */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">1. Live Fitted Normative Regression</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            Standard MMSE cutoff scores (e.g. 24/30) generate substantial bias: high-education individuals can experience marked cognitive loss while scoring above 24, whereas low-education individuals may score below 24 while cognitively intact (Mungas 1996).
          </p>

          <div className="p-3 rounded bg-slate-50 border border-slate-200 font-mono text-xs text-slate-800 space-y-2">
            <div className="text-teal-700 font-bold text-xs">
              Expected MMSE = β₀ + β₁·Age + β₂·EDUC
            </div>
            <div className="pt-2 border-t border-slate-200 grid grid-cols-2 gap-2 text-[11px]">
              <div>Intercept (β₀): <strong className="text-slate-900">{beta0.toFixed(4)}</strong></div>
              <div>Age Coeff (β₁): <strong className="text-slate-900">{betaAge.toFixed(4)}</strong></div>
              <div>Education Coeff (β₂): <strong className="text-slate-900">{betaEduc.toFixed(4)}</strong></div>
              <div>Model RMSE (σ): <strong className="text-slate-900">{rmse.toFixed(4)}</strong></div>
              <div>R² Variance: <strong className="text-slate-900">{(rSquared * 100).toFixed(1)}%</strong></div>
              <div>Fitted on: <strong className="text-slate-900">{sampleSize} design subjects</strong></div>
            </div>
          </div>

          <div className="text-xs text-slate-600 space-y-1.5 bg-slate-50 p-3 rounded border border-slate-200">
            <h4 className="font-semibold text-slate-800">Z-Score Residual Computation:</h4>
            <p className="font-mono text-[11px] text-teal-700">
              Residual = Observed_MMSE - Expected_MMSE
            </p>
            <p className="font-mono text-[11px] text-teal-700">
              Residual_z = Residual / RMSE
            </p>
            <ul className="list-disc list-inside text-[11px] text-slate-600 space-y-0.5 pt-1">
              <li><strong>Residual_z &gt; -1.0</strong>: Within expectation → Stage 1 Exit (Low Risk)</li>
              <li><strong>-2.0 &lt; Residual_z ≤ -1.0</strong>: Mild Cognitive Deficit (&gt;1σ) → Medium Risk</li>
              <li><strong>Residual_z ≤ -2.0</strong>: Marked Cognitive Deficit (&gt;2σ) → High Risk</li>
            </ul>
          </div>
        </div>

        {/* Mathematics Section 2: Multiplicative Priority Ranking */}
        <div className="bg-white border border-slate-200 rounded-lg p-4 shadow-sm space-y-3">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <h3 className="text-xs font-bold text-slate-800 uppercase tracking-wider">2. Multiplicative Priority Formula</h3>
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">
            A static score only captures current impairment, ignoring how rapidly the patient is declining. EquiTrace formulates prioritization as a <strong>multiplicative product</strong> of instantaneous severity and trajectory urgency.
          </p>

          <div className="p-3 rounded bg-purple-50/70 border border-purple-200 font-mono text-xs text-purple-900 space-y-2">
            <div className="text-purple-800 font-bold text-xs">
              Priority Score = Severity_Component × Urgency_Component
            </div>
            <div className="pt-2 border-t border-purple-200 space-y-1.5 text-[11px]">
              <div>
                <strong>Severity Component</strong> (Base 1.0 + Deficit Weights):
                <p className="text-slate-700 font-sans text-[10px] mt-0.5">
                  1.0 + (Residual_z Deficit × 0.25) + (pTau217 Elevation × 0.35) + (Amyloid Ratio × 0.25)
                </p>
              </div>
              <div className="pt-1">
                <strong>Urgency Component</strong> (Base 1.0 + Velocity Weights):
                <p className="text-slate-700 font-sans text-[10px] mt-0.5">
                  1.0 + (MMSE Loss Rate / 1.68 × 0.45) + (Brain Volume Loss / 0.010 × 0.40)
                </p>
              </div>
            </div>
          </div>

          <div className="bg-slate-50 p-3 rounded border border-slate-200 text-xs text-slate-600 space-y-1.5">
            <h4 className="font-semibold text-slate-800">Why Multiplicative Beats Additive:</h4>
            <p className="text-[11px] text-slate-600 leading-relaxed">
              Under an additive model, a patient with severe chronic dementia who has remained stable for 3 years would monopolize imaging slots over a patient experiencing precipitous cognitive decline in the therapeutic window. The multiplicative interaction ensures high velocity accelerates priority non-linearly.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
