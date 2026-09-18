import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import ApplyModal from '../components/internships/ApplyModal';
import MatchScoreMeter from '../components/common/MatchScoreMeter';
import StatusBadge from '../components/common/StatusBadge';
import { Skeleton } from '../components/common/Skeleton';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Clock, 
  Calendar, 
  Eye, 
  CheckCircle, 
  Sparkles, 
  Globe, 
  ArrowLeft,
  Check,
  X,
  ExternalLink
} from 'lucide-react';

export default function InternshipDetails() {
  const { id } = useParams();
  const { isAuthenticated, isStudent } = useAuth();
  const [internship, setInternship] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showApplyModal, setShowApplyModal] = useState(false);

  const fetchDetails = async () => {
    try {
      const res = await api.getInternship(id);
      setInternship(res.internship);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDetails();
  }, [id]);

  if (loading) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ maxWidth: '900px' }}>
          <Skeleton height="36px" width="50%" style={{ marginBottom: '1rem' }} />
          <Skeleton height="200px" style={{ marginBottom: '2rem' }} />
          <Skeleton height="400px" />
        </div>
      </div>
    );
  }

  if (!internship) {
    return (
      <div className="page-wrapper">
        <div className="container" style={{ textAlign: 'center', padding: '4rem 0' }}>
          <h2>Internship not found</h2>
          <Link to="/internships" className="btn btn-secondary" style={{ marginTop: '1rem' }}>
            Back to Internships
          </Link>
        </div>
      </div>
    );
  }

  const match = internship.match;

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '960px' }}>
        {/* Breadcrumb Back Link */}
        <Link to="/internships" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.5rem' }}>
          <ArrowLeft size={16} />
          <span>Back to All Internships</span>
        </Link>

        {/* Hero Card */}
        <div className="glass-card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
            {/* Company & Role */}
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <img
                src={internship.logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={internship.company_name}
                style={{ width: '64px', height: '64px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <span style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                    {internship.company_name}
                  </span>
                  {internship.company_verified && (
                    <span style={{ display: 'flex', alignItems: 'center', gap: '2px', color: '#10B981', fontSize: '0.8rem', fontWeight: 600 }}>
                      <CheckCircle size={15} /> Verified
                    </span>
                  )}
                </div>
                <h1 style={{ fontSize: '1.85rem', fontWeight: 800, marginTop: '0.2rem' }}>
                  {internship.title}
                </h1>
                {(internship.department || internship.field_of_study) && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                    {internship.department && (
                      <span className="badge badge-primary">
                        Dept: {internship.department}
                      </span>
                    )}
                    {internship.field_of_study && (
                      <span className="badge badge-cyan">
                        Field: {internship.field_of_study}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* CTA or Existing Application Status */}
            <div>
              {internship.existingApplication ? (
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '4px' }}>
                    Application Submitted
                  </div>
                  <StatusBadge status={internship.existingApplication.status} />
                </div>
              ) : isStudent ? (
                <button onClick={() => setShowApplyModal(true)} className="btn btn-primary btn-lg">
                  Apply for Role
                </button>
              ) : !isAuthenticated ? (
                <Link to="/login" className="btn btn-primary btn-lg">
                  Log in to Apply
                </Link>
              ) : null}
            </div>
          </div>

          {/* Highlights Row */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
            gap: '1rem',
            marginTop: '2rem',
            paddingTop: '1.5rem',
            borderTop: '1px solid var(--border-subtle)',
          }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Location</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <MapPin size={14} color="var(--accent-cyan)" />
                <span>{internship.is_remote ? 'Remote (Ethiopia)' : internship.location}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Compensation</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <span style={{ fontWeight: 800, color: '#10B981' }}>Br</span>
                <span>{internship.is_paid ? `${Number(internship.stipend_amount || 10000).toLocaleString()} ETB/mo` : 'Unpaid / Experience'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Duration</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Clock size={14} color="#F59E0B" />
                <span>{internship.duration || '3 Months'}</span>
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Work Type</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', marginTop: '2px' }}>
                {internship.work_type || 'Full-time'}
              </div>
            </div>

            <div>
              <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>Views</div>
              <div style={{ fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '4px', marginTop: '2px' }}>
                <Eye size={14} color="var(--text-muted)" />
                <span>{internship.views_count}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Compatibility Breakdown Box (if student logged in) */}
        {match && (
          <div className="glass-card" style={{
            padding: '1.75rem',
            marginBottom: '2rem',
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.1) 0%, rgba(6, 182, 212, 0.05) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.75rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Sparkles size={20} color="#818CF8" />
                <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Profile Compatibility Analysis</h3>
              </div>
              <MatchScoreMeter match={match} />
            </div>

            <p style={{ fontSize: '0.88rem', color: 'var(--text-secondary)', marginBottom: '1.25rem' }}>
              Based on your student profile, here is how your skills and preferences match this opening:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '1.5rem' }}>
              {/* Matching Skills */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: '#34D399', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Matching Skills ({match.matchingSkills?.length || 0})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {match.matchingSkills && match.matchingSkills.length > 0 ? (
                    match.matchingSkills.map((s, idx) => (
                      <span key={idx} className="badge badge-success" style={{ textTransform: 'capitalize' }}>
                        <Check size={12} /> {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: 'var(--text-muted)' }}>No direct skill matches</span>
                  )}
                </div>
              </div>

              {/* Missing Skills */}
              <div>
                <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                  Skills to Learn ({match.missingSkills?.length || 0})
                </span>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginTop: '0.5rem' }}>
                  {match.missingSkills && match.missingSkills.length > 0 ? (
                    match.missingSkills.map((s, idx) => (
                      <span key={idx} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-muted)', textTransform: 'capitalize' }}>
                        {s}
                      </span>
                    ))
                  ) : (
                    <span style={{ fontSize: '0.82rem', color: '#10B981' }}>You have all required skills!</span>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Two-Column Details */}
        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '2rem' }}>
          {/* Main Content */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '2rem' }}>
            {/* Description */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>About the Role</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                {internship.description}
              </p>
            </div>

            {/* Responsibilities */}
            {internship.responsibilities && (
              <div className="glass-card" style={{ padding: '2rem' }}>
                <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Key Responsibilities</h3>
                <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line' }}>
                  {internship.responsibilities}
                </p>
              </div>
            )}

            {/* Requirements */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <h3 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1rem' }}>Requirements & Skills</h3>
              <p style={{ color: 'var(--text-secondary)', lineHeight: '1.8', whiteSpace: 'pre-line', marginBottom: '1.5rem' }}>
                {internship.requirements}
              </p>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 700, marginBottom: '0.75rem', color: '#ffffff' }}>Skill Tags</h4>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {(internship.required_skills || []).map((skill, idx) => (
                  <span key={idx} className="badge badge-primary">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Company Bio */}
            <div className="glass-card" style={{ padding: '1.75rem', position: 'sticky', top: '90px' }}>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>About {internship.company_name}</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', lineHeight: '1.6', marginBottom: '1.25rem' }}>
                {internship.company_description || 'Innovative technology organization dedicated to solving complex problems.'}
              </p>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', fontSize: '0.85rem' }}>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Industry: </span>
                  <span style={{ fontWeight: 600 }}>{internship.industry}</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Company Size: </span>
                  <span style={{ fontWeight: 600 }}>{internship.company_size || '50-200'} employees</span>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)' }}>Headquarters: </span>
                  <span style={{ fontWeight: 600 }}>{internship.company_location || 'San Francisco, CA'}</span>
                </div>
                {internship.company_website && (
                  <a
                    href={internship.company_website}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      color: 'var(--accent-cyan)',
                      marginTop: '0.5rem',
                      fontWeight: 600,
                    }}
                  >
                    <span>Visit Website</span>
                    <ExternalLink size={14} />
                  </a>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Apply Modal */}
      {showApplyModal && (
        <ApplyModal
          internship={internship}
          onClose={() => setShowApplyModal(false)}
          onSuccess={fetchDetails}
        />
      )}
    </div>
  );
}
