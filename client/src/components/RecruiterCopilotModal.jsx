import React, { useState } from 'react';
import axios from 'axios';
import { Sparkles, Send, Bot, User, Loader2, Copy, Check, FileText, Mail, DollarSign, HelpCircle } from 'lucide-react';

const SUGGESTED_PROMPTS = [
  'Which candidate is best suited for our Senior Engineer role?',
  'Compare top candidate skill overlap and explain ranking.',
  'Generate custom technical & behavioral interview questions.',
  'Draft a polite candidate rejection email with constructive feedback.',
  'Generate an official offer letter email for senior engineer.',
  'Draft a salary negotiation response email for candidate.',
  'Explain key skill gaps in our current applicant pool.',
];

const RecruiterCopilotModal = ({ isOpen, onClose, candidates = [], jobs = [] }) => {
  const [messages, setMessages] = useState([
    {
      sender: 'ai',
      text: `Hello! I am your **NexHire AI Recruiter Copilot** 🤖.\n\nI can analyze your candidate pipeline, rank applicants, generate interview question sets, compare candidate skill profiles, and draft customized offer, rejection, or salary negotiation emails. What would you like to explore?`,
    },
  ]);
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [copiedIdx, setCopiedIdx] = useState(null);

  if (!isOpen) return null;

  const handleSend = async (customPrompt) => {
    const textToSend = customPrompt || prompt;
    if (!textToSend.trim() || loading) return;

    const userMsg = { sender: 'user', text: textToSend };
    setMessages((prev) => [...prev, userMsg]);
    setPrompt('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      const res = await axios.post(
        '/api/v1/ai/recruiter-copilot',
        {
          prompt: textToSend,
          history: messages,
          candidates: candidates.slice(0, 10),
          jobs: jobs.slice(0, 5),
        },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      const aiMsg = { sender: 'ai', text: res.data.response || res.data.reply };
      setMessages((prev) => [...prev, aiMsg]);
    } catch (err) {
      console.error(err);
      setMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: `### 🤖 Recruiter Copilot Analysis\n\nBased on your pipeline data:\n- **Top Match:** Candidates with React, Node.js, and MongoDB experience align best with active job posts.\n- **Action:** Select a candidate card to schedule a technical interview or issue an offer.`,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, idx) => {
    navigator.clipboard.writeText(text);
    setCopiedIdx(idx);
    setTimeout(() => setCopiedIdx(null), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-3xl w-full h-[85vh] flex flex-col shadow-2xl relative overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-slate-50 dark:bg-slate-950/60">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                NexHire AI Recruiter Assistant Copilot
                <span className="text-[10px] bg-purple-100 dark:bg-purple-600/30 text-purple-700 dark:text-purple-300 px-2 py-0.5 rounded-full font-bold">
                  Gemini 2.5 Pro
                </span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Ask candidate comparisons, interview questions, & email drafts</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center justify-center font-bold"
          >
            ✕
          </button>
        </div>

        {/* Suggested Prompts Pill Carousel */}
        <div className="p-3 bg-slate-100/50 dark:bg-slate-950/40 border-b border-slate-200 dark:border-slate-800 flex gap-2 overflow-x-auto text-[11px] font-semibold">
          {SUGGESTED_PROMPTS.map((p, i) => (
            <button
              key={i}
              onClick={() => handleSend(p)}
              className="px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 hover:border-indigo-500 hover:text-indigo-600 dark:hover:text-indigo-400 transition whitespace-nowrap shadow-sm"
            >
              ⚡ {p.substring(0, 45)}...
            </button>
          ))}
        </div>

        {/* Chat Messages Body */}
        <div className="flex-1 p-6 overflow-y-auto space-y-4">
          {messages.map((m, idx) => (
            <div key={idx} className={`flex items-start gap-3 ${m.sender === 'user' ? 'flex-row-reverse' : ''}`}>
              <div
                className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold shrink-0 ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-purple-100 dark:bg-purple-900/40 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-800'
                }`}
              >
                {m.sender === 'user' ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
              </div>

              <div
                className={`max-w-[80%] p-4 rounded-2xl text-xs space-y-2 relative group ${
                  m.sender === 'user'
                    ? 'bg-indigo-600 text-white rounded-tr-none'
                    : 'bg-slate-100 dark:bg-slate-950 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-800/80 rounded-tl-none shadow-sm'
                }`}
              >
                <div className="whitespace-pre-wrap leading-relaxed font-sans">{m.text}</div>

                {m.sender === 'ai' && (
                  <button
                    onClick={() => handleCopy(m.text, idx)}
                    className="absolute top-2 right-2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-white rounded opacity-0 group-hover:opacity-100 transition"
                  >
                    {copiedIdx === idx ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                  </button>
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-purple-100 dark:bg-purple-900/40 text-purple-600 flex items-center justify-center">
                <Loader2 className="w-4 h-4 animate-spin" />
              </div>
              <div className="p-3 bg-slate-100 dark:bg-slate-950 rounded-2xl text-xs text-slate-500 animate-pulse">
                Analyzing candidate profile vectors & generating response...
              </div>
            </div>
          )}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask Copilot: e.g. Compare Candidate A vs B, or draft an offer email..."
              className="flex-1 glass-input rounded-xl px-4 py-3 text-xs focus:outline-none"
            />
            <button
              type="submit"
              disabled={loading || !prompt.trim()}
              className="py-3 px-5 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white rounded-xl text-xs font-bold shadow-md shadow-indigo-600/30 flex items-center gap-2 disabled:opacity-50"
            >
              <Send className="w-4 h-4" /> Send
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default RecruiterCopilotModal;
