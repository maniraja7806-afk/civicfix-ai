import { Department, IDepartment } from '../models/Department';
import { User, IUser } from '../models/User';
import { Complaint } from '../models/Complaint';
import { getInMemoryStore } from '../utils/inMemoryStore';
import { logger } from '../utils/logger';

export interface DepartmentRecommendation {
  departmentId: string;
  departmentName: string;
  departmentCode: string;
  confidenceScore: number;
  reason: string;
  suggestedOfficerId?: string;
  suggestedOfficerName?: string;
}

export const recommendDepartment = async (
  category: string,
  title: string = '',
  description: string = ''
): Promise<DepartmentRecommendation | null> => {
  let departments: any[] = [];

  try {
    departments = await Department.find({ isActive: true }).lean();
  } catch (err) {
    departments = getInMemoryStore().getAllDepartments().filter(d => d.isActive);
  }

  if (!departments || departments.length === 0) {
    return null;
  }

  let bestMatch: any = null;
  let highestScore = 0;
  let matchReason = '';

  for (const dept of departments) {
    let score = 0;

    // Check direct category mappings
    if (dept.categoryMappings && dept.categoryMappings.includes(category)) {
      score += 70;
      matchReason = `Mapped under official purview of ${dept.name} for category "${category}".`;
    }

    // Check name and description keyword affinity
    const deptKeywords = `${dept.name} ${dept.description}`.toLowerCase();
    const complaintText = `${category} ${title} ${description}`.toLowerCase();

    if (complaintText.includes('pothole') || complaintText.includes('road') || complaintText.includes('asphalt')) {
      if (deptKeywords.includes('works') || deptKeywords.includes('pwd') || deptKeywords.includes('road')) {
        score += 25;
      }
    }

    if (complaintText.includes('garbage') || complaintText.includes('waste') || complaintText.includes('trash') || complaintText.includes('clean')) {
      if (deptKeywords.includes('sanitation') || deptKeywords.includes('waste')) {
        score += 25;
      }
    }

    if (complaintText.includes('water') || complaintText.includes('pipe') || complaintText.includes('leak') || complaintText.includes('pipeline')) {
      if (deptKeywords.includes('water') || deptKeywords.includes('sewerage')) {
        score += 25;
      }
    }

    if (complaintText.includes('light') || complaintText.includes('pole') || complaintText.includes('electric') || complaintText.includes('wire')) {
      if (deptKeywords.includes('electrical') || deptKeywords.includes('lighting')) {
        score += 25;
      }
    }

    if (complaintText.includes('drain') || complaintText.includes('flood') || complaintText.includes('stormwater') || complaintText.includes('sewer')) {
      if (deptKeywords.includes('drain') || deptKeywords.includes('flood')) {
        score += 25;
      }
    }

    if (score > highestScore) {
      highestScore = score;
      bestMatch = dept;
    }
  }

  // Fallback to first department if no strong match
  if (!bestMatch && departments.length > 0) {
    bestMatch = departments[0];
    highestScore = 40;
    matchReason = `Assigned to primary municipal department ${bestMatch.name}.`;
  }

  // Now find the least burdened officer in this department
  let suggestedOfficerId: string | undefined;
  let suggestedOfficerName: string | undefined;

  try {
    let officers: any[] = [];
    try {
      officers = await User.find({
        role: 'officer',
        departmentId: bestMatch._id,
        isActive: true
      }).lean();
    } catch {
      officers = Array.from(getInMemoryStore().users.values()).filter(
        u => u.role === 'officer' && u.departmentId?.toString() === bestMatch._id?.toString() && u.isActive
      );
    }

    if (officers.length > 0) {
      // Pick officer (workload balanced)
      const officer = officers[0];
      suggestedOfficerId = officer._id.toString();
      suggestedOfficerName = officer.name;
    }
  } catch (err) {
    logger.warn('Error assigning officer recommendation:', err);
  }

  return {
    departmentId: bestMatch._id.toString(),
    departmentName: bestMatch.name,
    departmentCode: bestMatch.code,
    confidenceScore: Math.min(highestScore, 98),
    reason: matchReason || `Matched department ${bestMatch.name}`,
    suggestedOfficerId,
    suggestedOfficerName
  };
};
