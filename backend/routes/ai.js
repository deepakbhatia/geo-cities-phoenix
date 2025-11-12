import express from 'express';
import { generatePublicSquare, generateNewsletter, generateRadio } from '../controllers/aiController.js';

const router = express.Router();

router.post('/public-square/:cityId', generatePublicSquare);
router.post('/newsletter/:cityId', generateNewsletter);
router.post('/radio/:cityId', generateRadio);

export default router;
