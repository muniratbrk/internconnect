import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternshipCard from '../components/internships/InternshipCard';
import { CardSkeleton } from '../components/common/Skeleton';
import EmptyState from '../components/common/EmptyState';
import { DEPARTMENTS, FIELDS_OF_STUDY, ETHIOPIAN_LOCATIONS } from '../constants/taxonomy';
import { Search, Filter, X, RotateCcw, Briefcase } from 'lucide-react';

const COMMON_SKILLS = [
  'React',
  'Node.js',
  'TypeScript',
  'JavaScript',
  'Python',
  'PostgreSQL',
  'Flutter',
  'PyTorch',
  'Docker',
  'REST APIs',
  'IoT',
  'C++',
];

export default function InternshipList() {
  const { isStudent } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();

  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);

  // Filter states initialized from URL params
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [selectedSkill, setSelectedSkill] = useState(searchParams.get('skill') || '');
  const [department, setDepartment] = useState(searchParams.get('department') || '');
  const [fieldOfStudy, setFieldOfStudy] = useState(searchParams.get('field') || '');
  const [location, setLocation] = useState(searchParams.get('location') || '');
  const [isPaid, setIsPaid] = useState(searchParams.get('is_paid') === 'true');
  const [isRemote, setIsRemote] = useState(searchParams.get('is_remote') === 'true');
  const [duration, setDuration] = useState(searchParams.get('duration') || '');
  const [sort, setSort] = useState(isStudent ? 'recommended' : 'newest');

  const fetchInternships = async () => {
    setLoading(true);
    try {
      const queryParts = [];
      if (search) queryParts.push(`search=${encodeURIComponent(search)}`);
      if (selectedSkill) queryParts.push(`skill=${encodeURIComponent(selectedSkill)}`);
      if (department) queryParts.push(`department=${encodeURIComponent(department)}`);
      if (fieldOfStudy) queryParts.push(`field_of_study=${encodeURIComponent(fieldOfStudy)}`);
      if (location) queryParts.push(`location=${encodeURIComponent(location)}`);
      if (isPaid) queryParts.push(`is_paid=true`);
      if (isRemote) queryParts.push(`is_remote=true`);
      if (duration) queryParts.push(`duration=${encodeURIComponent(duration)}`);
      if (sort) queryParts.push(`sort=${sort}`);

      const queryString = queryParts.length > 0 ? `?${queryParts.join('&')}` : '';
      const res = await api.listInternships(queryString);
      setInternships(res.internships || []);
    } catch (err) {
      console.error('Failed to fetch internships:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInternships();
  }, [selectedSkill, department, fieldOfStudy, location, isPaid, isRemote, duration, sort]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    fetchInternships();
  };

  const handleResetFilters = () => {
    setSearch('');
    setSelectedSkill('');
    setDepartment('');
    setFieldOfStudy('');
    setLocation('');
    setIsPaid(false);
    setIsRemote(false);
    setDuration('');
    setSort(isStudent ? 'recommended' : 'newest');
    setSearchParams({});
  };

  return (
    <div className="page-wrapper">
      <div className="container">
        {/* Page Header */}
        <div style={{ marginBottom: '2.5rem' }}>
          <h1 style={{ fontSize: '2.25rem', fontWeight: 800, marginBottom: '0.5rem' }}>
            Find Internships in Ethiopia
          </h1>
          <p style={{ color: 'var(--text-secondary)', fontSize: '1.05rem' }}>
            Browse engineering and technology opportunities filtered by academic department and field of study.
          </p>
        </div>

        {/* Main Layout Grid */}
        <div style={{ display: 'grid', gridTemplateColumns: '290px 1fr', gap: '2rem', alignItems: 'flex-start' }}>
          {/* Filters Sidebar */}
          <aside className="glass-card" style={{ padding: '1.5rem', position: 'sticky', top: '90px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontWeight: 700 }}>
                <Filter size={18} color="var(--accent-cyan)" />
                <span>Filters</span>
              </div>
              <button
                onClick={handleResetFilters}
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  fontSize: '0.8rem',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  cursor: 'pointer',
                }}
              >
                <RotateCcw size={12} />
                <span>Reset</span>
              </button>
            </div>

            {/* Academic Department Filter */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Academic Department</label>
              <select
                className="form-select"
                value={department}
                onChange={(e) => setDepartment(e.target.value)}
              >
                <option value="">All Departments</option>
                {DEPARTMENTS.map((dept) => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>

            {/* Field of Study Filter */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Field of Study</label>
              <select
                className="form-select"
                value={fieldOfStudy}
                onChange={(e) => setFieldOfStudy(e.target.value)}
              >
                <option value="">All Fields</option>
                {FIELDS_OF_STUDY.map((field) => (
                  <option key={field} value={field}>{field}</option>
                ))}
              </select>
            </div>

            {/* Location Selector */}
            <div className="form-group" style={{ marginBottom: '1.25rem' }}>
              <label className="form-label" style={{ fontWeight: 600 }}>Location (Ethiopia)</label>
              <select
                className="form-select"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
              >
                <option value="">All Cities / Regions</option>
                {ETHIOPIAN_LOCATIONS.map((loc) => (
                  <option key={loc} value={loc}>{loc}</option>
                ))}
              </select>
            </div>

            {/* Quick Skills Filter */}
            <div style={{ marginBottom: '1.5rem' }}>
              <label className="form-label" style={{ marginBottom: '0.6rem', fontWeight: 600 }}>Required Skill</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
                {COMMON_SKILLS.map((skill) => {
                  const isActive = selectedSkill === skill;
                  return (
                    <button
                      key={skill}
                      type="button"
                      onClick={() => setSelectedSkill(isActive ? '' : skill)}
                      style={{
                        padding: '0.25rem 0.65rem',
                        fontSize: '0.75rem',
                        borderRadius: 'var(--radius-sm)',
                        background: isActive ? 'var(--primary)' : 'rgba(255,255,255,0.04)',
                        border: isActive ? '1px solid var(--border-focus)' : '1px solid var(--border-subtle)',
                        color: isActive ? '#ffffff' : 'var(--text-secondary)',
                        cursor: 'pointer',
                        fontWeight: isActive ? 600 : 400,
                        transition: 'all var(--transition-fast)',
                      }}
                    >
                      {skill}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Checkboxes: Remote & Paid */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={isRemote}
                  onChange={(e) => setIsRemote(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Remote Allowed</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: 'pointer', fontSize: '0.88rem' }}>
                <input
                  type="checkbox"
                  checked={isPaid}
                  onChange={(e) => setIsPaid(e.target.checked)}
                  style={{ accentColor: 'var(--primary)' }}
                />
                <span>Paid Stipend (ETB)</span>
              </label>
            </div>

            {/* Duration Selector */}
            <div className="form-group" style={{ marginBottom: 0 }}>
              <label className="form-label">Duration</label>
              <select
                className="form-select"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
              >
                <option value="">Any Duration</option>
                <option value="3 Months">3 Months (Summer)</option>
                <option value="4 Months">4 Months</option>
                <option value="6 Months">6 Months (Co-op)</option>
              </select>
            </div>
          </aside>

          {/* Results Area */}
          <main>
            {/* Search & Sort Bar */}
            <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', flexWrap: 'wrap' }}>
              <form onSubmit={handleSearchSubmit} style={{ flex: 1, minWidth: '260px', display: 'flex', gap: '0.5rem' }}>
                <div style={{ position: 'relative', flex: 1 }}>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="Search by keywords, title, or company (e.g. Telebirr, Ethio Telecom)..."
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    style={{ paddingLeft: '2.5rem' }}
                  />
                  <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: '0.85rem', top: '50%', transform: 'translateY(-50%)' }} />
                </div>
                <button type="submit" className="btn btn-primary">
                  Search
                </button>
              </form>

              {/* Sort Selector */}
              <div style={{ minWidth: '180px' }}>
                <select
                  className="form-select"
                  value={sort}
                  onChange={(e) => setSort(e.target.value)}
                >
                  {isStudent && <option value="recommended">Sort by Match Score</option>}
                  <option value="newest">Most Recent</option>
                </select>
              </div>
            </div>

            {/* Active Filters Bar */}
            {(selectedSkill || department || fieldOfStudy || location || isRemote || isPaid || duration || search) && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1.5rem' }}>
                <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>Active filters:</span>
                {department && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setDepartment('')}>
                    Dept: {department} <X size={12} />
                  </span>
                )}
                {fieldOfStudy && (
                  <span className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => setFieldOfStudy('')}>
                    Field: {fieldOfStudy} <X size={12} />
                  </span>
                )}
                {selectedSkill && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => setSelectedSkill('')}>
                    Skill: {selectedSkill} <X size={12} />
                  </span>
                )}
                {location && (
                  <span className="badge badge-info" style={{ cursor: 'pointer' }} onClick={() => setLocation('')}>
                    Loc: {location} <X size={12} />
                  </span>
                )}
                {isRemote && (
                  <span className="badge badge-cyan" style={{ cursor: 'pointer' }} onClick={() => setIsRemote(false)}>
                    Remote Only <X size={12} />
                  </span>
                )}
                {isPaid && (
                  <span className="badge badge-success" style={{ cursor: 'pointer' }} onClick={() => setIsPaid(false)}>
                    Paid (ETB) <X size={12} />
                  </span>
                )}
                {duration && (
                  <span className="badge badge-info" style={{ cursor: 'pointer' }} onClick={() => setDuration('')}>
                    Duration: {duration} <X size={12} />
                  </span>
                )}
                {search && (
                  <span className="badge badge-primary" style={{ cursor: 'pointer' }} onClick={() => { setSearch(''); fetchInternships(); }}>
                    Query: "{search}" <X size={12} />
                  </span>
                )}
              </div>
            )}

            {/* Content Results */}
            {loading ? (
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
                <CardSkeleton />
              </div>
            ) : internships.length === 0 ? (
              <EmptyState
                icon={Briefcase}
                title="No internships match your criteria"
                description="Try clearing some of your department, field, or location filters."
                actionLabel="Clear All Filters"
                onAction={handleResetFilters}
              />
            ) : (
              <div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                  Showing {internships.length} active opportunities in Ethiopia
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.25rem' }}>
                  {internships.map((job) => (
                    <InternshipCard key={job.id} internship={job} />
                  ))}
                </div>
              </div>
            )}
          </main>
        </div>
      </div>
    </div>
  );
}
