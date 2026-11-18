import React, { useState, useEffect } from 'react';
import { publicService } from '../services/publicService';
import { CivicMap } from '../components/map/CivicMap';
import {
  BarChart3,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Building2,
  FileText,
  MapPin,
  RefreshCw,
  ExternalLink
} from 'lucide-react';

export const PublicTransparencyPage: React.FC = () => {
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  const fetchTransparencyData = async () => {
    try {
      setLoading(true);
      const res = await publicService.getTransparencyData();
      setData(res);
    } catch (err) {
      console.error('Failed to load public transparency data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransparencyData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-10">
      {/* Title Banner */}
      <div className="text-center max-w-3xl mx-auto space-y-3">
        <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold border border-emerald-200">
          <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
          <span>Open Municipal Accountability Portal</span>
        </div>
        <h1 className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
          Public Civic Transparency & Redressal Metrics
        </h1>
        <p className="text-sm text-slate-600 leading-relaxed">
          In compliance with open governance standards, CivicFix AI publishes real-time aggregated metrics on public complaints, resolution turnaround, and department performance without compromising citizen privacy.
        </p>
      </div>

      {/* Aggregate KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-slate-900">{data?.metrics?.totalReported || 0}</p>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Total Reports Filed</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-emerald-600">{data?.metrics?.totalResolved || 0}</p>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Successfully Resolved</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-civic-600">{data?.metrics?.resolutionPercentage || 0}%</p>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Resolution SLA Rate</p>
        </div>

        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs text-center space-y-1">
          <p className="text-3xl sm:text-4xl font-black text-indigo-600">{data?.metrics?.avgResolutionHours || 28}h</p>
          <p className="text-xs font-bold uppercase text-slate-500 tracking-wider">Average Turnaround</p>
        </div>
      </div>

      {/* Public Sanitized Civic Map */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div>
            <h3 className="text-lg font-bold text-slate-900">Sanitized Public Issue Map</h3>
            <p className="text-xs text-slate-500">
              Visualizes civic issues without revealing citizen names, phone numbers, or private identities
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 rounded bg-slate-100 text-slate-700 self-start sm:self-auto">
            {data?.publicMapComplaints?.length || 0} Open & Resolved Sites
          </span>
        </div>

        <CivicMap complaints={data?.publicMapComplaints || []} height="480px" />
      </div>

      {/* Department Scorecard Table */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <div>
          <h3 className="text-lg font-bold text-slate-900">Municipal Department Scorecard</h3>
          <p className="text-xs text-slate-500">Comparative workload and resolution compliance</p>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-y border-slate-200">
              <tr>
                <th className="py-3 px-4">Department</th>
                <th className="py-3 px-4">Code</th>
                <th className="py-3 px-4">Total Tasks Handled</th>
                <th className="py-3 px-4">Completed Repairs</th>
                <th className="py-3 px-4">SLA Compliance</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(data?.departmentScorecard || []).map((dept: any, idx: number) => (
                <tr key={idx} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4 font-bold text-slate-900">{dept.name}</td>
                  <td className="py-3.5 px-4 font-mono text-slate-500">{dept.code}</td>
                  <td className="py-3.5 px-4 font-semibold text-slate-700">{dept.total}</td>
                  <td className="py-3.5 px-4 font-semibold text-emerald-600">{dept.resolved}</td>
                  <td className="py-3.5 px-4">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2.5 py-1 rounded">
                      {dept.rate}%
                    </span>
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
