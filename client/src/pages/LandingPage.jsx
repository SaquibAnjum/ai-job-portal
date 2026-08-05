import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Brain, Cpu, Zap, ArrowRight, Search, Target } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col selection:bg-indigo-500 selection:text-white transition-colors duration-300">
      <Navbar />

      {/* Hero Section */}
      <section className="relative pt-20 pb-32 overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-indigo-100/60 via-slate-50 to-slate-50 dark:from-indigo-900/30 dark:via-slate-950 dark:to-slate-950"></div>
        
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-indigo-100 dark:bg-indigo-500/10 border border-indigo-200 dark:border-indigo-500/20 text-indigo-600 dark:text-indigo-400 text-xs font-semibold mb-8 animate-in fade-in slide-in-from-bottom-2">
            <Sparkles className="w-3.5 h-3.5" /> Next-Generation AI Recruitment Engine
          </div>

          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-extrabold tracking-tight max-w-5xl mx-auto leading-tight mb-8 text-slate-900 dark:text-white">
            Smart Resume Matching Powered by <span className="gradient-text">Google Gemini AI</span>
          </h1>

          <p className="text-base sm:text-xl text-slate-600 dark:text-slate-400 max-w-3xl mx-auto mb-10 leading-relaxed">
            Eliminate manual resume screening. Our vector-based AI matches candidate profiles with job requirements in seconds, delivering ranked top talent to recruiters and personalized skill gap reports to applicants.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              to="/register"
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-2xl font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all hover:scale-105 flex items-center justify-center gap-2"
            >
              Get Started for Free <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              to="/jobs"
              className="w-full sm:w-auto px-8 py-4 glass-card hover:bg-slate-100 dark:hover:bg-slate-900 text-slate-800 dark:text-slate-200 rounded-2xl font-bold text-sm border border-slate-200 dark:border-slate-800 transition-all hover:border-slate-300 dark:hover:border-slate-700 flex items-center justify-center gap-2"
            >
              <Search className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Explore Jobs
            </Link>
          </div>

          {/* Interactive Feature Teaser Card */}
          <div className="mt-16 max-w-4xl mx-auto glass-card rounded-3xl p-6 sm:p-8 border border-slate-200/80 dark:border-slate-800/80 shadow-2xl text-left">
            <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-4 mb-6">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-rose-500"></div>
                <div className="w-3 h-3 rounded-full bg-amber-500"></div>
                <div className="w-3 h-3 rounded-full bg-emerald-500"></div>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 ml-2">Live AI Match Simulator</span>
              </div>
              <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-300 dark:border-emerald-500/20">
                94% Alignment Score
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
              <div className="p-4 rounded-xl bg-slate-100/80 dark:bg-slate-950/60 border border-slate-200 dark:border-slate-800 space-y-2">
                <p className="font-bold text-slate-800 dark:text-slate-300">Target Candidate: Alex Mercer</p>
                <p className="text-slate-600 dark:text-slate-400">Skills: React.js, Node.js, Express, MongoDB, Tailwind CSS</p>
                <p className="text-slate-600 dark:text-slate-400">Experience: 4 Years Full-Stack Engineering</p>
              </div>
              <div className="p-4 rounded-xl bg-indigo-50 dark:bg-indigo-950/30 border border-indigo-200 dark:border-indigo-500/30 space-y-2">
                <p className="font-bold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5">
                  <Brain className="w-4 h-4 text-indigo-600 dark:text-indigo-400" /> Gemini Match Output
                </p>
                <p className="text-slate-700 dark:text-slate-300">Reasoning: Exceptional overlap with Senior MERN Stack role. High technical proficiency.</p>
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 px-2 py-0.5 rounded font-mono font-medium">Matched: React, Node, Express</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Core AI Features Grid */}
      <section className="py-24 bg-slate-100/60 dark:bg-slate-950 border-t border-slate-200 dark:border-slate-900 transition-colors duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-3xl font-extrabold text-slate-900 dark:text-white sm:text-4xl mb-4">
              Autonomous Recruitment Capabilities
            </h2>
            <p className="text-slate-600 dark:text-slate-400 text-sm">
              Designed for modern hiring teams and ambitious engineers. Everything you need to match, screen, interview, and offer.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-indigo-100 dark:bg-indigo-600/20 border border-indigo-200 dark:border-indigo-500/30 flex items-center justify-center">
                <Cpu className="w-6 h-6 text-indigo-600 dark:text-indigo-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Resume Parser</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Upload PDF/DOCX resumes and let Gemini AI instantly extract structured JSON profile data, skills, projects, and work history.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-purple-100 dark:bg-purple-600/20 border border-purple-200 dark:border-purple-500/30 flex items-center justify-center">
                <Target className="w-6 h-6 text-purple-600 dark:text-purple-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">Smart Match Scoring</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Generates 0-100% suitability match scores, detailed skill gap analysis, and tailored course recommendations for candidates.
              </p>
            </div>

            <div className="glass-card p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 space-y-4">
              <div className="w-12 h-12 rounded-2xl bg-pink-100 dark:bg-pink-600/20 border border-pink-200 dark:border-pink-500/30 flex items-center justify-center">
                <Zap className="w-6 h-6 text-pink-600 dark:text-pink-400" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">AI Interview Questions</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                Automatically builds role-specific technical & behavioral interview question banks customized to the candidate's exact resume.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};

export default LandingPage;
