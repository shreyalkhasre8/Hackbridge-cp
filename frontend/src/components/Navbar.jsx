import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Compass, Users, Sparkles, Award, Database, BarChart3, LogIn, UserPlus, LogOut, ChevronDown } from 'lucide-react';

export default function Navbar() {
  const { user, isAuthenticated, logout, demoLogin } = useAuth();
  const navigate = useNavigate();
  const [demoMenuOpen, setDemoMenuOpen] = useState(false);

  const handleDemo = async (role) => {
    setDemoMenuOpen(false);
    await demoLogin(role);
    if (role === 'student') navigate('/dashboard');
    else if (role === 'mentor') navigate('/mentor/dashboard');
    else if (role === 'college') navigate('/organizer/dashboard');
    else if (role === 'admin') navigate('/admin');
  };

  return (
    <header style={{
      position: 'sticky',
      top: 0,
      zIndex: 100,
      backgroundColor: 'rgba(248, 245, 238, 0.92)',
      backdropFilter: 'blur(10px)',
      borderBottom: '1px solid var(--border-subtle)',
    }}>
      <div className="container" style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        height: '74px',
      }}>
        {/* Logo */}
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.65rem' }}>
          <div style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-olive-850)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: '#FFFFFF',
          }}>
            <Sparkles size={20} color="var(--color-accent-400)" />
          </div>
          <div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.45rem',
              fontWeight: 700,
              color: 'var(--color-olive-900)',
              letterSpacing: '-0.03em',
            }}>
              Hack<span style={{ color: 'var(--color-accent-600)' }}>Bridge</span>
            </span>
            <span style={{ display: 'block', fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--text-muted)', marginTop: '-2px' }}>
              Inter-College Platform
            </span>
          </div>
        </Link>

        {/* Navigation Links */}
        <nav style={{ display: 'flex', alignItems: 'center', gap: '1.75rem' }}>
          <Link to="/hackathons" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Compass size={16} color="var(--color-olive-600)" />
            <span>Hackathons</span>
          </Link>
          <Link to="/teams" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Users size={16} color="var(--color-olive-600)" />
            <span>Teams</span>
          </Link>
          <Link to="/smart-formation" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Sparkles size={16} color="var(--color-accent-600)" />
            <span>Smart Formation</span>
          </Link>
          <Link to="/mentors" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Award size={16} color="var(--color-olive-600)" />
            <span>Mentors</span>
          </Link>
          <Link to="/ddbms" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <Database size={16} color="var(--color-olive-600)" />
            <span>DDBMS Demo</span>
          </Link>
          <Link to="/analytics" style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontSize: '0.925rem', fontWeight: 600, color: 'var(--text-primary)' }}>
            <BarChart3 size={16} color="var(--color-olive-600)" />
            <span>Analytics</span>
          </Link>
        </nav>

        {/* Right CTA */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
          {isAuthenticated ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
              <Link
                to={
                  user.role === 'mentor' ? '/mentor/dashboard' :
                  user.role === 'college' ? '/organizer/dashboard' :
                  user.role === 'admin' ? '/admin' : '/dashboard'
                }
                className="btn btn-primary btn-sm"
              >
                Go to Dashboard
              </Link>
              <button onClick={logout} className="btn btn-secondary btn-sm" title="Sign Out">
                <LogOut size={15} />
              </button>
            </div>
          ) : (
            <>
              {/* 1-Click Demo Persona Dropdown */}
              <div style={{ position: 'relative' }}>
                <button
                  className="btn btn-secondary btn-sm"
                  onClick={() => setDemoMenuOpen(!demoMenuOpen)}
                  style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', background: 'var(--color-accent-50)', borderColor: 'var(--color-accent-300)' }}
                >
                  <Sparkles size={14} color="var(--color-accent-700)" />
                  <span style={{ color: 'var(--color-accent-900)' }}>1-Click Demo</span>
                  <ChevronDown size={14} />
                </button>

                {demoMenuOpen && (
                  <div style={{
                    position: 'absolute',
                    top: '110%',
                    right: 0,
                    width: '210px',
                    background: 'var(--color-bg-surface)',
                    border: '1px solid var(--border-default)',
                    borderRadius: 'var(--radius-md)',
                    boxShadow: 'var(--shadow-lg)',
                    padding: '0.5rem',
                    zIndex: 200,
                  }}>
                    <div style={{ fontSize: '0.7rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', padding: '0.35rem 0.5rem' }}>
                      Instant Evaluator Personas
                    </div>
                    <button
                      onClick={() => handleDemo('student')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-warm)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      🎓 Student (Aarav Patel)
                    </button>
                    <button
                      onClick={() => handleDemo('mentor')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-warm)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      👨‍🏫 Mentor (Dr. Vikram)
                    </button>
                    <button
                      onClick={() => handleDemo('college')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-warm)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      🏛️ Organizer (IIT Bombay)
                    </button>
                    <button
                      onClick={() => handleDemo('admin')}
                      style={{ width: '100%', textAlign: 'left', padding: '0.45rem 0.65rem', border: 'none', background: 'none', borderRadius: 'var(--radius-sm)', cursor: 'pointer', fontSize: '0.85rem', color: 'var(--text-primary)' }}
                      onMouseEnter={(e) => e.target.style.background = 'var(--color-bg-warm)'}
                      onMouseLeave={(e) => e.target.style.background = 'none'}
                    >
                      ⚙️ Admin (Platform Lead)
                    </button>
                  </div>
                )}
              </div>

              <Link to="/login" className="btn btn-ghost btn-sm">
                <LogIn size={15} />
                <span>Log In</span>
              </Link>
              <Link to="/register" className="btn btn-primary btn-sm">
                <UserPlus size={15} />
                <span>Get Started</span>
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
