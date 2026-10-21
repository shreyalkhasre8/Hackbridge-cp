/**
 * HackBridge Student Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { api } from '../services/api';
import CompatibilityBadge from '../components/CompatibilityBadge';
import CompatibilityModal from '../components/CompatibilityModal';
import {
  Sparkles,
  Users,
  Compass,
  Calendar,
  Award,
  ChevronRight,
  AlertCircle,
  CheckCircle,
  PlusCircle,
  Clock,
  ArrowUpRight,
} from 'lucide-react';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [activeTeams, setActiveTeams] = useState([]);
  const [recommendedHackathons, setRecommendedHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedCompatData, setSelectedCompatData] = useState(null);
  const [isCompatModalOpen, setIsCompatModalOpen] = useState(false);

  useEffect(() => {
    async function loadDashboard() {
      try {
        const studentId = user?.profile_id || 'STU0001';
        const [studentRes, hackRes] = await Promise.all([
          api.students.getById(studentId),
          api.hackathons.getAll({ limit: 4, upcoming_only: true }),
        ]);

        if (studentRes.success) {
          setProfile(studentRes.data);
          setActiveTeams(studentRes.data.teams || []);
        }

        if (hackRes.success) {
          setRecommendedHackathons(hackRes.data);
        }
      } catch (err) {
        console.warn('Dashboard fetch error:', err);
      } finally {
        setLoading(false);
      }
    }
    loadDashboard();
  }, [user]);

  const handleOpenCompat = async (hackathonId) => {
    try {
      const teamId = activeTeams[0]?.team_id || 'TEAM0001';
      const res = await api.hackathons.getCompatibility(hackathonId, teamId);
      if (res.success) {
        setSelectedCompatData(res.data);
        setIsCompatModalOpen(true);
      }
    } catch (e) {
      console.warn('Could not load compatibility breakdown:', e);
    }
  };

  const completeness = profile?.completeness || { score: 85, missing_fields: [] };

  return (
    <div className="page-container">
      {/* Top Banner */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: '2rem',
        flexWrap: 'wrap',
        gap: '1rem',
      }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem' }}>
            <span className="badge badge-olive">{profile?.college_name || 'Academic Institution'}</span>
            <span className="badge badge-accent">{profile?.primary_role || 'Developer'}</span>
          </div>
          <h2 style={{ fontSize: '2rem' }}>Hello, {user?.name || 'Innovator'}! 👋</h2>
          <p style={{ fontSize: '0.925rem' }}>Here is your hackathon readiness and team collaboration pulse.</p>
        </div>

        <div style={{ display: 'flex', gap: '0.75rem' }}>
          <Link to="/smart-formation" className="btn btn-accent">
            <Sparkles size={16} />
            <span>Smart Team Pool</span>
          </Link>
          <Link to="/teams" className="btn btn-primary">
            <PlusCircle size={16} />
            <span>Create Team</span>
          </Link>
        </div>
      </div>

      {/* Row 1: Profile Completeness & Active Team Status */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
        gap: '1.5rem',
        marginBottom: '2rem',
      }}>
        {/* Profile Completeness Card */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.15rem' }}>Profile Completeness</h4>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontSize: '1.5rem',
              fontWeight: 700,
              color: completeness.score >= 80 ? 'var(--color-success)' : 'var(--color-warning)',
            }}>
              {completeness.score}%
            </span>
          </div>

          <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden', marginBottom: '1rem' }}>
            <div style={{
              width: `${completeness.score}%`,
              height: '100%',
              background: completeness.score >= 80 ? 'var(--color-success)' : 'var(--color-warning)',
              borderRadius: 'var(--radius-pill)',
            }} />
          </div>

          {completeness.missing_fields && completeness.missing_fields.length > 0 ? (
            <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
              <div style={{ fontWeight: 600, color: 'var(--color-warning)', marginBottom: '0.35rem' }}>
                Boost matching accuracy by adding:
              </div>
              <ul style={{ paddingLeft: '1.25rem' }}>
                {completeness.missing_fields.map((field, idx) => (
                  <li key={idx}>{field}</li>
                ))}
              </ul>
            </div>
          ) : (
            <div style={{ fontSize: '0.825rem', color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: '0.35rem' }}>
              <CheckCircle size={15} />
              <span>Full profile evidence recorded. Maximum recommendation precision.</span>
            </div>
          )}

          <div style={{ marginTop: '1.25rem', paddingTop: '1rem', borderTop: '1px solid var(--border-subtle)' }}>
            <Link to="/profile" style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--color-olive-800)', display: 'flex', alignItems: 'center', gap: '0.3rem' }}>
              <span>Edit Skills & Availability</span>
              <ChevronRight size={14} />
            </Link>
          </div>
        </div>

        {/* Current Team Status */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h4 style={{ fontSize: '1.15rem' }}>My Team Rosters</h4>
            <span className="badge badge-olive">{activeTeams.length} Active</span>
          </div>

          {activeTeams.length > 0 ? (
            <div>
              <div style={{
                background: 'var(--color-bg-warm)',
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                  <strong style={{ fontSize: '1.05rem', color: 'var(--color-olive-900)' }}>
                    {activeTeams[0].team_name}
                  </strong>
                  <span className="badge badge-accent">{activeTeams[0].team_status}</span>
                </div>
                <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)' }}>
                  Target: <strong>{activeTeams[0].hackathon?.hackathon_name || 'Upcoming Hackathon'}</strong>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
                  Role: {activeTeams[0].assigned_role} • {activeTeams[0].team_size} Members
                </div>
              </div>

              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <Link to={`/teams/${activeTeams[0].team_id}`} className="btn btn-secondary btn-sm" style={{ flex: 1 }}>
                  <span>Manage Roster & Gaps</span>
                  <ArrowUpRight size={14} />
                </Link>
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <Users size={32} color="var(--color-olive-300)" style={{ marginBottom: '0.5rem' }} />
              <p style={{ fontSize: '0.85rem', marginBottom: '1rem' }}>You haven't formed or joined a team yet.</p>
              <Link to="/smart-formation" className="btn btn-primary btn-sm">
                Join Smart Matching Pool
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Row 2: High Compatibility Hackathons */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.45rem' }}>Recommended Hackathons</h3>
            <p style={{ fontSize: '0.875rem' }}>Tailored to your skills, domain projects, and roster capacity.</p>
          </div>
          <Link to="/hackathons" style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--color-olive-800)' }}>
            Browse All 180 Hackathons →
          </Link>
        </div>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {recommendedHackathons.map((h) => (
            <div key={h.hackathon_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-accent">{h.domain}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>{h.mode}</span>
              </div>

              <h4 style={{ fontSize: '1.15rem', marginBottom: '0.35rem' }}>
                <Link to={`/hackathons/${h.hackathon_id}`} style={{ color: 'var(--color-olive-900)' }}>
                  {h.hackathon_name}
                </Link>
              </h4>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                {h.organizer}
              </div>

              <div style={{
                fontSize: '0.8rem',
                color: 'var(--text-muted)',
                marginBottom: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.4rem',
              }}>
                <Clock size={14} />
                <span>Deadline: <strong>{h.registration_deadline}</strong></span>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CompatibilityBadge
                  score={84.5}
                  isRecommended={true}
                  size="sm"
                  onClick={() => handleOpenCompat(h.hackathon_id)}
                />
                <Link to={`/hackathons/${h.hackathon_id}`} className="btn btn-secondary btn-sm">
                  Details
                </Link>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Compatibility Modal */}
      <CompatibilityModal
        isOpen={isCompatModalOpen}
        onClose={() => setIsCompatModalOpen(false)}
        data={selectedCompatData}
        teamName={activeTeams[0]?.team_name}
      />
    </div>
  );
}
