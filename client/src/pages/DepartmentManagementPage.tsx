import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { Department } from '../types';
import { Building2, PlusCircle, Check, RefreshCw, Clock, Layers } from 'lucide-react';

export const DepartmentManagementPage: React.FC = () => {
  const [departments, setDepartments] = useState<Department[]>([]);
  const [loading, setLoading] = useState(true);

  // New dept modal state
  const [modalOpen, setModalOpen] = useState(false);
  const [name, setName] = useState('');
  const [code, setCode] = useState('');
  const [description, setDescription] = useState('');
  const [headOfficerName, setHeadOfficerName] = useState('');
  const [contactEmail, setContactEmail] = useState('');
  const [categoriesInput, setCategoriesInput] = useState('Roads & Potholes, Other Infrastructure');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchDepartments = async () => {
    try {
      setLoading(true);
      const res = await adminService.getDepartments();
      setDepartments(res.departments || []);
    } catch (err) {
      console.error('Failed to load departments:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleCreateDepartment = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setIsSubmitting(true);
      const catArray = categoriesInput.split(',').map(c => c.trim()).filter(Boolean);
      await adminService.createDepartment({
        name,
        code: code.toUpperCase(),
        description,
        headOfficerName,
        contactEmail,
        categoryMappings: catArray,
        slaHours: { critical: 6, high: 24, medium: 72, low: 168 }
      });
      setModalOpen(false);
      setName('');
      setCode('');
      setDescription('');
      fetchDepartments();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to create department');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Municipal Department Configuration
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Configure dynamic department routing rules, SLA resolution thresholds, and purview categories
          </p>
        </div>

        <button
          onClick={() => setModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-civic-600 hover:bg-civic-700 text-white rounded-xl text-xs font-bold shadow-sm transition"
        >
          <PlusCircle className="w-4 h-4" />
          <span>Add New Department</span>
        </button>
      </div>

      {/* Department Cards Grid */}
      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
          Loading departments...
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {departments.map(d => (
            <div
              key={d._id}
              className="bg-white rounded-2xl p-6 border border-slate-200 shadow-xs hover:border-civic-300 transition flex flex-col justify-between space-y-4"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="font-mono text-xs font-black bg-civic-50 text-civic-700 px-2 py-0.5 rounded border border-civic-200">
                    {d.code}
                  </span>
                  <span className="text-[11px] font-bold text-emerald-600">● Active Purview</span>
                </div>

                <h3 className="text-base font-bold text-slate-900 leading-snug">{d.name}</h3>

                <p className="text-xs text-slate-600 line-clamp-3 leading-relaxed">
                  {d.description}
                </p>

                <div className="pt-2 border-t border-slate-100">
                  <span className="text-[10px] font-bold uppercase text-slate-400 block mb-1">
                    Purview Categories:
                  </span>
                  <div className="flex flex-wrap gap-1">
                    {d.categoryMappings?.map(cat => (
                      <span key={cat} className="text-[10px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded">
                        {cat}
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* SLA Metrics */}
              <div className="pt-3 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-4 rounded-b-2xl flex items-center justify-between text-[11px]">
                <div className="flex items-center space-x-1 text-slate-500">
                  <Clock className="w-3.5 h-3.5" />
                  <span>SLA (Critical / High):</span>
                </div>
                <span className="font-bold text-slate-800">
                  {d.slaHours?.critical || 6}h / {d.slaHours?.high || 24}h
                </span>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add Department Modal */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 space-y-4 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-bold text-slate-900">Add Municipal Department</h3>
              <button onClick={() => setModalOpen(false)} className="text-slate-400 font-bold p-1">
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateDepartment} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Department Name *</label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Parks & Urban Greenery Wing"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official Code (Acronym) *</label>
                <input
                  type="text"
                  required
                  value={code}
                  onChange={(e) => setCode(e.target.value)}
                  placeholder="e.g. PUG"
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500 uppercase"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Operational Description *</label>
                <textarea
                  required
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Purview of horticulture, public parks, fallen trees, and botanical maintenance..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Mapped Categories (comma separated)</label>
                <input
                  type="text"
                  value={categoriesInput}
                  onChange={(e) => setCategoriesInput(e.target.value)}
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
                />
              </div>

              <div className="flex items-center justify-end space-x-2 pt-2 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2 bg-civic-600 hover:bg-civic-700 text-white rounded-lg text-xs font-bold disabled:opacity-50"
                >
                  {isSubmitting ? 'Creating...' : 'Create Department'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
