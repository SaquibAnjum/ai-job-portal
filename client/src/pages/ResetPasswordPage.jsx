import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

function ResetPasswordPage() {
  const { token } = useParams();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }
    setLoading(true);
    setError('');
    setMessage('');
    try {
      await axios.post(`/api/v1/auth/reset-password/${token}`, { password });
      setMessage('Password reset successful! Redirecting to login...');
      setTimeout(() => navigate('/login'), 2000);
    } catch (err) {
      setError(err.response?.data?.message || 'Password reset failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col justify-between transition-colors duration-300">
      <Navbar />
      <div className="max-w-md w-full mx-auto my-12 p-8 glass-card rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-2xl">
        <h2 className="text-2xl font-bold text-center text-indigo-600 dark:text-indigo-400 mb-2">Set New Password</h2>
        <p className="text-slate-600 dark:text-slate-400 text-sm text-center mb-6">Enter your new secure account password below.</p>

        {message && <div className="p-3 bg-emerald-50 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-300 rounded-lg text-sm mb-4 border border-emerald-200 dark:border-emerald-500/30">{message}</div>}
        {error && <div className="p-3 bg-rose-50 dark:bg-rose-500/20 text-rose-800 dark:text-rose-300 rounded-lg text-sm mb-4 border border-rose-200 dark:border-rose-500/30">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase mb-1">Confirm New Password</label>
            <input
              type="password"
              required
              minLength={6}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full glass-input rounded-xl px-4 py-2.5 text-xs focus:outline-none"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs rounded-xl transition shadow-lg shadow-indigo-600/30 disabled:opacity-50"
          >
            {loading ? 'Resetting Password...' : 'Reset Password'}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-600 dark:text-slate-400">
          <Link to="/login" className="text-indigo-600 dark:text-indigo-400 font-semibold hover:underline">
            Back to Login
          </Link>
        </div>
      </div>
      <Footer />
    </div>
  );
}

export default ResetPasswordPage;
