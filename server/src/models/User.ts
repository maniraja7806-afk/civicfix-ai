import mongoose, { Document, Schema } from 'mongoose';

export type UserRole = 'citizen' | 'officer' | 'admin';

export interface IUser extends Document {
  name: string;
  email: string;
  passwordHash: string;
  phone?: string;
  role: UserRole;
  address?: string;
  departmentId?: mongoose.Types.ObjectId;
  designation?: string;
  avatar?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const UserSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true, index: true },
    passwordHash: { type: String, required: true },
    phone: { type: String, trim: true },
    role: {
      type: String,
      enum: ['citizen', 'officer', 'admin'],
      default: 'citizen',
      index: true
    },
    address: { type: String, trim: true },
    departmentId: { type: Schema.Types.ObjectId, ref: 'Department' },
    designation: { type: String, trim: true },
    avatar: { type: String },
    isActive: { type: Boolean, default: true }
  },
  {
    timestamps: true
  }
);

// Never serialize passwordHash to JSON
UserSchema.set('toJSON', {
  transform: (_, ret) => {
    delete (ret as any).passwordHash;
    return ret;
  }
});

export const User = mongoose.model<IUser>('User', UserSchema);
