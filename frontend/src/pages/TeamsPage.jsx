/**
 * HackBridge Team Discovery & Management Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Users,
  Search,
  PlusCircle,
  Compass,
  ChevronLeft,
  ChevronRight,
  ShieldCheck,
  UserCheck,
  X,
} from 'lucide-react';

export default function TeamsPage() {
  const { user, addToast } = useAuth();
  const [teams, setTeams] = useState([]);
  const [hackathonsList, setHackathonsList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 720, total_pages: 36 });

  // Create Team Modal
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState('');
  const [selectedHackathonId, setSelectedHackathonId] = useState('');
  const [targetRole, setTargetRole] = useState('Full Stack Lead');
  const [creating, setCreating] = useState(false);

  const fetchTeams = async () => {
    setLoading(true);
    try {
      const res = await api.teams.getAll({
        search,
        team_status: statusFilter,
        page,
        limit: 12,
      });
      if (res.success) {
        setTeams(res.data || []);
        setPagination(res.pagination || { total: 720, total_pages: 36 });
      }
    } catch (e) {
      console.warn('Error fetching teams:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTeams();
    api.hackathons.getAll({ limit: 100, upcoming_only: true })
      .then(res => {
        if (res.success && res.data.length > 0) {
          setHackathonsList(res.data);
          setSelectedHackathonId(res.data[0].hackathon_id);
        }
      })
      .catch(() => {});
  }, [page, statusFilter]);

  const handleCreateTeam = async (e) => {
    e.preventDefault();
    if (!newTeamName || !selectedHackathonId) {
      addToast('Please enter team name and target hackathon', 'warning');
      return;
    }
    setCreating(true);
    try {
      const res = await api.teams.create({
        team_name: newTeamName,
        hackathon_id: selectedHackathonId,
        leader_student_id: user?.profile_id || 'STU0001',
        target_role: targetRole,
      });
      if (res.success) {
        addToast('Team created successfully!', 'success');
        setIsCreateOpen(false);
        setNewTeamName('');
        fetchTeams();
      }
    } catch (err) {
      addToast(err.message || 'Error creating team. Single roster rule applies.', 'danger');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem', flexWrap: 'wrap', gap: '1rem' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
            <span className="badge badge-olive">Collaborative Rosters</span>
            <span className="badge badge-accent">720 Relational Teams</span>
          </div>
          <h2 style={{ fontSize: '2.2rem' }}>Find & Manage Teams</h2>
          <p style={{ fontSize: '0.95rem' }}>
            Discover multi-college student teams, review missing roles, or register your own roster.
          </p>
        </div>

        <button className="btn btn-primary btn-lg" onClick={() => setIsCreateOpen(true)}>
          <PlusCircle size={18} />
          <span>Create New Team</span>
        </button>
      </div>

      {/* Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          <div style={{ flex: '1 1 240px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search teams by name..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') { setPage(1); fetchTeams(); } }}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={statusFilter}
              onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
            >
              <option value="">All Statuses</option>
              <option value="Forming">Forming</option>
              <option value="Complete">Complete</option>
              <option value="Registered">Registered</option>
              <option value="Finalist">Finalist</option>
            </select>
          </div>

          <button className="btn btn-secondary btn-sm" onClick={() => { setPage(1); fetchTeams(); }}>
            Search
          </button>
        </div>
      </div>

      {/* Grid of Teams */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '220px' }} />
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Users size={40} color="var(--color-olive-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Teams Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>Try resetting your search query.</p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          {teams.map((t) => (
            <div key={t.team_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-olive">{t.team_status}</span>
                <span style={{ fontSize: '0.775rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {t.team_size} Members
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                <Link to={`/teams/${t.team_id}`} style={{ color: 'var(--color-olive-900)' }}>
                  {t.team_name}
                </Link>
              </h3>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                Target: <strong>{t.hackathon_name}</strong>
              </div>

              <div style={{
                fontSize: '0.775rem',
                backgroundColor: 'var(--color-bg-warm)',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
              }}>
                <div>Leader: <strong>{t.leader_name}</strong></div>
                <div style={{ color: 'var(--text-muted)', marginTop: '0.2rem' }}>
                  {t.college_name || 'Academic Institution'}
                </div>
              </div>

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                  Skill Diversity: {t.skill_diversity_score}%
                </span>
                <Link to={`/teams/${t.team_id}`} className="btn btn-primary btn-sm">
                  View Roster
                </Link>
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
            Page <strong>{page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total} Teams)
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

      {/* Create Team Modal */}
      {isCreateOpen && (
        <div className="modal-overlay" onClick={() => setIsCreateOpen(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <div>
                <h3 style={{ fontSize: '1.45rem' }}>Create Team Roster</h3>
                <p style={{ fontSize: '0.85rem' }}>Set your team name and target hackathon opportunity</p>
              </div>
              <button
                onClick={() => setIsCreateOpen(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateTeam}>
              <div className="form-group">
                <label className="form-label">Team Name</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. NeuralCrafters"
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label">Target Hackathon</label>
                <select
                  className="form-select"
                  value={selectedHackathonId}
                  onChange={(e) => setSelectedHackathonId(e.target.value)}
                  required
                >
                  {hackathonsList.map(h => (
                    <option key={h.hackathon_id} value={h.hackathon_id}>
                      {h.hackathon_name} ({h.domain} • Deadline: {h.registration_deadline})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Your Role on this Team</label>
                <input
                  type="text"
                  className="form-control"
                  placeholder="e.g. AI Architect & Team Lead"
                  value={targetRole}
                  onChange={(e) => setTargetRole(e.target.value)}
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
                <span>Enforces platform constraint: A student cannot lead or join multiple active teams for the same hackathon.</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setIsCreateOpen(false)}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={creating}
                >
                  {creating ? 'Creating Team...' : 'Create Team'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
