import express from 'express';
import { getCities, getCity, createCity } from '../controllers/cityController.js';

const router = express.Router();

router.get('/', getCities);
router.get('/:id', getCity);
router.post('/', createCity);

export default router;
