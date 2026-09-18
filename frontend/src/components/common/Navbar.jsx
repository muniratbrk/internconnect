import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';
import { 
  Briefcase, 
  Bell, 
  MessageSquare, 
  User, 
  LogOut, 
  PlusCircle, 
  Shield, 
  CheckCircle2,
  Sparkles,
  Menu,
  X
} from 'lucide-react';

export default function Navbar() {
  const { user, profile, isAuthenticated, isStudent, isCompany, isAdmin, logout, demoLogin } = useAuth();
  const { notifications, unreadCount, markRead, markAllRead } = useNotification();
  const [showNotifications, setShowNotifications] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleDemoSwitch = async (role) => {
    await demoLogin(role);
    if (role === 'student') navigate('/student-dashboard');
    else if (role === 'company') navigate('/company-dashboard');
    else if (role === 'admin') navigate('/admin-dashboard');
  };

  return (
    <nav style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      height: '70px',
      background: 'rgba(11, 15, 25, 0.85)',
      backdropFilter: 'blur(16px)',
      WebkitBackdropFilter: 'blur(16px)',
      borderBottom: '1px solid var(--border-subtle)',
      zIndex: 500,
      display: 'flex',
      alignItems: 'center',
    }}>
      <div className="container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', textDecoration: 'none' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: 'var(--primary-gradient)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            boxShadow: 'var(--shadow-glow)',
          }}>
            <Briefcase size={20} color="#ffffff" />
          </div>
          <div>
            <span style={{ fontSize: '1.25rem', fontWeight: 800, letterSpacing: '-0.02em', color: '#ffffff' }}>
              Intern<span style={{ color: 'var(--accent-cyan)' }}>Connect</span>
            </span>
          </div>
        </Link>

        {/* Desktop Navigation Links */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }} className="desktop-links">
          <Link to="/internships" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
            Find Internships
          </Link>
          <Link to="/companies" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
            Companies
          </Link>

          {isAuthenticated && (
            <>
              {isStudent && (
                <>
                  <Link to="/student-dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
                    My Dashboard
                  </Link>
                  <Link to="/messages" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MessageSquare size={16} /> Messages
                  </Link>
                </>
              )}

              {isCompany && (
                <>
                  <Link to="/company-dashboard" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>
                    Hiring Pipeline
                  </Link>
                  <Link to="/post-internship" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <PlusCircle size={16} /> Post Role
                  </Link>
                  <Link to="/messages" style={{ color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                    <MessageSquare size={16} /> Messages
                  </Link>
                </>
              )}

              {isAdmin && (
                <Link to="/admin-dashboard" style={{ color: '#FBBF24', fontWeight: 600, fontSize: '0.95rem', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
                  <Shield size={16} /> Admin Console
                </Link>
              )}
            </>
          )}
        </div>

        {/* Right Section: 1-Click Demo Switcher + Notifications + Auth State */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          {/* Quick Demo Switcher Pill */}
          <div style={{
            display: 'flex',
            alignItems: 'center',
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 'var(--radius-full)',
            padding: '2px 4px',
            fontSize: '0.78rem',
          }}>
            <span style={{ padding: '0 6px', color: 'var(--text-muted)', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Sparkles size={12} color="#818CF8" /> Demo:
            </span>
            <button
              onClick={() => handleDemoSwitch('student')}
              style={{
                background: isStudent ? 'var(--primary)' : 'transparent',
                color: isStudent ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Student
            </button>
            <button
              onClick={() => handleDemoSwitch('company')}
              style={{
                background: isCompany ? 'var(--primary)' : 'transparent',
                color: isCompany ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Company
            </button>
            <button
              onClick={() => handleDemoSwitch('admin')}
              style={{
                background: isAdmin ? '#D97706' : 'transparent',
                color: isAdmin ? '#ffffff' : 'var(--text-secondary)',
                border: 'none',
                borderRadius: 'var(--radius-full)',
                padding: '3px 8px',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Admin
            </button>
          </div>

          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', position: 'relative' }}>
              {/* Notification Bell */}
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid var(--border-subtle)',
                  borderRadius: '10px',
                  width: '38px',
                  height: '38px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  cursor: 'pointer',
                  color: 'var(--text-primary)',
                  position: 'relative',
                }}
              >
                <Bell size={18} />
                {unreadCount > 0 && (
                  <span style={{
                    position: 'absolute',
                    top: '-4px',
                    right: '-4px',
                    background: 'var(--danger)',
                    color: '#ffffff',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    width: '18px',
                    height: '18px',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    border: '2px solid var(--bg-main)',
                  }}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notification Dropdown */}
              {showNotifications && (
                <div style={{
                  position: 'absolute',
                  top: '50px',
                  right: 0,
                  width: '320px',
                  background: 'var(--bg-card)',
                  border: '1px solid var(--border-hover)',
                  borderRadius: 'var(--radius-lg)',
                  boxShadow: 'var(--shadow-lg)',
                  padding: '1rem',
                  zIndex: 1000,
                  maxHeight: '400px',
                  overflowY: 'auto',
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                    <span style={{ fontWeight: 700, fontSize: '0.9rem' }}>Notifications</span>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllRead}
                        style={{ background: 'none', border: 'none', color: 'var(--accent-cyan)', fontSize: '0.75rem', cursor: 'pointer' }}
                      >
                        Mark all read
                      </button>
                    )}
                  </div>
                  {notifications.length === 0 ? (
                    <div style={{ textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.85rem', padding: '1rem 0' }}>
                      No notifications yet
                    </div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        style={{
                          padding: '0.65rem',
                          borderRadius: '8px',
                          background: n.is_read ? 'transparent' : 'rgba(79, 70, 229, 0.08)',
                          marginBottom: '0.5rem',
                          cursor: 'pointer',
                          border: n.is_read ? '1px solid transparent' : '1px solid rgba(79,70,229,0.2)',
                        }}
                      >
                        <div style={{ fontWeight: 600, fontSize: '0.82rem', color: '#ffffff' }}>{n.title}</div>
                        <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>{n.message}</div>
                      </div>
                    ))
                  )}
                </div>
              )}

              {/* User Avatar / Profile */}
              <Link
                to={isStudent ? '/student-profile' : isCompany ? '/company-profile' : '/admin-dashboard'}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                  padding: '4px 10px',
                  background: 'rgba(255,255,255,0.04)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                }}
              >
                {profile?.avatar_url || profile?.logo_url ? (
                  <img
                    src={profile.avatar_url || profile.logo_url}
                    alt="Profile"
                    style={{ width: '28px', height: '28px', borderRadius: '50%', objectFit: 'cover' }}
                  />
                ) : (
                  <User size={16} color="var(--accent-cyan)" />
                )}
                <span style={{ fontSize: '0.85rem', fontWeight: 600, maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {profile?.full_name || profile?.company_name || 'Admin'}
                </span>
              </Link>

              {/* Logout Button */}
              <button
                onClick={handleLogout}
                title="Log Out"
                style={{
                  background: 'none',
                  border: 'none',
                  color: 'var(--text-muted)',
                  cursor: 'pointer',
                  padding: '6px',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <LogOut size={18} />
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link to="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </div>
          )}
        </div>
      </div>
    </nav>
  );
}
