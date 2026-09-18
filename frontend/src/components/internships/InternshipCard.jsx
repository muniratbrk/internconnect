import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Clock, CheckCircle, ArrowRight } from 'lucide-react';
import MatchScoreMeter from '../common/MatchScoreMeter';
import StatusBadge from '../common/StatusBadge';

export default function InternshipCard({ internship }) {
  return (
    <div className="glass-card glass-card-interactive" style={{ padding: '1.5rem', display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header: Company & Match Score */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
        <div style={{ display: 'flex', gap: '0.85rem', alignItems: 'center' }}>
          <img
            src={internship.logo_url || 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?auto=format&fit=crop&w=100&h=100&q=80'}
            alt={internship.company_name}
            style={{ width: '46px', height: '46px', borderRadius: '12px', objectFit: 'cover', border: '1px solid var(--border-subtle)' }}
          />
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
                {internship.company_name}
              </span>
              {internship.company_verified && (
                <CheckCircle size={14} color="#10B981" title="Verified Company" />
              )}
            </div>
            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
              {internship.industry || 'Technology'}
            </span>
          </div>
        </div>

        {/* Match Meter if present */}
        {internship.match && (
          <MatchScoreMeter match={internship.match} />
        )}
      </div>

      {/* Title */}
      <h3 style={{ fontSize: '1.15rem', fontWeight: 700, marginBottom: '0.4rem', lineHeight: '1.3' }}>
        <Link to={`/internships/${internship.id}`} style={{ color: '#ffffff' }}>
          {internship.title}
        </Link>
      </h3>

      {/* Department & Field Tags */}
      {(internship.department || internship.field_of_study) && (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem', marginBottom: '0.75rem' }}>
          {internship.department && (
            <span style={{ fontSize: '0.72rem', color: '#818CF8', background: 'rgba(79, 70, 229, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
              {internship.department}
            </span>
          )}
          {internship.field_of_study && (
            <span style={{ fontSize: '0.72rem', color: 'var(--accent-cyan)', background: 'rgba(6, 182, 212, 0.12)', padding: '2px 8px', borderRadius: 'var(--radius-sm)', fontWeight: 600 }}>
              {internship.field_of_study}
            </span>
          )}
        </div>
      )}

      {/* Description Snippet */}
      <p style={{
        color: 'var(--text-secondary)',
        fontSize: '0.88rem',
        marginBottom: '1rem',
        display: '-webkit-box',
        WebkitLineClamp: 2,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        lineHeight: '1.5',
      }}>
        {internship.description}
      </p>

      {/* Details Pills */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.75rem', marginBottom: '1.25rem', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <MapPin size={14} color="var(--accent-cyan)" />
          <span>{internship.is_remote ? 'Remote (Ethiopia)' : internship.location}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <span style={{ fontWeight: 700, color: '#10B981', fontSize: '0.85rem' }}>Br</span>
          <span>
            {internship.is_paid
              ? `${Number(internship.stipend_amount || 10000).toLocaleString()} ETB/mo`
              : 'Unpaid / Experience'}
          </span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
          <Clock size={14} color="var(--text-muted)" />
          <span>{internship.duration || '3 Months'}</span>
        </div>
      </div>

      {/* Skills Chips */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem', marginBottom: '1.5rem', marginTop: 'auto' }}>
        {(internship.required_skills || []).slice(0, 4).map((skill, index) => {
          const isMatched = internship.match?.matchingSkills?.includes(skill.toLowerCase());
          return (
            <span
              key={index}
              style={{
                fontSize: '0.75rem',
                padding: '0.2rem 0.6rem',
                borderRadius: 'var(--radius-sm)',
                background: isMatched ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255, 255, 255, 0.05)',
                color: isMatched ? '#34D399' : 'var(--text-secondary)',
                border: isMatched ? '1px solid rgba(16, 185, 129, 0.3)' : '1px solid var(--border-subtle)',
                fontWeight: isMatched ? 600 : 400,
              }}
            >
              {skill}
            </span>
          );
        })}
        {(internship.required_skills || []).length > 4 && (
          <span style={{ fontSize: '0.75rem', padding: '0.2rem 0.5rem', color: 'var(--text-muted)' }}>
            +{(internship.required_skills || []).length - 4} more
          </span>
        )}
      </div>

      {/* Footer / Action */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: '1px solid var(--border-subtle)', paddingTop: '0.85rem' }}>
        {internship.existingApplication ? (
          <StatusBadge status={internship.existingApplication.status} />
        ) : (
          <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
            Deadline: {internship.application_deadline ? new Date(internship.application_deadline).toLocaleDateString() : 'Rolling'}
          </span>
        )}

        <Link
          to={`/internships/${internship.id}`}
          className="btn btn-outline btn-sm"
          style={{ display: 'flex', alignItems: 'center', gap: '0.35rem' }}
        >
          <span>View Details</span>
          <ArrowRight size={14} />
        </Link>
      </div>
    </div>
  );
}
