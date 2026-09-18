import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { 
  Shield, 
  Users, 
  Building2, 
  Briefcase, 
  CheckCircle, 
  XCircle, 
  TrendingUp, 
  Sparkles,
  Search,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const { toast } = useNotification();

  const [analytics, setAnalytics] = useState(null);
  const [companies, setCompanies] = useState([]);
  const [postings, setPostings] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('overview'); // overview, companies, postings, users

  const loadAdminData = async () => {
    try {
      const [analyticsRes, companiesRes, postingsRes, usersRes] = await Promise.all([
        api.getAdminAnalytics(),
        api.getAdminCompanies(),
        api.getAdminPostings(),
        api.getAdminUsers(),
      ]);

      setAnalytics(analyticsRes.analytics);
      setCompanies(companiesRes.companies || []);
      setPostings(postingsRes.postings || []);
      setUsers(usersRes.users || []);
    } catch (err) {
      console.error('Failed to load admin data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAdminData();
  }, []);

  const handleToggleVerification = async (companyId, currentStatus) => {
    const nextStatus = !currentStatus;
    try {
      await api.toggleCompanyVerification(companyId, { is_verified: nextStatus });
      setCompanies((prev) =>
        prev.map((c) => (c.id === companyId ? { ...c, is_verified: nextStatus } : c))
      );
      toast(`Company verified status updated to ${nextStatus ? 'Verified' : 'Unverified'}.`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to update verification status.', 'error');
    }
  };

  const handleUpdatePostingStatus = async (postingId, newStatus) => {
    try {
      await api.updatePostingModeration(postingId, { status: newStatus });
      setPostings((prev) =>
        prev.map((p) => (p.id === postingId ? { ...p, status: newStatus } : p))
      );
      toast(`Posting status updated to ${newStatus}.`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to moderate posting.', 'error');
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#FBBF24', fontSize: '0.85rem', fontWeight: 600 }}>
              <Shield size={16} /> Admin Moderation & Analytics Console
            </div>
            <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Platform Administration</h1>
          </div>

          {/* Tab Switcher */}
          <div style={{
            display: 'flex',
            background: 'var(--bg-card)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-lg)',
            padding: '4px',
            gap: '4px',
          }}>
            <button
              onClick={() => setActiveTab('overview')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'overview' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'overview' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Overview & Stats
            </button>
            <button
              onClick={() => setActiveTab('companies')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'companies' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'companies' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Verify Companies ({companies.filter((c) => !c.is_verified).length} pending)
            </button>
            <button
              onClick={() => setActiveTab('postings')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'postings' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'postings' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              Postings Moderation
            </button>
            <button
              onClick={() => setActiveTab('users')}
              style={{
                padding: '0.45rem 1rem',
                border: 'none',
                borderRadius: 'var(--radius-md)',
                background: activeTab === 'users' ? 'var(--primary)' : 'transparent',
                color: activeTab === 'users' ? '#ffffff' : 'var(--text-secondary)',
                fontWeight: 600,
                fontSize: '0.85rem',
                cursor: 'pointer',
              }}
            >
              User Accounts
            </button>
          </div>
        </div>

        {/* Tab 1: Overview & Analytics */}
        {activeTab === 'overview' && analytics && (
          <div>
            {/* Stat Cards */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '2.5rem' }}>
              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Total Registered Students</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>
                  {analytics.totalStudents}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Partner Companies</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>
                  {analytics.totalCompanies}
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {analytics.verifiedCompanies} verified
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Live Postings</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: '#818CF8' }}>
                  {analytics.activePostings}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Applications Submitted</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: '#F59E0B' }}>
                  {analytics.totalApplications}
                </div>
              </div>

              <div className="glass-card" style={{ padding: '1.5rem' }}>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>Placement Rate</div>
                <div style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.25rem', color: '#10B981' }}>
                  {analytics.acceptanceRate}%
                </div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  {analytics.acceptedApplications} candidates accepted
                </div>
              </div>
            </div>

            {/* Top In-Demand Skills */}
            <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '1rem' }}>
                Top Skills In-Demand Across Current Postings
              </h3>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem' }}>
                {(analytics.topSkills || []).map((s, idx) => (
                  <div
                    key={idx}
                    style={{
                      background: 'rgba(79, 70, 229, 0.12)',
                      border: '1px solid rgba(79, 70, 229, 0.3)',
                      borderRadius: 'var(--radius-md)',
                      padding: '0.65rem 1.25rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.75rem',
                    }}
                  >
                    <span style={{ fontWeight: 600, color: '#ffffff' }}>{s.skill}</span>
                    <span style={{
                      background: 'var(--primary)',
                      color: '#ffffff',
                      fontSize: '0.75rem',
                      padding: '2px 8px',
                      borderRadius: 'var(--radius-full)',
                      fontWeight: 700,
                    }}>
                      {s.count} roles
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Company Verification Queue */}
        {activeTab === 'companies' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Company Moderation & Verification
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Company</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Industry</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Active Roles</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {companies.map((c) => (
                    <tr key={c.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <img
                          src={c.logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=80&h=80&q=80'}
                          alt={c.company_name}
                          style={{ width: '36px', height: '36px', borderRadius: '8px', objectFit: 'cover' }}
                        />
                        <div>
                          <div style={{ fontWeight: 600, color: '#ffffff' }}>{c.company_name}</div>
                          <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{c.email}</div>
                        </div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{c.industry}</td>
                      <td style={{ padding: '1rem' }}>{c.total_postings || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        {c.is_verified ? (
                          <span className="badge badge-success">
                            <CheckCircle size={12} /> Verified
                          </span>
                        ) : (
                          <span className="badge badge-warning">
                            Pending Review
                          </span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <button
                          onClick={() => handleToggleVerification(c.id, c.is_verified)}
                          className={c.is_verified ? 'btn btn-secondary btn-sm' : 'btn btn-primary btn-sm'}
                        >
                          {c.is_verified ? 'Revoke Badge' : 'Grant Verified Badge'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 3: Postings Moderation */}
        {activeTab === 'postings' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Job Postings Moderation
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Title & Company</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Location</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Applicants</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Status</th>
                    <th style={{ padding: '0.75rem 1rem', textAlign: 'right' }}>Moderation Action</th>
                  </tr>
                </thead>
                <tbody>
                  {postings.map((p) => (
                    <tr key={p.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem' }}>
                        <div style={{ fontWeight: 600, color: '#ffffff' }}>{p.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{p.company_name}</div>
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>
                        {p.is_remote ? 'Remote' : p.location}
                      </td>
                      <td style={{ padding: '1rem' }}>{p.applicant_count || 0}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${p.status === 'open' ? 'badge-success' : p.status === 'moderated' ? 'badge-danger' : 'badge-secondary'}`}>
                          {p.status}
                        </span>
                      </td>
                      <td style={{ padding: '1rem', textAlign: 'right' }}>
                        <select
                          className="form-select"
                          style={{ width: 'auto', display: 'inline-block', padding: '0.3rem 0.65rem', fontSize: '0.8rem' }}
                          value={p.status}
                          onChange={(e) => handleUpdatePostingStatus(p.id, e.target.value)}
                        >
                          <option value="open">Open</option>
                          <option value="closed">Closed</option>
                          <option value="moderated">Moderated / Hidden</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Tab 4: User Accounts */}
        {activeTab === 'users' && (
          <div className="glass-card" style={{ padding: '2rem' }}>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginBottom: '1.25rem' }}>
              Registered User Accounts
            </h2>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.9rem' }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border-subtle)', color: 'var(--text-muted)' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Display Name</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Role</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Email Verified</th>
                    <th style={{ padding: '0.75rem 1rem' }}>Joined</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr key={u.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.04)' }}>
                      <td style={{ padding: '1rem', fontWeight: 600, color: '#ffffff' }}>{u.display_name}</td>
                      <td style={{ padding: '1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                      <td style={{ padding: '1rem' }}>
                        <span className={`badge ${u.role === 'admin' ? 'badge-warning' : u.role === 'company' ? 'badge-cyan' : 'badge-primary'}`}>
                          {u.role.toUpperCase()}
                        </span>
                      </td>
                      <td style={{ padding: '1rem' }}>
                        {u.is_verified ? (
                          <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Yes</span>
                        ) : (
                          <span style={{ color: 'var(--text-muted)' }}>Pending</span>
                        )}
                      </td>
                      <td style={{ padding: '1rem', color: 'var(--text-muted)' }}>
                        {new Date(u.created_at).toLocaleDateString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
