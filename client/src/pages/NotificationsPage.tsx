import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { notificationService } from '../services/notificationService';
import { NotificationItem } from '../types';
import { formatRelativeTime } from '../utils/formatters';
import { Bell, Check, Clock, ExternalLink, RefreshCw, CheckCheck } from 'lucide-react';

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<NotificationItem[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const res = await notificationService.getNotifications();
      setNotifications(res.notifications || []);
    } catch (err) {
      console.error('Failed to load notifications:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkRead = async (id: string) => {
    try {
      await notificationService.markRead(id);
      setNotifications(prev =>
        prev.map(n => (n._id === id ? { ...n, isRead: true } : n))
      );
    } catch (err) {
      // ignore
    }
  };

  const handleMarkAllRead = async () => {
    try {
      await notificationService.markAllRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (err) {
      // ignore
    }
  };

  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight">
            Notifications Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Real-time status updates, assignment notifications, and resolution alerts
          </p>
        </div>

        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-300 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
          >
            <CheckCheck className="w-3.5 h-3.5 text-civic-600" />
            <span>Mark All as Read</span>
          </button>
        )}
      </div>

      {loading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 text-sm text-slate-500">
          Loading notifications...
        </div>
      ) : notifications.length === 0 ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200 space-y-2">
          <Bell className="w-8 h-8 text-slate-300 mx-auto" />
          <p className="text-sm font-semibold text-slate-700">No notifications yet.</p>
          <p className="text-xs text-slate-400">You will be notified whenever your reports are updated.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {notifications.map(n => (
            <div
              key={n._id}
              className={`p-4 rounded-xl border transition flex items-start justify-between gap-4 ${
                n.isRead
                  ? 'bg-white border-slate-200 text-slate-700'
                  : 'bg-civic-50/60 border-civic-200 text-slate-900 shadow-2xs'
              }`}
            >
              <div className="space-y-1">
                <div className="flex items-center space-x-2">
                  {!n.isRead && <span className="w-2 h-2 rounded-full bg-civic-600" />}
                  <h4 className="text-xs font-bold">{n.title}</h4>
                  <span className="text-[10px] text-slate-400">• {formatRelativeTime(n.createdAt)}</span>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{n.message}</p>

                {n.relatedComplaintId && (
                  <Link
                    to={`/complaint/${n.relatedComplaintId._id || n.relatedComplaintId}`}
                    className="inline-flex items-center space-x-1 text-xs font-semibold text-civic-600 hover:text-civic-700 pt-1"
                  >
                    <span>View Complaint Details</span>
                    <ExternalLink className="w-3 h-3" />
                  </Link>
                )}
              </div>

              {!n.isRead && (
                <button
                  onClick={() => handleMarkRead(n._id)}
                  className="p-1.5 text-slate-400 hover:text-slate-600 text-xs shrink-0"
                  title="Mark as read"
                >
                  <Check className="w-4 h-4" />
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
