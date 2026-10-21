/**
 * HackBridge Mentor Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Users,
  Check,
  X,
  Star,
  Clock,
  Briefcase,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export default function MentorDashboard() {
  const { user, addToast } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchMentorData = async () => {
    try {
      const mentorId = user?.profile_id || 'MEN001';
      const res = await api.mentors.getById(mentorId);
      if (res.success) {
        setMentor(res.data);
      }
    } catch (e) {
      console.warn('Error fetching mentor data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentorData();
  }, [user]);

  const handleDecision = async (requestId, decision) => {
    try {
      const res = await api.mentors.decideRequest(requestId, decision);
      if (res.success) {
        addToast(`Mentorship request ${decision}!`, 'success');
        fetchMentorData();
      }
    } catch (err) {
      addToast(err.message || 'Error processing request', 'danger');
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  const assignedTeams = mentor?.assigned_teams || [];
  const pendingRequests = mentor?.pending_requests || [];
  const maxTeams = mentor?.max_teams || 3;
  const currentTeams = assignedTeams.length;
  const isFull = currentTeams >= maxTeams;

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">Mentor Portal</span>
          <span className="badge badge-accent">{mentor?.specialization}</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Welcome, {mentor?.mentor_name}!</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Manage your assigned student hackathon rosters and incoming mentorship inquiries.
        </p>
      </div>

      {/* KPI & Capacity Row */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Mentor Profile Overview */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1.15rem' }}>Expertise Overview</h4>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', color: '#C2840D', fontWeight: 700 }}>
              <Star size={16} fill="#C2840D" />
              <span>{mentor?.rating?.toFixed(1)} / 5.0</span>
            </div>
          </div>
          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', lineHeight: 1.6 }}>
            Industry: <strong>{mentor?.industry}</strong><br />
            Experience: <strong>{mentor?.years_of_experience} Years</strong><br />
            Track: <strong>{mentor?.specialization}</strong>
          </div>
        </div>

        {/* Capacity Enforcer */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
            <h4 style={{ fontSize: '1.15rem' }}>Capacity Allocation</h4>
            <span className={`badge ${isFull ? 'badge-danger' : 'badge-success'}`}>
              {isFull ? 'Capacity Full' : 'Available for Teams'}
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '0.75rem' }}>
            <div style={{
              width: `${(currentTeams / maxTeams) * 100}%`,
              height: '100%',
              background: isFull ? 'var(--color-danger)' : 'var(--color-olive-700)',
              borderRadius: 'var(--radius-pill)',
            }} />
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
            <span>Allocated: <strong>{currentTeams} Teams</strong></span>
            <span>Max Limit: <strong>{maxTeams} Teams</strong></span>
          </div>
        </div>
      </div>

      {/* Incoming Mentorship Requests */}
      <div className="card" style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
          Incoming Mentorship Requests ({pendingRequests.length})
        </h3>

        {pendingRequests.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No pending mentorship requests at this time.
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {pendingRequests.map((req) => (
              <div
                key={req.id}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  padding: '1rem 1.25rem',
                  backgroundColor: 'var(--color-bg-warm)',
                  borderRadius: 'var(--radius-md)',
                  flexWrap: 'wrap',
                  gap: '1rem',
                }}
              >
                <div>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-olive-900)' }}>
                    Team: {req.team_name}
                  </strong>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                    "{req.message}"
                  </p>
                </div>

                <div style={{ display: 'flex', gap: '0.5rem' }}>
                  <button
                    className="btn btn-primary btn-sm"
                    onClick={() => handleDecision(req.id, 'accepted')}
                    disabled={isFull}
                  >
                    <Check size={14} />
                    <span>Accept Request</span>
                  </button>
                  <button
                    className="btn btn-secondary btn-sm"
                    onClick={() => handleDecision(req.id, 'rejected')}
                  >
                    <X size={14} />
                    <span>Decline</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assigned Teams */}
      <div className="card">
        <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>
          Currently Mentored Teams ({assignedTeams.length})
        </h3>

        {assignedTeams.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '2rem 1rem', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            No teams currently assigned. Accept incoming requests above to mentor active hackathon rosters.
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
            {assignedTeams.map((t, idx) => (
              <div key={idx} style={{ padding: '1rem', backgroundColor: 'var(--color-bg-warm)', borderRadius: 'var(--radius-md)' }}>
                <strong style={{ fontSize: '1rem', color: 'var(--color-olive-900)' }}>{t.team_name}</strong>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '0.2rem' }}>
                  Target: {t.hackathon_name}
                </div>
                <div style={{ marginTop: '0.5rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span className="badge badge-olive">Match: {t.match_score}%</span>
                  <Link to={`/teams/${t.team_id}`} className="btn btn-secondary btn-sm" style={{ fontSize: '0.75rem' }}>
                    View Roster
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
