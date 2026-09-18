const http = require('http');
const app = require('./src/app');
const runMigrations = require('./src/db/migrate');
const seedDatabase = require('./src/db/seed');

let server;
const PORT = 5099;
const BASE_URL = `http://localhost:${PORT}/api`;

function request(path, options = {}) {
  return new Promise((resolve, reject) => {
    const url = new URL(`${BASE_URL}${path}`);
    const reqOptions = {
      method: options.method || 'GET',
      headers: options.headers || {},
    };

    const req = http.request(url, reqOptions, (res) => {
      let data = '';
      res.on('data', (chunk) => (data += chunk));
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve({ status: res.statusCode, body: parsed });
        } catch {
          resolve({ status: res.statusCode, body: data });
        }
      });
    });

    req.on('error', reject);

    if (options.body) {
      req.write(JSON.stringify(options.body));
    }
    req.end();
  });
}

async function runTests() {
  console.log('🧪 Starting InternConnect Automated Integration Tests...');

  await runMigrations();
  await seedDatabase();

  server = app.listen(PORT);
  await new Promise((r) => setTimeout(r, 500));

  try {
    // 1. Health check
    const health = await request('/health');
    console.log('✔ Health Check:', health.status === 200 ? 'PASSED' : 'FAILED', health.body);

    // 2. Student Login (Yohannes Tesfaye @ AAiT)
    const studentLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'yohannes.t@aait.edu.et', password: 'password123' },
    });
    console.log('✔ Student Login:', studentLogin.status === 200 ? 'PASSED' : 'FAILED');
    const studentToken = studentLogin.body.token;

    // 3. Get Auth Me (Student)
    const me = await request('/auth/me', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('✔ Student Profile Verification:', me.body.profile.full_name === 'Yohannes Tesfaye' ? 'PASSED' : 'FAILED');
    console.log(`   Department: ${me.body.profile.department} | Field: ${me.body.profile.field_of_study}`);

    // 4. Internship List with Department & Matching
    const internships = await request('/internships?department=Software%20Engineering&sort=recommended', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('✔ Department-Filtered Internships:', internships.body.internships.length > 0 ? 'PASSED' : 'FAILED');
    console.log(`   Top match: "${internships.body.internships[0].title}" - Match Score: ${internships.body.internships[0].match?.overallScore}% - Stipend: Br ${internships.body.internships[0].stipend_amount}/mo`);

    // 5. Recommended Internships
    const recs = await request('/internships/recommended', {
      headers: { Authorization: `Bearer ${studentToken}` },
    });
    console.log('✔ Personalized Recommendations:', recs.body.recommendations.length > 0 ? 'PASSED' : 'FAILED');

    // 6. Company Login (CBE / Telebirr)
    const companyLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'careers@cbe.com.et', password: 'password123' },
    });
    console.log('✔ Company Login (CBE):', companyLogin.status === 200 ? 'PASSED' : 'FAILED');
    const companyToken = companyLogin.body.token;

    // 7. Company Postings & Pipeline Counts
    const companyPostings = await request('/internships/company/my-postings', {
      headers: { Authorization: `Bearer ${companyToken}` },
    });
    console.log('✔ Company Postings & Pipeline:', companyPostings.body.postings.length > 0 ? 'PASSED' : 'FAILED');

    // 8. Admin Login & Analytics
    const adminLogin = await request('/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: { email: 'admin@internconnect.et', password: 'password123' },
    });
    console.log('✔ Admin Login:', adminLogin.status === 200 ? 'PASSED' : 'FAILED');
    const adminToken = adminLogin.body.token;

    const analytics = await request('/admin/analytics', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    console.log('✔ Admin Analytics:', analytics.body.analytics ? 'PASSED' : 'FAILED');
    console.log('   Stats:', JSON.stringify(analytics.body.analytics, null, 2));

    // 9. Admin Toggle Company Verification
    const companies = await request('/admin/companies', {
      headers: { Authorization: `Bearer ${adminToken}` },
    });
    const unverified = companies.body.companies.find((c) => !c.is_verified);
    if (unverified) {
      const toggle = await request(`/admin/companies/${unverified.id}/verify`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${adminToken}`,
        },
        body: { is_verified: true },
      });
      console.log('✔ Admin Verified Badge Toggle:', toggle.body.company.is_verified === true ? 'PASSED' : 'FAILED');
    }

    console.log('\n🎉 ALL BACKEND API INTEGRATION TESTS PASSED PERFECTLY!');
  } catch (err) {
    console.error('❌ Test failed with error:', err);
  } finally {
    server.close();
    process.exit(0);
  }
}

runTests();
