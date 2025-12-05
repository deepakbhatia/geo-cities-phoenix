const express = require('express');
const { generatePublicSquare, generateNewsletter, generateRadio, getCachedContent } = require('../controllers/aiController');

const router = express.Router();

// GET /api/ai/cached/:cityId - Get all cached AI content for a city
router.get('/cached/:cityId', getCachedContent);

// POST /api/ai/public-square/:cityId
router.post('/public-square/:cityId', generatePublicSquare);

// POST /api/ai/newsletter/:cityId
router.post('/newsletter/:cityId', generateNewsletter);

// POST /api/ai/radio/:cityId
router.post('/radio/:cityId', generateRadio);

module.exports = router;
