import { IUser } from '../models/User';
import { IComplaint } from '../models/Complaint';
import { IDepartment } from '../models/Department';
import { IComplaintUpdate } from '../models/ComplaintUpdate';
import { INotification } from '../models/Notification';
import { IDuplicateGroup } from '../models/DuplicateGroup';
import { IAuditLog } from '../models/AuditLog';

// In-Memory store for offline/standalone execution when MongoDB daemon is not running
class InMemoryStore {
  public users: Map<string, any> = new Map();
  public departments: Map<string, any> = new Map();
  public complaints: Map<string, any> = new Map();
  public complaintUpdates: Map<string, any> = new Map();
  public notifications: Map<string, any> = new Map();
  public duplicateGroups: Map<string, any> = new Map();
  public auditLogs: any[] = [];
  public isConnectedToMongo: boolean = false;

  // User helpers
  getUserByEmail(email: string) {
    for (const user of this.users.values()) {
      if (user.email.toLowerCase() === email.toLowerCase()) {
        return user;
      }
    }
    return null;
  }

  getUserById(id: string) {
    return this.users.get(id) || null;
  }

  saveUser(user: any) {
    const id = user._id ? user._id.toString() : `usr_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    user._id = id;
    this.users.set(id, user);
    return user;
  }

  // Department helpers
  getAllDepartments() {
    return Array.from(this.departments.values());
  }

  getDepartmentById(id: string) {
    return this.departments.get(id) || null;
  }

  saveDepartment(dept: any) {
    const id = dept._id ? dept._id.toString() : `dept_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    dept._id = id;
    this.departments.set(id, dept);
    return dept;
  }

  // Complaint helpers
  getAllComplaints() {
    return Array.from(this.complaints.values()).sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  getComplaintById(id: string) {
    // Search by _id or complaintId (e.g. CFA-2026-000124)
    if (this.complaints.has(id)) {
      return this.complaints.get(id);
    }
    for (const c of this.complaints.values()) {
      if (c.complaintId === id) return c;
    }
    return null;
  }

  saveComplaint(complaint: any) {
    const id = complaint._id ? complaint._id.toString() : `cmp_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    complaint._id = id;
    if (!complaint.createdAt) complaint.createdAt = new Date();
    complaint.updatedAt = new Date();
    this.complaints.set(id, complaint);
    return complaint;
  }

  // Updates helpers
  getUpdatesByComplaintId(complaintId: string) {
    return Array.from(this.complaintUpdates.values())
      .filter(u => u.complaintId.toString() === complaintId.toString())
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  saveUpdate(update: any) {
    const id = update._id ? update._id.toString() : `upd_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    update._id = id;
    if (!update.createdAt) update.createdAt = new Date();
    this.complaintUpdates.set(id, update);
    return update;
  }

  // Notification helpers
  getNotificationsByUser(userId: string) {
    return Array.from(this.notifications.values())
      .filter(n => n.userId.toString() === userId.toString())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
  }

  saveNotification(notification: any) {
    const id = notification._id ? notification._id.toString() : `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    notification._id = id;
    if (!notification.createdAt) notification.createdAt = new Date();
    this.notifications.set(id, notification);
    return notification;
  }

  // Duplicate groups
  getAllDuplicateGroups() {
    return Array.from(this.duplicateGroups.values());
  }

  saveDuplicateGroup(group: any) {
    const id = group._id ? group._id.toString() : `dup_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    group._id = id;
    if (!group.createdAt) group.createdAt = new Date();
    this.duplicateGroups.set(id, group);
    return group;
  }

  // Audit Log
  addAuditLog(log: any) {
    log._id = `log_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    log.timestamp = log.timestamp || new Date();
    this.auditLogs.unshift(log);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    return log;
  }
}

let storeInstance: InMemoryStore | null = null;

export const getInMemoryStore = (): InMemoryStore => {
  if (!storeInstance) {
    storeInstance = new InMemoryStore();
  }
  return storeInstance;
};
