const express = require('express');
const { 
  getPages, 
  getPage, 
  createPage, 
  updatePage, 
  deletePage 
} = require('../controllers/contentController');

const router = express.Router();

// City pages routes
router.get('/:cityId', getPages);
router.get('/:cityId/:pageId', getPage);
router.post('/:cityId', createPage);
router.put('/:cityId/:pageId', updatePage);
router.delete('/:cityId/:pageId', deletePage);

module.exports = router;
