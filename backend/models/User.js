const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Name is required'],
    trim: true,
    maxlength: [100, 'Name cannot exceed 100 characters']
  },
  email: {
    type: String,
    required: [true, 'Email is required'],
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email']
  },
  password: {
    type: String,
    required: [true, 'Password is required'],
    minlength: [6, 'Password must be at least 6 characters'],
    select: false // Don't include password in queries by default
  },
  role: {
    type: String,
    enum: ['student', 'professor', 'admin'],
    required: [true, 'Role is required'],
    default: 'student'
  },
  avatar: {
    type: String,
    default: null
  },
  phone: {
    type: String,
    trim: true,
    default: null
  },
  studentId: {
    type: String,
    trim: true,
    default: null
  },
  major: {
    type: String,
    trim: true,
    default: null
  },
  year: {
    type: String,
    trim: true,
    default: null
  },
  department: {
    type: String,
    trim: true,
    default: null
  },
  jobTitle: {
    type: String,
    trim: true,
    default: null
  },
  office: {
    type: String,
    trim: true,
    default: null
  },
  isActive: {
    type: Boolean,
    default: true
  },
  lastLogin: {
    type: Date,
    default: null
  },
  enrolledCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }],
  createdCourses: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Course'
  }]
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Create indexes after schema definition to avoid duplicates
userSchema.index({ email: 1 }, { unique: true, background: true });
userSchema.index({ role: 1 }, { background: true });
userSchema.index({ studentId: 1 }, { sparse: true, unique: true, background: true, partialFilterExpression: { studentId: { $ne: null } } });

// Virtual for full profile completion
userSchema.virtual('profileCompletion').get(function() {
  const requiredFields = ['name', 'email', 'role'];
  const optionalFields = this.role === 'student' 
    ? ['avatar', 'phone', 'studentId', 'major', 'year']
    : ['avatar', 'phone', 'department', 'jobTitle', 'office'];
  
  const completedRequired = requiredFields.filter(field => this[field]).length;
  const completedOptional = optionalFields.filter(field => this[field]).length;
  
  return Math.round(((completedRequired + completedOptional) / (requiredFields.length + optionalFields.length)) * 100);
});

// Pre-save middleware to hash password
userSchema.pre('save', async function(next) {
  // Only hash password if it's modified or new
  if (!this.isModified('password')) return next();
  
  try {
    // Hash password with cost of 12
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Instance method to check password
userSchema.methods.comparePassword = async function(candidatePassword) {
  try {
    return await bcrypt.compare(candidatePassword, this.password);
  } catch (error) {
    throw new Error('Password comparison failed');
  }
};

// Instance method to update last login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

// Static method to find by email
userSchema.statics.findByEmail = function(email) {
  return this.findOne({ email: email.toLowerCase() });
};

// Static method to get professors
userSchema.statics.getProfessors = function() {
  return this.find({ role: 'professor', isActive: true });
};

// Static method to get students
userSchema.statics.getStudents = function() {
  return this.find({ role: 'student', isActive: true });
};

module.exports = mongoose.model('User', userSchema);
