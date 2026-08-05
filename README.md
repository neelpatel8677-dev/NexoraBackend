<<<<<<< HEAD
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
http://localhost:5000
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

**Query Params:** `?department=CSE&semester=3&section=A&division=A&search=Neel&page=1&limit=20`

---

### Faculty Routes — `/api/faculty`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/faculty` | Private | List all faculty (search, filter, paginate) |
| GET | `/api/faculty/:id` | Private | Get faculty profile |
| PUT | `/api/faculty/:id` | Private | Update faculty profile |
| PATCH | `/api/faculty/:id` | Admin | Partial update |
| DELETE | `/api/faculty/:id` | Admin | Delete faculty |

**Query Params:** `?department=CSE&designation=Professor&search=Patel&page=1&limit=20`

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
| GET | `/api/attendance/student/:studentId` | Private | Student attendance stats (overall, subject-wise, monthly) |
| GET | `/api/attendance/class` | Faculty/Admin | Class attendance history |

---

### Result Routes — `/api/results`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/results/upload` | Faculty/Admin | Upload semester exam results |
| PATCH | `/api/results/:id/publish` | Faculty/Admin | Publish result (sends FCM) |
| GET | `/api/results/student/:studentId` | Private | Get student result cards |
| DELETE | `/api/results/:id` | Faculty/Admin | Delete result |
| GET | `/api/pdf/result/:resultId` | Private | Download result PDF |

---

### Fee Routes — `/api/fees`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/fees/assign` | Admin | Assign fee structure to student |
| POST | `/api/fees/record-payment` | Admin | Record payment transaction |
| GET | `/api/fees/all` | Admin | All fees with financial summary |
| GET | `/api/fees/student/:studentId` | Private | Student fee history + summary |
| GET | `/api/fees/:id` | Private | Fee record by ID |
| DELETE | `/api/fees/:id` | Admin | Delete fee record |
| GET | `/api/pdf/fee-receipt/:feeId/transaction/:transactionId` | Private | Download fee receipt PDF |

---

### Notes Routes — `/api/notes`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/notes` | Faculty/Admin | Upload study material (PDF/DOCX/PPT/ZIP/Image) |
| GET | `/api/notes` | Private | List/search notes |
| GET | `/api/notes/:id/download` | Private | Download note file |
| DELETE | `/api/notes/:id` | Faculty/Admin | Delete note |

**Multipart Upload Field:** `note` (file)

---

### Assignment Routes — `/api/assignments`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/assignments` | Faculty/Admin | Create assignment (optional file) |
| GET | `/api/assignments` | Private | List assignments |
| POST | `/api/assignments/:id/submit` | Student | Submit assignment solution |
| POST | `/api/assignments/submission/:id/grade` | Faculty/Admin | Grade a submission |
| GET | `/api/assignments/:id/submissions` | Faculty/Admin | List all submissions |

---

### Notice Routes — `/api/notices`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/notices` | Faculty/Admin | Publish campus notice |
| GET | `/api/notices` | Private | Get notices (role-filtered + search) |
| DELETE | `/api/notices/:id` | Faculty/Admin | Delete notice |

**Query Params:** `?category=Exam&department=CSE&search=result`

---

### Timetable Routes — `/api/timetable`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/timetable` | Admin | Create or update day schedule |
| GET | `/api/timetable/student` | Private | Get student timetable |
| GET | `/api/timetable/faculty` | Faculty/Admin | Get faculty teaching schedule |

---

### Notification Routes — `/api/notifications`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/notifications` | Private | Get user notifications (unread count) |
| PATCH | `/api/notifications/:id/read` | Private | Mark notification as read |
| POST | `/api/notifications/send` | Admin | Broadcast push notification |

---

### AI Routes — `/api/ai`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| POST | `/api/ai/chat` | Private | Send prompt to Gemini AI assistant |
| GET | `/api/ai/chat/history` | Private | Get chat conversation history |
| DELETE | `/api/ai/chat/history` | Private | Clear chat history |
| GET | `/api/ai/reports/student/:studentId` | Private | AI academic risk report |

---

### Search Routes — `/api/search`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/search?q=keyword` | Private | Global search (students, faculty, notes, assignments, notices) |

---

### Admin Routes — `/api/admin`

| Method | Endpoint | Access | Description |
|---|---|---|---|
| GET | `/api/admin/analytics` | Admin | ERP dashboard analytics |

---

## Authentication Notes

All protected endpoints require the following header:
```
Authorization: Bearer <accessToken>
```

**Login Response:**
```json
{
  "success": true,
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "role": "student",
  "user": { ... }
}
```

**Refresh Token (POST /api/auth/refresh-token):**
```json
{ "refreshToken": "<your_refresh_token>" }
```

---

## Roles & Permissions

| Role | Description | Key Permissions |
|---|---|---|
| `student` | Enrolled student | View own profile, fees, results, attendance, chat AI, download notes/assignments, submit assignments |
| `faculty` | Teaching staff | All student views + mark attendance, upload notes, create assignments, grade submissions, create notices |
| `super_admin` | Full system admin | Full CRUD access to all modules, manage departments, subjects, fees, analytics dashboard |

---

## Android Retrofit Integration

Add this base configuration in your Android Retrofit setup:

```java
// RetrofitClient.java
public class RetrofitClient {
    private static final String BASE_URL = "http://YOUR_SERVER_IP:5000/";

    public static Retrofit getInstance(String token) {
        OkHttpClient client = new OkHttpClient.Builder()
            .addInterceptor(chain -> {
                Request request = chain.request().newBuilder()
                    .addHeader("Authorization", "Bearer " + token)
                    .addHeader("Accept-Language", "en")
                    .build();
                return chain.proceed(request);
            })
            .build();

        return new Retrofit.Builder()
            .baseUrl(BASE_URL)
            .client(client)
            .addConverterFactory(GsonConverterFactory.create())
            .build();
    }
}
```
=======
# NexoraBackend
>>>>>>> a0070a18f655ade789bf3a36c1bbd8bbcc4aa5e3
