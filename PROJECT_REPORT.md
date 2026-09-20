# InternConnect (Ethiopia) — Comprehensive Technical Project Report

**Project Title:** InternConnect — University-to-Industry Internship Matching Platform  
**Target Market:** Higher Education & Tech/Corporate Ecosystem in Ethiopia  
**Repository:** [github.com/muniratbrk/internconnect](https://github.com/muniratbrk/internconnect)  
**Lead Developer:** Munira Tebarek ([muniratbrk@gmail.com](mailto:muniratbrk@gmail.com))  
**Date of Report:** September 20, 2026  
**Status:** Functional Full-Stack MVP with Live Neon Cloud Database  

---

## Table of Contents
1. [Project Overview](#1-project-overview)
2. [Tech Stack & Architecture](#2-tech-stack--architecture)
3. [Database Schema & Relationships](#3-database-schema--relationships)
4. [User Roles & RBAC Permissions](#4-user-roles--rbac-permissions)
5. [Full Feature Audit (Working Status & Exact Formulas)](#5-full-feature-audit)
6. [Core User Flows (Step-by-Step)](#6-core-user-flows)
7. [Design System & Aesthetics](#7-design-system--aesthetics)
8. [Known Limitations, Placeholders & Security Gaps](#8-known-limitations-placeholders--security-gaps)
9. [Testing & Quality Assurance](#9-testing--quality-assurance)
10. [Current Deployment Status & Git Tracking](#10-current-deployment-status--git-tracking)

---

## 1. Project Overview

### 1.1 One-Paragraph Purpose
**InternConnect** is a centralized, full-stack university-to-industry career launchpad built specifically for the Ethiopian higher education and tech ecosystem. It bridges the critical transition between university graduation and professional employment by allowing Ethiopian university students to showcase academic competencies, discover verified internships, match through a multi-factor compatibility algorithm, apply transparently with trackable pipeline stages, and communicate directly with hiring teams.

### 1.2 Target Users & Regional Market
- **Target Region:** Ethiopia (primarily Addis Ababa, Hawassa, Adama, Dire Dawa, Bahir Dar, Jimma, and regional tech hubs).
- **Target Students:** Undergraduate and graduate university students across Ethiopian higher education institutions, with localized presets for:
  - Addis Ababa Institute of Technology (AAiT)
  - Addis Ababa Science and Technology University (AASTU)
  - American College of Technology (ACT)
  - Adama Science and Technology University (ASTU)
  - Bahir Dar Institute of Technology (BiT)
  - Jimma University, Hawassa University, Mekelle University, and private tech colleges.
- **Target Companies:** Ethiopian employers seeking early-career engineering, tech, and business talent, including state enterprises (Ethio Telecom, Commercial Bank of Ethiopia), multinational telecoms (Safaricom Ethiopia), AI/robotics research labs (iCog Labs), and local software firms.
- **Platform Administrators:** University career center coordinators and platform admins responsible for vetting employers, moderating postings, and analyzing national placement metrics.

### 1.3 Problem Solved & Mechanism
- **The Problem:** In Ethiopia, discovering internships historically relies on physical notices, informal personal networks ("connections"), lack of compensation transparency (unpaid vs. paid in ETB), non-standardized requirements, and friction in verifying student authenticity.
- **The Solution:** 
  1. **Standardized Role Postings:** Explicit stipend amounts in Ethiopian Birr (ETB), remote vs. on-site tags, academic department requirements, and required skill arrays.
  2. **Automated Algorithmic Matching:** Evaluates student profile compatibility (0–100%) against each role before applying, highlighting matching skills and missing skills.
  3. **Verified Employer Credentials:** An administrative badge (`is_verified = TRUE`) distinguishing vetted companies from unverified accounts.
  4. **Transparent Pipeline Tracking:** Eliminates application black holes with discrete stages (`Applied` → `Under Review` → `Interviewing` → `Accepted/Offered` → `Rejected`) and integrated two-way messaging.

---

## 2. Tech Stack & Architecture

### 2.1 Technology Stack Summary
| Layer | Technology | Version | Purpose |
|---|---|---|---|
| **Frontend Framework** | React | 19.2.8 | Single Page Application (SPA) reactive UI components |
| **Frontend Bundler** | Vite | 8.3.0 | Ultra-fast HMR and optimized production bundling |
| **Frontend Routing** | React Router DOM | 7.18.4 | Client-side routing with RBAC protected route wrappers |
| **Frontend Icons** | Lucide React | 1.47.0 | Modern, lightweight SVG iconography |
| **Frontend Styling** | Vanilla CSS (CSS Variables) | Native | Custom design tokens (`tokens.css`, `index.css`), dark glassmorphism |
| **Backend Runtime** | Node.js | v20+ | Server-side JavaScript runtime |
| **Backend Framework** | Express | 5.2.1 | RESTful JSON API server and middleware pipeline |
| **Database (Cloud)** | Neon Serverless PostgreSQL | v18 | Cloud PostgreSQL with connection pooling on AWS |
| **Database (Local Fallback)** | @electric-sql/pglite | 0.5.8 | In-memory / WASM embedded PostgreSQL for offline testing |
| **Database Client** | node-postgres (`pg`) | 8.23.0 | Native connection pool and parameterized SQL execution |
| **Authentication** | JSON Web Tokens (`jsonwebtoken`) | 9.0.3 | Stateless Bearer token authorization |
| **Password Hashing** | `bcryptjs` | 3.0.3 | One-way hashing with 10 salt rounds |
| **File Uploads** | `multer` | 2.4.0 | Multipart form-data processing to local disk storage |

### 2.2 Database Query Method
- **No Heavy ORM:** The application purposely avoids heavyweight ORMs (e.g., Prisma or TypeORM) to prevent network transfer egress bloat, cold-start latency, and N+1 query traps.
- **Parameterized SQL:** All queries are executed using parameterized SQL (`$1, $2, ...`) through `backend/src/config/db.js`, ensuring protection against SQL injection attacks.
- **Dual-Database Architecture:** The database layer inspects `process.env.DATABASE_URL`. If present, it initializes a pooled `pg.Pool` connection to Neon cloud PostgreSQL. If unset, it gracefully falls back to embedded `@electric-sql/pglite` stored locally in `data/pglite_db`.

### 2.3 Authentication & RBAC Method
- **JWT Issuance:** On `/api/auth/login` or `/api/auth/register`, the server generates a signed JWT containing `{ userId, role }` with a 7-day expiration (`JWT_EXPIRES_IN=7d`).
- **Client Storage:** The token is stored in the browser's `localStorage` as `internconnect_token` and injected via an HTTP interceptor in `frontend/src/services/api.js`:
  ```http
  Authorization: Bearer <JWT_TOKEN>
  ```
- **Backend Middleware:**
  - `authenticate`: Extracts token, verifies signature using `JWT_SECRET`, checks user existence in the `users` table, and attaches `req.user` and `req.user.profileId`.
  - `authorize([...roles])`: Verifies `roles.includes(req.user.role)` and rejects with `403 Forbidden` if unauthorized.
- **Frontend Route Protection:**
  - The `ProtectedRoute` component in `frontend/src/App.jsx` inspects `user?.role` from `AuthContext`. If unauthorized, it redirects the client to their respective dashboard (`/student-dashboard`, `/company-dashboard`, or `/admin-dashboard`).

### 2.4 File Storage Handling
- File uploads (student resumes, company logos, user avatars) are handled by Express using `multer.diskStorage`.
- Uploaded files are written to subdirectories inside `backend/uploads/`:
  - `backend/uploads/resumes/`
  - `backend/uploads/logos/`
  - `backend/uploads/avatars/`
- Express serves these files statically at `/uploads/*` using `app.use('/uploads', express.static(env.UPLOAD_DIR))`.
- *Current Limitation:* Files are written to the server's local filesystem. While fully functional locally, containerized cloud environments (like ephemeral Render instances) will lose uploads upon redeployment unless mapped to persistent disks or migrated to S3-compatible cloud storage (e.g., Neon Object Storage or AWS S3).

### 2.5 Text-Based System Architecture Diagram

```
+-----------------------------------------------------------------------------------+
|                              CLIENT BROWSER (Vite + React 19)                     |
|                                                                                   |
|  [Student Dashboard]    [Company Dashboard]    [Admin Console]   [Public Roles]   |
|         |                        |                    |                 |         |
|         +------------------------+--------------------+-----------------+         |
|                                  |                                                |
|                      AuthContext & NotificationContext                           |
|                      (Bearer Token in localStorage)                               |
+----------------------------------+------------------------------------------------+
                                   |
                  HTTP REST Requests (JSON / Multipart)
                  Port 5173 -> Proxied to Port 5001 (/api)
                                   |
                                   v
+-----------------------------------------------------------------------------------+
|                        BACKEND REST API (Node.js + Express 5)                     |
|                                                                                   |
|   [cors, morgan, express.json]  -->  [authenticate & authorize RBAC]             |
|                                              |                                    |
|   +-------------------+----------------------+-------------------+                |
|   | Auth Controller   | Student Controller   | Company Controller|                |
|   | Postings API      | Applications API     | Messages API      |                |
|   | Notification Svc  | Matching Algorithm   | Admin Controller  |                |
|   +-------------------+----------------------+-------------------+                |
|           |                                            |                          |
|           v                                            v                          |
|   [Multer Disk Storage]                       [Parameterized SQL]                 |
|   `backend/uploads/`                                   |                          |
+--------------------------------------------------------+--------------------------+
                                                         |
                              TCP Connection (Pool / SSL)
                                                         |
                                                         v
+-----------------------------------------------------------------------------------+
|                       DATABASE LAYER (PostgreSQL 18)                              |
|                                                                                   |
|  Hosted on Neon Cloud: AWS us-east-2 (ep-crimson-unit-b4qwml57-pooler)            |
|  Local Fallback: @electric-sql/pglite (`data/pglite_db`)                          |
|                                                                                   |
|  [users]              [student_profiles]         [company_profiles]               |
|  [internships]        [applications]             [conversations]                  |
|  [messages]           [notifications]            [reviews]                        |
+-----------------------------------------------------------------------------------+
```

---

## 3. Database Schema

The database schema is defined in [`backend/src/db/schema.sql`](file:///Users/muniratebarek/Documents/InternConnect/backend/src/db/schema.sql) and consists of 9 relational tables:

```
 users (id) 1──────1 student_profiles (user_id)
            1──────1 company_profiles (user_id)
            1──────* notifications (user_id)
            1──────* messages (sender_user_id)

 company_profiles (id) 1──────* internships (company_id)
                       1──────* conversations (company_id)
                       1──────* reviews (company_id)

 student_profiles (id) 1──────* applications (student_id)
                       1──────* conversations (student_id)
                       1──────* reviews (student_id)

 internships (id) 1──────* applications (internship_id)
                  1──────* reviews (internship_id)

 applications (id) 1──────0..1 conversations (application_id)
 conversations (id) 1──────* messages (conversation_id)
```

### Table 1: `users`
Primary authentication and role-based access identity table.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `email`: `VARCHAR(255) UNIQUE NOT NULL`
- `password_hash`: `VARCHAR(255) NOT NULL` (Bcrypt salt rounds: 10)
- `role`: `VARCHAR(20) NOT NULL CHECK (role IN ('student', 'company', 'admin'))`
- `is_verified`: `BOOLEAN DEFAULT FALSE`
- `verification_token`: `VARCHAR(255)`
- `reset_token`: `VARCHAR(255)`
- `reset_token_expiry`: `TIMESTAMPTZ`
- `created_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 2: `student_profiles`
Extended academic, biographical, and portfolio profile for students.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `full_name`: `VARCHAR(150) NOT NULL`
- `headline`: `VARCHAR(255)` (e.g., *"Computer Science Senior @ ACT"*)
- `bio`: `TEXT`
- `university`: `VARCHAR(200)`
- `department`: `VARCHAR(100)` (e.g., *"Computer Science"*)
- `field_of_study`: `VARCHAR(100)` (e.g., *"Web & Full-Stack Development"*)
- `major`: `VARCHAR(150)`
- `graduation_year`: `INTEGER`
- `gpa`: `NUMERIC(3,2)`
- `skills`: `TEXT[] DEFAULT '{}'` (Array of skill strings)
- `resume_url`: `VARCHAR(500)`
- `avatar_url`: `VARCHAR(500)`
- `portfolio_url`, `github_url`, `linkedin_url`: `VARCHAR(255)`
- `availability`: `VARCHAR(100) DEFAULT 'Summer 2026'`
- `location`: `VARCHAR(150) DEFAULT 'Addis Ababa, Ethiopia'`
- `created_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 3: `company_profiles`
Corporate and employer branding data.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `company_name`: `VARCHAR(200) NOT NULL`
- `industry`: `VARCHAR(100) NOT NULL`
- `description`: `TEXT`
- `website`: `VARCHAR(255)`
- `logo_url`: `VARCHAR(500)`
- `location`: `VARCHAR(150) DEFAULT 'Addis Ababa, Ethiopia'`
- `size`: `VARCHAR(50) DEFAULT '51-200'`
- `is_verified`: `BOOLEAN DEFAULT FALSE` (Admin-controlled trust badge)
- `created_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 4: `internships`
Internship postings created by companies.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `company_id`: `UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE`
- `title`: `VARCHAR(200) NOT NULL`
- `department`: `VARCHAR(100)`
- `field_of_study`: `VARCHAR(100)`
- `description`: `TEXT NOT NULL`
- `requirements`: `TEXT NOT NULL`
- `responsibilities`: `TEXT`
- `location`: `VARCHAR(150) NOT NULL DEFAULT 'Addis Ababa, Ethiopia'`
- `is_remote`: `BOOLEAN DEFAULT FALSE`
- `work_type`: `VARCHAR(50) DEFAULT 'Full-time'`
- `is_paid`: `BOOLEAN DEFAULT TRUE`
- `stipend_amount`: `NUMERIC(10,2)`
- `stipend_currency`: `VARCHAR(10) DEFAULT 'ETB'`
- `duration`: `VARCHAR(50) DEFAULT '3 Months'`
- `required_skills`: `TEXT[] DEFAULT '{}'`
- `application_deadline`: `DATE`
- `status`: `VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft', 'moderated'))`
- `views_count`: `INTEGER DEFAULT 0`
- `created_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 5: `applications`
Application submissions linking a student to an internship posting.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `internship_id`: `UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE`
- `student_id`: `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE`
- `resume_url`: `VARCHAR(500)`
- `cover_note`: `TEXT`
- `status`: `VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'interview', 'accepted', 'rejected'))`
- `company_notes`: `TEXT` (Recruiter internal evaluation notes)
- `applied_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`
- **Constraint:** `CONSTRAINT unique_internship_student UNIQUE (internship_id, student_id)` (prevents duplicate applications)

### Table 6: `conversations`
Direct chat channels established between a student and a company.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `application_id`: `UUID REFERENCES applications(id) ON DELETE SET NULL`
- `student_id`: `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE`
- `company_id`: `UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE`
- `created_at`, `updated_at`: `TIMESTAMPTZ DEFAULT NOW()`
- **Constraint:** `CONSTRAINT unique_conversation_parties UNIQUE (student_id, company_id)`

### Table 7: `messages`
Individual message records in a conversation.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `conversation_id`: `UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE`
- `sender_user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `content`: `TEXT NOT NULL`
- `is_read`: `BOOLEAN DEFAULT FALSE`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 8: `notifications`
In-app notification alerts for user activity.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `user_id`: `UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE`
- `title`: `VARCHAR(200) NOT NULL`
- `message`: `TEXT NOT NULL`
- `link`: `VARCHAR(255)`
- `type`: `VARCHAR(50) DEFAULT 'system'`
- `is_read`: `BOOLEAN DEFAULT FALSE`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

### Table 9: `reviews`
Post-internship student ratings and reviews of companies.
- `id`: `UUID PRIMARY KEY DEFAULT gen_random_uuid()`
- `internship_id`: `UUID REFERENCES internships(id) ON DELETE SET NULL`
- `student_id`: `UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE`
- `company_id`: `UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE`
- `reviewer_role`: `VARCHAR(20) NOT NULL CHECK (reviewer_role IN ('student', 'company'))`
- `rating`: `INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5)`
- `comment`: `TEXT`
- `created_at`: `TIMESTAMPTZ DEFAULT NOW()`

---

## 4. User Roles & Permissions

| Role | Allowed Permissions | Explicit Restrictions / Blocks |
|---|---|---|
| **Student** | - Create & edit student profile (academic, skills, GPA, links)<br>- Upload resume (PDF) and avatar image<br>- Browse and search all published internships<br>- View automated match score & skill breakdown<br>- Submit applications with cover notes<br>- Track personal application pipeline stages<br>- Chat directly with companies that have opened a dialog<br>- Receive real-time in-app status change notifications | - Cannot create, edit, or delete internship postings<br>- Cannot view applications submitted by other students<br>- Cannot change application status stages<br>- Cannot view or access Company hiring dashboards<br>- Cannot access Admin analytics, moderation, or verification tools<br>- Blocked from `/company-dashboard`, `/post-internship`, and `/admin-dashboard` |
| **Company** | - Create & edit company profile (description, logo, website, size)<br>- Upload company brand logo<br>- Create, edit, and close internship postings with ETB stipends<br>- View applicant pipeline for their postings with filter by stage<br>- View applicant resumes, match scores, and details<br>- Update candidate status (`applied` → `under_review` → `interview` → `accepted` → `rejected`)<br>- Add private internal recruiter notes to candidate records<br>- Initiate and send direct messages to applicants | - Cannot apply for internships<br>- Cannot edit student profiles or resumes<br>- Cannot view other companies' applicant pipelines or private recruiter notes<br>- Cannot verify their own company profile (requires admin approval)<br>- Cannot access the Admin analytics and moderation console<br>- Blocked from `/student-dashboard`, `/student-profile`, and `/admin-dashboard` |
| **Admin** | - View system-wide analytics (total students, companies, postings, acceptance rate, top skills, pipeline counts)<br>- Grant or revoke Company Verification Badges (`is_verified`)<br>- Moderate any internship posting (`open`, `closed`, `draft`, `moderated`)<br>- View directory of all registered platform users and join dates<br>- Switch between accounts in 1-click for testing and verification | - Cannot edit student private resumes or company passwords directly<br>- Role is focused on ecosystem integrity, verification, and moderation |

---

## 5. Full Feature Audit

| Feature Area | Working Status | Technical Details & Current State |
|---|---|---|
| **Authentication & Registration** | **Fully Working** | Complete signup for Student and Company roles. Passwords securely hashed with `bcryptjs`. Stateless JWT tokens with 7-day expiration issued upon login and stored in `localStorage`. |
| **1-Click Role Switcher** | **Fully Working** | Top navbar provides instant 1-click switching between `Student` (Munira Tebarek), `Company` (CBE / Telebirr), and `Admin`. Includes automatic account fallback to guarantee 0% failure. "Demo:" label removed. |
| **Student Profile Management** | **Fully Working** | Full CRUD for university, department, field of study, GPA, skills array, portfolio links, headline, and bio. Multer-powered resume and avatar uploads save to local disk. |
| **Company Profile Management** | **Fully Working** | Full CRUD for company name, industry, size, location, website, and description. Multer logo file upload saves to local disk. |
| **Internship Posting & Management** | **Fully Working** | Employers can publish, edit, or close roles with department, field of study, requirements, responsibilities, remote toggle, and ETB stipend fields. |
| **Search & Multi-Facet Filtering** | **Fully Working** | Full-text search across role titles, company names, and descriptions. Filter by skill tag, department, field of study, Ethiopian city, remote status, paid status, and duration. |
| **Algorithmic Matching Engine** | **Fully Working** | Evaluates a composite 0–100% score for every student-internship pair using strict weighted logic. |
| **Application & Pipeline System** | **Fully Working** | Students apply with resume and cover note. Unique database constraint blocks duplicates. Employers view candidates, move stages, and record recruiter notes. |
| **In-App Messaging** | **Fully Working** | One-to-one messaging channel created per application/match. Message history loaded in order; unread flags track read status; auto-scrolls to bottom. Polling-based. |
| **Notification System** | **Fully Working** | Automated in-app notifications generated for new applicants, status changes, verification updates, and new messages. Navbar bell icon with badge count and mark-read controls. |
| **Admin Console & Analytics** | **Fully Working** | Live platform statistics computed via SQL aggregation: total students, companies, postings, applications, acceptance rate, top 8 required skills, and verification toggle buttons. |
| **Reviews & Ratings** | **Partially Working** | Backend table (`reviews`), SQL schema, and REST endpoints (`POST /api/reviews`, `GET /api/reviews/company/:id`) are fully built. Dedicated frontend student review submission modal is not yet wired up. |
| **Email Dispatch (Password Reset)** | **Partially Working** | Token generation and expiry validation in DB works. Currently returns token in JSON response for local testing; external SMTP provider (SendGrid/Resend) is not yet integrated. |
| **Real-Time WebSockets** | **Not Implemented (Polling Used)** | Messaging and notification updates currently use client-side polling (every 15 seconds) rather than persistent WebSockets. |

### The Exact Matching & Recommendation Formula
The match score (0–100%) is calculated dynamically in `backend/src/services/matching.service.js` using the following mathematical breakdown:

$$\text{Overall Score} = \text{Skills Score (50\%)} + \text{Department Score (15\%)} + \text{Field Score (15\%)} + \text{Location Score (20\%)}$$

1. **Skill Overlap (50% Weight):**
   $$\text{Skills Score} = \text{round}\left(\frac{\text{Number of Matching Skills}}{\text{Total Required Skills}} \times 50\right)$$
   *(If the internship lists no required skills, default score is 50).*
2. **Department Alignment (15% Weight):**
   - Exact string match between student department and role department: **15 points**
   - Adjacent STEM/Tech cross-match (e.g., Computer Science ↔ Software Engineering ↔ IT): **10 points**
   - Role has no department restriction: **15 points**
   - No match: **0 points**
3. **Field of Study Alignment (15% Weight):**
   - Exact string match between student field of study and role field: **15 points**
   - Substring or partial alignment: **5 points**
   - Role has no field restriction: **15 points**
4. **Location / Remote Compatibility (20% Weight):**
   - If internship is remote (`is_remote = TRUE`): **20 points**
   - Same Ethiopian city match (e.g., Addis Ababa ↔ Addis Ababa): **20 points**
   - City mismatch: **8 points**
   - Missing location data: **10 points**

---

## 6. Core User Flows

### Flow A: Company Signs Up, Gets Verified, and Posts a Role
1. **Registration:** Recruiter goes to `/register`, selects the **"Hiring Company"** tab, enters company name (e.g., *"Commercial Bank of Ethiopia"*), industry (*"Banking & Financial Services"*), work email, and password.
2. **Profile Completion:** Recruiter navigates to `/company-profile`, fills in headquarters location (*"Addis Ababa"*), company size, description, website, and uploads corporate logo via file picker.
3. **Verification Request:** The company displays an `"Unverified"` badge with notice that admin review is pending.
4. **Admin Approval:** Platform admin logs into `/admin-dashboard`, reviews company credentials in the **"Company Moderation"** tab, and clicks **"Verify Company"**. An in-app notification is sent to the company, and a verified badge appears platform-wide.
5. **Role Publishing:** Recruiter clicks **"Post Role"** (`/post-internship`), fills in job title (*"Fintech Software Engineer Intern"*), department, field of study, ETB monthly stipend (*"Br 15,000 ETB/mo"*), duration (*"3 Months"*), requirements, and skill tags (*"React, Node.js, PostgreSQL"*). Upon submission, the posting immediately goes live with status `open`.

### Flow B: Student Signs Up, Discovers, and Applies to a Role
1. **Registration:** Student goes to `/register`, selects the **"Student"** tab, enters full name (*"Munira Tebarek"*), university (*"American College of Technology"*), university email, and password.
2. **Profile Setup:** Student navigates to `/student-profile`, specifies department (*"Computer Science"*), field of study (*"Web & Full-Stack Development"*), GPA (*"3.89"*), graduation year (*2026*), selects skills from taxonomy pills, and uploads PDF resume.
3. **Discovery & Recommendations:**
   - Student visits `/student-dashboard`: The algorithmic recommendation engine ranks top open positions tailored to their profile with compatibility badges (e.g., `"95% Match"`).
   - Student visits `/internships`: Uses multi-facet search filters by department, stipend status (Paid only), or skill tags.
4. **Application Submission:** Student clicks on an internship card to view details (`/internships/:id`). If satisfied, clicks **"Apply Now"**, which opens the application modal showing a real-time compatibility preview. Student writes an optional cover note, confirms resume, and submits.
5. **Tracking:** Application immediately appears on `/student-dashboard` under **"Active Application Pipeline"** with status badge `Applied`. Duplicate applications are blocked.

### Flow C: Post-Match Communication Between Student and Company
1. **Employer Review:** Recruiter opens `/company-dashboard` (**"Hiring Pipeline"**), sees the new candidate in the **"Applied"** column, reviews compatibility score, reads cover note, and clicks to inspect the student's resume.
2. **Status Progression:** Recruiter moves candidate status from `Applied` → `Under Review` → `Interviewing`. An automated in-app notification alerts the student.
3. **Internal Notes:** Recruiter enters private internal evaluation notes (*"Strong React background; schedule technical interview for Thursday"*).
4. **Direct Messaging:** Recruiter clicks **"Message Candidate"**, which opens a dedicated thread in `/messages`. Both parties can exchange interview links, schedules, and questions.
5. **Offer Stage:** Recruiter updates candidate status to `Accepted / Offered`. When the student visits their dashboard, a celebration confetti effect triggers, confirming their offer.

### Flow D: Platform Administrator Day-to-Day Workflow
1. **Analytics Inspection:** Admin logs in and reviews the high-level KPI dashboard: active students, registered companies, active vs. closed postings, total applications, and overall platform placement rate.
2. **Company Moderation:** Admin inspects recently registered employers, checks authenticity (valid Ethiopian domains, trade registration), and grants the green verified badge.
3. **Posting Moderation:** Admin inspects newly published internship listings to ensure compliant compensation, appropriate academic requirements, and professional descriptions. If suspicious, admin can change status to `moderated` or `closed`.
4. **Talent Demand Monitoring:** Admin reviews the **"Most In-Demand Skills"** widget (e.g., Python, React, SQL) to share insights with university department heads.

---

## 7. Design System & Aesthetics

### 7.1 Color Palette Tokens
Defined in [`frontend/src/styles/tokens.css`](file:///Users/muniratebarek/Documents/InternConnect/frontend/src/styles/tokens.css):
- **Background Main:** `#0B0F19` (Deep slate night)
- **Background Card:** `#131B2E` (Layered navy card)
- **Background Surface:** `#1E293B` (Elevated interactive surface)
- **Primary Indigo:** `#4F46E5` / Hover `#4338CA`
- **Primary Gradient:** `linear-gradient(135deg, #4F46E5 0%, #7C3AED 100%)`
- **Accent Cyan:** `#06B6D4` (High-contrast highlights, sparkles, match percentages)
- **Success Green:** `#10B981` (Verified badge, accepted offers)
- **Warning Amber:** `#F59E0B` / Admin Gold `#FBBF24`
- **Danger Red:** `#EF4444` (Rejected applications, error toasts)
- **Subtle Borders:** `rgba(255, 255, 255, 0.08)`

### 7.2 Typography & Glassmorphism
- **Display / Headings:** Google Font **`Plus Jakarta Sans`** (Weights: 600, 700, 800) with tight letter-spacing (`-0.02em`).
- **Body / Form Elements:** Google Font **`Inter`** (Weights: 400, 500, 600) for maximum legibility.
- **Glassmorphism:** Cards and fixed navbar employ `backdrop-filter: blur(16px)` with semi-transparent rgba backgrounds, creating depth without visual clutter.

### 7.3 Responsiveness
- Layouts use responsive CSS Grid (`repeat(auto-fit, minmax(...))`) and Flexbox.
- Media queries dynamically collapse desktop navigation links on screens `< 900px`.
- Candidate pipeline tables transform into stacked responsive cards on mobile screens.

---

## 8. Known Limitations, Placeholders & Security Gaps

To maintain strict technical honesty for formal evaluation, the following items are documented:

### 8.1 Hardcoded Items & Placeholders
- **Landing Page Stats:** The Hero section of `Home.jsx` features decorative marketing stats (*"94% Placement Rate"*, *"15,000+ Students"*). In contrast, the **Admin Dashboard** computes 100% real-time SQL aggregates directly from the database.
- **Fallback Imagery:** If a company hasn't uploaded a logo, or a student hasn't uploaded an avatar, fallback Unsplash URLs are used.
- **Pre-Seeded Sample Resumes:** Seeded dummy student records point to sample PDF URLs (`https://example.com/resumes/...`).

### 8.2 Security Gaps & Missing Production Validations
- **Simulated Password Reset Token:** The `/api/auth/forgot-password` endpoint returns `resetToken` in its JSON response to facilitate local testing without setting up an SMTP mailer. *Production requirement:* The token must strictly be sent via email (e.g., SendGrid or AWS SES) and never exposed in the API response.
- **Simulated Email Verification:** The `/api/auth/verify-email` endpoint immediately sets `is_verified = TRUE` without dispatching an email verification code.
- **Local Disk Uploads:** Multer stores uploads on local disk (`backend/uploads`). In ephemeral cloud deployments (e.g., Render free tier), these files will not persist across dyno restarts unless cloud object storage (S3/Neon Storage) is configured.
- **Rate Limiting:** Express endpoints currently lack IP-based rate limiting (such as `express-rate-limit`), leaving authentication routes vulnerable to brute-force attempts.
- **Password Complexity:** Passwords require a minimum of 6 characters but currently lack regex rules for numbers, uppercase, or special characters.

### 8.3 Planned Work Not Yet Built
- Real-time WebSockets (Socket.io) for messaging (currently 15s interval polling).
- Student-facing frontend modal for submitting company reviews.
- Automated resume PDF skill extraction via NLP / LLM.

---

## 9. Testing & Quality Assurance

### 9.1 Automated Tests & Code Quality
- **Backend API Test Suite:** Executable via `node test-endpoints.js`. Automated script tests registration, login, profile updates, role creation, application submission, messaging, and admin queries.
- **Static Code Analysis (Linter):** Ran `npm run lint` (`oxlint`) across 30 frontend files with 104 rules — **0 errors**.
- **Production Build Validation:** Ran `npm run build` (`vite build`) — bundled cleanly in 1.16s with **0 errors**.
- **Database Migrations:** Ran `node src/db/migrate.js` against both local embedded PGlite and cloud Neon PostgreSQL — schema validated and indexed.

### 9.2 Manual Testing Verified
- **Role-Switcher Reliability:** Verified seamless switching between `Student` (`muniratbrk@act.edu.et`), `Company` (`careers@cbe.com.et`), and `Admin` (`admin@internconnect.et`) from any page.
- **Pipeline Progression:** Verified updating applicant status and verified badge reflect immediately without page reloads.
- **Known Bugs Fixed:** Resolved `ReferenceError: user is not defined` in `CompanyDashboard.jsx` and `AdminDashboard.jsx`, and eliminated `navigate(0)` reload race conditions.

---

## 10. Current Deployment Status & Git Tracking

### 10.1 Live Environment Details
- **Database:** Live in the cloud on **Neon Serverless PostgreSQL** (AWS us-east-2).
  - Connection: `ep-crimson-unit-b4qwml57-pooler.c-6.us-east-2.aws.neon.tech/neondb`
  - Branches: `production`
- **Backend Server:**
  - Local runtime: `http://localhost:5001` (Node.js/Express)
  - Deployment configuration: Production Dockerfile (`node:20-alpine`) and Heroku/Render `Procfile` present.
- **Frontend Client:**
  - Local runtime: `http://localhost:5173` (Vite)
  - Deployment configuration: Production `vercel.json` SPA routing rewrite rules configured; linked to Vercel CLI.

### 10.2 GitHub Repository Tracking
- **Repository URL:** `https://github.com/muniratbrk/internconnect.git`
- **Active Branch:** `main`
- **Tracking Status:** Clean working tree, completely synchronized with `origin/main`.
- **Latest Commit:** `63020f3` — *"Fix student role switcher navigation, resolve dashboard ReferenceErrors, and remove Demo label from navbar"*
