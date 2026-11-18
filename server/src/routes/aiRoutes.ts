import { Router } from 'express';
import {
  analyzeImageEndpoint,
  classifyComplaintEndpoint,
  detectDuplicatesEndpoint,
  suggestDepartmentEndpoint
} from '../controllers/aiController';
import { upload } from '../middleware/uploadMiddleware';

const router = Router();

router.post('/analyze-image', upload.single('image'), analyzeImageEndpoint);
router.post('/classify-complaint', classifyComplaintEndpoint);
router.post('/detect-duplicates', detectDuplicatesEndpoint);
router.post('/suggest-department', suggestDepartmentEndpoint);

export default router;
