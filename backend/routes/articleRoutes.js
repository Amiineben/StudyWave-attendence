const express = require('express');
const router = express.Router();

// Import controllers
const {
  createArticle,
  getAllArticles,
  getArticleById,
  updateArticle,
  deleteArticle,
  getArticlesByCourse,
  getMyArticles,
  likeArticle,
  unlikeArticle,
  addComment
} = require('../controllers/articleController');

// Import middleware
const { 
  authenticate, 
  requireProfessor, 
  requireUser,
  optionalAuth 
} = require('../middleware/auth');
const {
  validateCreateArticle,
  validateUpdateArticle,
  validateMongoId,
  validatePagination
} = require('../middleware/validation');

// Public routes (with optional authentication)
router.get('/', optionalAuth, validatePagination, getAllArticles);
router.get('/:id', optionalAuth, validateMongoId('id'), getArticleById);
router.get('/course/:courseId', optionalAuth, validateMongoId('courseId'), validatePagination, getArticlesByCourse);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

// Article management routes (Professor only)
router.post('/', requireProfessor, validateCreateArticle, createArticle);
router.put('/:id', requireProfessor, validateMongoId('id'), validateUpdateArticle, updateArticle);
router.delete('/:id', requireProfessor, validateMongoId('id'), deleteArticle);

// User interaction routes (Students and Professors)
router.post('/:id/like', requireUser, validateMongoId('id'), likeArticle);
router.delete('/:id/like', requireUser, validateMongoId('id'), unlikeArticle);
router.post('/:id/comments', requireUser, validateMongoId('id'), addComment);

// User-specific routes
router.get('/my/articles', requireUser, validatePagination, getMyArticles);

module.exports = router;
