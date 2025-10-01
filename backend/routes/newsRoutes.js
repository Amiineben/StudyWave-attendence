/**
 * News Routes
 * Routes for automated news fetching and management
 */

const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');

// Import controllers
const {
  fetchExternalNews,
  getNewsStats,
  configureAutoFetch,
  testNewsSources,
  cleanupExternalArticles
} = require('../controllers/newsController');

// Import middleware
const { authenticate, requireAdmin } = require('../middleware/auth');

// All routes require authentication
router.use(authenticate);

/**
 * @route   POST /api/news/fetch
 * @desc    Manually fetch news from external sources
 * @access  Admin only
 */
router.post('/fetch', requireAdmin, fetchExternalNews);

/**
 * @route   GET /api/news/stats
 * @desc    Get news statistics and fetching status
 * @access  Admin only
 */
router.get('/stats', requireAdmin, getNewsStats);

/**
 * @route   POST /api/news/configure
 * @desc    Configure automatic news fetching
 * @access  Admin only
 */
router.post('/configure', 
  requireAdmin,
  [
    body('enabled')
      .isBoolean()
      .withMessage('Enabled must be a boolean'),
    body('interval')
      .optional()
      .isInt({ min: 1, max: 24 })
      .withMessage('Interval must be between 1 and 24 hours'),
    body('sources')
      .optional()
      .isArray()
      .withMessage('Sources must be an array')
  ],
  configureAutoFetch
);

/**
 * @route   GET /api/news/test-sources
 * @desc    Test connectivity to news sources
 * @access  Admin only
 */
router.get('/test-sources', requireAdmin, testNewsSources);

/**
 * @route   DELETE /api/news/cleanup
 * @desc    Clean up old external articles
 * @access  Admin only
 */
router.delete('/cleanup',
  requireAdmin,
  [
    query('olderThanDays')
      .optional()
      .isInt({ min: 1, max: 365 })
      .withMessage('olderThanDays must be between 1 and 365'),
    query('source')
      .optional()
      .isString()
      .withMessage('Source must be a string')
  ],
  cleanupExternalArticles
);

module.exports = router;
