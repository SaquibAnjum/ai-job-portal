import React from 'react';

const MatchGauge = ({ score = 85, size = 'md' }) => {
  const getBadgeColor = (val) => {
    if (val >= 85) return 'from-emerald-500 to-teal-400 text-emerald-400 border-emerald-500/30';
    if (val >= 70) return 'from-indigo-500 to-purple-400 text-indigo-400 border-indigo-500/30';
    if (val >= 50) return 'from-amber-500 to-yellow-400 text-amber-400 border-amber-500/30';
    return 'from-rose-500 to-red-400 text-rose-400 border-rose-500/30';
  };

  if (size === 'sm') {
    return (
      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold bg-slate-900 border ${getBadgeColor(score)} shadow-md`}>
        <span className="w-2 h-2 rounded-full bg-current animate-pulse"></span>
        {score}% Match
      </span>
    );
  }

  return (
    <div className="flex items-center gap-3 glass-card px-4 py-2.5 rounded-2xl border border-slate-800">
      <div className="relative w-12 h-12 flex items-center justify-center">
        <svg className="w-full h-full transform -rotate-90" viewBox="0 0 36 36">
          <path
            className="text-slate-800"
            strokeWidth="3.5"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
          <path
            className={score >= 80 ? 'text-emerald-400' : score >= 65 ? 'text-indigo-400' : 'text-amber-400'}
            strokeDasharray={`${score}, 100`}
            strokeWidth="3.5"
            strokeLinecap="round"
            stroke="currentColor"
            fill="none"
            d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
          />
        </svg>
        <span className="absolute text-xs font-black text-white">{score}%</span>
      </div>
      <div>
        <p className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">AI Skill Score</p>
        <p className="text-xs font-bold text-slate-200">
          {score >= 85 ? 'Exceptional Match' : score >= 70 ? 'Strong Fit' : 'Moderate Alignment'}
        </p>
      </div>
    </div>
  );
};

export default MatchGauge;
