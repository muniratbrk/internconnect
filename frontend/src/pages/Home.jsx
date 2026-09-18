import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import InternshipCard from '../components/internships/InternshipCard';
import { CardSkeleton } from '../components/common/Skeleton';
import {
  Briefcase,
  Search,
  Sparkles,
  CheckCircle,
  TrendingUp,
  Users,
  Building2,
  ArrowRight,
  Code,
  ShieldCheck
} from 'lucide-react';

export default function Home() {
  const { isAuthenticated, isStudent } = useAuth();
  const [internships, setInternships] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function loadFeatured() {
      try {
        const res = await api.listInternships('?sort=recommended');
        setInternships((res.internships || []).slice(0, 3));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFeatured();
  }, []);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/internships?search=${encodeURIComponent(searchQuery.trim())}`);
    } else {
      navigate('/internships');
    }
  };

  return (
    <div>
      {/* Hero Section */}
      <section style={{
        padding: '5rem 0 4rem 0',
        textAlign: 'center',
        position: 'relative',
      }}>
        <div className="container" style={{ maxWidth: '880px' }}>
          {/* Top Pill */}
          <div style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: '0.5rem',
            background: 'rgba(79, 70, 229, 0.1)',
            border: '1px solid rgba(79, 70, 229, 0.25)',
            padding: '0.4rem 1rem',
            borderRadius: 'var(--radius-full)',
            fontSize: '0.85rem',
            color: '#818CF8',
            marginBottom: '1.75rem',
            fontWeight: 600,
          }}>
            <Sparkles size={16} />
            <span>Algorithmic Skill & Department Matching for Ethiopian Tech Internships</span>
          </div>

          <h1 style={{
            fontSize: 'clamp(2.5rem, 5vw, 4rem)',
            fontWeight: 800,
            letterSpacing: '-0.03em',
            lineHeight: 1.15,
            marginBottom: '1.5rem',
            color: '#ffffff',
          }}>
            Connect Your Skills With <br />
            <span style={{
              background: 'var(--primary-gradient)',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}>
              Top Tech Opportunities
            </span>
          </h1>

          <p style={{
            fontSize: '1.15rem',
            color: 'var(--text-secondary)',
            lineHeight: 1.6,
            marginBottom: '2.5rem',
            maxWidth: '680px',
            margin: '0 auto 2.5rem auto',
          }}>
            InternConnect bridges ambitious Ethiopian university students (AAU, AASTU, ASTU, BiT) with verified employers. Get transparent match scores, track your application pipeline in real time, and chat directly with hiring teams.
          </p>

          {/* Live Search Bar */}
          <form
            onSubmit={handleSearchSubmit}
            style={{
              display: 'flex',
              background: 'var(--bg-card)',
              border: '1px solid var(--border-hover)',
              borderRadius: 'var(--radius-xl)',
              padding: '0.5rem',
              boxShadow: 'var(--shadow-md), var(--shadow-glow)',
              maxWidth: '640px',
              margin: '0 auto 2.5rem auto',
              alignItems: 'center',
              gap: '0.5rem',
            }}
          >
            <div style={{ paddingLeft: '1rem', color: 'var(--text-muted)' }}>
              <Search size={20} />
            </div>
            <input
              type="text"
              placeholder="Search by role, department (e.g. Software Eng), skill (e.g. Flutter, React), or company..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                background: 'transparent',
                border: 'none',
                color: '#ffffff',
                padding: '0.75rem 0.5rem',
                outline: 'none',
                fontSize: '1rem',
              }}
            />
            <button type="submit" className="btn btn-primary btn-lg" style={{ borderRadius: 'var(--radius-lg)' }}>
              Find Roles
            </button>
          </form>

          {/* Quick Stats Grid */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
            gap: '1.25rem',
            marginTop: '3.5rem',
          }}>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: 'var(--accent-cyan)' }}>95%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Match Accuracy</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#10B981' }}>Br 12,500/mo</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Avg. Tech Stipend</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#818CF8' }}>100%</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Verified Employers</div>
            </div>
            <div className="glass-card" style={{ padding: '1.25rem' }}>
              <div style={{ fontSize: '1.85rem', fontWeight: 800, color: '#F59E0B' }}>&lt; 48 hrs</div>
              <div style={{ fontSize: '0.82rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Recruiter Response</div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Roles Section */}
      <section style={{ padding: '4rem 0', background: 'rgba(255,255,255,0.01)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2rem' }}>
            <div>
              <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Featured Opportunities
              </span>
              <h2 style={{ fontSize: '2rem', fontWeight: 800, marginTop: '0.3rem' }}>
                Explore Top Tier Internships
              </h2>
            </div>
            <Link to="/internships" className="btn btn-secondary btn-sm" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
              <span>View All Postings</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {loading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              <CardSkeleton />
              <CardSkeleton />
              <CardSkeleton />
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '1.5rem' }}>
              {internships.map((job) => (
                <InternshipCard key={job.id} internship={job} />
              ))}
            </div>
          )}
        </div>
      </section>

      {/* How it Works Section */}
      <section style={{ padding: '5rem 0' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '640px', margin: '0 auto 3.5rem auto' }}>
            <span style={{ fontSize: '0.82rem', fontWeight: 700, color: 'var(--accent-cyan)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Designed For Transparency
            </span>
            <h2 style={{ fontSize: '2.2rem', fontWeight: 800, marginTop: '0.3rem', color: '#ffffff' }}>
              How InternConnect Works
            </h2>
            <p style={{ color: 'var(--text-secondary)', marginTop: '0.75rem' }}>
              A seamless pipeline from discovering opportunities to receiving official offers.
            </p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2rem',
          }}>
            {/* Step 1 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(79, 70, 229, 0.15)',
                color: '#818CF8',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <Code size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>1. Build Skill Profile</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Showcase your coursework, GitHub projects, and technical skills like React, Python, or Cloud systems.
              </p>
            </div>

            {/* Step 2 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(6, 182, 212, 0.15)',
                color: 'var(--accent-cyan)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <Sparkles size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>2. Algorithmic Matching</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Our engine compares requirements against your skillset and displays compatibility percentages in real-time.
              </p>
            </div>

            {/* Step 3 */}
            <div className="glass-card" style={{ padding: '2rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: '12px',
                background: 'rgba(16, 185, 129, 0.15)',
                color: '#10B981',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
              }}>
                <TrendingUp size={24} />
              </div>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 700, marginBottom: '0.6rem' }}>3. Real-Time Pipeline</h3>
              <p style={{ color: 'var(--text-secondary)', fontSize: '0.9rem', lineHeight: '1.6' }}>
                Track review stages from Applied to Interview and Offer. Chat directly with company recruiters inside the app.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Call to Action Banner */}
      <section style={{ padding: '4rem 0 6rem 0' }}>
        <div className="container">
          <div style={{
            background: 'linear-gradient(135deg, rgba(79, 70, 229, 0.2) 0%, rgba(6, 182, 212, 0.1) 100%)',
            border: '1px solid rgba(79, 70, 229, 0.3)',
            borderRadius: 'var(--radius-xl)',
            padding: '4rem 2rem',
            textAlign: 'center',
            boxShadow: 'var(--shadow-lg)',
          }}>
            <h2 style={{ fontSize: '2.4rem', fontWeight: 800, marginBottom: '1rem', color: '#ffffff' }}>
              Ready to Accelerate Your Career?
            </h2>
            <p style={{ color: 'var(--text-secondary)', fontSize: '1.1rem', maxWidth: '580px', margin: '0 auto 2rem auto' }}>
              Join thousands of students and top engineering teams on InternConnect today.
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <Link to="/register" className="btn btn-primary btn-lg">
                Create Free Account
              </Link>
              <Link to="/internships" className="btn btn-secondary btn-lg">
                Explore Postings
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
