# 🔐 StudyWave Demo Credentials

## Login Information

Use these credentials to access different parts of the StudyWave system:

### 👨‍🎓 Student Account
- **Email**: `student@studywave.ma`
- **Password**: `demo123`
- **Access**: Student Dashboard, Course Enrollment, Attendance Scanning

### 👨‍🏫 Professor Account
- **Email**: `professor@studywave.ma`
- **Password**: `demo123`
- **Access**: Professor Dashboard, Course Management, Article Creation

### 👨‍💼 Admin Account
- **Email**: `admin@studywave.ma`
- **Password**: `demo123`
- **Access**: Admin Panel, User Management, News Auto-Fetch, System Overview

## 🚀 Quick Start

1. **Start the Backend**:
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the Frontend**:
   ```bash
   cd studywave-attendance
   npm start
   ```

3. **Seed the Database** (if needed):
   ```bash
   cd backend
   npm run seed
   ```

4. **Test Credentials** (optional):
   ```bash
   cd backend
   npm run test-credentials
   ```

## 🎯 What Each Role Can Do

### Student Features
- ✅ View enrolled courses
- ✅ Scan QR codes for attendance
- ✅ Read news and announcements
- ✅ View course materials
- ✅ Track attendance history

### Professor Features
- ✅ Create and manage courses
- ✅ Generate QR codes for attendance
- ✅ View student enrollment
- ✅ Create articles and announcements
- ✅ Monitor course statistics

### Admin Features
- ✅ Manage all users (students, professors, admins)
- ✅ Create new accounts
- ✅ Manage all articles and news
- ✅ Auto-fetch news from external sources
- ✅ View system statistics
- ✅ Monitor all courses

## 🔧 Troubleshooting

### If Login Fails:
1. Make sure the backend is running on port 5000
2. Check that MongoDB is running
3. Re-seed the database: `npm run seed`
4. Test credentials: `npm run test-credentials`

### If No Data Appears:
1. Run the seed script: `npm run seed`
2. Check browser console for API errors
3. Verify backend logs for connection issues

### If CORS Errors:
1. Restart the backend server
2. Check that frontend is running on port 8081
3. Verify CORS configuration in backend/index.js

## 📱 Access URLs

- **Frontend**: http://localhost:8081
- **Backend API**: http://localhost:5000
- **Health Check**: http://localhost:5000/api/health

## 🎉 Demo Data Included

After seeding, you'll have:
- **3 Demo Users** (student, professor, admin)
- **5 Demo Courses** with different subjects
- **5 News Articles** with various categories
- **Sample Attendance Records**

Enjoy exploring StudyWave! 🌊
