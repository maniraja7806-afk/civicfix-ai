import { Request, Response } from 'express';
import { analyzeCivicImage } from '../services/geminiService';
import { calculateComplaintPriority } from '../services/priorityEngine';
import { detectDuplicates } from '../services/duplicateDetectionService';
import { recommendDepartment } from '../services/departmentAssignmentService';
import { logger } from '../utils/logger';

export const analyzeImageEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ success: false, message: 'Please upload an image file to analyze.' });
      return;
    }

    const { userNotes } = req.body;
    const analysis = await analyzeCivicImage(req.file.path, req.file.mimetype, userNotes);

    res.status(200).json({
      success: true,
      message: 'Image analyzed successfully by CivicFix AI.',
      analysis
    });
  } catch (error: any) {
    logger.error('Error in AI Image Analysis endpoint:', error);
    res.status(500).json({ success: false, message: error.message || 'AI analysis failed' });
  }
};

export const classifyComplaintEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, title, description, landmark, address, nearbyReportCount, reportedSeverity } = req.body;

    if (!category || !title) {
      res.status(400).json({ success: false, message: 'Category and title are required for classification.' });
      return;
    }

    const priorityResult = calculateComplaintPriority({
      category,
      title,
      description: description || '',
      landmark,
      address: address || '',
      nearbyReportCount: nearbyReportCount || 0,
      reportedSeverity
    });

    res.status(200).json({
      success: true,
      priority: priorityResult.priority,
      score: priorityResult.score,
      reason: priorityResult.reason,
      factors: priorityResult.factors
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const detectDuplicatesEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, title, description, latitude, longitude, excludeId, maxDistanceMeters } = req.body;

    const latNum = parseFloat(latitude);
    const lngNum = parseFloat(longitude);

    if (isNaN(latNum) || isNaN(lngNum) || !category) {
      res.status(400).json({ success: false, message: 'Valid category, latitude, and longitude are required.' });
      return;
    }

    const matches = await detectDuplicates({
      category,
      title: title || '',
      description: description || '',
      latitude: latNum,
      longitude: lngNum,
      excludeId,
      maxDistanceMeters: maxDistanceMeters ? parseFloat(maxDistanceMeters) : 200
    });

    res.status(200).json({
      success: true,
      count: matches.length,
      hasDuplicates: matches.length > 0 && matches[0].isLikelyDuplicate,
      duplicates: matches
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const suggestDepartmentEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { category, title, description } = req.body;

    if (!category) {
      res.status(400).json({ success: false, message: 'Category is required for department recommendation.' });
      return;
    }

    const recommendation = await recommendDepartment(category, title || '', description || '');

    if (!recommendation) {
      res.status(404).json({ success: false, message: 'No suitable department found.' });
      return;
    }

    res.status(200).json({
      success: true,
      recommendation
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
