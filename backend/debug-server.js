/**
 * Debug Server - Step by step loading
 */

console.log('🔍 Starting debug server...');

try {
  console.log('1. Loading basic modules...');
  const express = require('express');
  const cors = require('cors');
  const dotenv = require('dotenv');
  console.log('✅ Basic modules loaded');

  console.log('2. Loading environment...');
  dotenv.config();
  console.log('✅ Environment loaded');

  console.log('3. Creating Express app...');
  const app = express();
  const PORT = process.env.PORT || 5000;
  console.log('✅ Express app created');

  console.log('4. Loading database config...');
  const { connectDB, checkDBHealth } = require('./config/database');
  console.log('✅ Database config loaded');

  console.log('5. Loading middleware...');
  const { developmentLogger, productionLogger, errorLogger } = require('./middleware/logger');
  console.log('✅ Logger middleware loaded');

  console.log('6. Loading auth routes...');
  const authRoutes = require('./routes/authRoutes');
  console.log('✅ Auth routes loaded');

  console.log('7. Loading other routes...');
  const courseRoutes = require('./routes/courseRoutes');
  console.log('✅ Course routes loaded');
  
  const articleRoutes = require('./routes/articleRoutes');
  console.log('✅ Article routes loaded');
  
  const attendanceRoutes = require('./routes/attendanceRoutes');
  console.log('✅ Attendance routes loaded');
  
  const newsRoutes = require('./routes/newsRoutes');
  console.log('✅ News routes loaded');

  console.log('8. Setting up middleware...');
  app.use(cors({
    origin: ['http://localhost:8081', 'http://127.0.0.1:8081'],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  }));
  
  app.use(express.json({ limit: '10mb' }));
  app.use(express.urlencoded({ extended: true, limit: '10mb' }));
  console.log('✅ Basic middleware set up');

  console.log('9. Setting up routes...');
  app.use('/api/auth', authRoutes);
  app.use('/api/courses', courseRoutes);
  app.use('/api/articles', articleRoutes);
  app.use('/api/attendance', attendanceRoutes);
  app.use('/api/news', newsRoutes);
  console.log('✅ Routes set up');

  console.log('10. Adding health check...');
  app.get('/api/health', async (req, res) => {
    try {
      const dbHealth = await checkDBHealth();
      res.status(200).json({
        status: 'OK',
        message: 'StudyWave API is running',
        timestamp: new Date().toISOString(),
        database: dbHealth,
        environment: process.env.NODE_ENV || 'development',
        version: '1.0.0'
      });
    } catch (error) {
      res.status(500).json({
        status: 'ERROR',
        message: 'Health check failed',
        timestamp: new Date().toISOString(),
        error: error.message
      });
    }
  });
  console.log('✅ Health check added');

  console.log('11. Starting server...');
  app.listen(PORT, () => {
    console.log(`🚀 Debug server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
  });

} catch (error) {
  console.error('❌ Error during server startup:', error);
  console.error('Stack trace:', error.stack);
  process.exit(1);
}

// Error handling
process.on('uncaughtException', (error) => {
  console.error('❌ Uncaught Exception:', error);
  process.exit(1);
});

process.on('unhandledRejection', (error) => {
  console.error('❌ Unhandled Rejection:', error);
  process.exit(1);
});
