import { Router } from 'express';
import {
  getUserNotifications,
  markNotificationRead,
  markAllNotificationsRead
} from '../controllers/notificationController';
import { authenticateJwt } from '../middleware/authMiddleware';

const router = Router();

router.use(authenticateJwt);

router.get('/', getUserNotifications);
router.patch('/read-all', markAllNotificationsRead);
router.patch('/:id/read', markNotificationRead);

export default router;
