import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ApplicantRankingModal({ isOpen, onClose, jobId, jobTitle }) {
  const [rankedApplicants, setRankedApplicants] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (isOpen && jobId) {
      setLoading(true);
      const token = localStorage.getItem('token');
      axios
        .get(`/api/v1/ai/rank-applicants/${jobId}`, {
          headers: { Authorization: `Bearer ${token}` },
        })
        .then((res) => {
          setRankedApplicants(res.data.data || []);
        })
        .catch(console.error)
        .finally(() => setLoading(false));
    }
  }, [isOpen, jobId]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-4xl w-full p-6 shadow-2xl relative max-h-[90vh] overflow-y-auto">
        <button onClick={onClose} className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 text-xl font-bold">
          ✕
        </button>

        <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2 mb-1">
          <span>🏆</span> AI Ranked Applicants for {jobTitle}
        </h3>
        <p className="text-slate-600 dark:text-slate-400 text-sm mb-6">
          Multi-factor AI ranking evaluating skill overlap, experience match, and vector semantic similarity.
        </p>

        {loading ? (
          <div className="py-12 text-center text-slate-500 dark:text-slate-400 animate-pulse">Running Gemini AI vector ranking...</div>
        ) : rankedApplicants.length === 0 ? (
          <div className="py-8 text-center text-slate-500 dark:text-slate-400">No applicants to rank yet for this position.</div>
        ) : (
          <div className="space-y-4">
            {rankedApplicants.map((app, idx) => {
              const cand = app.candidate || {};
              const profile = cand.candidateProfile || {};
              return (
                <div key={app._id} className="p-4 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600 text-white font-extrabold text-sm flex items-center justify-center">
                      #{idx + 1}
                    </div>
                    <img src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'} alt="" className="w-12 h-12 rounded-full object-cover border border-slate-300 dark:border-slate-700" />
                    <div>
                      <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm">{cand.name}</h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400">{profile.headline || cand.email}</p>
                      <div className="flex gap-2 mt-1">
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">Skill Match: <strong className="text-emerald-600 dark:text-emerald-400">{app.skillMatchScore}%</strong></span>
                        <span className="text-[11px] text-slate-600 dark:text-slate-400">Semantic Match: <strong className="text-purple-600 dark:text-purple-400">{app.semanticMatchScore}%</strong></span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <span className="text-[10px] uppercase font-bold text-slate-500 dark:text-slate-400">Composite AI Score</span>
                      <div className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{app.calculatedRankScore}%</div>
                    </div>
                    <a href={app.resumeUrl} target="_blank" rel="noreferrer" className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-slate-600 rounded-lg transition">
                      Resume PDF
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

export default ApplicantRankingModal;
