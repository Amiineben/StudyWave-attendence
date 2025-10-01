# StudyWave Backend API

A comprehensive backend API for the StudyWave educational platform, built with Express.js and MongoDB. This API provides course management, article publishing, and user authentication with role-based access control.

## Features

### 🔐 Authentication & Authorization
- JWT-based authentication
- Role-based access control (Student/Professor)
- Secure password hashing with bcrypt
- Token verification and refresh

### 👥 User Management
- User registration and login
- Profile management with role-specific fields
- Password change functionality
- User search and pagination

### 📚 Course Management
- CRUD operations for courses
- Course enrollment/dropping for students
- Professor-only course creation and management
- Course search and filtering
- QR code generation for attendance

### 📝 Article Management
- Article creation and publishing by professors
- Rich content support with attachments
- Article categorization and tagging
- Like and comment system
- Visibility controls (public/course-only/private)

### 🛡️ Security Features
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation and sanitization
- MongoDB injection protection

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JWT (JSON Web Tokens)
- **Validation**: Express Validator
- **Security**: Helmet, CORS, Rate Limiting
- **Password Hashing**: bcryptjs

## Project Structure

```
backend/
├── controllers/           # Request handlers
│   ├── authController.js
│   ├── courseController.js
│   └── articleController.js
├── middleware/           # Custom middleware
│   ├── auth.js          # Authentication & authorization
│   └── validation.js    # Input validation rules
├── models/              # Database models
│   ├── User.js
│   ├── Course.js
│   └── Article.js
├── routes/              # API routes
│   ├── authRoutes.js
│   ├── courseRoutes.js
│   └── articleRoutes.js
├── index.js             # Main server file
├── package.json
└── README.md
```

## Installation

1. **Clone the repository**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your configuration:
   ```env
   NODE_ENV=development
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/studywave
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   FRONTEND_URL=http://localhost:3000
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system.

5. **Run the server**
   ```bash
   # Development mode with auto-restart
   npm run dev
   
   # Production mode
   npm start
   ```

## API Endpoints

### Authentication Routes (`/api/auth`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| POST | `/register` | Register new user | Public |
| POST | `/login` | User login | Public |
| GET | `/profile` | Get user profile | Private |
| PUT | `/profile` | Update user profile | Private |
| PUT | `/change-password` | Change password | Private |
| POST | `/logout` | User logout | Private |
| GET | `/verify-token` | Verify JWT token | Private |
| GET | `/users` | Get all users | Professor only |

### Course Routes (`/api/courses`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all courses | Public |
| GET | `/:id` | Get course by ID | Public |
| POST | `/` | Create new course | Professor only |
| PUT | `/:id` | Update course | Professor only (own courses) |
| DELETE | `/:id` | Delete course | Professor only (own courses) |
| POST | `/:id/enroll` | Enroll in course | Student only |
| POST | `/:id/drop` | Drop from course | Student only |
| GET | `/professor/:professorId` | Get courses by professor | Public |
| GET | `/my/courses` | Get user's courses | Private |

### Article Routes (`/api/articles`)

| Method | Endpoint | Description | Access |
|--------|----------|-------------|---------|
| GET | `/` | Get all articles | Public |
| GET | `/:id` | Get article by ID | Public |
| POST | `/` | Create new article | Professor only |
| PUT | `/:id` | Update article | Professor only (own articles) |
| DELETE | `/:id` | Delete article | Professor only (own articles) |
| GET | `/course/:courseId` | Get articles by course | Public |
| GET | `/my/articles` | Get user's articles | Private |
| POST | `/:id/like` | Like article | Private |
| DELETE | `/:id/like` | Unlike article | Private |
| POST | `/:id/comments` | Add comment | Private |

## Data Models

### User Model
```javascript
{
  name: String,
  email: String (unique),
  password: String (hashed),
  role: 'student' | 'professor',
  avatar: String,
  phone: String,
  studentId: String (for students),
  major: String (for students),
  year: String (for students),
  department: String (for professors),
  jobTitle: String (for professors),
  office: String (for professors),
  isActive: Boolean,
  lastLogin: Date,
  enrolledCourses: [ObjectId],
  createdCourses: [ObjectId]
}
```

### Course Model
```javascript
{
  title: String,
  description: String,
  courseCode: String (unique),
  professor: ObjectId,
  department: String,
  credits: Number,
  semester: 'Fall' | 'Spring' | 'Summer' | 'Winter',
  year: Number,
  schedule: {
    days: [String],
    startTime: String,
    endTime: String,
    room: String
  },
  capacity: Number,
  enrolledStudents: [{
    student: ObjectId,
    enrolledAt: Date,
    status: 'enrolled' | 'dropped' | 'completed'
  }],
  prerequisites: [String],
  syllabus: String,
  materials: [Object],
  tags: [String],
  isActive: Boolean,
  isPublished: Boolean,
  qrCode: String
}
```

### Article Model
```javascript
{
  title: String,
  content: String,
  summary: String,
  author: ObjectId,
  course: ObjectId,
  category: String,
  tags: [String],
  attachments: [Object],
  images: [Object],
  priority: 'low' | 'normal' | 'high' | 'urgent',
  status: 'draft' | 'published' | 'archived',
  visibility: 'public' | 'course_only' | 'private',
  publishedAt: Date,
  views: Number,
  likes: [Object],
  comments: [Object],
  readBy: [Object],
  isImportant: Boolean,
  isPinned: Boolean,
  expiresAt: Date
}
```

## Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```
Authorization: Bearer <your-jwt-token>
```

## Error Handling

The API returns consistent error responses:

```json
{
  "success": false,
  "message": "Error description",
  "errors": ["Detailed error messages"]
}
```

## Rate Limiting

- **Window**: 15 minutes
- **Max requests**: 100 per IP
- **Response**: 429 Too Many Requests

## Development

### Running Tests
```bash
npm test
npm run test:watch
```

### Code Linting
```bash
npm run lint
npm run lint:fix
```

### Development Mode
```bash
npm run dev  # Uses nodemon for auto-restart
```

## Production Deployment

1. Set `NODE_ENV=production`
2. Use a production MongoDB instance
3. Set strong JWT secrets
4. Configure proper CORS origins
5. Set up process management (PM2, Docker, etc.)
6. Enable HTTPS
7. Set up monitoring and logging

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Run linting and tests
6. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support and questions, please contact the StudyWave development team.
