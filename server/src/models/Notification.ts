import mongoose, { Document, Schema } from 'mongoose';

export interface INotification extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  message: string;
  type: 'status_update' | 'assignment' | 'resolution' | 'reopened' | 'duplicate_alert' | 'feedback_request' | 'system';
  isRead: boolean;
  relatedComplaintId?: mongoose.Types.ObjectId;
  actionUrl?: string;
  createdAt: Date;
}

const NotificationSchema = new Schema<INotification>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, required: true, trim: true },
    message: { type: String, required: true, trim: true },
    type: {
      type: String,
      enum: ['status_update', 'assignment', 'resolution', 'reopened', 'duplicate_alert', 'feedback_request', 'system'],
      default: 'system'
    },
    isRead: { type: Boolean, default: false, index: true },
    relatedComplaintId: { type: Schema.Types.ObjectId, ref: 'Complaint' },
    actionUrl: { type: String }
  },
  {
    timestamps: { createdAt: true, updatedAt: false }
  }
);

NotificationSchema.index({ userId: 1, createdAt: -1 });

export const Notification = mongoose.model<INotification>('Notification', NotificationSchema);
