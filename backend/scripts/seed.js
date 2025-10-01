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
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error.message);
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
      major: 'Computer Science',
      year: '3rd Year'
    },
    {
      name: 'Admin User',
      email: 'admin@studywave.ma',
      password: 'demo123',
      role: 'professor',
      department: 'Administration',
      jobTitle: 'System Administrator',
      office: 'ADM-100'
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
    
    console.log('\n🎉 Database seeding completed successfully!');
    console.log(`📊 Summary:`);
    console.log(`   - Users: ${users.length}`);
    console.log(`   - Courses: ${courses.length}`);
    
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
