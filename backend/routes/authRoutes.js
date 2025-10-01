const express = require('express');
const router = express.Router();

// Import controllers
const {
  register,
  login,
  getProfile,
  updateProfile,
  changePassword,
  logout,
  getAllUsers,
  verifyToken
} = require('../controllers/authController');

// Import middleware
const { 
  authenticate, 
  requireProfessor, 
  requireStudent,
  requireAdmin
} = require('../middleware/auth');
const {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  validatePagination
} = require('../middleware/validation');

// Public routes
router.post('/register', validateRegister, register);
router.post('/login', validateLogin, login);

// Protected routes (require authentication)
router.use(authenticate); // All routes below require authentication

// User profile routes
router.get('/profile', getProfile);
router.put('/profile', validateUpdateProfile, updateProfile);
router.put('/change-password', validateChangePassword, changePassword);
router.post('/logout', logout);
router.get('/verify-token', verifyToken);

// Admin routes
router.get('/users', requireAdmin, validatePagination, getAllUsers);

module.exports = router;
