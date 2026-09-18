import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { ETHIOPIAN_UNIVERSITIES, DEPARTMENTS, FIELDS_OF_STUDY, ETHIOPIAN_LOCATIONS } from '../constants/taxonomy';
import { 
  User, 
  Upload, 
  FileText, 
  ExternalLink, 
  X, 
  Save, 
  GraduationCap, 
  Link as LinkIcon,
  CheckCircle2
} from 'lucide-react';

export default function StudentProfile() {
  const { profile, updateProfileState } = useAuth();
  const { toast } = useNotification();

  const [fullName, setFullName] = useState(profile?.full_name || '');
  const [headline, setHeadline] = useState(profile?.headline || '');
  const [bio, setBio] = useState(profile?.bio || '');
  const [university, setUniversity] = useState(profile?.university || ETHIOPIAN_UNIVERSITIES[0]);
  const [department, setDepartment] = useState(profile?.department || DEPARTMENTS[0]);
  const [fieldOfStudy, setFieldOfStudy] = useState(profile?.field_of_study || FIELDS_OF_STUDY[0]);
  const [major, setMajor] = useState(profile?.major || 'B.Sc. in Software Engineering');
  const [gradYear, setGradYear] = useState(profile?.graduation_year || 2026);
  const [gpa, setGpa] = useState(profile?.gpa || '');
  const [location, setLocation] = useState(profile?.location || 'Addis Ababa, Ethiopia');
  const [availability, setAvailability] = useState(profile?.availability || 'Summer 2026');
  const [skills, setSkills] = useState(profile?.skills || []);
  const [skillInput, setSkillInput] = useState('');
  const [resumeUrl, setResumeUrl] = useState(profile?.resume_url || '');
  const [avatarUrl, setAvatarUrl] = useState(profile?.avatar_url || '');
  const [portfolioUrl, setPortfolioUrl] = useState(profile?.portfolio_url || '');
  const [githubUrl, setGithubUrl] = useState(profile?.github_url || '');
  const [linkedinUrl, setLinkedinUrl] = useState(profile?.linkedin_url || '');

  const [saving, setSaving] = useState(false);
  const [uploadingResume, setUploadingResume] = useState(false);

  // Sync state if profile loads asynchronously
  useEffect(() => {
    if (profile) {
      setFullName(profile.full_name || '');
      setHeadline(profile.headline || '');
      setBio(profile.bio || '');
      setUniversity(profile.university || ETHIOPIAN_UNIVERSITIES[0]);
      setDepartment(profile.department || DEPARTMENTS[0]);
      setFieldOfStudy(profile.field_of_study || FIELDS_OF_STUDY[0]);
      setMajor(profile.major || 'B.Sc. in Software Engineering');
      setGradYear(profile.graduation_year || 2026);
      setGpa(profile.gpa || '');
      setLocation(profile.location || 'Addis Ababa, Ethiopia');
      setAvailability(profile.availability || 'Summer 2026');
      setSkills(profile.skills || []);
      setResumeUrl(profile.resume_url || '');
      setAvatarUrl(profile.avatar_url || '');
      setPortfolioUrl(profile.portfolio_url || '');
      setGithubUrl(profile.github_url || '');
      setLinkedinUrl(profile.linkedin_url || '');
    }
  }, [profile]);

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

  const handleRemoveSkill = (toRemove) => {
    setSkills(skills.filter((s) => s !== toRemove));
  };

  const handleResumeUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('resume', file);

    setUploadingResume(true);
    try {
      const res = await api.uploadResume(formData);
      setResumeUrl(res.resume_url);
      updateProfileState(res.profile);
      toast('Resume file uploaded successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to upload resume.', 'error');
    } finally {
      setUploadingResume(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateStudentProfile({
        full_name: fullName,
        headline,
        bio,
        university,
        department,
        field_of_study: fieldOfStudy,
        major,
        graduation_year: gradYear,
        gpa,
        location,
        availability,
        skills,
        portfolio_url: portfolioUrl,
        github_url: githubUrl,
        linkedin_url: linkedinUrl,
      });

      updateProfileState(res.profile);
      toast('Student profile saved successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '840px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Student Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Your university, department, technical skills, and resume power the platform's algorithmic recommendations.
          </p>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Section 1: Basic Info */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <User size={20} color="var(--accent-cyan)" /> Personal Details
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Location (Ethiopian City / Region)</label>
                <input
                  type="text"
                  list="eth-student-locations"
                  className="form-input"
                  placeholder="e.g. Addis Ababa (Bole), Ethiopia"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
                <datalist id="eth-student-locations">
                  {ETHIOPIAN_LOCATIONS.map((loc) => (
                    <option key={loc} value={loc} />
                  ))}
                </datalist>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Professional Headline</label>
              <input
                type="text"
                className="form-input"
                placeholder="e.g. Software Engineering Senior @ AAiT | Full-Stack & FinTech"
                value={headline}
                onChange={(e) => setHeadline(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Bio & Summary</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Tell recruiters about your university coursework, practical projects, and career interests..."
                value={bio}
                onChange={(e) => setBio(e.target.value)}
              />
            </div>
          </div>

          {/* Section 2: Education & Availability */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <GraduationCap size={20} color="#818CF8" /> Education & Academic Department
            </h2>

            <div style={{ display: 'grid', gridTemplateColumns: '1.5fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">University / Institute *</label>
                <input
                  type="text"
                  list="eth-universities"
                  className="form-input"
                  placeholder="e.g. Addis Ababa University (AAU / AAiT)"
                  value={university}
                  onChange={(e) => setUniversity(e.target.value)}
                  required
                />
                <datalist id="eth-universities">
                  {ETHIOPIAN_UNIVERSITIES.map((uni) => (
                    <option key={uni} value={uni} />
                  ))}
                </datalist>
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Degree Program / Major *</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. B.Sc. in Software Engineering"
                  value={major}
                  onChange={(e) => setMajor(e.target.value)}
                  required
                />
              </div>
            </div>

            {/* Department and Field of Study Dropdowns */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem', marginBottom: '1.25rem' }}>
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

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1.25rem', marginBottom: 0 }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Graduation Year</label>
                <input
                  type="number"
                  className="form-input"
                  value={gradYear}
                  onChange={(e) => setGradYear(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Cumulative GPA (e.g. /4.0)</label>
                <input
                  type="number"
                  step="0.01"
                  className="form-input"
                  placeholder="3.85"
                  value={gpa}
                  onChange={(e) => setGpa(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Availability</label>
                <select className="form-select" value={availability} onChange={(e) => setAvailability(e.target.value)}>
                  <option value="Summer 2026">Summer Break 2026</option>
                  <option value="Immediate">Immediate / Part-time</option>
                  <option value="Fall 2026">Semester 1 (Fall 2026)</option>
                  <option value="Spring 2027">Semester 2 (Spring 2027)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Section 3: Technical Skills Tag Manager */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
              Technical Skills
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '0.88rem', marginBottom: '1.25rem' }}>
              Add all technologies, languages, and tools you have experience with to optimize match accuracy.
            </p>

            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
              <input
                type="text"
                className="form-input"
                placeholder="Type a skill (e.g. React, Python, PostgreSQL) and press Enter"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyDown={handleAddSkill}
              />
              <button type="button" onClick={handleAddSkill} className="btn btn-secondary">
                Add Skill
              </button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {skills.map((skill) => (
                <span
                  key={skill}
                  className="badge badge-primary"
                  style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}
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

          {/* Section 4: Resume & External Links */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2.5rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <FileText size={20} color="#10B981" /> Resume & Links
            </h2>

            {/* Resume Upload Box */}
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              padding: '1.25rem',
              background: 'var(--bg-input)',
              border: '1px solid var(--border-subtle)',
              borderRadius: 'var(--radius-md)',
              marginBottom: '1.75rem',
              flexWrap: 'wrap',
              gap: '1rem',
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: '0.95rem' }}>Current Resume</div>
                <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {resumeUrl ? (
                    <a href={resumeUrl} target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                      <FileText size={14} /> View Current Document <ExternalLink size={12} />
                    </a>
                  ) : (
                    'No resume uploaded yet. PDF, DOCX supported up to 10MB.'
                  )}
                </div>
              </div>

              <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer', margin: 0 }}>
                <Upload size={14} />
                <span>{uploadingResume ? 'Uploading...' : 'Upload New Resume'}</span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx"
                  onChange={handleResumeUpload}
                  style={{ display: 'none' }}
                  disabled={uploadingResume}
                />
              </label>
            </div>

            {/* External Links */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">Portfolio Website</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://yourname.dev"
                  value={portfolioUrl}
                  onChange={(e) => setPortfolioUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">GitHub URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://github.com/username"
                  value={githubUrl}
                  onChange={(e) => setGithubUrl(e.target.value)}
                />
              </div>

              <div className="form-group" style={{ marginBottom: 0 }}>
                <label className="form-label">LinkedIn URL</label>
                <input
                  type="url"
                  className="form-input"
                  placeholder="https://linkedin.com/in/username"
                  value={linkedinUrl}
                  onChange={(e) => setLinkedinUrl(e.target.value)}
                />
              </div>
            </div>
          </div>

          {/* Save Button */}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem' }}>
            <button type="submit" className="btn btn-primary btn-lg" disabled={saving}>
              <Save size={18} />
              <span>{saving ? 'Saving Changes...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
