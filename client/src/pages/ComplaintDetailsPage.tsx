import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useSocket } from '../context/SocketContext';
import { complaintService } from '../services/complaintService';
import { Complaint, ComplaintUpdate } from '../types';
import { getPriorityBadge, getStatusBadge } from '../utils/priorityColors';
import { formatDate, formatRelativeTime } from '../utils/formatters';
import confetti from 'canvas-confetti';
import {
  ShieldAlert,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Building2,
  User as UserIcon,
  Star,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Layers,
  ArrowLeft,
  Camera,
  RefreshCw,
  Send
} from 'lucide-react';

const LIFECYCLE_STAGES = [
  'Submitted',
  'AI Analysis',
  'Under Review',
  'Assigned',
  'In Progress',
  'Resolved',
  'Citizen Verification',
  'Closed'
];

export const ComplaintDetailsPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const { socket } = useSocket();

  const [complaint, setComplaint] = useState<Complaint | null>(null);
  const [timeline, setTimeline] = useState<ComplaintUpdate[]>([]);
  const [duplicateGroup, setDuplicateGroup] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Citizen verification form
  const [rating, setRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState(false);

  const fetchDetails = async () => {
    if (!id) return;
    try {
      setLoading(true);
      const data = await complaintService.getComplaintById(id);
      setComplaint(data.complaint);
      setTimeline(data.timeline || []);
      setDuplicateGroup(data.duplicateGroup || null);
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to load complaint details.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  // Real-time socket event listener for this complaint
  useEffect(() => {
    if (!socket || !id) return;

    socket.emit('join:complaint', id);

    socket.on('complaint:status_updated', (updatedData: Complaint) => {
      if (updatedData._id === id || updatedData.complaintId === id) {
        fetchDetails();
      }
    });

    return () => {
      socket.emit('leave:complaint', id);
      socket.off('complaint:status_updated');
    };
  }, [socket, id]);

  const handleVerifyResolution = async (isSatisfied: boolean) => {
    if (!id || !complaint) return;

    try {
      setIsSubmittingFeedback(true);
      await complaintService.updateComplaint(complaint._id, {
        citizenFeedback: {
          rating,
          comment: feedbackComment || (isSatisfied ? 'Resolved satisfactorily.' : 'Issue unresolved.'),
          isSatisfied
        }
      });

      if (isSatisfied) {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        });
      }

      setFeedbackSuccess(true);
      fetchDetails();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to submit verification feedback');
    } finally {
      setIsSubmittingFeedback(false);
    }
  };

  if (loading) {
    return (
      <div className="max-w-5xl mx-auto py-16 text-center text-slate-500 space-y-2">
        <RefreshCw className="w-8 h-8 animate-spin mx-auto text-civic-600" />
        <p className="text-sm font-semibold">Loading complaint tracking data...</p>
      </div>
    );
  }

  if (error || !complaint) {
    return (
      <div className="max-w-md mx-auto py-16 text-center space-y-4">
        <AlertTriangle className="w-12 h-12 text-amber-500 mx-auto" />
        <h2 className="text-xl font-bold text-slate-900">Complaint Not Found</h2>
        <p className="text-xs text-slate-500">{error || 'No record matched this complaint identifier.'}</p>
        <Link
          to="/dashboard/citizen"
          className="inline-flex items-center space-x-1.5 px-4 py-2 bg-civic-600 text-white rounded-lg text-xs font-bold"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Dashboard</span>
        </Link>
      </div>
    );
  }

  const pBadge = getPriorityBadge(complaint.priority);
  const sBadge = getStatusBadge(complaint.status);

  // Calculate timeline stage index
  let currentStageIdx = LIFECYCLE_STAGES.indexOf(complaint.status);
  if (complaint.status === 'Resolved' || complaint.status === 'Citizen Verification') {
    currentStageIdx = 5;
  } else if (complaint.status === 'Closed') {
    currentStageIdx = 7;
  }

  const isOwner = user?.id === (complaint.citizenId?._id || complaint.citizenId);
  const canVerify =
    (complaint.status === 'Resolved' || complaint.status === 'Citizen Verification') &&
    (isOwner || user?.role === 'admin' || user?.role === 'citizen');

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      {/* Top Breadcrumb & ID Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-200">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs text-slate-500">
            <Link to="/" className="hover:text-civic-600">Home</Link>
            <span>/</span>
            <Link to="/map" className="hover:text-civic-600">Civic Map</Link>
            <span>/</span>
            <span className="text-slate-800 font-mono font-bold">{complaint.complaintId}</span>
          </div>
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-xl sm:text-2xl font-black text-slate-900">{complaint.complaintId}</span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-full border ${pBadge.bg} ${pBadge.text} ${pBadge.border}`}>
              Priority: {complaint.priority}
            </span>
            <span className={`text-xs font-bold px-2.5 py-0.5 rounded-md border ${sBadge.bg} ${sBadge.text} ${sBadge.border}`}>
              {sBadge.label}
            </span>
          </div>
        </div>

        <div className="text-left sm:text-right text-xs text-slate-400">
          <p>Reported on: <strong className="text-slate-700">{formatDate(complaint.createdAt)}</strong></p>
          <p className="mt-0.5">Last updated: <span className="text-slate-600">{formatRelativeTime(complaint.updatedAt)}</span></p>
        </div>
      </div>

      {/* Visual 8-Stage Lifecycle Timeline */}
      <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
          Resolution Lifecycle Progress
        </h3>

        <div className="relative">
          <div className="overflow-x-auto pb-4">
            <div className="flex items-center min-w-[700px] justify-between relative">
              {/* Connecting Bar */}
              <div className="absolute top-4 left-6 right-6 h-0.5 bg-slate-200 -z-0" />
              <div
                className="absolute top-4 left-6 h-0.5 bg-civic-600 transition-all duration-500 -z-0"
                style={{
                  width: `${Math.max(0, (currentStageIdx / (LIFECYCLE_STAGES.length - 1)) * 100)}%`
                }}
              />

              {LIFECYCLE_STAGES.map((stage, idx) => {
                const isPassed = idx <= currentStageIdx;
                const isCurrent = idx === currentStageIdx;

                return (
                  <div key={stage} className="flex flex-col items-center relative z-10 text-center w-24">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition ${
                        isCurrent
                          ? 'bg-civic-600 text-white ring-4 ring-civic-100'
                          : isPassed
                          ? 'bg-emerald-500 text-white'
                          : 'bg-white border-2 border-slate-300 text-slate-400'
                      }`}
                    >
                      {isPassed && !isCurrent ? '✓' : idx + 1}
                    </div>
                    <span
                      className={`text-[11px] mt-2 font-medium leading-tight ${
                        isCurrent ? 'font-bold text-civic-700' : isPassed ? 'text-slate-800' : 'text-slate-400'
                      }`}
                    >
                      {stage}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Grid: Details Left, AI + Dept Right */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column: Complaint Details & Timeline (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Issue Overview Card */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h1 className="text-xl font-bold text-slate-900 leading-snug">
              {complaint.title}
            </h1>

            <div className="flex flex-wrap items-center gap-3 text-xs text-slate-600">
              <span className="font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-800">
                {complaint.category}
              </span>
              <span>📍 {complaint.address}</span>
              {complaint.landmark && <span>• Landmark: {complaint.landmark}</span>}
            </div>

            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line pt-2 border-t border-slate-100">
              {complaint.description}
            </p>

            {/* Images Gallery */}
            {complaint.images && complaint.images.length > 0 && (
              <div className="pt-2">
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                  Reported Photograph(s)
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {complaint.images.map((img, idx) => (
                    <a
                      key={idx}
                      href={img}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-xl overflow-hidden border border-slate-200 aspect-video group block"
                    >
                      <img
                        src={img}
                        alt="Reported civic issue"
                        className="w-full h-full object-cover group-hover:scale-105 transition"
                      />
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Resolution Evidence Card (When Resolved) */}
          {complaint.resolutionEvidence && complaint.resolutionEvidence.description && (
            <div className="bg-emerald-50/60 p-6 rounded-2xl border border-emerald-200 shadow-xs space-y-3">
              <div className="flex items-center space-x-2 text-emerald-900">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="font-bold text-sm">Official Field Resolution Evidence</h3>
              </div>
              <p className="text-xs text-slate-700 leading-relaxed">
                {complaint.resolutionEvidence.description}
              </p>

              {complaint.resolutionEvidence.images && complaint.resolutionEvidence.images.length > 0 && (
                <div className="pt-2">
                  <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider block mb-2">
                    After-Repair Proof Photos
                  </span>
                  <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                    {complaint.resolutionEvidence.images.map((img, idx) => (
                      <a
                        key={idx}
                        href={img}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-xl overflow-hidden border border-emerald-200 aspect-video group block"
                      >
                        <img
                          src={img}
                          alt="Resolution evidence"
                          className="w-full h-full object-cover group-hover:scale-105 transition"
                        />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Citizen Verification & Feedback Card */}
          {canVerify && !feedbackSuccess && (
            <div className="bg-white p-6 rounded-2xl border-2 border-civic-500 shadow-md space-y-4">
              <div className="flex items-center space-x-2 text-civic-900">
                <Star className="w-5 h-5 text-amber-500 fill-amber-500" />
                <h3 className="font-bold text-base">Citizen Verification & Satisfaction Rating</h3>
              </div>
              <p className="text-xs text-slate-600">
                Municipal officers have submitted resolution evidence. Please inspect the site and confirm whether the civic problem is resolved to your satisfaction.
              </p>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Satisfaction Rating</label>
                <div className="flex items-center space-x-2">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <button
                      key={s}
                      type="button"
                      onClick={() => setRating(s)}
                      className="p-1.5 focus:outline-none"
                    >
                      <Star
                        className={`w-6 h-6 ${
                          s <= rating ? 'text-amber-400 fill-amber-400' : 'text-slate-300'
                        }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-bold text-slate-700 ml-2">{rating}/5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Feedback Comments</label>
                <textarea
                  rows={2}
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  placeholder="Share comments on quality of repair or note any remaining hazard..."
                  className="w-full px-3 py-2 text-xs rounded-lg border border-slate-300 focus:outline-none focus:ring-2 focus:ring-civic-500"
                />
              </div>

              <div className="flex items-center space-x-3 pt-2">
                <button
                  type="button"
                  onClick={() => handleVerifyResolution(true)}
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-50"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirm Resolution & Close</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleVerifyResolution(false)}
                  disabled={isSubmittingFeedback}
                  className="px-5 py-2.5 bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 rounded-xl text-xs font-bold transition disabled:opacity-50"
                >
                  <span>Reopen Ticket (Unsatisfied)</span>
                </button>
              </div>
            </div>
          )}

          {/* Timeline Updates Stream */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-bold text-slate-900">
              Audit & Resolution History
            </h3>

            <div className="space-y-4 divide-y divide-slate-100">
              {timeline.map((item, idx) => (
                <div key={idx} className="pt-3 first:pt-0 space-y-1">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-800">
                      {item.updatedBy?.name || 'Municipal System'}
                    </span>
                    <span className="text-slate-400 text-[11px]">
                      {formatDate(item.createdAt)}
                    </span>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">{item.comment}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Analysis & Department Card (1 col) */}
        <div className="space-y-6">
          {/* Explainable AI Priority Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3.5">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Sparkles className="w-4 h-4 text-indigo-600" />
                <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                  AI Priority Engine
                </h3>
              </div>
              <span className="text-xs font-black text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full">
                Score: {complaint.priorityScore || 70}/100
              </span>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 leading-relaxed border border-slate-100">
              {complaint.priorityReason || 'Automated multi-factor evaluation of life safety and traffic impact.'}
            </div>

            {/* Factor Breakdown Bars */}
            <div className="space-y-2 pt-1 text-xs">
              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                  <span>Public Safety Risk</span>
                  <span className="font-semibold text-slate-700">
                    {complaint.priorityFactors?.safetyRisk || 20}/30
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-red-500 rounded-full"
                    style={{
                      width: `${((complaint.priorityFactors?.safetyRisk || 20) / 30) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                  <span>Public Health Hazard</span>
                  <span className="font-semibold text-slate-700">
                    {complaint.priorityFactors?.publicHealthRisk || 15}/25
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-amber-500 rounded-full"
                    style={{
                      width: `${((complaint.priorityFactors?.publicHealthRisk || 15) / 25) * 100}%`
                    }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-[11px] text-slate-500 mb-0.5">
                  <span>Traffic Disruption Impact</span>
                  <span className="font-semibold text-slate-700">
                    {complaint.priorityFactors?.trafficDisruption || 12}/20
                  </span>
                </div>
                <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-500 rounded-full"
                    style={{
                      width: `${((complaint.priorityFactors?.trafficDisruption || 12) / 20) * 100}%`
                    }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Department Assignment Card */}
          <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center space-x-2">
              <Building2 className="w-4 h-4 text-civic-600" />
              <h3 className="font-bold text-xs uppercase tracking-wider text-slate-800">
                Assigned Department
              </h3>
            </div>

            <div className="p-3 bg-civic-50/60 rounded-xl border border-civic-100 space-y-1">
              <p className="text-sm font-bold text-civic-950">
                {complaint.assignedDepartmentId?.name || 'Public Works Department (PWD)'}
              </p>
              <p className="text-xs text-civic-700">
                Code: {complaint.assignedDepartmentId?.code || 'PWD'}
              </p>
              {complaint.assignedDepartmentId?.contactEmail && (
                <p className="text-[11px] text-slate-500">
                  Email: {complaint.assignedDepartmentId?.contactEmail}
                </p>
              )}
            </div>

            {complaint.assignedOfficerId && (
              <div className="pt-2 border-t border-slate-100 text-xs space-y-1">
                <span className="text-[11px] text-slate-400 font-semibold uppercase block">
                  Assigned Officer
                </span>
                <p className="font-bold text-slate-800">{complaint.assignedOfficerId?.name}</p>
                <p className="text-slate-500 text-[11px]">{complaint.assignedOfficerId?.designation || 'Field Engineer'}</p>
              </div>
            )}
          </div>

          {/* Duplicate Group info if present */}
          {duplicateGroup && (
            <div className="bg-amber-50 p-4 rounded-xl border border-amber-200 text-xs space-y-2">
              <div className="flex items-center space-x-1.5 font-bold text-amber-900">
                <Layers className="w-4 h-4 text-amber-600" />
                <span>Spatial Duplicate Cluster</span>
              </div>
              <p className="text-amber-800 text-[11px] leading-relaxed">
                Grouped with {duplicateGroup.complaintIds?.length || 2} reports within {duplicateGroup.geographicalDistance}m radius.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
