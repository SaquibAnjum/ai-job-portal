import React from 'react';
import { X, FileText, Download } from 'lucide-react';

const ResumePreviewModal = ({ isOpen, onClose, resumeUrl, originalName }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-4xl w-full h-[85vh] flex flex-col shadow-2xl overflow-hidden relative">
        <div className="p-4 sm:p-6 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50/80 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-100 dark:bg-indigo-600/20 text-indigo-600 dark:text-indigo-400 rounded-xl border border-indigo-200 dark:border-indigo-500/30">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{originalName || 'Resume Preview'}</h3>
              <p className="text-[11px] text-slate-500 dark:text-slate-400">Stored & Parsed on Cloudinary / MongoDB</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {resumeUrl && (
              <a
                href={resumeUrl}
                target="_blank"
                rel="noreferrer"
                download
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 transition"
              >
                <Download className="w-3.5 h-3.5" /> Download
              </a>
            )}
            <button onClick={onClose} className="p-2 text-slate-400 hover:text-slate-700 dark:hover:text-white rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition">
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex-1 bg-slate-100 dark:bg-slate-950 p-4 flex items-center justify-center overflow-hidden">
          {resumeUrl ? (
            <iframe
              src={resumeUrl}
              title="Resume Preview"
              className="w-full h-full rounded-2xl border border-slate-300 dark:border-slate-800 bg-white"
            />
          ) : (
            <div className="text-center space-y-3">
              <FileText className="w-12 h-12 text-slate-400 dark:text-slate-600 mx-auto animate-pulse" />
              <p className="text-xs text-slate-500 dark:text-slate-400">No active resume document uploaded yet.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ResumePreviewModal;
