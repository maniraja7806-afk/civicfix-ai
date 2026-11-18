import { Request, Response } from 'express';
import { Complaint, IComplaint } from '../models/Complaint';
import { ComplaintUpdate } from '../models/ComplaintUpdate';
import { Notification } from '../models/Notification';
import { DuplicateGroup } from '../models/DuplicateGroup';
import { Department } from '../models/Department';
import { User } from '../models/User';
import { AuthRequest } from '../middleware/authMiddleware';
import { createComplaintSchema, citizenFeedbackSchema } from '../validators/schemaValidators';
import { calculateComplaintPriority } from '../services/priorityEngine';
import { detectDuplicates } from '../services/duplicateDetectionService';
import { recommendDepartment } from '../services/departmentAssignmentService';
import { saveUploadedFile } from '../services/storageService';
import { emitSocketEvent } from '../sockets/socketHandler';
import { getInMemoryStore } from '../utils/inMemoryStore';
import { logger } from '../utils/logger';

// Helper to generate unique complaint ID
let complaintSequence = 124;
const generateComplaintId = (): string => {
  complaintSequence++;
  const year = new Date().getFullYear();
  const seqStr = String(complaintSequence).padStart(6, '0');
  return `CFA-${year}-${seqStr}`;
};

export const createComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const {
      title,
      description,
      category,
      latitude,
      longitude,
      address,
      landmark,
      reportedPriority,
      aiAnalysisData
    } = req.body;

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum)) {
      res.status(400).json({ success: false, message: 'Valid latitude and longitude are required' });
      return;
    }

    // Process uploaded images
    const imageUrls: string[] = [];
    if (req.files && Array.isArray(req.files)) {
      for (const file of req.files) {
        const url = await saveUploadedFile(file as Express.Multer.File);
        imageUrls.push(url);
      }
    }

    // Parse AI Analysis if passed as JSON string
    let parsedAiAnalysis: any = undefined;
    if (aiAnalysisData) {
      try {
        parsedAiAnalysis = typeof aiAnalysisData === 'string' ? JSON.parse(aiAnalysisData) : aiAnalysisData;
      } catch (e) {
        logger.warn('Failed to parse aiAnalysisData JSON');
      }
    }

    // Run duplicate detection
    const duplicateMatches = await detectDuplicates({
      category,
      title,
      description,
      latitude: latNum,
      longitude: lngNum,
      maxDistanceMeters: 200
    });

    const nearbyCount = duplicateMatches.length;

    // Run AI Priority Engine
    const priorityEval = calculateComplaintPriority({
      category,
      title,
      description,
      landmark,
      address,
      nearbyReportCount: nearbyCount,
      reportedSeverity: reportedPriority
    });

    // Recommend Department & Officer
    const deptRecommendation = await recommendDepartment(category, title, description);

    const complaintId = generateComplaintId();

    const complaintData: any = {
      complaintId,
      citizenId: req.user.id,
      title,
      description,
      category,
      images: imageUrls,
      location: {
        type: 'Point',
        coordinates: [lngNum, latNum]
      },
      address,
      landmark: landmark || '',
      priority: priorityEval.priority,
      priorityReason: priorityEval.reason,
      priorityScore: priorityEval.score,
      priorityFactors: priorityEval.factors,
      status: 'Submitted',
      assignedDepartmentId: deptRecommendation ? deptRecommendation.departmentId : undefined,
      assignedOfficerId: deptRecommendation?.suggestedOfficerId || undefined,
      aiAnalysis: parsedAiAnalysis || {
        isAiGenerated: false
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };

    let savedComplaint: any;

    try {
      savedComplaint = await Complaint.create(complaintData);
    } catch (dbErr) {
      // In-memory fallback
      savedComplaint = getInMemoryStore().saveComplaint(complaintData);
    }

    // If duplicate match detected, create or link a DuplicateGroup
    if (duplicateMatches.length > 0 && duplicateMatches[0].isLikelyDuplicate) {
      const topMatch = duplicateMatches[0];
      const dupGroupData = {
        primaryComplaintId: topMatch.existingComplaintId,
        complaintIds: [topMatch.existingComplaintId, savedComplaint._id],
        similarityScore: topMatch.combinedConfidence,
        geographicalDistance: topMatch.distanceMeters,
        status: 'suggested',
        reviewNotes: `Automated detection: ${topMatch.distanceMeters}m proximity with ${topMatch.textSimilarity}% semantic token similarity.`
      };

      try {
        const dupGroup = await DuplicateGroup.create(dupGroupData);
        savedComplaint.duplicateGroupId = dupGroup._id;
        await savedComplaint.save();
      } catch {
        const dupGroup = getInMemoryStore().saveDuplicateGroup(dupGroupData);
        savedComplaint.duplicateGroupId = dupGroup._id;
      }

      // Notify officer & admin about potential duplicate
      emitSocketEvent('admin:all', 'duplicate:detected', {
        complaintId: savedComplaint.complaintId,
        originalId: topMatch.complaintRef.complaintId,
        distanceMeters: topMatch.distanceMeters,
        confidence: topMatch.combinedConfidence
      });
    }

    // Create initial timeline record
    const updateData = {
      complaintId: savedComplaint._id,
      updatedBy: req.user.id,
      previousStatus: 'Submitted',
      newStatus: 'Submitted',
      comment: `Complaint registered by citizen ${req.user.name}. Priority assigned as ${priorityEval.priority} by AI Priority Engine. Department assigned to ${deptRecommendation?.departmentName || 'General Administration'}.`,
      actionType: 'status_change',
      createdAt: new Date()
    };

    try {
      await ComplaintUpdate.create(updateData);
    } catch {
      getInMemoryStore().saveUpdate(updateData);
    }

    // Create citizen confirmation notification
    const notifData = {
      userId: req.user.id,
      title: 'Complaint Registered Successfully',
      message: `Your report "${title}" has been registered with ID ${complaintId}. Priority: ${priorityEval.priority}. Assigned to ${deptRecommendation?.departmentName || 'Department'}.`,
      type: 'status_update',
      relatedComplaintId: savedComplaint._id,
      isRead: false,
      createdAt: new Date()
    };

    try {
      await Notification.create(notifData);
    } catch {
      getInMemoryStore().saveNotification(notifData);
    }

    // Real-time socket events
    emitSocketEvent(`user:${req.user.id}`, 'notification:new', notifData);
    emitSocketEvent('admin:all', 'complaint:created', savedComplaint);
    if (deptRecommendation?.departmentId) {
      emitSocketEvent(`dept:${deptRecommendation.departmentId}`, 'complaint:created', savedComplaint);
    }

    res.status(201).json({
      success: true,
      message: 'Complaint reported successfully.',
      complaint: savedComplaint,
      duplicateWarning: duplicateMatches.length > 0 && duplicateMatches[0].isLikelyDuplicate ? {
        message: 'A similar civic issue was previously reported in this immediate area.',
        distanceMeters: duplicateMatches[0].distanceMeters,
        existingComplaint: duplicateMatches[0].complaintRef
      } : null
    });
  } catch (error: any) {
    logger.error('Error creating complaint:', error);
    res.status(500).json({ success: false, message: error.message || 'Failed to submit complaint' });
  }
};

export const getComplaints = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const {
      category,
      status,
      priority,
      citizenId,
      departmentId,
      officerId,
      search,
      page = '1',
      limit = '20'
    } = req.query;

    const pageNum = parseInt(page as string, 10) || 1;
    const limitNum = parseInt(limit as string, 10) || 20;

    let complaintsList: any[] = [];
    let totalCount = 0;

    try {
      const filter: any = {};
      if (category) filter.category = category;
      if (status) filter.status = status;
      if (priority) filter.priority = priority;
      if (citizenId) filter.citizenId = citizenId;
      if (departmentId) filter.assignedDepartmentId = departmentId;
      if (officerId) filter.assignedOfficerId = officerId;
      if (search) {
        filter.$or = [
          { title: { $regex: search, $options: 'i' } },
          { description: { $regex: search, $options: 'i' } },
          { complaintId: { $regex: search, $options: 'i' } },
          { address: { $regex: search, $options: 'i' } }
        ];
      }

      totalCount = await Complaint.countDocuments(filter);
      complaintsList = await Complaint.find(filter)
        .sort({ createdAt: -1 })
        .skip((pageNum - 1) * limitNum)
        .limit(limitNum)
        .populate('citizenId', 'name email phone avatar')
        .populate('assignedDepartmentId', 'name code')
        .populate('assignedOfficerId', 'name email phone designation')
        .lean();
    } catch {
      // In-memory fallback
      let all = getInMemoryStore().getAllComplaints();

      if (category) all = all.filter(c => c.category === category);
      if (status) all = all.filter(c => c.status === status);
      if (priority) all = all.filter(c => c.priority === priority);
      if (citizenId) all = all.filter(c => c.citizenId?.toString() === citizenId);
      if (departmentId) all = all.filter(c => c.assignedDepartmentId?.toString() === departmentId);
      if (officerId) all = all.filter(c => c.assignedOfficerId?.toString() === officerId);
      if (search) {
        const s = (search as string).toLowerCase();
        all = all.filter(
          c =>
            c.title.toLowerCase().includes(s) ||
            c.description.toLowerCase().includes(s) ||
            c.complaintId.toLowerCase().includes(s) ||
            c.address.toLowerCase().includes(s)
        );
      }

      totalCount = all.length;
      complaintsList = all.slice((pageNum - 1) * limitNum, pageNum * limitNum);
    }

    res.status(200).json({
      success: true,
      count: complaintsList.length,
      totalCount,
      page: pageNum,
      totalPages: Math.ceil(totalCount / limitNum),
      complaints: complaintsList
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getComplaintById = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

    let complaint: any = null;
    let updates: any[] = [];
    let duplicateGroup: any = null;

    try {
      complaint = await Complaint.findOne({
        $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { complaintId: id }]
      })
        .populate('citizenId', 'name email phone avatar')
        .populate('assignedDepartmentId', 'name code description contactEmail contactPhone headOfficerName')
        .populate('assignedOfficerId', 'name email phone designation avatar')
        .lean();

      if (complaint) {
        updates = await ComplaintUpdate.find({ complaintId: complaint._id })
          .sort({ createdAt: 1 })
          .populate('updatedBy', 'name role designation avatar')
          .lean();

        if (complaint.duplicateGroupId) {
          duplicateGroup = await DuplicateGroup.findById(complaint.duplicateGroupId)
            .populate('complaintIds', 'complaintId title status priority')
            .lean();
        }
      }
    } catch {
      // In-memory lookup
      complaint = getInMemoryStore().getComplaintById(id);
      if (complaint) {
        updates = getInMemoryStore().getUpdatesByComplaintId(complaint._id);
        if (complaint.duplicateGroupId) {
          duplicateGroup = getInMemoryStore().duplicateGroups.get(complaint.duplicateGroupId.toString());
        }
      }
    }

    if (!complaint) {
      res.status(404).json({ success: false, message: `Complaint ${id} not found.` });
      return;
    }

    res.status(200).json({
      success: true,
      complaint,
      timeline: updates,
      duplicateGroup
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const { title, description, landmark, address, citizenFeedback } = req.body;

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

    // Role check: Only the citizen owner or admin can edit basic details
    if (complaint.citizenId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Unauthorized to edit this complaint.' });
      return;
    }

    if (title) complaint.title = title;
    if (description) complaint.description = description;
    if (landmark !== undefined) complaint.landmark = landmark;
    if (address) complaint.address = address;

    // Handle citizen resolution verification & feedback
    if (citizenFeedback) {
      const { rating, comment, isSatisfied } = citizenFeedback;
      complaint.citizenFeedback = {
        rating,
        comment,
        isSatisfied,
        verifiedAt: new Date()
      };

      if (isSatisfied) {
        complaint.status = 'Closed';
      } else {
        complaint.status = 'Reopened';
        complaint.reopenReason = comment || 'Citizen indicated dissatisfaction with resolution quality.';
      }

      // Record update timeline
      const updateRecord = {
        complaintId: complaint._id,
        updatedBy: req.user.id,
        previousStatus: isSatisfied ? 'Resolved' : 'Resolved',
        newStatus: complaint.status,
        comment: isSatisfied
          ? `Citizen confirmed resolution with ${rating}/5 rating: "${comment || 'Satisfied'}"`
          : `Citizen reopened complaint: "${comment || 'Issue not resolved properly'}"`,
        actionType: 'citizen_feedback',
        createdAt: new Date()
      };

      try {
        await ComplaintUpdate.create(updateRecord);
      } catch {
        getInMemoryStore().saveUpdate(updateRecord);
      }

      // Notify officer and admin
      if (complaint.assignedOfficerId) {
        const notifData = {
          userId: complaint.assignedOfficerId,
          title: isSatisfied ? 'Resolution Confirmed by Citizen' : 'Complaint Reopened by Citizen',
          message: `Complaint ${complaint.complaintId} was marked as ${complaint.status}. Rating: ${rating}/5.`,
          type: isSatisfied ? 'resolution' : 'reopened',
          relatedComplaintId: complaint._id,
          isRead: false,
          createdAt: new Date()
        };
        try {
          await Notification.create(notifData);
        } catch {
          getInMemoryStore().saveNotification(notifData);
        }
        emitSocketEvent(`user:${complaint.assignedOfficerId}`, 'notification:new', notifData);
      }
    }

    complaint.updatedAt = new Date();

    try {
      await complaint.save();
    } catch {
      getInMemoryStore().saveComplaint(complaint);
    }

    emitSocketEvent(`complaint:${complaint._id}`, 'complaint:status_updated', complaint);
    emitSocketEvent('admin:all', 'complaint:status_updated', complaint);

    res.status(200).json({
      success: true,
      message: 'Complaint updated successfully.',
      complaint
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteComplaint = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;

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

    // Only owner or admin
    if (complaint.citizenId.toString() !== req.user.id && req.user.role !== 'admin') {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this complaint.' });
      return;
    }

    try {
      await Complaint.findByIdAndDelete(id);
    } catch {
      getInMemoryStore().complaints.delete(id);
    }

    res.status(200).json({ success: true, message: 'Complaint deleted successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getNearbyComplaints = async (req: Request, res: Response): Promise<void> => {
  try {
    const { lat, lng, radiusKm = '5' } = req.query;

    const latNum = parseFloat(lat as string);
    const lngNum = parseFloat(lng as string);
    const radiusNum = parseFloat(radiusKm as string);

    if (isNaN(latNum) || isNaN(lngNum)) {
      res.status(400).json({ success: false, message: 'Valid lat and lng query params are required.' });
      return;
    }

    const radiusMeters = radiusNum * 1000;

    let nearby: any[] = [];

    try {
      // MongoDB Geospatial $near query
      nearby = await Complaint.find({
        location: {
          $near: {
            $geometry: {
              type: 'Point',
              coordinates: [lngNum, latNum]
            },
            $maxDistance: radiusMeters
          }
        }
      })
        .populate('assignedDepartmentId', 'name code')
        .limit(50)
        .lean();
    } catch {
      // In-memory geospatial calculation
      const all = getInMemoryStore().getAllComplaints();
      const R = 6371e3; // meters

      nearby = all
        .map(c => {
          if (!c.location || !c.location.coordinates) return null;
          const [cLng, cLat] = c.location.coordinates;
          const phi1 = (latNum * Math.PI) / 180;
          const phi2 = (cLat * Math.PI) / 180;
          const dPhi = ((cLat - latNum) * Math.PI) / 180;
          const dLam = ((cLng - lngNum) * Math.PI) / 180;
          const a =
            Math.sin(dPhi / 2) * Math.sin(dPhi / 2) +
            Math.cos(phi1) * Math.cos(phi2) * Math.sin(dLam / 2) * Math.sin(dLam / 2);
          const dist = R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

          return { ...c, distanceMeters: Math.round(dist) };
        })
        .filter((c: any) => c !== null && c.distanceMeters <= radiusMeters)
        .sort((a: any, b: any) => a.distanceMeters - b.distanceMeters)
        .slice(0, 50);
    }

    res.status(200).json({
      success: true,
      count: nearby.length,
      complaints: nearby
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
