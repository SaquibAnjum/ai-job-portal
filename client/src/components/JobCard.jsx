import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Briefcase, ChevronRight } from 'lucide-react';
import MatchGauge from './MatchGauge';

const JobCard = ({ job, matchScore }) => {
  return (
    <div className="glass-card glass-card-hover p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 flex flex-col justify-between group">
      <div>
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="flex items-center gap-3">
            <img
              src={job.company?.logo || 'https://images.unsplash.com/photo-1549923746-c502d488b3ea?w=150'}
              alt={job.company?.name}
              className="w-12 h-12 rounded-xl object-cover ring-1 ring-slate-200 dark:ring-slate-700 bg-slate-100 dark:bg-slate-900"
            />
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                {job.title}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">{job.company?.name}</p>
            </div>
          </div>
          {matchScore !== undefined && <MatchGauge score={matchScore} size="sm" />}
        </div>

        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed">
          {job.description?.replace(/[#*`]/g, '')}
        </p>

        <div className="flex flex-wrap items-center gap-2.5 text-[11px] text-slate-600 dark:text-slate-400 mb-4">
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <MapPin className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" /> {job.location}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <DollarSign className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" /> ${job.salaryMin?.toLocaleString()} - ${job.salaryMax?.toLocaleString()}
          </span>
          <span className="flex items-center gap-1 bg-slate-100 dark:bg-slate-900/80 px-2.5 py-1 rounded-lg border border-slate-200 dark:border-slate-800">
            <Briefcase className="w-3.5 h-3.5 text-purple-600 dark:text-purple-400" /> {job.jobType}
          </span>
        </div>

        <div className="flex flex-wrap gap-1.5 mb-4">
          {job.requiredSkills?.slice(0, 5).map((skill, idx) => (
            <span key={idx} className="px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-500/10 text-indigo-700 dark:text-indigo-300 text-[10px] font-medium border border-indigo-200 dark:border-indigo-500/20">
              {skill}
            </span>
          ))}
        </div>
      </div>

      <div className="pt-4 border-t border-slate-200 dark:border-slate-800/80 flex items-center justify-between">
        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium">
          Posted {new Date(job.createdAt).toLocaleDateString()}
        </span>
        <Link
          to={`/jobs/${job._id}`}
          className="inline-flex items-center gap-1 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700 dark:hover:text-indigo-300 transition-colors"
        >
          View Position <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    </div>
  );
};

export default JobCard;
