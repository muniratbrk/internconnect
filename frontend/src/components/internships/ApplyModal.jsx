import React, { useState } from 'react';
import confetti from 'canvas-confetti';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { X, Send, FileText, Upload, CheckCircle } from 'lucide-react';

export default function ApplyModal({ internship, onClose, onSuccess }) {
  const { profile } = useAuth();
  const { toast } = useNotification();
  const [coverNote, setCoverNote] = useState('');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '');
  const [uploadingResume, setUploadingResume] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const res = await api.uploadResume(formData);
      setResumeUrl(res.resume_url);
      toast('Resume uploaded successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await api.applyInternship({
        internship_id: internship.id,
        resume_url: resumeUrl,
        cover_note: coverNote,
      });

      // Confetti celebration
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      toast('Application submitted successfully!', 'success');
      if (onSuccess) onSuccess();
      onClose();
    } catch (err) {
      toast(err.message || 'Failed to submit application.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ padding: '2rem' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <span style={{ fontSize: '0.82rem', color: 'var(--accent-cyan)', fontWeight: 600 }}>
              Applying to {internship.company_name}
            </span>
            <h2 style={{ fontSize: '1.35rem', fontWeight: 800, marginTop: '0.2rem' }}>
              {internship.title}
            </h2>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'rgba(255,255,255,0.06)',
              border: 'none',
              color: 'var(--text-secondary)',
              borderRadius: '8px',
              padding: '6px',
              cursor: 'pointer',
            }}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Resume Selection */}
          <div className="form-group">
            <label className="form-label" style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Submitted Resume</span>
              {resumeUrl && <span style={{ color: '#10B981', display: 'flex', alignItems: 'center', gap: '4px' }}><CheckCircle size={14} /> Resume Attached</span>}
            </label>

            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '0.85rem 1rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              gap: '1rem',
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', overflow: 'hidden' }}>
                <FileText size={20} color="var(--accent-cyan)" />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-primary)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {resumeUrl ? resumeUrl.split('/').pop() : 'No resume uploaded yet'}
                </span>
              </div>

              <label
                className="btn btn-secondary btn-sm"
                style={{ cursor: uploadingResume ? 'wait' : 'pointer', margin: 0 }}
              >
                <Upload size={14} />
                <span>{uploadingResume ? 'Uploading...' : 'Upload PDF'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleFileUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingResume}
                />
              </label>
            </div>
          </div>

          {/* Cover Note */}
          <div className="form-group">
            <label className="form-label">
              Cover Note & Statement of Interest
            </label>
            <textarea
              className="form-textarea"
              rows={5}
              placeholder="Highlight why you are an ideal fit for this role, relevant projects you have built, and why you are excited about this team..."
              value={coverNote}
              onChange={(e) => setCoverNote(e.target.value)}
              required
            />
          </div>

          {/* Matching preview */}
          {internship.match && (
            <div style={{
              background: 'rgba(79, 70, 229, 0.08)',
              border: '1px solid rgba(79, 70, 229, 0.2)',
              borderRadius: 'var(--radius-md)',
              padding: '0.85rem',
              marginBottom: '1.5rem',
              fontSize: '0.82rem',
              color: 'var(--text-secondary)',
            }}>
              <strong style={{ color: '#818CF8' }}>Compatibility Preview: </strong>
              Your profile shares {internship.match.matchingSkills?.length || 0} required skills ({internship.match.matchingSkills?.join(', ') || 'N/A'}) with a match score of {internship.match.overallScore}%.
            </div>
          )}

          {/* Action Buttons */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem', marginTop: '1.5rem' }}>
            <button type="button" onClick={onClose} className="btn btn-secondary" disabled={submitting}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={submitting || !resumeUrl}>
              <Send size={16} />
              <span>{submitting ? 'Submitting Application...' : 'Submit Application'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
