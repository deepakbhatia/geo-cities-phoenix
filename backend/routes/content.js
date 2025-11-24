import express from 'express';
import { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage 
} from '../controllers/contentController.js';

const router = express.Router();

// City pages routes
router.get('/:cityId', getPages);
router.get('/:cityId/:pageId', getPage);
router.post('/:cityId', createPage);
router.put('/:cityId/:pageId', updatePage);
router.delete('/:cityId/:pageId', deletePage);

export default router;
