import { Request, Response } from 'express';
import { Complaint } from '../models/Complaint';
import { Department } from '../models/Department';
import { getInMemoryStore } from '../utils/inMemoryStore';

export const getPublicTransparencyData = async (_req: Request, res: Response): Promise<void> => {
  try {
    let complaints: any[] = [];
    let departments: any[] = [];

    try {
      complaints = await Complaint.find().populate('assignedDepartmentId', 'name code').lean();
      departments = await Department.find().lean();
    } catch {
      complaints = getInMemoryStore().getAllComplaints();
      departments = getInMemoryStore().getAllDepartments();
    }

    const totalReported = complaints.length;
    const totalResolved = complaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
    const inProgress = complaints.filter(c => c.status === 'In Progress').length;
    const resolutionPercentage = totalReported > 0 ? Math.round((totalResolved / totalReported) * 100) : 0;

    // Categories
    const categoryCounts: Record<string, number> = {};
    complaints.forEach(c => {
      categoryCounts[c.category] = (categoryCounts[c.category] || 0) + 1;
    });

    const topCategories = Object.keys(categoryCounts)
      .map(k => ({ category: k, count: categoryCounts[k] }))
      .sort((a, b) => b.count - a.count);

    // Public sanitized complaints for map (No citizen personal information!)
    const publicMapComplaints = complaints.map(c => ({
      _id: c._id,
      complaintId: c.complaintId,
      title: c.title,
      category: c.category,
      priority: c.priority,
      status: c.status,
      address: c.address,
      landmark: c.landmark,
      location: c.location,
      images: c.images || [],
      resolutionEvidence: c.resolutionEvidence,
      createdAt: c.createdAt,
      departmentName: c.assignedDepartmentId?.name || 'Municipal Corporation'
    }));

    // Department scorecard
    const departmentScorecard = departments.map(d => {
      const deptComplaints = complaints.filter(c => c.assignedDepartmentId?._id?.toString() === d._id?.toString() || c.assignedDepartmentId?.toString() === d._id?.toString());
      const total = deptComplaints.length;
      const resolved = deptComplaints.filter(c => c.status === 'Resolved' || c.status === 'Closed').length;
      return {
        name: d.name,
        code: d.code,
        total,
        resolved,
        rate: total > 0 ? Math.round((resolved / total) * 100) : 100
      };
    });

    res.status(200).json({
      success: true,
      metrics: {
        totalReported,
        totalResolved,
        inProgress,
        resolutionPercentage,
        avgResolutionHours: 28
      },
      topCategories,
      departmentScorecard,
      publicMapComplaints
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
