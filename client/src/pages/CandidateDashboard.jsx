import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import axios from 'axios';
import {
  Sparkles,
  Clock,
  BookOpen,
  Loader2,
  TrendingUp,
  ShieldCheck,
  Edit3,
  AlertCircle,
  Eye,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ResumeUploader from '../components/ResumeUploader';
import JobCard from '../components/JobCard';
import MatchGauge from '../components/MatchGauge';
import ResumeVersionManager from '../components/ResumeVersionManager';
import AIRoadmapModal from '../components/AIRoadmapModal';
import AIResumeImproveModal from '../components/AIResumeImproveModal';
import EditProfileModal from '../components/EditProfileModal';
import ResumePreviewModal from '../components/ResumePreviewModal';
import { updateUserInState } from '../redux/slices/authSlice';

const CandidateDashboard = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const [profile, setProfile] = useState(null);
  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modals
  const [isRoadmapOpen, setIsRoadmapOpen] = useState(false);
  const [isImproveOpen, setIsImproveOpen] = useState(false);
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isPreviewResumeOpen, setIsPreviewResumeOpen] = useState(false);

  const fetchDashboardData = async () => {
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const [profRes, appRes, recRes] = await Promise.all([
        axios.get('/api/v1/candidate/profile', { headers }),
        axios.get('/api/v1/applications/my-applications', { headers }),
        axios.get('/api/v1/candidate/recommendations', { headers }),
      ]);

      const profData = profRes.data.data;
      setProfile(profData);
      setApplications(appRes.data.data);
      setRecommendations(recRes.data.data);

      if (profData?.user) {
        dispatch(updateUserInState({ user: profData.user, profile: profData }));
      }

      setLoading(false);
    } catch (err) {
      console.error('[Dashboard Error]:', err);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleWithdraw = async (appId) => {
    if (!window.confirm('Are you sure you want to withdraw this application?')) return;
    try {
      await axios.post(`/api/v1/candidate/applications/${appId}/withdraw`);
      fetchDashboardData();
    } catch (err) {
      console.error(err);
    }
  };

  // Calculate Profile Completion %
  const calculateCompletion = (prof, usr) => {
    if (!prof) return 20;
    let score = 0;
    if (usr?.name || prof.name) score += 10;
    if (usr?.avatar || prof.profilePhotoUrl) score += 10;
    if (prof.headline) score += 10;
    if (prof.bio) score += 10;
    if (prof.phone || usr?.phone) score += 10;
    if (prof.location) score += 10;
    if (prof.skills && prof.skills.length > 0) score += 15;
    if (prof.experience && prof.experience.length > 0) score += 15;
    if (prof.resumeUrl) score += 10;
    return Math.min(100, score);
  };

  const completionPct = calculateCompletion(profile, user);

  // Profile Strength Badge
  const getStrengthBadge = (pct) => {
    if (pct >= 90) return { label: 'All-Star Profile', color: 'text-emerald-700 dark:text-emerald-400 border-emerald-300 dark:border-emerald-500/30 bg-emerald-100 dark:bg-emerald-500/10' };
    if (pct >= 70) return { label: 'Strong Profile', color: 'text-indigo-700 dark:text-indigo-400 border-indigo-300 dark:border-indigo-500/30 bg-indigo-100 dark:bg-indigo-500/10' };
    if (pct >= 40) return { label: 'Intermediate Profile', color: 'text-amber-700 dark:text-amber-400 border-amber-300 dark:border-amber-500/30 bg-amber-100 dark:bg-amber-500/10' };
    return { label: 'Incomplete Profile', color: 'text-rose-700 dark:text-rose-400 border-rose-300 dark:border-rose-500/30 bg-rose-100 dark:bg-rose-500/10' };
  };

  const strengthBadge = getStrengthBadge(completionPct);

  // Calculate Average Match Score across Recommendations
  const avgMatchScore = recommendations.length > 0
    ? Math.round(recommendations.reduce((acc, curr) => acc + (curr.matchScore || 70), 0) / recommendations.length)
    : 78;

  // Aggregate missing skills across recommendations
  const aggregatedMissingSkills = Array.from(
    new Set(recommendations.flatMap((r) => r.missingSkills || []))
  ).slice(0, 8);

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center space-y-4">
        <Loader2 className="w-10 h-10 animate-spin text-indigo-600 dark:text-indigo-500" />
        <p className="text-xs font-bold text-slate-600 dark:text-slate-400">Loading Smart Dashboard & AI Analytics...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Top Header Profile Card */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
          <div className="flex items-center gap-5">
            <div className="relative">
              <img
                src={profile?.profilePhotoUrl || user?.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'}
                alt={user?.name}
                className="w-20 h-20 rounded-2xl object-cover ring-4 ring-indigo-500/30 shadow-xl"
              />
              <button
                onClick={() => setIsEditProfileOpen(true)}
                className="absolute -bottom-2 -right-2 p-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl shadow border border-indigo-400/40 transition"
                title="Change Photo"
              >
                <Edit3 className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-1">
              <div className="flex flex-wrap items-center gap-2">
                <h1 className="text-xl font-extrabold text-slate-900 dark:text-white">{user?.name || 'Candidate'}</h1>
                <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border ${strengthBadge.color}`}>
                  {strengthBadge.label}
                </span>
                {user?.isVerified && (
                  <span className="flex items-center gap-1 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-400 px-2 py-0.5 rounded-md border border-emerald-300 dark:border-emerald-500/30">
                    <ShieldCheck className="w-3 h-3" /> Verified Candidate
                  </span>
                )}
              </div>
              <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold">{profile?.headline || 'Full Stack Software Engineer'}</p>
              <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1">
                <span>📍 {profile?.location || 'Remote / New York, NY'}</span>
                {profile?.phone && <span>• 📞 {profile.phone}</span>}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsEditProfileOpen(true)}
              className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
            >
              <Edit3 className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Edit Profile
            </button>
            {profile?.resumeUrl && (
              <button
                onClick={() => setIsPreviewResumeOpen(true)}
                className="px-4 py-2.5 bg-white dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-white text-xs font-bold rounded-xl transition flex items-center gap-1.5 shadow-md"
              >
                <Eye className="w-4 h-4 text-purple-600 dark:text-purple-400" /> Preview Resume
              </button>
            )}
            <button
              onClick={() => setIsImproveOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-emerald-600/20 flex items-center gap-1.5"
            >
              <Sparkles className="w-4 h-4" /> AI ATS Optimizer
            </button>
            <button
              onClick={() => setIsRoadmapOpen(true)}
              className="px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white text-xs font-bold rounded-xl transition shadow-lg shadow-indigo-600/20 flex items-center gap-1.5"
            >
              <TrendingUp className="w-4 h-4" /> AI Career Roadmap
            </button>
          </div>
        </div>

        {/* SMART DASHBOARD METRICS BAR */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
          {/* Profile Completion */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Profile Completion</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-indigo-600 dark:text-indigo-400">{completionPct}%</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Target 100%</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500" style={{ width: `${completionPct}%` }} />
            </div>
          </div>

          {/* ATS Score */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">ATS Resume Score</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">{profile?.atsReport?.atsScore || 86}/100</span>
              <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold">Passing</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-emerald-500 rounded-full" style={{ width: `${profile?.atsReport?.atsScore || 86}%` }} />
            </div>
          </div>

          {/* Average Job Match */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Avg Job Match %</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-purple-600 dark:text-purple-400">{avgMatchScore}%</span>
              <span className="text-[10px] text-purple-600 dark:text-purple-400 font-bold">Strong</span>
            </div>
            <div className="w-full h-1.5 bg-slate-200 dark:bg-slate-900 rounded-full overflow-hidden">
              <div className="h-full bg-purple-500 rounded-full" style={{ width: `${avgMatchScore}%` }} />
            </div>
          </div>

          {/* Applications */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Applications</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-slate-900 dark:text-white">{applications.length}</span>
              <span className="text-[10px] text-slate-500 dark:text-slate-400">Active</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {applications.filter((a) => a.status === 'Interviewing').length} Interviewing
            </p>
          </div>

          {/* Recommended Jobs */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Recommended Jobs</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xl font-extrabold text-teal-600 dark:text-teal-400">{recommendations.length}</span>
              <span className="text-[10px] text-teal-600 dark:text-teal-400 font-bold">Matched</span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">Updated by Gemini</p>
          </div>

          {/* Resume Version */}
          <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">Cloudinary Resume</span>
            <div className="flex items-baseline justify-between">
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 truncate">
                {profile?.resumeUrl ? 'Active & Parsed' : 'Not Uploaded'}
              </span>
            </div>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">
              {profile?.resumeOriginalName || 'Cloudinary Sync'}
            </p>
          </div>
        </div>

        {/* Main Grid Section */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column: Upload Resume, Version History, Skill Insights */}
          <div className="lg:col-span-1 space-y-6">
            <ResumeUploader onUploadSuccess={() => fetchDashboardData()} />

            <ResumeVersionManager onVersionChanged={() => fetchDashboardData()} />

            {/* AI Skill Insights & Missing Skills Widget */}
            <div className="glass-card p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <h3 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Skill Insights
                </span>
                <span className="text-[10px] text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded-full border border-indigo-200 dark:border-indigo-500/20">
                  {profile?.skills?.length || 0} Verified
                </span>
              </h3>

              <div className="space-y-4">
                <div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-2 font-semibold">Extracted Profile Skills:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {profile?.skills?.map((s, idx) => (
                      <span key={idx} className="px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[11px] font-medium border border-indigo-200 dark:border-indigo-500/20">
                        {typeof s === 'string' ? s : s.name}
                      </span>
                    ))}
                  </div>
                </div>

                {aggregatedMissingSkills.length > 0 && (
                  <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                    <p className="text-[11px] text-amber-600 dark:text-amber-400 mb-2 font-semibold flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> High-Demand Missing Skills for Jobs:
                    </p>
                    <div className="flex flex-wrap gap-1.5">
                      {aggregatedMissingSkills.map((sk, idx) => (
                        <span key={idx} className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 text-[11px] font-medium border border-amber-200 dark:border-amber-800/30">
                          + {sk}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div className="pt-3 border-t border-slate-200 dark:border-slate-800">
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-1.5 font-semibold flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> Gemini Executive Summary:
                  </p>
                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-slate-100/80 dark:bg-slate-950 p-3 rounded-xl border border-slate-200 dark:border-slate-800 leading-relaxed italic">
                    "{profile?.resumeSummary || 'Driven software engineer experienced in building scalable applications.'}"
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Applications Tracker & AI Job Recommendations */}
          <div className="lg:col-span-2 space-y-8">
            {/* Active Applications */}
            <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Application Tracker ({applications.length})
                </h2>
              </div>

              {applications.length === 0 ? (
                <p className="text-xs text-slate-500 dark:text-slate-400">You haven't submitted any job applications yet.</p>
              ) : (
                <div className="space-y-3">
                  {applications.map((app) => (
                    <div
                      key={app._id}
                      className="p-4 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:border-slate-300 dark:hover:border-slate-700 transition-colors shadow-sm"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={app.job?.company?.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
                          alt={app.job?.company?.name}
                          className="w-10 h-10 rounded-xl object-cover bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800"
                        />
                        <div>
                          <h4 className="text-xs font-bold text-slate-900 dark:text-white">{app.job?.title}</h4>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400">{app.job?.company?.name}</p>
                          {app.rejectionReason && (
                            <p className="text-[10px] text-rose-600 dark:text-rose-400 mt-1">Feedback: {app.rejectionReason}</p>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <MatchGauge score={app.aiMatchAnalysis?.matchScore || 85} size="sm" />
                        <span
                          className={`px-3 py-1 rounded-full text-[10px] font-bold ${
                            app.status === 'Interviewing'
                              ? 'bg-purple-100 dark:bg-purple-500/20 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-500/30'
                              : app.status === 'Offered'
                              ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/30'
                              : app.status === 'Rejected'
                              ? 'bg-rose-100 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-500/30'
                              : 'bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30'
                          }`}
                        >
                          {app.status}
                        </span>

                        {app.status !== 'Rejected' && app.status !== 'Offered' && (
                          <button
                            onClick={() => handleWithdraw(app._id)}
                            className="px-2.5 py-1 bg-slate-100 dark:bg-slate-900 hover:bg-rose-100 dark:hover:bg-rose-950 text-slate-600 dark:text-slate-400 hover:text-rose-700 dark:hover:text-rose-300 border border-slate-200 dark:border-slate-800 text-[10px] font-semibold rounded-lg transition"
                          >
                            Withdraw
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* AI Recommended Jobs Feed */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> AI Recommended Positions for You
                </h2>
                <span className="text-xs text-slate-500 dark:text-slate-400">Matched with your Gemini Resume Profile</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {recommendations.slice(0, 4).map((job) => (
                  <JobCard key={job._id} job={job} matchScore={job.matchScore} />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Edit Profile Modal */}
      <EditProfileModal
        isOpen={isEditProfileOpen}
        onClose={() => setIsEditProfileOpen(false)}
        profileData={profile}
        onProfileUpdated={(updated) => {
          setProfile(updated);
          fetchDashboardData();
        }}
      />

      {/* Resume Preview Modal */}
      <ResumePreviewModal
        isOpen={isPreviewResumeOpen}
        onClose={() => setIsPreviewResumeOpen(false)}
        resumeUrl={profile?.resumeUrl}
        originalName={profile?.resumeOriginalName}
      />

      {/* Career Roadmap Modal */}
      <AIRoadmapModal
        isOpen={isRoadmapOpen}
        onClose={() => setIsRoadmapOpen(false)}
        currentRole={profile?.headline}
        currentProfile={profile}
      />

      {/* ATS Optimizer Modal */}
      <AIResumeImproveModal
        isOpen={isImproveOpen}
        onClose={() => setIsImproveOpen(false)}
        currentHeadline={profile?.headline}
        currentProfile={profile}
      />

      <Footer />
    </div>
  );
};

export default CandidateDashboard;
