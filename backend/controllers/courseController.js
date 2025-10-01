const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Create new course (Professor only)
const createCourse = async (req, res) => {
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

    const courseData = {
      ...req.body,
      professor: req.user._id
    };

    // Check if course code already exists
    const existingCourse = await Course.findOne({ courseCode: courseData.courseCode });
    if (existingCourse) {
      return res.status(400).json({
        success: false,
        message: 'Course code already exists'
      });
    }

    const course = new Course(courseData);
    await course.save();

    // Add course to professor's created courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $push: { createdCourses: course._id } }
    );

    // Populate professor info
    await course.populate('professor', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      data: { course }
    });

  } catch (error) {
    console.error('Create course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to create course',
      error: error.message
    });
  }
};

// Get all courses
const getAllCourses = async (req, res) => {
  try {
    const { 
      page = 1, 
      limit = 10, 
      search, 
      department, 
      semester, 
      year,
      professor,
      published 
    } = req.query;
    
    const skip = (page - 1) * limit;

    // Build query
    const query = { isActive: true };
    
    if (published !== undefined) {
      query.isPublished = published === 'true';
    }
    
    if (department) query.department = department;
    if (semester) query.semester = semester;
    if (year) query.year = parseInt(year);
    if (professor) query.professor = professor;
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { courseCode: { $regex: search, $options: 'i' } },
        { tags: { $in: [new RegExp(search, 'i')] } }
      ];
    }

    const courses = await Course.find(query)
      .populate('professor', 'name email department')
      .populate('enrolledStudents.student', 'name email studentId')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get all courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get courses',
      error: error.message
    });
  }
};

// Get single course by ID
const getCourseById = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id)
      .populate('professor', 'name email department jobTitle')
      .populate('enrolledStudents.student', 'name email studentId major year');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is published or user is the professor
    if (!course.isPublished && (!req.user || course.professor._id.toString() !== req.user._id.toString())) {
      return res.status(403).json({
        success: false,
        message: 'Course is not published'
      });
    }

    res.json({
      success: true,
      data: { course }
    });

  } catch (error) {
    console.error('Get course by ID error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get course',
      error: error.message
    });
  }
};

// Update course (Professor only - own courses)
const updateCourse = async (req, res) => {
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

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the professor of this course
    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only update your own courses'
      });
    }

    // Don't allow changing professor
    const updateData = { ...req.body };
    delete updateData.professor;

    // Check if course code is being changed and if it already exists
    if (updateData.courseCode && updateData.courseCode !== course.courseCode) {
      const existingCourse = await Course.findOne({ 
        courseCode: updateData.courseCode,
        _id: { $ne: id }
      });
      
      if (existingCourse) {
        return res.status(400).json({
          success: false,
          message: 'Course code already exists'
        });
      }
    }

    const updatedCourse = await Course.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).populate('professor', 'name email department');

    res.json({
      success: true,
      message: 'Course updated successfully',
      data: { course: updatedCourse }
    });

  } catch (error) {
    console.error('Update course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to update course',
      error: error.message
    });
  }
};

// Delete course (Professor only - own courses)
const deleteCourse = async (req, res) => {
  try {
    const { id } = req.params;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is the professor of this course
    if (course.professor.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'You can only delete your own courses'
      });
    }

    // Soft delete - set isActive to false
    course.isActive = false;
    await course.save();

    // Remove course from professor's created courses
    await User.findByIdAndUpdate(
      req.user._id,
      { $pull: { createdCourses: course._id } }
    );

    // Remove course from enrolled students
    const enrolledStudentIds = course.enrolledStudents
      .filter(enrollment => enrollment.status === 'enrolled')
      .map(enrollment => enrollment.student);

    await User.updateMany(
      { _id: { $in: enrolledStudentIds } },
      { $pull: { enrolledCourses: course._id } }
    );

    res.json({
      success: true,
      message: 'Course deleted successfully'
    });

  } catch (error) {
    console.error('Delete course error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to delete course',
      error: error.message
    });
  }
};

// Enroll student in course
const enrollStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    if (!course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not published'
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can enroll in courses'
      });
    }

    try {
      await course.enrollStudent(studentId);
      
      // Add course to student's enrolled courses
      await User.findByIdAndUpdate(
        studentId,
        { $addToSet: { enrolledCourses: course._id } }
      );

      res.json({
        success: true,
        message: 'Successfully enrolled in course'
      });

    } catch (enrollError) {
      return res.status(400).json({
        success: false,
        message: enrollError.message
      });
    }

  } catch (error) {
    console.error('Enroll student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to enroll in course',
      error: error.message
    });
  }
};

// Drop student from course
const dropStudent = async (req, res) => {
  try {
    const { id } = req.params;
    const studentId = req.user._id;

    const course = await Course.findById(id);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if user is a student
    if (req.user.role !== 'student') {
      return res.status(403).json({
        success: false,
        message: 'Only students can drop courses'
      });
    }

    try {
      await course.dropStudent(studentId);
      
      // Remove course from student's enrolled courses
      await User.findByIdAndUpdate(
        studentId,
        { $pull: { enrolledCourses: course._id } }
      );

      res.json({
        success: true,
        message: 'Successfully dropped from course'
      });

    } catch (dropError) {
      return res.status(400).json({
        success: false,
        message: dropError.message
      });
    }

  } catch (error) {
    console.error('Drop student error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to drop from course',
      error: error.message
    });
  }
};

// Get courses by professor
const getCoursesByProfessor = async (req, res) => {
  try {
    const { professorId } = req.params;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    // Check if professor exists
    const professor = await User.findById(professorId);
    if (!professor || professor.role !== 'professor') {
      return res.status(404).json({
        success: false,
        message: 'Professor not found'
      });
    }

    const courses = await Course.findByProfessor(professorId)
      .populate('professor', 'name email department')
      .skip(skip)
      .limit(parseInt(limit))
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments({ 
      professor: professorId, 
      isActive: true 
    });

    res.json({
      success: true,
      data: {
        courses,
        professor: {
          _id: professor._id,
          name: professor.name,
          email: professor.email,
          department: professor.department
        },
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get courses by professor error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get professor courses',
      error: error.message
    });
  }
};

// Get my courses (for authenticated user)
const getMyCourses = async (req, res) => {
  try {
    const userId = req.user._id;
    const { page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let courses;
    let total;

    if (req.user.role === 'professor') {
      // Get courses created by professor
      courses = await Course.findByProfessor(userId)
        .populate('enrolledStudents.student', 'name email studentId')
        .skip(skip)
        .limit(parseInt(limit))
        .sort({ createdAt: -1 });
      
      total = await Course.countDocuments({ 
        professor: userId, 
        isActive: true 
      });
    } else {
      // Get courses enrolled by student
      const user = await User.findById(userId).populate({
        path: 'enrolledCourses',
        populate: {
          path: 'professor',
          select: 'name email department'
        }
      });

      courses = user.enrolledCourses.filter(course => course.isActive);
      total = courses.length;

      // Apply pagination manually for populated data
      courses = courses.slice(skip, skip + parseInt(limit));
    }

    res.json({
      success: true,
      data: {
        courses,
        pagination: {
          current: parseInt(page),
          pages: Math.ceil(total / limit),
          total
        }
      }
    });

  } catch (error) {
    console.error('Get my courses error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get your courses',
      error: error.message
    });
  }
};

module.exports = {
  createCourse,
  getAllCourses,
  getCourseById,
  updateCourse,
  deleteCourse,
  enrollStudent,
  dropStudent,
  getCoursesByProfessor,
  getMyCourses
};
