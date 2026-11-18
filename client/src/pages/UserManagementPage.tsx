import React, { useState, useEffect } from 'react';
import { adminService } from '../services/adminService';
import { User, UserRole } from '../types';
import { formatDate } from '../utils/formatters';
import { Users, Search, UserCheck, ShieldAlert, Check, X, Shield, RefreshCw } from 'lucide-react';

export const UserManagementPage: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('all');

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await adminService.getUsers();
      setUsers(res.users || []);
    } catch (err) {
      console.error('Failed to load users:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: UserRole) => {
    try {
      await adminService.updateUserRole(userId, { role: newRole });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update user role');
    }
  };

  const handleStatusToggle = async (userId: string, currentStatus: boolean) => {
    try {
      await adminService.updateUserRole(userId, { isActive: !currentStatus });
      fetchUsers();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to toggle account status');
    }
  };

  const filtered = users.filter(u => {
    if (roleFilter !== 'all' && u.role !== roleFilter) return false;
    if (search.trim()) {
      const q = search.toLowerCase();
      return u.name.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    }
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            User & Officer Management
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Role-based access control, departmental assignments, and authentication status
          </p>
        </div>

        <button
          onClick={fetchUsers}
          className="p-2.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 transition self-start"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="flex items-center space-x-2">
          {['all', 'citizen', 'officer', 'admin'].map(r => (
            <button
              key={r}
              onClick={() => setRoleFilter(r)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase transition ${
                roleFilter === r
                  ? 'bg-slate-900 text-white shadow-2xs'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              {r}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3 pointer-events-none" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search user name or email..."
            className="w-full pl-9 pr-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
          />
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-500 font-bold uppercase tracking-wider border-b border-slate-200">
              <tr>
                <th className="py-3.5 px-4">User</th>
                <th className="py-3.5 px-4">Contact</th>
                <th className="py-3.5 px-4">Current Role</th>
                <th className="py-3.5 px-4">Department / Designation</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filtered.map(u => (
                <tr key={u.id} className="hover:bg-slate-50/60 transition">
                  <td className="py-3.5 px-4">
                    <div className="flex items-center space-x-3">
                      <div className="w-8 h-8 rounded-full bg-slate-100 font-bold flex items-center justify-center text-slate-700">
                        {u.name.charAt(0)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900">{u.name}</p>
                        <p className="text-[11px] text-slate-400">{u.email}</p>
                      </div>
                    </div>
                  </td>

                  <td className="py-3.5 px-4 text-slate-600">
                    <p>{u.phone || 'N/A'}</p>
                    <p className="text-[11px] text-slate-400 truncate max-w-[140px]">{u.address || 'N/A'}</p>
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-block text-[11px] font-bold px-2.5 py-0.5 rounded-full capitalize ${
                        u.role === 'admin'
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                          : u.role === 'officer'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : 'bg-blue-50 text-blue-700 border border-blue-200'
                      }`}
                    >
                      {u.role}
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-slate-700">
                    {u.department ? (
                      <span className="font-semibold text-slate-800">{u.department.name}</span>
                    ) : (
                      <span className="text-slate-400">Citizen Profile</span>
                    )}
                    {u.designation && <p className="text-[11px] text-slate-500">{u.designation}</p>}
                  </td>

                  <td className="py-3.5 px-4">
                    <span
                      className={`inline-flex items-center space-x-1 text-[11px] font-bold px-2 py-0.5 rounded ${
                        u.isActive !== false ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'
                      }`}
                    >
                      <span>{u.isActive !== false ? '● Active' : '○ Disabled'}</span>
                    </span>
                  </td>

                  <td className="py-3.5 px-4 text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <select
                        value={u.role}
                        onChange={(e) => handleRoleChange(u.id, e.target.value as UserRole)}
                        className="text-xs py-1 px-2 rounded border border-slate-300 bg-white focus:outline-none"
                      >
                        <option value="citizen">Citizen</option>
                        <option value="officer">Officer</option>
                        <option value="admin">Admin</option>
                      </select>

                      <button
                        onClick={() => handleStatusToggle(u.id, u.isActive !== false)}
                        className={`p-1.5 rounded text-xs font-semibold ${
                          u.isActive !== false ? 'text-red-600 hover:bg-red-50' : 'text-emerald-600 hover:bg-emerald-50'
                        }`}
                        title={u.isActive !== false ? 'Deactivate account' : 'Activate account'}
                      >
                        {u.isActive !== false ? <X className="w-4 h-4" /> : <Check className="w-4 h-4" />}
                      </button>
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
