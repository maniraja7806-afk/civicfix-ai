import mongoose, { Document, Schema } from 'mongoose';

export interface IDepartment extends Document {
  name: string;
  code: string;
  description: string;
  categoryMappings: string[];
  officerIds: mongoose.Types.ObjectId[];
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
  createdAt: Date;
  updatedAt: Date;
}

const DepartmentSchema = new Schema<IDepartment>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    description: { type: String, required: true, trim: true },
    categoryMappings: [{ type: String, trim: true }],
    officerIds: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    headOfficerName: { type: String, trim: true },
    contactEmail: { type: String, trim: true, lowercase: true },
    contactPhone: { type: String, trim: true },
    slaHours: {
      critical: { type: Number, default: 6 },
      high: { type: Number, default: 24 },
      medium: { type: Number, default: 72 },
      low: { type: Number, default: 168 }
    },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

export const Department = mongoose.model<IDepartment>('Department', DepartmentSchema);
