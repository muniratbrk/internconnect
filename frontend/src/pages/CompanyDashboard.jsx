import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import StatusBadge from '../components/common/StatusBadge';
import EmptyState from '../components/common/EmptyState';
import { CardSkeleton } from '../components/common/Skeleton';
import { 
  PlusCircle, 
  Users, 
  Briefcase, 
  CheckCircle2, 
  MessageSquare, 
  ExternalLink, 
  FileText,
  Clock,
  Filter,
  CheckCircle
} from 'lucide-react';

const PIPELINE_STAGES = [
  { id: 'all', label: 'All Applicants' },
  { id: 'applied', label: 'Applied' },
  { id: 'under_review', label: 'Under Review' },
  { id: 'interview', label: 'Interviewing' },
  { id: 'accepted', label: 'Accepted / Offered' },
  { id: 'rejected', label: 'Rejected' },
];

export default function CompanyDashboard() {
  const { profile } = useAuth();
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [postings, setPostings] = useState([]);
  const [selectedJobId, setSelectedJobId] = useState(null);
  const [applicants, setApplicants] = useState([]);
  const [stageFilter, setStageFilter] = useState('all');
  const [loading, setLoading] = useState(true);
  const [updatingAppId, setUpdatingAppId] = useState(null);

  // Load company's postings
  useEffect(() => {
    async function loadPostings() {
      try {
        const res = await api.getCompanyPostings();
        const jobs = res.postings || [];
        setPostings(jobs);
        if (jobs.length > 0) {
          setSelectedJobId(jobs[0].id);
        }
      } catch (err) {
        console.error('Failed to load company postings:', err);
      } finally {
        setLoading(false);
      }
    }
    loadPostings();
  }, [user?.id]);

  // Load applicants for selected posting
  const loadApplicants = async (jobId) => {
    if (!jobId) return;
    try {
      const res = await api.getInternshipApplicants(jobId);
      setApplicants(res.applicants || []);
    } catch (err) {
      console.error('Failed to load applicants:', err);
    }
  };

  useEffect(() => {
    if (selectedJobId) {
      loadApplicants(selectedJobId);
    }
  }, [selectedJobId]);

  // Update candidate status
  const handleStatusChange = async (appId, newStatus) => {
    setUpdatingAppId(appId);
    try {
      await api.updateApplicationStatus(appId, { status: newStatus });
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, status: newStatus } : a))
      );
      toast(`Candidate status updated to ${newStatus.replace('_', ' ')}!`, 'success');
    } catch (err) {
      toast(err.message || 'Failed to update applicant status.', 'error');
    } finally {
      setUpdatingAppId(null);
    }
  };

  // Add/edit recruiter notes
  const handleNotesUpdate = async (appId, currentNotes) => {
    const note = prompt('Update recruiter internal notes for this candidate:', currentNotes || '');
    if (note === null) return;

    try {
      await api.updateApplicationStatus(appId, { company_notes: note });
      setApplicants((prev) =>
        prev.map((a) => (a.id === appId ? { ...a, company_notes: note } : a))
      );
      toast('Recruiter notes saved.', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update notes.', 'error');
    }
  };

  // Message candidate
  const handleMessageCandidate = async (app) => {
    try {
      const res = await api.startConversation({
        student_id: app.student_id,
        company_id: profile.id,
        application_id: app.id,
      });
      navigate(`/messages?convId=${res.conversation.id}`);
    } catch (err) {
      toast(err.message || 'Failed to start message conversation.', 'error');
    }
  };

  // Filtered applicants
  const filteredApplicants = stageFilter === 'all'
    ? applicants
    : applicants.filter((a) => a.status === stageFilter);

  const selectedPosting = postings.find((p) => p.id === selectedJobId);

  // Total summary counts across postings
  const totalApplicantsCount = postings.reduce((acc, p) => acc + parseInt(p.total_applicants || 0, 10), 0);
  const totalInterviewCount = postings.reduce((acc, p) => acc + parseInt(p.interview_count || 0, 10), 0);
  const totalAcceptedCount = postings.reduce((acc, p) => acc + parseInt(p.accepted_count || 0, 10), 0);

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Company Header */}
        <div className="glass-card" style={{ padding: '2rem 2.5rem', marginBottom: '2.5rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
            <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
              <img
                src={profile?.logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&h=100&q=80'}
                alt={profile?.company_name}
                style={{ width: '56px', height: '56px', borderRadius: '14px', objectFit: 'cover' }}
              />
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <h1 style={{ fontSize: '1.85rem', fontWeight: 800 }}>{profile?.company_name || 'Company Dashboard'}</h1>
                  {profile?.is_verified && <CheckCircle size={18} color="#10B981" title="Verified Employer" />}
                </div>
                <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem' }}>
                  {profile?.industry} • {profile?.location || 'Remote'}
                </p>
              </div>
            </div>

            <div style={{ display: 'flex', gap: '0.75rem' }}>
              <Link to="/company-profile" className="btn btn-secondary btn-sm">
                Company Profile
              </Link>
              <Link to="/post-internship" className="btn btn-primary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <PlusCircle size={16} />
                <span>Post New Role</span>
              </Link>
            </div>
          </div>
        </div>

        {/* Aggregate Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '1.25rem', marginBottom: '3rem' }}>
          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Active Postings</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#ffffff' }}>{postings.length}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Total Candidates</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: 'var(--accent-cyan)' }}>{totalApplicantsCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Interviews Scheduled</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#F59E0B' }}>{totalInterviewCount}</div>
          </div>

          <div className="glass-card" style={{ padding: '1.5rem' }}>
            <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Offers Extended</div>
            <div style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.2rem', color: '#10B981' }}>{totalAcceptedCount}</div>
          </div>
        </div>

        {/* Postings Selector Tabs */}
        {postings.length > 0 && (
          <div style={{ marginBottom: '2rem' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
              Select Active Posting to Manage Candidates
            </span>
            <div style={{ display: 'flex', gap: '0.75rem', overflowX: 'auto', padding: '0.5rem 0', marginTop: '0.4rem' }}>
              {postings.map((job) => {
                const isSelected = job.id === selectedJobId;
                return (
                  <button
                    key={job.id}
                    onClick={() => setSelectedJobId(job.id)}
                    style={{
                      padding: '0.75rem 1.25rem',
                      borderRadius: 'var(--radius-md)',
                      background: isSelected ? 'var(--primary)' : 'var(--bg-card)',
                      border: isSelected ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                      color: isSelected ? '#ffffff' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: 600,
                      fontSize: '0.9rem',
                      whiteSpace: 'nowrap',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.5rem',
                      boxShadow: isSelected ? 'var(--shadow-glow)' : 'none',
                      transition: 'all var(--transition-fast)',
                    }}
                  >
                    <span>{job.title}</span>
                    <span style={{
                      background: isSelected ? 'rgba(255,255,255,0.2)' : 'rgba(255,255,255,0.08)',
                      padding: '2px 6px',
                      borderRadius: 'var(--radius-full)',
                      fontSize: '0.75rem',
                    }}>
                      {job.total_applicants || 0}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Pipeline Stage Bar */}
        {selectedPosting && (
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            flexWrap: 'wrap',
            gap: '1rem',
          }}>
            {/* Stage Filter Chips */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              {PIPELINE_STAGES.map((stage) => {
                const isActive = stageFilter === stage.id;
                return (
                  <button
                    key={stage.id}
                    onClick={() => setStageFilter(stage.id)}
                    style={{
                      padding: '0.35rem 0.85rem',
                      fontSize: '0.82rem',
                      borderRadius: 'var(--radius-full)',
                      background: isActive ? 'rgba(79, 70, 229, 0.2)' : 'rgba(255,255,255,0.03)',
                      border: isActive ? '1px solid var(--primary)' : '1px solid var(--border-subtle)',
                      color: isActive ? '#818CF8' : 'var(--text-secondary)',
                      cursor: 'pointer',
                      fontWeight: isActive ? 600 : 400,
                    }}
                  >
                    {stage.label}
                  </button>
                );
              })}
            </div>

            <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
              Showing {filteredApplicants.length} applicants
            </div>
          </div>
        )}

        {/* Applicants List */}
        {loading ? (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            <CardSkeleton />
            <CardSkeleton />
          </div>
        ) : postings.length === 0 ? (
          <EmptyState
            icon={Briefcase}
            title="No internship opportunities posted yet"
            description="Create your first role to start accepting candidate applications and conducting interviews."
            actionLabel="Post An Internship"
            onAction={() => navigate('/post-internship')}
          />
        ) : filteredApplicants.length === 0 ? (
          <EmptyState
            icon={Users}
            title="No applicants in this stage"
            description="Candidates will appear here as they apply or when you transition their pipeline stages."
          />
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {filteredApplicants.map((app) => (
              <div key={app.id} className="glass-card" style={{ padding: '1.75rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1.5rem' }}>
                  {/* Student Details */}
                  <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'flex-start' }}>
                    <img
                      src={app.student_avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=100&h=100&q=80'}
                      alt={app.student_name}
                      style={{ width: '52px', height: '52px', borderRadius: '50%', objectFit: 'cover' }}
                    />
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <h3 style={{ fontSize: '1.2rem', fontWeight: 700, color: '#ffffff' }}>
                          {app.student_name}
                        </h3>
                        <StatusBadge status={app.status} />
                      </div>

                      <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                        {app.student_headline || `${app.student_major} @ ${app.student_university}`}
                      </div>

                      {app.student_department && (
                        <div style={{ display: 'flex', gap: '0.4rem', marginTop: '0.35rem', flexWrap: 'wrap' }}>
                          <span className="badge" style={{ background: 'rgba(99, 102, 241, 0.15)', color: '#A5B4FC', fontSize: '0.72rem' }}>
                            {app.student_department}
                          </span>
                          {app.student_field_of_study && (
                            <span className="badge badge-cyan" style={{ fontSize: '0.72rem' }}>
                              {app.student_field_of_study}
                            </span>
                          )}
                        </div>
                      )}

                      <div style={{ display: 'flex', gap: '1rem', fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '0.4rem' }}>
                        <span>GPA: {app.student_gpa || '3.8+'}</span>
                        <span>•</span>
                        <span>Graduation: {app.student_graduation_year || 2026}</span>
                        <span>•</span>
                        <span>Applied: {new Date(app.applied_at).toLocaleDateString()}</span>
                      </div>

                      {/* Student Skills */}
                      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginTop: '0.75rem' }}>
                        {(app.student_skills || []).map((s, idx) => (
                          <span key={idx} className="badge" style={{ background: 'rgba(255,255,255,0.05)', color: 'var(--text-secondary)', fontSize: '0.72rem' }}>
                            {s}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Actions & Pipeline Controls */}
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', minWidth: '220px' }}>
                    {/* Pipeline Stage Selector */}
                    <div>
                      <label style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>
                        Change Candidate Stage:
                      </label>
                      <select
                        className="form-select"
                        style={{ padding: '0.45rem 0.75rem', fontSize: '0.82rem' }}
                        value={app.status}
                        onChange={(e) => handleStatusChange(app.id, e.target.value)}
                        disabled={updatingAppId === app.id}
                      >
                        <option value="applied">1. Applied</option>
                        <option value="under_review">2. Under Review</option>
                        <option value="interview">3. Interview Scheduled</option>
                        <option value="accepted">4. Accepted / Offer Extended</option>
                        <option value="rejected">5. Rejected</option>
                      </select>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: '0.5rem' }}>
                      {app.resume_url && (
                        <a
                          href={app.resume_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn btn-secondary btn-sm"
                          style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                        >
                          <FileText size={14} /> Resume
                        </a>
                      )}

                      <button
                        onClick={() => handleMessageCandidate(app)}
                        className="btn btn-primary btn-sm"
                        style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px' }}
                      >
                        <MessageSquare size={14} /> Chat
                      </button>
                    </div>
                  </div>
                </div>

                {/* Cover Note */}
                {app.cover_note && (
                  <div style={{
                    marginTop: '1.25rem',
                    padding: '0.85rem 1rem',
                    background: 'rgba(255,255,255,0.02)',
                    border: '1px solid var(--border-subtle)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.88rem',
                    color: 'var(--text-secondary)',
                    lineHeight: '1.6',
                  }}>
                    <strong style={{ color: '#ffffff', display: 'block', marginBottom: '4px' }}>Candidate Statement:</strong>
                    "{app.cover_note}"
                  </div>
                )}

                {/* Recruiter Notes Bar */}
                <div style={{
                  marginTop: '1rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  fontSize: '0.82rem',
                  color: 'var(--text-muted)',
                }}>
                  <div>
                    <span style={{ color: 'var(--accent-cyan)' }}>Internal Note: </span>
                    <span>{app.company_notes || 'No internal notes added yet.'}</span>
                  </div>
                  <button
                    onClick={() => handleNotesUpdate(app.id, app.company_notes)}
                    style={{ background: 'none', border: 'none', color: '#818CF8', cursor: 'pointer', textDecoration: 'underline' }}
                  >
                    Edit Note
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
