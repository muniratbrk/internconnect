import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import MatchScoreMeter from '../components/common/MatchScoreMeter';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { 
  Briefcase, 
  Sparkles, 
  MessageSquare, 
  Clock, 
  Award, 
  ArrowRight,
  TrendingUp,
  MapPin,
  DollarSign
} from 'lucide-react';

export default function StudentDashboard() {
  const { user, profile } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [applications, setApplications] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadDashboardData() {
      try {
        const [appsRes, recsRes] = await Promise.all([
          api.getStudentApplications(),
          api.getRecommendedInternships(),
        ]);
        setApplications(appsRes.applications || []);
        setRecommendations(recsRes.recommendations || []);
      } catch (err) {
        console.error('Failed to load student dashboard:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboardData();
  }, []);

  const handleStartChat = async (app) => {
    try {
      const res = await api.startConversation({
        student_id: app.student_id,
        company_id: app.company_id,
        application_id: app.id,
      });
      navigate(`/messages?convId=${res.conversation.id}`);
    } catch (err) {
      toast(err.message || 'Failed to initiate conversation.', 'error');
    }
  };

  // Pipeline metrics
  const totalApps = applications.length;
  const underReviewCount = applications.filter((a) => a.status === 'under_review').length;
  const interviewCount = applications.filter((a) => a.status === 'interview').length;
  const acceptedCount = applications.filter((a) => a.status === 'accepted').length;

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Welcome Header */}
        <div className="glass-card" style={{ padding: '2rem 2.5rem', marginBottom: '2.5rem', position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div>
              <div style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--accent-cyan)', fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.4rem' }}>
                <Sparkles size={16} /> Student Career Dashboard
              </div>
              <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>
                Welcome back, {profile?.full_name || 'Student'}!
              </h1>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.2rem' }}>
                {profile?.university ? `${profile.university} • ` : ''}{profile?.department ? `${profile.department} • ` : ''}{profile?.headline || 'Ready to match with top engineering internships.'}
              </p>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/student-profile" className="btn btn-secondary btn-sm">
                Edit Profile & Resume
              </Link>
              <Link to="/internships" className="btn btn-primary btn-sm">
                Browse Roles
              </Link>
            </div>
          </div>
        </div>

        {/* Metrics Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Applications</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#ffffff' }}>{totalApps}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Under Review</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: 'var(--accent-cyan)' }}>{underReviewCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interviews Scheduled</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#818CF8' }}>{interviewCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Offers Extended</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.25rem', color: '#10B981' }}>{acceptedCount}</div>
          </div>
        </div>

        {/* Active Applications Section */}
        <div style={{ marginBottom: '3.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Active Application Pipeline</h2>
            <Link to="/internships" style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
              Find More Opportunities →
            </Link>
          </div>

          {loading ? (
            <CardSkeleton />
          ) : applications.length > 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {applications.map((app) => (
                <div
                  key={app.id}
                  className="glass-card"
                  style={{
                    padding: '1.25rem 1.75rem',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    flexWrap: 'wrap',
                    gap: '1.25rem',
                  }}
                >
                  {/* Left: Role Info */}
                  <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
                    <img
                      src={app.company_logo || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=80&h=80&q=80'}
                      alt={app.company_name}
                      style={{ width: '48px', height: '48px', borderRadius: '12px', objectFit: 'cover' }}
                    />
                    <div>
                      <h3 style={{ fontSize: '1.15rem', fontWeight: 700 }}>
                        <Link to={`/internships/${app.internship_id}`} style={{ color: '#ffffff' }}>
                          {app.internship_title}
                        </Link>
                      </h3>
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        <span>{app.company_name}</span>
                        {app.internship_department && (
                          <>
                            <span>•</span>
                            <span style={{ color: '#818CF8' }}>{app.internship_department}</span>
                          </>
                        )}
                        <span>•</span>
                        <span>{app.is_remote ? 'Remote' : app.internship_location}</span>
                        <span>•</span>
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Right: Status and Action */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <StatusBadge status={app.status} />

                    <button
                      onClick={() => handleStartChat(app)}
                      className="btn btn-secondary btn-sm"
                      style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
                    >
                      <MessageSquare size={14} />
                      <span>Message</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="glass-card" style={{ padding: '3rem', textAlign: 'center' }}>
              <div style={{ color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
                You haven't applied to any internships yet. Discover verified Ethiopian opportunities that match your background.
              </div>
              <Link to="/internships" className="btn btn-primary">
                Browse Open Roles
              </Link>
            </div>
          )}
        </div>

        {/* Recommended Matches Section */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 800 }}>Algorithmic Matches for You</h2>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                Ranked using skill alignment (50%), department/field matching (30%), and location compatibility (20%).
              </p>
            </div>
            <Link to="/internships?sort=recommended" style={{ fontSize: '0.88rem', color: 'var(--accent-cyan)' }}>
              View All Ranked →
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1.25rem' }}>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : recommendations.length > 0 ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '1.25rem' }}>
              {recommendations.map((job) => (
                <div
                  key={job.id}
                  className="glass-card"
                  style={{
                    padding: '1.5rem',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'space-between',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                    <span className="badge badge-cyan" style={{ fontSize: '0.75rem' }}>
                      {job.company_name}
                    </span>
                    <MatchScoreMeter match={job.match} />
                  </div>

                  <h3 style={{ fontSize: '1.1rem', fontWeight: 700, marginBottom: '0.5rem' }}>
                    <Link to={`/internships/${job.id}`} style={{ color: '#ffffff' }}>
                      {job.title}
                    </Link>
                  </h3>

                  {job.department && (
                    <div style={{ marginBottom: '0.5rem' }}>
                      <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', fontSize: '0.75rem' }}>
                        {job.department}
                      </span>
                    </div>
                  )}

                  <div style={{ display: 'flex', gap: '0.5rem', fontSize: '0.82rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                    <span>{job.is_remote ? 'Remote' : job.location}</span>
                    <span>•</span>
                    <span>{job.is_paid ? `Br ${Number(job.stipend_amount || 10000).toLocaleString()} ETB/mo` : 'Unpaid'}</span>
                  </div>

                  <div style={{ marginTop: 'auto', paddingTop: '0.75rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <Link to={`/internships/${job.id}`} className="btn btn-outline btn-sm" style={{ width: '100%' }}>
                      Review & Apply
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ color: 'var(--text-muted)', fontSize: '0.9rem' }}>
              Add more skills to your student profile to unlock high-confidence recommendations!
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
