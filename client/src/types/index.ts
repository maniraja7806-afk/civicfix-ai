export type UserRole = 'citizen' | 'officer' | 'admin';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  phone?: string;
  address?: string;
  departmentId?: string;
  department?: {
    _id: string;
    name: string;
    code: string;
  };
  designation?: string;
  avatar?: string;
  isActive: boolean;
}

export type ComplaintPriority = 'Critical' | 'High' | 'Medium' | 'Low';

export type ComplaintStatus =
  | 'Submitted'
  | 'AI Analysis'
  | 'Under Review'
  | 'Assigned'
  | 'In Progress'
  | 'Resolved'
  | 'Citizen Verification'
  | 'Closed'
  | 'Rejected'
  | 'Reopened';

export interface PriorityFactors {
  safetyRisk: number;
  publicHealthRisk: number;
  trafficDisruption: number;
  recurrenceBonus: number;
  populationDensity: number;
}

export interface AiAnalysis {
  detectedIssue?: string;
  suggestedTitle?: string;
  suggestedCategory?: string;
  suggestedPriority?: ComplaintPriority;
  suggestedDepartment?: string;
  confidenceScore?: number;
  visualDamage?: string;
  urgencyExplanation?: string;
  safetyAdvisory?: string;
  isAiGenerated: boolean;
  modelUsed?: string;
  analyzedAt?: string;
}

export interface ResolutionEvidence {
  images?: string[];
  description?: string;
  resolvedAt?: string;
  resolvedBy?: any;
}

export interface CitizenFeedback {
  rating?: number;
  comment?: string;
  verifiedAt?: string;
  isSatisfied?: boolean;
}

export interface Complaint {
  _id: string;
  complaintId: string;
  citizenId: any;
  title: string;
  description: string;
  category: string;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  address: string;
  landmark?: string;
  priority: ComplaintPriority;
  priorityReason?: string;
  priorityScore?: number;
  priorityFactors?: PriorityFactors;
  status: ComplaintStatus;
  assignedDepartmentId?: any;
  assignedOfficerId?: any;
  aiAnalysis?: AiAnalysis;
  duplicateGroupId?: any;
  isDuplicate?: boolean;
  resolutionEvidence?: ResolutionEvidence;
  citizenFeedback?: CitizenFeedback;
  rejectionReason?: string;
  reopenReason?: string;
  createdAt: string;
  updatedAt: string;
  distanceMeters?: number;
}

export interface ComplaintUpdate {
  _id: string;
  complaintId: string;
  updatedBy: {
    _id: string;
    name: string;
    role: string;
    designation?: string;
    avatar?: string;
  };
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  comment?: string;
  evidenceImages?: string[];
  actionType: 'status_change' | 'officer_note' | 'evidence_upload' | 'assignment' | 'citizen_feedback';
  createdAt: string;
}

export interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  categoryMappings: string[];
  officerIds?: any[];
  headOfficerName?: string;
  contactEmail?: string;
  contactPhone?: string;
  slaHours: {
    critical: number;
    high: number;
    medium: number;
    low: number;
  };
  isActive: boolean;
}

export interface NotificationItem {
  _id: string;
  userId: string;
  title: string;
  message: string;
  type: 'status_update' | 'assignment' | 'resolution' | 'reopened' | 'duplicate_alert' | 'feedback_request' | 'system';
  isRead: boolean;
  relatedComplaintId?: any;
  createdAt: string;
}
