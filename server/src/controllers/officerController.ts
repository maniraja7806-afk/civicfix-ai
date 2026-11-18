import { Response } from 'express';
import { Complaint, IComplaint } from '../models/Complaint';
import { ComplaintUpdate } from '../models/ComplaintUpdate';
import { Notification } from '../models/Notification';
import { AuthRequest } from '../middleware/authMiddleware';
import { saveUploadedFile } from '../services/storageService';
import { emitSocketEvent } from '../sockets/socketHandler';
import { getInMemoryStore } from '../utils/inMemoryStore';
import { logger } from '../utils/logger';

export const getOfficerAssignments = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const officerId = req.user.id;
    const departmentId = req.user.departmentId;

    let assignments: any[] = [];

    try {
      // Find complaints assigned to this officer or this officer's department
      const query: any = {
        $or: [
          { assignedOfficerId: officerId },
          ...(departmentId ? [{ assignedDepartmentId: departmentId }] : [])
        ]
      };

      assignments = await Complaint.find(query)
        .sort({ priority: 1, createdAt: -1 })
        .populate('citizenId', 'name email phone avatar')
        .populate('assignedDepartmentId', 'name code')
        .lean();
    } catch {
      // In-memory lookup
      assignments = getInMemoryStore()
        .getAllComplaints()
        .filter(
          c =>
            c.assignedOfficerId?.toString() === officerId ||
            (departmentId && c.assignedDepartmentId?.toString() === departmentId)
        );
    }

    res.status(200).json({
      success: true,
      count: assignments.length,
      assignments
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaintStatusByOfficer = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { status, comment, rejectionReason } = req.body;

    let complaint: any = null;
    try {
      complaint = await Complaint.findById(id);
    } catch {
      complaint = getInMemoryStore().getComplaintById(id);
    }

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    const previousStatus = complaint.status;
    complaint.status = status;

    if (rejectionReason) {
      complaint.rejectionReason = rejectionReason;
    }

    if (status === 'Assigned' && !complaint.assignedOfficerId) {
      complaint.assignedOfficerId = req.user.id;
    }

    complaint.updatedAt = new Date();

    try {
      await complaint.save();
    } catch {
      getInMemoryStore().saveComplaint(complaint);
    }

    // Record update timeline
    const updateRecord = {
      complaintId: complaint._id,
      updatedBy: req.user.id,
      previousStatus,
      newStatus: status,
      comment: comment || `Status transitioned from ${previousStatus} to ${status} by Officer ${req.user.name}.`,
      actionType: 'status_change',
      createdAt: new Date()
    };

    try {
      await ComplaintUpdate.create(updateRecord);
    } catch {
      getInMemoryStore().saveUpdate(updateRecord);
    }

    // Create notification for citizen
    const notifData = {
      userId: complaint.citizenId,
      title: `Complaint Status Update: ${status}`,
      message: `Your complaint "${complaint.title}" is now marked as "${status}". Note: ${comment || 'Work in progress.'}`,
      type: 'status_update',
      relatedComplaintId: complaint._id,
      isRead: false,
      createdAt: new Date()
    };

    try {
      await Notification.create(notifData);
    } catch {
      getInMemoryStore().saveNotification(notifData);
    }

    emitSocketEvent(`user:${complaint.citizenId}`, 'notification:new', notifData);
    emitSocketEvent(`complaint:${complaint._id}`, 'complaint:status_updated', complaint);
    emitSocketEvent('admin:all', 'complaint:status_updated', complaint);

    res.status(200).json({
      success: true,
      message: `Status successfully updated to ${status}.`,
      complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const submitResolutionEvidence = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { description } = req.body;

    let complaint: any = null;
    try {
      complaint = await Complaint.findById(id);
    } catch {
      complaint = getInMemoryStore().getComplaintById(id);
    }

    if (!complaint) {
      res.status(404).json({ success: false, message: 'Complaint not found.' });
      return;
    }

    // Process resolution evidence photos
    const evidenceImageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await saveUploadedFile(file as Express.Multer.File);
        evidenceImageUrls.push(url);
      }
    }

    complaint.resolutionEvidence = {
      images: evidenceImageUrls,
      description: description || 'Field repairs completed according to municipal standards.',
      resolvedAt: new Date(),
      resolvedBy: req.user.id
    };

    const previousStatus = complaint.status;
    complaint.status = 'Resolved';
    complaint.updatedAt = new Date();

    try {
      await complaint.save();
    } catch {
      getInMemoryStore().saveComplaint(complaint);
    }

    // Create update timeline
    const updateRecord = {
      complaintId: complaint._id,
      updatedBy: req.user.id,
      previousStatus,
      newStatus: 'Resolved',
      comment: `Resolution evidence submitted by ${req.user.name}: "${description || 'Resolved'}". Awaiting citizen verification.`,
      evidenceImages: evidenceImageUrls,
      actionType: 'evidence_upload',
      createdAt: new Date()
    };

    try {
      await ComplaintUpdate.create(updateRecord);
    } catch {
      getInMemoryStore().saveUpdate(updateRecord);
    }

    // Notify citizen to verify resolution
    const notifData = {
      userId: complaint.citizenId,
      title: 'Civic Issue Resolved - Please Verify',
      message: `Officer ${req.user.name} has completed the resolution for "${complaint.title}". Please inspect and confirm resolution.`,
      type: 'resolution',
      relatedComplaintId: complaint._id,
      isRead: false,
      createdAt: new Date()
    };

    try {
      await Notification.create(notifData);
    } catch {
      getInMemoryStore().saveNotification(notifData);
    }

    emitSocketEvent(`user:${complaint.citizenId}`, 'notification:new', notifData);
    emitSocketEvent(`complaint:${complaint._id}`, 'complaint:status_updated', complaint);
    emitSocketEvent('admin:all', 'complaint:status_updated', complaint);

    res.status(200).json({
      success: true,
      message: 'Resolution evidence uploaded. Complaint marked as Resolved.',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getOfficerStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const officerId = req.user.id;
    let list: any[] = [];

    try {
      list = await Complaint.find({
        $or: [{ assignedOfficerId: officerId }, { assignedDepartmentId: req.user.departmentId }]
      }).lean();
    } catch {
      list = getInMemoryStore()
        .getAllComplaints()
        .filter(
          c =>
            c.assignedOfficerId?.toString() === officerId ||
            (req.user?.departmentId && c.assignedDepartmentId?.toString() === req.user.departmentId)
        );
    }

    const total = list.length;
    const assigned = list.filter(c => c.status === 'Assigned' || c.status === 'Under Review').length;
    const inProgress = list.filter(c => c.status === 'In Progress').length;
    const resolved = list.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const critical = list.filter(c => c.priority === 'Critical' && c.status !== 'Resolved' && c.status !== 'Closed').length;

    res.status(200).json({
      success: true,
      stats: {
        total,
        assigned,
        inProgress,
        resolved,
        critical,
        resolutionRate: total > 0 ? Math.round((resolved / total) * 100) : 0
      }
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
