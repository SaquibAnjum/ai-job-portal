import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Users, Briefcase, FileCheck, Trash2, Loader2, Sparkles, Building2, Activity, CreditCard, BarChart3, CheckCircle, XCircle } from 'lucide-react';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');
  const [stats, setStats] = useState(null);
  const [users, setUsers] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [subscriptions, setSubscriptions] = useState([]);
  const [reports, setReports] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAdminData();
  }, [activeTab]);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      const statsRes = await axios.get('/api/v1/admin/stats', { headers });
      setStats(statsRes.data.data);

      if (activeTab === 'users') {
        const res = await axios.get('/api/v1/admin/users', { headers });
        setUsers(res.data.data || []);
      } else if (activeTab === 'companies') {
        const res = await axios.get('/api/v1/admin/companies/pending', { headers });
        setCompanies(res.data.data || []);
      } else if (activeTab === 'audit') {
        const res = await axios.get('/api/v1/admin/audit-logs', { headers });
        setAuditLogs(res.data.data || []);
      } else if (activeTab === 'subscriptions') {
        const res = await axios.get('/api/v1/admin/subscriptions', { headers });
        setSubscriptions(res.data.data || []);
      } else if (activeTab === 'reports') {
        const res = await axios.get('/api/v1/admin/reports', { headers });
        setReports(res.data.data);
      }
    } catch (err) {
      console.error('[Admin Dashboard Error]:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteUser = async (userId) => {
    if (!window.confirm('Are you sure you want to remove this user from the system?')) return;
    try {
      const token = localStorage.getItem('token');
      await axios.delete(`/api/v1/admin/users/${userId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  const handleVerifyCompany = async (companyId, isVerified) => {
    try {
      const token = localStorage.getItem('token');
      await axios.put(
        `/api/v1/admin/companies/${companyId}/verify`,
        { isVerified },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      fetchAdminData();
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between">
      <Navbar />

      <main className="flex-1 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 w-full space-y-8">
        {/* Header */}
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 flex items-center justify-between">
          <div>
            <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
              <Shield className="w-5 h-5 text-indigo-400" /> System Admin Control Panel
            </h1>
            <p className="text-xs text-slate-400 mt-1">Platform overview, user governance, audit logs, and company verification.</p>
          </div>
        </div>

        {/* Global Statistics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Registered Users</p>
            <p className="text-2xl font-extrabold text-white mt-1">{stats?.totalUsers || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Verified Companies</p>
            <p className="text-2xl font-extrabold text-emerald-400 mt-1">{stats?.verifiedCompanies || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Active Job Postings</p>
            <p className="text-2xl font-extrabold text-indigo-400 mt-1">{stats?.activeJobs || 0}</p>
          </div>
          <div className="glass-card p-5 rounded-2xl border border-slate-800 text-center">
            <p className="text-xs text-slate-400 font-medium">Pending Verifications</p>
            <p className="text-2xl font-extrabold text-amber-400 mt-1">{stats?.pendingVerifications || 0}</p>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-slate-800 gap-2 overflow-x-auto pb-2">
          {[
            { id: 'users', label: 'User Management', icon: Users },
            { id: 'companies', label: 'Company Verification', icon: Building2 },
            { id: 'audit', label: 'Audit Logs', icon: Activity },
            { id: 'subscriptions', label: 'Subscriptions', icon: CreditCard },
            { id: 'reports', label: 'Analytics & Reports', icon: BarChart3 },
          ].map((tab) => {
            const Icon = tab.icon;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                  activeTab === tab.id
                    ? 'bg-indigo-600/20 text-indigo-300 border-indigo-500 shadow-md shadow-indigo-500/10'
                    : 'bg-slate-900/60 text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" /> {tab.label}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
          </div>
        ) : (
          <div>
            {/* 1. Users Tab */}
            {activeTab === 'users' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Users className="w-4 h-4 text-indigo-400" /> User Directory Governance ({users.length})
                </h2>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs text-slate-300">
                    <thead className="bg-slate-900/80 text-slate-400 uppercase text-[10px] font-bold">
                      <tr>
                        <th className="p-3">User</th>
                        <th className="p-3">Email</th>
                        <th className="p-3">Role</th>
                        <th className="p-3">Verified</th>
                        <th className="p-3 text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60">
                      {users.map((u) => (
                        <tr key={u._id} className="hover:bg-slate-900/50">
                          <td className="p-3 font-semibold text-white flex items-center gap-2">
                            <img src={u.avatar} alt={u.name} className="w-7 h-7 rounded-lg object-cover" />
                            {u.name}
                          </td>
                          <td className="p-3 text-slate-400">{u.email}</td>
                          <td className="p-3">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-indigo-500/20 text-indigo-300">
                              {u.role}
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{u.isVerified ? '✅ Verified' : '⏳ Pending'}</td>
                          <td className="p-3 text-right">
                            {u.role !== 'admin' && (
                              <button onClick={() => handleDeleteUser(u._id)} className="p-1.5 rounded-lg bg-rose-500/10 text-rose-400 hover:bg-rose-500/20">
                                <Trash2 className="w-4 h-4" />
                              </button>
                            )}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* 2. Companies Tab */}
            {activeTab === 'companies' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Building2 className="w-4 h-4 text-indigo-400" /> Employer Company Verification
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {companies.map((c) => (
                    <div key={c._id} className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between gap-4">
                      <div>
                        <h4 className="font-bold text-white text-sm">{c.name}</h4>
                        <p className="text-xs text-slate-400">{c.industry} • {c.location}</p>
                        <span className={`inline-block mt-2 text-[10px] font-bold px-2 py-0.5 rounded-md ${c.isVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-amber-500/20 text-amber-300'}`}>
                          {c.isVerified ? 'Verified' : 'Pending Verification'}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => handleVerifyCompany(c._id, true)} className="p-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" /> Verify
                        </button>
                        <button onClick={() => handleVerifyCompany(c._id, false)} className="p-2 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-xs font-bold flex items-center gap-1">
                          <XCircle className="w-4 h-4" /> Revoke
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 3. Audit Logs Tab */}
            {activeTab === 'audit' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" /> Security Audit Log Stream
                </h2>
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log._id} className="p-3 bg-slate-900 border border-slate-800 rounded-xl flex items-center justify-between text-xs">
                      <div>
                        <span className="font-bold text-indigo-400">{log.action}</span>
                        <span className="text-slate-400 ml-2">by {log.actorEmail}</span>
                      </div>
                      <span className="text-[11px] text-slate-500">{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 4. Subscriptions Tab */}
            {activeTab === 'subscriptions' && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-4">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-indigo-400" /> Subscription Plans & AI Credits
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {subscriptions.map((sub) => (
                    <div key={sub._id} className="p-4 bg-slate-900 border border-slate-800 rounded-xl flex justify-between items-center">
                      <div>
                        <h4 className="font-bold text-white text-xs">{sub.user?.name} ({sub.user?.role})</h4>
                        <p className="text-[11px] text-indigo-400">Plan: {sub.plan}</p>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-bold text-emerald-400">{sub.aiCredits} AI Credits</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* 5. Reports Tab */}
            {activeTab === 'reports' && reports && (
              <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-800 space-y-6">
                <h2 className="text-sm font-bold text-white flex items-center gap-2">
                  <BarChart3 className="w-4 h-4 text-indigo-400" /> Executive Platform Reports
                </h2>
                <div className="grid md:grid-cols-3 gap-4">
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400">Average Match Score</p>
                    <p className="text-3xl font-black text-emerald-400 mt-2">{reports.avgMatchScore}%</p>
                  </div>
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400">Total Applications Processed</p>
                    <p className="text-3xl font-black text-indigo-400 mt-2">{reports.funnel?.total}</p>
                  </div>
                  <div className="p-5 bg-slate-900 border border-slate-800 rounded-2xl">
                    <p className="text-xs text-slate-400">Offered Candidates</p>
                    <p className="text-3xl font-black text-purple-400 mt-2">{reports.funnel?.offered}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
};

export default AdminDashboard;
