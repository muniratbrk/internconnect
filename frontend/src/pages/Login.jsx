import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Briefcase, Sparkles, ArrowRight, Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login, demoLogin } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await login(email, password);
      toast(`Welcome back, ${res.profile?.full_name || res.profile?.company_name || 'Admin'}!`, 'success');
      if (res.user.role === 'student') navigate('/student-dashboard');
      else if (res.user.role === 'company') navigate('/company-dashboard');
      else if (res.user.role === 'admin') navigate('/admin-dashboard');
    } catch (err) {
      toast(err.message || 'Login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDemoClick = async (role) => {
    setLoading(true);
    try {
      const res = await demoLogin(role);
      toast(`Logged in as Demo ${role.toUpperCase()}!`, 'success');
      if (role === 'student') navigate('/student-dashboard');
      else if (role === 'company') navigate('/company-dashboard');
      else if (role === 'admin') navigate('/admin-dashboard');
    } catch (err) {
      toast(err.message || 'Demo login failed.', 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="page-wrapper" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="container" style={{ maxWidth: '460px' }}>
        {/* Card */}
        <div className="glass-card" style={{ padding: '2.5rem' }}>
          {/* Logo & Title */}
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
            <h1 style={{ fontSize: '1.75rem', fontWeight: 800 }}>Welcome Back</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', marginTop: '0.4rem' }}>
              Sign in to your InternConnect account
            </p>
          </div>

          {/* 1-Click Demo Accounts Bar */}
          <div style={{
            background: 'rgba(79, 70, 229, 0.08)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            borderRadius: 'var(--radius-md)',
            padding: '1rem',
            marginBottom: '1.75rem',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#818CF8', fontSize: '0.82rem', fontWeight: 700, marginBottom: '0.65rem' }}>
              <Sparkles size={14} />
              <span>1-Click Instant Demo Evaluation</span>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemoClick('student')}
                className="btn btn-secondary btn-sm"
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem', whiteSpace: 'nowrap' }}
                title="Munira Tebarek (ACT Computer Science)"
              >
                Student (ACT)
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('company')}
                className="btn btn-secondary btn-sm"
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem', whiteSpace: 'nowrap' }}
                title="Commercial Bank of Ethiopia / Telebirr"
              >
                CBE / Telebirr
              </button>
              <button
                type="button"
                onClick={() => handleDemoClick('admin')}
                className="btn btn-secondary btn-sm"
                disabled={loading}
                style={{ fontSize: '0.75rem', padding: '0.45rem 0.2rem', whiteSpace: 'nowrap' }}
                title="System Administrator (InternConnect ET)"
              >
                Admin (ET)
              </button>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-input"
                  placeholder="e.g. muniratbrk@act.edu.et"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <label className="form-label">Password</label>
                <Link to="/forgot-password" style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>
                  Forgot?
                </Link>
              </div>
              <input
                type="password"
                className="form-input"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '0.75rem' }} disabled={loading}>
              {loading ? 'Authenticating...' : 'Sign In'}
            </button>
          </form>

          {/* Footer */}
          <div style={{ textAlign: 'center', marginTop: '1.75rem', fontSize: '0.88rem', color: 'var(--text-secondary)' }}>
            Don't have an account?{' '}
            <Link to="/register" style={{ color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Create an account
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
