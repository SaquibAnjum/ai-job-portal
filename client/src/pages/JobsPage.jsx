import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { fetchJobs } from '../redux/slices/jobSlice';
import axios from 'axios';
import { Search, MapPin, Filter, Loader2, Sparkles, Cpu } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import JobCard from '../components/JobCard';
import AIChatDrawer from '../components/AIChatDrawer';

const JobsPage = () => {
  const dispatch = useDispatch();
  const { jobs, loading } = useSelector((state) => state.jobs);

  const [keyword, setKeyword] = useState('');
  const [location, setLocation] = useState('');
  const [jobType, setJobType] = useState('');
  const [workMode, setWorkMode] = useState('');
  const [useVectorSearch, setUseVectorSearch] = useState(false);
  const [semanticResults, setSemanticResults] = useState([]);
  const [semanticLoading, setSemanticLoading] = useState(false);

  useEffect(() => {
    if (!useVectorSearch) {
      dispatch(fetchJobs({ keyword, location, jobType, workMode }));
    }
  }, [dispatch, keyword, location, jobType, workMode, useVectorSearch]);

  const handleSearchSubmit = async (e) => {
    e.preventDefault();
    if (useVectorSearch && keyword) {
      setSemanticLoading(true);
      try {
        const res = await axios.get(`/api/v1/ai/semantic-job-search?query=${encodeURIComponent(keyword)}`);
        setSemanticResults(res.data.data || []);
      } catch (err) {
        console.error(err);
      } finally {
        setSemanticLoading(false);
      }
    } else {
      dispatch(fetchJobs({ keyword, location, jobType, workMode }));
    }
  };

  const displayedJobs = useVectorSearch ? semanticResults : jobs;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full">
        {/* Search Header */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 mb-10 space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold text-white flex items-center gap-2">
                Explore Opportunities <Sparkles className="w-5 h-5 text-indigo-400" />
              </h1>
              <p className="text-xs text-slate-400 mt-1">
                Find tech positions matched directly to your skills using traditional filters or AI Vector Similarity.
              </p>
            </div>

            <button
              type="button"
              onClick={() => setUseVectorSearch(!useVectorSearch)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                useVectorSearch
                  ? 'bg-purple-600/20 text-purple-300 border-purple-500/50 shadow-lg shadow-purple-500/10'
                  : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-white'
              }`}
            >
              <Cpu className="w-4 h-4 text-purple-400" />
              {useVectorSearch ? 'AI Vector Semantic Search: ON' : 'AI Vector Semantic Search: OFF'}
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div className="relative col-span-1 sm:col-span-2">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder={useVectorSearch ? 'Describe ideal role in natural language (e.g., Remote React and Node developer working with Gemini AI)...' : 'Job title, skills (e.g. React, Node.js)...'}
                value={keyword}
                onChange={(e) => setKeyword(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-500 absolute left-3 top-3.5" />
              <input
                type="text"
                placeholder="Location (e.g. Remote)..."
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                disabled={useVectorSearch}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500 disabled:opacity-40"
              />
            </div>

            <button
              type="submit"
              className="py-2.5 px-6 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4" /> {useVectorSearch ? 'AI Vector Match' : 'Filter Jobs'}
            </button>
          </form>

          {/* Quick Filters */}
          <div className="flex flex-wrap items-center gap-4 text-xs pt-2 border-t border-slate-800/80">
            <span className="text-slate-400 font-semibold flex items-center gap-1">
              <Filter className="w-3.5 h-3.5 text-indigo-400" /> Work Mode:
            </span>
            {['', 'Remote', 'Hybrid', 'On-site'].map((mode) => (
              <button
                key={mode}
                onClick={() => setWorkMode(mode)}
                className={`px-3 py-1 rounded-lg transition-colors font-medium ${
                  workMode === mode
                    ? 'bg-indigo-600 text-white font-bold'
                    : 'bg-slate-900 text-slate-400 hover:text-slate-200'
                }`}
              >
                {mode || 'All Work Modes'}
              </button>
            ))}
          </div>
        </div>

        {/* Job Listings Grid */}
        {loading || semanticLoading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : displayedJobs.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl border border-slate-800 text-slate-400">
            <p className="text-sm font-semibold">No active job postings match your search.</p>
            <p className="text-xs text-slate-500 mt-1">Try clearing your search terms or turning off vector mode.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {displayedJobs.map((job) => (
              <JobCard key={job._id} job={job} matchScore={job.matchScore || 88} />
            ))}
          </div>
        )}
      </main>

      <AIChatDrawer />
      <Footer />
    </div>
  );
};

export default JobsPage;
