import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { CivicMap } from '../components/map/CivicMap';
import {
  ShieldAlert,
  Sparkles,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Search,
  Building2,
  Users,
  BarChart3,
  Flame,
  Zap,
  Layers,
  ChevronRight
} from 'lucide-react';

export const LandingPage: React.FC = () => {
  const { user, isAuthenticated, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [trackingId, setTrackingId] = useState('');

  const handleTrackSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (trackingId.trim()) {
      navigate(`/complaint/${trackingId.trim()}`);
    }
  };

  // Sample seed complaints for map preview
  const sampleComplaints: any[] = [
    {
      _id: 'sample-1',
      complaintId: 'CFA-2026-000101',
      title: 'Deep Hazardous Pothole near Exit 3',
      category: 'Roads & Potholes',
      priority: 'High',
      status: 'In Progress',
      address: 'Inner Circle, Connaught Place, New Delhi',
      location: { coordinates: [77.2185, 28.6328] },
      images: ['https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=800&auto=format&fit=crop&q=80']
    },
    {
      _id: 'sample-2',
      complaintId: 'CFA-2026-000103',
      title: 'Overflowing Municipal Garbage Dump',
      category: 'Garbage & Sanitation',
      priority: 'High',
      status: 'Assigned',
      address: 'Central Market Lane 4, Lajpat Nagar, New Delhi',
      location: { coordinates: [77.2435, 28.5685] },
      images: ['https://images.unsplash.com/photo-1605600659908-0ef719419d41?w=800&auto=format&fit=crop&q=80']
    },
    {
      _id: 'sample-3',
      complaintId: 'CFA-2026-000104',
      title: 'Pressurized Water Main Pipeline Breach',
      category: 'Water Leakage & Supply',
      priority: 'Critical',
      status: 'In Progress',
      address: 'Pusa Road, Karol Bagh, New Delhi',
      location: { coordinates: [77.1906, 28.6517] },
      images: ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=800&auto=format&fit=crop&q=80']
    },
    {
      _id: 'sample-4',
      complaintId: 'CFA-2026-000105',
      title: 'Exposed Live Wire on Tilting Lamp Post',
      category: 'Streetlight & Electrical',
      priority: 'Critical',
      status: 'Resolved',
      address: 'Ring Road, Model Town III, New Delhi',
      location: { coordinates: [77.1932, 28.7032] },
      images: ['https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80']
    }
  ];

  return (
    <div className="space-y-16 pb-16">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-civic-50/80 via-white to-slate-50 pt-12 pb-20 border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto space-y-6">
            <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-civic-100 text-civic-800 text-xs font-bold border border-civic-200 shadow-xs">
              <Sparkles className="w-4 h-4 text-civic-600 animate-pulse" />
              <span>Smart India Hackathon 2026 • AI-Powered GovTech</span>
            </div>

            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-slate-900 tracking-tight leading-tight">
              Report Smart. Resolve Faster.{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-civic-600 to-indigo-600">
                Build Better Communities.
              </span>
            </h1>

            <p className="text-base sm:text-lg text-slate-600 leading-relaxed font-normal">
              CivicFix AI connects citizens directly with municipal authorities. With Google Gemini multimodal vision, geospatial proximity clustering, and explainable AI prioritization, civic issues are reported in seconds and resolved with complete transparency.
            </p>

            {/* Main Action CTAs */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-2">
              <Link
                to="/report"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-white bg-civic-600 hover:bg-civic-700 shadow-md shadow-civic-600/20 transition transform hover:-translate-y-0.5 flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <ShieldAlert className="w-5 h-5" />
                <span>Report an Issue Now</span>
              </Link>
              <Link
                to="/map"
                className="w-full sm:w-auto px-7 py-3.5 rounded-xl font-bold text-slate-700 bg-white hover:bg-slate-50 border border-slate-300 shadow-xs transition flex items-center justify-center space-x-2 text-sm sm:text-base"
              >
                <MapPin className="w-5 h-5 text-civic-600" />
                <span>Explore Civic Map</span>
              </Link>
            </div>

            {/* Quick Complaint Tracking Input */}
            <div className="pt-6 max-w-lg mx-auto">
              <form onSubmit={handleTrackSubmit} className="relative flex items-center">
                <Search className="w-5 h-5 text-slate-400 absolute left-4 pointer-events-none" />
                <input
                  type="text"
                  value={trackingId}
                  onChange={(e) => setTrackingId(e.target.value)}
                  placeholder="Enter Complaint ID (e.g. CFA-2026-000101)..."
                  className="w-full pl-11 pr-28 py-3 rounded-xl border border-slate-300 bg-white text-sm text-slate-900 focus:outline-none focus:ring-2 focus:ring-civic-500 focus:border-transparent shadow-sm"
                />
                <button
                  type="submit"
                  className="absolute right-2 px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition"
                >
                  Track
                </button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Live Statistics Counter Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-6 sm:p-8">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6 text-center divide-y md:divide-y-0 md:divide-x divide-slate-100">
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-slate-900">1,248+</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Civic Issues Resolved</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-emerald-600">89.4%</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Resolution SLA Rate</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-civic-600">24 hrs</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Average Turnaround</p>
            </div>
            <div className="pt-4 md:pt-0">
              <p className="text-3xl sm:text-4xl font-black text-indigo-600">5 Depts</p>
              <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider mt-1">Municipal Integration</p>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Workflow Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase text-civic-600 tracking-wider">End-to-End Transparency</span>
          <h2 className="text-3xl font-extrabold text-slate-900 mt-1">How CivicFix AI Operates</h2>
          <p className="text-sm text-slate-600 mt-2">
            A closed-loop grievance redressal architecture ensuring no citizen complaint is lost, delayed, or ignored.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          {[
            {
              step: '01',
              title: 'Citizen Reports',
              desc: 'Upload photo with auto GPS coordinates & voice/text notes.',
              color: 'border-blue-400 bg-blue-50 text-blue-700'
            },
            {
              step: '02',
              title: 'AI Analysis',
              desc: 'Gemini multimodal AI detects visible damage & classifies category.',
              color: 'border-indigo-400 bg-indigo-50 text-indigo-700'
            },
            {
              step: '03',
              title: 'Duplicate Check',
              desc: 'Spatial proximity engine clusters similar reports within 150m.',
              color: 'border-amber-400 bg-amber-50 text-amber-700'
            },
            {
              step: '04',
              title: 'Priority Assigned',
              desc: 'Explainable AI computes priority score based on risk factors.',
              color: 'border-red-400 bg-red-50 text-red-700'
            },
            {
              step: '05',
              title: 'Field Resolution',
              desc: 'Assigned officer conducts field repairs and uploads evidence.',
              color: 'border-teal-400 bg-teal-50 text-teal-700'
            },
            {
              step: '06',
              title: 'Citizen Confirms',
              desc: 'Citizen rates satisfaction to formally close or reopen the ticket.',
              color: 'border-emerald-400 bg-emerald-50 text-emerald-700'
            }
          ].map((item, idx) => (
            <div
              key={idx}
              className="bg-white rounded-xl p-4 border border-slate-200 shadow-xs hover:shadow-md transition relative flex flex-col justify-between"
            >
              <div>
                <span className={`inline-block text-xs font-black px-2 py-0.5 rounded border ${item.color} mb-3`}>
                  STEP {item.step}
                </span>
                <h3 className="font-bold text-slate-900 text-sm">{item.title}</h3>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Platform Capabilities (4 pillars) */}
      <section className="bg-slate-900 text-white py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <span className="text-xs font-extrabold uppercase text-civic-400 tracking-wider">Engineered with Purpose</span>
            <h2 className="text-3xl font-extrabold text-white mt-1">Core AI & GovTech Capabilities</h2>
            <p className="text-sm text-slate-400 mt-2">
              Modern full-stack technologies designed specifically to solve municipal inefficiencies.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center font-bold">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Multimodal Gemini AI</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Inspects civic photos in real time. Accurately tags potholes, solid waste, and broken infrastructure while respecting human privacy.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-amber-500/20 text-amber-400 flex items-center justify-center font-bold">
                <Layers className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Spatial Duplicate Engine</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Prevents municipal officer duplicate fatigue. Automatically clusters reports of the same crater or leak within 30-150 meters.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-red-500/20 text-red-400 flex items-center justify-center font-bold">
                <Flame className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Explainable AI Priority</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Transparent factor breakdown. Scores issues from Low to Critical based on life safety risk, traffic density, and school/hospital proximity.
              </p>
            </div>

            <div className="bg-slate-800/80 p-6 rounded-2xl border border-slate-700/60 space-y-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                <Zap className="w-5 h-5" />
              </div>
              <h3 className="font-bold text-lg text-white">Real-Time Socket Sync</h3>
              <p className="text-xs text-slate-300 leading-relaxed">
                Citizens receive instant notifications when field work begins and officers upload after-repair photographic proof.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Map Live Preview */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-6">
          <div>
            <span className="text-xs font-extrabold uppercase text-civic-600 tracking-wider">Live Municipal Grid</span>
            <h2 className="text-2xl sm:text-3xl font-extrabold text-slate-900 mt-1">Interactive Civic Issue Map</h2>
            <p className="text-xs sm:text-sm text-slate-500 mt-1">
              Real-time geospatial visualization of active, in-progress, and resolved complaints.
            </p>
          </div>
          <Link
            to="/map"
            className="mt-3 md:mt-0 inline-flex items-center space-x-1.5 text-xs font-bold text-civic-600 hover:text-civic-700"
          >
            <span>Open Fullscreen Map</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        <CivicMap complaints={sampleComplaints} height="420px" />
      </section>

      {/* Call to Action Banner */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="rounded-3xl bg-gradient-to-r from-civic-700 via-civic-600 to-indigo-700 p-8 sm:p-12 text-white text-center relative overflow-hidden shadow-2xl">
          <div className="max-w-2xl mx-auto space-y-4 relative z-10">
            <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight">
              Spot a civic issue in your neighborhood?
            </h2>
            <p className="text-sm sm:text-base text-civic-100 font-normal leading-relaxed">
              Don't wait for accidents to happen. Snap a photo, let CivicFix AI analyze the danger, and watch your municipal corporation take action.
            </p>
            <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
              <Link
                to="/report"
                className="w-full sm:w-auto px-8 py-3.5 bg-white text-civic-700 hover:bg-civic-50 rounded-xl font-bold text-sm shadow-lg transition"
              >
                Report an Issue Now
              </Link>
              <Link
                to="/transparency"
                className="w-full sm:w-auto px-8 py-3.5 bg-civic-800/80 hover:bg-civic-800 text-white rounded-xl font-bold text-sm border border-civic-500/40 transition"
              >
                View Public Accountability
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
