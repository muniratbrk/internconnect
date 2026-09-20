const bcrypt = require('bcryptjs');
const { query } = require('../config/db');

async function seedDatabase() {
  console.log('Seeding database with authentic Ethiopian platform data...');
  const passwordHash = await bcrypt.hash('password123', 10);

  try {
    // Clear existing data in reverse order of foreign keys
    await query('DELETE FROM reviews');
    await query('DELETE FROM notifications');
    await query('DELETE FROM messages');
    await query('DELETE FROM conversations');
    await query('DELETE FROM applications');
    await query('DELETE FROM internships');
    await query('DELETE FROM company_profiles');
    await query('DELETE FROM student_profiles');
    await query('DELETE FROM users');

    // 1. Insert Admin
    const adminUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'admin', TRUE)
      RETURNING id, email, role
    `, ['admin@internconnect.et', passwordHash]);
    const adminId = adminUser.rows[0].id;

    // 2. Insert Ethiopian Companies
    // Company 1: Ethio Telecom
    const ethioUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'company', TRUE)
      RETURNING id
    `, ['internships@ethiotelecom.et', passwordHash]);
    const ethioUserId = ethioUser.rows[0].id;

    const ethioCompany = await query(`
      INSERT INTO company_profiles (user_id, company_name, industry, description, website, logo_url, location, size, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING id
    `, [
      ethioUserId,
      'Ethio Telecom',
      'Telecommunications & Cloud Services',
      'The leading integrated telecommunications and digital cloud infrastructure provider in Ethiopia, serving over 75 million subscribers with fiber, 4G/5G, and enterprise data centers.',
      'https://www.ethiotelecom.et',
      'https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?auto=format&fit=crop&w=200&h=200&q=80',
      'Addis Ababa, Ethiopia (Churchill Rd)',
      '500+'
    ]);
    const ethioId = ethioCompany.rows[0].id;

    // Company 2: Commercial Bank of Ethiopia (CBE / Telebirr)
    const cbeUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'company', TRUE)
      RETURNING id
    `, ['careers@cbe.com.et', passwordHash]);
    const cbeUserId = cbeUser.rows[0].id;

    const cbeCompany = await query(`
      INSERT INTO company_profiles (user_id, company_name, industry, description, website, logo_url, location, size, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING id
    `, [
      cbeUserId,
      'Commercial Bank of Ethiopia (Telebirr)',
      'FinTech & Digital Banking',
      'Pioneering digital financial transformation in the Horn of Africa. Powering seamless digital payments, core banking APIs, and financial inclusion for tens of millions of citizens.',
      'https://www.combanketh.et',
      'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=200&h=200&q=80',
      'Addis Ababa, Ethiopia (Sengatera HQ)',
      '500+'
    ]);
    const cbeId = cbeCompany.rows[0].id;

    // Company 3: Safaricom Ethiopia
    const safaricomUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'company', TRUE)
      RETURNING id
    `, ['careers@safaricom.et', passwordHash]);
    const safaricomUserId = safaricomUser.rows[0].id;

    const safaricomCompany = await query(`
      INSERT INTO company_profiles (user_id, company_name, industry, description, website, logo_url, location, size, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, TRUE)
      RETURNING id
    `, [
      safaricomUserId,
      'Safaricom Ethiopia (M-Pesa)',
      'Mobile Financial Services & Telecom',
      'Transforming lives through cutting-edge GSM network deployment, high-speed digital connectivity, and the nationwide rollout of M-Pesa mobile money platforms.',
      'https://safaricom.et',
      'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?auto=format&fit=crop&w=200&h=200&q=80',
      'Addis Ababa, Ethiopia (Bole Road)',
      '500+'
    ]);
    const safaricomId = safaricomCompany.rows[0].id;

    // Company 4: iCog Labs (Pending Verification for Admin demo)
    const icogUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'company', TRUE)
      RETURNING id
    `, ['talent@icog-labs.com', passwordHash]);
    const icogUserId = icogUser.rows[0].id;

    const icogCompany = await query(`
      INSERT INTO company_profiles (user_id, company_name, industry, description, website, logo_url, location, size, is_verified)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, FALSE)
      RETURNING id
    `, [
      icogUserId,
      'iCog Labs',
      'Artificial Intelligence & Robotics',
      'A premier research laboratory based in Addis Ababa collaborating internationally on Artificial General Intelligence (AGI), Ethiopian NLP, cognitive robotics, and computer vision.',
      'https://icog-labs.com',
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=200&h=200&q=80',
      'Addis Ababa, Ethiopia (Kazanchis)',
      '11-50'
    ]);
    const icogId = icogCompany.rows[0].id;

    // 3. Insert Ethiopian Students
    // Student 1: Munira Tebarek (American College of Technology)
    const muniraUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'student', TRUE)
      RETURNING id
    `, ['muniratbrk@act.edu.et', passwordHash]);
    const muniraUserId = muniraUser.rows[0].id;

    const muniraProfile = await query(`
      INSERT INTO student_profiles (
        user_id, full_name, headline, bio, university, department, field_of_study, major,
        graduation_year, gpa, skills, resume_url, avatar_url, portfolio_url, github_url, linkedin_url,
        availability, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      muniraUserId,
      'Munira Tebarek',
      'Computer Science Senior @ American College of Technology (ACT)',
      'Passionate full-stack developer experienced in building web platforms with React, Node.js, and PostgreSQL. Contributor to open-source and active participant in Ethiopian hackathons.',
      'American College of Technology (ACT)',
      'Computer Science',
      'Web & Full-Stack Development',
      'Computer Science',
      2026,
      3.89,
      ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'Express', 'TailwindCSS', 'REST APIs'],
      'https://example.com/resumes/munira_tebarek_resume.pdf',
      'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&h=200&q=80',
      'https://github.com/muniratbrk',
      'https://github.com/muniratbrk',
      'https://linkedin.com/in/muniratbrk',
      'Summer 2026',
      'Addis Ababa, Ethiopia'
    ]);
    const muniraId = muniraProfile.rows[0].id;

    // Student 2: Bethlehem Alemayehu (AASTU)
    const bettyUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'student', TRUE)
      RETURNING id
    `, ['bethlehem.a@aastu.edu.et', passwordHash]);
    const bettyUserId = bettyUser.rows[0].id;

    const bettyProfile = await query(`
      INSERT INTO student_profiles (
        user_id, full_name, headline, bio, university, department, field_of_study, major,
        graduation_year, gpa, skills, resume_url, avatar_url, portfolio_url, github_url, linkedin_url,
        availability, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      bettyUserId,
      'Bethlehem Alemayehu',
      'AI/ML & Data Science Researcher @ AASTU',
      'Researcher at Addis Ababa Science & Technology University focusing on low-resource NLP for Ethiopian languages (Amharic and Afaan Oromo), deep neural models, and PyTorch.',
      'Addis Ababa Science & Technology University (AASTU)',
      'Data Science & Artificial Intelligence',
      'Machine Learning & Ethiopian NLP',
      'Artificial Intelligence',
      2026,
      3.95,
      ['Python', 'PyTorch', 'Machine Learning', 'Data Science', 'Amharic NLP', 'PostgreSQL'],
      'https://example.com/resumes/bethlehem_alemayehu_resume.pdf',
      'https://images.unsplash.com/photo-1517841905240-472988babdf9?auto=format&fit=crop&w=200&h=200&q=80',
      'https://bettyai.et',
      'https://github.com/bettyalem',
      'https://linkedin.com/in/bettyalem',
      'Immediate',
      'Addis Ababa, Ethiopia'
    ]);
    const bettyId = bettyProfile.rows[0].id;

    // Student 3: Dawit Haile (ASTU)
    const dawitUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'student', TRUE)
      RETURNING id
    `, ['dawit.h@astu.edu.et', passwordHash]);
    const dawitUserId = dawitUser.rows[0].id;

    const dawitProfile = await query(`
      INSERT INTO student_profiles (
        user_id, full_name, headline, bio, university, department, field_of_study, major,
        graduation_year, gpa, skills, resume_url, avatar_url, portfolio_url, github_url, linkedin_url,
        availability, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      dawitUserId,
      'Dawit Haile',
      'Mobile App Specialist (Flutter / Android) @ ASTU',
      'Computer Science senior from Adama Science & Technology University. Built multiple cross-platform mobile apps with Flutter, Firebase, and payment gateway integrations.',
      'Adama Science & Technology University (ASTU)',
      'Computer Science',
      'Mobile App Development (Flutter / Android)',
      'Computer Science',
      2026,
      3.76,
      ['Flutter', 'Dart', 'Android', 'Firebase', 'REST APIs', 'UI/UX Design'],
      'https://example.com/resumes/dawit_haile_resume.pdf',
      'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&h=200&q=80',
      'https://dawitapps.et',
      'https://github.com/dawithaile',
      'https://linkedin.com/in/dawithaile',
      'Summer 2026',
      'Adama, Ethiopia'
    ]);
    const dawitId = dawitProfile.rows[0].id;

    // Student 4: Selamawit Bekele (BiT)
    const selamUser = await query(`
      INSERT INTO users (email, password_hash, role, is_verified)
      VALUES ($1, $2, 'student', TRUE)
      RETURNING id
    `, ['selamawit.b@bit.edu.et', passwordHash]);
    const selamUserId = selamUser.rows[0].id;

    const selamProfile = await query(`
      INSERT INTO student_profiles (
        user_id, full_name, headline, bio, university, department, field_of_study, major,
        graduation_year, gpa, skills, resume_url, avatar_url, portfolio_url, github_url, linkedin_url,
        availability, location
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      selamUserId,
      'Selamawit Bekele',
      'Embedded Systems & Cloud IoT @ Bahir Dar University (BiT)',
      'Electrical & Computer Engineering student enthusiastic about telemetry sensors, solar microgrids, and connected smart hardware for agricultural automation.',
      'Bahir Dar University (BiT)',
      'Electrical & Computer Engineering',
      'Embedded Systems & IoT Telemetry',
      'Electrical Engineering',
      2027,
      3.82,
      ['C++', 'Python', 'IoT', 'Linux', 'Docker', 'Microcontrollers'],
      'https://example.com/resumes/selamawit_bekele_resume.pdf',
      'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=200&h=200&q=80',
      'https://selambekele.et',
      'https://github.com/selambek',
      'https://linkedin.com/in/selambek',
      'Summer 2026',
      'Bahir Dar, Ethiopia'
    ]);
    const selamId = selamProfile.rows[0].id;

    // 4. Insert Ethiopian Internships (with Department, Field, and ETB Stipends)
    // Listing 1: Digital Banking & Telebirr Full-Stack Intern @ CBE
    const jobCbeFullstack = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status, views_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      cbeId,
      'Digital Banking & Telebirr Full-Stack Intern',
      'Software Engineering',
      'FinTech & Payment Systems',
      'Join the digital innovation division at Commercial Bank of Ethiopia to develop mission-critical merchant interfaces and high-throughput transaction verification services.',
      'Proficiency in modern JavaScript/TypeScript, React, Node.js, and PostgreSQL. Understanding of secure financial REST APIs and session handling.',
      'Implement responsive web interfaces for merchants, collaborate with senior financial system architects, and write reliable automated tests.',
      'Addis Ababa, Ethiopia (Sengatera)',
      false,
      'Full-time',
      true,
      12500.00,
      'ETB',
      '3 Months',
      ['React', 'Node.js', 'TypeScript', 'PostgreSQL', 'REST APIs'],
      '2026-11-30',
      'open',
      245
    ]);
    const cbeJob1Id = jobCbeFullstack.rows[0].id;

    // Listing 2: Telecommunications & Cloud Infrastructure Intern @ Ethio Telecom
    const jobEthioCloud = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status, views_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      ethioId,
      'Cloud Infrastructure & Network Systems Intern',
      'Information Technology & Systems',
      'Cybersecurity & Network Systems',
      'Gain hands-on experience in telecom cloud virtualization, data center administration, and server monitoring across Ethio Telecom national infrastructure.',
      'Familiarity with Linux administration, containerization (Docker), IP networking, and basic scripting in Python or Bash.',
      'Assist senior systems engineers in monitoring cloud server health, diagnosing network telemetry anomalies, and automating deployment scripts.',
      'Addis Ababa, Ethiopia (Churchill Rd)',
      false,
      'Full-time',
      true,
      11000.00,
      'ETB',
      '4 Months',
      ['Linux', 'Docker', 'Python', 'Networking', 'Cybersecurity'],
      '2026-12-15',
      'open',
      198
    ]);
    const ethioJob1Id = jobEthioCloud.rows[0].id;

    // Listing 3: Mobile Money Application Intern @ Safaricom Ethiopia
    const jobSafaricomMobile = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status, views_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      safaricomId,
      'Mobile Financial Services (M-Pesa) Engineering Intern',
      'Computer Science',
      'Mobile App Development (Flutter / Android)',
      'Work with Safaricom digital product squad to build next-generation consumer and merchant features on the M-Pesa mobile ecosystem in Ethiopia.',
      'Strong knowledge of Flutter or native Android, RESTful integration, state management, and modern mobile UX design guidelines.',
      'Develop client-side mobile modules, test transaction flows across multiple Android devices, and participate in daily agile sprints.',
      'Addis Ababa, Ethiopia (Bole Road)',
      false,
      'Full-time',
      true,
      14000.00,
      'ETB',
      '3 Months',
      ['Flutter', 'Dart', 'Android', 'REST APIs', 'UI/UX Design'],
      '2026-11-15',
      'open',
      276
    ]);
    const safaricomJob1Id = jobSafaricomMobile.rows[0].id;

    // Listing 4: Amharic & Afaan Oromo NLP Research Intern @ iCog Labs
    const jobIcogAI = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status, views_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      icogId,
      'Ethiopian Languages NLP & AI Research Intern',
      'Data Science & Artificial Intelligence',
      'Machine Learning & Ethiopian NLP',
      'Participate in state-of-the-art tokenization, dataset curation, and transformer fine-tuning for Amharic and Afaan Oromo open foundation models.',
      'Proficiency in Python, PyTorch or TensorFlow, HuggingFace transformers, and solid understanding of natural language processing concepts.',
      'Preprocess large multilingual Ethiopian text corpora, evaluate perplexity benchmarks, and build interactive demonstration models.',
      'Addis Ababa, Ethiopia (Kazanchis)',
      true, // Remote allowed in Ethiopia
      'Full-time',
      true,
      15000.00,
      'ETB',
      '6 Months',
      ['Python', 'PyTorch', 'Amharic NLP', 'Machine Learning', 'Data Science'],
      '2026-12-31',
      'open',
      312
    ]);
    const icogJob1Id = jobIcogAI.rows[0].id;

    // Listing 5: Smart IoT & Telemetry Engineering Intern @ Ethio Telecom
    const jobEthioIoT = await query(`
      INSERT INTO internships (
        company_id, title, department, field_of_study, description, requirements, responsibilities,
        location, is_remote, work_type, is_paid, stipend_amount, stipend_currency,
        duration, required_skills, application_deadline, status, views_count
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
      RETURNING id
    `, [
      ethioId,
      'Connected Smart Grid & IoT Telemetry Intern',
      'Electrical & Computer Engineering',
      'Embedded Systems & IoT Telemetry',
      'Join our research engineering team to test remote telemetry devices and environmental sensor arrays deployed at base transceiver stations nationwide.',
      'Hands-on experience with microcontrollers, C++ or Python embedded programming, sensor protocols (Modbus, MQTT), and Linux environments.',
      'Assemble telemetry test benches, calibrate environmental sensors, and write data logging handlers transmitting via 4G/NB-IoT.',
      'Addis Ababa, Ethiopia',
      false,
      'Full-time',
      true,
      9500.00,
      'ETB',
      '3 Months',
      ['C++', 'Python', 'IoT', 'Linux', 'Microcontrollers'],
      '2026-10-31',
      'open',
      120
    ]);

    // 5. Insert Applications
    // Munira -> CBE Fullstack (Interviewing)
    const appMuniraCbe = await query(`
      INSERT INTO applications (
        internship_id, student_id, resume_url, cover_note, status, company_notes
      ) VALUES ($1, $2, $3, $4, 'interview', 'Excellent performance in technical screening. Deep knowledge of React and PostgreSQL relational queries.')
      RETURNING id
    `, [
      cbeJob1Id,
      muniraId,
      'https://example.com/resumes/munira_tebarek_resume.pdf',
      'Greetings CBE Digital Team! As a Computer Science student at American College of Technology (ACT), I have built web applications integrating modern APIs and databases. I am eager to contribute to CBE digital banking infrastructure this summer.'
    ]);
    const appMuniraCbeId = appMuniraCbe.rows[0].id;

    // Munira -> Safaricom M-Pesa (Accepted!)
    const appMuniraSafaricom = await query(`
      INSERT INTO applications (
        internship_id, student_id, resume_url, cover_note, status, company_notes
      ) VALUES ($1, $2, $3, $4, 'accepted', 'Unanimously approved. Official internship offer extended.')
      RETURNING id
    `, [
      safaricomJob1Id,
      muniraId,
      'https://example.com/resumes/munira_tebarek_resume.pdf',
      'Safaricom is transforming digital connectivity in Ethiopia. I am passionate about scaling reliable client-facing products and would love to join your engineering team.'
    ]);
    const appMuniraSafaricomId = appMuniraSafaricom.rows[0].id;

    // Bethlehem -> iCog Labs (Under Review)
    await query(`
      INSERT INTO applications (
        internship_id, student_id, resume_url, cover_note, status, company_notes
      ) VALUES ($1, $2, $3, $4, 'under_review', 'Reviewing AASTU NLP research papers.')
    `, [
      icogJob1Id,
      bettyId,
      'https://example.com/resumes/bethlehem_alemayehu_resume.pdf',
      'My research focus at AASTU is low-resource transformer tokenization for Ethiopian languages. Contributing to iCog Labs frontier research would be an ideal opportunity.'
    ]);

    // Dawit -> Safaricom (Applied)
    await query(`
      INSERT INTO applications (
        internship_id, student_id, resume_url, cover_note, status, company_notes
      ) VALUES ($1, $2, $3, $4, 'applied', NULL)
    `, [
      safaricomJob1Id,
      dawitId,
      'https://example.com/resumes/dawit_haile_resume.pdf',
      'Experienced in building modern mobile applications with Flutter and clean state management. Excited about the M-Pesa digital ecosystem.'
    ]);

    // 6. Insert Conversations & Thread Messages
    // Conversation 1: Munira & CBE Recruiter
    const convCbeMunira = await query(`
      INSERT INTO conversations (application_id, student_id, company_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [appMuniraCbeId, muniraId, cbeId]);
    const convCbeMuniraId = convCbeMunira.rows[0].id;

    await query(`
      INSERT INTO messages (conversation_id, sender_user_id, content, is_read)
      VALUES 
      ($1, $2, 'Selam Munira! Thank you for applying to CBE Digital Banking. Your ACT coursework and GitHub projects look very impressive.', TRUE),
      ($1, $3, 'Selam! Thank you so much for considering my application. I am thrilled about the opportunity to work on Telebirr solutions!', TRUE),
      ($1, $2, 'We would like to invite you for an in-person technical discussion next Tuesday at the CBE Headquarters in Sengatera. Does 10:00 AM work for you?', FALSE)
    `, [convCbeMuniraId, cbeUserId, muniraUserId]);

    // Conversation 2: Munira & Safaricom Ethiopia
    const convSafaricomMunira = await query(`
      INSERT INTO conversations (application_id, student_id, company_id)
      VALUES ($1, $2, $3)
      RETURNING id
    `, [appMuniraSafaricomId, muniraId, safaricomId]);
    const convSafaricomMuniraId = convSafaricomMunira.rows[0].id;

    await query(`
      INSERT INTO messages (conversation_id, sender_user_id, content, is_read)
      VALUES 
      ($1, $2, 'Congratulations Munira! Following your final interview, Safaricom Ethiopia is pleased to extend you an official internship offer.', TRUE),
      ($1, $3, 'Thank you so much! This is wonderful news. I will review the acceptance documentation immediately.', TRUE)
    `, [convSafaricomMuniraId, safaricomUserId, muniraUserId]);

    // 7. Insert Notifications
    await query(`
      INSERT INTO notifications (user_id, title, message, link, type, is_read)
      VALUES 
      ($1, 'Interview Scheduled', 'Commercial Bank of Ethiopia updated your application status to Interviewing!', '/student-dashboard', 'application_status', FALSE),
      ($1, 'Congratulations! Offer Accepted', 'Safaricom Ethiopia extended you an official internship offer.', '/student-dashboard', 'application_status', FALSE),
      ($2, 'New Candidate Application', 'Dawit Haile applied for Mobile Financial Services (M-Pesa) Engineering Intern.', '/company-dashboard', 'new_application', FALSE),
      ($3, 'Employer Verification Review', 'iCog Labs has submitted company credentials for verification.', '/admin-dashboard', 'admin_verification', FALSE)
    `, [muniraUserId, safaricomUserId, adminId]);

    // 8. Insert Review
    await query(`
      INSERT INTO reviews (internship_id, student_id, company_id, reviewer_role, rating, comment)
      VALUES ($1, $2, $3, 'student', 5, 'Exceptional experience working with the CBE digital banking team. Mentors were accessible and gave us real impact on merchant APIs!')
    `, [cbeJob1Id, muniraId, cbeId]);

    console.log('Database seeded successfully with authentic Ethiopian data!');
    console.log('Demo Accounts:');
    console.log(' - Student: muniratbrk@act.edu.et / password123 (ACT, Computer Science, Addis Ababa)');
    console.log(' - Company: careers@cbe.com.et / password123 (CBE / Telebirr)');
    console.log(' - Company: internships@ethiotelecom.et / password123 (Ethio Telecom)');
    console.log(' - Admin:   admin@internconnect.et / password123');
  } catch (error) {
    console.error('Seeding failed:', error);
    process.exit(1);
  }
}

if (require.main === module) {
  seedDatabase().then(() => process.exit(0));
}

module.exports = seedDatabase;
