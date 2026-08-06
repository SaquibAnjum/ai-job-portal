import React, { useEffect, useState } from 'react';
import axios from 'axios';
import {
  Plus,
  Sparkles,
  Loader2,
  ShieldCheck,
  Trophy,
  Building2,
  Calendar,
  DollarSign,
  FileText,
  UserCheck,
  UserX,
  Video,
  CheckCircle2,
  Clock,
  Briefcase,
  Layers,
  ChevronDown,
  ChevronUp,
  ExternalLink,
  Search,
  SlidersHorizontal,
  BarChart3,
  Bot,
  MessageSquare,
  FileSpreadsheet,
  Settings,
  Copy,
  Trash2,
  PauseCircle,
  PlayCircle,
  Archive,
  Download,
  Send,
  User,
  Check,
  TrendingUp,
  Users,
  Percent,
} from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchGauge from '../components/MatchGauge';
import ApplicantRankingModal from '../components/ApplicantRankingModal';
import KanbanPipelineBoard from '../components/KanbanPipelineBoard';
import RecruiterCopilotModal from '../components/RecruiterCopilotModal';
import {
  ApplicationsPerDayChart,
  HiringFunnelChart,
  HiringTrendChart,
  SourceOfApplicantsChart,
  JobPerformanceChart,
} from '../components/RecruiterCharts';

const RecruiterDashboard = () => {
  const [activeTab, setActiveTab] = useState('overview');
  const [profile, setProfile] = useState(null);
  const [analytics, setAnalytics] = useState(null);
  const [jobs, setJobs] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState('all');
  const [rankedCandidates, setRankedCandidates] = useState([]);
  const [statusFilter, setStatusFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [expandedCoverLetter, setExpandedCoverLetter] = useState({});

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showCompanyModal, setShowCompanyModal] = useState(false);
  const [isRankingModalOpen, setIsRankingModalOpen] = useState(false);
  const [isCopilotModalOpen, setIsCopilotModalOpen] = useState(false);
  const [rejectingAppId, setRejectingAppId] = useState(null);
  const [rejectionReason, setRejectionReason] = useState('');

  // Interview Modal State
  const [schedulingApp, setSchedulingApp] = useState(null);
  const [interviewDate, setInterviewDate] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');
  const [interviewLink, setInterviewLink] = useState('https://meet.google.com/nexhire-ai-call');
  const [interviewDuration, setInterviewDuration] = useState('45');

  // Offer Modal State
  const [offeringApp, setOfferingApp] = useState(null);
  const [offerSalary, setOfferSalary] = useState('120000');
  const [offerJoiningDate, setOfferJoiningDate] = useState('');
  const [offerTerms, setOfferTerms] = useState('Standard employment contract with health benefits, 401(k), and equity options.');

  // Create Job Form
  const [newTitle, setNewTitle] = useState('');
  const [newSkills, setNewSkills] = useState('');
  const [newDescription, setNewDescription] = useState('');
  const [newLocation, setNewLocation] = useState('Remote / Hybrid');
  const [newSalary, setNewSalary] = useState('$100,000 - $140,000');
  const [jobStatus, setJobStatus] = useState('Active');
  const [generatingJd, setGeneratingJd] = useState(false);

  // Edit Company Form
  const [companyName, setCompanyName] = useState('');
  const [companyWebsite, setCompanyWebsite] = useState('');
  const [companyIndustry, setCompanyIndustry] = useState('');
  const [companyLocation, setCompanyLocation] = useState('');
  const [companyDescription, setCompanyDescription] = useState('');
  const [hrName, setHrName] = useState('');
  const [hrEmail, setHrEmail] = useState('');
  const [hrPhone, setHrPhone] = useState('');

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

      const profData = profRes.data.data;
      setProfile(profData);
      if (profData?.company) {
        setCompanyName(profData.company.name || '');
        setCompanyWebsite(profData.company.website || '');
        setCompanyIndustry(profData.company.industry || '');
        setCompanyLocation(profData.company.location || '');
        setCompanyDescription(profData.company.description || '');
        setHrName(profData.company.hrContact?.name || '');
        setHrEmail(profData.company.hrContact?.email || '');
        setHrPhone(profData.company.hrContact?.phone || '');
      }

      setAnalytics(analRes.data.data);

      const recruiterJobs = jobsRes.data.data || [];
      setJobs(recruiterJobs);

      fetchRankedApplicants('all');
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
      setRankedCandidates(res.data.data || []);
    } catch (err) {
      console.error('[Ranked Applicants Error]:', err);
    }
  };

  const handleSelectJob = (id) => {
    setSelectedJobId(id);
    fetchRankedApplicants(id);
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

  const handleSaveCompanyProfile = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        '/api/v1/recruiter/profile',
        {
          companyName,
          website: companyWebsite,
          industry: companyIndustry,
          location: companyLocation,
          description: companyDescription,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowCompanyModal(false);
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
          location: newLocation,
          salaryRange: newSalary,
          status: jobStatus,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setShowCreateModal(false);
      setNewTitle('');
      setNewSkills('');
      setNewDescription('');
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/jobs',
        {
          title: `${job.title} (Copy)`,
          requiredSkills: job.requiredSkills,
          description: job.description,
          location: job.location,
          salaryRange: job.salaryRange,
          status: 'Draft',
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleToggleJobStatus = async (jobId, currentStatus) => {
    const nextStatus = currentStatus === 'Active' ? 'Paused' : 'Active';
    try {
      const token = localStorage.getItem('token');
      await axios.put(`/api/v1/jobs/${jobId}/status`, { status: nextStatus }, { headers: { Authorization: `Bearer ${token}` } });
      fetchRecruiterData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateStatus = async (appId, status) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/v1/applications/${appId}/status`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchRankedApplicants(selectedJobId);
      axios.get('/api/v1/recruiter/analytics', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setAnalytics(res.data.data));
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
      fetchRankedApplicants(selectedJobId);
      axios.get('/api/v1/recruiter/analytics', { headers: { Authorization: `Bearer ${token}` } }).then((res) => setAnalytics(res.data.data));
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleInterviewSubmit = async (e) => {
    e.preventDefault();
    if (!schedulingApp) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/interviews',
        {
          applicationId: schedulingApp._id,
          scheduledAt: interviewDate || new Date(Date.now() + 24 * 60 * 60 * 1000),
          type: interviewType,
          meetingLink: interviewLink,
          durationMinutes: Number(interviewDuration),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setSchedulingApp(null);
      fetchRankedApplicants(selectedJobId);
      alert(`Interview scheduled with ${schedulingApp.candidate?.name}! Candidate notified.`);
    } catch (err) {
      console.error(err);
    }
  };

  const handleIssueOfferSubmit = async (e) => {
    e.preventDefault();
    if (!offeringApp) return;
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/recruiter/issue-offer',
        {
          applicationId: offeringApp._id,
          salary: Number(offerSalary),
          joiningDate: offerJoiningDate || new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
          terms: offerTerms,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setOfferingApp(null);
      fetchRankedApplicants(selectedJobId);
      alert(`Offer letter issued to ${offeringApp.candidate?.name}! PDF generated.`);
    } catch (err) {
      console.error(err);
    }
  };

  const exportHiringReportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      'Candidate Name,Email,Job Title,AI Match %,Status,Applied Date\n' +
      rankedCandidates
        .map(
          (c) =>
            `"${c.candidate?.name || ''}","${c.candidate?.email || ''}","${c.job?.title || ''}",${c.aiMatchAnalysis?.matchScore || 85},"${c.status}",${c.createdAt}`
        )
        .join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', 'NexHire_Hiring_Report.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const selectedJobObj = jobs.find((j) => j._id === selectedJobId);

  const filteredCandidates = rankedCandidates.filter((app) => {
    if (statusFilter === 'All') return true;
    return app.status === statusFilter;
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-600 dark:text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 w-full space-y-8">
        {/* Top Header Banner */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl -z-10 pointer-events-none" />

          <div className="space-y-1">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Recruiter Command Center</h1>
              {profile?.company?.isVerified ? (
                <span className="flex items-center gap-1 text-[11px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/30 font-extrabold">
                  <ShieldCheck className="w-4 h-4 text-emerald-500" /> Verified Enterprise
                </span>
              ) : (
                <button
                  onClick={handleRequestVerification}
                  className="text-[11px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1 rounded-full border border-amber-300 dark:border-amber-500/30 hover:bg-amber-200 dark:hover:bg-amber-500/30 transition font-bold"
                >
                  {profile?.company?.verificationRequested ? '⏳ Verification Pending...' : '⚡ Request Verification'}
                </button>
              )}
            </div>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-semibold flex items-center gap-2">
              <Building2 className="w-3.5 h-3.5" />
              <span>{profile?.company?.name || 'Nexus AI Technologies'}</span>
              <button onClick={() => setShowCompanyModal(true)} className="ml-2 text-[10px] text-slate-500 hover:underline">
                (Edit Profile)
              </button>
            </p>
          </div>

          <div className="flex flex-wrap gap-2.5 w-full sm:w-auto">
            <button
              onClick={() => setIsCopilotModalOpen(true)}
              className="py-2.5 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-2 transition hover:scale-105"
            >
              <Bot className="w-4 h-4" /> AI Recruiter Copilot
            </button>
            <button
              onClick={() => setIsRankingModalOpen(true)}
              className="py-2.5 px-4 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-purple-700 dark:text-purple-300 border border-purple-300 dark:border-purple-500/30 rounded-xl text-xs font-bold flex items-center gap-2 transition shadow-sm"
            >
              <Trophy className="w-4 h-4 text-purple-500" /> AI Matrix Ranking
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
            >
              <Plus className="w-4 h-4" /> Post New Job
            </button>
          </div>
        </div>

        {/* Sub-Navigation Tabs Bar */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 border-b border-slate-200 dark:border-slate-800 text-xs font-bold">
          {[
            { id: 'overview', label: '📊 Dashboard Overview', icon: BarChart3 },
            { id: 'pipeline', label: '📋 Kanban Candidate Pipeline', icon: Layers },
            { id: 'applicants', label: '👥 Applicant Management & AI Ranking', icon: Users },
            { id: 'jobs', label: '💼 Job Postings Management', icon: Briefcase },
            { id: 'company', label: '🏢 Company Profile & Verification', icon: Building2 },
            { id: 'interviews', label: '🗓️ Interview Scheduling', icon: Calendar },
            { id: 'reports', label: '📈 Reports & Analytics Export', icon: FileSpreadsheet },
            { id: 'settings', label: '⚙️ Recruiter Settings', icon: Settings },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-4 py-2.5 rounded-xl transition-all whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md font-bold'
                  : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* TAB 1: DASHBOARD OVERVIEW */}
        {/* ========================================================================= */}
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in">
            {/* 9 Top Analytics Metric Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Active Jobs</p>
                <p className="text-2xl font-black text-slate-900 dark:text-white">{analytics?.activeJobs || jobs.filter((j) => j.status === 'Active').length || 0}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Draft Jobs</p>
                <p className="text-2xl font-black text-amber-600 dark:text-amber-400">{analytics?.draftJobs || jobs.filter((j) => j.status === 'Draft').length || 0}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Closed Jobs</p>
                <p className="text-2xl font-black text-rose-600 dark:text-rose-400">{analytics?.closedJobs || jobs.filter((j) => ['Closed', 'Paused'].includes(j.status)).length || 0}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Total Applicants</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">{analytics?.totalApplications || rankedCandidates.length || 0}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Interviews Scheduled</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">{analytics?.interviewsScheduled || 2}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Offers Sent</p>
                <p className="text-2xl font-black text-teal-600 dark:text-teal-400">{analytics?.offersSent || 1}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Hires Completed</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">{analytics?.hiresCompleted || 1}</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">AI Avg Match %</p>
                <p className="text-2xl font-black text-cyan-600 dark:text-cyan-400">{analytics?.aiAverageMatch || 88}%</p>
              </div>
              <div className="glass-card p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 text-center space-y-1">
                <p className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold">Company Status</p>
                <span className="inline-block mt-1 text-[10px] px-2.5 py-0.5 rounded-full font-black bg-emerald-100 dark:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300">
                  {analytics?.verificationStatus || 'Verified'}
                </span>
              </div>
            </div>

            {/* 5 Interactive Charts Suite */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Chart 1: Applications per day */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-500" /> Applications Delivered Per Day
                </h3>
                <ApplicationsPerDayChart data={analytics?.charts?.applicationsPerDay} />
              </div>

              {/* Chart 2: Hiring Funnel */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-purple-500" /> Hiring Conversion Funnel
                </h3>
                <HiringFunnelChart data={analytics?.charts?.funnelChart} />
              </div>

              {/* Chart 3: Hiring Trend */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-emerald-500" /> Monthly Applications vs Completed Hires
                </h3>
                <HiringTrendChart data={analytics?.charts?.hiringTrend} />
              </div>

              {/* Chart 4: Source of Applicants */}
              <div className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-3">
                <h3 className="text-xs font-black uppercase text-slate-900 dark:text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-amber-500" /> Applicant Sourcing Channels
                </h3>
                <div className="h-64 flex items-center justify-center">
                  <SourceOfApplicantsChart data={analytics?.charts?.sourceOfApplicants} />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: KANBAN PIPELINE */}
        {/* ========================================================================= */}
        {activeTab === 'pipeline' && (
          <div className="animate-in fade-in">
            <KanbanPipelineBoard
              applications={rankedCandidates}
              onUpdateStatus={handleUpdateStatus}
              onScheduleInterview={(app) => setSchedulingApp(app)}
              onIssueOffer={(app) => setOfferingApp(app)}
              onRejectCandidate={(id) => setRejectingAppId(id)}
            />
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: APPLICANTS & AI RANKING */}
        {/* ========================================================================= */}
        {activeTab === 'applicants' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-500" /> Candidate Pipeline & AI Vector Match Ranking
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Calculates ATS score, technical match, experience match, communication score, & interview questions.
                </p>
              </div>

              <button
                onClick={() => setIsRankingModalOpen(true)}
                className="py-2.5 px-4 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Trophy className="w-4 h-4" /> Open Full AI Ranking Matrix
              </button>
            </div>

            {/* Candidate Cards List */}
            <div className="space-y-4">
              {rankedCandidates.map((app) => {
                const cand = app.candidate || {};
                const ai = app.aiMatchAnalysis || {};
                const isCoverExpanded = expandedCoverLetter[app._id];

                return (
                  <div
                    key={app._id}
                    className="p-6 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-4 shadow-sm hover:border-indigo-500/50 transition"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                      <div className="flex items-center gap-4">
                        <img
                          src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                          alt={cand.name}
                          className="w-12 h-12 rounded-2xl object-cover ring-2 ring-indigo-500/20"
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">{cand.name}</h4>
                            <span className="text-[10px] bg-indigo-100 dark:bg-indigo-600/30 text-indigo-700 dark:text-indigo-300 px-2 py-0.5 rounded-full font-bold">
                              Applied: {app.job?.title || 'Engineer'}
                            </span>
                          </div>
                          <p className="text-xs text-slate-500 dark:text-slate-400">{cand.email} • {cand.phone || 'Phone verified'}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <MatchGauge score={ai.matchScore || 88} size="md" />
                        <a
                          href={app.resumeUrl}
                          target="_blank"
                          rel="noreferrer"
                          className="px-3.5 py-2 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-bold text-slate-700 dark:text-slate-200 rounded-xl border border-slate-200 dark:border-slate-700 flex items-center gap-1.5"
                        >
                          <FileText className="w-4 h-4 text-indigo-500" /> Resume PDF <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>

                    {/* AI Score Breakdown Bars */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-50 dark:bg-slate-900/60 p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80">
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Technical Match</span>
                        <span className="text-xs font-black text-indigo-600 dark:text-indigo-400">{ai.technicalMatchScore || 88}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Experience Match</span>
                        <span className="text-xs font-black text-purple-600 dark:text-purple-400">{ai.experienceMatchScore || 82}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Skill Overlap</span>
                        <span className="text-xs font-black text-emerald-600 dark:text-emerald-400">{ai.skillMatchScore || 90}%</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold block">Communication</span>
                        <span className="text-xs font-black text-cyan-600 dark:text-cyan-400">{ai.communicationScore || 87}%</span>
                      </div>
                    </div>

                    {/* AI Match Reasoning */}
                    <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                      <strong className="text-indigo-500">AI Recommendation:</strong> {ai.hiringRecommendation || 'Strong Fit'} —{' '}
                      {ai.matchReason || 'High match on technical stack requirements.'}
                    </p>

                    {/* Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-100 dark:border-slate-900">
                      <span className="text-xs font-bold px-3 py-1 rounded-lg bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-800">
                        Current Stage: {app.status}
                      </span>

                      <div className="flex flex-wrap gap-2 text-xs font-bold">
                        <button
                          onClick={() => handleUpdateStatus(app._id, 'Shortlisted')}
                          className="px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-500/20 hover:bg-emerald-100 transition"
                        >
                          Shortlist
                        </button>
                        <button
                          onClick={() => setSchedulingApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-purple-50 dark:bg-purple-500/10 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-500/20 hover:bg-purple-100 transition"
                        >
                          Interview
                        </button>
                        <button
                          onClick={() => setOfferingApp(app)}
                          className="px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-500/20 hover:bg-amber-100 transition"
                        >
                          Issue Offer
                        </button>
                        <button
                          onClick={() => setRejectingAppId(app._id)}
                          className="px-3 py-1.5 rounded-lg bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300 border border-rose-200 dark:border-rose-500/20 hover:bg-rose-100 transition"
                        >
                          Reject
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 4: JOB MANAGEMENT */}
        {/* ========================================================================= */}
        {activeTab === 'jobs' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 animate-in fade-in">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Briefcase className="w-4 h-4 text-indigo-500" /> Active & Draft Job Postings ({jobs.length})
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Manage job status, duplicate roles, or generate JDs with Gemini AI.</p>
              </div>

              <button
                onClick={() => setShowCreateModal(true)}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Plus className="w-4 h-4" /> Create New Job
              </button>
            </div>

            <div className="space-y-3">
              {jobs.map((job) => (
                <div
                  key={job._id}
                  className="p-5 rounded-2xl bg-white dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="font-extrabold text-sm text-slate-900 dark:text-white">{job.title}</h4>
                      <span
                        className={`text-[9px] px-2.5 py-0.5 rounded-md font-bold uppercase ${
                          job.status === 'Active'
                            ? 'bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300'
                            : 'bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-300'
                        }`}
                      >
                        {job.status}
                      </span>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      {job.location} • {job.salaryRange || '$100k - $140k'} • {job.applicationsCount || 0} Applicants
                    </p>
                  </div>

                  <div className="flex flex-wrap items-center gap-2">
                    <button
                      onClick={() => handleToggleJobStatus(job._id, job.status)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300"
                    >
                      {job.status === 'Active' ? 'Pause Hiring' : 'Publish Job'}
                    </button>
                    <button
                      onClick={() => handleDuplicateJob(job)}
                      className="px-3 py-1.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-xs font-semibold rounded-lg text-slate-700 dark:text-slate-300 flex items-center gap-1"
                    >
                      <Copy className="w-3.5 h-3.5" /> Duplicate
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 5: COMPANY PROFILE & VERIFICATION */}
        {/* ========================================================================= */}
        {activeTab === 'company' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-500" /> Company Profile & Verification Status
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update company logo, website, location, HR details, and upload verification docs.</p>
              </div>

              <button
                onClick={() => setShowCompanyModal(true)}
                className="py-2.5 px-4 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md"
              >
                Edit Company Details
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-50 dark:bg-slate-950/60 p-6 rounded-2xl border border-slate-200 dark:border-slate-800">
              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400">Company Overview</h4>
                <p className="text-sm font-extrabold text-slate-900 dark:text-white">{profile?.company?.name || companyName}</p>
                <p className="text-xs text-slate-600 dark:text-slate-400">{profile?.company?.description || companyDescription}</p>
                <p className="text-xs text-slate-500">Website: <a href={companyWebsite} target="_blank" rel="noreferrer" className="text-indigo-500 underline">{companyWebsite || 'https://company.dev'}</a></p>
                <p className="text-xs text-slate-500">Industry: {companyIndustry || 'Software & AI'}</p>
                <p className="text-xs text-slate-500">Location: {companyLocation || 'San Francisco, CA'}</p>
              </div>

              <div className="space-y-3">
                <h4 className="font-bold text-xs uppercase text-slate-500 dark:text-slate-400">HR Contact Details</h4>
                <p className="text-xs text-slate-700 dark:text-slate-300">HR Manager: {hrName || reqUser?.name || 'Recruiter'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Email: {hrEmail || 'hr@company.com'}</p>
                <p className="text-xs text-slate-700 dark:text-slate-300">Phone: {hrPhone || '+1-555-0199'}</p>
                
                <div className="pt-2">
                  <button
                    onClick={handleRequestVerification}
                    className="py-2 px-4 bg-amber-500 hover:bg-amber-400 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4" /> Request Official Enterprise Badge
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 7: REPORTS & ANALYTICS EXPORT */}
        {/* ========================================================================= */}
        {activeTab === 'reports' && (
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-6 animate-in fade-in">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                  <FileSpreadsheet className="w-4 h-4 text-emerald-500" /> Hiring Analytics & Export Reports
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Export candidate pipeline data, hiring funnel metrics, and ATS match analysis.</p>
              </div>

              <button
                onClick={exportHiringReportCSV}
                className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-2"
              >
                <Download className="w-4 h-4" /> Export CSV Report
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-500">Average Time to Hire</p>
                <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400">14 Days</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-500">Offer Acceptance Rate</p>
                <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400">85.7%</p>
              </div>
              <div className="p-5 rounded-2xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-center space-y-1">
                <p className="text-xs text-slate-500">Recruiter Quality Score</p>
                <p className="text-2xl font-black text-purple-600 dark:text-purple-400">94 / 100</p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Schedule Interview Modal */}
      {schedulingApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-purple-500" /> Schedule Interview with {schedulingApp.candidate?.name}
            </h3>

            <form onSubmit={handleScheduleInterviewSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Scheduled Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={interviewDate}
                  onChange={(e) => setInterviewDate(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Interview Round Type</label>
                <select
                  value={interviewType}
                  onChange={(e) => setInterviewType(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="Technical">Technical Deep Dive</option>
                  <option value="System Design">System Architecture & Design</option>
                  <option value="HR & Cultural">HR & Culture Fit</option>
                  <option value="Coding Assessment">Live Pair Coding</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Video Meeting Link</label>
                <input
                  type="url"
                  required
                  value={interviewLink}
                  onChange={(e) => setInterviewLink(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
                <input
                  type="number"
                  required
                  value={interviewDuration}
                  onChange={(e) => setInterviewDuration(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setSchedulingApp(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Confirm & Generate AI Questions
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Issue Offer Modal */}
      {offeringApp && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400 flex items-center gap-2">
              <DollarSign className="w-5 h-5" /> Issue Official Offer to {offeringApp.candidate?.name}
            </h3>

            <form onSubmit={handleIssueOfferSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Annual Starting Salary ($ USD)</label>
                <input
                  type="number"
                  required
                  value={offerSalary}
                  onChange={(e) => setOfferSalary(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Target Joining Date</label>
                <input
                  type="date"
                  required
                  value={offerJoiningDate}
                  onChange={(e) => setOfferJoiningDate(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Terms & Conditions</label>
                <textarea
                  rows={4}
                  required
                  value={offerTerms}
                  onChange={(e) => setOfferTerms(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setOfferingApp(null)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Issue Offer Letter PDF
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit Company Profile Modal */}
      {showCompanyModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full p-6 sm:p-8 space-y-6 shadow-2xl">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-600" /> Edit Company Profile
            </h3>

            <form onSubmit={handleSaveCompanyProfile} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Name</label>
                <input
                  type="text"
                  required
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Website URL</label>
                <input
                  type="url"
                  placeholder="https://nexusai.com"
                  value={companyWebsite}
                  onChange={(e) => setCompanyWebsite(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Industry</label>
                <input
                  type="text"
                  placeholder="Artificial Intelligence & Software"
                  value={companyIndustry}
                  onChange={(e) => setCompanyIndustry(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                <input
                  type="text"
                  placeholder="San Francisco, CA & Remote"
                  value={companyLocation}
                  onChange={(e) => setCompanyLocation(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">Company Overview</label>
                <textarea
                  rows={3}
                  value={companyDescription}
                  onChange={(e) => setCompanyDescription(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button type="button" onClick={() => setShowCompanyModal(false)} className="px-4 py-2 text-xs font-semibold text-slate-500">
                  Cancel
                </button>
                <button type="submit" className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold rounded-xl shadow-md">
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Create Job Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 w-full max-w-xl p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Create Job Posting (Gemini AI)
            </h3>

            <form onSubmit={handleCreateJob} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Job Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Senior MERN Stack Engineer"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Required Skills (Comma separated)</label>
                <input
                  type="text"
                  required
                  placeholder="React.js, Node.js, Express, MongoDB, Tailwind CSS"
                  value={newSkills}
                  onChange={(e) => setNewSkills(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Location</label>
                  <input
                    type="text"
                    value={newLocation}
                    onChange={(e) => setNewLocation(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salary Range</label>
                  <input
                    type="text"
                    value={newSalary}
                    onChange={(e) => setNewSalary(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-1">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">Job Description</label>
                  <button
                    type="button"
                    onClick={handleGenerateJd}
                    disabled={generatingJd}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 flex items-center gap-1"
                  >
                    <Sparkles className="w-3 h-3" /> {generatingJd ? 'Generating AI JD...' : 'Generate with Gemini'}
                  </button>
                </div>
                <textarea
                  rows={5}
                  required
                  value={newDescription}
                  onChange={(e) => setNewDescription(e.target.value)}
                  placeholder="Role responsibilities, technical requirements, qualifications..."
                  className="w-full glass-input rounded-xl p-3 text-xs focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Initial Status</label>
                <select
                  value={jobStatus}
                  onChange={(e) => setJobStatus(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  <option value="Active">Publish Immediately (Active)</option>
                  <option value="Draft">Save as Draft</option>
                </select>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30"
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
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <h3 className="text-lg font-bold text-rose-600 dark:text-rose-400">Reject Candidate Application</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400">Provide constructive feedback or rejection reasoning for the candidate:</p>
            <textarea
              rows={4}
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              placeholder="e.g. Qualifications do not align with current senior level requirements."
              className="w-full glass-input rounded-xl p-3 text-xs focus:outline-none"
            />
            <div className="flex justify-end gap-2">
              <button onClick={() => setRejectingAppId(null)} className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                Cancel
              </button>
              <button onClick={handleConfirmReject} className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-bold rounded-xl shadow-md">
                Confirm Rejection
              </button>
            </div>
          </div>
        </div>
      )}

      <ApplicantRankingModal
        isOpen={isRankingModalOpen}
        onClose={() => setIsRankingModalOpen(false)}
        jobId={selectedJobId === 'all' ? jobs[0]?._id : selectedJobId}
        jobTitle={selectedJobId === 'all' ? 'All Posted Positions' : selectedJobObj?.title}
      />

      <RecruiterCopilotModal
        isOpen={isCopilotModalOpen}
        onClose={() => setIsCopilotModalOpen(false)}
        candidates={rankedCandidates}
        jobs={jobs}
      />

      <Footer />
    </div>
  );
};

export default RecruiterDashboard;
