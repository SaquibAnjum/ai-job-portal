import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Download,
  Flame,
  Key,
  Layers,
  ArrowRight,
  RefreshCw,
  Copy,
  Check,
  Zap,
} from 'lucide-react';

function AIResumeImproveModal({ isOpen, onClose, currentHeadline, currentProfile }) {
  const [targetRole, setTargetRole] = useState(currentHeadline || 'Senior Software Engineer');
  const [feedback, setFeedback] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('report'); // 'report' | 'comparison' | 'improved'
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (currentProfile?.atsReport && currentProfile.atsReport.atsScore) {
      setFeedback(currentProfile.atsReport);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleAnalyze = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/ai/resume-improve', { targetRole });
      setFeedback(res.data.data);
    } catch (err) {
      console.error('[ATS Optimizer Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleCopyImprovedText = () => {
    if (feedback?.improvedResumeText) {
      navigator.clipboard.writeText(feedback.improvedResumeText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadPdf = () => {
    const textToDownload = feedback?.improvedResumeText || 'ATS Optimized Resume';
    const blob = new Blob([textToDownload], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ATS_Optimized_Resume_${targetRole.replace(/\s+/g, '_')}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                AI ATS Resume Optimizer
                <span className="text-[10px] bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  Powered by Gemini AI
                </span>
              </h3>
              <p className="text-xs text-slate-400">Scan, audit, and rewrite your resume for peak applicant tracking scores</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        {/* Control Input */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Desired Role (e.g. Senior Full Stack Engineer)"
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-emerald-500 outline-none"
          />
          <button
            onClick={handleAnalyze}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Scanning with Gemini...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Run ATS Audit
              </>
            )}
          </button>
        </div>

        {/* View Switcher Tabs */}
        {feedback && (
          <div className="flex border-b border-slate-800 bg-slate-950/20 px-6">
            <button
              onClick={() => setActiveTab('report')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                activeTab === 'report' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              📊 ATS Score & Report
            </button>
            <button
              onClick={() => setActiveTab('comparison')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                activeTab === 'comparison' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              🔄 Before vs After Comparison
            </button>
            <button
              onClick={() => setActiveTab('improved')}
              className={`py-3 px-4 text-xs font-bold border-b-2 transition ${
                activeTab === 'improved' ? 'border-emerald-500 text-emerald-400' : 'border-transparent text-slate-400 hover:text-white'
              }`}
            >
              📄 Improved Resume Code
            </button>
          </div>
        )}

        {/* Main Content Area */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!feedback && !loading && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-emerald-500/10 text-emerald-400 mx-auto flex items-center justify-center border border-emerald-500/20">
                <Sparkles className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Click "Run ATS Audit" to Analyze Your Resume</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Gemini AI will inspect your extracted skills, experience bullet points, and formatting against active industry ATS scanners.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 space-y-4">
              <RefreshCw className="w-10 h-10 animate-spin text-emerald-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">Gemini AI is analyzing resume structure and computing ATS score...</p>
            </div>
          )}

          {feedback && !loading && activeTab === 'report' && (
            <div className="space-y-6">
              {/* ATS Score Header Card */}
              <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
                <div className="flex items-center gap-6">
                  <div className="relative flex items-center justify-center w-24 h-24 rounded-full bg-slate-900 ring-4 ring-emerald-500/30">
                    <div className="text-center">
                      <span className="text-3xl font-extrabold text-emerald-400">{feedback.atsScore || 86}</span>
                      <span className="block text-[9px] uppercase font-bold text-slate-400">ATS Score</span>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <h4 className="text-base font-extrabold text-white">Resume Match Strength</h4>
                    <p className="text-xs text-slate-300 leading-relaxed">{feedback.resumeStrength}</p>
                    <p className="text-[11px] text-emerald-400 font-semibold flex items-center gap-1 mt-1">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Ready for ATS candidate filtering
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleDownloadPdf}
                  className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/30 transition shrink-0"
                >
                  <Download className="w-4 h-4" /> Download Updated Resume (.md)
                </button>
              </div>

              {/* Grid Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Missing Keywords */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                    <Key className="w-4 h-4" /> Missing Keywords ({feedback.missingKeywords?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.missingKeywords?.map((kw, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-amber-950/50 text-amber-300 border border-amber-800/40 rounded-lg text-xs font-medium">
                        + {kw}
                      </span>
                    ))}
                  </div>
                </div>

                {/* Missing Skills */}
                <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                  <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider flex items-center gap-2">
                    <Flame className="w-4 h-4" /> Missing Skills ({feedback.missingSkills?.length || 0})
                  </h4>
                  <div className="flex flex-wrap gap-1.5">
                    {feedback.missingSkills?.map((sk, idx) => (
                      <span key={idx} className="px-2.5 py-1 bg-rose-950/50 text-rose-300 border border-rose-800/40 rounded-lg text-xs font-medium">
                        + {sk}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Verbs & Recruiter Suggestions */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-4">
                <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-2">
                  <Sparkles className="w-4 h-4" /> Recruiter Strategic Recommendations
                </h4>
                <ul className="space-y-2 text-xs text-slate-300">
                  {feedback.recruiterSuggestions?.map((sug, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">•</span>
                      <span>{sug}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* High Impact Action Verbs */}
              <div className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3">
                <h4 className="text-xs font-bold text-purple-400 uppercase tracking-wider flex items-center gap-2">
                  <Layers className="w-4 h-4" /> Recommended Power Action Verbs
                </h4>
                <div className="flex flex-wrap gap-2">
                  {feedback.actionVerbs?.map((verb, idx) => (
                    <span key={idx} className="px-3 py-1 bg-purple-950/40 text-purple-300 border border-purple-800/30 rounded-lg text-xs font-bold">
                      {verb}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB: Before vs After Comparison */}
          {feedback && !loading && activeTab === 'comparison' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Current Profile Summary */}
                <div className="p-5 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                    <span className="text-xs font-bold text-slate-400 uppercase">Current Resume Summary</span>
                    <span className="text-[10px] bg-slate-800 px-2 py-0.5 rounded text-slate-400">Original</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed italic">
                    "{currentProfile?.resumeSummary || 'Standard full stack software developer profile.'}"
                  </p>

                  <div className="pt-3 border-t border-slate-800">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-2">Original Experience Bullets:</span>
                    <ul className="text-xs text-slate-400 space-y-1 list-disc list-inside">
                      {currentProfile?.experience?.slice(0, 2).map((exp, idx) => (
                        <li key={idx}>{exp.description || `${exp.title} at ${exp.company}`}</li>
                      )) || <li>Worked on web application features and API endpoints.</li>}
                    </ul>
                  </div>
                </div>

                {/* Improved Profile Summary */}
                <div className="p-5 rounded-2xl bg-emerald-950/20 border border-emerald-500/30 space-y-3">
                  <div className="flex items-center justify-between border-b border-emerald-500/20 pb-2">
                    <span className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-1">
                      <Sparkles className="w-3.5 h-3.5" /> Improved ATS Summary
                    </span>
                    <span className="text-[10px] bg-emerald-500/20 text-emerald-300 px-2 py-0.5 rounded font-bold">
                      Optimized
                    </span>
                  </div>
                  <p className="text-xs text-slate-200 leading-relaxed italic font-medium">
                    "{feedback.improveSummary}"
                  </p>

                  <div className="pt-3 border-t border-emerald-500/20">
                    <span className="text-[11px] font-semibold text-emerald-300 block mb-2">Quantified Experience Bullets:</span>
                    <ul className="text-xs text-slate-200 space-y-2">
                      {feedback.improveExperience?.map((exp, idx) => (
                        <li key={idx} className="flex items-start gap-1.5">
                          <ArrowRight className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                          <span>{exp}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: Improved Resume Markdown Code */}
          {feedback && !loading && activeTab === 'improved' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-300 uppercase">Generated ATS Markdown Document</span>
                <button
                  onClick={handleCopyImprovedText}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center gap-1.5 transition"
                >
                  {copied ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copied ? 'Copied!' : 'Copy Code'}
                </button>
              </div>

              <pre className="p-5 bg-slate-950 border border-slate-800 rounded-2xl text-slate-300 text-xs font-mono leading-relaxed overflow-x-auto whitespace-pre-wrap">
                {feedback.improvedResumeText}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIResumeImproveModal;
