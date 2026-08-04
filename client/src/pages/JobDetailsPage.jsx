import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobById } from '../redux/slices/jobSlice';
import axios from 'axios';
import { MapPin, DollarSign, Briefcase, Calendar, Sparkles, CheckCircle2, ArrowLeft, Send, AlertCircle, Loader2 } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import MatchGauge from '../components/MatchGauge';
import AICoverLetterModal from '../components/AICoverLetterModal';

const JobDetailsPage = () => {
  const { id } = useParams();
  const dispatch = useDispatch();
  const navigate = useNavigate();

  const { selectedJob, loading } = useSelector((state) => state.jobs);
  const { user, isAuthenticated } = useSelector((state) => state.auth);

  const [coverLetter, setCoverLetter] = useState('');
  const [applying, setApplying] = useState(false);
  const [appliedSuccess, setAppliedSuccess] = useState(null);
  const [error, setError] = useState(null);
  const [isCoverModalOpen, setIsCoverModalOpen] = useState(false);

  useEffect(() => {
    dispatch(fetchJobById(id));
  }, [dispatch, id]);

  const handleApplySubmit = async (customLetter) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }

    setApplying(true);
    setError(null);
    setIsCoverModalOpen(false);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/v1/applications',
        { jobId: id, coverLetter: customLetter || coverLetter },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setApplying(false);
      setAppliedSuccess(res.data.data);
    } catch (err) {
      setApplying(false);
      setError(err.response?.data?.message || 'Failed to submit application.');
    }
  };

  if (loading || !selectedJob) {
    return (
      <div className="min-h-screen bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-1 text-xs text-slate-400 hover:text-white mb-6"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Listings
        </button>

        <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-800 space-y-8">
          {/* Header Info */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-6 pb-6 border-b border-slate-800">
            <div className="flex items-center gap-4">
              <img
                src={selectedJob.company?.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
                alt={selectedJob.company?.name}
                className="w-16 h-16 rounded-2xl object-cover ring-2 ring-indigo-500/30 bg-slate-900"
              />
              <div>
                <h1 className="text-2xl font-extrabold text-white">{selectedJob.title}</h1>
                <p className="text-sm font-medium text-slate-400">{selectedJob.company?.name}</p>
              </div>
            </div>

            <MatchGauge score={92} size="md" />
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Location</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <MapPin className="w-3.5 h-3.5 text-indigo-400" /> {selectedJob.location}
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Salary Range</p>
              <p className="text-xs font-bold text-emerald-400 mt-0.5 flex items-center gap-1">
                <DollarSign className="w-3.5 h-3.5" /> ${selectedJob.salaryMin?.toLocaleString()} - ${selectedJob.salaryMax?.toLocaleString()}
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Job Type</p>
              <p className="text-xs font-bold text-purple-400 mt-0.5 flex items-center gap-1">
                <Briefcase className="w-3.5 h-3.5" /> {selectedJob.jobType} ({selectedJob.workMode || 'Remote'})
              </p>
            </div>

            <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800">
              <p className="text-[10px] text-slate-500 uppercase font-bold">Experience</p>
              <p className="text-xs font-bold text-slate-200 mt-0.5 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-amber-400" /> {selectedJob.experienceLevel}
              </p>
            </div>
          </div>

          {/* Required Skills */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Required Technical Skills</h3>
            <div className="flex flex-wrap gap-2">
              {selectedJob.requiredSkills?.map((skill, idx) => (
                <span key={idx} className="px-3 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 text-xs font-semibold border border-indigo-500/30">
                  {skill}
                </span>
              ))}
            </div>
          </div>

          {/* Detailed Job Description */}
          <div>
            <h3 className="text-sm font-bold text-white mb-3">Job Overview & Responsibilities</h3>
            <div className="text-xs text-slate-300 whitespace-pre-line leading-relaxed space-y-2 bg-slate-950/40 p-6 rounded-2xl border border-slate-800/80">
              {selectedJob.description}
            </div>
          </div>

          {/* Application Form */}
          <div className="pt-6 border-t border-slate-800">
            {appliedSuccess ? (
              <div className="p-6 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                <h4 className="text-sm font-bold text-emerald-300">Application Submitted!</h4>
                <p className="text-xs text-slate-400">
                  Gemini AI analyzed your resume and calculated an <span className="font-bold text-white">{appliedSuccess.aiMatchAnalysis?.matchScore}% Match Score</span>.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-indigo-400" /> Apply with AI Match Screening
                  </h3>
                  <button
                    onClick={() => setIsCoverModalOpen(true)}
                    className="text-xs text-purple-400 font-semibold hover:underline flex items-center gap-1"
                  >
                    ✨ Draft AI Cover Letter
                  </button>
                </div>

                {error && (
                  <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
                    <AlertCircle className="w-4 h-4 shrink-0" />
                    <span>{error}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1">Cover Note (Optional)</label>
                  <textarea
                    rows={3}
                    placeholder="Brief note to the recruiter..."
                    value={coverLetter}
                    onChange={(e) => setCoverLetter(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <button
                  onClick={() => handleApplySubmit(coverLetter)}
                  disabled={applying}
                  className="w-full py-3.5 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
                >
                  {applying ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" /> Evaluating Resume & Submitting...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" /> One-Click AI Apply
                    </>
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </main>

      <AICoverLetterModal
        isOpen={isCoverModalOpen}
        onClose={() => setIsCoverModalOpen(false)}
        jobTitle={selectedJob?.title}
        companyName={selectedJob?.company?.name}
        onApplyWithCoverLetter={(generatedLetter) => {
          setCoverLetter(generatedLetter);
          handleApplySubmit(generatedLetter);
        }}
      />

      <Footer />
    </div>
  );
};

export default JobDetailsPage;
