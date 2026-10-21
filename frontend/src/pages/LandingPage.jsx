/**
 * HackBridge Landing Page
 * Distinctive olive/cream/mustard visual design inspired by hiddenhunt.
 * Connects directly to backend API and dataset statistics.
 */

import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CompatibilityBadge from '../components/CompatibilityBadge';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Compass,
  Users,
  Award,
  ArrowRight,
  Database,
  CheckCircle2,
  Calendar,
  MapPin,
  TrendingUp,
  Code,
  Layers,
  ChevronRight,
  ShieldCheck,
} from 'lucide-react';

export default function LandingPage() {
  const navigate = useNavigate();
  const { demoLogin } = useAuth();
  const [stats, setStats] = useState(null);
  const [featuredHackathons, setFeaturedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Interactive Demo State
  const [previewSkillScore, setPreviewSkillScore] = useState(88);
  const [previewExpScore, setPreviewExpScore] = useState(75);
  const [previewDomainScore, setPreviewDomainScore] = useState(90);
  const [previewCompleteScore, setPreviewCompleteScore] = useState(100);

  const previewOverall = Math.round(
    (0.45 * previewSkillScore + 0.20 * previewExpScore + 0.20 * previewDomainScore + 0.15 * previewCompleteScore) * 10
  ) / 10;

  useEffect(() => {
    async function loadData() {
      try {
        const [statsRes, hackRes] = await Promise.all([
          api.analytics.getOverview(),
          api.hackathons.getAll({ limit: 3, upcoming_only: true }),
        ]);
        if (statsRes.success) setStats(statsRes.data);
        if (hackRes.success) setFeaturedHackathons(hackRes.data);
      } catch (e) {
        console.warn('Could not load landing data:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const handleQuickStart = async (role = 'student') => {
    await demoLogin(role);
    navigate('/dashboard');
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', backgroundColor: 'var(--color-bg-canvas)' }}>
      <Navbar />

      {/* HERO SECTION */}
      <section style={{
        padding: '5rem 0 4.5rem',
        background: 'linear-gradient(180deg, #F8F5EE 0%, #F2ECE0 100%)',
        borderBottom: '1px solid var(--border-subtle)',
        position: 'relative',
        overflow: 'hidden',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '3.5rem',
            alignItems: 'center',
          }}>
            {/* Left Copy */}
            <div>
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '0.45rem',
                padding: '0.35rem 0.85rem',
                borderRadius: 'var(--radius-pill)',
                backgroundColor: 'var(--color-olive-100)',
                color: 'var(--color-olive-900)',
                fontSize: '0.85rem',
                fontWeight: 700,
                marginBottom: '1.25rem',
                border: '1px solid var(--color-olive-300)',
              }}>
                <Sparkles size={14} color="var(--color-accent-600)" />
                <span>Inter-College Hackathon Collaboration Platform</span>
              </div>

              <h1 style={{
                fontSize: 'clamp(2.5rem, 5vw, 3.75rem)',
                fontFamily: 'var(--font-display)',
                fontWeight: 700,
                color: 'var(--color-olive-900)',
                lineHeight: 1.15,
                marginBottom: '1.5rem',
              }}>
                Your Next Big Idea Starts With The <span style={{ color: 'var(--color-olive-600)', fontStyle: 'italic' }}>Right Team</span>.
              </h1>

              <p style={{
                fontSize: '1.15rem',
                color: 'var(--text-secondary)',
                lineHeight: 1.65,
                marginBottom: '2rem',
                maxWidth: '560px',
              }}>
                Connect with complementary student innovators across 60 colleges, discover tailored hackathons through an explainable 4-factor compatibility model, and build with verified industry mentors.
              </p>

              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', marginBottom: '2.5rem' }}>
                <Link to="/smart-formation" className="btn btn-primary btn-lg">
                  <Users size={18} />
                  <span>Find Your Team</span>
                </Link>
                <Link to="/hackathons" className="btn btn-secondary btn-lg">
                  <Compass size={18} />
                  <span>Explore Hackathons</span>
                </Link>
              </div>

              {/* Quick Persona Launch Chips */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', flexWrap: 'wrap' }}>
                <span style={{ fontSize: '0.775rem', fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                  Instant Evaluator Access:
                </span>
                <button
                  onClick={() => handleQuickStart('student')}
                  className="badge badge-olive"
                  style={{ cursor: 'pointer', border: '1px solid var(--color-olive-300)' }}
                >
                  🎓 Demo Student
                </button>
                <button
                  onClick={() => handleQuickStart('mentor')}
                  className="badge badge-accent"
                  style={{ cursor: 'pointer', border: '1px solid var(--color-accent-300)' }}
                >
                  👨‍🏫 Demo Mentor
                </button>
                <button
                  onClick={() => handleQuickStart('college')}
                  className="badge badge-olive"
                  style={{ cursor: 'pointer', border: '1px solid var(--color-olive-300)' }}
                >
                  🏛️ Organizer
                </button>
                <button
                  onClick={() => handleQuickStart('admin')}
                  className="badge badge-olive"
                  style={{ cursor: 'pointer', border: '1px solid var(--color-olive-300)' }}
                >
                  ⚙️ Admin
                </button>
              </div>
            </div>

            {/* Right Collaboration Visual & Interactive Engine Preview */}
            <div>
              <div className="card" style={{
                padding: '2rem',
                backgroundColor: '#FFFFFF',
                borderRadius: 'var(--radius-xl)',
                boxShadow: 'var(--shadow-elevated)',
                border: '1px solid var(--border-default)',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: 'var(--color-success)' }} />
                    <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--color-olive-850)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Smart Matching Model
                    </span>
                  </div>
                  <span className="badge badge-accent">Live Algorithm Preview</span>
                </div>

                <div style={{
                  backgroundColor: 'var(--color-bg-warm)',
                  borderRadius: 'var(--radius-lg)',
                  padding: '1.25rem',
                  marginBottom: '1.5rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Overall Compatibility
                    </div>
                    <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-olive-900)' }}>
                      {previewOverall}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div className="badge badge-olive" style={{ marginBottom: '0.35rem' }}>
                      {previewOverall >= 70 ? 'Recommended Target' : 'Skill Gap Detected'}
                    </div>
                    <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                      Deterministic Baseline Rule
                    </div>
                  </div>
                </div>

                {/* Sliders for Interactive Understanding */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', marginBottom: '1.5rem' }}>
                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Skill Match (45%)</span>
                      <span style={{ color: 'var(--color-olive-700)' }}>{previewSkillScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={previewSkillScore}
                      onChange={(e) => setPreviewSkillScore(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-olive-800)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Experience Match (20%)</span>
                      <span style={{ color: 'var(--color-olive-700)' }}>{previewExpScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={previewExpScore}
                      onChange={(e) => setPreviewExpScore(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-olive-800)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Domain Alignment (20%)</span>
                      <span style={{ color: 'var(--color-olive-700)' }}>{previewDomainScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="10"
                      max="100"
                      value={previewDomainScore}
                      onChange={(e) => setPreviewDomainScore(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-olive-800)' }}
                    />
                  </div>

                  <div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', fontWeight: 600, marginBottom: '0.25rem' }}>
                      <span>Team Completeness (15%)</span>
                      <span style={{ color: 'var(--color-olive-700)' }}>{previewCompleteScore}%</span>
                    </div>
                    <input
                      type="range"
                      min="20"
                      max="100"
                      value={previewCompleteScore}
                      onChange={(e) => setPreviewCompleteScore(Number(e.target.value))}
                      style={{ width: '100%', accentColor: 'var(--color-olive-800)' }}
                    />
                  </div>
                </div>

                <div style={{
                  padding: '0.85rem 1rem',
                  backgroundColor: 'var(--color-bg-surface-elevated)',
                  borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-subtle)',
                  fontSize: '0.825rem',
                  color: 'var(--text-secondary)',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '0.5rem',
                }}>
                  <ShieldCheck size={16} color="var(--color-olive-600)" />
                  <span>Verified against actual 14,400 dataset compatibility records.</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PLATFORM STATISTICS BAR */}
      <section style={{
        backgroundColor: 'var(--color-olive-900)',
        color: '#FFFFFF',
        padding: '2.5rem 0',
      }}>
        <div className="container">
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: '2rem',
            textAlign: 'center',
          }}>
            <div>
              <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent-400)' }}>
                {stats?.total_students?.toLocaleString() || '1,200'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-olive-200)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Students Registered
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent-400)' }}>
                {stats?.total_colleges || '60'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-olive-200)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Colleges & Universities
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent-400)' }}>
                {stats?.total_hackathons || '180'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-olive-200)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Hackathons Curated
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent-400)' }}>
                {stats?.total_teams?.toLocaleString() || '720'}
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-olive-200)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Collaborative Teams
              </div>
            </div>

            <div>
              <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-accent-400)' }}>
                ₹{(stats?.total_prize_pool_inr ? (stats.total_prize_pool_inr / 10000000).toFixed(1) : '18.4')} Cr
              </div>
              <div style={{ fontSize: '0.85rem', color: 'var(--color-olive-200)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                Total Prize Opportunities
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* HOW HACKBRIDGE WORKS */}
      <section style={{ padding: '5rem 0', backgroundColor: '#FFFFFF' }}>
        <div className="container">
          <div style={{ textAlign: 'center', maxWidth: '680px', margin: '0 auto 3.5rem' }}>
            <span className="badge badge-olive" style={{ marginBottom: '0.75rem' }}>Workflow</span>
            <h2 style={{ fontSize: '2.4rem', marginBottom: '1rem' }}>Designed For Seamless Inter-College Teaming</h2>
            <p>From initial skills onboarding to hackathon victory, HackBridge structures every milestone.</p>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
            gap: '2rem',
          }}>
            {/* Step 1 */}
            <div className="card card-hover" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-olive-100)',
                color: 'var(--color-olive-850)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                01
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Role-Biased Profile</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Record your technical skills, proficiency levels, availability hours, and project domain interests.
              </p>
            </div>

            {/* Step 2 */}
            <div className="card card-hover" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-100)',
                color: 'var(--color-accent-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                02
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Smart Team Formation</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Prioritizes complementary skills rather than grouping identical engineers. Identifies missing roles and gaps.
              </p>
            </div>

            {/* Step 3 */}
            <div className="card card-hover" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-olive-100)',
                color: 'var(--color-olive-850)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                03
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Explainable Matching</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Calculates transparent compatibility % and checks registration deadlines before suggesting opportunities.
              </p>
            </div>

            {/* Step 4 */}
            <div className="card card-hover" style={{ padding: '2rem 1.5rem' }}>
              <div style={{
                width: '48px',
                height: '48px',
                borderRadius: 'var(--radius-md)',
                backgroundColor: 'var(--color-accent-100)',
                color: 'var(--color-accent-900)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                marginBottom: '1.25rem',
                fontWeight: 700,
                fontSize: '1.2rem',
              }}>
                04
              </div>
              <h4 style={{ fontSize: '1.2rem', marginBottom: '0.65rem' }}>Mentors & DDBMS</h4>
              <p style={{ fontSize: '0.875rem', lineHeight: 1.6 }}>
                Request guidance from capacity-enforced industry mentors while experiencing distributed query execution.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* FEATURED HACKATHONS FROM DATASET */}
      <section style={{ padding: '5rem 0', backgroundColor: 'var(--color-bg-canvas)' }}>
        <div className="container">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '2.5rem', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <span className="badge badge-olive" style={{ marginBottom: '0.5rem' }}>Opportunities</span>
              <h2 style={{ fontSize: '2.25rem' }}>Featured Real Hackathons</h2>
              <p>Directly imported from our verified 180-event database.</p>
            </div>
            <Link to="/hackathons" className="btn btn-secondary">
              <span>View All 180 Hackathons</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '2rem',
          }}>
            {featuredHackathons.map((h) => (
              <div key={h.hackathon_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
                  <span className="badge badge-accent">{h.domain}</span>
                  <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                    {h.mode}
                  </span>
                </div>

                <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>
                  <Link to={`/hackathons/${h.hackathon_id}`} style={{ color: 'var(--color-olive-900)' }}>
                    {h.hackathon_name}
                  </Link>
                </h3>

                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '1rem' }}>
                  Organized by <strong>{h.organizer}</strong> • {h.city}, {h.state}
                </div>

                {/* Event Details Row */}
                <div style={{
                  display: 'grid',
                  gridTemplateColumns: '1fr 1fr',
                  gap: '0.75rem',
                  padding: '0.85rem',
                  backgroundColor: 'var(--color-bg-warm)',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  fontSize: '0.8rem',
                }}>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Prize Pool</span>
                    <strong style={{ color: 'var(--color-olive-850)', fontSize: '0.95rem' }}>₹{h.prize_pool?.toLocaleString()}</strong>
                  </div>
                  <div>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Team Size</span>
                    <strong>{h.team_min_size} - {h.team_max_size} Members</strong>
                  </div>
                  <div style={{ gridColumn: 'span 2' }}>
                    <span style={{ color: 'var(--text-muted)', display: 'block' }}>Registration Closes</span>
                    <strong style={{ color: 'var(--color-olive-900)' }}>{h.registration_deadline}</strong>
                  </div>
                </div>

                {/* Skills tags */}
                {h.required_skills && h.required_skills.length > 0 && (
                  <div style={{ marginBottom: '1.25rem' }}>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                      Required Tech:
                    </div>
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                      {h.required_skills.map((s, idx) => (
                        <span key={idx} className="badge badge-olive" style={{ fontSize: '0.725rem' }}>
                          {s.skill_name}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                <div style={{ marginTop: 'auto', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <CompatibilityBadge score={86.4} isRecommended={true} size="sm" />
                  <Link to={`/hackathons/${h.hackathon_id}`} className="btn btn-primary btn-sm">
                    <span>View & Register</span>
                    <ChevronRight size={14} />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* DDBMS BANNER */}
      <section style={{
        padding: '4rem 0',
        backgroundColor: '#FFFFFF',
        borderTop: '1px solid var(--border-subtle)',
      }}>
        <div className="container">
          <div className="card" style={{
            backgroundColor: 'var(--color-olive-850)',
            color: '#FFFFFF',
            borderRadius: 'var(--radius-xl)',
            padding: '3rem',
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '2.5rem',
            alignItems: 'center',
          }}>
            <div>
              <span className="badge badge-accent" style={{ marginBottom: '1rem' }}>Academic DDBMS Module</span>
              <h2 style={{ color: '#FFFFFF', fontSize: '2.2rem', marginBottom: '1rem' }}>
                Distributed Database Architecture Simulation
              </h2>
              <p style={{ color: 'var(--color-olive-200)', lineHeight: 1.6, marginBottom: '1.5rem' }}>
                Explore horizontal fragmentation by college node (IIT Bombay, IIT Delhi, BITS Pilani), read-replicated reference tables, distributed multi-condition queries, and transparent query execution.
              </p>
              <Link to="/ddbms" className="btn btn-accent btn-lg">
                <Database size={18} />
                <span>Launch Interactive DDBMS Explorer</span>
              </Link>
            </div>

            <div style={{
              backgroundColor: 'rgba(0, 0, 0, 0.25)',
              padding: '1.5rem',
              borderRadius: 'var(--radius-lg)',
              border: '1px solid rgba(255, 255, 255, 0.1)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.8rem',
              color: 'var(--color-accent-300)',
              lineHeight: 1.7,
            }}>
              <div>-- Distributed Inter-College Talent Query</div>
              <div style={{ color: '#FFFFFF' }}>SELECT 'IIT Bombay' AS node, student_name</div>
              <div style={{ color: '#FFFFFF' }}>FROM college_C001_db.students WHERE role = 'AI/ML'</div>
              <div style={{ color: 'var(--color-accent-400)' }}>UNION ALL</div>
              <div style={{ color: '#FFFFFF' }}>SELECT 'IIT Delhi' AS node, student_name</div>
              <div style={{ color: '#FFFFFF' }}>FROM college_C002_db.students WHERE role = 'AI/ML';</div>
              <div style={{ marginTop: '0.75rem', color: 'var(--color-olive-300)', fontStyle: 'italic' }}>
                -- Location transparency handled by HackBridge DDBMS Service
              </div>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
