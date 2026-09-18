import React from 'react';
import { Link } from 'react-router-dom';
import { Briefcase, Heart, Globe, ShieldCheck } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      background: 'var(--bg-secondary)',
      borderTop: '1px solid var(--border-subtle)',
      padding: '3.5rem 0 2rem 0',
      marginTop: 'auto',
      position: 'relative',
      zIndex: 1,
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '2.5rem',
          marginBottom: '3rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'var(--primary-gradient)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Briefcase size={18} color="#ffffff" />
              </div>
              <span style={{ fontSize: '1.2rem', fontWeight: 800, color: '#ffffff' }}>
                Intern<span style={{ color: 'var(--accent-cyan)' }}>Connect</span>
              </span>
            </div>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
              The high-velocity internship matching platform pairing aspiring talent with innovative tech companies.
            </p>
          </div>

          {/* Students Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>For Students</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/internships" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Browse All Internships</Link></li>
              <li><Link to="/internships?sort=recommended" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Skill-Based Matches</Link></li>
              <li><Link to="/student-profile" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Build Resume Profile</Link></li>
              <li><Link to="/student-dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Application Pipeline Tracker</Link></li>
            </ul>
          </div>

          {/* Companies Links */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>For Companies</h4>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem' }}>
              <li><Link to="/post-internship" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Post an Internship</Link></li>
              <li><Link to="/company-dashboard" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Applicant Kanban Board</Link></li>
              <li><Link to="/companies" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Company Directory</Link></li>
              <li><Link to="/register" style={{ color: 'var(--text-secondary)', fontSize: '0.88rem' }}>Employer Verification</Link></li>
            </ul>
          </div>

          {/* Tech & Verification */}
          <div>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', color: '#ffffff' }}>Platform & Trust</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-cyan)', fontSize: '0.88rem', marginBottom: '0.75rem' }}>
              <ShieldCheck size={18} /> Verified Employer Network
            </div>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.82rem', lineHeight: '1.5' }}>
              Built with React, Express, PostgreSQL, and algorithmic matching. Powered by secure JWT role-based access.
            </p>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid var(--border-subtle)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          color: 'var(--text-muted)',
          fontSize: '0.82rem',
        }}>
          <div>
            © {new Date().getFullYear()} InternConnect Inc. All rights reserved.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Made for students & innovators worldwide</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
