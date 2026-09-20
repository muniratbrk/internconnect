# InternConnect Ethiopia 🇪🇹 🚀

> A full-stack web platform connecting university students across Ethiopia with top companies for internship opportunities, featuring algorithmic skill & academic matching, specialized departments & fields of study, an interactive hiring pipeline, in-app messaging, and role-based administration.

---

## 🌟 Key Platform Highlights

- **Ethiopian Context & Localization**: Tailored for the Ethiopian higher education ecosystem (AAU / AAiT, AASTU, ASTU, BiT, Hawassa, etc.) and industry leaders (Ethio Telecom, Commercial Bank of Ethiopia / Telebirr, Safaricom Ethiopia, iCog Labs).
- **Academic Taxonomy (Departments & Fields of Study)**: Rich categorization encompassing Software Engineering, Computer Science, Electrical & Computer Engineering, FinTech & Payment Systems, Ethiopian NLP / AI, and Cloud Systems.
- **Role-Based Access Control (RBAC)**: Distinct, tailored interfaces and permissions for **Students**, **Companies**, and **Admins**.
- **Algorithmic Match Engine**: Calculates real-time 0–100% compatibility scores:
  - **Technical Skills Alignment**: 50% weight
  - **Academic Department Alignment**: 15% weight
  - **Field of Study Alignment**: 15% weight
  - **Location & Remote Preference**: 20% weight
- **Application Pipeline Board**: Recruiter kanban view supporting seamless candidate stage transitions (`Applied` → `Under Review` → `Interview` → `Accepted` / `Rejected`) with internal notes.
- **In-App Messaging**: Split-pane threaded chat connecting applicants with recruiters post-application with unread badges and live timestamps.
- **Instant 1-Click Demo Evaluation**: Quick-switcher pills in the navigation bar and login screen to instantly test all 3 roles without manual signup.
- **Deployment & Container Ready**: Full `Dockerfile` configs and `docker-compose.yml` orchestrating PostgreSQL, Backend, and Frontend.

---

## 🛠️ Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React.js 19, Vite, React Router v6, Lucide Icons, Canvas Confetti |
| **Styling** | Vanilla CSS Design System with bespoke tokens, dark-mode glassmorphism, responsive mobile-first layouts |
| **Backend** | Node.js, Express.js, JWT, BcryptJS, Multer |
| **Database** | PostgreSQL (Relational schema with UUIDs, array types, indexes, and constraints) |
| **Currency** | Ethiopian Birr (`ETB` / `Br`) |
| **Persistence Adapter** | Dual-mode: Native `pg.Pool` for PostgreSQL / Docker / Cloud & zero-config embedded PGlite for local development |
| **DevOps / Container** | Docker, Multi-stage Dockerfiles, Docker Compose, Nginx |

---

## 👤 User Roles & Workflows

### 1. Student (`muniratbrk@act.edu.et` / `password123`)
- **Profile**: Full bio, Ethiopian university selector (ACT, AAiT, AASTU, ASTU, etc.), academic department, field of study, skills tag manager (React, Python, Flutter, PostgreSQL, etc.), GPA, and PDF resume upload.
- **Discovery**: Search and filter internships by department, specialized field of study, Ethiopian city/region, skill tags, and duration.
- **Match Compatibility**: Real-time compatibility meter breaking down matching skills, department alignment, and missing competencies.
- **Application Flow**: Apply with customized cover note and attached resume. Celebratory confetti feedback upon submission.
- **Dashboard**: Track live application status, read recruiter feedback notes, and launch in-app chats.

### 2. Company (`careers@cbe.com.et` / `password123`)
- **Company Profile**: Brand overview, Ethiopian headquarters (e.g., Sengatera / Bole, Addis Ababa), company size, verified status badge, and logo upload.
- **Postings Wizard**: Create and publish internships with targeted academic department, field of study, required skills, monthly stipend in ETB, and remote flags.
- **Applicant Pipeline Kanban**: Review applicants across stages (`Applied` → `Interview` → `Offer`), inspect student departments, fields, resumes, and GPAs, add internal recruiter notes.
- **Direct Messaging**: In-app chat with applicants to schedule interviews and extend offers.

### 3. Admin (`admin@internconnect.et` / `password123`)
- **Analytics Console**: Metrics on total students, partner companies, live postings, applications, and placement rate.
- **Verification Queue**: Review and grant/revoke official "Verified Employer" badges.
- **Content Moderation**: Moderate, flag, or close postings platform-wide.
- **User Management**: Inspect registered user accounts and authentication status.

---

## 🔑 Demo Accounts (Pre-Seeded)

All demo accounts share the password: `password123`

| Role | Email | Password | Details |
|---|---|---|---|
| **Student** | `muniratbrk@act.edu.et` | `password123` | Munira Tebarek (ACT Senior • Computer Science • Full-Stack) |
| **Student** | `bethlehem.a@aastu.edu.et` | `password123` | Bethlehem Alemayehu (AASTU Senior • AI & NLP • Python / PyTorch) |
| **Student** | `dawit.h@astu.edu.et` | `password123` | Dawit Haile (ASTU Junior • Electrical & Computer • Embedded/IoT) |
| **Student** | `selamawit.b@bit.edu.et` | `password123` | Selamawit Bekele (BiT Senior • IT & Cloud • Linux / Cybersecurity) |
| **Company** | `careers@cbe.com.et` | `password123` | Commercial Bank of Ethiopia (Telebirr & FinTech, Addis Ababa) - Verified |
| **Company** | `internships@ethiotelecom.et` | `password123` | Ethio Telecom (Telecommunications & Cloud, Addis Ababa) - Verified |
| **Company** | `jobs@safaricom.et` | `password123` | Safaricom Ethiopia (Mobile Money & Digital Systems) - Verified |
| **Company** | `ai@icog-labs.com` | `password123` | iCog Labs (AI Research & Ethiopian NLP, Addis Ababa) |
| **Admin** | `admin@internconnect.et` | `password123` | System Administrator (InternConnect Ethiopia) |

---

## 🚀 Getting Started

### Option A: Zero-Config Local Setup (Recommended)

Thanks to the embedded PostgreSQL adapter, you can run the entire platform locally without needing a pre-installed database:

1. **Install Dependencies**:
   ```bash
   # Install backend dependencies
   cd backend
   npm install

   # Install frontend dependencies
   cd ../frontend
   npm install
   ```

2. **Run Migrations & Seed Ethiopian Sample Data**:
   ```bash
   cd backend
   npm run seed
   ```

3. **Start the Backend Server**:
   ```bash
   cd backend
   npm run dev
   # Runs on http://localhost:5001
   ```

4. **Start the Frontend Client**:
   ```bash
   cd frontend
   npm run dev
   # Runs on http://localhost:5173
   ```

5. Open [http://localhost:5173](http://localhost:5173) in your browser. Use the **1-Click Demo** buttons in the navigation bar to test all user roles.

---

## 🏛️ Academic Taxonomy & Classification

The platform comes pre-configured with standardized Ethiopian higher education taxonomies in [`frontend/src/constants/taxonomy.js`](file:///Users/muniratebarek/Documents/InternConnect/frontend/src/constants/taxonomy.js):

### Academic Departments
- Software Engineering
- Computer Science
- Information Technology & Systems
- Electrical & Computer Engineering
- Data Science & Artificial Intelligence
- Biomedical Engineering
- Mechanical & Electromechanical Engineering
- Civil & Environmental Engineering
- Business Information Systems & Economics

### Specialized Fields of Study
- Web & Full-Stack Development
- Mobile App Development (Flutter / Android)
- FinTech & Payment Systems
- Cloud Systems & DevOps
- Machine Learning & Ethiopian NLP
- Cybersecurity & Network Systems
- Embedded Systems & IoT Telemetry
- UI/UX & Product Design
- Database Administration & Big Data

---

## 🗄️ Database Schema & Architecture

```
[USERS] 1 ──── 0..1 [STUDENT_PROFILES] (includes department, field_of_study, university)
   │                     │
   │ 1                   │ 1
   │                     │
   │ 0..1                ├──── 0..* [APPLICATIONS] 0..* ──── 1 [INTERNSHIPS] 0..* ──── 1 [COMPANY_PROFILES]
   ▼                     │           │                          (department, field,       ▲
[COMPANY_PROFILES]       │           │                           stipend_currency ETB)   │
                         │           │ (links chat post-application)                      │
                         │           ▼                                                    │
                         ├──── 0..* [CONVERSATIONS] 0..* ─────────────────────────────────┤
                         │           │ 1                                                  │
                         │           ▼ 0..*                                               │
                         │       [MESSAGES]                                               │
                         │                                                                │
                         ├──── 0..* [REVIEWS] 0..* ───────────────────────────────────────┘
                         │
[USERS] 1 ──── 0..* [NOTIFICATIONS]
```

---

## 🧠 Algorithmic Matching & ML Extension

### Rule-Based Scoring Engine
Located in [backend/src/services/matching.service.js](file:///Users/muniratebarek/Documents/InternConnect/backend/src/services/matching.service.js):
- **Skill Overlap (50% weight)**: Normalized intersection over required skills.
- **Academic Department Alignment (15% weight)**: Direct match or related engineering discipline.
- **Field of Study Alignment (15% weight)**: Direct match on candidate specialization.
- **Location / Remote Preference (20% weight)**: Alignment with Ethiopian cities (Addis Ababa, Hawassa, Bahir Dar, etc.) or remote availability.

### How to Plug In an ML Vector Embedding Model
The matching service is built with an isolated adapter interface. To upgrade to neural vector search:
1. Enable `pgvector` in PostgreSQL: `CREATE EXTENSION IF NOT EXISTS vector;`
2. Add an `embedding vector(1536)` column to `internships` and `student_profiles`.
3. In `matching.service.js`, replace or combine the rule-based calculation with vector cosine similarity:
   $$\text{FinalScore} = (\text{CosineSimilarity} \times 50) + (\text{RuleBasedScore} \times 50)$$

---

## 📡 Key API Reference

### Authentication
- `POST /api/auth/register` — Create account with role selection (`student` or `company`)
- `POST /api/auth/login` — Authenticate and receive JWT token
- `GET /api/auth/me` — Retrieve active user session and profile details
- `POST /api/auth/verify-email` — Email verification toggle
- `POST /api/auth/forgot-password` — Dispatch reset token
- `POST /api/auth/reset-password` — Set new password with token

### Internships & Recommendations
- `GET /api/internships` — Search and multi-filter listings (by department, field of study, skills, location, remote, stipend)
- `GET /api/internships/recommended` — Top recommended opportunities scored for authenticated student
- `GET /api/internships/:id` — Single internship details with match criteria breakdown and ETB compensation
- `POST /api/internships` — Post new role with department, field of study, and ETB stipend (Company only)
- `PUT /api/internships/:id` — Edit role (Company only)
- `DELETE /api/internships/:id` — Delete role (Company only)
- `GET /api/internships/company/my-postings` — Company listings with applicant stage counters

### Applications & Hiring Pipeline
- `POST /api/applications` — Student applies with resume and cover note
- `GET /api/applications/student` — Student's application pipeline tracker with department tags
- `GET /api/applications/internship/:internshipId` — Company applicants kanban list with student academic details
- `PUT /api/applications/:id/status` — Company updates stage (`applied`, `under_review`, `interview`, `accepted`, `rejected`) and notes

### Messaging & Notifications
- `GET /api/messages/conversations` — User's active conversation threads with unread counts
- `GET /api/messages/conversations/:id` — Thread messages stream (marks as read)
- `POST /api/messages` — Send message
- `POST /api/messages/start` — Start conversation between candidate and company
- `GET /api/notifications` — In-app alerts with unread badge counter

### Admin Console
- `GET /api/admin/analytics` — Platform metrics, skill demand, and placement rate
- `GET /api/admin/companies` — Partner company directory
- `PUT /api/admin/companies/:id/verify` — Toggle company verified badge
- `GET /api/admin/postings` — Moderation list of postings
- `PUT /api/admin/postings/:id/status` — Moderate posting status (`open`, `closed`, `moderated`)

---

## 🧪 Automated Testing

An automated end-to-end integration test is included:

```bash
cd backend
node test-endpoints.js
```

This verifies:
- Health checks
- Student & Company authentication (Ethiopian accounts)
- Department & Field-of-study filtering
- Algorithmic match scoring (verified Munira @ CBE Telebirr = 70% match)
- Recommendations engine
- Company postings & pipeline counts
- Admin analytics calculation & verified badge toggling

---

## 📄 License
MIT License. Built for Ethiopian university students and innovative companies.
