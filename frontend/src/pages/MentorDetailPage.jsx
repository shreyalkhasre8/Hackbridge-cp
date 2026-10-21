/**
 * HackBridge Mentor Detail & Compatibility Match Page
 */

import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Star,
  ArrowLeft,
  Briefcase,
  Users,
  CheckCircle2,
  Sparkles,
  ShieldCheck,
  Zap,
} from 'lucide-react';

export default function MentorDetailPage() {
  const { id } = useParams();
  const { user, addToast } = useAuth();
  const [mentor, setMentor] = useState(null);
  const [matchInfo, setMatchInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [requestMsg, setRequestMsg] = useState('We would appreciate your mentorship on our hackathon architecture.');
  const [requesting, setRequesting] = useState(false);

  useEffect(() => {
    async function loadData() {
      try {
        const res = await api.mentors.getById(id);
        if (res.success) setMentor(res.data);

        // Fetch match for sample team
        const matchRes = await api.mentors.getMatchForTeam('TEAM0001');
        if (matchRes.success) {
          const thisMatch = matchRes.data.find(m => m.mentor_id === id);
          if (thisMatch) setMatchInfo(thisMatch);
        }
      } catch (e) {
        console.warn('Error loading mentor details:', e);
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, [id]);

  const handleRequest = async () => {
    setRequesting(true);
    try {
      const res = await api.mentors.requestMentorship(id, {
        team_id: 'TEAM0001',
        message: requestMsg,
      });
      if (res.success) {
        addToast('Mentorship request sent successfully!', 'success');
      }
    } catch (err) {
      addToast(err.message || 'Error sending request', 'danger');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  if (!mentor) {
    return (
      <div className="page-container" style={{ textAlign: 'center', padding: '4rem 1rem' }}>
        <h2>Mentor Profile Not Found</h2>
        <Link to="/mentors" className="btn btn-primary" style={{ marginTop: '1rem' }}>
          Back to Mentors
        </Link>
      </div>
    );
  }

  return (
    <div className="page-container">
      <Link to="/mentors" style={{ display: 'inline-flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-olive-700)', marginBottom: '1.5rem' }}>
        <ArrowLeft size={16} />
        <span>Back to All Mentors</span>
      </Link>

      {/* Hero Header */}
      <div className="card" style={{ padding: '2.5rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '1rem', marginBottom: '1rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <span className="badge badge-accent">{mentor.specialization}</span>
              <span className="badge badge-olive">{mentor.industry}</span>
            </div>
            <h1 style={{ fontSize: '2.4rem', marginBottom: '0.5rem' }}>{mentor.mentor_name}</h1>
            <p style={{ fontSize: '1rem', color: 'var(--text-secondary)' }}>
              {mentor.years_of_experience} Years Industry Experience • Verified Hackathon Mentor
            </p>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: '#C2840D', fontWeight: 700, fontSize: '1.5rem' }}>
            <Star size={24} fill="#C2840D" />
            <span>{mentor.rating?.toFixed(1)} / 5.0</span>
          </div>
        </div>

        {/* Capacity Row */}
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
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Capacity Allocation</span>
            <strong style={{ fontSize: '1.1rem', color: mentor.is_available ? 'var(--color-olive-900)' : 'var(--color-danger)' }}>
              {mentor.current_teams_count} / {mentor.max_teams} Teams
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Availability Status</span>
            <strong style={{ fontSize: '1.1rem', color: mentor.is_available ? 'var(--color-success)' : 'var(--color-danger)' }}>
              {mentor.is_available ? 'Accepting Requests' : 'Capacity Full'}
            </strong>
          </div>
          <div>
            <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)', display: 'block' }}>Mentoring Domain</span>
            <strong style={{ fontSize: '1.1rem' }}>{mentor.specialization}</strong>
          </div>
        </div>
      </div>

      {/* Match Breakdown & Skills */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2rem' }}>
        {/* Left: Suitability Match */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>Team Suitability Match</h3>
            <span className="badge badge-olive">Formula 65/25/10</span>
          </div>

          {matchInfo ? (
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
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>
                    Match Percentage
                  </div>
                  <div style={{ fontSize: '2.2rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-olive-900)' }}>
                    {matchInfo.match_score}%
                  </div>
                </div>
                <div style={{ textAlign: 'right', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                  Skill Fit: {matchInfo.skill_proficiency_score}%<br />
                  Domain: {matchInfo.domain_fit_score}%<br />
                  Rating: {matchInfo.normalized_rating}%
                </div>
              </div>

              {matchInfo.reasons && (
                <div style={{ marginBottom: '1.5rem', fontSize: '0.85rem' }}>
                  <div style={{ fontWeight: 700, marginBottom: '0.35rem' }}>Why This Mentor Fits:</div>
                  <ul style={{ paddingLeft: '1.25rem', color: 'var(--text-secondary)' }}>
                    {matchInfo.reasons.map((r, idx) => (
                      <li key={idx} style={{ marginBottom: '0.25rem' }}>{r}</li>
                    ))}
                  </ul>
                </div>
              )}

              <button
                className="btn btn-primary btn-lg"
                style={{ width: '100%' }}
                onClick={handleRequest}
                disabled={!mentor.is_available || requesting}
              >
                {requesting ? 'Sending...' : 'Request Guidance For My Team'}
              </button>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1.5rem 0', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
              Select a team to calculate exact mentor-team compatibility.
            </div>
          )}
        </div>

        {/* Right: Technical Skills */}
        <div className="card">
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Verified Coaching Skills</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {mentor.skills?.map((s, idx) => (
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
                <span style={{ fontWeight: 600 }}>{s.skill_name}</span>
                <span className="badge badge-olive">Proficiency: {(s.proficiency_score * 100).toFixed(0)}%</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
