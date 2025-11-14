import express from 'express';
import { generatePublicSquare, generateNewsletter, generateRadio } from '../controllers/aiController.js';

const router = express.Router();

// POST /api/ai/public-square/:cityId
router.post('/public-square/:cityId', generatePublicSquare);

// POST /api/ai/newsletter/:cityId
router.post('/newsletter/:cityId', generateNewsletter);

// POST /api/ai/radio/:cityId
router.post('/radio/:cityId', generateRadio);

export default router;
