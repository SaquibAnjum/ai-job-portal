import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useDispatch, useSelector } from 'react-redux';
import { verifyEmailOtp, resendOtp, clearError } from '../redux/slices/authSlice';
import { Sparkles, KeyRound, ArrowRight, RefreshCw, AlertCircle, CheckCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const VerifyEmailPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const { isAuthenticated, user, loading, error, unverifiedEmail } = useSelector((state) => state.auth);

  const emailParam = new URLSearchParams(location.search).get('email') || unverifiedEmail || '';
  const [email, setEmail] = useState(emailParam);
  const [otp, setOtp] = useState('');
  const [infoMessage, setInfoMessage] = useState('');
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);

  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === 'candidate') navigate('/candidate-dashboard');
      else if (user.role === 'recruiter') navigate('/recruiter-dashboard');
      else navigate('/admin-dashboard');
    }
  }, [isAuthenticated, user, navigate]);

  useEffect(() => {
    let timer;
    if (countdown > 0 && !canResend) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(timer);
  }, [countdown, canResend]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!otp || otp.length < 6) return;
    dispatch(clearError());
    setInfoMessage('');
    dispatch(verifyEmailOtp({ email, otp }));
  };

  const handleResend = async () => {
    if (!canResend || !email) return;
    dispatch(clearError());
    setInfoMessage('');
    const result = await dispatch(resendOtp({ email }));
    if (resendOtp.fulfilled.match(result)) {
      setInfoMessage(result.payload.message || 'A new 6-digit code has been sent to your email.');
      setCountdown(60);
      setCanResend(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <div className="flex-1 flex items-center justify-center p-4 py-12">
        <div className="w-full max-w-md glass-card p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6">
          <div className="text-center space-y-2">
            <div className="w-12 h-12 rounded-2xl bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center mx-auto mb-3">
              <KeyRound className="w-6 h-6 text-indigo-400" />
            </div>
            <h2 className="text-2xl font-bold text-white">Verify Your Email</h2>
            <p className="text-xs text-slate-400">
              We sent a 6-digit verification code to <span className="text-indigo-300 font-semibold">{email || 'your email'}</span>
            </p>
          </div>

          <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-center space-y-1">
            <p className="text-[11px] text-indigo-300 font-semibold flex items-center justify-center gap-1">
              <span>📩 Check your Inbox & Spam / Junk / Promotions tab!</span>
            </p>
            <p className="text-[10px] text-slate-400">
              The 6-digit verification code is included directly in the email subject & body.
            </p>
          </div>

          {error && (
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-center gap-2 text-xs text-rose-400">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {infoMessage && (
            <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl flex items-center gap-2 text-xs text-emerald-400">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span>{infoMessage}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!emailParam && (
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Email Address</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-500"
                  placeholder="candidate@example.com"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">6-Digit Verification Code</label>
              <input
                type="text"
                required
                maxLength={6}
                value={otp}
                onChange={(e) => setOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="123456"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-3 text-center text-lg tracking-[8px] font-mono text-white focus:outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading || otp.length < 6}
              className="w-full py-3 px-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-indigo-600/30 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {loading ? 'Verifying Code...' : <><ArrowRight className="w-4 h-4" /> Complete Verification</>}
            </button>
          </form>

          <div className="pt-4 border-t border-slate-800/80 text-center space-y-2">
            <p className="text-xs text-slate-400">Didn't receive the email code?</p>
            <button
              onClick={handleResend}
              disabled={!canResend || loading}
              className="text-xs text-indigo-400 font-semibold hover:underline flex items-center justify-center gap-1.5 mx-auto disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${!canResend ? 'animate-spin' : ''}`} />
              {canResend ? 'Resend Verification Code' : `Resend available in ${countdown}s`}
            </button>

            <div className="pt-2">
              <Link to="/login" className="text-[11px] text-slate-500 hover:text-slate-300">
                Back to Sign In
              </Link>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default VerifyEmailPage;
