import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { Calendar, Video, Clock, Sparkles, Plus, Loader2, User } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const InterviewsPage = () => {
  const { user } = useSelector((state) => state.auth);
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);

  // Schedule Modal
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [applications, setApplications] = useState([]);
  const [selectedAppId, setSelectedAppId] = useState('');
  const [scheduledAt, setScheduledAt] = useState('');
  const [interviewType, setInterviewType] = useState('Technical');
  const [meetingLink, setMeetingLink] = useState('https://meet.google.com/ai-recruitment-call');
  const [durationMinutes, setDurationMinutes] = useState(45);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    fetchInterviews();
    if (user?.role === 'recruiter') {
      fetchRecruiterApplications();
    }
  }, [user?.role]);

  const fetchInterviews = async () => {
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('/api/v1/interviews/my-interviews', {
        headers: { Authorization: `Bearer ${token}` },
      });
      setInterviews(res.data.data || []);
      setLoading(false);
    } catch (err) {
      console.error(err);
      setLoading(false);
    }
  };

  const fetchRecruiterApplications = async () => {
    try {
      const token = localStorage.getItem('token');
      const jobsRes = await axios.get('/api/v1/recruiter/my-jobs', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const jobs = jobsRes.data.data || [];
      if (jobs.length > 0) {
        const appRes = await axios.get(`/api/v1/applications/job/${jobs[0]._id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setApplications(appRes.data.data || []);
        if (appRes.data.data?.length > 0) {
          setSelectedAppId(appRes.data.data[0]._id);
        }
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleScheduleSubmit = async (e) => {
    e.preventDefault();
    if (!selectedAppId || !scheduledAt) return;
    setSubmitting(true);
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        '/api/v1/interviews',
        {
          applicationId: selectedAppId,
          scheduledAt,
          type: interviewType,
          meetingLink,
          durationMinutes,
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      setShowScheduleModal(false);
      fetchInterviews();
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

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

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div>
            <h1 className="text-xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Scheduled Technical & HR Interviews
            </h1>
            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Real-time interview calendar with automated Gemini AI interview question banks.
            </p>
          </div>

          {user?.role === 'recruiter' && (
            <button
              onClick={() => setShowScheduleModal(true)}
              className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 flex items-center gap-2"
            >
              <Plus className="w-4 h-4" /> Schedule Interview
            </button>
          )}
        </div>

        {interviews.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 text-xs">
            No active interviews currently scheduled.
          </div>
        ) : (
          <div className="space-y-6">
            {interviews.map((item) => (
              <div key={item._id} className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800/80 pb-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-500/30">
                      {item.type} Interview
                    </span>
                    <h3 className="text-base font-bold text-slate-900 dark:text-white mt-1">
                      {item.application?.job?.title} @ {item.application?.job?.company?.name || 'Partner Company'}
                    </h3>
                    <p className="text-xs text-slate-600 dark:text-slate-400 flex items-center gap-1 mt-0.5">
                      <User className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Candidate: {item.candidate?.name} ({item.candidate?.email})
                    </p>
                  </div>

                  <a
                    href={item.meetingLink}
                    target="_blank"
                    rel="noreferrer"
                    className="py-2.5 px-4 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-2 shadow-lg shadow-emerald-600/20 self-start sm:self-auto"
                  >
                    <Video className="w-4 h-4" /> Join Video Call
                  </a>
                </div>

                <div className="flex items-center gap-4 text-xs text-slate-600 dark:text-slate-400">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> Date: {new Date(item.scheduledAt).toLocaleString()}
                  </span>
                  <span>Duration: {item.durationMinutes} Mins</span>
                </div>

                {/* AI Question Bank Preview */}
                {item.aiGeneratedQuestions && item.aiGeneratedQuestions.length > 0 && (
                  <div className="p-4 bg-slate-100/80 dark:bg-slate-950/80 rounded-2xl border border-slate-200 dark:border-slate-800 space-y-2">
                    <h4 className="text-xs font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> AI Tailored Question Bank:
                    </h4>
                    <ul className="space-y-1.5 text-xs text-slate-700 dark:text-slate-300">
                      {item.aiGeneratedQuestions.map((q, idx) => (
                        <li key={idx} className="flex items-start gap-2">
                          <span className="text-indigo-600 dark:text-indigo-400 font-bold">•</span>
                          <div>
                            <span className="font-semibold text-slate-900 dark:text-slate-200">[{q.category}]</span> {q.question}
                          </div>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </main>

      {/* Schedule Interview Modal */}
      {showScheduleModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" /> Schedule Interview Session
            </h3>

            <form onSubmit={handleScheduleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Select Candidate Application</label>
                <select
                  value={selectedAppId}
                  onChange={(e) => setSelectedAppId(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                >
                  {applications.map((app) => (
                    <option key={app._id} value={app._id}>
                      {app.candidate?.name} - {app.job?.title || 'Applicant'}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Date & Time</label>
                <input
                  type="datetime-local"
                  required
                  value={scheduledAt}
                  onChange={(e) => setScheduledAt(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Type</label>
                  <select
                    value={interviewType}
                    onChange={(e) => setInterviewType(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                  >
                    <option value="Technical">Technical</option>
                    <option value="HR / Cultural">HR / Cultural</option>
                    <option value="System Design">System Design</option>
                    <option value="Executive">Executive</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Duration (Minutes)</label>
                  <input
                    type="number"
                    value={durationMinutes}
                    onChange={(e) => setDurationMinutes(e.target.value)}
                    className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Meeting Call Link</label>
                <input
                  type="url"
                  required
                  value={meetingLink}
                  onChange={(e) => setMeetingLink(e.target.value)}
                  className="w-full glass-input rounded-xl p-2.5 text-xs focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button type="button" onClick={() => setShowScheduleModal(false)} className="px-4 py-2 text-xs text-slate-600 dark:text-slate-400">
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 disabled:opacity-50"
                >
                  {submitting ? 'Scheduling & Generating AI Questions...' : 'Schedule Interview'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
};

export default InterviewsPage;
