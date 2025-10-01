const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const compression = require('compression');

// Import database configuration
const { connectDB, checkDBHealth, seedDatabase } = require('./config/database');

// Import routes
const authRoutes = require('./routes/authRoutes');
const courseRoutes = require('./routes/courseRoutes');
const articleRoutes = require('./routes/articleRoutes');
const attendanceRoutes = require('./routes/attendanceRoutes');
const newsRoutes = require('./routes/newsRoutes');

// Import middleware
const { developmentLogger, productionLogger, errorLogger } = require('./middleware/logger');

// Load environment variables
dotenv.config();

// Set default environment variables if not provided
process.env.NODE_ENV = process.env.NODE_ENV || 'development';
process.env.JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-this-in-production';
process.env.JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';
process.env.FRONTEND_URL = process.env.FRONTEND_URL || 'http://localhost:3000';

const app = express();
const PORT = process.env.PORT || 5000;

// Security middleware
app.use(helmet());

// Compression middleware
app.use(compression());

// Rate limiting
const limiter = rateLimit({
  windowMs: process.env.RATE_LIMIT_WINDOW_MS || 15 * 60 * 1000, // 15 minutes
  max: process.env.RATE_LIMIT_MAX_REQUESTS || 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.'
  },
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
});
app.use(limiter);

// CORS configuration with debugging
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:3000',
  'http://localhost:8081', // Vite dev server default port
  'http://localhost:5173', // Vite alternative port
  'http://127.0.0.1:8081',
  'http://127.0.0.1:3000'
];

console.log('🌐 CORS allowed origins:', allowedOrigins);

app.use(cors({
  origin: function (origin, callback) {
    // Allow requests with no origin (like mobile apps or curl requests)
    if (!origin) return callback(null, true);
    
    console.log('🔍 CORS request from origin:', origin);
    
    if (allowedOrigins.indexOf(origin) !== -1) {
      console.log('✅ CORS origin allowed:', origin);
      callback(null, true);
    } else {
      console.log('❌ CORS origin blocked:', origin);
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Logging middleware
if (process.env.NODE_ENV === 'production') {
  app.use(productionLogger);
} else {
  app.use(developmentLogger);
}

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Initialize database connection
const initializeApp = async () => {
  try {
    await connectDB();
    
    // Seed database with demo data if needed
    if (process.env.SEED_DATABASE === 'true') {
      await seedDatabase();
    }
  } catch (error) {
    console.error('Failed to initialize application:', error);
    process.exit(1);
  }
};

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/courses', courseRoutes);
app.use('/api/articles', articleRoutes);
app.use('/api/attendance', attendanceRoutes);
app.use('/api/news', newsRoutes);

// Health check endpoint
app.get('/api/health', async (req, res) => {
  try {
    const dbHealth = await checkDBHealth();
    res.status(200).json({
      status: 'OK',
      message: 'StudyWave API is running',
      database: dbHealth,
      environment: process.env.NODE_ENV || 'development',
      version: '1.0.0',
      timestamp: new Date().toISOString()
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

// Demo credentials endpoint
app.get('/api/demo-credentials', async (req, res) => {
  try {
    const User = require('./models/User');
    
    const demoUsers = await User.find({
      email: { $in: ['admin@studywave.ma', 'professor@studywave.ma', 'student@studywave.ma'] }
    }).select('name email role department studentId');
    
    const credentials = demoUsers.map(user => ({
      role: user.role,
      email: user.email,
      password: 'demo123',
      name: user.name,
      department: user.department,
      studentId: user.studentId
    }));
    
    res.status(200).json({
      success: true,
      message: 'Demo credentials available',
      data: {
        credentials,
        instructions: {
          frontend: 'http://localhost:8081',
          backend: 'http://localhost:5000',
          login: 'Use email and password to login'
        }
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Failed to get demo credentials',
      error: error.message
    });
  }
});

// Error logging middleware
app.use(errorLogger);

// Global error handler
app.use((error, req, res, next) => {
  console.error('Error:', error);
  
  if (error.name === 'ValidationError') {
    return res.status(400).json({
      success: false,
      message: 'Validation Error',
      errors: Object.values(error.errors).map(err => err.message)
    });
  }
  
  if (error.name === 'CastError') {
    return res.status(400).json({
      success: false,
      message: 'Invalid ID format'
    });
  }
  
  if (error.code === 11000) {
    return res.status(400).json({
      success: false,
      message: 'Duplicate field value entered'
    });
  }
  
  if (error.name === 'JsonWebTokenError') {
    return res.status(401).json({
      success: false,
      message: 'Invalid token'
    });
  }
  
  if (error.name === 'TokenExpiredError') {
    return res.status(401).json({
      success: false,
      message: 'Token expired'
    });
  }
  
  res.status(error.statusCode || 500).json({
    success: false,
    message: error.message || 'Internal Server Error'
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    availableRoutes: [
      '/api/auth',
      '/api/courses', 
      '/api/articles',
      '/api/attendance',
      '/api/health'
    ]
  });
});

// Start server
const startServer = async () => {
  try {
    await initializeApp();
    
    app.listen(PORT, () => {
      console.log(`🚀 StudyWave API server running on port ${PORT}`);
      console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
      console.log(`🌐 Health check: http://localhost:${PORT}/api/health`);
      console.log(`📚 API Documentation: http://localhost:${PORT}/api/`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
};

startServer();