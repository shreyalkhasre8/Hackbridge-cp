import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Sparkles, LogIn, Key, Mail, ShieldAlert } from 'lucide-react';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login, demoLogin } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const user = await login(email, password);
      if (user.role === 'mentor') navigate('/mentor/dashboard');
      else if (user.role === 'college') navigate('/organizer/dashboard');
      else if (user.role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Invalid email or password.');
    } finally {
      setLoading(false);
    }
  };

  const handleDemo = async (role) => {
    try {
      const user = await demoLogin(role);
      if (role === 'mentor') navigate('/mentor/dashboard');
      else if (role === 'college') navigate('/organizer/dashboard');
      else if (role === 'admin') navigate('/admin');
      else navigate('/dashboard');
    } catch (err) {
      setError(err.message || 'Demo login failed');
    }
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
      <Navbar />
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '3rem 1.5rem' }}>
        <div className="card" style={{ maxWidth: '440px', width: '100%', padding: '2.5rem' }}>
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div style={{
              width: '44px',
              height: '44px',
              borderRadius: 'var(--radius-md)',
              backgroundColor: 'var(--color-olive-850)',
              color: '#FFFFFF',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: '1rem',
            }}>
              <LogIn size={22} color="var(--color-accent-400)" />
            </div>
            <h2 style={{ fontSize: '1.85rem', marginBottom: '0.35rem' }}>Welcome Back</h2>
            <p style={{ fontSize: '0.875rem' }}>Sign in to collaborate, find teams, or manage hackathons</p>
          </div>

          {error && (
            <div style={{
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              padding: '0.75rem 1rem',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.85rem',
              marginBottom: '1.5rem',
              display: 'flex',
              alignItems: 'center',
              gap: '0.5rem',
            }}>
              <ShieldAlert size={16} />
              <span>{error}</span>
            </div>
          )}

          {/* Quick Demo Persona Chips */}
          <div style={{
            backgroundColor: 'var(--color-bg-warm)',
            padding: '1rem',
            borderRadius: 'var(--radius-md)',
            marginBottom: '1.5rem',
            border: '1px solid var(--border-subtle)',
          }}>
            <div style={{ fontSize: '0.75rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', marginBottom: '0.5rem', textAlign: 'center' }}>
              Instant Evaluator 1-Click Login
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
              <button
                type="button"
                onClick={() => handleDemo('student')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.775rem' }}
              >
                🎓 Student
              </button>
              <button
                type="button"
                onClick={() => handleDemo('mentor')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.775rem' }}
              >
                👨‍🏫 Mentor
              </button>
              <button
                type="button"
                onClick={() => handleDemo('college')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.775rem' }}
              >
                🏛️ Organizer
              </button>
              <button
                type="button"
                onClick={() => handleDemo('admin')}
                className="btn btn-secondary btn-sm"
                style={{ fontSize: '0.775rem' }}
              >
                ⚙️ Admin
              </button>
            </div>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label className="form-label">Email Address</label>
              <div style={{ position: 'relative' }}>
                <input
                  type="email"
                  className="form-control"
                  placeholder="student@hackbridge.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Password</label>
              <input
                type="password"
                className="form-control"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <button
              type="submit"
              className="btn btn-primary"
              style={{ width: '100%', marginTop: '0.5rem' }}
              disabled={loading}
            >
              {loading ? 'Signing In...' : 'Sign In'}
            </button>
          </form>

          <div style={{ textAlign: 'center', marginTop: '1.5rem', fontSize: '0.85rem' }}>
            <span style={{ color: 'var(--text-muted)' }}>Don't have an account? </span>
            <Link to="/register" style={{ fontWeight: 600, color: 'var(--color-olive-800)' }}>
              Register Here
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
