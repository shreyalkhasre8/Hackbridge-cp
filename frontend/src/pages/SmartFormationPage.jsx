/**
 * HackBridge Smart Team Formation — "I Don't Have A Team" Pool
 * Automatically groups students with complementary skill profiles and recommends forming teams.
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Sparkles,
  Users,
  CheckCircle2,
  AlertCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  Zap,
  Layers,
  ChevronRight,
} from 'lucide-react';

export default function SmartFormationPage() {
  const { user, addToast } = useAuth();
  const [inPool, setInPool] = useState(false);
  const [poolEntry, setPoolEntry] = useState(null);
  const [recommendations, setRecommendations] = useState([]);
  const [hackathonsList, setHackathonsList] = useState([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [preferredRole, setPreferredRole] = useState('Frontend Developer');
  const [targetHackathonId, setTargetHackathonId] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState(15);
  const [interests, setInterests] = useState('AI Ethics, Distributed Systems, FinTech UI');
  const [joining, setJoining] = useState(false);

  const studentId = user?.profile_id || 'STU0001';

  const checkStatus = async () => {
    try {
      const [statusRes, hackRes] = await Promise.all([
        api.matchingPool.getStatus(studentId),
        api.hackathons.getAll({ limit: 50, upcoming_only: true }),
      ]);

      if (statusRes.success) {
        setInPool(statusRes.data.in_pool);
        setPoolEntry(statusRes.data.entry);
        setRecommendations(statusRes.data.recommended_teams || []);
      }

      if (hackRes.success && hackRes.data.length > 0) {
        setHackathonsList(hackRes.data);
        if (!targetHackathonId) setTargetHackathonId(hackRes.data[0].hackathon_id);
      }
    } catch (e) {
      console.warn('Matching pool status error:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    checkStatus();
  }, [user]);

  const handleJoinPool = async (e) => {
    e.preventDefault();
    setJoining(true);
    try {
      const res = await api.matchingPool.join({
        student_id: studentId,
        hackathon_id: targetHackathonId,
        preferred_role: preferredRole,
        availability_hours: availabilityHours,
        interests,
      });
      if (res.success) {
        addToast('Registered in complementary smart matching pool!', 'success');
        setInPool(true);
        setPoolEntry(res.data.pool_entry);
        setRecommendations(res.data.recommendations || []);
      }
    } catch (err) {
      addToast(err.message || 'Error joining pool', 'danger');
    } finally {
      setJoining(false);
    }
  };

  const handleLeavePool = async () => {
    try {
      const res = await api.matchingPool.leave(studentId);
      if (res.success) {
        addToast('Removed from team matching pool', 'info');
        setInPool(false);
        setPoolEntry(null);
      }
    } catch (err) {
      addToast('Error leaving pool', 'danger');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-accent">Complementary Teaming Algorithm</span>
          <span className="badge badge-olive">Multi-College Collaboration</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Smart Team Formation Engine</h2>
        <p style={{ fontSize: '0.95rem', maxWidth: '720px' }}>
          Don't have a team yet? Enter the intelligent matching pool. Our engine groups complementary skill sets (e.g. Pairing AI engineers with UI designers and backend architects) rather than stacking duplicate abilities.
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))',
        gap: '2rem',
        marginBottom: '2.5rem',
      }}>
        {/* Left Column: Pool Registration Form */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>"I Don't Have A Team"</h3>
            <span className={`badge ${inPool ? 'badge-success' : 'badge-olive'}`}>
              {inPool ? 'Active In Pool' : 'Not Registered'}
            </span>
          </div>

          {inPool ? (
            <div>
              <div style={{
                backgroundColor: 'var(--color-bg-warm)',
                padding: '1.25rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1.5rem',
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--color-success)', fontWeight: 700, marginBottom: '0.5rem' }}>
                  <CheckCircle2 size={18} />
                  <span>Actively Matching Across Colleges</span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
                  Role: <strong>{poolEntry?.preferred_role}</strong><br />
                  Target Event: <strong>{hackathonsList.find(h => h.hackathon_id === poolEntry?.hackathon_id)?.hackathon_name || 'Open Target'}</strong><br />
                  Weekly Commitment: <strong>{poolEntry?.availability_hours} hrs/week</strong>
                </div>
              </div>

              <button className="btn btn-secondary" onClick={handleLeavePool} style={{ width: '100%' }}>
                Withdraw From Matching Pool
              </button>
            </div>
          ) : (
            <form onSubmit={handleJoinPool}>
              <div className="form-group">
                <label className="form-label">Preferred Team Contribution Role</label>
                <select
                  className="form-select"
                  value={preferredRole}
                  onChange={(e) => setPreferredRole(e.target.value)}
                >
                  <option value="Frontend Developer">Frontend Developer</option>
                  <option value="Backend Developer">Backend Developer</option>
                  <option value="AI/ML Engineer">AI/ML Engineer</option>
                  <option value="UI/UX Designer">UI/UX Designer</option>
                  <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Target Hackathon</label>
                <select
                  className="form-select"
                  value={targetHackathonId}
                  onChange={(e) => setTargetHackathonId(e.target.value)}
                >
                  {hackathonsList.map(h => (
                    <option key={h.hackathon_id} value={h.hackathon_id}>
                      {h.hackathon_name} ({h.domain} • Deadline: {h.registration_deadline})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Weekly Availability: {availabilityHours} hours/week</label>
                <input
                  type="range"
                  min="5"
                  max="35"
                  step="5"
                  value={availabilityHours}
                  onChange={(e) => setAvailabilityHours(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--color-olive-850)' }}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Innovation Interests & Topics</label>
                <textarea
                  className="form-textarea"
                  rows={2}
                  value={interests}
                  onChange={(e) => setInterests(e.target.value)}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary btn-lg"
                style={{ width: '100%', marginTop: '0.5rem' }}
                disabled={joining}
              >
                <Sparkles size={16} />
                <span>{joining ? 'Matching...' : 'Enter Matching Pool'}</span>
              </button>
            </form>
          )}
        </div>

        {/* Right Column: Complementary Forming Teams */}
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>Matched Forming Teams</h3>
            <span className="badge badge-accent">Complementary Fit</span>
          </div>

          {recommendations.length === 0 ? (
            <div className="card" style={{ textAlign: 'center', padding: '2.5rem 1rem' }}>
              <Users size={36} color="var(--color-olive-400)" style={{ marginBottom: '0.75rem' }} />
              <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                Register on the left to activate algorithmic team pairing across active rosters.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recommendations.map((team) => (
                <div key={team.team_id} className="card card-hover" style={{ padding: '1.25rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                    <strong style={{ fontSize: '1.1rem', color: 'var(--color-olive-900)' }}>
                      {team.team_name}
                    </strong>
                    <span className="badge badge-olive">{team.fit_score}% Complementary Fit</span>
                  </div>

                  <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.5rem' }}>
                    Event: <strong>{team.hackathon_name}</strong> • Current Roster: {team.current_size} Members
                  </div>

                  {team.missing_roles && team.missing_roles.length > 0 && (
                    <div style={{ display: 'flex', gap: '0.3rem', flexWrap: 'wrap', marginBottom: '0.75rem' }}>
                      <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Needs:</span>
                      {team.missing_roles.map((r, idx) => (
                        <span key={idx} className="badge badge-warning" style={{ fontSize: '0.7rem' }}>
                          {r}
                        </span>
                      ))}
                    </div>
                  )}

                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingTop: '0.5rem', borderTop: '1px solid var(--border-subtle)' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-700)' }}>
                      {team.reasons?.[0]}
                    </span>
                    <Link to={`/teams/${team.team_id}`} className="btn btn-secondary btn-sm">
                      <span>Apply</span>
                      <ChevronRight size={14} />
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
