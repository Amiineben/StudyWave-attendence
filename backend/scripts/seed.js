#!/usr/bin/env node

/**
 * Database seeding script for StudyWave Backend
 * This script seeds the database with demo data
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');
const Course = require('../models/Course');
const Article = require('../models/Article');

async function connectDB() {
  try {
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studywave';
    
    await mongoose.connect(mongoURI, {
      serverSelectionTimeoutMS: 5000
    });
    
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running. Please start MongoDB first:');
      console.error('   Windows: Run "mongod" or start MongoDB service');
      console.error('   macOS: brew services start mongodb-community');
      console.error('   Linux: sudo systemctl start mongod');
    }
    
    return false;
  }
}

async function clearDatabase() {
  console.log('🧹 Clearing existing data...');
  
  try {
    await User.deleteMany({});
    await Course.deleteMany({});
    await Article.deleteMany({});
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
    throw error;
  }
}

async function seedUsers() {
  console.log('👥 Creating demo users...');
  const demoUsers = [
    {
      name: 'John Professor',
      email: 'professor@studywave.ma',
      password: 'demo123',
      role: 'professor',
      department: 'Computer Science',
      jobTitle: 'Associate Professor',
      office: 'CS-201'
    },
    {
      name: 'Jane Student',
      email: 'student@studywave.ma',
      password: 'demo123',
      role: 'student',
      studentId: 'ST2024001',
      major: 'Computer Science'
    },
    {
      name: 'Admin User',
      email: 'admin@studywave.ma',
      password: 'demo123',
      role: 'admin',
      department: 'Administration',
      jobTitle: 'System Administrator',
      office: 'Admin-001'
    }
  ];

  try {
    const createdUsers = await User.create(demoUsers);
    console.log(`✅ Created ${createdUsers.length} demo users`);
    return createdUsers;
  } catch (error) {
    console.error('❌ Error creating users:', error.message);
    return [];
  }
}

async function seedCourses(users) {
  console.log('📚 Creating demo courses...');
  
  const professor = users.find(user => user.email === 'professor@studywave.ma');
  if (!professor) {
    console.error('❌ Professor user not found');
    return [];
  }

  const demoCourses = [
    {
      title: 'Introduction to Web Development',
      description: 'Learn the fundamentals of web development including HTML, CSS, JavaScript, and modern frameworks.',
      courseCode: 'CS301',
      professor: professor._id,
      department: 'Computer Science',
      credits: 3,
      semester: 'Fall',
      year: 2024,
      capacity: 30,
      schedule: {
        days: ['Monday', 'Wednesday', 'Friday'],
        startTime: '10:00',
        endTime: '11:30',
        room: 'CS-Lab-1'
      },
      prerequisites: ['CS101', 'CS102'],
      syllabus: 'This course covers modern web development technologies and practices.',
      tags: ['web', 'javascript', 'html', 'css'],
      isPublished: true
    },
    {
      title: 'Advanced JavaScript Programming',
      description: 'Deep dive into advanced JavaScript concepts, ES6+, async programming, and modern frameworks.',
      courseCode: 'CS401',
      professor: professor._id,
      department: 'Computer Science',
      credits: 4,
      semester: 'Spring',
      year: 2024,
      capacity: 25,
      schedule: {
        days: ['Tuesday', 'Thursday'],
        startTime: '14:00',
        endTime: '16:00',
        room: 'CS-Lab-2'
      },
      prerequisites: ['CS301'],
      syllabus: 'Advanced JavaScript programming concepts and modern development practices.',
      tags: ['javascript', 'advanced', 'programming'],
      isPublished: true
    }
  ];

  try {
    const createdCourses = await Course.create(demoCourses);
    console.log(`✅ Created ${createdCourses.length} demo courses`);
    
    // Update professor's created courses
    await User.findByIdAndUpdate(
      professor._id,
      { $push: { createdCourses: { $each: createdCourses.map(c => c._id) } } }
    );
    
    return createdCourses;
  } catch (error) {
    console.error('❌ Error creating courses:', error.message);
    return [];
  }
}

async function seedArticles(users) {
  console.log('📰 Creating demo articles...');
  
  const professor = users.find(u => u.role === 'professor');
  const admin = users.find(u => u.role === 'admin');
  
  const demoArticles = [
    {
      title: 'Welcome to StudyWave - New Academic Year 2024',
      summary: 'We are excited to welcome all students and faculty to the new academic year. Discover what\'s new in our platform.',
      content: `Dear StudyWave Community,

We are thrilled to welcome everyone to the 2024 academic year! This year brings exciting new features and improvements to our learning platform.

## What's New:
- Enhanced course management system
- Improved attendance tracking with QR codes
- Real-time notifications and updates
- Better mobile experience

## Getting Started:
1. Log in to your account
2. Check your enrolled courses
3. Review your class schedule
4. Download the mobile app for easy access

We wish everyone a successful and productive academic year!

Best regards,
The StudyWave Team`,
      author: admin._id,
      category: 'announcement',
      status: 'published',
      isImportant: true,
      tags: ['welcome', 'academic-year', 'announcement'],
      publishedAt: new Date('2024-09-01'),
      visibility: 'public'
    },
    {
      title: 'New Research Opportunities in Computer Science',
      summary: 'Exciting research opportunities are now available for advanced students in AI and Machine Learning.',
      content: `The Computer Science Department is pleased to announce new research opportunities for qualified students.

## Available Research Areas:
- Artificial Intelligence and Machine Learning
- Cybersecurity and Network Security
- Data Science and Big Data Analytics
- Software Engineering and Development

## Eligibility:
- GPA of 3.5 or higher
- Completed prerequisite courses
- Strong programming skills
- Passion for research

## Application Process:
Submit your application including:
1. Academic transcript
2. Research proposal (2-3 pages)
3. Two letters of recommendation
4. Portfolio of previous work

Application deadline: October 15, 2024

For more information, contact the Research Office.`,
      author: professor._id,
      category: 'news',
      status: 'published',
      isImportant: false,
      tags: ['research', 'computer-science', 'opportunities'],
      publishedAt: new Date('2024-09-15'),
      visibility: 'public'
    },
    {
      title: 'Student Achievement: Programming Competition Winners',
      summary: 'Congratulations to our students who won first place in the National Programming Competition.',
      content: `We are proud to announce that our Computer Science students have achieved remarkable success in the National Programming Competition 2024.

## Winners:
🥇 **First Place**: Team "Code Warriors"
- Sarah Johnson (Team Leader)
- Michael Chen
- Ahmed Al-Rashid

🥈 **Second Place**: Team "Debug Masters"
- Emily Rodriguez
- David Kim
- Fatima Al-Zahra

## Competition Details:
The competition involved solving complex algorithmic problems within a limited time frame. Our students demonstrated exceptional problem-solving skills and teamwork.

## Recognition:
- Cash prizes totaling $5,000
- Internship opportunities with tech companies
- Recognition certificates
- Featured in university newsletter

Congratulations to all participants and winners! You make us proud.`,
      author: admin._id,
      category: 'news',
      status: 'published',
      isImportant: true,
      tags: ['achievement', 'programming', 'competition', 'students'],
      publishedAt: new Date('2024-09-20'),
      visibility: 'public'
    },
    {
      title: 'Important: Mid-term Examination Schedule',
      summary: 'Mid-term examinations will begin on October 20th. Please review the complete schedule and exam guidelines.',
      content: `**IMPORTANT NOTICE: Mid-term Examination Schedule**

Mid-term examinations for all courses will commence on October 20th, 2024.

## Examination Period:
- **Start Date**: October 20, 2024
- **End Date**: October 30, 2024
- **Duration**: 10 days

## Important Guidelines:
1. **Student ID Required**: Bring your student ID to all exams
2. **Arrive Early**: Be present 15 minutes before exam time
3. **Materials**: Only permitted materials allowed
4. **Mobile Phones**: Must be switched off and stored away

## Schedule by Department:
- **Computer Science**: Oct 20-23
- **Mathematics**: Oct 24-26
- **Physics**: Oct 27-29
- **Engineering**: Oct 28-30

## Exam Locations:
Check your student portal for specific room assignments.

## Make-up Exams:
Students with valid reasons for missing exams must contact the Academic Office within 48 hours.

Good luck to all students!`,
      author: admin._id,
      category: 'announcement',
      status: 'published',
      isImportant: true,
      tags: ['exams', 'midterm', 'schedule', 'important'],
      publishedAt: new Date('2024-10-01'),
      visibility: 'public'
    },
    {
      title: 'New Library Resources and Study Spaces',
      summary: 'The university library has added new digital resources and renovated study spaces for better learning experience.',
      content: `The University Library is pleased to announce significant improvements to our facilities and resources.

## New Digital Resources:
- **IEEE Xplore Digital Library**: Full access to engineering and technology papers
- **ACM Digital Library**: Computer science research database
- **Springer Nature**: Scientific journals and books
- **O'Reilly Learning Platform**: Technical books and courses

## Renovated Study Spaces:
- **Silent Study Hall**: 50 individual study desks
- **Group Study Rooms**: 10 bookable rooms for team projects
- **Computer Lab**: 30 high-performance workstations
- **Relaxation Area**: Comfortable seating with natural lighting

## New Services:
- 24/7 digital access to resources
- Online booking system for study rooms
- Extended hours during exam periods
- Research assistance appointments

## How to Access:
1. Log in with your student credentials
2. Visit library.studywave.ma
3. Browse available resources
4. Book study spaces online

Visit the library help desk for orientation sessions.`,
      author: professor._id,
      category: 'news',
      status: 'published',
      isImportant: false,
      tags: ['library', 'resources', 'study-spaces', 'digital'],
      publishedAt: new Date('2024-09-25'),
      visibility: 'public'
    }
  ];

  try {
    const createdArticles = await Article.create(demoArticles);
    console.log(`✅ Created ${createdArticles.length} demo articles`);
    return createdArticles;
  } catch (error) {
    console.error('❌ Error creating articles:', error.message);
    return [];
  }
}

async function seedDatabase() {
  console.log('🌱 Starting database seeding...\n');
  
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    // Clear existing data
    await clearDatabase();
    
    // Seed users
    const users = await seedUsers();
    
    // Seed courses
    const courses = await seedCourses(users);
    
    // Seed articles
    const articles = await seedArticles(users);
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Courses: ${courses.length}`);
    console.log(`   - Articles: ${articles.length}`);
    
    console.log('\n🔐 Demo Login Credentials:');
    console.log('   Professor: professor@studywave.ma / demo123');
    console.log('   Student: student@studywave.ma / demo123');
    console.log('   Admin: admin@studywave.ma / demo123');
    
  } catch (error) {
    console.error('❌ Seeding failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Seeding failed:', err);
  process.exit(1);
});

// Run seeding
seedDatabase().catch(console.error);
