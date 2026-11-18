import mongoose, { Document, Schema } from 'mongoose';

export interface IDuplicateGroup extends Document {
  primaryComplaintId: mongoose.Types.ObjectId;
  complaintIds: mongoose.Types.ObjectId[];
  similarityScore: number;
  geographicalDistance: number; // in meters
  status: 'suggested' | 'confirmed' | 'rejected';
  reviewedBy?: mongoose.Types.ObjectId;
  reviewNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const DuplicateGroupSchema = new Schema<IDuplicateGroup>(
  {
    primaryComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint', required: true },
    complaintIds: [{ type: Schema.Types.ObjectId, ref: 'Complaint' }],
    similarityScore: { type: Number, required: true },
    geographicalDistance: { type: Number, required: true },
    status: {
      type: String,
      enum: ['suggested', 'confirmed', 'rejected'],
      default: 'suggested',
      index: true
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    reviewNotes: { type: String }
  },
  {
    timestamps: true
  }
);

export const DuplicateGroup = mongoose.model<IDuplicateGroup>('DuplicateGroup', DuplicateGroupSchema);
