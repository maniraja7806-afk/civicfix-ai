import mongoose, { Document, Schema } from 'mongoose';
import { ComplaintStatus } from './Complaint';

export interface IComplaintUpdate extends Document {
  complaintId: mongoose.Types.ObjectId;
  updatedBy: mongoose.Types.ObjectId;
  previousStatus: ComplaintStatus;
  newStatus: ComplaintStatus;
  comment?: string;
  evidenceImages?: string[];
  actionType: 'status_change' | 'officer_note' | 'evidence_upload' | 'assignment' | 'citizen_feedback';
  createdAt: Date;
}

const ComplaintUpdateSchema = new Schema<IComplaintUpdate>(
  {
    complaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true, index: true },
    updatedBy: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    previousStatus: { type: String, required: true },
    newStatus: { type: String, required: true },
    comment: { type: String, trim: true },
    evidenceImages: [{ type: String }],
    actionType: {
      type: String,
      enum: ['status_change', 'officer_note', 'evidence_upload', 'assignment', 'citizen_feedback'],
      default: 'status_change'
    }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

ComplaintUpdateSchema.index({ complaintId: 1, createdAt: 1 });

export const ComplaintUpdate = mongoose.model<IComplaintUpdate>('ComplaintUpdate', ComplaintUpdateSchema);
