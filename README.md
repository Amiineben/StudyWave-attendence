# 🎓 StudyWave - Complete Full-Stack Educational Platform

A modern, full-featured educational management system built with React, TypeScript, Express.js, and MongoDB.

## 🌟 Features

### 👨‍🎓 **For Students**
- **Course Enrollment**: Browse and enroll in available courses
- **QR Code Attendance**: Scan QR codes to mark attendance
- **Dashboard**: View enrolled courses and attendance history
- **Profile Management**: Update personal information and academic details
- **News & Articles**: Access educational content and announcements

### 👨‍🏫 **For Professors**
- **Course Management**: Create, update, and manage courses
- **QR Code Generation**: Generate attendance QR codes for classes
- **Article Publishing**: Create and publish educational content
- **Student Management**: View enrolled students and attendance records
- **Analytics**: Track course engagement and attendance statistics

### 🔐 **Security & Authentication**
- JWT-based authentication with role-based access control
- Secure password hashing with bcrypt
- Rate limiting and input validation
- CORS protection and security headers

## 🏗️ Architecture

### **Frontend** (React + TypeScript)
- **Framework**: React 18 with TypeScript
- **UI Library**: Tailwind CSS + shadcn/ui components
- **State Management**: React Context API
- **Routing**: React Router v6
- **API Client**: Custom API service layer
- **QR Code**: QR Scanner integration

### **Backend** (Express.js + MongoDB)
- **Framework**: Express.js with TypeScript support
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT tokens with bcrypt password hashing
- **Validation**: Express Validator for input validation
- **Security**: Helmet, CORS, Rate Limiting
- **Logging**: Morgan with custom security logging

## 🚀 Quick Start

### **Prerequisites**
- Node.js (v16 or higher)
- MongoDB (local or Atlas)
- Git

### **1. Clone & Setup**
```bash
# The project is already set up in your Downloads folder
cd "c:\Users\0\Downloads\studyWave react"
```

### **2. Easy Startup (Windows)**
```bash
# Double-click the startup script
start-studywave.bat
```

### **3. Manual Startup**

**Backend:**
```bash
cd backend
npm install
npm run dev
```

**Frontend:**
```bash
cd studywave-attendance
npm install
npm run dev
```

### **4. Access the Application**
- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:5000
- **API Health**: http://localhost:5000/api/health

## 🔑 Demo Accounts

| Role | Email | Password | Capabilities |
|------|-------|----------|--------------|
| **Professor** | professor@studywave.ma | demo123 | Create courses, manage content, generate QR codes |
| **Student** | student@studywave.ma | demo123 | Enroll in courses, scan attendance, view content |
| **Admin** | admin@studywave.ma | demo123 | System administration |

## 📱 Key Functionality

### **Authentication Flow**
1. Register/Login with role selection (Student/Professor)
2. JWT token-based session management
3. Role-based access to features
4. Profile management with role-specific fields

### **Course Management**
1. **Professors**: Create courses with schedules, capacity, prerequisites
2. **Students**: Browse published courses and enroll
3. **Enrollment**: Real-time capacity tracking and waitlists
4. **QR Codes**: Generate unique codes for attendance tracking

### **Attendance System**
1. **QR Generation**: Professors create time-limited QR codes
2. **QR Scanning**: Students scan codes to mark attendance
3. **Real-time Tracking**: Immediate attendance recording
4. **Analytics**: Attendance reports and statistics

### **Content Management**
1. **Articles**: Rich content creation with categories
2. **Interactions**: Like, comment, and share articles
3. **Visibility**: Public, course-only, or private content
4. **Search**: Full-text search across all content

## 🛠️ Technical Details

### **API Endpoints**
- **Authentication**: `/api/auth/*`
- **Courses**: `/api/courses/*`
- **Articles**: `/api/articles/*`
- **Attendance**: `/api/attendance/*`

### **Database Collections**
- **Users**: Student and professor profiles
- **Courses**: Course information and enrollments
- **Articles**: Educational content and interactions
- **Attendance**: QR-based attendance records

### **Security Features**
- Password hashing with bcrypt (12 rounds)
- JWT tokens with configurable expiration
- Rate limiting (100 requests per 15 minutes)
- Input validation and sanitization
- CORS protection with configurable origins

## 📊 Project Structure

```
studyWave react/
├── backend/                 # Express.js API Server
│   ├── controllers/         # Request handlers
│   ├── middleware/          # Auth, validation, logging
│   ├── models/             # MongoDB schemas
│   ├── routes/             # API route definitions
│   ├── services/           # Business logic
│   └── utils/              # Helper functions
├── studywave-attendance/   # React Frontend
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── contexts/       # React contexts (Auth, Language)
│   │   ├── pages/          # Main application pages
│   │   ├── services/       # API communication layer
│   │   └── utils/          # Frontend utilities
│   └── public/             # Static assets
└── docs/                   # Documentation
```

## 🔧 Configuration

### **Environment Variables**

**Backend** (`.env`):
```env
NODE_ENV=development
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/studywave
JWT_SECRET=your-super-secret-jwt-key
FRONTEND_URL=http://localhost:3000
```

**Frontend** (`.env`):
```env
REACT_APP_API_URL=http://localhost:5000/api
REACT_APP_NAME=StudyWave
```

## 🧪 Testing

### **Manual Testing Checklist**
- [ ] User registration and login
- [ ] Course creation and enrollment
- [ ] QR code generation and scanning
- [ ] Article creation and interaction
- [ ] Profile management
- [ ] Attendance tracking

### **API Testing**
Use the provided Postman collection or test endpoints directly:
```bash
# Health check
curl http://localhost:5000/api/health

# Login
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"student@studywave.ma","password":"demo123"}'
```

## 🚀 Deployment

### **Production Checklist**
- [ ] Set up production MongoDB (Atlas recommended)
- [ ] Configure production environment variables
- [ ] Set up SSL certificates
- [ ] Configure production CORS origins
- [ ] Set up monitoring and logging
- [ ] Configure backup strategies

### **Deployment Options**
- **Backend**: Heroku, DigitalOcean, AWS EC2
- **Frontend**: Netlify, Vercel, AWS S3 + CloudFront
- **Database**: MongoDB Atlas, AWS DocumentDB

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support and questions:
1. Check the [Integration Guide](INTEGRATION_GUIDE.md)
2. Review the API documentation
3. Check the browser console for frontend errors
4. Check the backend logs for server errors

## 🎯 Roadmap

### **Phase 1** ✅ (Completed)
- [x] Full-stack authentication system
- [x] Course management with enrollment
- [x] QR code attendance tracking
- [x] Article/content management system
- [x] Role-based access control

### **Phase 2** (Future)
- [ ] File upload and management
- [ ] Real-time notifications
- [ ] Advanced analytics dashboard
- [ ] Mobile application (React Native)
- [ ] Email integration
- [ ] Calendar integration
- [ ] Advanced reporting system

---

**StudyWave** - Empowering education through technology! 🎓✨
