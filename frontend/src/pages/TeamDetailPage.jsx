/**
 * HackBridge Team Detail Page
 * Complete roster management, completeness analysis, applicant approval, and teammate recommendations.
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Award,
  Sparkles,
  ArrowLeft,
  Check,
  X,
  UserPlus,
  ShieldCheck,
  Zap,
  CheckCircle2,
  Clock,
  Layers,
} from 'lucide-react';

export default function TeamDetailPage() {
  const { id } = useParams();
  const { user, addToast } = useAuth();
  const [team, setTeam] = useState(null);
  const [completeness, setCompleteness] = useState(null);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applyMessage, setApplyMessage] = useState('Hi! I have relevant skills and would love to collaborate.');
  const [isApplying, setIsApplying] = useState(false);

  const fetchTeamDetails = async () => {
    try {
      const [teamRes, compRes, candRes] = await Promise.all([
        api.teams.getById(id),
        api.teams.getCompleteness(id),
        api.teams.getRecommendedTeammates(id, 6),
      ]);

      if (teamRes.success) setTeam(teamRes.data);
      if (compRes.success) setCompleteness(compRes.data);
      if (candRes.success) setRecommendedCandidates(candRes.data || []);
    } catch (e) {
      console.warn('Error fetching team details:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeamDetails();
  }, [id]);

  const handleApply = async () => {
    setIsApplying(true);
    try {
      const res = await api.teams.apply(id, {
        student_id: user?.profile_id || 'STU0001',
        message: applyMessage,
      });
      if (res.success) {
        addToast('Application submitted to team leader!', 'success');
        fetchTeamDetails();
      }
    } catch (err) {
      addToast(err.message || 'Error submitting application', 'danger');
    } finally {
      setIsApplying(false);
    }
  };

  const handleDecision = async (appId, decision) => {
    try {
      const res = await api.teams.decideApplication(id, appId, decision);
      if (res.success) {
        addToast(`Application ${decision}!`, 'success');
        fetchTeamDetails();
      }
    } catch (err) {
      addToast(err.message || 'Error updating application status', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '380px' }} />
      </div>
    );
  }

  if (!team) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Team Not Found</h2>
        <Link to="/teams" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Teams
        </Link>
      </div>
    );
  }

  const isLeader = user?.profile_id === team.leader_student_id || user?.role === 'admin';
  const isMember = team.members?.some(m => m.student_id === user?.profile_id);

  return (
    <div className="page-container">
      <Link to="/teams" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-olive-700)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to All Teams</span>
      </Link>

      {/* Team Header Card */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.4rem' }}>
              <span className="badge badge-olive">{team.team_status}</span>
              <span className="badge badge-accent">{team.team_size} Members</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{team.team_name}</h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              Targeting: <strong>{team.hackathon?.hackathon_name || 'Hackathon Event'}</strong> ({team.hackathon?.domain})
            </p>
          </div>

          <div style={{ display: 'flex', gap: '0.75rem', alignItems: 'center' }}>
            <Link to={`/hackathons/${team.hackathon_id}`} className="btn btn-secondary">
              View Event Details
            </Link>
            {!isMember && (
              <button className="btn btn-primary" onClick={handleApply} disabled={isApplying}>
                <UserPlus size={16} />
                <span>{isApplying ? 'Applying...' : 'Apply to Join'}</span>
              </button>
            )}
          </div>
        </div>

        {/* Completeness Highlights */}
        {completeness && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
            gap: '1rem',
            padding: '1.25rem',
            backgroundColor: 'var(--color-bg-warm)',
            borderRadius: 'var(--radius-lg)',
          }}>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Roster Completeness</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-olive-900)' }}>{completeness.completeness_score}%</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Required Skill Coverage</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-olive-900)' }}>{completeness.skill_coverage_percentage}%</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Role Diversity</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-olive-900)' }}>{completeness.role_diversity_percentage}%</strong>
            </div>
            <div>
              <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Roster Target Bounds</span>
              <strong style={{ fontSize: '1.2rem', color: 'var(--color-olive-900)' }}>{completeness.target_min_size} - {completeness.target_max_size} Members</strong>
            </div>
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Active Members Roster */}
        <div className="card">
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Active Team Members</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {team.members?.map((m, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '0.85rem 1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-warm)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem', color: 'var(--color-olive-900)' }}>
                    {m.student_name}
                  </div>
                  <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                    {m.assigned_role} • {m.college_name || 'College Node'}
                  </div>
                </div>
                <span className="badge badge-olive">{m.join_status}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Missing Roles & Candidate Recommendations */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>Missing Roles & Skills</h3>
            <span className="badge badge-accent">Smart Detection</span>
          </div>

          {completeness?.missing_roles && completeness.missing_roles.length > 0 && (
            <div style={{ marginBottom: '1.25rem' }}>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                Positions Still Needed:
              </div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.35rem' }}>
                {completeness.missing_roles.map((r, idx) => (
                  <span key={idx} className="badge badge-warning">
                    {r}
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Recommended Teammates */}
          <div>
            <div style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text-primary)', marginBottom: '0.75rem' }}>
              Complementary Candidates from Inter-College Pool:
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {recommendedCandidates.slice(0, 4).map((c) => (
                <div
                  key={c.student_id}
                  style={{
                    padding: '0.75rem',
                    borderRadius: 'var(--radius-md)',
                    backgroundColor: 'var(--color-bg-surface-elevated)',
                    border: '1px solid var(--border-subtle)',
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                    <strong style={{ fontSize: '0.875rem' }}>{c.student_name}</strong>
                    <span className="badge badge-olive">{c.match_score}% Fit</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginBottom: '0.35rem' }}>
                    {c.primary_role} • {c.college_name}
                  </div>
                  {c.reasons && (
                    <div style={{ fontSize: '0.725rem', color: 'var(--color-olive-700)' }}>
                      • {c.reasons[0]}
                    </div>
                  )}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Pending Join Applications (For Leader) */}
      {isLeader && team.applications && team.applications.length > 0 && (
        <div className="card" style={{ marginBottom: '2rem' }}>
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Pending Join Applications</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {team.applications.map((app) => (
              <div
                key={app.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem',
                  borderRadius: 'var(--radius-md)',
                  backgroundColor: 'var(--color-bg-warm)',
                }}
              >
                <div>
                  <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>{app.student_name}</div>
                  <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    "{app.message}"
                  </div>
                </div>

                {app.status === 'pending' ? (
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleDecision(app.id, 'accepted')}
                    >
                      <Check size={14} />
                      <span>Accept</span>
                    </button>
                    <button
                      className="btn btn-secondary btn-sm"
                      onClick={() => handleDecision(app.id, 'rejected')}
                    >
                      <X size={14} />
                      <span>Decline</span>
                    </button>
                  </div>
                ) : (
                  <span className={`badge ${app.status === 'accepted' ? 'badge-success' : 'badge-danger'}`}>
                    {app.status}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
