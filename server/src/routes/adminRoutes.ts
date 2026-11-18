import { Router } from 'express';
import {
  getAdminOverview,
  getAdminAnalytics,
  assignComplaintByAdmin,
  getDepartments,
  createDepartment,
  updateDepartment,
  getUsers,
  updateUserRole,
  exportComplaintsCSV
} from '../controllers/adminController';
import { authenticateJwt } from '../middleware/authMiddleware';
import { authorizeRoles } from '../middleware/roleMiddleware';

const router = Router();

// Protect all admin routes
router.use(authenticateJwt);
router.use(authorizeRoles('admin'));

router.get('/overview', getAdminOverview);
router.get('/analytics', getAdminAnalytics);
router.post('/assign-complaint', assignComplaintByAdmin);
router.get('/departments', getDepartments);
router.post('/departments', createDepartment);
router.patch('/departments/:id', updateDepartment);
router.get('/users', getUsers);
router.patch('/users/:id/role', updateUserRole);
router.get('/export-csv', exportComplaintsCSV);

export default router;
