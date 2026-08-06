import React, { useState } from 'react';
import { Sparkles, FileText, ArrowRight, UserCheck, Video, DollarSign, UserX, CheckCircle } from 'lucide-react';
import MatchGauge from './MatchGauge';

const KANBAN_STAGES = [
  { id: 'Submitted', label: 'Submitted', color: 'border-blue-500/40 bg-blue-500/5 text-blue-400' },
  { id: 'Reviewed', label: 'Reviewed', color: 'border-indigo-500/40 bg-indigo-500/5 text-indigo-400' },
  { id: 'Shortlisted', label: 'Shortlisted', color: 'border-emerald-500/40 bg-emerald-500/5 text-emerald-400' },
  { id: 'Interview', label: 'Interview', color: 'border-purple-500/40 bg-purple-500/5 text-purple-400' },
  { id: 'Technical Round', label: 'Tech Round', color: 'border-cyan-500/40 bg-cyan-500/5 text-cyan-400' },
  { id: 'HR Round', label: 'HR Round', color: 'border-amber-500/40 bg-amber-500/5 text-amber-400' },
  { id: 'Offer', label: 'Offer Sent', color: 'border-teal-500/40 bg-teal-500/5 text-teal-400' },
  { id: 'Joined', label: 'Hired / Joined', color: 'border-emerald-500 bg-emerald-500/10 text-emerald-300' },
  { id: 'Rejected', label: 'Rejected', color: 'border-rose-500/40 bg-rose-500/5 text-rose-400' },
];

const KanbanPipelineBoard = ({ applications = [], onUpdateStatus, onScheduleInterview, onIssueOffer, onRejectCandidate }) => {
  const [draggedAppId, setDraggedAppId] = useState(null);

  const handleDragStart = (e, appId) => {
    e.dataTransfer.setData('text/plain', appId);
    setDraggedAppId(appId);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
  };

  const handleDrop = (e, stageId) => {
    e.preventDefault();
    const appId = e.dataTransfer.getData('text/plain') || draggedAppId;
    if (appId && stageId) {
      onUpdateStatus(appId, stageId);
    }
    setDraggedAppId(null);
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-indigo-500" /> Interactive Recruitment Kanban Pipeline
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400">
            Drag candidate cards between columns or use quick stage actions to advance applicants.
          </p>
        </div>
      </div>

      <div className="flex gap-4 overflow-x-auto pb-6 pt-2 snap-x">
        {KANBAN_STAGES.map((stage) => {
          const stageApps = applications.filter((app) => app.status === stage.id);

          return (
            <div
              key={stage.id}
              onDragOver={handleDragOver}
              onDrop={(e) => handleDrop(e, stage.id)}
              className="w-72 shrink-0 glass-card rounded-2xl border border-slate-200/80 dark:border-slate-800 p-4 space-y-3 flex flex-col justify-between max-h-[75vh]"
            >
              {/* Column Header */}
              <div className={`p-2.5 rounded-xl border flex items-center justify-between ${stage.color}`}>
                <span className="font-extrabold text-xs">{stage.label}</span>
                <span className="text-[11px] font-black px-2 py-0.5 rounded-full bg-slate-900/60 text-white">
                  {stageApps.length}
                </span>
              </div>

              {/* Cards List */}
              <div className="flex-1 overflow-y-auto space-y-3 pr-1 min-h-[200px]">
                {stageApps.length === 0 ? (
                  <div className="h-full flex items-center justify-center border-2 border-dashed border-slate-200 dark:border-slate-800 rounded-xl p-4 text-center">
                    <p className="text-[11px] text-slate-400 dark:text-slate-600 font-medium">Drop candidates here</p>
                  </div>
                ) : (
                  stageApps.map((app) => {
                    const cand = app.candidate || {};
                    return (
                      <div
                        key={app._id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, app._id)}
                        className="p-3.5 rounded-xl bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/50 transition cursor-grab active:cursor-grabbing space-y-2 group"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 overflow-hidden">
                            <img
                              src={cand.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                              alt=""
                              className="w-8 h-8 rounded-lg object-cover ring-1 ring-slate-200 dark:ring-slate-700"
                            />
                            <div className="truncate">
                              <h5 className="font-bold text-xs text-slate-900 dark:text-white truncate">{cand.name}</h5>
                              <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate">{app.job?.title || 'Engineer'}</p>
                            </div>
                          </div>
                          <MatchGauge score={app.aiMatchAnalysis?.matchScore || 85} size="sm" />
                        </div>

                        <p className="text-[10px] text-slate-600 dark:text-slate-400 line-clamp-2 bg-slate-50 dark:bg-slate-900 p-2 rounded-lg">
                          <strong className="text-indigo-500">AI:</strong> {app.aiMatchAnalysis?.matchReason || 'Strong skill overlap.'}
                        </p>

                        {/* Stage Selector & Quick Actions */}
                        <div className="flex items-center justify-between pt-1 gap-1">
                          <select
                            value={app.status}
                            onChange={(e) => onUpdateStatus(app._id, e.target.value)}
                            className="text-[10px] glass-input rounded-md px-1.5 py-1 focus:outline-none bg-slate-100 dark:bg-slate-900 text-slate-700 dark:text-slate-300 font-semibold cursor-pointer"
                          >
                            {KANBAN_STAGES.map((s) => (
                              <option key={s.id} value={s.id}>
                                Move to: {s.label}
                              </option>
                            ))}
                          </select>

                          <div className="flex items-center gap-1 opacity-80 group-hover:opacity-100 transition">
                            <button
                              onClick={() => onScheduleInterview(app)}
                              title="Schedule Interview"
                              className="p-1 text-purple-600 dark:text-purple-400 hover:bg-purple-100 dark:hover:bg-purple-900/30 rounded"
                            >
                              <Video className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onIssueOffer(app)}
                              title="Issue Offer Letter"
                              className="p-1 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 rounded"
                            >
                              <DollarSign className="w-3.5 h-3.5" />
                            </button>
                            <button
                              onClick={() => onRejectCandidate(app._id)}
                              title="Reject"
                              className="p-1 text-rose-600 dark:text-rose-400 hover:bg-rose-100 dark:hover:bg-rose-900/30 rounded"
                            >
                              <UserX className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default KanbanPipelineBoard;
