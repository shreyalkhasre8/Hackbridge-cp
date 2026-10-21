import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Heart } from 'lucide-react';

export default function Footer() {
  return (
    <footer style={{
      backgroundColor: 'var(--color-olive-900)',
      color: 'var(--color-olive-200)',
      padding: '4rem 0 2.5rem',
      marginTop: 'auto',
      borderTop: '1px solid rgba(255, 255, 255, 0.08)',
    }}>
      <div className="container">
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '3rem',
          marginBottom: '3rem',
        }}>
          {/* Brand Info */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.65rem', marginBottom: '1rem' }}>
              <div style={{
                width: '32px',
                height: '32px',
                borderRadius: 'var(--radius-sm)',
                backgroundColor: 'var(--color-olive-700)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}>
                <Sparkles size={16} color="var(--color-accent-400)" />
              </div>
              <span style={{ fontFamily: 'var(--font-display)', fontSize: '1.35rem', fontWeight: 700, color: '#FFFFFF' }}>
                Hack<span style={{ color: 'var(--color-accent-400)' }}>Bridge</span>
              </span>
            </div>
            <p style={{ fontSize: '0.875rem', color: 'var(--color-olive-300)', lineHeight: 1.6 }}>
              Intelligent Inter-College Hackathon Collaboration Platform. Connecting student innovators across colleges with smart team formation, explainable recommendations, and distributed architecture.
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>
              Platform Modules
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem' }}>
              <li><Link to="/hackathons" style={{ color: 'var(--color-olive-200)' }}>Explore Hackathons</Link></li>
              <li><Link to="/teams" style={{ color: 'var(--color-olive-200)' }}>Find Teammates</Link></li>
              <li><Link to="/smart-formation" style={{ color: 'var(--color-olive-200)' }}>Smart Team Formation</Link></li>
              <li><Link to="/mentors" style={{ color: 'var(--color-olive-200)' }}>Find Industry Mentors</Link></li>
              <li><Link to="/ddbms" style={{ color: 'var(--color-olive-200)' }}>DDBMS Distributed Architecture</Link></li>
            </ul>
          </div>

          {/* Academic & Dataset Attribution */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>
              Dataset & Integrity
            </h5>
            <ul style={{ listStyle: 'none', display: 'flex', flexDirection: 'column', gap: '0.6rem', fontSize: '0.875rem', color: 'var(--color-olive-300)' }}>
              <li>• 1,200 Synthetic Student Profiles</li>
              <li>• 60 Inter-State College Nodes</li>
              <li>• 180 Real Hackathon Specifications</li>
              <li>• 720 Multi-College Rosters</li>
              <li>• 14,400 Compatibility Records</li>
              <li>• DDBMS 3-Node Horizontal Fragmentation</li>
            </ul>
          </div>

          {/* Demo Personas */}
          <div>
            <h5 style={{ color: '#FFFFFF', fontSize: '0.95rem', fontWeight: 700, marginBottom: '1rem', fontFamily: 'var(--font-sans)' }}>
              Demo Evaluator Credentials
            </h5>
            <div style={{ fontSize: '0.825rem', color: 'var(--color-olive-300)', lineHeight: 1.6 }}>
              <div style={{ marginBottom: '0.35rem' }}>Password: <code style={{ color: 'var(--color-accent-400)', background: 'rgba(0,0,0,0.3)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>Demo@123</code></div>
              <div>• student@hackbridge.edu</div>
              <div>• mentor@hackbridge.edu</div>
              <div>• organizer@hackbridge.edu</div>
              <div>• admin@hackbridge.edu</div>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div style={{
          borderTop: '1px solid rgba(255, 255, 255, 0.08)',
          paddingTop: '1.5rem',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '1rem',
          fontSize: '0.825rem',
          color: 'var(--color-olive-400)',
        }}>
          <div>
            © {new Date().getFullYear()} HackBridge — Intelligent Inter-College Collaboration System. Built with love for student innovators.
          </div>
          <div style={{ display: 'flex', gap: '1.5rem' }}>
            <span>Privacy Policy</span>
            <span>Academic Guidelines</span>
            <span>Security</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
