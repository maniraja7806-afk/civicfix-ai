import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { complaintService } from '../services/complaintService';
import { adminService } from '../services/adminService';
import { Complaint, Department, User, ComplaintPriority } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import {
  FileText,
  Search,
  Filter,
  Building2,
  UserCheck,
  Check,
  ArrowRight,
  ExternalLink,
  RefreshCw,
  Layers
} from 'lucide-react';

export const AllComplaintsAdminPage: React.FC = () => {
  const [complaints, setComplaints] = useState<Complaint[]>([]);
  const [departments, setDepartments] = useState<Department[]>([]);
  const [officers, setOfficers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('All');
  const [deptFilter, setDeptFilter] = useState('All');

  // Reassignment Modal state
  const [selectedComplaint, setSelectedComplaint] = useState<Complaint | null>(null);
  const [reassignDeptId, setReassignDeptId] = useState('');
  const [reassignOfficerId, setReassignOfficerId] = useState('');
  const [overridePriority, setOverridePriority] = useState<ComplaintPriority>('High');
  const [adminNotes, setAdminNotes] = useState('');
  const [isAssigning, setIsAssigning] = useState(false);
  const [modalOpen, setModalOpen] = useState(false);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [compRes, deptRes, usersRes] = await Promise.all([
        complaintService.getComplaints({ limit: 100 }),
        adminService.getDepartments(),
        adminService.getUsers({ role: 'officer' })
      ]);
      setComplaints(compRes.complaints || []);
      setDepartments(deptRes.departments || []);
      setOfficers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin complaints:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleOpenAssignModal = (complaint: Complaint) => {
    setSelectedComplaint(complaint);
    setReassignDeptId(complaint.assignedDepartmentId?._id || complaint.assignedDepartmentId || (departments[0]?._id || ''));
    setReassignOfficerId(complaint.assignedOfficerId?._id || complaint.assignedOfficerId || '');
    setOverridePriority(complaint.priority);
    setAdminNotes('');
    setModalOpen(true);
  };

  const handleAssignSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    try {
      setIsAssigning(true);
      await adminService.assignComplaint({
        complaintId: selectedComplaint._id,
        departmentId: reassignDeptId,
        officerId: reassignOfficerId || undefined,
        priority: overridePriority,
        adminNotes
      });
      setModalOpen(false);
      fetchData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update assignment');
    } finally {
      setIsAssigning(false);
    }
  };

  const filtered = complaints.filter(c => {
    if (statusFilter !== 'All' && c.status !== statusFilter) return false;
    if (deptFilter !== 'All') {
      const cDeptId = c.assignedDepartmentId?._id || c.assignedDepartmentId;
      if (cDeptId !== deptFilter) return false;
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      return (
        c.title.toLowerCase().includes(q) ||
        c.complaintId.toLowerCase().includes(q) ||
        c.address.toLowerCase().includes(q) ||
        c.category.toLowerCase().includes(q)
      );
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Citywide Complaints Monitoring
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Supervise all citizen grievances, reassign municipal departments, and override priorities
          </p>
        </div>

        <button
          onClick={fetchData}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-civic-500"
          >
            <option value="All">All Statuses</option>
            <option value="Submitted">Submitted</option>
            <option value="Assigned">Assigned</option>
            <option value="In Progress">In Progress</option>
            <option value="Resolved">Resolved</option>
            <option value="Closed">Closed</option>
          </select>

          <select
            value={deptFilter}
            onChange={(e) => setDeptFilter(e.target.value)}
            className="px-3 py-2 rounded-lg border border-slate-300 bg-white focus:outline-none focus:ring-2 focus:ring-civic-500"
          >
            <option value="All">All Departments</option>
            {departments.map(d => (
              <option key={d._id} value={d._id}>
                {d.name}
              </option>
            ))}
          </select>
        </div>

        <div className="relative w-full md:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by ID, keyword, road..."
            className="w-full pl-9 pr-3 py-2 rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500 text-xs"
          />
        </div>
      </div>

      {/* Complaints Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">Complaint ID & Title</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Priority</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4">Assigned Department</th>
                <th className="py-3.5 px-4">Reported</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(c => {
                const pBadge = getPriorityBadge(c.priority);
                const sBadge = getStatusBadge(c.status);

                return (
                  <tr key={c._id} className="hover:bg-slate-50/60 transition">
                    <td className="py-3.5 px-4">
                      <div className="space-y-0.5">
                        <span className="font-mono font-bold text-slate-700 bg-slate-100 px-1.5 py-0.5 rounded text-[11px]">
                          {c.complaintId}
                        </span>
                        <Link
                          to={`/complaint/${c._id}`}
                          className="font-bold text-slate-900 hover:text-civic-600 block line-clamp-1"
                        >
                          {c.title}
                        </Link>
                        <p className="text-[11px] text-slate-400 line-clamp-1">📍 {c.address}</p>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 text-slate-700 font-medium">
                      {c.category}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-bold px-2 py-0.5 rounded-full border text-[10px] ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
                        {c.priority}
                      </span>
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-block font-bold px-2 py-0.5 rounded border text-[10px] ${sBadge.bg} ${sBadge.text}`}>
                        {sBadge.label}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-800">
                      <p className="font-semibold">{c.assignedDepartmentId?.name || 'Unassigned'}</p>
                      {c.assignedOfficerId && (
                        <p className="text-[10px] text-slate-400">Officer: {c.assignedOfficerId?.name}</p>
                      )}
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px]">
                      {formatRelativeTime(c.createdAt)}
                    </td>

                    <td className="py-3.5 px-4 text-right space-x-2">
                      <button
                        onClick={() => handleOpenAssignModal(c)}
                        className="px-2.5 py-1 rounded bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold"
                      >
                        Reassign
                      </button>
                      <Link
                        to={`/complaint/${c._id}`}
                        className="px-2.5 py-1 rounded bg-civic-50 hover:bg-civic-100 text-civic-700 text-xs font-semibold"
                      >
                        Details
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Reassign Modal */}
      {modalOpen && selectedComplaint && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl border border-slate-200 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-base font-bold text-slate-900">Reassign Complaint</h3>
                <p className="font-mono text-slate-500">{selectedComplaint.complaintId}</p>
              </div>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold p-1">✕</button>
            </div>

            <form onSubmit={handleAssignSubmit} className="space-y-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Target Department *</label>
                <select
                  required
                  value={reassignDeptId}
                  onChange={(e) => setReassignDeptId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  {departments.map(d => (
                    <option key={d._id} value={d._id}>{d.name} ({d.code})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Assign Officer (Optional)</label>
                <select
                  value={reassignOfficerId}
                  onChange={(e) => setReassignOfficerId(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg border border-slate-300 bg-white"
                >
                  <option value="">Auto-balance department pool</option>
                  {officers.map(o => (
                    <option key={o.id} value={o.id}>{o.name} ({o.designation || 'Engineer'})</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Override Priority Level</label>
                <div className="grid grid-cols-4 gap-1.5">
                  {(['Low', 'Medium', 'High', 'Critical'] as ComplaintPriority[]).map(p => (
                    <button
                      key={p}
                      type="button"
                      onClick={() => setOverridePriority(p)}
                      className={`py-1.5 rounded font-bold border transition ${
                        overridePriority === p ? 'bg-slate-900 text-white border-slate-900' : 'bg-slate-50 text-slate-700 border-slate-200'
                      }`}
                    >
                      {p}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Administrative Notes</label>
                <textarea
                  rows={2}
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                  placeholder="e.g. Urgent review requested by Ward Councilor. Dispatched immediate crew..."
                  className="w-full px-3 py-2 rounded-lg border border-slate-300"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isAssigning}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg font-bold disabled:opacity-50"
                >
                  {isAssigning ? 'Updating...' : 'Update Assignment'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
