import React, { useState } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  MapPin,
  Bell,
  Users,
  Building2,
  BarChart3,
  LogOut,
  ShieldAlert,
  Menu,
  X,
  CheckCircle2,
  Clock,
  ArrowRight
} from 'lucide-react';

export const DashboardLayout: React.FC = () => {
  const { user, logout, demoLogin } = useAuth();
  const { isConnected } = useSocket();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const citizenNav = [
    { name: 'Dashboard Overview', path: '/dashboard/citizen', icon: LayoutDashboard },
    { name: 'Report New Issue', path: '/report', icon: PlusCircle },
    { name: 'My Complaints', path: '/my-complaints', icon: FileText },
    { name: 'Interactive Map', path: '/map', icon: MapPin },
    { name: 'Notifications', path: '/notifications', icon: Bell }
  ];

  const officerNav = [
    { name: 'Officer Dashboard', path: '/dashboard/officer', icon: LayoutDashboard },
    { name: 'Assigned Complaints', path: '/officer/assignments', icon: FileText },
    { name: 'Field Issue Map', path: '/map', icon: MapPin },
    { name: 'Notifications', path: '/notifications', icon: Bell }
  ];

  const adminNav = [
    { name: 'Admin Command Center', path: '/dashboard/admin', icon: LayoutDashboard },
    { name: 'All Complaints Monitor', path: '/admin/complaints', icon: FileText },
    { name: 'Departments', path: '/admin/departments', icon: Building2 },
    { name: 'User Management', path: '/admin/users', icon: Users },
    { name: 'Analytics & Reports', path: '/admin/analytics', icon: BarChart3 },
    { name: 'Interactive Map', path: '/map', icon: MapPin }
  ];

  const currentNav =
    user?.role === 'admin' ? adminNav : user?.role === 'officer' ? officerNav : citizenNav;

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Mobile sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-900/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-slate-300 flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 lg:static lg:inset-auto ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Brand */}
        <div className="h-16 px-6 flex items-center justify-between border-b border-slate-800">
          <Link to="/" className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-civic-600 flex items-center justify-center text-white font-bold">
              <ShieldAlert className="w-5 h-5 text-white" />
            </div>
            <span className="font-extrabold text-lg text-white tracking-tight">CivicFix AI</span>
          </Link>
          <button
            onClick={() => setSidebarOpen(false)}
            className="lg:hidden text-slate-400 hover:text-white"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* User Card */}
        <div className="p-4 border-b border-slate-800 bg-slate-950/40">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-full bg-civic-900 border border-civic-700 flex items-center justify-center font-bold text-civic-300">
              {user?.name?.charAt(0) || 'U'}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-semibold text-white truncate">{user?.name || 'Authorized User'}</p>
              <div className="flex items-center space-x-1.5 mt-0.5">
                <span className="capitalize text-xs font-semibold px-2 py-0.5 rounded-full bg-civic-950 text-civic-400 border border-civic-800">
                  {user?.role || 'Citizen'}
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              </div>
            </div>
          </div>

          {/* Quick Role Switcher for Hackathon Demonstrations */}
          <div className="mt-3 pt-3 border-t border-slate-800/80">
            <p className="text-[10px] uppercase font-bold text-slate-400 mb-1 tracking-wider">Demo Role Switch:</p>
            <div className="grid grid-cols-3 gap-1">
              <button
                onClick={() => demoLogin('citizen').then(() => navigate('/dashboard/citizen'))}
                className={`text-[11px] py-1 px-1.5 rounded text-center transition font-medium ${
                  user?.role === 'citizen' ? 'bg-civic-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Citizen
              </button>
              <button
                onClick={() => demoLogin('officer').then(() => navigate('/dashboard/officer'))}
                className={`text-[11px] py-1 px-1.5 rounded text-center transition font-medium ${
                  user?.role === 'officer' ? 'bg-amber-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Officer
              </button>
              <button
                onClick={() => demoLogin('admin').then(() => navigate('/dashboard/admin'))}
                className={`text-[11px] py-1 px-1.5 rounded text-center transition font-medium ${
                  user?.role === 'admin' ? 'bg-indigo-600 text-white font-bold' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Admin
              </button>
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {currentNav.map(item => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition ${
                  isActive
                    ? 'bg-civic-700 text-white shadow-sm'
                    : 'text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                <span>{item.name}</span>
              </Link>
            );
          })}
        </nav>

        {/* Footer info & Logout */}
        <div className="p-4 border-t border-slate-800 bg-slate-950/40">
          <div className="text-[11px] text-slate-400 mb-3 flex items-center justify-between">
            <span>Socket Engine:</span>
            <span className={isConnected ? 'text-emerald-400 font-semibold' : 'text-amber-400 font-semibold'}>
              {isConnected ? '● Connected' : '○ Standby'}
            </span>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 py-2 px-3 rounded-lg bg-slate-800 hover:bg-red-950/40 hover:text-red-400 text-slate-300 text-xs font-semibold transition"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header bar */}
        <header className="h-16 bg-white border-b border-slate-200 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setSidebarOpen(true)}
              className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="hidden sm:block">
              <span className="text-xs text-slate-400 font-medium">CivicFix AI Command Portal</span>
              <p className="text-sm font-bold text-slate-800">
                {user?.role === 'admin'
                  ? 'Municipal Administration & Analytics'
                  : user?.role === 'officer'
                  ? 'Field Operations & Resolution Dispatch'
                  : 'Citizen Issue Redressal'}
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <Link
              to="/report"
              className="hidden sm:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-civic-600 text-white hover:bg-civic-700 shadow-sm transition"
            >
              <PlusCircle className="w-3.5 h-3.5" />
              <span>Report Issue</span>
            </Link>

            <Link
              to="/notifications"
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 relative"
              title="Notifications"
            >
              <Bell className="w-5 h-5" />
            </Link>

            <Link
              to="/"
              className="text-xs text-slate-500 hover:text-slate-800 font-medium px-2 py-1 rounded border border-slate-200"
            >
              Public View
            </Link>
          </div>
        </header>

        {/* Main nested route content */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
