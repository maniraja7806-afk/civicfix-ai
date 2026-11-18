import { Router } from 'express';
import { getPublicTransparencyData } from '../controllers/publicController';

const router = Router();

router.get('/transparency', getPublicTransparencyData);

export default router;
