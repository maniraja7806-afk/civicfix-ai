import mongoose, { Document, Schema } from 'mongoose';

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

export interface IComplaint extends Document {
  complaintId: string;
  citizenId: mongoose.Types.ObjectId;
  title: string;
  description: string;
  category: string;
  images: string[];
  location: {
    type: 'Point';
    coordinates: [number, number]; // [longitude, latitude]
  };
  address: string;
  landmark?: string;
  priority: ComplaintPriority;
  priorityReason?: string;
  priorityScore?: number;
  priorityFactors?: {
    safetyRisk: number;
    publicHealthRisk: number;
    trafficDisruption: number;
    recurrenceBonus: number;
    populationDensity: number;
  };
  status: ComplaintStatus;
  assignedDepartmentId?: mongoose.Types.ObjectId;
  assignedOfficerId?: mongoose.Types.ObjectId;
  aiAnalysis?: {
    detectedIssue?: string;
    suggestedCategory?: string;
    suggestedPriority?: ComplaintPriority;
    suggestedDepartment?: string;
    confidenceScore?: number;
    visualDamage?: string;
    urgencyExplanation?: string;
    safetyAdvisory?: string;
    isAiGenerated: boolean;
    modelUsed?: string;
    analyzedAt?: Date;
  };
  duplicateGroupId?: mongoose.Types.ObjectId;
  isDuplicate?: boolean;
  duplicateOfId?: mongoose.Types.ObjectId;
  resolutionEvidence?: {
    images?: string[];
    description?: string;
    resolvedAt?: Date;
    resolvedBy?: mongoose.Types.ObjectId;
  };
  citizenFeedback?: {
    rating?: number;
    comment?: string;
    verifiedAt?: Date;
    isSatisfied?: boolean;
  };
  rejectionReason?: string;
  reopenReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    complaintId: { type: String, required: true, unique: true, index: true },
    citizenId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      required: true,
      index: true,
      enum: [
        'Roads & Potholes',
        'Garbage & Sanitation',
        'Water Leakage & Supply',
        'Streetlight & Electrical',
        'Drainage & Sewerage',
        'Public Health & Hygiene',
        'Public Safety & Parks',
        'Other Infrastructure'
      ]
    },
    images: [{ type: String }],
    location: {
      type: {
        type: String,
        enum: ['Point'],
        required: true,
        default: 'Point'
      },
      coordinates: {
        type: [Number], // [lng, lat]
        required: true
      }
    },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, trim: true },
    priority: {
      type: String,
      enum: ['Critical', 'High', 'Medium', 'Low'],
      default: 'Medium',
      index: true
    },
    priorityReason: { type: String },
    priorityScore: { type: Number, default: 50 },
    priorityFactors: {
      safetyRisk: { type: Number, default: 0 },
      publicHealthRisk: { type: Number, default: 0 },
      trafficDisruption: { type: Number, default: 0 },
      recurrenceBonus: { type: Number, default: 0 },
      populationDensity: { type: Number, default: 0 }
    },
    status: {
      type: String,
      enum: [
        'Submitted',
        'AI Analysis',
        'Under Review',
        'Assigned',
        'In Progress',
        'Resolved',
        'Citizen Verification',
        'Closed',
        'Rejected',
        'Reopened'
      ],
      default: 'Submitted',
      index: true
    },
    assignedDepartmentId: { type: Schema.Types.ObjectId, ref: 'Department', index: true },
    assignedOfficerId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    aiAnalysis: {
      detectedIssue: { type: String },
      suggestedCategory: { type: String },
      suggestedPriority: { type: String, enum: ['Critical', 'High', 'Medium', 'Low'] },
      suggestedDepartment: { type: String },
      confidenceScore: { type: Number },
      visualDamage: { type: String },
      urgencyExplanation: { type: String },
      safetyAdvisory: { type: String },
      isAiGenerated: { type: Boolean, default: false },
      modelUsed: { type: String },
      analyzedAt: { type: Date }
    },
    duplicateGroupId: { type: Schema.Types.ObjectId, ref: 'DuplicateGroup', index: true },
    isDuplicate: { type: Boolean, default: false },
    duplicateOfId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    resolutionEvidence: {
      images: [{ type: String }],
      description: { type: String },
      resolvedAt: { type: Date },
      resolvedBy: { type: Schema.Types.ObjectId, ref: 'User' }
    },
    citizenFeedback: {
      rating: { type: Number, min: 1, max: 5 },
      comment: { type: String },
      verifiedAt: { type: Date },
      isSatisfied: { type: Boolean }
    },
    rejectionReason: { type: String },
    reopenReason: { type: String }
  },
  {
    timestamps: true
  }
);

ComplaintSchema.index({ location: '2dsphere' });
ComplaintSchema.index({ createdAt: -1 });

export const Complaint = mongoose.model<IComplaint>('Complaint', ComplaintSchema);
