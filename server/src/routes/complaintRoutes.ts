import { Router } from 'express';
import {
  createComplaint,
  getComplaints,
  getComplaintById,
  updateComplaint,
  deleteComplaint,
  getNearbyComplaints
} from '../controllers/complaintController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Public / Citizen nearby search
router.get('/nearby', getNearbyComplaints);

// List complaints (supports filtering by role/params)
router.get('/', getComplaints);

// Get single complaint by ID or complaintId
router.get('/:id', getComplaintById);

// Protected routes
router.post('/', authenticateJwt, upload.array('images', 5), createComplaint);
router.patch('/:id', authenticateJwt, updateComplaint);
router.delete('/:id', authenticateJwt, deleteComplaint);

export default router;
