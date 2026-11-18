import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useSocket } from '../../context/SocketContext';
import {
  ShieldAlert,
  MapPin,
  BarChart3,
  PlusCircle,
  Bell,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  Radio,
  CheckCircle2,
  Building2,
  FileText
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const { isConnected, liveNotification, clearLiveNotification } = useSocket();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
    setUserDropdownOpen(false);
    navigate('/');
  };

  const getDashboardLink = () => {
    if (!user) return '/login';
    if (user.role === 'admin') return '/dashboard/admin';
    if (user.role === 'officer') return '/dashboard/officer';
    return '/dashboard/citizen';
  };

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
      {/* Live notification banner */}
      {liveNotification && (
        <div className="bg-civic-700 text-white px-4 py-2 text-xs md:text-sm font-medium flex items-center justify-between shadow-sm animate-pulse">
          <div className="flex items-center space-x-2">
            <Radio className="w-4 h-4 text-emerald-400 animate-spin" />
            <span>
              <strong>{liveNotification.title}:</strong> {liveNotification.message}
            </span>
          </div>
          <button
            onClick={clearLiveNotification}
            className="text-white hover:text-slate-200 ml-4 font-bold p-1"
          >
            ✕
          </button>
        </div>
      )}

      {/* Top Demo Quick Bar */}
      <div className="bg-slate-900 text-slate-300 text-xs px-4 py-1.5 flex items-center justify-between border-b border-slate-800">
        <div className="flex items-center space-x-3">
          <span className="flex items-center text-emerald-400 font-semibold">
            <span className={`w-2 h-2 rounded-full mr-1.5 ${isConnected ? 'bg-emerald-400' : 'bg-amber-400'}`} />
            {isConnected ? 'Real-Time Sync Active' : 'Connecting to Municipal Grid...'}
          </span>
          <span className="hidden md:inline text-slate-400">|</span>
          <span className="hidden md:inline text-slate-300">
            GovTech Platform • Smart India Hackathon 2026
          </span>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-slate-400 hidden sm:inline">1-Click Demo Login:</span>
          <button
            onClick={() => demoLogin('citizen').then(() => navigate('/dashboard/citizen'))}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium transition"
          >
            Citizen
          </button>
          <button
            onClick={() => demoLogin('officer').then(() => navigate('/dashboard/officer'))}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-amber-300 font-medium transition"
          >
            Officer
          </button>
          <button
            onClick={() => demoLogin('admin').then(() => navigate('/dashboard/admin'))}
            className="px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-cyan-300 font-medium transition"
          >
            Admin
          </button>
        </div>
      </div>

      {/* Main Navigation */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Brand Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-civic-700 to-civic-500 flex items-center justify-center text-white shadow-md shadow-civic-500/20 group-hover:scale-105 transition-transform">
              <ShieldAlert className="w-6 h-6 text-white" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">CivicFix</span>
                <span className="bg-civic-100 text-civic-700 text-[10px] font-bold px-1.5 py-0.5 rounded uppercase tracking-wider">AI</span>
              </div>
              <p className="text-[10px] text-slate-500 -mt-1 font-medium hidden sm:block">Smart Civic Platform</p>
            </div>
          </Link>

          {/* Desktop Links */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link
              to="/"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                location.pathname === '/' ? 'text-civic-700 bg-civic-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              Home
            </Link>
            <Link
              to="/map"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                location.pathname === '/map' ? 'text-civic-700 bg-civic-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <MapPin className="w-4 h-4 text-civic-600" />
              <span>Civic Map</span>
            </Link>
            <Link
              to="/transparency"
              className={`px-3 py-2 rounded-lg text-sm font-medium transition flex items-center space-x-1.5 ${
                location.pathname === '/transparency' ? 'text-civic-700 bg-civic-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <BarChart3 className="w-4 h-4 text-emerald-600" />
              <span>Transparency</span>
            </Link>

            {isAuthenticated && (
              <Link
                to={getDashboardLink()}
                className={`px-3 py-2 rounded-lg text-sm font-medium transition ${
                  location.pathname.startsWith('/dashboard') ? 'text-civic-700 bg-civic-50' : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                }`}
              >
                Dashboard
              </Link>
            )}
          </nav>

          {/* Action CTAs */}
          <div className="hidden md:flex items-center space-x-3">
            <Link
              to="/report"
              className="inline-flex items-center space-x-1.5 px-4 py-2 rounded-lg text-sm font-semibold bg-civic-600 text-white hover:bg-civic-700 shadow-sm transition transform hover:-translate-y-0.5"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Report Issue</span>
            </Link>

            {isAuthenticated ? (
              <div className="relative">
                <button
                  onClick={() => setUserDropdownOpen(!userDropdownOpen)}
                  className="flex items-center space-x-2 p-1.5 rounded-lg border border-slate-200 hover:bg-slate-50 transition"
                >
                  <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-700 text-sm">
                    {user?.name?.charAt(0) || 'U'}
                  </div>
                  <div className="text-left text-xs pr-1">
                    <p className="font-semibold text-slate-800 leading-tight truncate max-w-[100px]">{user?.name}</p>
                    <span className="capitalize text-civic-600 font-medium">{user?.role}</span>
                  </div>
                </button>

                {userDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-52 bg-white rounded-xl shadow-xl border border-slate-100 py-1.5 z-50">
                    <div className="px-4 py-2 border-b border-slate-100">
                      <p className="text-xs font-semibold text-slate-900">{user?.name}</p>
                      <p className="text-xs text-slate-500 truncate">{user?.email}</p>
                    </div>
                    <Link
                      to={getDashboardLink()}
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <UserIcon className="w-3.5 h-3.5 text-slate-500" />
                      <span>My Dashboard</span>
                    </Link>
                    <Link
                      to="/notifications"
                      onClick={() => setUserDropdownOpen(false)}
                      className="flex items-center space-x-2 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50"
                    >
                      <Bell className="w-3.5 h-3.5 text-slate-500" />
                      <span>Notifications</span>
                    </Link>
                    <button
                      onClick={handleLogout}
                      className="w-full text-left flex items-center space-x-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
                    >
                      <LogOut className="w-3.5 h-3.5 text-red-500" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-3.5 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 transition"
                >
                  Sign In
                </Link>
                <Link
                  to="/register"
                  className="px-3.5 py-2 text-sm font-semibold text-civic-700 bg-civic-50 hover:bg-civic-100 rounded-lg transition"
                >
                  Register
                </Link>
              </div>
            )}
          </div>

          {/* Mobile hamburger button */}
          <div className="md:hidden flex items-center space-x-2">
            <Link
              to="/report"
              className="p-2 rounded-lg bg-civic-600 text-white text-xs font-medium"
            >
              Report
            </Link>
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-2">
          <Link
            to="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Home
          </Link>
          <Link
            to="/map"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Civic Issue Map
          </Link>
          <Link
            to="/transparency"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-md text-base font-medium text-slate-800 hover:bg-slate-50"
          >
            Public Transparency
          </Link>
          {isAuthenticated ? (
            <>
              <Link
                to={getDashboardLink()}
                onClick={() => setMobileMenuOpen(false)}
                className="block px-3 py-2 rounded-md text-base font-medium text-civic-700 bg-civic-50"
              >
                Dashboard ({user?.role})
              </Link>
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  handleLogout();
                }}
                className="w-full text-left px-3 py-2 rounded-md text-base font-medium text-red-600 hover:bg-red-50"
              >
                Sign Out
              </button>
            </>
          ) : (
            <div className="pt-2 border-t border-slate-100 flex flex-col space-y-2">
              <Link
                to="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg border border-slate-200 text-sm font-semibold text-slate-800"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="w-full text-center py-2.5 rounded-lg bg-civic-600 text-sm font-semibold text-white"
              >
                Register Citizen Account
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  );
};
