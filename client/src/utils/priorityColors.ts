import { ComplaintPriority, ComplaintStatus } from '../types';

export const getPriorityBadge = (priority: ComplaintPriority) => {
  switch (priority) {
    case 'Critical':
      return {
        bg: 'bg-red-50',
        text: 'text-red-700',
        border: 'border-red-200',
        dot: 'bg-red-600',
        hex: '#dc2626'
      };
    case 'High':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        dot: 'bg-amber-500',
        hex: '#f59e0b'
      };
    case 'Medium':
      return {
        bg: 'bg-yellow-50',
        text: 'text-yellow-800',
        border: 'border-yellow-200',
        dot: 'bg-yellow-500',
        hex: '#eab308'
      };
    case 'Low':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        dot: 'bg-blue-500',
        hex: '#3b82f6'
      };
    default:
      return {
        bg: 'bg-slate-50',
        text: 'text-slate-700',
        border: 'border-slate-200',
        dot: 'bg-slate-400',
        hex: '#94a3b8'
      };
  }
};

export const getStatusBadge = (status: ComplaintStatus) => {
  switch (status) {
    case 'Submitted':
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        label: 'Submitted'
      };
    case 'AI Analysis':
      return {
        bg: 'bg-indigo-50',
        text: 'text-indigo-700',
        border: 'border-indigo-200',
        label: 'AI Analyzing'
      };
    case 'Under Review':
      return {
        bg: 'bg-purple-50',
        text: 'text-purple-700',
        border: 'border-purple-200',
        label: 'Under Review'
      };
    case 'Assigned':
      return {
        bg: 'bg-blue-50',
        text: 'text-blue-700',
        border: 'border-blue-200',
        label: 'Assigned to Dept'
      };
    case 'In Progress':
      return {
        bg: 'bg-amber-50',
        text: 'text-amber-800',
        border: 'border-amber-200',
        label: 'In Progress (Field Work)'
      };
    case 'Resolved':
      return {
        bg: 'bg-emerald-50',
        text: 'text-emerald-700',
        border: 'border-emerald-200',
        label: 'Resolved (Pending Verification)'
      };
    case 'Citizen Verification':
      return {
        bg: 'bg-teal-50',
        text: 'text-teal-700',
        border: 'border-teal-200',
        label: 'Citizen Verification'
      };
    case 'Closed':
      return {
        bg: 'bg-green-100',
        text: 'text-green-800',
        border: 'border-green-300',
        label: 'Closed & Verified'
      };
    case 'Rejected':
      return {
        bg: 'bg-rose-50',
        text: 'text-rose-700',
        border: 'border-rose-200',
        label: 'Rejected'
      };
    case 'Reopened':
      return {
        bg: 'bg-orange-50',
        text: 'text-orange-800',
        border: 'border-orange-300',
        label: 'Reopened by Citizen'
      };
    default:
      return {
        bg: 'bg-slate-100',
        text: 'text-slate-700',
        border: 'border-slate-300',
        label: status
      };
  }
};
