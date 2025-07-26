# Design Document

## Overview

This design document outlines the architecture and implementation approach for transforming the existing ClassStack EdTech frontend template into a fully functional SaaS platform. The design maintains the current UI/UX theme with teal branding for tutors, blue for students, and clean card-based layouts while adding comprehensive backend functionality.

## Architecture

### System Architecture

The platform follows a modern full-stack architecture:

```
Frontend (React + Vite)
├── UI Components (Existing design maintained)
├── State Management (React Context/useState)
├── API Client (Fetch/Axios)
└── Routing (React Router)

Backend (Node.js + Express)
├── Authentication Middleware
├── API Routes
├── Business Logic
├── Database Layer (MongoDB + Mongoose)
└── Security & Validation

Database (MongoDB)
├── Users Collection
├── Batches Collection
├── Students Collection
├── Attendance Collection
├── Fees Collection
└── Tests Collection
```

### Technology Stack

**Frontend (Maintained)**:

- React 18.3.1 with Vite
- Tailwind CSS for styling
- React Router DOM for navigation
- Lucide React for icons

**Backend (Enhanced)**:

- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- bcryptjs for password hashing
- CORS for cross-origin requests

## Components and Interfaces

### Frontend Component Structure (Maintained)

The existing component structure will be preserved with enhanced functionality:

```
src/
├── components/
│   ├── Layout.jsx (Enhanced with user context)
│   ├── Header.jsx (Add user profile dropdown)
│   ├── Sidebar.jsx (Enhanced with dynamic navigation)
│   ├── tutor/ (Enhanced with API integration)
│   │   ├── dashboard/
│   │   ├── students/
│   │   ├── batches/
│   │   ├── attendance/
│   │   ├── fees/
│   │   ├── tests/
│   │   └── settings/
│   └── student/ (Enhanced with API integration)
│       ├── dashboard/
│       ├── schedule/
│       ├── notes/
│       ├── tests/
│       └── fees/
├── pages/ (Enhanced with data fetching)
├── hooks/ (New - Custom hooks for API calls)
├── services/ (New - API service layer)
├── context/ (New - User and app context)
└── utils/ (New - Helper functions)
```

### API Interface Design

**Authentication Endpoints**:

```
POST /api/auth/login
POST /api/auth/logout
POST /api/auth/refresh
GET  /api/auth/me
```

**Tutor Endpoints**:

```
GET    /api/tutor/dashboard
GET    /api/tutor/students
POST   /api/tutor/students
PUT    /api/tutor/students/:id
DELETE /api/tutor/students/:id
GET    /api/tutor/batches
POST   /api/tutor/batches
PUT    /api/tutor/batches/:id
POST   /api/tutor/attendance
GET    /api/tutor/attendance
GET    /api/tutor/fees
POST   /api/tutor/fees/payment
GET    /api/tutor/tests
POST   /api/tutor/tests
PUT    /api/tutor/tests/:id/marks
```

**Student Endpoints**:

```
GET /api/student/dashboard
GET /api/student/schedule
GET /api/student/attendance
GET /api/student/tests
GET /api/student/fees
GET /api/student/notes
```

### User Interface Enhancements

**Maintained Design Elements**:

- ClassStack branding with graduation cap logo
- Teal color scheme (#14b8a6) for tutor interface
- Blue color scheme (#3b82f6) for student interface
- Clean white cards with subtle shadows and rounded corners
- Responsive sidebar navigation
- Professional typography and spacing

**Enhanced Functionality**:

- Real-time data loading states
- Form validation with error messages
- Success/error notifications
- Modal dialogs for actions
- Data tables with sorting and filtering
- Charts and analytics (using Chart.js or similar)

## Data Models

### User Model

```javascript
{
  _id: ObjectId,
  name: String,
  email: String (unique),
  password: String (hashed),
  role: String (enum: ['tutor', 'student']),
  profile: {
    phone: String,
    address: String,
    profileImage: String
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Tutor Model (extends User)

```javascript
{
  userId: ObjectId (ref: User),
  institute: {
    name: String,
    address: String,
    phone: String,
    email: String
  },
  subjects: [String],
  experience: Number,
  qualifications: [String],
  settings: {
    notifications: Boolean,
    whatsapp: Boolean,
    emailReminders: Boolean
  }
}
```

### Student Model

```javascript
{
  _id: ObjectId,
  userId: ObjectId (ref: User),
  tutorId: ObjectId (ref: User),
  studentId: String (unique),
  personalInfo: {
    parentName: String,
    parentPhone: String,
    parentEmail: String,
    dateOfBirth: Date,
    class: String,
    school: String
  },
  enrollmentDate: Date,
  status: String (enum: ['active', 'inactive', 'suspended']),
  batches: [ObjectId] (ref: Batch)
}
```

### Batch Model

```javascript
{
  _id: ObjectId,
  tutorId: ObjectId (ref: User),
  name: String,
  subject: String,
  description: String,
  schedule: {
    days: [String], // ['Monday', 'Wednesday', 'Friday']
    startTime: String,
    endTime: String,
    duration: Number // in minutes
  },
  capacity: Number,
  feeStructure: {
    monthlyFee: Number,
    registrationFee: Number,
    currency: String
  },
  students: [ObjectId] (ref: Student),
  status: String (enum: ['active', 'inactive']),
  createdAt: Date
}
```

### Attendance Model

```javascript
{
  _id: ObjectId,
  tutorId: ObjectId (ref: User),
  batchId: ObjectId (ref: Batch),
  date: Date,
  records: [{
    studentId: ObjectId (ref: Student),
    status: String (enum: ['present', 'absent', 'late']),
    remarks: String
  }],
  createdAt: Date
}
```

### Fee Model

```javascript
{
  _id: ObjectId,
  tutorId: ObjectId (ref: User),
  studentId: ObjectId (ref: Student),
  batchId: ObjectId (ref: Batch),
  amount: Number,
  dueDate: Date,
  paidDate: Date,
  status: String (enum: ['pending', 'paid', 'overdue']),
  paymentMethod: String,
  transactionId: String,
  remarks: String
}
```

### Test Model

```javascript
{
  _id: ObjectId,
  tutorId: ObjectId (ref: User),
  batchId: ObjectId (ref: Batch),
  name: String,
  subject: String,
  date: Date,
  totalMarks: Number,
  duration: Number, // in minutes
  results: [{
    studentId: ObjectId (ref: Student),
    marksObtained: Number,
    grade: String,
    remarks: String
  }],
  status: String (enum: ['scheduled', 'completed', 'cancelled']),
  createdAt: Date
}
```

## Error Handling

### Frontend Error Handling

- Global error boundary for React components
- API error interceptors with user-friendly messages
- Form validation with real-time feedback
- Loading states and error states for all data operations
- Toast notifications for success/error messages

### Backend Error Handling

- Centralized error handling middleware
- Structured error responses with consistent format
- Input validation using express-validator
- Database error handling with meaningful messages
- Authentication and authorization error handling

### Error Response Format

```javascript
{
  success: false,
  error: {
    code: 'VALIDATION_ERROR',
    message: 'User-friendly error message',
    details: ['Specific field errors']
  }
}
```

## Testing Strategy

### Frontend Testing

- Unit tests for utility functions and hooks
- Component testing with React Testing Library
- Integration tests for API interactions
- E2E tests for critical user flows using Cypress

### Backend Testing

- Unit tests for business logic and utilities
- Integration tests for API endpoints
- Database integration tests
- Authentication and authorization tests

### Test Structure

```
tests/
├── frontend/
│   ├── components/
│   ├── hooks/
│   ├── services/
│   └── e2e/
└── backend/
    ├── unit/
    ├── integration/
    └── fixtures/
```

## Security Considerations

### Authentication & Authorization

- JWT tokens with secure httpOnly cookies
- Role-based access control (RBAC)
- Session management with automatic expiry
- Password strength requirements
- Rate limiting for authentication endpoints

### Data Protection

- Input sanitization and validation
- SQL injection prevention (using Mongoose)
- XSS protection with proper data encoding
- CORS configuration for allowed origins
- Secure headers using helmet.js

### API Security

- Request validation middleware
- Authentication middleware for protected routes
- Authorization checks for resource access
- API rate limiting
- Request logging and monitoring

## Performance Optimization

### Frontend Optimization

- Code splitting with React.lazy()
- Image optimization and lazy loading
- Memoization for expensive calculations
- Virtual scrolling for large lists
- Bundle size optimization

### Backend Optimization

- Database indexing for frequently queried fields
- Query optimization with proper aggregation
- Caching strategy for frequently accessed data
- Connection pooling for database
- Response compression

### Database Optimization

- Proper indexing strategy
- Query optimization
- Data aggregation for analytics
- Connection pooling
- Regular maintenance and monitoring

## Deployment Architecture

### Development Environment

- Local MongoDB instance
- Node.js development server
- Vite development server with HMR
- Environment variables for configuration

### Production Environment

- MongoDB Atlas or self-hosted MongoDB
- Node.js production server with PM2
- Static file serving with nginx
- SSL/TLS certificates
- Environment-specific configurations

### CI/CD Pipeline

- Automated testing on pull requests
- Build and deployment automation
- Environment-specific deployments
- Database migration handling
- Monitoring and logging setup
