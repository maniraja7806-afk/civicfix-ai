import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { complaintService } from '../services/complaintService';
import { Complaint } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import {
  FileText,
  Search,
  PlusCircle,
  Filter,
  ExternalLink,
  MapPin,
  Clock,
  ArrowRight
} from 'lucide-react';

export const MyComplaintsPage: React.FC = () => {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'all' | 'active' | 'resolved'>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchMyComplaints = async () => {
      try {
        setLoading(true);
        const res = await complaintService.getComplaints({ citizenId: user?.id });
        setComplaints(res.complaints || []);
      } catch (err) {
        console.error('Failed to load my complaints:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchMyComplaints();
  }, [user]);

  const filtered = complaints.filter(c => {
    if (activeTab === 'active' && (c.status === 'Resolved' || c.status === 'Closed')) return false;
    if (activeTab === 'resolved' && !(c.status === 'Resolved' || c.status === 'Closed')) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.complaintId.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            My Reported Issues
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Complete history of civic grievances submitted by your account
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-1.5 px-4 py-2.5 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Tabs and Search */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-1 bg-slate-100 p-1 rounded-xl w-full sm:w-auto">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            All Reports ({complaints.length})
          </button>
          <button
            onClick={() => setActiveTab('active')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'active' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            In Progress (
            {complaints.filter(c => c.status !== 'Resolved' && c.status !== 'Closed').length})
          </button>
          <button
            onClick={() => setActiveTab('resolved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition ${
              activeTab === 'resolved' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600'
            }`}
          >
            Resolved (
            {complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length})
          </button>
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID or keyword..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
          />
        </div>
      </div>

      {/* Complaints List */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
          Loading your complaints...
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-3">
          <FileText className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No matching civic issues found.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filtered.map(c => {
            const pBadge = getPriorityBadge(c.priority);
            const sBadge = getStatusBadge(c.status);

            return (
              <Link
                key={c._id}
                to={`/complaint/${c._id}`}
                className="bg-white p-5 rounded-2xl border border-slate-200 hover:border-civic-400 hover:shadow-md transition group space-y-3 flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
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

                  <p className="text-xs text-slate-500 line-clamp-2">
                    {c.description}
                  </p>

                  <p className="text-xs text-slate-500 line-clamp-1">
                    📍 {c.address}
                  </p>
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-slate-100 text-xs">
                  <span className={`font-semibold px-2 py-0.5 rounded ${sBadge.bg} ${sBadge.text}`}>
                    {sBadge.label}
                  </span>
                  <span className="text-slate-400 text-[11px] flex items-center space-x-1 group-hover:text-civic-600">
                    <span>Track Status</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};
