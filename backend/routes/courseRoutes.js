const express = require('express');
const router = express.Router();

// Import controllers
const {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  dropStudent,
  getCoursesByProfessor,
  getMyCourses
} = require('../controllers/courseController');

// Import middleware
const { 
  authenticate, 
  requireProfessor, 
  requireStudent, 
  requireUser,
  optionalAuth 
} = require('../middleware/auth');
const {
  validateCreateCourse,
  validateUpdateCourse,
  validateMongoId,
  validatePagination
} = require('../middleware/validation');

// Public routes (with optional authentication)
router.get('/', optionalAuth, validatePagination, getAllCourses);
router.get('/:id', optionalAuth, validateMongoId('id'), getCourseById);
router.get('/professor/:professorId', validateMongoId('professorId'), validatePagination, getCoursesByProfessor);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

// Course management routes (Professor only)
router.post('/', requireProfessor, validateCreateCourse, createCourse);
router.put('/:id', requireProfessor, validateMongoId('id'), validateUpdateCourse, updateCourse);
router.delete('/:id', requireProfessor, validateMongoId('id'), deleteCourse);

// Student enrollment routes
router.post('/:id/enroll', requireStudent, validateMongoId('id'), enrollStudent);
router.post('/:id/drop', requireStudent, validateMongoId('id'), dropStudent);

// User-specific routes
router.get('/my/courses', requireUser, validatePagination, getMyCourses);

module.exports = router;
