import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  ArrowUpDown,
  ChevronRight,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertCircle,
  HelpCircle,
  Clock,
  ArrowDown,
  ArrowUp,
  Brain,
  ShieldCheck,
  TrendingDown,
  Zap,
} from 'lucide-react';
import { TriageResult, RiskTier } from '../types';

interface PatientTableProps {
  results: TriageResult[];
  onSelectPatient: (patient: TriageResult) => void;
  selectedPatientId?: string;
  selectedStageFilter?: string;
}

type SortField =
  | 'priorityScore'
  | 'clinicalRiskScore'
  | 'latestMmse'
  | 'residualZ'
  | 'mmseSlope'
  | 'nwbvSlope'
  | 'age'
  | 'educ'
  | 'subjectId';

export const PatientTable: React.FC<PatientTableProps> = ({
  results,
  onSelectPatient,
  selectedPatientId,
  selectedStageFilter,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('ALL');
  const [splitFilter, setSplitFilter] = useState<string>('ALL');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [sortField, setSortField] = useState<SortField>('priorityScore');
  const [sortAsc, setSortAsc] = useState<boolean>(false);

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortAsc(!sortAsc);
    } else {
      setSortField(field);
      setSortAsc(false); // default highest priority first
    }
  };

  const filteredResults = useMemo(() => {
    return results.filter(r => {
      // Search term
      if (searchTerm) {
        const query = searchTerm.toLowerCase();
        const matchesId = r.subjectId.toLowerCase().includes(query);
        const matchesGroup = r.patient.group.toLowerCase().includes(query);
        if (!matchesId && !matchesGroup) return false;
      }

      // Stage visual filter from funnel
      if (selectedStageFilter && selectedStageFilter !== 'ALL') {
        if (selectedStageFilter === 'STAGE1' && !r.stage1) return false;
        if (selectedStageFilter === 'STAGE2' && r.status === 'EXIT_STAGE1_LOW_RISK') return false;
        if (selectedStageFilter === 'STAGE3' && (r.status === 'EXIT_STAGE1_LOW_RISK' || r.status === 'HELD_STAGE2_BIOMARKERS_REASSURING')) return false;
        if (selectedStageFilter === 'STAGE4' && r.status !== 'STAGE4_CONFIRMATORY_ELIGIBLE' && r.status !== 'STAGE3_PASSED') return false;
      }

      // Tier filter
      if (tierFilter !== 'ALL' && r.clinicalRiskTier !== tierFilter) {
        return false;
      }

      // Split filter
      if (splitFilter === 'HELD_OUT' && !r.isHeldOut) return false;
      if (splitFilter === 'DESIGN' && r.isHeldOut) return false;

      // Status filter
      if (statusFilter !== 'ALL' && r.status !== statusFilter) {
        return false;
      }

      return true;
    });
  }, [results, searchTerm, selectedStageFilter, tierFilter, splitFilter, statusFilter]);

  const sortedResults = useMemo(() => {
    return [...filteredResults].sort((a, b) => {
      let valA: any;
      let valB: any;

      switch (sortField) {
        case 'priorityScore':
          valA = a.priorityScore;
          valB = b.priorityScore;
          break;
        case 'clinicalRiskScore':
          valA = a.clinicalRiskScore;
          valB = b.clinicalRiskScore;
          break;
        case 'latestMmse':
          valA = a.patient.latestMmse;
          valB = b.patient.latestMmse;
          break;
        case 'residualZ':
          valA = a.stage1.residualZ;
          valB = b.stage1.residualZ;
          break;
        case 'mmseSlope':
          valA = a.patient.mmseSlope;
          valB = b.patient.mmseSlope;
          break;
        case 'nwbvSlope':
          valA = a.patient.nwbvSlope;
          valB = b.patient.nwbvSlope;
          break;
        case 'age':
          valA = a.patient.latestAge;
          valB = b.patient.latestAge;
          break;
        case 'educ':
          valA = a.patient.educ;
          valB = b.patient.educ;
          break;
        case 'subjectId':
          valA = a.subjectId;
          valB = b.subjectId;
          return sortAsc ? valA.localeCompare(valB) : valB.localeCompare(valA);
        default:
          valA = a.priorityScore;
          valB = b.priorityScore;
      }

      if (valA < valB) return sortAsc ? -1 : 1;
      if (valA > valB) return sortAsc ? 1 : -1;
      return 0;
    });
  }, [filteredResults, sortField, sortAsc]);

  const renderTierBadge = (tier: RiskTier) => {
    switch (tier) {
      case 'High':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100/90 text-amber-900 border border-amber-300">
            <span className="w-1.5 h-1.5 rounded-full bg-amber-600"></span>
            High Risk
          </span>
        );
      case 'Medium':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-100 text-stone-700 border border-stone-300">
            <span className="w-1.5 h-1.5 rounded-full bg-stone-500"></span>
            Medium
          </span>
        );
      case 'Low':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-teal-50 text-teal-700 border border-teal-200">
            <span className="w-1.5 h-1.5 rounded-full bg-teal-500"></span>
            Low Risk
          </span>
        );
    }
  };

  const renderStatusBadge = (r: TriageResult) => {
    switch (r.status) {
      case 'STAGE4_CONFIRMATORY_ELIGIBLE':
        return (
          <div className="flex flex-col gap-0.5">
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-semibold bg-purple-50 text-purple-700 border border-purple-200">
              <Zap className="w-3 h-3 text-purple-600" />
              Referral Suggested
            </span>
            {r.stage4?.prioritySlotAllocated && (
              <span className="text-[9px] font-mono text-purple-700 font-bold pl-1">
                ⭐ Imaging Slot Allocated
              </span>
            )}
          </div>
        );
      case 'HELD_STAGE2_BIOMARKERS_REASSURING':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-200">
            <ShieldCheck className="w-3 h-3 text-orange-500" />
            Held at Stage 2 (Reassuring)
          </span>
        );
      case 'EXIT_STAGE1_LOW_RISK':
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3 h-3 text-emerald-600" />
            Stage 1 Exit (Low Risk)
          </span>
        );
      case 'STAGE3_PASSED':
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-100 text-slate-700 border border-slate-200">
            <Layers className="w-3 h-3 text-teal-600" />
            Stage 3 Completed
          </span>
        );
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-sm overflow-hidden flex flex-col">
      {/* Table Control Bar */}
      <div className="p-3 border-b border-slate-200 flex flex-col lg:flex-row lg:items-center justify-between gap-2.5 bg-slate-50/75">
        {/* Search */}
        <div className="relative flex-1 max-w-md">
          <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-400" />
          <input
            id="input-search-patients"
            type="text"
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            placeholder="Search by Patient ID or Group (e.g. OAS2_0002, Converted)..."
            className="w-full bg-white border border-slate-200 rounded pl-8 pr-3 py-1.5 text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:border-teal-500 shadow-2xs"
          />
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Risk Tier Filter */}
          <select
            id="select-filter-tier"
            value={tierFilter}
            onChange={e => setTierFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="High">High Risk Tier</option>
            <option value="Medium">Medium Risk Tier</option>
            <option value="Low">Low Risk Tier</option>
          </select>

          {/* Status Filter */}
          <select
            id="select-filter-status"
            value={statusFilter}
            onChange={e => setStatusFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Pipeline Statuses</option>
            <option value="STAGE4_CONFIRMATORY_ELIGIBLE">Referral Suggested</option>
            <option value="HELD_STAGE2_BIOMARKERS_REASSURING">Held at Stage 2</option>
            <option value="EXIT_STAGE1_LOW_RISK">Stage 1 Exit (Low Risk)</option>
            <option value="STAGE3_PASSED">Stage 3 Completed</option>
          </select>

          {/* Split Filter */}
          <select
            id="select-filter-split"
            value={splitFilter}
            onChange={e => setSplitFilter(e.target.value)}
            className="bg-white border border-slate-200 rounded px-2.5 py-1 text-xs text-slate-700 focus:outline-none focus:border-teal-500 cursor-pointer shadow-2xs"
          >
            <option value="ALL">All Cohort Splits</option>
            <option value="HELD_OUT">Held-Out Test Cohort (~30%)</option>
            <option value="DESIGN">Design / Norming Cohort (~70%)</option>
          </select>

          <span className="text-[11px] text-slate-500 font-mono ml-1">
            Showing {sortedResults.length} / {results.length} patients
          </span>
        </div>
      </div>

      {/* Main Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left text-xs border-collapse">
          <thead>
            <tr className="bg-slate-50 text-slate-500 border-b border-slate-200 text-[10px] uppercase font-bold tracking-wider select-none">
              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('priorityScore')}>
                <div className="flex items-center gap-1">
                  <span>Priority Rank</span>
                  <ArrowUpDown className="w-3 h-3 text-purple-500" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('subjectId')}>
                <div className="flex items-center gap-1">
                  <span>Patient ID / Split</span>
                  <ArrowUpDown className="w-3 h-3 text-slate-400" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('age')}>
                <div className="flex items-center gap-1">
                  <span>Age / EDUC</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('latestMmse')}>
                <div className="flex items-center gap-1">
                  <span>Observed MMSE</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('residualZ')}>
                <div className="flex items-center gap-1" title="MMSE deviation from expected norm (z-score)">
                  <span>Cognitive Residual (z)</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('mmseSlope')}>
                <div className="flex items-center gap-1" title="Annualized rates of change across longitudinal visits">
                  <span>MMSE & nWBV Slopes</span>
                  <ArrowUpDown className="w-3 h-3 text-teal-600" />
                </div>
              </th>

              <th className="py-2.5 px-3.5">
                <div className="flex items-center gap-1 text-orange-600">
                  <Sparkles className="w-3 h-3 text-orange-500" />
                  <span>Simulated Biomarkers</span>
                </div>
              </th>

              <th className="py-2.5 px-3.5 cursor-pointer hover:text-slate-800" onClick={() => handleSort('clinicalRiskScore')}>
                <div className="flex items-center gap-1">
                  <span>Clinical Risk</span>
                  <ArrowUpDown className="w-3 h-3 text-amber-600" />
                </div>
              </th>

              <th className="py-2.5 px-3.5">
                <span>Pipeline Status</span>
              </th>

              <th className="py-2.5 px-3.5 text-right">
                <span>Action</span>
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {sortedResults.length === 0 ? (
              <tr>
                <td colSpan={10} className="py-8 text-center text-slate-400 text-xs">
                  No patients match the selected search or filter criteria.
                </td>
              </tr>
            ) : (
              sortedResults.map((r, idx) => {
                const isSelected = r.subjectId === selectedPatientId;
                const isRapidMmse = r.stage1.mmseDeclineExceedsRef;
                const isRapidAtrophy = r.stage3?.nwbvDeclineExceedsRef ?? false;

                return (
                  <tr
                    key={r.subjectId}
                    id={`patient-row-${r.subjectId}`}
                    onClick={() => onSelectPatient(r)}
                    className={`transition-colors cursor-pointer ${
                      isSelected
                        ? 'bg-teal-50/80 hover:bg-teal-50 border-l-4 border-l-teal-500'
                        : 'hover:bg-slate-50/80'
                    }`}
                  >
                    {/* Priority Rank & Multiplicative Score */}
                    <td className="py-2.5 px-3.5 font-mono">
                      <div className="flex items-center gap-2">
                        <span
                          className={`w-5 h-5 rounded flex items-center justify-center font-bold text-xs ${
                            r.priorityRank && r.priorityRank <= 3
                              ? 'bg-purple-600 text-white shadow-xs'
                              : r.priorityRank && r.priorityRank <= 8
                              ? 'bg-purple-100 text-purple-700 border border-purple-200'
                              : 'bg-slate-100 text-slate-600'
                          }`}
                        >
                          {r.priorityRank ?? '-'}
                        </span>
                        <div>
                          <div className="font-bold text-slate-800 text-xs">
                            {r.priorityScore.toFixed(2)}
                          </div>
                          <div className="text-[10px] text-purple-700 font-mono font-medium">
                            {r.severityComponent.toFixed(1)}S × {r.urgencyComponent.toFixed(1)}U
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Patient ID & Split */}
                    <td className="py-2.5 px-3.5">
                      <div className="font-semibold text-slate-800 font-mono flex items-center gap-1.5">
                        <span>{r.subjectId}</span>
                        {r.patient.visits.length > 1 && (
                          <span className="text-[10px] px-1 py-0.2 rounded bg-slate-100 text-slate-600 border border-slate-200">
                            {r.patient.visits.length}v
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-1 mt-0.5">
                        <span
                          className={`text-[9px] px-1.5 py-0.2 rounded font-medium ${
                            r.isHeldOut
                              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                              : 'bg-slate-100 text-slate-600 border border-slate-200'
                          }`}
                        >
                          {r.isHeldOut ? 'Held-Out' : 'Design'}
                        </span>
                        <span className="text-[10px] text-slate-500">
                          {r.patient.gender}/{r.patient.group}
                        </span>
                      </div>
                    </td>

                    {/* Age / EDUC */}
                    <td className="py-2.5 px-3.5">
                      <div className="text-slate-800 font-medium">{r.patient.latestAge} yrs</div>
                      <div className="text-[10px] text-slate-500">
                        {r.patient.educ} yrs educ {r.patient.ses ? `(SES ${r.patient.ses})` : ''}
                      </div>
                    </td>

                    {/* Observed MMSE */}
                    <td className="py-2.5 px-3.5 font-mono">
                      <div className="font-semibold text-slate-800 text-xs">
                        {r.patient.latestMmse}{' '}
                        <span className="text-[10px] text-slate-400 font-normal">/30</span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        Exp: {r.stage1.expectedMmse.toFixed(1)}
                      </div>
                    </td>

                    {/* Cognitive Residual (z) */}
                    <td className="py-2.5 px-3.5 font-mono">
                      <div
                        className={`font-semibold flex items-center gap-1 ${
                          r.stage1.residualZ <= -2.0
                            ? 'text-amber-800'
                            : r.stage1.residualZ <= -1.0
                            ? 'text-orange-700'
                            : 'text-emerald-700'
                        }`}
                      >
                        {r.stage1.residual >= 0 ? `+${r.stage1.residual.toFixed(1)}` : r.stage1.residual.toFixed(1)}
                        <span className="text-[10px] opacity-80">
                          (z={r.stage1.residualZ >= 0 ? `+${r.stage1.residualZ.toFixed(2)}` : r.stage1.residualZ.toFixed(2)})
                        </span>
                      </div>
                      <div className="text-[10px] text-slate-500">
                        {r.stage1.residualZ <= -2.0 ? 'Deficit > 2σ' : r.stage1.residualZ <= -1.0 ? 'Deficit > 1σ' : 'Normative'}
                      </div>
                    </td>

                    {/* Slopes */}
                    <td className="py-2.5 px-3.5 font-mono text-[11px]">
                      {r.patient.hasMultipleVisits ? (
                        <div>
                          <div
                            className={`flex items-center gap-1 ${
                              isRapidMmse ? 'text-amber-800 font-semibold' : 'text-slate-700'
                            }`}
                          >
                            <span>MMSE: {r.patient.mmseSlope >= 0 ? `+${r.patient.mmseSlope.toFixed(2)}` : r.patient.mmseSlope.toFixed(2)}/yr</span>
                            {isRapidMmse && <TrendingDown className="w-3 h-3 text-amber-600" />}
                          </div>
                          <div
                            className={`flex items-center gap-1 text-[10px] ${
                              isRapidAtrophy ? 'text-amber-800 font-semibold' : 'text-slate-500'
                            }`}
                          >
                            <span>nWBV: {r.patient.nwbvSlope.toFixed(4)}/yr</span>
                            {isRapidAtrophy && <TrendingDown className="w-2.5 h-2.5 text-amber-600" />}
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic text-[10px]">Single baseline visit</span>
                      )}
                    </td>

                    {/* Simulated Biomarkers */}
                    <td className="py-2.5 px-3.5">
                      {r.stage2 ? (
                        <div className="flex flex-col gap-0.5">
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-slate-500">pTau217:</span>
                            <span
                              className={`font-semibold px-1 py-0.2 rounded text-[9px] ${
                                r.stage2.biomarkers.pTau217Zone === 'Positive'
                                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                  : r.stage2.biomarkers.pTau217Zone === 'Intermediate'
                                  ? 'bg-stone-100 text-stone-700 border border-stone-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {r.stage2.biomarkers.pTau217Zone}
                            </span>
                          </div>
                          <div className="flex items-center gap-1 text-[10px]">
                            <span className="text-slate-500">Aβ42/40:</span>
                            <span
                              className={`font-semibold px-1 py-0.2 rounded text-[9px] ${
                                r.stage2.biomarkers.amyloidRatioZone === 'Positive'
                                  ? 'bg-amber-50 text-amber-900 border border-amber-300'
                                  : r.stage2.biomarkers.amyloidRatioZone === 'Intermediate'
                                  ? 'bg-stone-100 text-stone-700 border border-stone-300'
                                  : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              }`}
                            >
                              {r.stage2.biomarkers.amyloidRatioZone}
                            </span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-slate-400 text-[10px] italic">Not requested (Stage 1 exit)</span>
                      )}
                    </td>

                    {/* Clinical Risk */}
                    <td className="py-2.5 px-3.5">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        {renderTierBadge(r.clinicalRiskTier)}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">
                        Risk score: {r.clinicalRiskScore}%
                      </div>
                    </td>

                    {/* Pipeline Status */}
                    <td className="py-2.5 px-3.5">{renderStatusBadge(r)}</td>

                    {/* Action Button */}
                    <td className="py-2.5 px-3.5 text-right">
                      <button
                        id={`btn-view-reasoning-${r.subjectId}`}
                        onClick={e => {
                          e.stopPropagation();
                          onSelectPatient(r);
                        }}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-[11px] font-medium transition-colors cursor-pointer shadow-2xs"
                      >
                        <span>Reasoning</span>
                        <ChevronRight className="w-3 h-3" />
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
