const express = require('express');
const router = express.Router();

// Import controllers
const {
  recordAttendance,
  generateAttendanceQR,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceStats
} = require('../controllers/attendanceController');

// Import middleware
const { 
  authenticate, 
  requireProfessor, 
  requireStudent, 
  requireUser 
} = require('../middleware/auth');
const {
  validateMongoId,
  validatePagination
} = require('../middleware/validation');
const { body } = require('express-validator');

// Validation for attendance recording
const validateAttendanceRecord = [
  body('qrCodeData')
    .notEmpty()
    .withMessage('QR code data is required')
    .isJSON()
    .withMessage('QR code data must be valid JSON')
];

// Protected routes (require authentication)
router.use(authenticate);

// Student routes
router.post('/record', requireStudent, validateAttendanceRecord, recordAttendance);
router.get('/my-attendance', requireStudent, getStudentAttendance);

// Professor routes
router.post('/generate-qr/:id', requireProfessor, validateMongoId('id'), generateAttendanceQR);
router.get('/course/:id', requireProfessor, validateMongoId('id'), getCourseAttendance);
router.get('/course/:id/stats', requireProfessor, validateMongoId('id'), getAttendanceStats);

module.exports = router;
