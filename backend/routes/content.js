import express from 'express';
import { getContent, createContent } from '../controllers/contentController.js';

const router = express.Router();

router.get('/:cityId', getContent);
router.post('/', createContent);

export default router;
