/**
 * Test Registration Script
 * Tests the user registration and login process
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

async function testRegistration() {
  console.log('🧪 Testing User Registration Process...\n');
  
  const testEmail = 'test@studywave.ma';
  const testPassword = 'testpass123';
  
  try {
    // Step 1: Clean up any existing test user
    console.log('🧹 Cleaning up existing test user...');
    await User.deleteOne({ email: testEmail });
    console.log('✅ Cleanup completed');
    
    // Step 2: Create new user directly (simulating registration)
    console.log('\n👤 Creating new user...');
    const newUser = new User({
      name: 'Test User',
      email: testEmail,
      password: testPassword,
      role: 'student'
    });
    
    console.log('📝 User data before save:', {
      name: newUser.name,
      email: newUser.email,
      role: newUser.role,
      passwordLength: newUser.password.length
    });
    
    // Save user (this should trigger password hashing)
    await newUser.save();
    console.log('✅ User created successfully');
    console.log('🔐 Password hashed:', newUser.password !== testPassword);
    
    // Step 3: Test finding the user
    console.log('\n🔍 Testing user lookup...');
    const foundUser = await User.findByEmail(testEmail).select('+password');
    
    if (!foundUser) {
      console.log('❌ User not found after creation');
      return;
    }
    
    console.log('✅ User found:', {
      name: foundUser.name,
      email: foundUser.email,
      role: foundUser.role,
      isActive: foundUser.isActive,
      hashedPassword: foundUser.password.substring(0, 20) + '...'
    });
    
    // Step 4: Test password comparison
    console.log('\n🔐 Testing password verification...');
    const isPasswordValid = await foundUser.comparePassword(testPassword);
    console.log('✅ Password comparison result:', isPasswordValid);
    
    if (!isPasswordValid) {
      console.log('❌ Password verification failed!');
      
      // Debug: Try manual bcrypt comparison
      console.log('\n🔍 Debug: Manual bcrypt comparison...');
      const manualCheck = await bcrypt.compare(testPassword, foundUser.password);
      console.log('Manual bcrypt result:', manualCheck);
      
      // Check if password was hashed properly
      console.log('Original password:', testPassword);
      console.log('Stored password hash:', foundUser.password);
      console.log('Hash starts with $2b$:', foundUser.password.startsWith('$2b$'));
    } else {
      console.log('✅ Password verification successful!');
    }
    
    // Step 5: Test login simulation
    console.log('\n🚪 Testing login simulation...');
    if (foundUser.isActive && isPasswordValid) {
      console.log('✅ Login would succeed');
      
      // Test updateLastLogin
      await foundUser.updateLastLogin();
      console.log('✅ Last login updated');
    } else {
      console.log('❌ Login would fail');
      console.log('  - Is Active:', foundUser.isActive);
      console.log('  - Password Valid:', isPasswordValid);
    }
    
  } catch (error) {
    console.error('❌ Registration test failed:', error);
    console.error('Error details:', {
      name: error.name,
      message: error.message,
      stack: error.stack?.split('\n')[0]
    });
  }
}

async function testExistingUsers() {
  console.log('\n🔍 Testing existing demo users...\n');
  
  const demoEmails = ['admin@studywave.ma', 'professor@studywave.ma', 'student@studywave.ma'];
  
  for (const email of demoEmails) {
    try {
      console.log(`Testing ${email}:`);
      
      const user = await User.findByEmail(email).select('+password');
      if (!user) {
        console.log(`❌ User not found: ${email}`);
        continue;
      }
      
      const isPasswordValid = await user.comparePassword('demo123');
      console.log(`  ✅ Found: ${user.name} (${user.role})`);
      console.log(`  🔐 Password valid: ${isPasswordValid}`);
      console.log(`  🟢 Active: ${user.isActive}`);
      console.log('');
      
    } catch (error) {
      console.log(`❌ Error testing ${email}:`, error.message);
    }
  }
}

async function main() {
  // Connect to database
  const connected = await connectDB();
  if (!connected) {
    process.exit(1);
  }
  
  try {
    await testRegistration();
    await testExistingUsers();
    
    console.log('\n🎉 Registration testing completed!');
    
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

module.exports = { testRegistration };
