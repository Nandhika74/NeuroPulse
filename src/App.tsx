import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { LandingPage } from './components/LandingPage';
import { LegendBar } from './components/LegendBar';
import { FunnelVisualizer } from './components/FunnelVisualizer';
import { PatientTable } from './components/PatientTable';
import { PatientDetailModal } from './components/PatientDetailModal';
import { EvaluationPanel } from './components/EvaluationPanel';
import { ArchitecturePanel } from './components/ArchitecturePanel';
import { ReferencesPanel } from './components/ReferencesPanel';
import { SanityTestModal } from './components/SanityTestModal';
import { UploadModal } from './components/UploadModal';
import { PipelineOutput, TriageResult } from './types';
import { AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';

export default function App() {
  const [pipelineData, setPipelineData] = useState<PipelineOutput | null>(null);
  const [selectedPatient, setSelectedPatient] = useState<TriageResult | null>(null);
  const [activeTab, setActiveTab] = useState<string>('landing');
  const [selectedStageFilter, setSelectedStageFilter] = useState<string>('ALL');
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [isSanityModalOpen, setIsSanityModalOpen] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRecomputingEval, setIsRecomputingEval] = useState<boolean>(false);
  const [notification, setNotification] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const fetchPipelineData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/data');
      if (!res.ok) throw new Error('Failed to load triage dataset');
      const data: PipelineOutput = await res.json();
      setPipelineData(data);
      if (selectedPatient) {
        // Keep selected patient updated if present
        const updated = data.results.find(r => r.subjectId === selectedPatient.subjectId);
        if (updated) setSelectedPatient(updated);
      }
    } catch (err: any) {
      console.error('Data load error:', err);
      setNotification({ type: 'error', message: err.message || 'Error connecting to triage engine' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPipelineData();
  }, []);

  const handleLoadSynthetic = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/generate-synthetic', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ count: 20 }),
      });
      const data = await res.json();
      if (data.data) {
        setPipelineData(data.data);
        setNotification({ type: 'success', message: 'Loaded fresh synthetic demo cohort (20 patients)' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to generate synthetic cohort' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetOasis = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/reset-data', { method: 'POST' });
      const data = await res.json();
      if (data.data) {
        setPipelineData(data.data);
        setNotification({ type: 'success', message: 'Reset to standard OASIS-2 longitudinal cohort' });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to reset dataset' });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRecomputeEval = async () => {
    setIsRecomputingEval(true);
    try {
      const res = await fetch('/api/evaluate');
      const evalData = await res.json();
      if (pipelineData) {
        setPipelineData({ ...pipelineData, evaluation: evalData });
        setNotification({ type: 'success', message: `Held-Out Evaluation recomputed (AUC: ${evalData.auc.toFixed(3)})` });
      }
    } catch (err: any) {
      setNotification({ type: 'error', message: err.message || 'Failed to recompute evaluation' });
    } finally {
      setIsRecomputingEval(false);
    }
  };

  // Auto-dismiss notification after 4 seconds
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-slate-800 flex flex-col font-sans selection:bg-teal-500 selection:text-white">
      {/* Global Header */}
      <Header
        pipelineData={pipelineData}
        onOpenUpload={() => setIsUploadModalOpen(true)}
        onLoadSynthetic={handleLoadSynthetic}
        onResetOasis={handleResetOasis}
        onRunEvaluation={handleRecomputeEval}
        onOpenSanityTests={() => setIsSanityModalOpen(true)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isLoading={isLoading}
      />

      {/* Main Content Area */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-5 py-4 space-y-4">
        {/* Toast Notification */}
        {notification && (
          <div
            className={`p-3 rounded-lg border flex items-center justify-between gap-2 text-xs shadow-sm transition-all animate-in fade-in ${
              notification.type === 'success'
                ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                : 'bg-rose-50 border-rose-200 text-rose-800'
            }`}
          >
            <div className="flex items-center gap-2">
              {notification.type === 'success' ? (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              ) : (
                <AlertCircle className="w-4 h-4 text-rose-600" />
              )}
              <span className="font-medium">{notification.message}</span>
            </div>
            <button
              onClick={() => setNotification(null)}
              className="text-xs font-semibold opacity-75 hover:opacity-100 underline cursor-pointer"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Legend Bar (Visible on dashboard views) */}
        {activeTab !== 'landing' && <LegendBar />}

        {/* Tab 0: Landing Overview */}
        {activeTab === 'landing' && (
          <div className="animate-in fade-in duration-200">
            <LandingPage
              pipelineData={pipelineData}
              onLaunchDashboard={() => setActiveTab('triage')}
              onOpenArchitecture={() => setActiveTab('architecture')}
              onOpenEvaluation={() => setActiveTab('evaluation')}
              onOpenReferences={() => setActiveTab('references')}
            />
          </div>
        )}

        {/* Tab 1: Patient Prioritization Queue & 4-Stage Funnel */}
        {activeTab === 'triage' && pipelineData && (
          <div className="space-y-4 animate-in fade-in duration-150">
            <FunnelVisualizer
              funnel={pipelineData.funnel}
              onFilterByStage={stage => setSelectedStageFilter(stage)}
              selectedStageFilter={selectedStageFilter}
            />

            <PatientTable
              results={pipelineData.results}
              onSelectPatient={patient => setSelectedPatient(patient)}
              selectedPatientId={selectedPatient?.subjectId}
              selectedStageFilter={selectedStageFilter}
            />
          </div>
        )}

        {/* Tab 2: Live Held-Out Model Evaluation */}
        {activeTab === 'evaluation' && pipelineData && (
          <div className="animate-in fade-in duration-150">
            <EvaluationPanel
              evaluation={pipelineData.evaluation}
              onRecompute={handleRecomputeEval}
              isRecomputing={isRecomputingEval}
            />
          </div>
        )}

        {/* Tab 3: System Architecture & Mathematics */}
        {activeTab === 'architecture' && pipelineData && (
          <div className="animate-in fade-in duration-150">
            <ArchitecturePanel regression={pipelineData.regressionModel || pipelineData.regression} />
          </div>
        )}

        {/* Tab 4: Academic References & Research Grounding */}
        {activeTab === 'references' && (
          <div className="animate-in fade-in duration-150">
            <ReferencesPanel />
          </div>
        )}

        {/* Loading Indicator when initializing */}
        {isLoading && !pipelineData && (
          <div className="py-20 flex flex-col items-center justify-center gap-3 text-slate-500 text-xs">
            <RefreshCw className="w-8 h-8 text-teal-600 animate-spin" />
            <p className="font-medium">Initializing NeuroPulse triage engine & fitting regression norms...</p>
          </div>
        )}
      </main>

      {/* High Density Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 px-4 sm:px-6 py-2.5 text-[10px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-teal-500"></span>
            <span>Real Data (OASIS-2)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-orange-400"></span>
            <span>Simulated (NIA-AA ATN)</span>
          </div>
          <div className="flex items-center gap-1.5 font-medium text-slate-600">
            <span className="w-2 h-2 rounded-full bg-purple-500"></span>
            <span>Decision Priority (Severity × Urgency)</span>
          </div>
        </div>
        <div className="flex items-center gap-3 font-mono text-[10px] text-slate-400 italic">
          <span>Mungas (1996)</span>
          <span>•</span>
          <span>Pedraza (2012)</span>
          <span>•</span>
          <span>Kochhann (2010)</span>
          <span>•</span>
          <span>Marcus et al. (2010)</span>
        </div>
      </footer>

      {/* Patient Detail Modal */}
      {selectedPatient && (
        <PatientDetailModal
          patientResult={selectedPatient}
          onClose={() => setSelectedPatient(null)}
        />
      )}

      {/* Sanity Verification Modal */}
      {isSanityModalOpen && (
        <SanityTestModal onClose={() => setIsSanityModalOpen(false)} />
      )}

      {/* CSV Upload Modal */}
      {isUploadModalOpen && (
        <UploadModal
          onClose={() => setIsUploadModalOpen(false)}
          onUploadSuccess={csvText => {
            fetchPipelineData();
            setNotification({ type: 'success', message: 'Uploaded CSV successfully processed!' });
          }}
        />
      )}
    </div>
  );
}
