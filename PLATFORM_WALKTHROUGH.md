# InternConnect — Complete Platform Architecture & Operational Walkthrough

A comprehensive, plain-language reference guide for students, partner companies, and administrators.

---

## 1. Tech Stack Summary

**InternConnect** is built with a modern, high-performance web architecture:
* **Frontend (React 19 + Vite):** Delivers a fast, interactive single-page application with a sleek dark glassmorphism aesthetic. It manages state transitions, real-time client validation, role dashboards, and filtering without page reloads.
* **Backend (Node.js + Express 5):** The API engine powering the platform. It handles business logic, runs the multi-criteria compatibility matching algorithm, coordinates applicant tracking, processes PDF resume uploads, and enforces permissions.
* **Database (PostgreSQL via Neon / PGlite):** Stores all relational data across 9 core tables: user credentials, student profiles, company profiles, job postings, candidate applications, direct conversations, messages, reviews, and notifications.
* **Authentication (JWT + Bcrypt):** Passwords are encrypted with Bcrypt (10 salt rounds). When a user registers or logs in, the server signs a secure JSON Web Token (JWT) that is passed in request headers (`Bearer <token>`) to enforce Role-Based Access Control (RBAC).

---

## 2. The Three Roles — What Each One Can Do

### A. Student Role
* **What they see on login:** They are routed directly to the **Student Career Dashboard** (`/student-dashboard`). It displays a personalized greeting with their university and major, four key metric counters, an active application pipeline list, and an algorithmic match feed.
* **Dashboard Sections & Buttons:**
  * **"Edit Profile & Resume" button:** Links to `/student-profile` to edit personal bio, Ethiopian university, department, major, GPA, skills tags, and upload a PDF resume.
  * **"Browse Roles" button:** Quick link to the search directory at `/internships`.
  * **Metrics Grid (4 cards):** Real-time counters showing *Total Applications*, *Under Review*, *Interviews Scheduled*, and *Offers Extended*.
  * **"Active Application Pipeline" list:** Detailed cards for each applied job showing the company logo, title, location, applied date, status badge (*Applied*, *Under Review*, *Interview*, *Accepted*, *Rejected*), and a **"Message"** button that immediately launches a direct conversation with the hiring team.
  * **"Algorithmic Matches for You" section:** Displays the top 6 internships ranked specifically for the student. Each card displays the company name, department tag, stipend amount in ETB, location/remote badge, a 0–100% **Match Score Meter**, and a **"Review & Apply"** button.
* **Allowed Actions:**
  * Search, filter, and view all open internships and company profiles.
  * Apply for internships by submitting a cover note and attaching a resume.
  * Update student profile details and upload CVs (PDF/DOCX up to 10MB).
  * Directly message recruiters for any role they have applied to.
  * View in-app notifications and mark them as read.
* **Blocked Actions:**
  * Cannot post, edit, or delete job postings (403 Forbidden).
  * Cannot view applications from other students or view candidate pools.
  * Cannot access the Admin Moderation Console.
  * Cannot apply twice to the same internship (protected by a database unique constraint).

---

### B. Company Role
* **What they see on login:** They land on the **Company Dashboard** (`/company-dashboard`). It highlights their company branding, verification status, candidate pipeline metrics, job listing selector tabs, and candidate management cards.
* **Dashboard Sections & Buttons:**
  * **"Company Profile" button:** Opens `/company-profile` to edit the company description, website URL, location, company size, and upload a company logo.
  * **"Post New Role" button:** Opens the job creation form (`/post-internship`).
  * **Aggregate Stats (4 cards):** Live counters across all company listings: *Active Postings*, *Total Candidates*, *Interviews Scheduled*, and *Offers Extended*.
  * **Active Postings Selector Tabs:** A horizontal pill list showing all postings created by the company (e.g., *"Full-Stack Software Engineering Intern (4)"*). Clicking a tab filters the candidates below.
  * **Pipeline Stage Filter Chips:** Quick filters: *All Applicants*, *Applied*, *Under Review*, *Interviewing*, *Accepted / Offered*, or *Rejected*.
  * **Applicant Cards:**
    * Candidate details: Full name, university, GPA, department, graduation year, cover note, and skill chips.
    * **"Change Candidate Stage" dropdown:** Advances candidates through *Applied* &rarr; *Under Review* &rarr; *Interview Scheduled* &rarr; *Accepted* &rarr; *Rejected*.
    * **"Resume" button:** Opens the student's uploaded PDF resume in a new tab.
    * **"Chat" button:** Opens a direct 1-on-1 message screen in `/messages`.
    * **"Edit Note" button:** Opens a prompt to save private internal recruiter notes on the applicant.
* **Allowed Actions:**
  * Create, publish, update, and manage internship listings.
  * Review candidate profiles, resumes, and cover notes.
  * Transition applicants through the 5 hiring stages.
  * Chat directly with applicants in real time.
  * Manage organization branding, logo, and profile.
* **Blocked Actions:**
  * Cannot apply to internships as a candidate.
  * Cannot edit or view postings belonging to other companies.
  * Cannot self-assign the verified badge (reserved for Admins).
  * Cannot access the Admin Console.

---

### C. Admin Role
* **What they see on login:** They land on the **Admin Moderation & Analytics Console** (`/admin-dashboard`), marked with a gold shield badge and four administration tabs.
* **Dashboard Sections & Buttons:**
  * **Tab 1: Overview & Stats:** Platform-wide metrics (*Total Registered Students*, *Partner Companies*, *Live Postings*, *Total Applications Submitted*, and *Placement Rate %*), plus an analytics breakdown of the **Top In-Demand Skills** across all active roles.
  * **Tab 2: Verify Companies:** A table of all registered employers showing company name, industry, listing count, and status badge. Includes a toggle button: **"Grant Verified Badge"** or **"Revoke Badge"**.
  * **Tab 3: Postings Moderation:** A moderation table showing every job posting on the platform. Includes a status dropdown allowing Admins to set status to *Open*, *Closed*, or **"Moderated / Hidden"** (which immediately hides the posting from public discovery).
  * **Tab 4: User Accounts:** Complete directory of all users on the platform showing display name, email, role (STUDENT, COMPANY, ADMIN), email verification status, and registration date.
* **Allowed Actions:**
  * Verify or unverify partner companies.
  * Moderate and hide any job posting.
  * Inspect platform-wide analytics and user records.
* **Blocked Actions:**
  * Admins do not apply for internships or post jobs as companies.

---

## 3. How a Student and a Company Actually Connect (Step-by-Step Story)

```
[Company Registers] ────────► [Admin Grants Verified Badge]
        │
        ▼
[Company Posts Role] ───────► [Role Goes Live Immediately ('open')]
                                        │
                                        ▼
[Student Discovers Listing] ◄───────────┴── (Search / Department Filter / Algorithmic Match)
        │
        ▼
[Student Submits Application] ──► (Resume PDF + Cover Note)
        │
        ├─────────────────────────────────────────┐
        ▼                                         ▼
[Company Receives In-App Notification]     [Messaging Unlocked Immediately]
        │                                         │
        ▼                                         ▼
[Company Reviews CV & Compatibility]      [Student & Recruiter Chat via In-App Messages]
        │
        ▼
[Company Advances Stage to 'Accepted'] ──► [Student Receives Offer Notification]
```

### 1. Company Registration & Verification
* The company goes to `/register`, selects **"I'm a Company"**, enters their company name, industry, email, and password.
* The account is created instantly and logged in. They can upload their logo and description under `/company-profile`.
* Their account starts as unverified. An Admin navigates to `/admin-dashboard` > "Verify Companies" and clicks **"Grant Verified Badge"**. An in-app notification is sent to the company, and a green "Verified Employer" checkmark appears across their profile and listings.

### 2. Company Posts an Internship Role
* The company clicks **"Post New Role"** (`/post-internship`) and fills in:
  * **Role Title:** e.g., *"Full-Stack Software Engineering Intern"*
  * **Academic Department:** e.g., *Software Engineering*, *Computer Science*, etc.
  * **Field of Study:** e.g., *Web & Full-Stack Development*
  * **Location & Remote:** e.g., *Addis Ababa, Ethiopia* (or check "Remote")
  * **Work Type & Duration:** e.g., *Full-time*, *3 Months*
  * **Compensation:** Paid toggle and monthly stipend in ETB (e.g., *12,000 ETB*)
  * **Application Deadline:** Date picker
  * **Descriptions:** Detailed overview, responsibilities, and requirements
  * **Required Skills Tags:** Dynamic skill tags (e.g., `React`, `Node.js`, `PostgreSQL`)
* Upon clicking **"Publish Internship"**, the posting is saved with status `'open'` and **goes live immediately**.

### 3. Student Discovers the Posting
* A student logs in. On their dashboard, the **"Algorithmic Matches for You"** section automatically recommends the role if it aligns with their academic profile.
* Alternatively, on `/internships`, the student can search keywords, filter by department, field of study, location, or skills, and sort by **"Recommended"** (best compatibility match first).

### 4. Student Applies
* The student opens the job listing (`/internships/:id`) and clicks **"Apply for Role"**.
* In the Apply Modal, they attach their resume (PDF/DOCX) and write a personalized cover note.
* A live compatibility preview shows their match percentage.
* Clicking **"Submit Application"** triggers a confetti animation, records the application in PostgreSQL with status `'applied'`, and alerts the company.

### 5. Company Reviews Applicants & The Matching Score
* The company receives an in-app notification: *"New Applicant Received: [Student Name] applied for [Role]"*.
* In the Company Dashboard under the selected role, the candidate card appears with their GPA, university, cover note, skills, and a clickable link to their PDF resume.
* **The Compatibility Engine (0–100% Score):**
  * **Skill Overlap (50%):** Percentage of required job skills present in the student's profile.
  * **Academic Department Alignment (15%):** Exact department match gives 15 points; related STEM fields give 10 points.
  * **Field of Study Alignment (15%):** Alignment with academic specialization.
  * **Location / Remote Preference (20%):** Remote roles grant full 20 points; in-person roles grant 20 points if cities match (e.g., Addis Ababa), or 8 points for other regions.

### 6. Acceptance or Rejection
* The recruiter selects a new stage from the dropdown: *Under Review*, *Interview Scheduled*, *Accepted / Offer Extended*, or *Rejected*.
* Whenever the stage changes, an automated notification is saved to the student’s notifications table. If accepted, the student receives: *"Congratulations! Offer Received — [Company] updated your application to: Accepted / Offer Extended."*

### 7. Direct Messaging
* **When is messaging unlocked?**
  **Messaging is unlocked immediately as soon as an application is submitted.** It is *not* locked until acceptance.
* Both the student's pipeline card and the company's applicant card have a **"Message"** / **"Chat"** button.
* Clicking it calls `api.startConversation()`, links the two parties, and opens `/messages`.
* Users can exchange real-time messages with read receipts (`is_read`), and each sent message triggers an in-app notification for the recipient.

---

## 4. How to Add Both Roles and Publish for Real Use

### Creating a Brand-New Real Student Account:
1. Navigate to `/register` and select **"I'm a Student"**.
2. Enter your real email, password (min 6 characters), and Full Name.
3. Click **"Create Student Account"**. You are logged in immediately and routed to `/student-profile`.
4. Select your Ethiopian university (e.g., Addis Ababa University, AAiT, ASTU, AASTU), department, field of study, GPA, graduation year, enter your skills tags, and click **"Upload PDF"** to attach your resume.
5. Click **"Save Profile"**.

### Creating a Brand-New Real Company Account:
1. Navigate to `/register` and select **"I'm a Company"**.
2. Enter your work email, password, Company Name, and Industry.
3. Click **"Create Company Account"**. You are logged in immediately and routed to `/company-dashboard`.
4. Go to **"Company Profile"** (`/company-profile`) to upload your company logo, enter your official website, location, and company bio.

### How a Posting Goes Live:
* Go to `/post-internship`, fill out the role details, and click **"Publish Internship"**.
* **Is it instant or is there a review step?** It is **instant**. Postings are created with status `'open'` and are immediately visible to all students on `/internships`.
* **Does an Admin need to do anything first?** **No.** Postings do not require pre-approval. An Admin's role is optional: granting the "Verified Badge" to reputable companies, or moderating/hiding inappropriate listings if reported.

---

## 5. Notifications & Real vs. Stubbed Features

### Notification Trigger Events:
1. **New Application Submitted:** Alerts company: *"New Applicant Received: [Student Name] applied for [Role]"*.
2. **Application Status Updated:** Alerts student: *"Application Status Update"* or *"Congratulations! Offer Received"*.
3. **New Message Sent:** Alerts recipient: *"New message from [Sender Name]: [Snippet]"*.
4. **Company Verification Changed:** Alerts company: *"Company Verified Badge Granted!"*.

### Feature Implementation Reality Check:

| Feature Area | Status | Technical Details |
| :--- | :--- | :--- |
| **In-App Notifications** | **Fully Working** | Persisted in PostgreSQL `notifications` table, polled every 15s in `NotificationContext.jsx`, displayed with unread badges on the Navbar bell. |
| **Email Delivery** | **Simulated / Stubbed** | `sendEmailSimulation()` in `notification.service.js` logs to console via `console.log('[EMAIL SIMULATOR] ...')`. No external SMTP provider (SendGrid/Nodemailer) is currently connected. |
| **Password Reset** | **Simulated for Demo** | `forgotPassword` returns the token directly in the API JSON response for effortless testing without waiting for an email. |
| **Email Verification** | **Partially Implemented** | Database stores `is_verified` and generates tokens, but verification is not enforced; users can log in and use all features immediately upon sign-up. |
| **Job Publishing** | **Fully Working** | Postings are published directly with status `'open'` and appear live instantly. |
| **Matching Algorithm** | **Fully Working** | 4-part weighted compatibility formula runs live on every query in `matching.service.js`. |
| **Direct Messaging** | **Fully Working** | Persisted in `messages` and `conversations` tables, polled every 5s, unlocked upon application. |
| **Company Reviews / Ratings** | **Partially Stubbed** | The database table and backend endpoints exist, but there is currently no review form or review display widget in the frontend UI. |
