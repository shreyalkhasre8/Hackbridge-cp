/**
 * HackBridge Hackathon Detail Page
 * Complete event breakdown, eligibility engine, announcements, and team registration.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CompatibilityBadge from '../components/CompatibilityBadge';
import CompatibilityModal from '../components/CompatibilityModal';
import {
  Compass,
  Calendar,
  Users,
  MapPin,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Megaphone,
  Layers,
  ArrowLeft,
  Send,
} from 'lucide-react';

export default function HackathonDetailPage() {
  const { id } = useParams();
  const { user, addToast } = useAuth();
  const [hackathon, setHackathon] = useState(null);
  const [loading, setLoading] = useState(true);
  const [compatData, setCompatData] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [isCompatModalOpen, setIsCompatModalOpen] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.hackathons.getById(id);
        if (res.success) setHackathon(res.data);

        // Fetch user's student teams if student
        const stuId = user?.profile_id || 'STU0001';
        const stuRes = await api.students.getById(stuId);
        if (stuRes.success && stuRes.data.teams) {
          setUserTeams(stuRes.data.teams);
          if (stuRes.data.teams.length > 0) {
            setSelectedTeamId(stuRes.data.teams[0].team_id);
          }
        }
      } catch (e) {
        console.warn('Error loading hackathon details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id, user]);

  // Compute compatibility when selected team changes
  useEffect(() => {
    if (id && selectedTeamId) {
      api.hackathons.getCompatibility(id, selectedTeamId)
        .then(res => {
          if (res.success) setCompatData(res.data);
        })
        .catch(() => {});
    }
  }, [id, selectedTeamId]);

  const handleRegisterTeam = async () => {
    if (!selectedTeamId) {
      addToast('Please select or create a team first', 'warning');
      return;
    }
    setIsRegistering(true);
    try {
      const res = await api.hackathons.apply(id, {
        team_id: selectedTeamId,
        project_title: `${hackathon.hackathon_name} Innovation Project`,
      });
      if (res.success) {
        addToast('Team successfully registered for the hackathon!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Registration failed. Check eligibility rules.', 'danger');
    } finally {
      setIsRegistering(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '400px' }} />
      </div>
    );
  }

  if (!hackathon) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Hackathon Not Found</h2>
        <Link to="/hackathons" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Hackathons
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      {/* Back button */}
      <Link to="/hackathons" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-olive-700)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to Hackathon Discovery</span>
      </Link>

      {/* Hero Header Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-accent">{hackathon.domain}</span>
              <span className="badge badge-olive">{hackathon.mode} Mode</span>
              <span className="badge badge-olive">{hackathon.difficulty_level} Difficulty</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{hackathon.hackathon_name}</h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Organized by <strong>{hackathon.organizer}</strong> • {hackathon.city}, {hackathon.state}
            </p>
          </div>

          <div style={{ textAlign: 'right' }}>
            <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
              Total Prize Pool
            </div>
            <div style={{ fontSize: '2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-olive-900)' }}>
              ₹{hackathon.prize_pool?.toLocaleString()}
            </div>
          </div>
        </div>

        {/* Quick Facts Grid */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          padding: '1.25rem',
          backgroundColor: 'var(--color-bg-warm)',
          borderRadius: 'var(--radius-lg)',
          marginTop: '1.5rem',
        }}>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Registration Deadline</span>
            <strong style={{ fontSize: '0.95rem', color: hackathon.is_open ? 'var(--color-olive-900)' : 'var(--color-danger)' }}>
              {hackathon.registration_deadline} {hackathon.is_open ? '(Open)' : '(Closed)'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Event Schedule</span>
            <strong style={{ fontSize: '0.95rem' }}>{hackathon.start_date} to {hackathon.end_date}</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Permitted Team Size</span>
            <strong style={{ fontSize: '0.95rem' }}>{hackathon.team_min_size} - {hackathon.team_max_size} Members</strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Experience Expectation</span>
            <strong style={{ fontSize: '0.95rem' }}>{hackathon.experience_required}</strong>
          </div>
        </div>
      </div>

      {/* Main Grid: Eligibility & Compatibility (Left) + Required Skills & Announcements (Right) */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        marginBottom: '2rem',
      }}>
        {/* Left Column: Explainable Compatibility & Registration */}
        <div>
          <div className="card" style={{ marginBottom: '2rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
              <h3 style={{ fontSize: '1.35rem' }}>Eligibility & Compatibility</h3>
              <span className="badge badge-olive">Deterministic Rule</span>
            </div>

            {/* Team Selector */}
            <div className="form-group">
              <label className="form-label">Evaluate With Team Roster:</label>
              {userTeams.length > 0 ? (
                <select
                  className="form-select"
                  value={selectedTeamId}
                  onChange={(e) => setSelectedTeamId(e.target.value)}
                >
                  {userTeams.map(t => (
                    <option key={t.team_id} value={t.team_id}>
                      {t.team_name} ({t.team_size} members)
                    </option>
                  ))}
                </select>
              ) : (
                <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', padding: '0.5rem 0' }}>
                  No active team rosters found. <Link to="/teams" style={{ fontWeight: 600 }}>Create a team</Link> or evaluate using standard baseline.
                </div>
              )}
            </div>

            {/* Compatibility Result Preview */}
            {compatData && (
              <div>
                <div style={{
                  backgroundColor: 'var(--color-bg-warm)',
                  padding: '1.25rem',
                  borderRadius: 'var(--radius-md)',
                  marginBottom: '1.25rem',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <div>
                    <div style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                      Overall Team Match
                    </div>
                    <div style={{ fontSize: '2.25rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-olive-900)' }}>
                      {compatData.overall_compatibility_score}%
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '0.35rem',
                      fontWeight: 600,
                      fontSize: '0.85rem',
                      color: compatData.is_eligible ? 'var(--color-success)' : 'var(--color-danger)',
                      marginBottom: '0.25rem',
                    }}>
                      {compatData.is_eligible ? <CheckCircle2 size={16} /> : <AlertTriangle size={16} />}
                      <span>{compatData.is_eligible ? 'Eligible' : 'Ineligible'}</span>
                    </div>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => setIsCompatModalOpen(true)}
                      style={{ fontSize: '0.75rem', textDecoration: 'underline' }}
                    >
                      View Formula Factors
                    </button>
                  </div>
                </div>

                {/* Eligibility Explanations */}
                <div style={{ marginBottom: '1.5rem', fontSize: '0.825rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.4rem', color: 'var(--text-primary)' }}>
                    Suitability Analysis:
                  </div>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                    {compatData.explanations.map((exp, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{exp}</li>
                    ))}
                  </ul>
                </div>

                {/* Registration Action Button */}
                <button
                  className="btn btn-primary btn-lg"
                  style={{ width: '100%' }}
                  onClick={handleRegisterTeam}
                  disabled={!compatData.is_eligible || isRegistering}
                >
                  <Send size={16} />
                  <span>{isRegistering ? 'Registering Team...' : 'Submit Team Application'}</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Required Skills & Official Announcements */}
        <div>
          {/* Required Skills Card */}
          <div className="card" style={{ marginBottom: '2rem' }}>
            <h3 style={{ fontSize: '1.25rem', marginBottom: '1rem' }}>Required Skill Profiles</h3>
            <p style={{ fontSize: '0.85rem', marginBottom: '1.25rem' }}>
              Skills expected by event organizers with normalized importance weights.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {hackathon.required_skills?.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '0.65rem 0.85rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-warm)',
                    fontSize: '0.85rem',
                  }}
                >
                  <span style={{ fontWeight: 600, color: 'var(--color-olive-900)' }}>{s.skill_name}</span>
                  <span className="badge badge-olive">Importance: {s.importance_weight}x</span>
                </div>
              ))}
            </div>
          </div>

          {/* Announcements Card */}
          <div className="card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Megaphone size={18} color="var(--color-accent-700)" />
                <h3 style={{ fontSize: '1.25rem' }}>Announcements</h3>
              </div>
              <span className="badge badge-accent">{hackathon.announcements?.length || 0} Posts</span>
            </div>

            {hackathon.announcements && hackathon.announcements.length > 0 ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {hackathon.announcements.map((ann) => (
                  <div
                    key={ann.id}
                    style={{
                      padding: '1rem',
                      borderRadius: 'var(--radius-md)',
                      backgroundColor: 'var(--color-bg-surface-elevated)',
                      border: '1px solid var(--border-subtle)',
                    }}
                  >
                    <div style={{ fontWeight: 700, fontSize: '0.925rem', marginBottom: '0.35rem', color: 'var(--color-olive-900)' }}>
                      {ann.title}
                    </div>
                    <p style={{ fontSize: '0.825rem', lineHeight: 1.5, marginBottom: '0.5rem' }}>
                      {ann.content}
                    </p>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)' }}>
                      By {ann.author} • {new Date(ann.created_at).toLocaleDateString()}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: 'center', padding: '1.5rem', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                No announcements published for this hackathon yet.
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Compatibility Modal */}
      <CompatibilityModal
        isOpen={isCompatModalOpen}
        onClose={() => setIsCompatModalOpen(false)}
        data={compatData}
        hackathonName={hackathon.hackathon_name}
        teamName={userTeams.find(t => t.team_id === selectedTeamId)?.team_name}
      />
    </div>
  );
}
