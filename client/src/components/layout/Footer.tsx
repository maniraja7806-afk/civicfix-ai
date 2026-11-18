import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, Heart, MapPin, ExternalLink, Mail, Phone } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-slate-900 text-slate-400 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="space-y-4 md:col-span-1">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-lg bg-civic-600 flex items-center justify-center text-white">
                <ShieldAlert className="w-5 h-5 text-white" />
              </div>
              <span className="font-extrabold text-lg text-white tracking-tight">CivicFix AI</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              AI-Powered Smart Civic Issue Reporting & Resolution Platform. Connecting vigilant citizens with municipal authorities for rapid, transparent public grievance redressal.
            </p>
            <p className="text-xs text-civic-400 font-medium">
              Report Smart. Resolve Faster. Build Better Communities.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Platform</h4>
            <ul className="space-y-2 text-xs">
              <li>
                <Link to="/" className="hover:text-white transition">Home</Link>
              </li>
              <li>
                <Link to="/map" className="hover:text-white transition">Interactive Civic Map</Link>
              </li>
              <li>
                <Link to="/report" className="hover:text-white transition">Report an Issue</Link>
              </li>
              <li>
                <Link to="/transparency" className="hover:text-white transition">Public Transparency Portal</Link>
              </li>
              <li>
                <Link to="/login" className="hover:text-white transition">Officer Portal</Link>
              </li>
            </ul>
          </div>

          {/* Civic Departments */}
          <div>
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Municipal Purview</h4>
            <ul className="space-y-2 text-xs">
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-civic-500" />
                <span>Public Works (Roads & Potholes)</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                <span>Sanitation & Solid Waste</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                <span>Water Supply & Sewerage</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                <span>Street Lighting & Electrical Grid</span>
              </li>
              <li className="flex items-center space-x-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-teal-500" />
                <span>Stormwater Drainage Control</span>
              </li>
            </ul>
          </div>

          {/* Contact & Hackathon Badge */}
          <div className="space-y-4">
            <h4 className="text-sm font-semibold text-white uppercase tracking-wider mb-2">Academic & SIH Project</h4>
            <div className="bg-slate-800/80 p-3 rounded-lg border border-slate-700/60 text-xs space-y-2">
              <p className="text-slate-300 font-medium">Smart India Hackathon 2026</p>
              <p className="text-slate-400">Final-Year CSE Capstone & GovTech Demonstration</p>
              <div className="pt-1 flex items-center space-x-2 text-[11px] text-civic-400">
                <Mail className="w-3.5 h-3.5" />
                <span>support@civicfix.gov.in</span>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500">
          <p>© {new Date().getFullYear()} CivicFix AI Platform. Built with Google Gemini Multimodal AI & OpenStreetMap.</p>
          <p className="mt-2 md:mt-0 flex items-center space-x-1">
            <span>Engineering better cities with responsive AI</span>
          </p>
        </div>
      </div>
    </footer>
  );
};
