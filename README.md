# Nexora Backend API

> **AI-Powered Enterprise Student Management & ERP System**
> Built with Node.js · Express.js · MongoDB Atlas · JWT · Firebase FCM · Google Gemini AI

---

## Table of Contents

- [Project Overview](#project-overview)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Installation](#installation)
- [Environment Variables](#environment-variables)
- [Run Commands](#run-commands)
- [API Documentation](#api-documentation)
- [Authentication Notes](#authentication-notes)
- [Roles & Permissions](#roles--permissions)

---

## Project Overview

Nexora Backend is a full-scale enterprise-grade University ERP REST API server designed for the **Nexora Android Application** (Java + Retrofit).

**Features:**
- Multi-role JWT Authentication (Student / Faculty / Super Admin)
- Access Token + Refresh Token rotation with database revocation
- Password Reset via Email (SMTP / Nodemailer)
- Firebase Cloud Messaging (FCM) Push Notifications
- Google Gemini AI Chatbot & Student Risk Prediction
- PDF Generation for Result Cards & Fee Receipts (PDFKit)
- File Uploads (Avatars, Notes, Assignments) via Multer
- Multi-Language API Responses (English, Hindi, Gujarati)
- Global Search across Students, Faculty, Notes, Assignments, Notices
- Rate Limiting, Helmet Security Headers, CORS, Input Validation

---

## Tech Stack

| Technology | Purpose |
|---|---|
| Node.js + Express.js | Backend Framework |
| MongoDB Atlas + Mongoose | NoSQL Database |
| JWT (jsonwebtoken) | Authentication & Authorization |
| bcryptjs | Password Hashing |
| Multer | File Upload Handling |
| Firebase Admin SDK | Push Notifications (FCM) |
| Google Gemini AI (@google/genai) | AI Chatbot & Analytics |
| PDFKit | PDF Document Generation |
| Nodemailer | Email (Password Reset) |
| Express Validator | Input Validation |
| Helmet | HTTP Security Headers |
| express-rate-limit | API Rate Limiting |
| Morgan | HTTP Request Logging |

---

## Folder Structure

```
NexoraBackend/
├── config/
│   ├── db.js                   # MongoDB Atlas Connection
│   ├── firebase.js             # Firebase Admin SDK Setup
│   └── aiConfig.js             # Google Gemini AI Client
├── controllers/
│   ├── authController.js       # Auth: Register, Login, Token, Password Reset
│   ├── adminController.js      # Admin ERP Analytics Dashboard
│   ├── studentController.js    # Student CRUD + Profile Management
│   ├── facultyController.js    # Faculty CRUD + Profile Management
│   ├── departmentController.js # Department CRUD
│   ├── subjectController.js    # Subject CRUD + Faculty Mapping
│   ├── attendanceController.js # Daily + Lecture-wise Attendance
│   ├── resultController.js     # Exam Results + Publishing
│   ├── feeController.js        # Fee Assignment + Payments + Receipts
│   ├── noteController.js       # Study Material Upload/Download
│   ├── assignmentController.js # Assignment + Submission + Grading
│   ├── noticeController.js     # Campus Notice Board
│   ├── timetableController.js  # Class Schedules
│   ├── notificationController.js # Push Notification Management
│   ├── aiController.js         # Gemini AI Chat + Risk Reports
│   ├── searchController.js     # Global Search Engine
│   └── pdfController.js        # PDF Export Engine
├── middleware/
│   ├── authMiddleware.js       # JWT Verify + RBAC
│   ├── errorHandler.js         # Global Error & 404 Handler
│   ├── multerMiddleware.js     # File Upload Configuration
│   ├── rateLimiter.js          # API & Auth Rate Limiters
│   └── languageMiddleware.js   # i18n Multi-Language Support
├── models/
│   ├── Admin.js, Student.js, Faculty.js
│   ├── Department.js, Subject.js
│   ├── Attendance.js, LectureAttendance.js
│   ├── Result.js, Fee.js
│   ├── Note.js, Assignment.js, Submission.js
│   ├── Notice.js, Timetable.js
│   ├── Notification.js, ChatHistory.js
│   ├── AIReport.js, RefreshToken.js
├── routes/
│   ├── auth.js, adminRoutes.js
│   ├── student.js, faculty.js
│   ├── departmentRoutes.js, subjectRoutes.js
│   ├── attendance.js, results.js, fees.js
│   ├── noteRoutes.js, assignmentRoutes.js
│   ├── notices.js, timetableRoutes.js
│   ├── notificationRoutes.js, aiRoutes.js
│   ├── searchRoutes.js, pdfRoutes.js
├── services/
│   ├── fcmService.js           # Firebase FCM Push Notifications
│   ├── aiService.js            # Gemini AI Chat + Analysis
│   ├── pdfService.js           # PDFKit Result & Receipt Generator
│   └── emailService.js         # Nodemailer Password Reset Emails
├── validators/
│   ├── validate.js             # Express Validator Runner
│   ├── authValidator.js        # Auth Input Rules
│   ├── departmentValidator.js  # Department Input Rules
│   └── subjectValidator.js     # Subject Input Rules
├── locales/
│   ├── en.json                 # English Translations
│   ├── hi.json                 # Hindi Translations
│   └── gu.json                 # Gujarati Translations
├── uploads/
│   ├── avatars/                # Profile Images
│   ├── notes/                  # Study Material Files
│   └── assignments/            # Assignment Files
├── logs/                       # Application Logs
├── app.js                      # Express App Setup
├── server.js                   # Server Bootstrap
├── package.json
├── .env.example
└── README.md
```

---

## Installation

### Prerequisites
- Node.js >= 18.0.0
- MongoDB Atlas account (or local MongoDB)
- (Optional) Firebase project for FCM
- (Optional) Google Gemini API key

### Steps

```bash
# 1. Clone or navigate to the project directory
cd NexoraBackend

# 2. Install all dependencies
npm install

# 3. Setup environment variables
cp .env.example .env
# Edit .env with your actual MongoDB URI, JWT secrets, etc.

# 4. Start in development mode
npm run dev

# 5. Start in production mode
npm start
```

---

## Environment Variables

Copy [`.env.example`](.env.example) to `.env` and fill in your values.

| Variable | Required | Description |
|---|---|---|
| `PORT` | No | Server port (default: 5000) |
| `MONGO_URI` | ✅ Yes | MongoDB Atlas connection string |
| `JWT_SECRET` | ✅ Yes | JWT access token signing secret (min 32 chars) |
| `JWT_REFRESH_SECRET` | ✅ Yes | JWT refresh token signing secret |
| `FACULTY_SECRET_KEY` | ✅ Yes | Secret key for faculty registration |
| `GEMINI_API_KEY` | No | Google Gemini AI API key (AI features) |
| `FIREBASE_SERVICE_ACCOUNT` | No | Firebase Admin SDK JSON (FCM push notifications) |
| `SMTP_HOST` | No | SMTP server for email (password reset) |
| `SMTP_USER` | No | SMTP email address |
| `SMTP_PASS` | No | SMTP password / app password |

---

## Run Commands

```bash
npm run dev     # Development mode with auto-reload (nodemon)
npm start       # Production mode
npm run prod    # Production mode with NODE_ENV=production
```

---

## API Documentation

### Base URL
```
https://nexorabackend-1cgs.onrender.com/
```

### Language Query Parameter
Add `?lang=hi` or `?lang=gu` to any endpoint to receive responses in Hindi or Gujarati.

---

### Auth Routes — `/api/auth`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/auth/register/student` | Public | Register new student |
| POST | `/api/auth/register/faculty` | Public | Register faculty (secret key required) |
| POST | `/api/auth/login` | Public | Unified login (Student/Faculty/Admin) |
| POST | `/api/auth/refresh-token` | Public | Renew access token using refresh token |
| POST | `/api/auth/logout` | Private | Logout & revoke refresh token |
| POST | `/api/auth/forgot-password` | Public | Request password reset (sends email) |
| POST | `/api/auth/reset-password` | Public | Reset password with token |
| POST | `/api/auth/change-password` | Private | Change password (authenticated) |
| GET  | `/api/auth/me` | Private | Get current user profile |
| POST | `/api/auth/upload-avatar` | Private | Upload profile picture |

---

### Student Routes — `/api/students`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/students` | Faculty/Admin | List all students (search, filter, paginate) |
| GET | `/api/students/:id` | Private | Get student profile by ID |
| PUT | `/api/students/:id` | Private | Full profile update |
| PATCH | `/api/students/:id` | Faculty/Admin | Partial record update |
| DELETE | `/api/students/:id` | Admin | Delete student |

---

### Faculty Routes — `/api/faculty`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/faculty` | Private | List all faculty (search, filter, paginate) |
| GET | `/api/faculty/:id` | Private | Get faculty profile |
| PUT | `/api/faculty/:id` | Private | Update faculty profile |
| PATCH | `/api/faculty/:id` | Admin | Partial update |
| DELETE | `/api/faculty/:id` | Admin | Delete faculty |

---

### Department Routes — `/api/departments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/departments` | Private | List all departments |
| GET | `/api/departments/:id` | Private | Get department by ID |
| POST | `/api/departments` | Admin | Create department |
| PUT | `/api/departments/:id` | Admin | Update department |
| DELETE | `/api/departments/:id` | Admin | Delete department |

---

### Subject Routes — `/api/subjects`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/subjects` | Private | List subjects (filter by dept/semester) |
| GET | `/api/subjects/:id` | Private | Get subject (with assigned faculty) |
| POST | `/api/subjects` | Admin | Create subject |
| PUT | `/api/subjects/:id` | Admin | Update subject |
| DELETE | `/api/subjects/:id` | Admin | Delete subject |

---

### Attendance Routes — `/api/attendance`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/attendance/mark` | Faculty/Admin | Mark daily full-day attendance |
| POST | `/api/attendance/lecture` | Faculty/Admin | Mark lecture-wise attendance |
| GET | `/api/attendance/student/:studentId` | Private | Student attendance stats |
| GET | `/api/attendance/class` | Faculty/Admin | Class attendance history |

---

### Result Routes — `/api/results`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/results/upload` | Faculty/Admin | Upload semester exam results |
| PATCH | `/api/results/:id/publish` | Faculty/Admin | Publish result (sends FCM) |
| GET | `/api/results/student/:studentId` | Private | Get student result cards |
| DELETE | `/api/results/:id` | Faculty/Admin | Delete result |

---

### Fee Routes — `/api/fees`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/fees/assign` | Admin | Assign fee structure to student |
| POST | `/api/fees/record-payment` | Admin | Record payment transaction |
| GET | `/api/fees/all` | Admin | All fees with financial summary |
| GET | `/api/fees/student/:studentId` | Private | Student fee history + summary |
| DELETE | `/api/fees/:id` | Admin | Delete fee record |

---

### Notes Routes — `/api/notes`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/notes` | Faculty/Admin | Upload study material |
| GET | `/api/notes` | Private | List/search notes |
| GET | `/api/notes/:id/download` | Private | Download note file |
| DELETE | `/api/notes/:id` | Faculty/Admin | Delete note |

---

### AI Routes — `/api/ai`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/ai/chat` | Private | Send prompt to Gemini AI assistant |
| GET | `/api/ai/chat/history` | Private | Get chat conversation history |
| GET | `/api/ai/reports/student/:studentId` | Private | AI academic risk report |

---

## Authentication Notes

All protected endpoints require the following header:
```
Authorization: Bearer <accessToken>
```

---

## Roles & Permissions

| Role | Description |
|---|---|
| `student` | View profile, fees, results, attendance, chat AI |
| `faculty` | Mark attendance, upload notes, upload results |
| `super_admin` | Full system access, manage depts, analytics |

---

## Android App Integration

Ensure [AppConstants.java](file:///C:/Users/neelpatel/AndroidStudioProjects/Nexora2/app/src/main/java/com/neel/nexora/constants/AppConstants.java) is updated with the Base URL.
