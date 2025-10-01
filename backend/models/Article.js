const mongoose = require('mongoose');

const articleSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Article title is required'],
    trim: true,
    maxlength: [300, 'Article title cannot exceed 300 characters']
  },
  content: {
    type: String,
    required: [true, 'Article content is required'],
    trim: true,
    maxlength: [50000, 'Article content cannot exceed 50000 characters']
  },
  summary: {
    type: String,
    required: [true, 'Article summary is required'],
    trim: true,
    maxlength: [500, 'Article summary cannot exceed 500 characters']
  },
  author: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Article author is required']
  },
  course: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course',
    required: [true, 'Associated course is required']
  },
  category: {
    type: String,
    required: [true, 'Article category is required'],
    enum: [
      'lecture_notes',
      'assignment',
      'announcement',
      'resource',
      'discussion',
      'news',
      'research',
      'tutorial',
      'other'
    ]
  },
  tags: [{
    type: String,
    trim: true,
    lowercase: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  attachments: [{
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    mimetype: {
      type: String,
      required: true
    },
    size: {
      type: Number,
      required: true,
      max: [10485760, 'File size cannot exceed 10MB'] // 10MB limit
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  images: [{
    filename: {
      type: String,
      required: true,
      trim: true
    },
    originalName: {
      type: String,
      required: true,
      trim: true
    },
    url: {
      type: String,
      required: true,
      trim: true
    },
    alt: {
      type: String,
      trim: true,
      default: ''
    },
    caption: {
      type: String,
      trim: true,
      default: ''
    }
  }],
  priority: {
    type: String,
    enum: ['low', 'normal', 'high', 'urgent'],
    default: 'normal'
  },
  status: {
    type: String,
    enum: ['draft', 'published', 'archived'],
    default: 'draft'
  },
  visibility: {
    type: String,
    enum: ['public', 'course_only', 'private'],
    default: 'course_only'
  },
  publishedAt: {
    type: Date,
    default: null
  },
  scheduledPublishAt: {
    type: Date,
    default: null
  },
  views: {
    type: Number,
    default: 0
  },
  likes: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    likedAt: {
      type: Date,
      default: Date.now
    }
  }],
  comments: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    content: {
      type: String,
      required: true,
      trim: true,
      maxlength: [1000, 'Comment cannot exceed 1000 characters']
    },
    createdAt: {
      type: Date,
      default: Date.now
    },
    isEdited: {
      type: Boolean,
      default: false
    },
    editedAt: {
      type: Date,
      default: null
    }
  }],
  readBy: [{
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    readAt: {
      type: Date,
      default: Date.now
    }
  }],
  isImportant: {
    type: Boolean,
    default: false
  },
  isPinned: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Indexes for better query performance
articleSchema.index({ author: 1 });
articleSchema.index({ course: 1 });
articleSchema.index({ category: 1 });
articleSchema.index({ status: 1 });
articleSchema.index({ visibility: 1 });
articleSchema.index({ publishedAt: -1 });
articleSchema.index({ tags: 1 });
articleSchema.index({ title: 'text', content: 'text', summary: 'text' });
articleSchema.index({ isPinned: -1, publishedAt: -1 });

// Virtual for like count
articleSchema.virtual('likeCount').get(function() {
  return this.likes.length;
});

// Virtual for comment count
articleSchema.virtual('commentCount').get(function() {
  return this.comments.length;
});

// Virtual for read count
articleSchema.virtual('readCount').get(function() {
  return this.readBy.length;
});

// Virtual for reading time estimate (words per minute = 200)
articleSchema.virtual('readingTime').get(function() {
  const wordCount = this.content.split(/\s+/).length;
  const readingTimeMinutes = Math.ceil(wordCount / 200);
  return readingTimeMinutes;
});

// Virtual for author name (when populated)
articleSchema.virtual('authorName').get(function() {
  return this.author && this.author.name ? this.author.name : 'Unknown Author';
});

// Pre-save middleware to set publishedAt when status changes to published
articleSchema.pre('save', function(next) {
  if (this.isModified('status') && this.status === 'published' && !this.publishedAt) {
    this.publishedAt = new Date();
  }
  next();
});

// Instance method to increment views
articleSchema.methods.incrementViews = function() {
  this.views += 1;
  return this.save({ validateBeforeSave: false });
};

// Instance method to add like
articleSchema.methods.addLike = function(userId) {
  const existingLike = this.likes.find(like => like.user.toString() === userId.toString());
  
  if (existingLike) {
    throw new Error('User has already liked this article');
  }
  
  this.likes.push({ user: userId });
  return this.save();
};

// Instance method to remove like
articleSchema.methods.removeLike = function(userId) {
  const likeIndex = this.likes.findIndex(like => like.user.toString() === userId.toString());
  
  if (likeIndex === -1) {
    throw new Error('User has not liked this article');
  }
  
  this.likes.splice(likeIndex, 1);
  return this.save();
};

// Instance method to add comment
articleSchema.methods.addComment = function(userId, content) {
  this.comments.push({
    user: userId,
    content: content.trim()
  });
  return this.save();
};

// Instance method to mark as read
articleSchema.methods.markAsRead = function(userId) {
  const existingRead = this.readBy.find(read => read.user.toString() === userId.toString());
  
  if (!existingRead) {
    this.readBy.push({ user: userId });
    return this.save({ validateBeforeSave: false });
  }
  
  return Promise.resolve(this);
};

// Static method to find by course
articleSchema.statics.findByCourse = function(courseId, status = 'published') {
  return this.find({ 
    course: courseId, 
    status: status,
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  }).sort({ isPinned: -1, publishedAt: -1 });
};

// Static method to find by author
articleSchema.statics.findByAuthor = function(authorId) {
  return this.find({ author: authorId }).sort({ createdAt: -1 });
};

// Static method to search articles
articleSchema.statics.searchArticles = function(query, courseId = null) {
  const searchConditions = {
    status: 'published',
    $text: { $search: query },
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (courseId) {
    searchConditions.course = courseId;
  }
  
  return this.find(searchConditions, { score: { $meta: 'textScore' } })
    .sort({ score: { $meta: 'textScore' }, publishedAt: -1 });
};

// Static method to get recent articles
articleSchema.statics.getRecentArticles = function(limit = 10, courseId = null) {
  const conditions = {
    status: 'published',
    $or: [
      { expiresAt: null },
      { expiresAt: { $gt: new Date() } }
    ]
  };
  
  if (courseId) {
    conditions.course = courseId;
  }
  
  return this.find(conditions)
    .sort({ isPinned: -1, publishedAt: -1 })
    .limit(limit);
};

module.exports = mongoose.model('Article', articleSchema);
