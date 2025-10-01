const mongoose = require('mongoose');

const courseSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Course title is required'],
    trim: true,
    maxlength: [200, 'Course title cannot exceed 200 characters']
  },
  description: {
    type: String,
    required: [true, 'Course description is required'],
    trim: true,
    maxlength: [2000, 'Course description cannot exceed 2000 characters']
  },
  courseCode: {
    type: String,
    required: [true, 'Course code is required'],
    uppercase: true,
    trim: true,
    match: [/^[A-Z]{2,4}[0-9]{3,4}$/, 'Course code must be in format like CS101 or MATH1001']
  },
  professor: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Professor is required']
  },
  department: {
    type: String,
    required: [true, 'Department is required'],
    trim: true
  },
  credits: {
    type: Number,
    required: [true, 'Credits are required'],
    min: [1, 'Credits must be at least 1'],
    max: [10, 'Credits cannot exceed 10']
  },
  semester: {
    type: String,
    required: [true, 'Semester is required'],
    enum: ['Fall', 'Spring', 'Summer', 'Winter']
  },
  year: {
    type: Number,
    required: [true, 'Year is required'],
    min: [2020, 'Year must be 2020 or later'],
    max: [new Date().getFullYear() + 5, 'Year cannot be more than 5 years in the future']
  },
  schedule: {
    days: [{
      type: String,
      enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
    }],
    startTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'Start time must be in HH:MM format']
    },
    endTime: {
      type: String,
      match: [/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, 'End time must be in HH:MM format']
    },
    room: {
      type: String,
      trim: true
    }
  },
  capacity: {
    type: Number,
    required: [true, 'Course capacity is required'],
    min: [1, 'Capacity must be at least 1'],
    max: [500, 'Capacity cannot exceed 500']
  },
  enrolledStudents: [{
    student: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    enrolledAt: {
      type: Date,
      default: Date.now
    },
    status: {
      type: String,
      enum: ['enrolled', 'dropped', 'completed'],
      default: 'enrolled'
    }
  }],
  prerequisites: [{
    type: String,
    trim: true
  }],
  syllabus: {
    type: String,
    trim: true,
    maxlength: [5000, 'Syllabus cannot exceed 5000 characters']
  },
  materials: [{
    title: {
      type: String,
      required: true,
      trim: true
    },
    type: {
      type: String,
      enum: ['book', 'article', 'video', 'website', 'other'],
      required: true
    },
    url: {
      type: String,
      trim: true
    },
    required: {
      type: Boolean,
      default: false
    }
  }],
  tags: [{
    type: String,
    trim: true,
    lowercase: true
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isPublished: {
    type: Boolean,
    default: false
  },
  qrCode: {
    type: String,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes after schema definition to avoid duplicates
courseSchema.index({ courseCode: 1 }, { unique: true, background: true });
courseSchema.index({ professor: 1 }, { background: true });
courseSchema.index({ department: 1 }, { background: true });
courseSchema.index({ semester: 1, year: 1 }, { background: true });
courseSchema.index({ tags: 1 }, { background: true });
courseSchema.index({ isActive: 1, isPublished: 1 }, { background: true });

// Virtual for enrolled count
courseSchema.virtual('enrolledCount').get(function() {
  return this.enrolledStudents.filter(enrollment => enrollment.status === 'enrolled').length;
});

// Virtual for available spots
courseSchema.virtual('availableSpots').get(function() {
  return this.capacity - this.enrolledCount;
});

// Virtual for professor name (populated)
courseSchema.virtual('professorName').get(function() {
  return this.professor && this.professor.name ? this.professor.name : 'Unknown Professor';
});

// Pre-save middleware to generate QR code data
courseSchema.pre('save', function(next) {
  if (this.isNew || this.isModified('courseCode')) {
    // Generate QR code data (JSON string with course info)
    this.qrCode = JSON.stringify({
      courseCode: this.courseCode,
      title: this.title,
      professor: this.professor,
      semester: this.semester,
      year: this.year
    });
  }
  next();
});

// Instance method to enroll student
courseSchema.methods.enrollStudent = function(studentId) {
  // Check if student is already enrolled
  const existingEnrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (existingEnrollment) {
    if (existingEnrollment.status === 'enrolled') {
      throw new Error('Student is already enrolled in this course');
    } else {
      // Re-enroll previously dropped student
      existingEnrollment.status = 'enrolled';
      existingEnrollment.enrolledAt = new Date();
    }
  } else {
    // Check capacity
    if (this.enrolledCount >= this.capacity) {
      throw new Error('Course is at full capacity');
    }
    
    // Add new enrollment
    this.enrolledStudents.push({
      student: studentId,
      status: 'enrolled'
    });
  }
  
  return this.save();
};

// Instance method to drop student
courseSchema.methods.dropStudent = function(studentId) {
  const enrollment = this.enrolledStudents.find(
    enrollment => enrollment.student.toString() === studentId.toString()
  );
  
  if (!enrollment) {
    throw new Error('Student is not enrolled in this course');
  }
  
  enrollment.status = 'dropped';
  return this.save();
};

// Static method to find by professor
courseSchema.statics.findByProfessor = function(professorId) {
  return this.find({ professor: professorId, isActive: true });
};

// Static method to find published courses
courseSchema.statics.findPublished = function() {
  return this.find({ isActive: true, isPublished: true });
};

// Static method to search courses
courseSchema.statics.searchCourses = function(query) {
  const searchRegex = new RegExp(query, 'i');
  return this.find({
    isActive: true,
    isPublished: true,
    $or: [
      { title: searchRegex },
      { description: searchRegex },
      { courseCode: searchRegex },
      { department: searchRegex },
      { tags: { $in: [searchRegex] } }
    ]
  });
};

module.exports = mongoose.model('Course', courseSchema);
