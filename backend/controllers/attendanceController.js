const Course = require('../models/Course');
const User = require('../models/User');
const { validationResult } = require('express-validator');
const { generateQRCodeData } = require('../utils/helpers');

// Attendance record schema (can be moved to separate model if needed)
const attendanceRecords = new Map(); // In-memory storage for demo - use MongoDB in production

// Record attendance via QR code scan
const recordAttendance = async (req, res) => {
  try {
    const { qrCodeData } = req.body;
    
    if (!qrCodeData) {
      return res.status(400).json({
        success: false,
        message: 'QR code data is required'
      });
    }

    let qrData;
    try {
      qrData = JSON.parse(qrCodeData);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: 'Invalid QR code format'
      });
    }

    // Validate QR code structure
    if (!qrData.courseId || !qrData.courseCode || qrData.type !== 'course_attendance') {
      return res.status(400).json({
        success: false,
        message: 'Invalid attendance QR code'
      });
    }

    // Find the course
    const course = await Course.findById(qrData.courseId)
      .populate('professor', 'name email');

    if (!course) {
      return res.status(404).json({
        success: false,
        message: 'Course not found'
      });
    }

    // Check if course is active and published
    if (!course.isActive || !course.isPublished) {
      return res.status(400).json({
        success: false,
        message: 'Course is not available for attendance'
      });
    }

    // Check if user is enrolled in the course
    const enrollment = course.enrolledStudents.find(
      enrollment => enrollment.student.toString() === req.user._id.toString()
    );

    if (!enrollment || enrollment.status !== 'enrolled') {
      return res.status(403).json({
        success: false,
        message: 'You are not enrolled in this course'
      });
    }

    // Check if attendance was already recorded for today
    const today = new Date().toDateString();
    const attendanceKey = `${course._id}_${req.user._id}_${today}`;
    
    if (attendanceRecords.has(attendanceKey)) {
      return res.status(400).json({
        success: false,
        message: 'Attendance already recorded for today'
      });
    }

    // Record attendance
    const attendanceRecord = {
      courseId: course._id,
      studentId: req.user._id,
      date: new Date(),
      status: 'present',
      qrSessionId: qrData.sessionId,
      recordedAt: new Date()
    };

    attendanceRecords.set(attendanceKey, attendanceRecord);

    res.json({
      success: true,
      message: 'Attendance recorded successfully',
      data: {
        course: {
          _id: course._id,
          title: course.title,
          courseCode: course.courseCode,
          professor: course.professor.name
        },
        student: {
          _id: req.user._id,
          name: req.user.name,
          studentId: req.user.studentId
        },
        attendance: {
          date: attendanceRecord.date,
          status: attendanceRecord.status
        }
      }
    });

  } catch (error) {
    console.error('Record attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to record attendance',
      error: error.message
    });
  }
};

// Generate QR code for course attendance (Professor only)
const generateAttendanceQR = async (req, res) => {
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
        message: 'You can only generate QR codes for your own courses'
      });
    }

    // Generate QR code data
    const qrCodeData = generateQRCodeData(course);

    res.json({
      success: true,
      message: 'QR code generated successfully',
      data: {
        qrCodeData,
        course: {
          _id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        validUntil: new Date(Date.now() + 30 * 60 * 1000) // Valid for 30 minutes
      }
    });

  } catch (error) {
    console.error('Generate attendance QR error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to generate QR code',
      error: error.message
    });
  }
};

// Get attendance records for a course (Professor only)
const getCourseAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { date, studentId } = req.query;

    const course = await Course.findById(id)
      .populate('enrolledStudents.student', 'name email studentId');

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
        message: 'You can only view attendance for your own courses'
      });
    }

    // Filter attendance records
    const courseAttendance = [];
    for (const [key, record] of attendanceRecords.entries()) {
      if (record.courseId.toString() === course._id.toString()) {
        // Apply filters
        if (date && record.date.toDateString() !== new Date(date).toDateString()) {
          continue;
        }
        if (studentId && record.studentId.toString() !== studentId) {
          continue;
        }
        
        // Find student info
        const enrollment = course.enrolledStudents.find(
          e => e.student._id.toString() === record.studentId.toString()
        );
        
        if (enrollment) {
          courseAttendance.push({
            ...record,
            student: enrollment.student
          });
        }
      }
    }

    // Group by date and student
    const attendanceByDate = {};
    courseAttendance.forEach(record => {
      const dateKey = record.date.toDateString();
      if (!attendanceByDate[dateKey]) {
        attendanceByDate[dateKey] = [];
      }
      attendanceByDate[dateKey].push(record);
    });

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        attendance: attendanceByDate,
        summary: {
          totalRecords: courseAttendance.length,
          uniqueDates: Object.keys(attendanceByDate).length,
          enrolledStudents: course.enrolledStudents.length
        }
      }
    });

  } catch (error) {
    console.error('Get course attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance records',
      error: error.message
    });
  }
};

// Get student's attendance history
const getStudentAttendance = async (req, res) => {
  try {
    const { courseId } = req.query;
    const studentId = req.user._id;

    // Build query for student's attendance
    const studentAttendance = [];
    for (const [key, record] of attendanceRecords.entries()) {
      if (record.studentId.toString() === studentId.toString()) {
        // Filter by course if specified
        if (courseId && record.courseId.toString() !== courseId) {
          continue;
        }
        
        // Get course info
        const course = await Course.findById(record.courseId)
          .select('title courseCode professor')
          .populate('professor', 'name');
        
        if (course) {
          studentAttendance.push({
            ...record,
            course: {
              _id: course._id,
              title: course.title,
              courseCode: course.courseCode,
              professor: course.professor.name
            }
          });
        }
      }
    }

    // Sort by date (most recent first)
    studentAttendance.sort((a, b) => new Date(b.date) - new Date(a.date));

    res.json({
      success: true,
      data: {
        attendance: studentAttendance,
        summary: {
          totalRecords: studentAttendance.length,
          coursesAttended: [...new Set(studentAttendance.map(r => r.courseId.toString()))].length
        }
      }
    });

  } catch (error) {
    console.error('Get student attendance error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance history',
      error: error.message
    });
  }
};

// Get attendance statistics for a course (Professor only)
const getAttendanceStats = async (req, res) => {
  try {
    const { id } = req.params;
    const { startDate, endDate } = req.query;

    const course = await Course.findById(id)
      .populate('enrolledStudents.student', 'name studentId');

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
        message: 'You can only view statistics for your own courses'
      });
    }

    // Filter attendance records for this course
    const courseAttendance = [];
    for (const [key, record] of attendanceRecords.entries()) {
      if (record.courseId.toString() === course._id.toString()) {
        const recordDate = new Date(record.date);
        
        // Apply date filters
        if (startDate && recordDate < new Date(startDate)) continue;
        if (endDate && recordDate > new Date(endDate)) continue;
        
        courseAttendance.push(record);
      }
    }

    // Calculate statistics
    const totalSessions = [...new Set(courseAttendance.map(r => r.date.toDateString()))].length;
    const enrolledStudents = course.enrolledStudents.filter(e => e.status === 'enrolled');
    
    const studentStats = enrolledStudents.map(enrollment => {
      const studentAttendance = courseAttendance.filter(
        r => r.studentId.toString() === enrollment.student._id.toString()
      );
      
      const attendanceRate = totalSessions > 0 ? (studentAttendance.length / totalSessions) * 100 : 0;
      
      return {
        student: enrollment.student,
        attendedSessions: studentAttendance.length,
        totalSessions,
        attendanceRate: Math.round(attendanceRate * 100) / 100,
        lastAttendance: studentAttendance.length > 0 
          ? Math.max(...studentAttendance.map(r => new Date(r.date)))
          : null
      };
    });

    // Overall statistics
    const overallStats = {
      totalEnrolledStudents: enrolledStudents.length,
      totalSessions,
      averageAttendanceRate: studentStats.length > 0 
        ? Math.round((studentStats.reduce((sum, s) => sum + s.attendanceRate, 0) / studentStats.length) * 100) / 100
        : 0,
      totalAttendanceRecords: courseAttendance.length
    };

    res.json({
      success: true,
      data: {
        course: {
          _id: course._id,
          title: course.title,
          courseCode: course.courseCode
        },
        overallStats,
        studentStats,
        dateRange: {
          startDate: startDate || 'All time',
          endDate: endDate || 'Present'
        }
      }
    });

  } catch (error) {
    console.error('Get attendance stats error:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to get attendance statistics',
      error: error.message
    });
  }
};

module.exports = {
  recordAttendance,
  generateAttendanceQR,
  getCourseAttendance,
  getStudentAttendance,
  getAttendanceStats
};
