const { body, param, query } = require('express-validator');

// User validation rules
const validateRegister = [
  body('name')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .isLength({ min: 6 })
    .withMessage('Password must be at least 6 characters long'),
  body('role')
    .optional()
    .isIn(['student', 'professor', 'admin'])
    .withMessage('Role must be student, professor, or admin')
];

const validateLogin = [
  body('email')
    .isEmail()
    .normalizeEmail()
    .withMessage('Please provide a valid email'),
  body('password')
    .notEmpty()
    .withMessage('Password is required')
];

const validateUpdateProfile = [
  body('name')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Name must be between 2 and 100 characters'),
  body('avatar')
    .optional()
    .isURL()
    .withMessage('Avatar must be a valid URL'),
  body('phone')
    .optional()
    .isMobilePhone()
    .withMessage('Please provide a valid phone number'),
  body('studentId')
    .optional()
    .trim()
    .isLength({ min: 1, max: 20 })
    .withMessage('Student ID must be between 1 and 20 characters'),
  body('major')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Major must be between 1 and 100 characters'),
  body('year')
    .optional()
    .trim()
    .isLength({ min: 1, max: 10 })
    .withMessage('Year must be between 1 and 10 characters'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Department must be between 1 and 100 characters'),
  body('jobTitle')
    .optional()
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Job title must be between 1 and 100 characters'),
  body('office')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Office must be between 1 and 50 characters')
];

const validateChangePassword = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Current password is required'),
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('New password must be at least 6 characters long')
];

// Course validation rules
const validateCreateCourse = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  body('courseCode')
    .trim()
    .matches(/^[A-Z]{2,4}[0-9]{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
  body('department')
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('credits')
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('semester')
    .isIn(['Fall', 'Spring', 'Summer', 'Winter'])
    .withMessage('Semester must be Fall, Spring, Summer, or Winter'),
  body('year')
    .isInt({ min: 2020, max: new Date().getFullYear() + 5 })
    .withMessage('Year must be between 2020 and 5 years in the future'),
  body('capacity')
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity must be between 1 and 500'),
  body('schedule.days')
    .optional()
    .isArray()
    .withMessage('Schedule days must be an array'),
  body('schedule.days.*')
    .optional()
    .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'])
    .withMessage('Invalid day of week'),
  body('schedule.startTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('Start time must be in HH:MM format'),
  body('schedule.endTime')
    .optional()
    .matches(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/)
    .withMessage('End time must be in HH:MM format'),
  body('schedule.room')
    .optional()
    .trim()
    .isLength({ max: 50 })
    .withMessage('Room must not exceed 50 characters'),
  body('prerequisites')
    .optional()
    .isArray()
    .withMessage('Prerequisites must be an array'),
  body('syllabus')
    .optional()
    .trim()
    .isLength({ max: 5000 })
    .withMessage('Syllabus must not exceed 5000 characters'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

const validateUpdateCourse = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Course title must be between 3 and 200 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ min: 10, max: 2000 })
    .withMessage('Course description must be between 10 and 2000 characters'),
  body('courseCode')
    .optional()
    .trim()
    .matches(/^[A-Z]{2,4}[0-9]{3,4}$/)
    .withMessage('Course code must be in format like CS101 or MATH1001'),
  body('department')
    .optional()
    .trim()
    .isLength({ min: 2, max: 100 })
    .withMessage('Department must be between 2 and 100 characters'),
  body('credits')
    .optional()
    .isInt({ min: 1, max: 10 })
    .withMessage('Credits must be between 1 and 10'),
  body('semester')
    .optional()
    .isIn(['Fall', 'Spring', 'Summer', 'Winter'])
    .withMessage('Semester must be Fall, Spring, Summer, or Winter'),
  body('year')
    .optional()
    .isInt({ min: 2020, max: new Date().getFullYear() + 5 })
    .withMessage('Year must be between 2020 and 5 years in the future'),
  body('capacity')
    .optional()
    .isInt({ min: 1, max: 500 })
    .withMessage('Capacity must be between 1 and 500'),
  body('isPublished')
    .optional()
    .isBoolean()
    .withMessage('isPublished must be a boolean')
];

// Article validation rules
const validateCreateArticle = [
  body('title')
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Article title must be between 5 and 300 characters'),
  body('content')
    .trim()
    .isLength({ min: 10, max: 50000 })
    .withMessage('Article content must be between 10 and 50000 characters'),
  body('summary')
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Article summary must be between 10 and 500 characters'),
  body('courseId')
    .isMongoId()
    .withMessage('Valid course ID is required'),
  body('category')
    .isIn([
      'lecture_notes', 'assignment', 'announcement', 'resource', 
      'discussion', 'news', 'research', 'tutorial', 'other'
    ])
    .withMessage('Invalid article category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('tags.*')
    .optional()
    .trim()
    .isLength({ min: 1, max: 50 })
    .withMessage('Each tag must be between 1 and 50 characters'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('visibility')
    .optional()
    .isIn(['public', 'course_only', 'private'])
    .withMessage('Visibility must be public, course_only, or private'),
  body('scheduledPublishAt')
    .optional()
    .isISO8601()
    .withMessage('Scheduled publish date must be a valid ISO date'),
  body('expiresAt')
    .optional()
    .isISO8601()
    .withMessage('Expiration date must be a valid ISO date'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean')
];

const validateUpdateArticle = [
  body('title')
    .optional()
    .trim()
    .isLength({ min: 5, max: 300 })
    .withMessage('Article title must be between 5 and 300 characters'),
  body('content')
    .optional()
    .trim()
    .isLength({ min: 10, max: 50000 })
    .withMessage('Article content must be between 10 and 50000 characters'),
  body('summary')
    .optional()
    .trim()
    .isLength({ min: 10, max: 500 })
    .withMessage('Article summary must be between 10 and 500 characters'),
  body('category')
    .optional()
    .isIn([
      'lecture_notes', 'assignment', 'announcement', 'resource', 
      'discussion', 'news', 'research', 'tutorial', 'other'
    ])
    .withMessage('Invalid article category'),
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags must be an array'),
  body('priority')
    .optional()
    .isIn(['low', 'normal', 'high', 'urgent'])
    .withMessage('Priority must be low, normal, high, or urgent'),
  body('status')
    .optional()
    .isIn(['draft', 'published', 'archived'])
    .withMessage('Status must be draft, published, or archived'),
  body('visibility')
    .optional()
    .isIn(['public', 'course_only', 'private'])
    .withMessage('Visibility must be public, course_only, or private'),
  body('isImportant')
    .optional()
    .isBoolean()
    .withMessage('isImportant must be a boolean'),
  body('isPinned')
    .optional()
    .isBoolean()
    .withMessage('isPinned must be a boolean')
];

// Parameter validation
const validateMongoId = (paramName) => [
  param(paramName)
    .isMongoId()
    .withMessage(`${paramName} must be a valid MongoDB ObjectId`)
];

// Query validation
const validatePagination = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Page must be a positive integer'),
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limit must be between 1 and 100')
];

module.exports = {
  // User validations
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword,
  
  // Course validations
  validateCreateCourse,
  validateUpdateCourse,
  
  // Article validations
  validateCreateArticle,
  validateUpdateArticle,
  
  // Common validations
  validateMongoId,
  validatePagination
};
