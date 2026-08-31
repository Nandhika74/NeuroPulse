import React, { useState, useRef } from 'react';
import { X, Upload, FileText, Download, AlertCircle, CheckCircle2, RefreshCw } from 'lucide-react';
import { generateSyntheticOASIS } from '../data/syntheticGenerator';

interface UploadModalProps {
  onClose: () => void;
  onUploadSuccess: (csvText: string) => void;
}

export const UploadModal: React.FC<UploadModalProps> = ({
  onClose,
  onUploadSuccess,
}) => {
  const [isDragging, setIsDragging] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileProcess = async (file: File) => {
    if (!file.name.endsWith('.csv') && file.type !== 'text/csv' && file.type !== 'application/vnd.ms-excel') {
      setErrorMessage('Please upload a valid .csv file (e.g. oasis_longitudinal.csv).');
      return;
    }

    setIsUploading(true);
    setErrorMessage(null);
    setSuccessMessage(null);

    try {
      const text = await file.text();
      const res = await fetch('/api/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ csvText: text }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Failed to process dataset');
      }

      setSuccessMessage(data.message || 'Dataset loaded successfully!');
      setTimeout(() => {
        onUploadSuccess(text);
        onClose();
      }, 1000);
    } catch (err: any) {
      setErrorMessage(err.message || 'Failed to parse uploaded CSV');
    } finally {
      setIsUploading(false);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleDownloadSample = () => {
    const sampleCsv = generateSyntheticOASIS(15);
    const blob = new Blob([sampleCsv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'oasis_longitudinal_sample.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
      <div
        id="csv-upload-modal"
        className="bg-white border border-slate-200 rounded-xl max-w-lg w-full p-5 shadow-xl flex flex-col gap-3.5 text-slate-800 animate-in fade-in zoom-in-95 duration-150"
      >
        <div className="flex items-center justify-between border-b border-slate-200 pb-2.5">
          <div className="flex items-center gap-2">
            <Upload className="w-4 h-4 text-teal-600" />
            <h2 className="text-sm font-bold text-slate-900">Upload OASIS-2 Dataset (.csv)</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <p className="text-xs text-slate-600 leading-relaxed">
          Upload your real <code className="text-teal-700 bg-teal-50 px-1 py-0.2 rounded border border-teal-200 font-mono">oasis_longitudinal.csv</code> or standard OASIS-2 cohort. The system will automatically parse longitudinal visit sequences, fit the education-adjusted regression baseline, and run the 4-stage prioritization pipeline.
        </p>

        {/* Drag and Drop Box */}
        <div
          id="dropzone-upload"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-1.5 ${
            isDragging
              ? 'border-teal-500 bg-teal-50'
              : 'border-slate-300 bg-slate-50 hover:border-slate-400 hover:bg-slate-100/70'
          }`}
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".csv"
            className="hidden"
            onChange={e => {
              if (e.target.files && e.target.files.length > 0) {
                handleFileProcess(e.target.files[0]);
              }
            }}
          />

          <div className="w-10 h-10 rounded-full bg-teal-100/80 text-teal-700 flex items-center justify-center mb-0.5">
            <FileText className="w-5 h-5" />
          </div>

          <div className="text-xs font-semibold text-slate-800">
            {isUploading ? 'Parsing dataset...' : 'Click to select or drag & drop CSV here'}
          </div>
          <span className="text-[11px] text-slate-500">
            Supports standard OASIS-2 columns: Subject ID, Visit, Age, EDUC, MMSE, nWBV, CDR
          </span>
        </div>

        {/* Status alerts */}
        {errorMessage && (
          <div className="p-2.5 rounded bg-rose-50 border border-rose-200 text-rose-700 text-xs flex items-center gap-2">
            <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
            <span>{errorMessage}</span>
          </div>
        )}

        {successMessage && (
          <div className="p-2.5 rounded bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 text-emerald-600" />
            <span>{successMessage}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-200 text-xs">
          <button
            onClick={handleDownloadSample}
            className="flex items-center gap-1.5 text-teal-700 hover:text-teal-800 hover:underline cursor-pointer font-medium"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Sample OASIS-2 CSV</span>
          </button>

          <button
            onClick={onClose}
            className="px-3 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 font-medium transition-colors cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
