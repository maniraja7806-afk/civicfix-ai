import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { CivicMap } from '../components/map/CivicMap';
import { complaintService } from '../services/complaintService';
import { Complaint, ComplaintPriority } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatRelativeTime } from '../utils/formatters';
import {
  Search,
  Filter,
  MapPin,
  PlusCircle,
  ExternalLink,
  ChevronRight,
  RefreshCw,
  Layers
} from 'lucide-react';

const CATEGORIES = [
  'All Categories',
  'Roads & Potholes',
  'Garbage & Sanitation',
  'Water Leakage & Supply',
  'Streetlight & Electrical',
  'Drainage & Sewerage',
  'Public Health & Hygiene',
  'Public Safety & Parks'
];

export const InteractiveMapPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [selectedCategory, setSelectedCategory] = useState('All Categories');
  const [selectedPriority, setSelectedPriority] = useState('All');
  const [selectedStatus, setSelectedStatus] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const res = await complaintService.getComplaints({ limit: 100 });
      setComplaints(res.complaints || []);
    } catch (err) {
      console.error('Failed to load map complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  // Filter complaints
  const filteredComplaints = complaints.filter(c => {
    if (selectedCategory !== 'All Categories' && c.category !== selectedCategory) {
      return false;
    }
    if (selectedPriority !== 'All' && c.priority !== selectedPriority) {
      return false;
    }
    if (selectedStatus === 'Active' && (c.status === 'Resolved' || c.status === 'Closed')) {
      return false;
    }
    if (selectedStatus === 'Resolved' && !(c.status === 'Resolved' || c.status === 'Closed')) {
      return false;
    }
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      const match =
        c.title.toLowerCase().includes(q) ||
        c.complaintId.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q);
      if (!match) return false;
    }
    return true;
  });

  return (
    <div className="space-y-6">
      {/* Top Header & Search */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Interactive Civic Issue Map
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time geospatial distribution of municipal grievances across sectors
          </p>
        </div>

        <Link
          to="/report"
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Report New Problem</span>
        </Link>
      </div>

      {/* Filter Bar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs space-y-3">
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
          {/* Search Input */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search address, ID, keyword..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
            />
          </div>

          {/* Category Filter */}
          <div>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500 bg-white"
            >
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          {/* Priority Filter */}
          <div>
            <select
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500 bg-white"
            >
              <option value="All">All Priorities</option>
              <option value="Critical">Critical Priority</option>
              <option value="High">High Priority</option>
              <option value="Medium">Medium Priority</option>
              <option value="Low">Low Priority</option>
            </select>
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500 bg-white"
            >
              <option value="All">All Statuses</option>
              <option value="Active">Active / Pending Only</option>
              <option value="Resolved">Resolved / Closed Only</option>
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between text-xs text-slate-500 pt-1 border-t border-slate-100">
          <span>
            Showing <strong>{filteredComplaints.length}</strong> markers on the map
          </span>
          <button
            onClick={fetchComplaints}
            className="text-civic-600 hover:text-civic-700 font-semibold flex items-center space-x-1"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh Grid</span>
          </button>
        </div>
      </div>

      {/* Main Grid: Interactive Map (large) + Sidebar List */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Map (3 cols) */}
        <div className="lg:col-span-3">
          <CivicMap complaints={filteredComplaints} height="600px" />
        </div>

        {/* Sidebar List (1 col) */}
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs h-[600px] flex flex-col">
          <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500 mb-3">
            Visible Complaints ({filteredComplaints.length})
          </h3>

          <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
            {filteredComplaints.map(c => {
              const pBadge = getPriorityBadge(c.priority);
              const sBadge = getStatusBadge(c.status);

              return (
                <Link
                  key={c._id}
                  to={`/complaint/${c._id}`}
                  className="block p-3 rounded-xl border border-slate-100 hover:border-civic-300 hover:bg-slate-50/60 transition group space-y-1.5"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded">
                      {c.complaintId}
                    </span>
                    <span className={`text-[10px] font-bold px-1.5 py-0.2 rounded-full border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                      {c.priority}
                    </span>
                  </div>

                  <h4 className="text-xs font-bold text-slate-900 group-hover:text-civic-600 transition line-clamp-1">
                    {c.title}
                  </h4>

                  <p className="text-[11px] text-slate-500 line-clamp-1">
                    📍 {c.address}
                  </p>

                  <div className="flex items-center justify-between text-[10px] pt-1 border-t border-slate-100/60">
                    <span className="text-slate-400">{formatRelativeTime(c.createdAt)}</span>
                    <span className={`font-semibold ${sBadge.text}`}>{sBadge.label}</span>
                  </div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};
