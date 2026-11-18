import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { officerService } from '../services/officerService';
import { Complaint } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import { CivicMap } from '../components/map/CivicMap';
import {
  CheckCircle2,
  Clock,
  AlertTriangle,
  Upload,
  ArrowRight,
  ShieldCheck,
  Building2,
  Camera,
  RefreshCw,
  XCircle,
  FileCheck,
  Check
} from 'lucide-react';

export const OfficerDashboard: React.FC = () => {
  const { user } = useAuth();
  const [assignments, setAssignments] = useState<Complaint[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Evidence modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [evidenceDescription, setEvidenceDescription] = useState('');
  const [evidenceFiles, setEvidenceFiles] = useState<File[]>([]);
  const [isSubmittingEvidence, setIsSubmittingEvidence] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchOfficerData = async () => {
    try {
      setLoading(true);
      const [assignRes, statsRes] = await Promise.all([
        officerService.getAssignments(),
        officerService.getStats()
      ]);
      setAssignments(assignRes.assignments || []);
      setStats(statsRes.stats || null);
    } catch (err) {
      console.error('Failed to load officer dashboard:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOfficerData();
  }, []);

  const handleStatusChange = async (id: string, newStatus: string) => {
    try {
      await officerService.updateStatus(id, {
        status: newStatus,
        comment: `Officer ${user?.name} commenced field operations.`
      });
      fetchOfficerData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
  };

  const handleOpenEvidenceModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setEvidenceDescription('');
    setEvidenceFiles([]);
    setModalOpen(true);
  };

  const handleEvidenceSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setIsSubmittingEvidence(true);
      const formData = new FormData();
      formData.append('description', evidenceDescription);
      evidenceFiles.forEach(file => {
        formData.append('evidence', file);
      });

      await officerService.submitEvidence(selectedComplaint._id, formData);
      setModalOpen(false);
      fetchOfficerData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit resolution evidence');
    } finally {
      setIsSubmittingEvidence(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Officer Header */}
      <div className="bg-gradient-to-r from-amber-700 via-amber-800 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-amber-600/60 text-amber-200 text-xs font-semibold">
            <Building2 className="w-3.5 h-3.5 text-amber-300" />
            <span>Field Operations Command • Municipal Corporation</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            Officer Portal – {user?.name}
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            {user?.designation || 'Field Engineer'} • Division Purview: Arterial Infrastructure & Public Works
          </p>
        </div>

        <button
          onClick={fetchOfficerData}
          className="inline-flex items-center space-x-2 px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-bold text-white border border-white/20 transition shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Refresh Queue</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-700 flex items-center justify-center font-bold">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Assigned Tasks</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.assigned || assignments.length}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-red-50 text-red-600 flex items-center justify-center font-bold">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Critical Hazards</p>
            <p className="text-2xl font-black text-red-600 mt-0.5">{stats?.critical || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center font-bold">
            <FileCheck className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Field Work In Progress</p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">{stats?.inProgress || 0}</p>
          </div>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold uppercase text-slate-400">Resolution Rate</p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">{stats?.resolutionRate || 85}%</p>
          </div>
        </div>
      </div>

      {/* Main Grid: Assigned Tasks Table + Field Map */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Assigned Complaints Table (2 cols) */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-bold text-slate-900">Assigned Tasks Queue</h2>
              <p className="text-xs text-slate-500">Prioritized field work awaiting your inspection & repair</p>
            </div>
            <span className="text-xs font-bold bg-amber-50 text-amber-800 px-2.5 py-1 rounded-full border border-amber-200">
              {assignments.length} Tasks
            </span>
          </div>

          {loading ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
              Loading assignments...
            </div>
          ) : assignments.length === 0 ? (
            <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
              <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-slate-800">All assigned field tasks completed!</p>
              <p className="text-xs text-slate-400">New civic complaints will dispatch here automatically.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {assignments.map(c => {
                const pBadge = getPriorityBadge(c.priority);
                const sBadge = getStatusBadge(c.status);

                return (
                  <div
                    key={c._id}
                    className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs hover:border-amber-400 transition space-y-3"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-mono font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded">
                            {c.complaintId}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                            {c.priority}
                          </span>
                          <span className={`text-[10px] font-bold px-2 py-0.5 rounded border ${sBadge.bg} ${sBadge.text}`}>
                            {sBadge.label}
                          </span>
                        </div>

                        <Link
                          to={`/complaint/${c._id}`}
                          className="text-base font-bold text-slate-900 hover:text-amber-700 transition block"
                        >
                          {c.title}
                        </Link>

                        <p className="text-xs text-slate-500">
                          📍 {c.address} {c.landmark ? `• Landmark: ${c.landmark}` : ''}
                        </p>
                      </div>

                      <div className="text-right shrink-0 text-xs text-slate-400">
                        {formatRelativeTime(c.createdAt)}
                      </div>
                    </div>

                    <p className="text-xs text-slate-600 line-clamp-2 bg-slate-50 p-2.5 rounded-lg border border-slate-100">
                      {c.description}
                    </p>

                    {/* Officer Actions Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                      <Link
                        to={`/complaint/${c._id}`}
                        className="text-xs font-bold text-civic-600 hover:text-civic-700 flex items-center space-x-1"
                      >
                        <span>View Details</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>

                      <div className="flex items-center space-x-2">
                        {c.status !== 'In Progress' && c.status !== 'Resolved' && c.status !== 'Closed' && (
                          <button
                            type="button"
                            onClick={() => handleStatusChange(c._id, 'In Progress')}
                            className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Clock className="w-3.5 h-3.5" />
                            <span>Start Field Work</span>
                          </button>
                        )}

                        {c.status !== 'Resolved' && c.status !== 'Closed' && (
                          <button
                            type="button"
                            onClick={() => handleOpenEvidenceModal(c)}
                            className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1"
                          >
                            <Upload className="w-3.5 h-3.5" />
                            <span>Upload Resolution Evidence</span>
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* Assigned Sector Map Preview (1 col) */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-slate-900">Field Sector Map</h2>
            <Link to="/map" className="text-xs font-bold text-civic-600 hover:text-civic-700">
              Interactive View →
            </Link>
          </div>
          <CivicMap complaints={assignments} height="480px" />
        </div>
      </div>

      {/* Resolution Evidence Upload Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Upload Resolution Evidence</h3>
                <p className="text-xs text-slate-500 font-mono">{selectedComplaint.complaintId}</p>
              </div>
              <button
                onClick={() => setModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 font-bold p-1"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleEvidenceSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Resolution Work Summary <span className="text-red-500">*</span>
                </label>
                <textarea
                  required
                  rows={3}
                  value={evidenceDescription}
                  onChange={(e) => setEvidenceDescription(e.target.value)}
                  placeholder="e.g. Dispatched asphalt hot-mix crew. Excavated perimeter, compacted ballast, and laid fresh bitumen overlay meeting municipal standards..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  After-Repair Photographic Proof <span className="text-red-500">*</span>
                </label>
                <input
                  type="file"
                  required
                  accept="image/jpeg,image/png,image/webp"
                  multiple
                  onChange={(e) => {
                    if (e.target.files) {
                      setEvidenceFiles(Array.from(e.target.files));
                    }
                  }}
                  className="w-full text-xs text-slate-500 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-emerald-50 file:text-emerald-700 hover:file:bg-emerald-100 cursor-pointer"
                />
                <p className="text-[11px] text-slate-400 mt-1">
                  Attach photo of cleared site or completed repair for citizen audit.
                </p>
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold hover:bg-slate-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmittingEvidence}
                  className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSubmittingEvidence ? 'Uploading...' : 'Confirm Resolution'}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
