import React, { useState, useEffect } from 'react';
import axios from 'axios';

function ResumeVersionManager({ onVersionChanged }) {
  const [versions, setVersions] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchVersions = async () => {
    try {
      const res = await axios.get('/api/v1/candidate/resumes/versions');
      setVersions(res.data.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVersions();
  }, []);

  const handleActivate = async (id) => {
    try {
      await axios.put(`/api/v1/candidate/resumes/versions/${id}/activate`);
      fetchVersions();
      if (onVersionChanged) onVersionChanged();
    } catch (err) {
      console.error(err);
    }
  };

  if (loading) return <div className="text-slate-500 dark:text-slate-400 text-sm animate-pulse">Loading resume versions...</div>;

  return (
    <div className="glass-card border border-slate-200 dark:border-slate-800 rounded-2xl p-6 shadow-lg mb-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <span>📄</span> Resume Version History
        </h3>
        <span className="text-xs px-2.5 py-1 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 rounded-full font-medium">{versions.length} Version(s)</span>
      </div>

      {versions.length === 0 ? (
        <p className="text-sm text-slate-500 dark:text-slate-400">No previous resume versions uploaded yet.</p>
      ) : (
        <div className="space-y-3">
          {versions.map((ver) => (
            <div
              key={ver._id}
              className={`p-4 rounded-xl border flex flex-col md:flex-row md:items-center justify-between gap-4 transition ${
                ver.isActive
                  ? 'bg-indigo-50 dark:bg-indigo-900/20 border-indigo-300 dark:border-indigo-500/50 shadow-md shadow-indigo-500/10'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
              }`}
            >
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-bold text-slate-800 dark:text-slate-200 text-sm">Version {ver.versionNumber}</span>
                  {ver.isActive && (
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 border border-emerald-300 dark:border-emerald-500/30 rounded-md">
                      Active
                    </span>
                  )}
                </div>
                <div className="text-xs text-slate-600 dark:text-slate-400">{ver.originalName}</div>
                <div className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Uploaded: {new Date(ver.createdAt).toLocaleDateString()}</div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={ver.resumeUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 rounded-lg border border-slate-300 dark:border-slate-600 transition"
                >
                  Preview PDF
                </a>
                {!ver.isActive && (
                  <button
                    onClick={() => handleActivate(ver._id)}
                    className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white rounded-lg transition shadow-md shadow-indigo-600/20"
                  >
                    Set as Active
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ResumeVersionManager;
