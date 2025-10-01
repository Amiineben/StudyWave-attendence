const Article = require('../models/Article');
const Course = require('../models/Course');
const { validationResult } = require('express-validator');

// Create new article (Professor only)
const createArticle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { courseId } = req.body;

    // Check if course exists and user is the professor
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only create articles for your own courses'
      });
    }

    const articleData = {
      ...req.body,
      author: req.user._id,
      course: courseId
    };

    const article = new Article(articleData);
    await article.save();

    // Populate author and course info
    await article.populate([
      { path: 'author', select: 'name email role' },
      { path: 'course', select: 'title courseCode' }
    ]);

    res.status(201).json({
      success: true,
      message: 'Article created successfully',
      data: { article }
    });

  } catch (error) {
    console.error('Create article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create article',
      error: error.message
    });
  }
};

// Get all articles
const getAllArticles = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      category, 
      courseId,
      authorId,
      status = 'published',
      priority,
      tags
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    const query = {};
    
    if (status) query.status = status;
    if (category) query.category = category;
    if (courseId) query.course = courseId;
    if (authorId) query.author = authorId;
    if (priority) query.priority = priority;
    
    if (tags) {
      const tagArray = tags.split(',').map(tag => tag.trim());
      query.tags = { $in: tagArray };
    }

    // Add expiration check for published articles
    if (status === 'published') {
      query.$or = [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ];
    }
    
    if (search) {
      query.$text = { $search: search };
    }

    let articlesQuery = Article.find(query)
      .populate('author', 'name email role')
      .populate('course', 'title courseCode professor')
      .populate('likes.user', 'name')
      .populate('comments.user', 'name')
      .skip(skip)
      .limit(parseInt(limit));

    // Sort by text score if searching, otherwise by pinned and publish date
    if (search) {
      articlesQuery = articlesQuery.sort({ score: { $meta: 'textScore' }, publishedAt: -1 });
    } else {
      articlesQuery = articlesQuery.sort({ isPinned: -1, publishedAt: -1 });
    }

    const articles = await articlesQuery;
    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get articles',
      error: error.message
    });
  }
};

// Get single article by ID
const getArticleById = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id)
      .populate('author', 'name email role department')
      .populate('course', 'title courseCode professor enrolledStudents')
      .populate('likes.user', 'name')
      .populate('comments.user', 'name')
      .populate('readBy.user', 'name');

    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if article is published or user has access
    if (article.status !== 'published') {
      // Only author or enrolled students/professor can view unpublished articles
      if (!req.user || (
        article.author._id.toString() !== req.user._id.toString() &&
        article.course.professor.toString() !== req.user._id.toString() &&
        !article.course.enrolledStudents.some(enrollment => 
          enrollment.student.toString() === req.user._id.toString() && 
          enrollment.status === 'enrolled'
        )
      )) {
        return res.status(403).json({
          success: false,
          message: 'Article is not published'
        });
      }
    }

    // Check visibility
    if (article.visibility === 'private' && article.author._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Article is private'
      });
    }

    if (article.visibility === 'course_only') {
      // Check if user is enrolled in the course or is the professor
      if (!req.user || (
        article.course.professor.toString() !== req.user._id.toString() &&
        !article.course.enrolledStudents.some(enrollment => 
          enrollment.student.toString() === req.user._id.toString() && 
          enrollment.status === 'enrolled'
        )
      )) {
        return res.status(403).json({
          success: false,
          message: 'Article is only visible to course members'
        });
      }
    }

    // Increment views and mark as read if user is authenticated
    if (req.user) {
      await article.incrementViews();
      await article.markAsRead(req.user._id);
    }

    res.json({
      success: true,
      data: { article }
    });

  } catch (error) {
    console.error('Get article by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get article',
      error: error.message
    });
  }
};

// Update article (Author only)
const updateArticle = async (req, res) => {
  try {
    // Check for validation errors
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Validation failed',
        errors: errors.array()
      });
    }

    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own articles'
      });
    }

    // Don't allow changing author or course
    const updateData = { ...req.body };
    delete updateData.author;
    delete updateData.course;

    const updatedArticle = await Article.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate([
      { path: 'author', select: 'name email role' },
      { path: 'course', select: 'title courseCode' }
    ]);

    res.json({
      success: true,
      message: 'Article updated successfully',
      data: { article: updatedArticle }
    });

  } catch (error) {
    console.error('Update article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update article',
      error: error.message
    });
  }
};

// Delete article (Author only)
const deleteArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    // Check if user is the author
    if (article.author.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own articles'
      });
    }

    await Article.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Article deleted successfully'
    });

  } catch (error) {
    console.error('Delete article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete article',
      error: error.message
    });
  }
};

// Get articles by course
const getArticlesByCourse = async (req, res) => {
  try {
    const { courseId } = req.params;
    const { page = 1, limit = 10, status = 'published' } = req.query;
    const skip = (page - 1) * limit;

    // Check if course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    const articles = await Article.findByCourse(courseId, status)
      .populate('author', 'name email role')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments({ 
      course: courseId, 
      status: status,
      $or: [
        { expiresAt: null },
        { expiresAt: { $gt: new Date() } }
      ]
    });

    res.json({
      success: true,
      data: {
        articles,
        course: {
          _id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get articles by course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course articles',
      error: error.message
    });
  }
};

// Get my articles (for authenticated user)
const getMyArticles = async (req, res) => {
  try {
    const { page = 1, limit = 10, status } = req.query;
    const skip = (page - 1) * limit;

    const query = { author: req.user._id };
    if (status) query.status = status;

    const articles = await Article.findByAuthor(req.user._id)
      .populate('course', 'title courseCode')
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Article.countDocuments(query);

    res.json({
      success: true,
      data: {
        articles,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my articles error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your articles',
      error: error.message
    });
  }
};

// Like article
const likeArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    try {
      await article.addLike(req.user._id);
      
      res.json({
        success: true,
        message: 'Article liked successfully',
        data: { likeCount: article.likeCount }
      });

    } catch (likeError) {
      return res.status(400).json({
        success: false,
        message: likeError.message
      });
    }

  } catch (error) {
    console.error('Like article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to like article',
      error: error.message
    });
  }
};

// Unlike article
const unlikeArticle = async (req, res) => {
  try {
    const { id } = req.params;

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    try {
      await article.removeLike(req.user._id);
      
      res.json({
        success: true,
        message: 'Article unliked successfully',
        data: { likeCount: article.likeCount }
      });

    } catch (unlikeError) {
      return res.status(400).json({
        success: false,
        message: unlikeError.message
      });
    }

  } catch (error) {
    console.error('Unlike article error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to unlike article',
      error: error.message
    });
  }
};

// Add comment to article
const addComment = async (req, res) => {
  try {
    const { id } = req.params;
    const { content } = req.body;

    if (!content || !content.trim()) {
      return res.status(400).json({
        success: false,
        message: 'Comment content is required'
      });
    }

    const article = await Article.findById(id);
    if (!article) {
      return res.status(404).json({
        success: false,
        message: 'Article not found'
      });
    }

    await article.addComment(req.user._id, content);
    
    // Populate the new comment
    await article.populate('comments.user', 'name');

    const newComment = article.comments[article.comments.length - 1];

    res.json({
      success: true,
      message: 'Comment added successfully',
      data: { 
        comment: newComment,
        commentCount: article.commentCount 
      }
    });

  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to add comment',
      error: error.message
    });
  }
};

module.exports = {
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
};
