const mongoose = require('mongoose');

async function testConnection() {
  try {
    console.log('Testing MongoDB connection...');
    
    const conn = await mongoose.connect('mongodb://127.0.0.1:27017/studywave-test', {
      serverSelectionTimeoutMS: 3000
    });
    
    console.log('✅ MongoDB is running and accessible');
    console.log(`Connected to: ${conn.connection.host}:${conn.connection.port}`);
    console.log(`Database: ${conn.connection.name}`);
    
    await mongoose.connection.close();
    console.log('Connection closed');
    
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error.message);
    
    if (error.message.includes('ECONNREFUSED')) {
      console.error('\n💡 MongoDB is not running. Please start MongoDB:');
      console.error('   Windows: Run "mongod" in command prompt or start MongoDB service');
      console.error('   macOS: brew services start mongodb-community');
      console.error('   Linux: sudo systemctl start mongod');
      console.error('\n   Or install MongoDB from: https://www.mongodb.com/try/download/community');
    }
  }
}

testConnection();
