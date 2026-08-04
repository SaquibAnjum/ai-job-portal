import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Briefcase, Users, Plus, Sparkles, CheckCircle2, XCircle, Calendar, FileDown, Search, Loader2, ShieldCheck, Trophy } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchGauge from '../components/MatchGauge';
import ApplicantRankingModal from '../components/ApplicantRankingModal';

const RecruiterDashboard = () => {
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Form states
  const [newTitle, setNewTitle] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [jobStatus, setJobStatus] = useState('Active');
  const [generatingJd, setGeneratingJd] = useState(false);

  useEffect(() => {
    fetchRecruiterData();
  }, []);

  const fetchRecruiterData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profRes, analRes, jobsRes] = await Promise.all([
        axios.get('/api/v1/recruiter/profile', { headers }),
        axios.get('/api/v1/recruiter/analytics', { headers }),
        axios.get('/api/v1/recruiter/my-jobs', { headers }),
      ]);

      setProfile(profRes.data.data);
      setAnalytics(analRes.data.data);

      const recruiterJobs = jobsRes.data.data || [];
      setJobs(recruiterJobs);

      if (recruiterJobs.length > 0) {
        setSelectedJobId(recruiterJobs[0]._id);
        fetchRankedApplicants(recruiterJobs[0]._id);
      }

      setLoading(false);
    } catch (err) {
      console.error('[Recruiter Dashboard Error]:', err);
      setLoading(false);
    }
  };

  const fetchRankedApplicants = async (jobId) => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get(`/api/v1/applications/job/${jobId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      setRankedCandidates(res.data.data);
    } catch (err) {
      console.error('[Ranked Applicants Error]:', err);
    }
  };

  const handleRequestVerification = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post('/api/v1/recruiter/request-verification', {}, { headers: { Authorization: `Bearer ${token}` } });
      alert('Verification request submitted to platform administrators!');
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleGenerateJd = async () => {
    if (!newTitle || !newSkills) return;
    setGeneratingJd(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/v1/jobs/generate-jd',
        { role: newTitle, skills: newSkills.split(',') },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setNewDescription(res.data.description);
    } catch (err) {
      console.error(err);
    } finally {
      setGeneratingJd(false);
    }
  };

  const handleCreateJob = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/jobs',
        {
          title: newTitle,
          requiredSkills: newSkills.split(',').map((s) => s.trim()),
          description: newDescription,
          status: jobStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateModal(false);
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Draft' : 'Active';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/jobs/${jobId}/status`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    if (status === 'Rejected') {
      setRejectingAppId(appId);
      return;
    }
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/v1/applications/${appId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (selectedJobId) fetchRankedApplicants(selectedJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const handleConfirmReject = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        `/api/v1/recruiter/applications/${rejectingAppId}/reject`,
        { rejectionReason },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setRejectingAppId(null);
      setRejectionReason('');
      if (selectedJobId) fetchRankedApplicants(selectedJobId);
    } catch (err) {
      console.error(err);
    }
  };

  const selectedJobObj = jobs.find((j) => j._id === selectedJobId);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Recruiter Banner & Metrics */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-extrabold text-white">Recruiter Command Center</h1>
              {profile?.company?.isVerified ? (
                <span className="flex items-center gap-1 text-[10px] bg-emerald-500/20 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Company
                </span>
              ) : (
                <button
                  onClick={handleRequestVerification}
                  className="text-[10px] bg-amber-500/20 text-amber-300 px-2.5 py-0.5 rounded-full border border-amber-500/30 hover:bg-amber-500/30 transition"
                >
                  {profile?.company?.verificationRequested ? 'Verification Pending...' : 'Request Verification'}
                </button>
              )}
            </div>
            <p className="text-xs text-indigo-400 font-medium mt-0.5">{profile?.company?.name || 'Nexus AI Technologies'}</p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => setIsRankingModalOpen(true)}
              className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-purple-300 border border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition"
            >
              <Trophy className="w-4 h-4 text-purple-400" /> AI Applicant Ranking
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition-all hover:scale-105"
            >
              <Plus className="w-4 h-4" /> Create Job (AI)
            </button>
          </div>
        </div>

        {/* Analytics Widgets */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Active Jobs</p>
            <p className="text-2xl font-extrabold text-white mt-1">{analytics?.activeJobs || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Draft Jobs</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{analytics?.draftJobs || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Total Applicants</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{analytics?.totalApplications || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Offers Issued</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{analytics?.funnel?.offered || 0}</p>
          </div>
        </div>

        {/* AI Candidate Ranking Engine */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Job Selector Sidebar */}
          <div className="lg:col-span-1 glass-card p-6 rounded-3xl border border-slate-800 space-y-4">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">Your Posted Positions</h3>
            <div className="space-y-2">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-2 ${
                    selectedJobId === job._id
                      ? 'bg-indigo-600/20 border-indigo-500 text-white shadow-lg shadow-indigo-500/20 font-bold'
                      : 'bg-slate-950/60 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <button
                    onClick={() => {
                      setSelectedJobId(job._id);
                      fetchRankedApplicants(job._id);
                    }}
                    className="text-left flex-1"
                  >
                    <p className="font-bold text-slate-200 text-xs">{job.title}</p>
                    <span
                      className={`inline-block mt-1 text-[9px] px-2 py-0.5 rounded-md font-bold uppercase ${
                        job.status === 'Active' ? 'bg-emerald-500/20 text-emerald-300' : 'bg-amber-500/20 text-amber-300'
                      }`}
                    >
                      {job.status}
                    </span>
                  </button>

                  <button
                    onClick={() => handleToggleJobStatus(job._id, job.status)}
                    className="text-[10px] text-slate-400 hover:text-white px-2 py-1 bg-slate-900 border border-slate-800 rounded-md"
                  >
                    {job.status === 'Active' ? 'Unpublish' : 'Publish'}
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Candidate AI Ranking List */}
          <div className="lg:col-span-2 glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Candidate Pipeline for {selectedJobObj?.title || 'Selected Job'}
              </h2>
              <button
                onClick={() => setIsRankingModalOpen(true)}
                className="text-xs text-indigo-400 hover:underline font-bold"
              >
                View Full AI Ranking Matrix →
              </button>
            </div>

            {rankedCandidates.length === 0 ? (
              <p className="text-xs text-slate-400 py-8 text-center">No applications submitted for this role yet.</p>
            ) : (
              <div className="space-y-4">
                {rankedCandidates.map((app) => (
                  <div
                    key={app._id}
                    className="p-5 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-3"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={app.candidate?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                          alt={app.candidate?.name}
                          className="w-10 h-10 rounded-xl object-cover ring-1 ring-slate-700"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-white">{app.candidate?.name}</h4>
                          <p className="text-[11px] text-slate-400">{app.candidate?.email}</p>
                        </div>
                      </div>

                      <MatchGauge score={app.aiMatchAnalysis?.matchScore || 90} size="sm" />
                    </div>

                    <p className="text-xs text-slate-300 bg-slate-900 p-3 rounded-xl border border-slate-800/80">
                      <span className="font-bold text-indigo-400">AI Reasoning:</span> {app.aiMatchAnalysis?.matchReason}
                    </p>

                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <span className="text-[10px] font-bold px-2.5 py-1 rounded-md bg-slate-900 text-slate-300 border border-slate-800">
                        Status: {app.status}
                      </span>

                      <div className="flex gap-2 text-xs font-semibold">
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 hover:bg-emerald-500/30"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Rejected')}
                          className="px-3 py-1.5 rounded-lg bg-rose-500/20 text-rose-300 border border-rose-500/30 hover:bg-rose-500/30"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Create Job Modal with Gemini AI Generator & Draft toggle */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="glass-card w-full max-w-xl p-8 rounded-3xl border border-slate-800 space-y-6">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-400" /> Create Job Posting
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior MERN Stack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="React.js, Node.js, Express, MongoDB, Tailwind CSS"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                />
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-300">Job Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateJd}
                    disabled={generatingJd}
                    className="text-[11px] font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> {generatingJd ? 'Generating AI JD...' : 'Generate with Gemini'}
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Status</label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-xs text-white"
                >
                  <option value="Active">Publish Immediately (Active)</option>
                  <option value="Draft font-bold">Save as Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold"
                >
                  Save Job
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Reject Reason Modal */}
      {rejectingAppId && (
        <div className="fixed inset-0 z-50 bg-black/75 flex items-center justify-center p-4">
          <div className="bg-slate-800 border border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-rose-400">Reject Candidate Application</h3>
            <p className="text-xs text-slate-400">Provide constructive feedback or rejection reasoning for the candidate:</p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Qualifications do not align with current senior level requirements."
              className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-slate-100"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectingAppId(null)} className="px-4 py-2 text-xs text-slate-400">
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <ApplicantRankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        jobId={selectedJobId}
        jobTitle={selectedJobObj?.title}
      />

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
