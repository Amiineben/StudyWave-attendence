const mongoose = require('mongoose');

// Database connection configuration
const connectDB = async () => {
  try {
    // Default MongoDB URI for development
    const mongoURI = process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/studywave';
    
    const options = {
      maxPoolSize: 10, // Maintain up to 10 socket connections
      serverSelectionTimeoutMS: 5000, // Keep trying to send operations for 5 seconds
      socketTimeoutMS: 45000, // Close sockets after 45 seconds of inactivity
      family: 4 // Use IPv4, skip trying IPv6
    };

    const conn = await mongoose.connect(mongoURI, options);

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`Database Name: ${conn.connection.name}`);
    
    // Connection event listeners
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Handle application termination
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

    return conn;
  } catch (error) {
    console.error('❌ Database connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('💡 Make sure MongoDB is running on your system');
      console.error('   - Windows: Start MongoDB service or run `mongod`');
      console.error('   - macOS: Run `brew services start mongodb-community`');
      console.error('   - Linux: Run `sudo systemctl start mongod`');
    }
    
    process.exit(1);
  }
};

// Database health check
const checkDBHealth = async () => {
  try {
    const state = mongoose.connection.readyState;
    const states = {
      0: 'disconnected',
      1: 'connected',
      2: 'connecting',
      3: 'disconnecting'
    };
    
    return {
      status: states[state] || 'unknown',
      host: mongoose.connection.host,
      name: mongoose.connection.name,
      collections: Object.keys(mongoose.connection.collections).length
    };
  } catch (error) {
    return {
      status: 'error',
      error: error.message
    };
  }
};

// Clear database (for testing purposes)
const clearDatabase = async () => {
  if (process.env.NODE_ENV !== 'test') {
    throw new Error('Database clearing is only allowed in test environment');
  }
  
  try {
    const collections = mongoose.connection.collections;
    
    for (const key in collections) {
      const collection = collections[key];
      await collection.deleteMany({});
    }
    
    console.log('Database cleared successfully');
  } catch (error) {
    console.error('Error clearing database:', error);
    throw error;
  }
};

// Seed initial data
const seedDatabase = async () => {
  try {
    const User = require('../models/User');
    const Course = require('../models/Course');
    
    // Check if data already exists
    const userCount = await User.countDocuments();
    if (userCount > 0) {
      console.log('Database already contains data, skipping seed');
      return;
    }

    // Create demo users
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

    const createdUsers = await User.create(demoUsers);
    console.log(`Created ${createdUsers.length} demo users`);

    // Create demo course
    const professor = createdUsers.find(user => user.email === 'professor@studywave.ma');
    const demoCourse = {
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
    };

    const createdCourse = await Course.create(demoCourse);
    console.log(`Created demo course: ${createdCourse.title}`);

    // Update professor's created courses
    await User.findByIdAndUpdate(
      professor._id,
      { $push: { createdCourses: createdCourse._id } }
    );

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    throw error;
  }
};

module.exports = {
  connectDB,
  checkDBHealth,
  clearDatabase,
  seedDatabase
};
