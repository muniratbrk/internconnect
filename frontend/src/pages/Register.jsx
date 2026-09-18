import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Briefcase, GraduationCap, Building2, CheckCircle2 } from 'lucide-react';

export default function Register() {
  const { register } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [role, setRole] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [industry, setIndustry] = useState('Software & Technology');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const payload = {
        email,
        password,
        role,
        fullName: role === 'student' ? fullName : undefined,
        companyName: role === 'company' ? companyName : undefined,
        industry: role === 'company' ? industry : undefined,
      };

      const res = await register(payload);
      toast('Welcome to InternConnect! Account created successfully.', 'success');
      if (res.user.role === 'student') navigate('/student-profile');
      else if (res.user.role === 'company') navigate('/company-dashboard');
    } catch (err) {
      toast(err.message || 'Registration failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '540px' }}>
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Header */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '12px',
              background: 'var(--primary-gradient)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '0 auto 1rem auto',
              boxShadow: 'var(--shadow-glow)',
            }}>
              <Briefcase size={24} color="#ffffff" />
            </div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Create Your Account</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Select your role to get started
            </p>
          </div>

          {/* Role Selection Cards */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '2rem' }}>
            <div
              onClick={() => setRole('student')}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: role === 'student' ? 'rgba(79, 70, 229, 0.15)' : 'rgba(255,255,255,0.02)',
                border: role === 'student' ? '2px solid var(--primary)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: role === 'student' ? 'var(--primary)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                color: '#ffffff',
              }}>
                <GraduationCap size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>I'm a Student</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Find internships & match skills
              </div>
            </div>

            <div
              onClick={() => setRole('company')}
              style={{
                padding: '1.25rem 1rem',
                borderRadius: 'var(--radius-md)',
                background: role === 'company' ? 'rgba(6, 182, 212, 0.15)' : 'rgba(255,255,255,0.02)',
                border: role === 'company' ? '2px solid var(--accent-cyan)' : '1px solid var(--border-subtle)',
                cursor: 'pointer',
                textAlign: 'center',
                transition: 'all var(--transition-fast)',
              }}
            >
              <div style={{
                width: '40px',
                height: '40px',
                borderRadius: '50%',
                background: role === 'company' ? 'var(--accent-cyan)' : 'rgba(255,255,255,0.05)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                margin: '0 auto 0.75rem auto',
                color: '#ffffff',
              }}>
                <Building2 size={20} />
              </div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>I'm a Company</div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                Post roles & manage pipeline
              </div>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            {role === 'student' ? (
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. Alex Chen"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>
            ) : (
              <>
                <div className="form-group">
                  <label className="form-label">Company Name</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Stripe, OpenAI, EcoTech"
                    value={companyName}
                    onChange={(e) => setCompanyName(e.target.value)}
                    required
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Industry</label>
                  <select
                    className="form-select"
                    value={industry}
                    onChange={(e) => setIndustry(e.target.value)}
                  >
                    <option value="Software & Technology">Software & Technology</option>
                    <option value="Fintech">Fintech</option>
                    <option value="Artificial Intelligence">Artificial Intelligence</option>
                    <option value="CleanTech & Energy">CleanTech & Energy</option>
                    <option value="Healthcare Tech">Healthcare Tech</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label className="form-label">Email Address</label>
              <input
                type="email"
                className="form-input"
                placeholder={role === 'student' ? 'alex.chen@university.edu' : 'recruiting@company.com'}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-input"
                placeholder="At least 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={loading}>
              {loading ? 'Creating Account...' : `Register as ${role === 'student' ? 'Student' : 'Company'}`}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Sign In
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
