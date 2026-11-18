import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { ShieldAlert, LogIn, ArrowRight, AlertCircle, KeyRound, UserCheck } from 'lucide-react';
import { UserRole } from '../types';

export const LoginPage: React.FC = () => {
  const { login, demoLogin, isLoading } = useAuth();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    try {
      await login({ email, password });
      // Redirect handled by Auth context / check user role
      navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Login failed. Please verify your credentials.');
    }
  };

  const handleDemoClick = async (role: UserRole) => {
    setError(null);
    try {
      await demoLogin(role);
      if (role === 'admin') navigate('/dashboard/admin');
      else if (role === 'officer') navigate('/dashboard/officer');
      else navigate('/dashboard/citizen');
    } catch (err: any) {
      setError(err.response?.data?.message || 'Demo login failed');
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-2xl shadow-xl border border-slate-200">
        <div className="text-center space-y-2">
          <div className="w-12 h-12 rounded-xl bg-civic-600 text-white flex items-center justify-center mx-auto shadow-md">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <h2 className="text-2xl font-black text-slate-900 tracking-tight">Sign in to CivicFix AI</h2>
          <p className="text-xs text-slate-500">
            Access citizen reporting, field resolution tasks, or administrative analytics
          </p>
        </div>

        {/* 1-Click Demo Section for Hackathon presentation */}
        <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 space-y-2.5">
          <div className="flex items-center space-x-1.5 text-xs font-bold text-slate-800">
            <UserCheck className="w-4 h-4 text-civic-600" />
            <span>Smart India Hackathon 1-Click Demo Login</span>
          </div>
          <p className="text-[11px] text-slate-500">
            Instant evaluation access without manual credential entry:
          </p>
          <div className="grid grid-cols-3 gap-2 pt-1">
            <button
              type="button"
              onClick={() => handleDemoClick('citizen')}
              disabled={isLoading}
              className="py-2 px-2 bg-white hover:bg-civic-50 border border-slate-300 text-slate-800 hover:text-civic-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Citizen
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('officer')}
              disabled={isLoading}
              className="py-2 px-2 bg-white hover:bg-amber-50 border border-slate-300 text-slate-800 hover:text-amber-800 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Officer (PWD)
            </button>
            <button
              type="button"
              onClick={() => handleDemoClick('admin')}
              disabled={isLoading}
              className="py-2 px-2 bg-white hover:bg-indigo-50 border border-slate-300 text-slate-800 hover:text-indigo-700 text-xs font-semibold rounded-lg shadow-2xs transition"
            >
              Admin Comm.
            </button>
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-50 text-red-700 text-xs rounded-lg border border-red-200 flex items-center space-x-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. citizen@civicfix.gov.in"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Password</label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="w-full px-3.5 py-2.5 rounded-lg border border-slate-300 text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-sm font-bold shadow-md shadow-civic-600/20 transition flex items-center justify-center space-x-2 disabled:opacity-50"
          >
            <LogIn className="w-4 h-4" />
            <span>{isLoading ? 'Signing In...' : 'Sign In'}</span>
          </button>
        </form>

        <div className="text-center text-xs text-slate-500">
          New to CivicFix AI?{' '}
          <Link to="/register" className="font-bold text-civic-600 hover:underline">
            Register as a Citizen
          </Link>
        </div>
      </div>
    </div>
  );
};
