import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { Complaint } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatRelativeTime } from '../utils/formatters';
import { CivicMap } from '../components/map/CivicMap';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  MapPin,
  ExternalLink,
  ShieldCheck,
  Sparkles
} from 'lucide-react';

export const CitizenDashboard: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchComplaints = async () => {
      try {
        setLoading(true);
        const data = await complaintService.getComplaints();
        setComplaints(data.complaints || []);
      } catch (err) {
        console.error('Failed to load citizen complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchComplaints();
  }, []);

  const total = complaints.length;
  const inProgress = complaints.filter(c => c.status === 'In Progress' || c.status === 'Assigned').length;
  const resolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
  const verificationNeeded = complaints.filter(c => c.status === 'Resolved' || c.status === 'Citizen Verification').length;

  return (
    <div className="space-y-8">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-civic-700 via-civic-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-civic-600/60 text-civic-200 text-xs font-semibold">
            <Sparkles className="w-3.5 h-3.5 text-civic-300" />
            <span>Citizen Grievance Redressal Portal</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Welcome back, {user?.name || 'Citizen'}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Track your submitted civic issues, monitor field repairs in real time, and confirm resolution quality.
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center justify-center space-x-2 px-6 py-3.5 rounded-xl bg-white text-civic-700 hover:bg-civic-50 font-bold text-sm shadow-md transition transform hover:-translate-y-0.5 shrink-0"
        >
          <PlusCircle className="w-5 h-5 text-civic-600" />
          <span>Report an Issue</span>
        </Link>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileText className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Total Reports</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{total}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Field Work In Progress</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{inProgress}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Resolved</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{resolved}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-teal-600 flex items-center justify-center font-bold">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Action: Verify Repair</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{verificationNeeded}</p>
          </div>
        </div>
      </div>

      {/* Main Grid: My Complaints List + Nearby Map Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Complaints Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Recent Reported Civic Issues</h2>
              <p className="text-xs text-slate-500">Live complaint statuses and assignment tracking</p>
            </div>
            <Link
              to="/my-complaints"
              className="text-xs font-bold text-civic-600 hover:text-civic-700 flex items-center space-x-1"
            >
              <span>View All</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
              Loading complaints...
            </div>
          ) : complaints.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
              <FileText className="w-10 h-10 text-slate-300 mx-auto" />
              <p className="text-sm font-semibold text-slate-700">No civic issues reported yet.</p>
              <Link
                to="/report"
                className="inline-block px-4 py-2 bg-civic-600 text-white rounded-lg text-xs font-bold"
              >
                Submit First Report
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {complaints.slice(0, 5).map(c => {
                const pBadge = getPriorityBadge(c.priority);
                const sBadge = getStatusBadge(c.status);

                return (
                  <Link
                    key={c._id}
                    to={`/complaint/${c._id}`}
                    className="block bg-white p-4 rounded-xl border border-slate-200 hover:border-civic-300 hover:shadow-md transition group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3.5">
                        {c.images && c.images.length > 0 ? (
                          <img
                            src={c.images[0]}
                            alt={c.title}
                            className="w-16 h-16 rounded-lg object-cover shrink-0 border border-slate-200"
                          />
                        ) : (
                          <div className="w-16 h-16 rounded-lg bg-slate-100 flex items-center justify-center text-slate-400 shrink-0">
                            <MapPin className="w-6 h-6" />
                          </div>
                        )}
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                              {c.complaintId}
                            </span>
                            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                              {c.priority}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-slate-900 group-hover:text-civic-600 transition line-clamp-1">
                            {c.title}
                          </h3>
                          <p className="text-xs text-slate-500 line-clamp-1">
                            📍 {c.address}
                          </p>
                        </div>
                      </div>

                      <div className="text-right shrink-0">
                        <span className={`inline-block text-xs font-bold px-2.5 py-1 rounded-md border ${sBadge.bg} ${sBadge.text} ${sBadge.border}`}>
                          {sBadge.label}
                        </span>
                        <p className="text-[10px] text-slate-400 mt-1">
                          {formatRelativeTime(c.createdAt)}
                        </p>
                      </div>
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* Nearby Map Widget (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Nearby Civic Grid</h2>
              <p className="text-xs text-slate-500">Live issues reported in your municipality</p>
            </div>
            <Link to="/map" className="text-xs font-bold text-civic-600 hover:text-civic-700">
              Full Map →
            </Link>
          </div>

          <CivicMap complaints={complaints} height="360px" />
        </div>
      </div>
    </div>
  );
};
