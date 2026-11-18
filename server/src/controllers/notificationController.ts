import { Response } from 'express';
import { Notification, INotification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { getInMemoryStore } from '../utils/inMemoryStore';

export const getUserNotifications = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const userId = req.user.id;
    let list: any[] = [];

    try {
      list = await Notification.find({ userId })
        .sort({ createdAt: -1 })
        .limit(50)
        .populate('relatedComplaintId', 'complaintId title status priority')
        .lean();
    } catch {
      list = getInMemoryStore().getNotificationsByUser(userId);
    }

    const unreadCount = list.filter(n => !n.isRead).length;

    res.status(200).json({
      success: true,
      unreadCount,
      count: list.length,
      notifications: list
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markNotificationRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

    try {
      await Notification.findOneAndUpdate({ _id: id, userId: req.user.id }, { isRead: true });
    } catch {
      const notif = getInMemoryStore().notifications.get(id);
      if (notif && notif.userId.toString() === req.user.id) {
        notif.isRead = true;
      }
    }

    res.status(200).json({ success: true, message: 'Notification marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllNotificationsRead = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    try {
      await Notification.updateMany({ userId: req.user.id, isRead: false }, { isRead: true });
    } catch {
      for (const notif of getInMemoryStore().notifications.values()) {
        if (notif.userId.toString() === req.user.id) {
          notif.isRead = true;
        }
      }
    }

    res.status(200).json({ success: true, message: 'All notifications marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
