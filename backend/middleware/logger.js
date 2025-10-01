const morgan = require('morgan');
const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '..', 'logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir);
}

// Create write streams for different log files
const accessLogStream = fs.createWriteStream(
  path.join(logsDir, 'access.log'),
  { flags: 'a' }
);

const errorLogStream = fs.createWriteStream(
  path.join(logsDir, 'error.log'),
  { flags: 'a' }
);

// Custom token for user ID
morgan.token('user-id', (req) => {
  return req.user ? req.user._id : 'anonymous';
});

// Custom token for user role
morgan.token('user-role', (req) => {
  return req.user ? req.user.role : 'guest';
});

// Custom format for access logs
const accessLogFormat = ':remote-addr - :user-id [:date[clf]] ":method :url HTTP/:http-version" :status :res[content-length] ":referrer" ":user-agent" :response-time ms - :user-role';

// Custom format for error logs
const errorLogFormat = ':date[iso] ERROR :method :url :status - :user-id (:user-role) - :response-time ms';

// Development logger (console only)
const developmentLogger = morgan('dev');

// Production logger (file + console)
const productionLogger = [
  // Access logs to file
  morgan(accessLogFormat, {
    stream: accessLogStream,
    skip: (req, res) => res.statusCode >= 400
  }),
  // Error logs to separate file
  morgan(errorLogFormat, {
    stream: errorLogStream,
    skip: (req, res) => res.statusCode < 400
  }),
  // Console logging for all requests
  morgan('combined')
];

// Request logger middleware
const requestLogger = (req, res, next) => {
  const start = Date.now();
  
  // Log request details
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url} - ${req.ip}`);
  
  if (req.body && Object.keys(req.body).length > 0) {
    // Log request body (excluding sensitive data)
    const sanitizedBody = { ...req.body };
    if (sanitizedBody.password) sanitizedBody.password = '[HIDDEN]';
    if (sanitizedBody.currentPassword) sanitizedBody.currentPassword = '[HIDDEN]';
    if (sanitizedBody.newPassword) sanitizedBody.newPassword = '[HIDDEN]';
    
    console.log(`Request Body:`, JSON.stringify(sanitizedBody, null, 2));
  }
  
  // Override res.json to log response
  const originalJson = res.json;
  res.json = function(data) {
    const duration = Date.now() - start;
    console.log(`[${new Date().toISOString()}] Response ${res.statusCode} - ${duration}ms`);
    
    // Log response data (excluding sensitive information)
    if (data && typeof data === 'object') {
      const sanitizedData = { ...data };
      if (sanitizedData.data && sanitizedData.data.token) {
        sanitizedData.data = { ...sanitizedData.data, token: '[HIDDEN]' };
      }
      if (sanitizedData.data && sanitizedData.data.user && sanitizedData.data.user.password) {
        sanitizedData.data.user = { ...sanitizedData.data.user, password: '[HIDDEN]' };
      }
      console.log(`Response Data:`, JSON.stringify(sanitizedData, null, 2));
    }
    
    return originalJson.call(this, data);
  };
  
  next();
};

// Error logger middleware
const errorLogger = (error, req, res, next) => {
  const timestamp = new Date().toISOString();
  const userId = req.user ? req.user._id : 'anonymous';
  const userRole = req.user ? req.user.role : 'guest';
  
  // Log to error file
  const errorLog = `${timestamp} ERROR ${req.method} ${req.url} - User: ${userId} (${userRole}) - ${error.message}\n${error.stack}\n\n`;
  fs.appendFileSync(path.join(logsDir, 'error.log'), errorLog);
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.error(`[${timestamp}] ERROR:`, {
      method: req.method,
      url: req.url,
      userId,
      userRole,
      message: error.message,
      stack: error.stack
    });
  }
  
  next(error);
};

// API endpoint logger for specific routes
const apiLogger = (routeName) => {
  return (req, res, next) => {
    const start = Date.now();
    console.log(`[API] ${routeName} - ${req.method} ${req.originalUrl} - User: ${req.user ? req.user._id : 'anonymous'}`);
    
    res.on('finish', () => {
      const duration = Date.now() - start;
      console.log(`[API] ${routeName} completed - ${res.statusCode} - ${duration}ms`);
    });
    
    next();
  };
};

// Security logger for authentication events
const securityLogger = {
  loginAttempt: (email, success, ip, userAgent) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `${timestamp} LOGIN_${status} - Email: ${email} - IP: ${ip} - UserAgent: ${userAgent}\n`;
    
    fs.appendFileSync(path.join(logsDir, 'security.log'), logEntry);
    console.log(`[SECURITY] Login ${status.toLowerCase()} for ${email} from ${ip}`);
  },
  
  registrationAttempt: (email, success, ip) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `${timestamp} REGISTRATION_${status} - Email: ${email} - IP: ${ip}\n`;
    
    fs.appendFileSync(path.join(logsDir, 'security.log'), logEntry);
    console.log(`[SECURITY] Registration ${status.toLowerCase()} for ${email} from ${ip}`);
  },
  
  passwordChange: (userId, success, ip) => {
    const timestamp = new Date().toISOString();
    const status = success ? 'SUCCESS' : 'FAILED';
    const logEntry = `${timestamp} PASSWORD_CHANGE_${status} - User: ${userId} - IP: ${ip}\n`;
    
    fs.appendFileSync(path.join(logsDir, 'security.log'), logEntry);
    console.log(`[SECURITY] Password change ${status.toLowerCase()} for user ${userId} from ${ip}`);
  },
  
  suspiciousActivity: (description, userId, ip, details = {}) => {
    const timestamp = new Date().toISOString();
    const logEntry = `${timestamp} SUSPICIOUS_ACTIVITY - ${description} - User: ${userId || 'unknown'} - IP: ${ip} - Details: ${JSON.stringify(details)}\n`;
    
    fs.appendFileSync(path.join(logsDir, 'security.log'), logEntry);
    console.warn(`[SECURITY] Suspicious activity: ${description} from ${ip}`);
  }
};

module.exports = {
  developmentLogger,
  productionLogger,
  requestLogger,
  errorLogger,
  apiLogger,
  securityLogger
};
