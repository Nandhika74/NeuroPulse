import React, { useState, useEffect } from 'react';
import { X, CheckCircle2, AlertCircle, RefreshCw, ShieldCheck, Play, Layers } from 'lucide-react';
import { SanityTestCase } from '../types';

interface SanityTestModalProps {
  onClose: () => void;
}

export const SanityTestModal: React.FC<SanityTestModalProps> = ({ onClose }) => {
  const [tests, setTests] = useState<SanityTestCase[]>([]);
  const [allPassed, setAllPassed] = useState<boolean>(true);
  const [executedAt, setExecutedAt] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const fetchAndRunTests = async () => {
    setIsLoading(true);
    try {
      const res = await fetch('/api/tests');
      const data = await res.json();
      setTests(data.tests || []);
      setAllPassed(data.allPassed ?? true);
      setExecutedAt(data.executedAt || new Date().toISOString());
    } catch (err) {
      console.error('Failed to run sanity tests:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAndRunTests();
  }, []);

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
      <div
        id="sanity-test-modal"
        className="bg-white border border-slate-200 rounded-xl max-w-3xl w-full max-h-[90vh] flex flex-col shadow-xl overflow-hidden text-slate-800 animate-in fade-in zoom-in-95 duration-150"
      >
        {/* Header */}
        <div className="p-3.5 sm:p-4 border-b border-slate-200 flex items-center justify-between bg-slate-50">
          <div className="flex items-center gap-3">
            <div
              className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                allPassed ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-rose-50 text-rose-600 border border-rose-200'
              }`}
            >
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-sm font-bold text-slate-900">Clinical Sanity Verification Suite</h2>
                <span
                  className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full uppercase tracking-wider font-mono ${
                    allPassed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                  }`}
                >
                  {allPassed ? 'ALL TESTS PASSED' : 'TESTS FAILED'}
                </span>
              </div>
              <p className="text-xs text-slate-500">
                Hand-constructed edge cases verifying demographic fairness, trajectory detection, and sign correctness.
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-200/60 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Test List */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 text-xs">
          <div className="flex items-center justify-between bg-slate-50 p-2.5 rounded border border-slate-200">
            <span className="text-slate-700 font-medium">
              Ran {tests.length} automated clinical test cases
            </span>
            <button
              onClick={fetchAndRunTests}
              disabled={isLoading}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded bg-teal-600 hover:bg-teal-500 text-white text-xs font-semibold cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3 h-3 ${isLoading ? 'animate-spin' : ''}`} />
              <span>Re-run Suite</span>
            </button>
          </div>

          <div className="space-y-2.5">
            {tests.map(test => (
              <div
                key={test.id}
                id={`test-card-${test.id}`}
                className={`p-3 rounded-lg border ${
                  test.passed
                    ? 'bg-white border-emerald-200 shadow-2xs'
                    : 'bg-rose-50/70 border-rose-200'
                }`}
              >
                <div className="flex items-start justify-between gap-2 mb-1.5">
                  <div className="flex items-center gap-2">
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[9px] font-bold font-mono ${
                        test.passed ? 'bg-emerald-100 text-emerald-700' : 'bg-rose-100 text-rose-700'
                      }`}
                    >
                      {test.passed ? '✓' : '✗'}
                    </span>
                    <h3 className="font-bold text-slate-800 text-xs">
                      [{test.id}] {test.name}
                    </h3>
                  </div>

                  <span
                    className={`text-[9px] font-mono px-1.5 py-0.2 rounded font-bold ${
                      test.passed ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'
                    }`}
                  >
                    {test.passed ? 'PASS' : 'FAIL'}
                  </span>
                </div>

                <p className="text-slate-600 text-xs mb-2 leading-relaxed">
                  {test.description}
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono bg-slate-50 p-2 rounded border border-slate-200">
                  <div>
                    <span className="text-slate-500">Expected: </span>
                    <span className="text-slate-800">{test.expectedOutcome}</span>
                  </div>
                  <div>
                    <span className="text-slate-500">Actual: </span>
                    <span className={test.passed ? 'text-emerald-700 font-semibold' : 'text-rose-700 font-bold'}>
                      {test.actualOutcome}
                    </span>
                  </div>
                </div>

                <div className="mt-1.5 text-[11px] text-slate-500 italic">
                  <strong className="text-slate-700">Clinical Rationale:</strong> {test.rationale}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-slate-200 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span>Executed at: {executedAt ? new Date(executedAt).toLocaleTimeString() : '...'}</span>
          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-200 hover:bg-slate-300 text-slate-700 font-semibold cursor-pointer"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
