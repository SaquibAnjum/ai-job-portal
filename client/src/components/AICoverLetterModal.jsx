import React, { useState } from 'react';
import axios from 'axios';

function AICoverLetterModal({ isOpen, onClose, jobTitle, companyName, onApplyWithCoverLetter }) {
  const [coverLetter, setCoverLetter] = useState('');
  const [generating, setGenerating] = useState(false);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      const res = await axios.post('/api/v1/ai/cover-letter', { jobTitle, companyName });
      setCoverLetter(res.data.coverLetter || '');
    } catch (err) {
      console.error(err);
    } finally {
      setGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold"
        >
          ✕
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-2">
          <span>✨</span> AI Cover Letter Generator
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
          Generate a tailored, professional cover letter for <strong className="text-indigo-600 dark:text-indigo-400">{jobTitle}</strong> at <strong className="text-indigo-600 dark:text-indigo-400">{companyName}</strong>.
        </p>

        {!coverLetter && (
          <div className="text-center py-8 border-2 border-dashed border-slate-200 dark:border-slate-700 rounded-xl mb-4 bg-slate-50 dark:bg-slate-900/40">
            <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Let Gemini AI draft a personalized cover letter matching your resume skills.</p>
            <button
              onClick={handleGenerate}
              disabled={generating}
              className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
            >
              {generating ? 'Generating Letter with AI...' : 'Generate Cover Letter'}
            </button>
          </div>
        )}

        {coverLetter && (
          <div className="mb-4">
            <textarea
              rows={10}
              value={coverLetter}
              onChange={(e) => setCoverLetter(e.target.value)}
              className="w-full p-4 glass-input rounded-xl text-sm leading-relaxed outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        )}

        <div className="flex items-center justify-end gap-3">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 dark:hover:bg-slate-600 text-slate-700 dark:text-slate-200 text-sm font-semibold rounded-xl transition"
          >
            Cancel
          </button>
          {coverLetter && (
            <button
              onClick={() => onApplyWithCoverLetter(coverLetter)}
              className="px-6 py-2 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm rounded-xl transition shadow-lg shadow-emerald-600/30"
            >
              Apply with This Cover Letter
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

export default AICoverLetterModal;
