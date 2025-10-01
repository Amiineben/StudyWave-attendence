# StudyWave API Documentation

## Base URL
```
http://localhost:5000/api
```

## Authentication
All protected endpoints require a JWT token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow this structure:
```json
{
  "success": boolean,
  "message": string,
  "data": object | null,
  "meta": object | null
}
```

---

## Authentication Endpoints

### POST /auth/register
Register a new user account.

**Request Body:**
```json
{
  "name": "John Doe",
  "email": "john@example.com", 
  "password": "password123",
  "role": "student" // or "professor"
}
```

**Response:**
```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "isActive": true,
      "createdAt": "2024-01-01T00:00:00.000Z"
    },
    "token": "jwt_token_here"
  }
}
```

### POST /auth/login
Authenticate user and get access token.

**Request Body:**
```json
{
  "email": "john@example.com",
  "password": "password123"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student"
    },
    "token": "jwt_token_here"
  }
}
```

### GET /auth/profile
Get current user profile. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "role": "student",
      "avatar": "avatar_url",
      "phone": "+1234567890",
      "studentId": "ST2024001",
      "major": "Computer Science",
      "year": "3rd Year",
      "enrolledCourses": [...],
      "profileCompletion": 85
    }
  }
}
```

### PUT /auth/profile
Update user profile. **Requires authentication.**

**Request Body:**
```json
{
  "name": "John Updated",
  "avatar": "new_avatar_url",
  "phone": "+1234567890",
  "studentId": "ST2024001",
  "major": "Computer Science",
  "year": "4th Year"
}
```

### PUT /auth/change-password
Change user password. **Requires authentication.**

**Request Body:**
```json
{
  "currentPassword": "old_password",
  "newPassword": "new_password"
}
```

---

## Course Endpoints

### GET /courses
Get all published courses with optional filtering.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `search` (string): Search in title, description, courseCode
- `department` (string): Filter by department
- `semester` (string): Filter by semester
- `year` (number): Filter by year
- `professor` (string): Filter by professor ID

**Response:**
```json
{
  "success": true,
  "data": {
    "courses": [
      {
        "_id": "course_id",
        "title": "Introduction to Web Development",
        "description": "Learn web development fundamentals",
        "courseCode": "CS301",
        "professor": {
          "_id": "prof_id",
          "name": "Prof. Smith",
          "email": "prof@example.com"
        },
        "department": "Computer Science",
        "credits": 3,
        "semester": "Fall",
        "year": 2024,
        "capacity": 30,
        "enrolledCount": 15,
        "availableSpots": 15,
        "schedule": {
          "days": ["Monday", "Wednesday", "Friday"],
          "startTime": "10:00",
          "endTime": "11:30",
          "room": "CS-Lab-1"
        },
        "tags": ["web", "javascript"],
        "isPublished": true
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 5,
      "total": 50
    }
  }
}
```

### GET /courses/:id
Get single course by ID.

**Response:**
```json
{
  "success": true,
  "data": {
    "course": {
      "_id": "course_id",
      "title": "Introduction to Web Development",
      "description": "Detailed course description...",
      "courseCode": "CS301",
      "professor": {
        "_id": "prof_id",
        "name": "Prof. Smith",
        "email": "prof@example.com",
        "department": "Computer Science"
      },
      "enrolledStudents": [
        {
          "student": {
            "_id": "student_id",
            "name": "John Doe",
            "email": "john@example.com",
            "studentId": "ST2024001"
          },
          "enrolledAt": "2024-01-01T00:00:00.000Z",
          "status": "enrolled"
        }
      ],
      "syllabus": "Course syllabus content...",
      "prerequisites": ["CS101", "CS102"],
      "materials": [
        {
          "title": "JavaScript: The Good Parts",
          "type": "book",
          "required": true
        }
      ]
    }
  }
}
```

### POST /courses
Create a new course. **Requires professor authentication.**

**Request Body:**
```json
{
  "title": "Advanced Web Development",
  "description": "Advanced concepts in web development",
  "courseCode": "CS401",
  "department": "Computer Science",
  "credits": 4,
  "semester": "Spring",
  "year": 2024,
  "capacity": 25,
  "schedule": {
    "days": ["Tuesday", "Thursday"],
    "startTime": "14:00",
    "endTime": "16:00",
    "room": "CS-Lab-2"
  },
  "prerequisites": ["CS301"],
  "syllabus": "Advanced web development topics...",
  "tags": ["advanced", "web", "react"],
  "isPublished": true
}
```

### PUT /courses/:id
Update course. **Requires professor authentication (own courses only).**

### DELETE /courses/:id
Delete course. **Requires professor authentication (own courses only).**

### POST /courses/:id/enroll
Enroll in course. **Requires student authentication.**

### POST /courses/:id/drop
Drop from course. **Requires student authentication.**

### GET /courses/my/courses
Get user's courses (created courses for professors, enrolled courses for students). **Requires authentication.**

---

## Article Endpoints

### GET /articles
Get all published articles with optional filtering.

**Query Parameters:**
- `page`, `limit`: Pagination
- `search` (string): Full-text search
- `category` (string): Filter by category
- `courseId` (string): Filter by course
- `authorId` (string): Filter by author
- `tags` (string): Comma-separated tags

**Response:**
```json
{
  "success": true,
  "data": {
    "articles": [
      {
        "_id": "article_id",
        "title": "Introduction to React Hooks",
        "summary": "Learn about React Hooks and their usage",
        "content": "Full article content...",
        "author": {
          "_id": "author_id",
          "name": "Prof. Smith",
          "role": "professor"
        },
        "course": {
          "_id": "course_id",
          "title": "Web Development",
          "courseCode": "CS301"
        },
        "category": "lecture_notes",
        "tags": ["react", "hooks", "javascript"],
        "priority": "normal",
        "status": "published",
        "publishedAt": "2024-01-01T00:00:00.000Z",
        "views": 150,
        "likeCount": 25,
        "commentCount": 8,
        "readingTime": 5,
        "isPinned": false,
        "isImportant": true
      }
    ],
    "pagination": {
      "current": 1,
      "pages": 3,
      "total": 25
    }
  }
}
```

### GET /articles/:id
Get single article by ID.

### POST /articles
Create new article. **Requires professor authentication.**

**Request Body:**
```json
{
  "title": "Understanding JavaScript Closures",
  "content": "Detailed explanation of closures...",
  "summary": "Learn about JavaScript closures",
  "courseId": "course_id",
  "category": "lecture_notes",
  "tags": ["javascript", "closures", "functions"],
  "priority": "high",
  "status": "published",
  "visibility": "course_only",
  "isImportant": true,
  "isPinned": false
}
```

### PUT /articles/:id
Update article. **Requires professor authentication (own articles only).**

### DELETE /articles/:id
Delete article. **Requires professor authentication (own articles only).**

### POST /articles/:id/like
Like an article. **Requires authentication.**

### DELETE /articles/:id/like
Unlike an article. **Requires authentication.**

### POST /articles/:id/comments
Add comment to article. **Requires authentication.**

**Request Body:**
```json
{
  "content": "Great article! Very helpful."
}
```

### GET /articles/course/:courseId
Get articles for specific course.

### GET /articles/my/articles
Get user's articles. **Requires authentication.**

---

## Attendance Endpoints

### POST /attendance/record
Record attendance via QR code scan. **Requires student authentication.**

**Request Body:**
```json
{
  "qrCodeData": "{\"type\":\"course_attendance\",\"courseId\":\"course_id\",\"courseCode\":\"CS301\",\"sessionId\":\"session123\"}"
}
```

**Response:**
```json
{
  "success": true,
  "message": "Attendance recorded successfully",
  "data": {
    "course": {
      "_id": "course_id",
      "title": "Web Development",
      "courseCode": "CS301",
      "professor": "Prof. Smith"
    },
    "student": {
      "_id": "student_id",
      "name": "John Doe",
      "studentId": "ST2024001"
    },
    "attendance": {
      "date": "2024-01-01T00:00:00.000Z",
      "status": "present"
    }
  }
}
```

### POST /attendance/generate-qr/:id
Generate QR code for course attendance. **Requires professor authentication.**

**Response:**
```json
{
  "success": true,
  "message": "QR code generated successfully",
  "data": {
    "qrCodeData": "{\"type\":\"course_attendance\",\"courseId\":\"course_id\",\"courseCode\":\"CS301\",\"sessionId\":\"abc123\"}",
    "course": {
      "_id": "course_id",
      "title": "Web Development",
      "courseCode": "CS301"
    },
    "validUntil": "2024-01-01T00:30:00.000Z"
  }
}
```

### GET /attendance/my-attendance
Get student's attendance history. **Requires student authentication.**

**Query Parameters:**
- `courseId` (string): Filter by specific course

### GET /attendance/course/:id
Get attendance records for course. **Requires professor authentication.**

**Query Parameters:**
- `date` (string): Filter by specific date
- `studentId` (string): Filter by specific student

### GET /attendance/course/:id/stats
Get attendance statistics for course. **Requires professor authentication.**

**Query Parameters:**
- `startDate` (string): Start date for statistics
- `endDate` (string): End date for statistics

---

## Error Responses

### Validation Error (400)
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    "Name is required",
    "Email must be valid"
  ]
}
```

### Authentication Error (401)
```json
{
  "success": false,
  "message": "Access denied. No token provided."
}
```

### Authorization Error (403)
```json
{
  "success": false,
  "message": "You can only update your own courses"
}
```

### Not Found Error (404)
```json
{
  "success": false,
  "message": "Course not found"
}
```

### Rate Limit Error (429)
```json
{
  "success": false,
  "message": "Too many requests from this IP, please try again later."
}
```

### Server Error (500)
```json
{
  "success": false,
  "message": "Internal Server Error"
}
```

---

## Rate Limiting

- **Window**: 15 minutes
- **Max Requests**: 100 per IP
- **Headers**: Rate limit info included in response headers

---

## Demo Accounts

For testing purposes, you can use these demo accounts:

**Professor Account:**
- Email: `professor@studywave.ma`
- Password: `demo123`

**Student Account:**
- Email: `student@studywave.ma`  
- Password: `demo123`

**Admin Account:**
- Email: `admin@studywave.ma`
- Password: `demo123`

---

## Health Check

### GET /health
Check API and database status.

**Response:**
```json
{
  "status": "OK",
  "message": "StudyWave API is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "database": {
    "status": "connected",
    "host": "localhost",
    "name": "studywave"
  },
  "environment": "development",
  "version": "1.0.0"
}
```
