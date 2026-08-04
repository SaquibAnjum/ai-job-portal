import React, { useState, useEffect } from 'react';
import axios from 'axios';
import {
  TrendingUp,
  Target,
  Clock,
  BookOpen,
  Award,
  Code2,
  Sparkles,
  RefreshCw,
  Zap,
  DollarSign,
  CheckCircle2,
  Calendar,
  Layers,
  Building,
  BrainCircuit,
  MessageSquare,
} from 'lucide-react';

function AIRoadmapModal({ isOpen, onClose, currentRole, currentProfile }) {
  const [targetRole, setTargetRole] = useState(currentRole || 'Senior Cloud Architect');
  const [roadmap, setRoadmap] = useState(null);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('phases'); // 'phases' | 'weekly' | 'monthly' | 'projects' | 'topics' | 'salary'

  useEffect(() => {
    if (currentProfile?.aiCareerRoadmap && currentProfile.aiCareerRoadmap.learningPath) {
      setRoadmap(currentProfile.aiCareerRoadmap);
    }
  }, [currentProfile, isOpen]);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    setLoading(true);
    try {
      const res = await axios.post('/api/v1/ai/career-roadmap', { targetRole });
      setRoadmap(res.data.data);
    } catch (err) {
      console.error('[Career Roadmap Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-4xl w-full max-h-[92vh] flex flex-col shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="p-6 border-b border-slate-800 flex items-center justify-between bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-500/20 text-indigo-400 rounded-2xl border border-indigo-500/30">
              <TrendingUp className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-extrabold text-white flex items-center gap-2">
                AI Personalized Career Progression Roadmap
                <span className="text-[10px] bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">
                  Gemini Powered
                </span>
              </h3>
              <p className="text-xs text-slate-400">Custom 360° skill progression, system design, and salary acceleration plan</p>
            </div>
          </div>

          <button onClick={onClose} className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition">
            ✕
          </button>
        </div>

        {/* Input Bar */}
        <div className="p-4 bg-slate-950/40 border-b border-slate-800 flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={targetRole}
            onChange={(e) => setTargetRole(e.target.value)}
            placeholder="Target Desired Role (e.g. Lead DevOps / Principal Engineer)"
            className="flex-1 px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-slate-100 text-xs focus:ring-2 focus:ring-indigo-500 outline-none"
          />
          <button
            onClick={handleGenerate}
            disabled={loading}
            className="px-6 py-2.5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 disabled:opacity-50"
          >
            {loading ? (
              <>
                <RefreshCw className="w-4 h-4 animate-spin" /> Generating Roadmap...
              </>
            ) : (
              <>
                <Zap className="w-4 h-4" /> Generate Dynamic Roadmap
              </>
            )}
          </button>
        </div>

        {/* Navigation Tabs */}
        {roadmap && (
          <div className="flex border-b border-slate-800 bg-slate-950/20 px-6 overflow-x-auto scrollbar-none">
            {[
              { id: 'phases', label: '🚀 Learning Phases' },
              { id: 'weekly', label: '📅 Weekly Plan' },
              { id: 'monthly', label: '🗓️ Monthly Milestones' },
              { id: 'projects', label: '💻 Projects to Build' },
              { id: 'topics', label: '🧠 System Design & DSA' },
              { id: 'salary', label: '💰 Salary & Target Companies' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-4 text-xs font-bold whitespace-nowrap border-b-2 transition ${
                  activeTab === tab.id
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-white'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        )}

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {!roadmap && !loading && (
            <div className="text-center py-16 space-y-4">
              <div className="w-16 h-16 rounded-full bg-indigo-500/10 text-indigo-400 mx-auto flex items-center justify-center border border-indigo-500/20">
                <TrendingUp className="w-8 h-8" />
              </div>
              <h4 className="text-base font-bold text-white">Generate Your Personalized Career Roadmap</h4>
              <p className="text-xs text-slate-400 max-w-md mx-auto">
                Gemini AI will cross-reference your current extracted skills with live market trends to map out your technical career trajectory.
              </p>
            </div>
          )}

          {loading && (
            <div className="text-center py-20 space-y-4">
              <RefreshCw className="w-10 h-10 animate-spin text-indigo-400 mx-auto" />
              <p className="text-xs font-bold text-slate-200">Gemini AI is computing skill gaps, projects, and weekly goals...</p>
            </div>
          )}

          {roadmap && !loading && (
            <>
              {/* Executive Overview Banner */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Current Level</span>
                  <p className="text-sm font-extrabold text-indigo-400 mt-1">{roadmap.currentLevel}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Target Level</span>
                  <p className="text-sm font-extrabold text-purple-400 mt-1">{roadmap.targetLevel}</p>
                </div>
                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <span className="text-[10px] uppercase font-bold text-slate-400">Estimated Timeline</span>
                  <p className="text-sm font-extrabold text-emerald-400 mt-1">{roadmap.estimatedTimeline}</p>
                </div>
              </div>

              {/* TAB 1: Learning Phases */}
              {activeTab === 'phases' && (
                <div className="space-y-4">
                  {/* Skill Gap Chip Row */}
                  <div className="p-4 rounded-2xl bg-slate-950/60 border border-slate-800 space-y-2">
                    <span className="text-xs font-bold text-rose-400 uppercase tracking-wider block">Identified Skill Gap:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {roadmap.skillGap?.map((sg, idx) => (
                        <span key={idx} className="px-2.5 py-1 bg-rose-950/40 text-rose-300 border border-rose-800/30 rounded-lg text-xs font-medium">
                          • {sg}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Stage Timeline Cards */}
                  <div className="space-y-4">
                    {roadmap.learningPath?.map((stage, idx) => (
                      <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3 relative">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <span className="w-8 h-8 rounded-xl bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-md">
                              {idx + 1}
                            </span>
                            <div>
                              <span className="text-[10px] text-indigo-400 font-bold uppercase">{stage.phase} ({stage.duration})</span>
                              <h4 className="font-extrabold text-white text-sm">{stage.title}</h4>
                            </div>
                          </div>
                        </div>

                        <p className="text-slate-300 text-xs leading-relaxed pl-11">{stage.description}</p>

                        <div className="pl-11 flex flex-wrap gap-1.5 pt-1">
                          {stage.targetSkills?.map((skill, sIdx) => (
                            <span key={sIdx} className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 rounded-lg text-[11px] font-semibold">
                              + {skill}
                            </span>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Recommended Courses & Certifications */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
                        <BookOpen className="w-4 h-4" /> Recommended Courses
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {roadmap.recommendedCourses?.map((course, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400 shrink-0 mt-0.5" />
                            <span>{course}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-3">
                      <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                        <Award className="w-4 h-4" /> Target Certifications
                      </h4>
                      <ul className="space-y-2 text-xs text-slate-300">
                        {roadmap.recommendedCertifications?.map((cert, idx) => (
                          <li key={idx} className="flex items-start gap-2">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0 mt-0.5" />
                            <span>{cert}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Weekly Plan */}
              {activeTab === 'weekly' && (
                <div className="space-y-4">
                  {roadmap.weeklyRoadmap?.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-extrabold text-indigo-400 uppercase flex items-center gap-2">
                          <Calendar className="w-4 h-4" /> {item.week}
                        </span>
                        <span className="text-xs font-bold text-white bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                          Focus: {item.focus}
                        </span>
                      </div>
                      <ul className="space-y-2 text-xs text-slate-300 pl-2">
                        {item.tasks?.map((task, tIdx) => (
                          <li key={tIdx} className="flex items-start gap-2">
                            <span className="text-indigo-400 font-bold">•</span>
                            <span>{task}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 3: Monthly Milestones */}
              {activeTab === 'monthly' && (
                <div className="space-y-4">
                  {roadmap.monthlyRoadmap?.map((item, idx) => (
                    <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                        <span className="text-xs font-extrabold text-purple-400 uppercase">{item.month}</span>
                        <span className="text-xs font-bold text-emerald-400">{item.milestone}</span>
                      </div>
                      <div className="space-y-1.5">
                        <span className="text-[11px] font-semibold text-slate-400 block">Key Objectives:</span>
                        {item.objectives?.map((obj, oIdx) => (
                          <div key={oIdx} className="flex items-center gap-2 text-xs text-slate-300">
                            <CheckCircle2 className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                            <span>{obj}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 4: Projects to Build */}
              {activeTab === 'projects' && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {roadmap.projectsToBuild?.map((proj, idx) => (
                    <div key={idx} className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-sm font-extrabold text-white flex items-center gap-2">
                        <Code2 className="w-4 h-4 text-indigo-400" /> {proj.title}
                      </h4>
                      <p className="text-xs text-slate-300 leading-relaxed">{proj.description}</p>
                      <div className="flex flex-wrap gap-1.5 pt-2">
                        {proj.techStack?.map((tech, tIdx) => (
                          <span key={tIdx} className="px-2.5 py-1 bg-indigo-950/60 text-indigo-300 border border-indigo-800/40 rounded-lg text-[10px] font-bold">
                            {tech}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* TAB 5: Interview Topics & DSA */}
              {activeTab === 'topics' && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-indigo-400 uppercase flex items-center gap-2">
                        <BrainCircuit className="w-4 h-4" /> System Design Topics
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {roadmap.systemDesignTopics?.map((top, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-indigo-400">•</span>
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-purple-400 uppercase flex items-center gap-2">
                        <Code2 className="w-4 h-4" /> DSA Patterns
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {roadmap.dsaTopics?.map((top, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-purple-400">•</span>
                            <span>{top}</span>
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="p-4 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                      <h4 className="text-xs font-bold text-emerald-400 uppercase flex items-center gap-2">
                        <MessageSquare className="w-4 h-4" /> Soft Skills & Leadership
                      </h4>
                      <ul className="space-y-1.5 text-xs text-slate-300">
                        {roadmap.softSkills?.map((sk, idx) => (
                          <li key={idx} className="flex items-start gap-1.5">
                            <span className="text-emerald-400">•</span>
                            <span>{sk}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Daily Practice Plan */}
                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                      <Clock className="w-4 h-4" /> Daily Practice Plan
                    </h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {roadmap.dailyPracticePlan?.map((plan, idx) => (
                        <div key={idx} className="p-3 bg-slate-900 border border-slate-800 rounded-xl text-xs text-slate-200">
                          {plan}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 6: Salary Growth & Target Companies */}
              {activeTab === 'salary' && (
                <div className="space-y-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-950 via-slate-900 to-slate-950 border border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-6">
                    <div>
                      <span className="text-xs uppercase font-bold text-slate-400">Current Salary Benchmark</span>
                      <p className="text-2xl font-extrabold text-slate-300">{roadmap.salaryGrowthPrediction?.currentAvg}</p>
                    </div>

                    <div className="text-center">
                      <span className="text-xs uppercase font-bold text-emerald-400">Projected Market Growth</span>
                      <p className="text-3xl font-extrabold text-emerald-400">{roadmap.salaryGrowthPrediction?.growthPercentage}</p>
                    </div>

                    <div className="text-right">
                      <span className="text-xs uppercase font-bold text-indigo-400">Target Role Benchmark</span>
                      <p className="text-2xl font-extrabold text-indigo-400">{roadmap.salaryGrowthPrediction?.targetAvg}</p>
                    </div>
                  </div>

                  <div className="p-5 bg-slate-950 border border-slate-800 rounded-2xl space-y-3">
                    <h4 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                      <Building className="w-4 h-4 text-indigo-400" /> Target Hiring Companies
                    </h4>
                    <div className="flex flex-wrap gap-2">
                      {roadmap.companyRecommendations?.map((comp, idx) => (
                        <span key={idx} className="px-3 py-1.5 bg-slate-900 text-slate-200 border border-slate-800 rounded-xl text-xs font-bold">
                          🏢 {comp}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}

export default AIRoadmapModal;
