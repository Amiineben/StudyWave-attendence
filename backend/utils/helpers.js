const crypto = require('crypto');

/**
 * Generate a random string of specified length
 * @param {number} length - Length of the string to generate
 * @returns {string} Random string
 */
const generateRandomString = (length = 32) => {
  return crypto.randomBytes(length).toString('hex');
};

/**
 * Generate QR code data for course attendance
 * @param {Object} course - Course object
 * @returns {string} JSON string for QR code
 */
const generateQRCodeData = (course) => {
  return JSON.stringify({
    type: 'course_attendance',
    courseId: course._id,
    courseCode: course.courseCode,
    title: course.title,
    professor: course.professor,
    timestamp: new Date().toISOString(),
    // Add a unique session ID for each QR code generation
    sessionId: generateRandomString(16)
  });
};

/**
 * Calculate reading time for article content
 * @param {string} content - Article content
 * @param {number} wordsPerMinute - Average reading speed (default: 200)
 * @returns {number} Reading time in minutes
 */
const calculateReadingTime = (content, wordsPerMinute = 200) => {
  const wordCount = content.trim().split(/\s+/).length;
  return Math.ceil(wordCount / wordsPerMinute);
};

/**
 * Sanitize filename for file uploads
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
const sanitizeFilename = (filename) => {
  // Remove special characters and spaces, keep extension
  const extension = filename.split('.').pop();
  const name = filename.replace(/\.[^/.]+$/, '');
  const sanitized = name.replace(/[^a-zA-Z0-9]/g, '_');
  return `${sanitized}.${extension}`;
};

/**
 * Format user display name based on role
 * @param {Object} user - User object
 * @returns {string} Formatted display name
 */
const formatUserDisplayName = (user) => {
  if (user.role === 'professor') {
    return `Prof. ${user.name}`;
  }
  return user.name;
};

/**
 * Generate course code suggestion based on department and title
 * @param {string} department - Department name
 * @param {string} title - Course title
 * @param {number} level - Course level (default: 100)
 * @returns {string} Suggested course code
 */
const generateCourseCodeSuggestion = (department, title, level = 100) => {
  const deptCode = department.substring(0, 4).toUpperCase().replace(/[^A-Z]/g, '');
  const titleWords = title.split(' ');
  const titleCode = titleWords.length > 1 
    ? titleWords.map(word => word.charAt(0)).join('').toUpperCase()
    : title.substring(0, 2).toUpperCase();
  
  return `${deptCode}${level}${titleCode}`;
};

/**
 * Validate email format
 * @param {string} email - Email address
 * @returns {boolean} True if valid email format
 */
const isValidEmail = (email) => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

/**
 * Format date for display
 * @param {Date} date - Date object
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted date string
 */
const formatDate = (date, locale = 'en-US') => {
  return new Intl.DateTimeFormat(locale, {
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  }).format(new Date(date));
};

/**
 * Format time for display
 * @param {Date} date - Date object
 * @param {string} locale - Locale for formatting (default: 'en-US')
 * @returns {string} Formatted time string
 */
const formatTime = (date, locale = 'en-US') => {
  return new Intl.DateTimeFormat(locale, {
    hour: '2-digit',
    minute: '2-digit'
  }).format(new Date(date));
};

/**
 * Check if user can access course content
 * @param {Object} user - User object
 * @param {Object} course - Course object
 * @returns {boolean} True if user has access
 */
const canAccessCourse = (user, course) => {
  if (!user) return false;
  
  // Professor who created the course
  if (course.professor.toString() === user._id.toString()) {
    return true;
  }
  
  // Enrolled student
  if (user.role === 'student') {
    return course.enrolledStudents.some(enrollment => 
      enrollment.student.toString() === user._id.toString() && 
      enrollment.status === 'enrolled'
    );
  }
  
  return false;
};

/**
 * Generate pagination metadata
 * @param {number} page - Current page
 * @param {number} limit - Items per page
 * @param {number} total - Total items
 * @returns {Object} Pagination metadata
 */
const generatePaginationMeta = (page, limit, total) => {
  const totalPages = Math.ceil(total / limit);
  return {
    current: parseInt(page),
    pages: totalPages,
    total: parseInt(total),
    hasNext: page < totalPages,
    hasPrev: page > 1,
    next: page < totalPages ? parseInt(page) + 1 : null,
    prev: page > 1 ? parseInt(page) - 1 : null
  };
};

/**
 * Create API response object
 * @param {boolean} success - Success status
 * @param {string} message - Response message
 * @param {Object} data - Response data
 * @param {Object} meta - Additional metadata
 * @returns {Object} Standardized API response
 */
const createApiResponse = (success, message, data = null, meta = null) => {
  const response = { success, message };
  if (data !== null) response.data = data;
  if (meta !== null) response.meta = meta;
  return response;
};

/**
 * Extract search terms from query string
 * @param {string} query - Search query
 * @returns {Array} Array of search terms
 */
const extractSearchTerms = (query) => {
  if (!query) return [];
  return query.trim().split(/\s+/).filter(term => term.length > 0);
};

module.exports = {
  generateRandomString,
  generateQRCodeData,
  calculateReadingTime,
  sanitizeFilename,
  formatUserDisplayName,
  generateCourseCodeSuggestion,
  isValidEmail,
  formatDate,
  formatTime,
  canAccessCourse,
  generatePaginationMeta,
  createApiResponse,
  extractSearchTerms
};
