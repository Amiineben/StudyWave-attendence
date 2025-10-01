/**
 * Test Demo Credentials Script
 * Verifies that demo users can login successfully
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
require('dotenv').config();

// Import models
const User = require('../models/User');

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
    return false;
  }
}

async function testCredentials() {
  console.log('🔐 Testing Demo Credentials...\n');
  
  const testUsers = [
    { email: 'admin@studywave.ma', password: 'demo123', role: 'admin' },
    { email: 'professor@studywave.ma', password: 'demo123', role: 'professor' },
    { email: 'student@studywave.ma', password: 'demo123', role: 'student' }
  ];

  for (const testUser of testUsers) {
    try {
      console.log(`Testing ${testUser.role}: ${testUser.email}`);
      
      // Find user in database
      const user = await User.findOne({ email: testUser.email }).select('+password');
      
      if (!user) {
        console.log(`❌ User not found: ${testUser.email}`);
        continue;
      }
      
      // Test password
      const isPasswordValid = await user.comparePassword(testUser.password);
      
      if (isPasswordValid) {
        console.log(`✅ Login successful: ${testUser.email}`);
        console.log(`   - Name: ${user.name}`);
        console.log(`   - Role: ${user.role}`);
        console.log(`   - Department: ${user.department || 'N/A'}`);
        console.log(`   - Student ID: ${user.studentId || 'N/A'}`);
      } else {
        console.log(`❌ Invalid password: ${testUser.email}`);
      }
      
    } catch (error) {
      console.log(`❌ Error testing ${testUser.email}:`, error.message);
    }
    
    console.log(''); // Empty line for readability
  }
}

async function main() {
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await testCredentials();
    
    console.log('🎉 Credential testing completed!');
    console.log('\n📋 Demo Login Credentials:');
    console.log('   👨‍🎓 Student: student@studywave.ma / demo123');
    console.log('   👨‍🏫 Professor: professor@studywave.ma / demo123');
    console.log('   👨‍💼 Admin: admin@studywave.ma / demo123');
    
  } catch (error) {
    console.error('❌ Testing failed:', error);
  } finally {
    await mongoose.connection.close();
    console.log('\n📴 Database connection closed');
  }
}

// Handle errors
process.on('unhandledRejection', (err) => {
  console.error('Unhandled Promise Rejection:', err);
  process.exit(1);
});

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception:', err);
  process.exit(1);
});

// Run the script
if (require.main === module) {
  main();
}

module.exports = { testCredentials };
