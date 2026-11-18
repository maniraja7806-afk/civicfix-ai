import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { adminService } from '../services/adminService';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line
} from 'recharts';
import {
  ShieldAlert,
  Building2,
  Users,
  FileText,
  Download,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowUpRight,
  TrendingUp,
  RefreshCw,
  Sliders,
  ChevronRight
} from 'lucide-react';

const COLORS = ['#0284c7', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#64748b'];

export const AdminCommandCenter: React.FC = () => {
  const { user } = useAuth();
  const [overview, setOverview] = useState<any>(null);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [overRes, analRes] = await Promise.all([
        adminService.getOverview(),
        adminService.getAnalytics()
      ]);
      setOverview(overRes.stats || null);
      setAnalytics(analRes || null);
    } catch (err) {
      console.error('Failed to load admin analytics:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleExportCSV = async () => {
    try {
      await adminService.exportCSV();
    } catch (err) {
      alert('Failed to export CSV report');
    }
  };

  return (
    <div className="space-y-8">
      {/* Admin Top Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-2xl p-6 sm:p-8 text-white shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6 border border-slate-800">
        <div className="space-y-2">
          <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-indigo-900/60 text-indigo-300 text-xs font-semibold border border-indigo-700/50">
            <ShieldAlert className="w-3.5 h-3.5 text-indigo-400" />
            <span>City Municipal Command Center • Municipal Commissioner Oversight</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Centralized Municipal Operations
          </h1>
          <p className="text-xs sm:text-sm text-slate-300">
            Real-time multi-department monitoring, resolution SLA tracking, and audit intelligence.
          </p>
        </div>

        <div className="flex items-center space-x-3 shrink-0">
          <button
            onClick={fetchData}
            className="p-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition"
            title="Refresh Data"
          >
            <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          </button>
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center space-x-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-bold shadow-md transition"
          >
            <Download className="w-4 h-4" />
            <span>Export Official CSV Report</span>
          </button>
        </div>
      </div>

      {/* KPI Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Total Registered</p>
          <p className="text-2xl font-black text-slate-900 mt-1">{overview?.totalComplaints || 0}</p>
          <span className="text-[10px] text-slate-500">All city sectors</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Resolved</p>
          <p className="text-2xl font-black text-emerald-600 mt-1">{overview?.resolvedComplaints || 0}</p>
          <span className="text-[10px] text-emerald-600 font-semibold">{overview?.resolutionPercentage || 0}% Success</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">In Progress</p>
          <p className="text-2xl font-black text-amber-600 mt-1">{overview?.inProgressComplaints || 0}</p>
          <span className="text-[10px] text-slate-500">Active work crews</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Critical Hazards</p>
          <p className="text-2xl font-black text-red-600 mt-1">{overview?.criticalComplaints || 0}</p>
          <span className="text-[10px] text-red-500 font-semibold">Immediate priority</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Avg Resolution</p>
          <p className="text-2xl font-black text-civic-700 mt-1">{overview?.avgResolutionHours || 24}h</p>
          <span className="text-[10px] text-slate-500">Citywide SLA</span>
        </div>

        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs">
          <p className="text-[11px] font-bold uppercase text-slate-400">Field Officers</p>
          <p className="text-2xl font-black text-indigo-600 mt-1">{overview?.totalOfficers || 3}</p>
          <span className="text-[10px] text-slate-500">{overview?.totalDepartments || 5} Departments</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Monthly Trend Chart */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Monthly Complaints & Resolution Trends</h3>
              <p className="text-xs text-slate-500">Reports submitted vs field repairs completed</p>
            </div>
            <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">6 Months</span>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={analytics?.trendData || []}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                <YAxis stroke="#94a3b8" fontSize={11} />
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
                <Line type="monotone" dataKey="reported" stroke="#0284c7" strokeWidth={2.5} name="Complaints Reported" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Issues Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Category Breakdown Donut */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Complaints by Civic Category</h3>
              <p className="text-xs text-slate-500">Distribution across municipal service wings</p>
            </div>
          </div>

          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={analytics?.categoryData || []}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={90}
                  paddingAngle={3}
                  dataKey="count"
                >
                  {(analytics?.categoryData || []).map((_: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend wrapperStyle={{ fontSize: '11px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Department Workload & SLA Compliance Scorecard */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Department Workload & SLA Performance</h3>
            <p className="text-xs text-slate-500">Live operational compliance across all municipal departments</p>
          </div>
          <Link
            to="/admin/departments"
            className="text-xs font-bold text-civic-600 hover:text-civic-700 flex items-center space-x-1"
          >
            <span>Manage Departments</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Assigned Tasks</th>
                <th className="py-3 px-4">Resolved</th>
                <th className="py-3 px-4">Pending</th>
                <th className="py-3 px-4">SLA Compliance Rate</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(analytics?.departmentPerformance || []).map((dept: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{dept.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{dept.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{dept.total}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{dept.resolved}</td>
                  <td className="py-3.5 px-4 font-semibold text-amber-600">{dept.pending}</td>
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-2">
                      <div className="w-24 h-2 bg-slate-100 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-emerald-500 rounded-full"
                          style={{ width: `${dept.rate}%` }}
                        />
                      </div>
                      <span className="font-bold text-slate-800">{dept.rate}%</span>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
