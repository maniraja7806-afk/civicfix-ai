import { Router } from 'express';
import {
  getOfficerAssignments,
  updateComplaintStatusByOfficer,
  submitResolutionEvidence,
  getOfficerStats
} from '../controllers/officerController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

// Protect all officer routes
router.use(authenticateJwt);
router.use(authorizeRoles('officer', 'admin'));

router.get('/assignments', getOfficerAssignments);
router.get('/stats', getOfficerStats);
router.patch('/complaints/:id/status', updateComplaintStatusByOfficer);
router.post('/complaints/:id/evidence', upload.array('evidence', 4), submitResolutionEvidence);

export default router;
