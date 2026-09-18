import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useNotification } from '../context/NotificationContext';
import { Building2, Upload, Save, CheckCircle, ExternalLink, Globe } from 'lucide-react';

export default function CompanyProfile() {
  const { profile, updateProfileState } = useAuth();
  const { toast } = useNotification();

  const [companyName, setCompanyName] = useState(profile?.company_name || '');
  const [industry, setIndustry] = useState(profile?.industry || 'Software & Technology');
  const [description, setDescription] = useState(profile?.description || '');
  const [website, setWebsite] = useState(profile?.website || '');
  const [location, setLocation] = useState(profile?.location || '');
  const [size, setSize] = useState(profile?.size || '51-200');
  const [logoUrl, setLogoUrl] = useState(profile?.logo_url || '');

  const [saving, setSaving] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);

  useEffect(() => {
    if (profile) {
      setCompanyName(profile.company_name || '');
      setIndustry(profile.industry || 'Software & Technology');
      setDescription(profile.description || '');
      setWebsite(profile.website || '');
      setLocation(profile.location || '');
      setSize(profile.size || '51-200');
      setLogoUrl(profile.logo_url || '');
    }
  }, [profile]);

  const handleLogoUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const formData = new FormData();
    formData.append('logo', file);

    setUploadingLogo(true);
    try {
      const res = await api.uploadCompanyLogo(formData);
      setLogoUrl(res.logo_url);
      updateProfileState(res.profile);
      toast('Company logo uploaded successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to upload logo.', 'error');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.updateCompanyProfile({
        company_name: companyName,
        industry,
        description,
        website,
        location,
        size,
      });

      updateProfileState(res.profile);
      toast('Company profile updated successfully!', 'success');
    } catch (err) {
      toast(err.message || 'Failed to update company profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page-wrapper">
      <div className="container" style={{ maxWidth: '800px' }}>
        <div style={{ marginBottom: '2rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800 }}>Company Profile</h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem', marginTop: '0.3rem' }}>
            Manage your organization details, branding, and employer verification.
          </p>
        </div>

        {/* Verification Status Banner */}
        <div className="glass-card" style={{
          padding: '1.25rem 1.5rem',
          marginBottom: '2rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          background: profile?.is_verified ? 'rgba(16, 185, 129, 0.08)' : 'rgba(245, 158, 11, 0.08)',
          border: profile?.is_verified ? '1px solid rgba(16, 185, 129, 0.25)' : '1px solid rgba(245, 158, 11, 0.25)',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            {profile?.is_verified ? (
              <CheckCircle size={24} color="#10B981" />
            ) : (
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
            )}
            <div>
              <div style={{ fontWeight: 700, fontSize: '0.95rem', color: '#ffffff' }}>
                {profile?.is_verified ? 'Verified Employer Badge Active' : 'Employer Verification Pending Review'}
              </div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
                {profile?.is_verified
                  ? 'Your profile carries the verified badge across all student job searches and postings.'
                  : 'Platform administrators review company authenticity before granting the verified status.'}
              </div>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          {/* Company Branding & Logo */}
          <div className="glass-card" style={{ padding: '2rem', marginBottom: '2rem' }}>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, marginBottom: '1.5rem' }}>
              Company Branding
            </h2>

            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem', marginBottom: '1.75rem', flexWrap: 'wrap' }}>
              <img
                src={logoUrl || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=120&h=120&q=80'}
                alt={companyName}
                style={{ width: '72px', height: '72px', borderRadius: '16px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
              />

              <div>
                <label className="btn btn-secondary btn-sm" style={{ cursor: 'pointer' }}>
                  <Upload size={14} />
                  <span>{uploadingLogo ? 'Uploading...' : 'Upload Logo Image'}</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleLogoUpload}
                    style={{ display: 'none' }}
                    disabled={uploadingLogo}
                  />
                </label>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)', marginTop: '6px' }}>
                  Square PNG, WEBP, or SVG recommended (up to 5MB)
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Company Name *</label>
                <input
                  type="text"
                  className="form-input"
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Industry</label>
                <select className="form-select" value={industry} onChange={(e) => setIndustry(e.target.value)}>
                  <option value="Software & Technology">Software & Technology</option>
                  <option value="Fintech">Fintech</option>
                  <option value="Artificial Intelligence">Artificial Intelligence</option>
                  <option value="CleanTech">CleanTech</option>
                  <option value="Healthcare Tech">Healthcare Tech</option>
                </select>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.25rem' }}>
              <div className="form-group">
                <label className="form-label">Headquarters Location</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="e.g. San Francisco, CA"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Company Size</label>
                <select className="form-select" value={size} onChange={(e) => setSize(e.target.value)}>
                  <option value="1-10">1-10 employees (Early Startup)</option>
                  <option value="11-50">11-50 employees (Growth)</option>
                  <option value="51-200">51-200 employees (Mid-stage)</option>
                  <option value="500+">500+ employees (Enterprise)</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Company Website URL</label>
              <input
                type="url"
                className="form-input"
                placeholder="https://company.com"
                value={website}
                onChange={(e) => setWebsite(e.target.value)}
              />
            </div>

            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Company Description & Mission</label>
              <textarea
                className="form-textarea"
                rows={4}
                placeholder="Describe your organization, mission, and work culture for students..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
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
