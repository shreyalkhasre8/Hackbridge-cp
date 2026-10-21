/**
 * HackBridge Mentor Discovery & Recommendation Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Award,
  Search,
  Star,
  Users,
  Briefcase,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  CheckCircle2,
  X,
} from 'lucide-react';

export default function MentorsPage() {
  const { user, addToast } = useAuth();
  const [mentors, setMentors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [specialization, setSpecialization] = useState('');
  const [availableOnly, setAvailableOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 100, total_pages: 5 });

  // Mentorship Request Modal
  const [selectedMentor, setSelectedMentor] = useState(null);
  const [userTeams, setUserTeams] = useState([]);
  const [selectedTeamId, setSelectedTeamId] = useState('');
  const [requestMessage, setRequestMessage] = useState('We would appreciate your mentorship on our architecture and presentation.');
  const [submitting, setSubmitting] = useState(false);

  const fetchMentors = async () => {
    setLoading(true);
    try {
      const res = await api.mentors.getAll({
        search,
        specialization,
        available_only: availableOnly ? 'true' : 'false',
        page,
        limit: 12,
      });
      if (res.success) {
        setMentors(res.data || []);
        setPagination(res.pagination || { total: 100, total_pages: 9 });
      }
    } catch (e) {
      console.warn('Error loading mentors:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMentors();
    // Load student teams
    const stuId = user?.profile_id || 'STU0001';
    api.students.getById(stuId).then(res => {
      if (res.success && res.data.teams) {
        setUserTeams(res.data.teams);
        if (res.data.teams.length > 0) setSelectedTeamId(res.data.teams[0].team_id);
      }
    }).catch(() => {});
  }, [page, specialization, availableOnly]);

  const handleOpenRequest = (mentor) => {
    setSelectedMentor(mentor);
  };

  const handleSubmitRequest = async (e) => {
    e.preventDefault();
    if (!selectedTeamId) {
      addToast('Please create or select an active team roster first', 'warning');
      return;
    }
    setSubmitting(true);
    try {
      const res = await api.mentors.requestMentorship(selectedMentor.mentor_id, {
        team_id: selectedTeamId,
        message: requestMessage,
      });
      if (res.success) {
        addToast('Mentorship request sent to mentor!', 'success');
        setSelectedMentor(null);
      }
    } catch (err) {
      addToast(err.message || 'Error sending mentorship request', 'danger');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">Industry & Academic Mentorship</span>
          <span className="badge badge-accent">100 Verified Profiles</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Find Industry Mentors</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Connect with industry experts. Matching score evaluates skill overlap (65%), domain specialization (25%), and verified feedback rating (10%).
        </p>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search mentors by name, company, or expertise..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchMentors(); } }}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ flex: '0 1 200px' }}>
            <select
              className="form-select"
              value={specialization}
              onChange={(e) => { setSpecialization(e.target.value); setPage(1); }}
            >
              <option value="">All Specializations</option>
              <option value="Artificial Intelligence">AI & Deep Learning</option>
              <option value="Cloud Computing">Cloud & Distributed Systems</option>
              <option value="Full Stack Development">Full Stack Engineering</option>
              <option value="Blockchain Technology">Blockchain & Web3</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="Data Science">Data Science</option>
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={availableOnly}
              onChange={(e) => { setAvailableOnly(e.target.checked); setPage(1); }}
              style={{ accentColor: 'var(--color-olive-850)' }}
            />
            <span>Available Capacity Only</span>
          </label>

          <button className="btn btn-secondary btn-sm" onClick={() => { setPage(1); fetchMentors(); }}>
            Filter
          </button>
        </div>
      </div>

      {/* Grid of Mentors */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '260px' }} />
          ))}
        </div>
      ) : mentors.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Award size={40} color="var(--color-olive-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Mentors Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Try resetting your filter parameters.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          {mentors.map((m) => (
            <div key={m.mentor_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-accent">{m.specialization}</span>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.25rem', fontSize: '0.85rem', fontWeight: 700, color: '#C2840D' }}>
                  <Star size={14} fill="#C2840D" color="#C2840D" />
                  <span>{m.rating?.toFixed(1)}</span>
                </div>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                <Link to={`/mentors/${m.mentor_id}`} style={{ color: 'var(--color-olive-900)' }}>
                  {m.mentor_name}
                </Link>
              </h3>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                {m.industry} • {m.years_of_experience} Years Experience
              </div>

              {/* Capacity Status */}
              <div style={{
                backgroundColor: 'var(--color-bg-warm)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.775rem',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
              }}>
                <span style={{ color: 'var(--text-muted)' }}>Mentorship Load:</span>
                <strong>{m.current_teams} / {m.max_teams} Teams Allocated</strong>
              </div>

              {/* Skills */}
              {m.skills && m.skills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {m.skills.map((s, idx) => (
                      <span key={idx} className="badge badge-olive" style={{ fontSize: '0.7rem' }}>
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: m.is_available ? 'var(--color-success)' : 'var(--color-danger)', fontWeight: 600 }}>
                  {m.is_available ? '● Capacity Open' : '● Capacity Full'}
                </span>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={() => handleOpenRequest(m)}
                  disabled={!m.is_available}
                >
                  Request Mentorship
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {pagination.total_pages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '1rem' }}>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={page === 1}
          >
            <ChevronLeft size={16} />
            <span>Previous</span>
          </button>
          <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Page <strong>{page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total} Mentors)
          </span>
          <button
            className="btn btn-secondary btn-sm"
            onClick={() => setPage(p => Math.min(pagination.total_pages, p + 1))}
            disabled={page === pagination.total_pages}
          >
            <span>Next</span>
            <ChevronRight size={16} />
          </button>
        </div>
      )}

      {/* Mentorship Request Modal */}
      {selectedMentor && (
        <div className="modal-overlay" onClick={() => setSelectedMentor(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem' }}>Request Team Mentorship</h3>
                <p style={{ fontSize: '0.85rem' }}>Request guidance from <strong>{selectedMentor.mentor_name}</strong></p>
              </div>
              <button onClick={() => setSelectedMentor(null)} style={{ background: 'none', border: 'none', cursor: 'pointer' }}>
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmitRequest}>
              <div className="form-group">
                <label className="form-label">Select Your Team</label>
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
                  <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    No team found. Please <Link to="/teams">create a team</Link> before requesting mentors.
                  </div>
                )}
              </div>

              <div className="form-group">
                <label className="form-label">Note for Mentor</label>
                <textarea
                  className="form-textarea"
                  rows={3}
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                />
              </div>

              <div style={{
                padding: '0.85rem',
                backgroundColor: 'var(--color-bg-warm)',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.8rem',
                color: 'var(--text-secondary)',
                marginBottom: '1.5rem',
              }}>
                <ShieldCheck size={16} color="var(--color-olive-600)" style={{ display: 'inline', marginRight: '0.35rem', verticalAlign: 'middle' }} />
                <span>Backend enforces maximum simultaneous capacity ({selectedMentor.max_teams} teams limit).</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setSelectedMentor(null)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary" disabled={submitting}>
                  {submitting ? 'Sending Request...' : 'Send Mentorship Request'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
