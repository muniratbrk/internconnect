import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useNotification } from '../context/NotificationContext';
import { DEPARTMENTS, FIELDS_OF_STUDY, ETHIOPIAN_LOCATIONS } from '../constants/taxonomy';
import { PlusCircle, X, CheckCircle, Briefcase, ArrowLeft } from 'lucide-react';

export default function PostInternship() {
  const { toast } = useNotification();
  const navigate = useNavigate();

  const [title, setTitle] = useState('');
  const [department, setDepartment] = useState(DEPARTMENTS[0]);
  const [fieldOfStudy, setFieldOfStudy] = useState(FIELDS_OF_STUDY[0]);
  const [location, setLocation] = useState(ETHIOPIAN_LOCATIONS[0]);
  const [isRemote, setIsRemote] = useState(false);
  const [workType, setWorkType] = useState('Full-time');
  const [isPaid, setIsPaid] = useState(true);
  const [stipendAmount, setStipendAmount] = useState('12000');
  const [duration, setDuration] = useState('3 Months');
  const [applicationDeadline, setApplicationDeadline] = useState('');
  const [description, setDescription] = useState('');
  const [responsibilities, setResponsibilities] = useState('');
  const [requirements, setRequirements] = useState('');

  // Skills Tag Input
  const [skills, setSkills] = useState(['React', 'Node.js', 'PostgreSQL']);
  const [skillInput, setSkillInput] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleAddSkill = (e) => {
    if (e.key === 'Enter' || e.type === 'click') {
      e.preventDefault();
      const trimmed = skillInput.trim();
      if (trimmed && !skills.includes(trimmed)) {
        setSkills([...skills, trimmed]);
        setSkillInput('');
      }
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setSkills(skills.filter((s) => s !== skillToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (skills.length === 0) {
      toast('Please add at least one required skill tag.', 'error');
      return;
    }

    setSubmitting(true);
    try {
      await api.createInternship({
        title,
        department,
        field_of_study: fieldOfStudy,
        location: isRemote ? 'Remote' : location,
        is_remote: isRemote,
        work_type: workType,
        is_paid: isPaid,
        stipend_amount: isPaid ? stipendAmount : null,
        stipend_currency: 'ETB',
        duration,
        application_deadline: applicationDeadline || null,
        description,
        responsibilities,
        requirements,
        required_skills: skills,
      });

      toast('Internship role published successfully!', 'success');
      navigate('/company-dashboard');
    } catch (err) {
      toast(err.message || 'Failed to publish internship.', 'error');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        <button
          type="button"
          onClick={() => navigate('/company-dashboard')}
          style={{
            background: 'none',
            border: 'none',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '0.4rem',
            cursor: 'pointer',
            marginBottom: '1.5rem',
            fontSize: '0.88rem',
          }}
        >
          <ArrowLeft size={16} /> Back to Dashboard
        </button>

        <div className="glass-card" style={{ padding: '2.5rem' }}>
          <div style={{ marginBottom: '2rem' }}>
            <h1 style={{ fontSize: '2rem', fontWeight: 800 }}>Post an Internship</h1>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
              Create an internship opportunity that matches with high-caliber Ethiopian university candidates.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            {/* Title */}
            <div className="form-group">
              <label className="form-label">Role Title *</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Full-Stack Software Engineering Intern"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
              />
            </div>

            {/* Department & Field of Study */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Academic Department *</label>
                <select
                  className="form-select"
                  value={department}
                  onChange={(e) => setDepartment(e.target.value)}
                  required
                >
                  {DEPARTMENTS.map((dept) => (
                    <option key={dept} value={dept}>{dept}</option>
                  ))}
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Specialized Field of Study *</label>
                <select
                  className="form-select"
                  value={fieldOfStudy}
                  onChange={(e) => setFieldOfStudy(e.target.value)}
                  required
                >
                  {FIELDS_OF_STUDY.map((field) => (
                    <option key={field} value={field}>{field}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Location & Remote */}
            <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '1rem', alignItems: 'flex-end', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Location in Ethiopia *</label>
                <input
                  type="text"
                  list="eth-post-locations"
                  className="form-input"
                  placeholder="e.g. Addis Ababa (Bole)"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  disabled={isRemote}
                  required={!isRemote}
                />
                <datalist id="eth-post-locations">
                  {ETHIOPIAN_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', paddingBottom: '0.75rem', cursor: 'pointer', fontSize: '0.9rem' }}>
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Remote Allowed</span>
              </label>
            </div>

            {/* Work Type & Duration */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Work Type</label>
                <select className="form-select" value={workType} onChange={(e) => setWorkType(e.target.value)}>
                  <option value="Full-time">Full-time</option>
                  <option value="Part-time">Part-time</option>
                </select>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Duration</label>
                <select className="form-select" value={duration} onChange={(e) => setDuration(e.target.value)}>
                  <option value="3 Months">3 Months (University Summer Break)</option>
                  <option value="4 Months">4 Months (Semester Co-op)</option>
                  <option value="6 Months">6 Months (Extended Internship)</option>
                </select>
              </div>
            </div>

            {/* Compensation & Deadline */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Stipend Amount (ETB / month)</label>
                <input
                  type="number"
                  step="500"
                  className="form-input"
                  placeholder="e.g. 12000"
                  value={stipendAmount}
                  onChange={(e) => setStipendAmount(e.target.value)}
                  required={isPaid}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Application Deadline</label>
                <input
                  type="date"
                  className="form-input"
                  value={applicationDeadline}
                  onChange={(e) => setApplicationDeadline(e.target.value)}
                />
              </div>
            </div>

            {/* Required Skills Tag Editor */}
            <div className="form-group">
              <label className="form-label">Required Skills (Key to Algorithmic Match Scoring) *</label>
              <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '0.75rem' }}>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Add technical skill (e.g. React, TypeScript, PyTorch) and press Enter"
                  value={skillInput}
                  onChange={(e) => setSkillInput(e.target.value)}
                  onKeyDown={handleAddSkill}
                />
                <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                  Add
                </button>
              </div>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
                {skills.map((skill) => (
                  <span
                    key={skill}
                    className="badge badge-primary"
                    style={{ padding: '0.35rem 0.75rem', fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <span>{skill}</span>
                    <X
                      size={14}
                      style={{ cursor: 'pointer' }}
                      onClick={() => handleRemoveSkill(skill)}
                    />
                  </span>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="form-group">
              <label className="form-label">Overview & Team Description *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe your engineering team and what the intern will be doing..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
              />
            </div>

            {/* Responsibilities */}
            <div className="form-group">
              <label className="form-label">Key Responsibilities</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Specific projects and daily responsibilities..."
                value={responsibilities}
                onChange={(e) => setResponsibilities(e.target.value)}
              />
            </div>

            {/* Requirements */}
            <div className="form-group">
              <label className="form-label">Qualifications & Requirements *</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Required technical background, coursework, or frameworks..."
                value={requirements}
                onChange={(e) => setRequirements(e.target.value)}
                required
              />
            </div>

            {/* Submit */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
              <button
                type="button"
                onClick={() => navigate('/company-dashboard')}
                className="btn btn-secondary"
                disabled={submitting}
              >
                Cancel
              </button>
              <button type="submit" className="btn btn-primary btn-lg" disabled={submitting}>
                <PlusCircle size={18} />
                <span>{submitting ? 'Publishing Opportunity...' : 'Publish Internship'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
