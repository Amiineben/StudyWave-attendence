# StudyWave Full-Stack Integration Guide

## 🎉 Integration Complete!

The StudyWave application has been successfully integrated with a complete backend API. All frontend components now use real backend data instead of mock data.

## 📋 What's Been Integrated

### ✅ **Backend API (Express.js + MongoDB)**
- **Authentication System**: JWT-based auth with role-based access control
- **User Management**: Registration, login, profile management
- **Course Management**: CRUD operations, enrollment/dropping
- **Article System**: Content management with categories and interactions
- **QR Code Attendance**: Real-time attendance tracking
- **Security**: Rate limiting, input validation, error handling

### ✅ **Frontend Integration (React + TypeScript)**
- **AuthContext**: Updated to use real API endpoints
- **API Service Layer**: Centralized API communication
- **Student Dashboard**: Real course enrollment and profile management
- **Scanner Page**: QR code attendance with backend integration
- **News Page**: Article loading from backend
- **Error Handling**: Proper loading states and error messages

## 🚀 Getting Started

### **1. Start the Backend**

```bash
# Navigate to backend directory
cd "c:\Users\0\Downloads\studyWave react\backend"

# Install dependencies (if not already done)
npm install

# Start MongoDB (make sure it's running)
# Windows: mongod or start MongoDB service
# macOS: brew services start mongodb-community
# Linux: sudo systemctl start mongod

# Start the backend server
npm run dev
```

The backend will be available at: `http://localhost:5000`

### **2. Start the Frontend**

```bash
# Navigate to frontend directory
cd "c:\Users\0\Downloads\studyWave react\studywave-attendance"

# Install dependencies (if not already done)
npm install

# Start the frontend development server
npm run dev
```

The frontend will be available at: `http://localhost:3000`

## 🔐 Demo Accounts

The backend has been seeded with demo accounts:

### **Professor Account**
- **Email**: `professor@studywave.ma`
- **Password**: `demo123`
- **Capabilities**: Create courses, manage articles, generate QR codes

### **Student Account**
- **Email**: `student@studywave.ma`
- **Password**: `demo123`
- **Capabilities**: Enroll in courses, scan QR codes, view content

### **Admin Account**
- **Email**: `admin@studywave.ma`
- **Password**: `demo123`
- **Capabilities**: System administration

## 🧪 Testing the Integration

### **1. Authentication Flow**
1. Open `http://localhost:3000`
2. Click "Login" and use demo credentials
3. Verify profile information loads from backend
4. Test logout functionality

### **2. Course Management**
**As Professor:**
1. Login with professor account
2. Navigate to dashboard
3. Create a new course
4. Publish the course
5. Generate QR code for attendance

**As Student:**
1. Login with student account
2. Browse available courses
3. Enroll in a course
4. View enrolled courses in dashboard

### **3. QR Code Attendance**
1. **Professor**: Generate QR code from course dashboard
2. **Student**: Use scanner page to scan QR code
3. Verify attendance is recorded in backend
4. Check attendance history

### **4. Article System**
1. **Professor**: Create and publish articles
2. **Student**: View articles in news page
3. Test article interactions (likes, comments)

## 📡 API Endpoints

### **Authentication**
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update profile

### **Courses**
- `GET /api/courses` - Get all courses
- `POST /api/courses` - Create course (Professor)
- `POST /api/courses/:id/enroll` - Enroll in course (Student)
- `GET /api/courses/my/courses` - Get user's courses

### **Articles**
- `GET /api/articles` - Get all articles
- `POST /api/articles` - Create article (Professor)
- `POST /api/articles/:id/like` - Like article
- `POST /api/articles/:id/comments` - Add comment

### **Attendance**
- `POST /api/attendance/record` - Record attendance (Student)
- `POST /api/attendance/generate-qr/:id` - Generate QR code (Professor)
- `GET /api/attendance/my-attendance` - Get attendance history

## 🔧 Configuration

### **Backend Configuration** (`backend/.env`)
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studywave
JWT_SECRET=your-super-secret-jwt-key
JWT_EXPIRES_IN=7d
FRONTEND_URL=http://localhost:3000
```

### **Frontend Configuration** (`studywave-attendance/.env`)
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=StudyWave
REACT_APP_VERSION=1.0.0
```

## 🐛 Troubleshooting

### **Backend Issues**
- **MongoDB Connection Error**: Ensure MongoDB is running
- **Port Already in Use**: Change PORT in `.env` file
- **CORS Errors**: Check FRONTEND_URL in backend `.env`

### **Frontend Issues**
- **API Connection Failed**: Verify backend is running on port 5000
- **Authentication Errors**: Check JWT_SECRET configuration
- **Build Errors**: Run `npm install` to ensure all dependencies

### **Common Solutions**
```bash
# Clear npm cache
npm cache clean --force

# Reinstall dependencies
rm -rf node_modules package-lock.json
npm install

# Check if ports are available
netstat -an | findstr :5000
netstat -an | findstr :3000
```

## 📊 Database Schema

### **Users Collection**
```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: "student" | "professor",
  studentId: String (for students),
  major: String,
  department: String,
  enrolledCourses: [ObjectId],
  createdCourses: [ObjectId]
}
```

### **Courses Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  courseCode: String (unique),
  professor: ObjectId,
  department: String,
  capacity: Number,
  enrolledStudents: [{
    student: ObjectId,
    enrolledAt: Date,
    status: "enrolled" | "dropped"
  }],
  isPublished: Boolean
}
```

### **Articles Collection**
```javascript
{
  _id: ObjectId,
  title: String,
  content: String,
  author: ObjectId,
  course: ObjectId,
  category: String,
  status: "published" | "draft",
  likes: [{ user: ObjectId, likedAt: Date }],
  comments: [{ user: ObjectId, content: String, createdAt: Date }]
}
```

## 🚀 Deployment

### **Backend Deployment**
1. Set up MongoDB Atlas or production MongoDB
2. Update environment variables for production
3. Deploy to Heroku, DigitalOcean, or AWS
4. Configure CORS for production frontend URL

### **Frontend Deployment**
1. Update `REACT_APP_API_URL` to production backend URL
2. Build the application: `npm run build`
3. Deploy to Netlify, Vercel, or AWS S3

## 📈 Next Steps

### **Potential Enhancements**
1. **File Upload**: Add support for course materials and article attachments
2. **Real-time Notifications**: WebSocket integration for live updates
3. **Advanced Analytics**: Attendance reports and course statistics
4. **Mobile App**: React Native version for mobile access
5. **Email Integration**: Automated notifications and reminders

### **Security Improvements**
1. **Rate Limiting**: Implement per-user rate limiting
2. **Input Sanitization**: Enhanced XSS protection
3. **Audit Logging**: Track all user actions
4. **Two-Factor Authentication**: Enhanced security for accounts

## 🎯 Success Metrics

The integration is successful if:
- ✅ Users can register and login with real authentication
- ✅ Professors can create and manage courses
- ✅ Students can enroll in courses and view their dashboard
- ✅ QR code attendance system works end-to-end
- ✅ Articles can be created, viewed, and interacted with
- ✅ All data persists in MongoDB
- ✅ Error handling works properly
- ✅ Loading states provide good user experience

## 🆘 Support

If you encounter any issues:
1. Check the browser console for frontend errors
2. Check the backend terminal for server errors
3. Verify MongoDB is running and accessible
4. Ensure all environment variables are set correctly
5. Test API endpoints directly using Postman or curl

The StudyWave application is now fully integrated and ready for use! 🎉
