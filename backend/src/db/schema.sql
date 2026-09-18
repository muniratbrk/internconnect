-- InternConnect PostgreSQL Database Schema (Ethiopian Localization & Taxonomy)

-- 1. Users Table (Authentication & RBAC)
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('student', 'company', 'admin')),
    is_verified BOOLEAN DEFAULT FALSE,
    verification_token VARCHAR(255),
    reset_token VARCHAR(255),
    reset_token_expiry TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Student Profiles
CREATE TABLE IF NOT EXISTS student_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    full_name VARCHAR(150) NOT NULL,
    headline VARCHAR(255),
    bio TEXT,
    university VARCHAR(200),
    department VARCHAR(100),
    field_of_study VARCHAR(100),
    major VARCHAR(150),
    graduation_year INTEGER,
    gpa NUMERIC(3,2),
    skills TEXT[] DEFAULT '{}',
    resume_url VARCHAR(500),
    avatar_url VARCHAR(500),
    portfolio_url VARCHAR(255),
    github_url VARCHAR(255),
    linkedin_url VARCHAR(255),
    availability VARCHAR(100) DEFAULT 'Summer 2026',
    location VARCHAR(150) DEFAULT 'Addis Ababa, Ethiopia',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Company Profiles
CREATE TABLE IF NOT EXISTS company_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID UNIQUE NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    company_name VARCHAR(200) NOT NULL,
    industry VARCHAR(100) NOT NULL,
    description TEXT,
    website VARCHAR(255),
    logo_url VARCHAR(500),
    location VARCHAR(150) DEFAULT 'Addis Ababa, Ethiopia',
    size VARCHAR(50) DEFAULT '51-200',
    is_verified BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Internships (Postings)
CREATE TABLE IF NOT EXISTS internships (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    department VARCHAR(100),
    field_of_study VARCHAR(100),
    description TEXT NOT NULL,
    requirements TEXT NOT NULL,
    responsibilities TEXT,
    location VARCHAR(150) NOT NULL DEFAULT 'Addis Ababa, Ethiopia',
    is_remote BOOLEAN DEFAULT FALSE,
    work_type VARCHAR(50) DEFAULT 'Full-time',
    is_paid BOOLEAN DEFAULT TRUE,
    stipend_amount NUMERIC(10,2),
    stipend_currency VARCHAR(10) DEFAULT 'ETB',
    duration VARCHAR(50) DEFAULT '3 Months',
    required_skills TEXT[] DEFAULT '{}',
    application_deadline DATE,
    status VARCHAR(20) DEFAULT 'open' CHECK (status IN ('open', 'closed', 'draft', 'moderated')),
    views_count INTEGER DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Applications (Student Pipeline)
CREATE TABLE IF NOT EXISTS applications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID NOT NULL REFERENCES internships(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    resume_url VARCHAR(500),
    cover_note TEXT,
    status VARCHAR(30) DEFAULT 'applied' CHECK (status IN ('applied', 'under_review', 'interview', 'accepted', 'rejected')),
    company_notes TEXT,
    applied_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_internship_student UNIQUE (internship_id, student_id)
);

-- 6. Conversations (Post-match/application messaging threads)
CREATE TABLE IF NOT EXISTS conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    application_id UUID REFERENCES applications(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_conversation_parties UNIQUE (student_id, company_id)
);

-- 7. Messages
CREATE TABLE IF NOT EXISTS messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES conversations(id) ON DELETE CASCADE,
    sender_user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    content TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. Notifications
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    type VARCHAR(50) DEFAULT 'system',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. Reviews & Ratings
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    internship_id UUID REFERENCES internships(id) ON DELETE SET NULL,
    student_id UUID NOT NULL REFERENCES student_profiles(id) ON DELETE CASCADE,
    company_id UUID NOT NULL REFERENCES company_profiles(id) ON DELETE CASCADE,
    reviewer_role VARCHAR(20) NOT NULL CHECK (reviewer_role IN ('student', 'company')),
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Safe Alterations for Department, Field of Study, and Ethiopian Currency
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE student_profiles ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);
ALTER TABLE internships ADD COLUMN IF NOT EXISTS department VARCHAR(100);
ALTER TABLE internships ADD COLUMN IF NOT EXISTS field_of_study VARCHAR(100);
ALTER TABLE internships ALTER COLUMN stipend_currency SET DEFAULT 'ETB';

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_users_role ON users(role);
CREATE INDEX IF NOT EXISTS idx_student_department ON student_profiles(department);
CREATE INDEX IF NOT EXISTS idx_student_field ON student_profiles(field_of_study);
CREATE INDEX IF NOT EXISTS idx_internships_company ON internships(company_id);
CREATE INDEX IF NOT EXISTS idx_internships_status ON internships(status);
CREATE INDEX IF NOT EXISTS idx_internships_department ON internships(department);
CREATE INDEX IF NOT EXISTS idx_internships_field ON internships(field_of_study);
CREATE INDEX IF NOT EXISTS idx_applications_internship ON applications(internship_id);
CREATE INDEX IF NOT EXISTS idx_applications_student ON applications(student_id);
CREATE INDEX IF NOT EXISTS idx_messages_conversation ON messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
