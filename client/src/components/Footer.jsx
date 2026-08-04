import React from 'react';
import { Sparkles, Github, Twitter, Linkedin, Heart } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="border-t border-slate-800/80 bg-slate-950/90 text-slate-400 text-xs py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-4 gap-8">
        <div className="space-y-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-indigo-400" />
            <span className="text-lg font-bold text-white">NexHire.AI</span>
          </div>
          <p className="text-slate-400 leading-relaxed">
            Enterprise-grade recruitment platform powered by Google Gemini API. Autonomous resume parsing, embedding-based job matching, and real-time hiring workflows.
          </p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider">Candidate Platform</h4>
          <ul className="space-y-2">
            <li><a href="/jobs" className="hover:text-indigo-400 transition-colors">AI Skill Matcher</a></li>
            <li><a href="/candidate-dashboard" className="hover:text-indigo-400 transition-colors">Resume Parser</a></li>
            <li><a href="/interviews" className="hover:text-indigo-400 transition-colors">Interview Preparation</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider">Recruiter Hub</h4>
          <ul className="space-y-2">
            <li><a href="/recruiter-dashboard" className="hover:text-indigo-400 transition-colors">Post Jobs with AI JD</a></li>
            <li><a href="/recruiter-dashboard" className="hover:text-indigo-400 transition-colors">Candidate Ranking Engine</a></li>
            <li><a href="/recruiter-dashboard" className="hover:text-indigo-400 transition-colors">PDF Offer Generator</a></li>
          </ul>
        </div>

        <div>
          <h4 className="font-semibold text-slate-200 mb-3 uppercase tracking-wider">Connect & Tech</h4>
          <div className="flex gap-3 text-slate-400 mb-4">
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-indigo-400"><Github className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-indigo-400"><Twitter className="w-4 h-4" /></a>
            <a href="#" className="p-2 rounded-lg bg-slate-900 hover:text-indigo-400"><Linkedin className="w-4 h-4" /></a>
          </div>
          <p className="text-[11px] text-slate-500">MERN Stack + Google Gemini 2.5 Flash + WebSockets</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500">
        <p>© 2026 NexHire.AI. Production Grade AI Recruitment Platform.</p>
        <p className="flex items-center gap-1">Built with <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" /> for modern software engineering teams.</p>
      </div>
    </footer>
  );
};

export default Footer;
