/**
 * HackBridge Hackathon Discovery Page
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import CompatibilityBadge from '../components/CompatibilityBadge';
import CompatibilityModal from '../components/CompatibilityModal';
import {
  Compass,
  Search,
  Filter,
  Calendar,
  DollarSign,
  Users,
  ChevronLeft,
  ChevronRight,
  Clock,
  CheckCircle2,
} from 'lucide-react';

export default function HackathonsPage() {
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [domain, setDomain] = useState('');
  const [mode, setMode] = useState('');
  const [difficulty, setDifficulty] = useState('');
  const [upcomingOnly, setUpcomingOnly] = useState(false);
  const [page, setPage] = useState(1);
  const [pagination, setPagination] = useState({ total: 180, total_pages: 9 });

  const [selectedCompatData, setSelectedCompatData] = useState(null);
  const [selectedHackName, setSelectedHackName] = useState('');
  const [isCompatModalOpen, setIsCompatModalOpen] = useState(false);

  const fetchHackathons = async () => {
    setLoading(true);
    try {
      const res = await api.hackathons.getAll({
        search,
        domain,
        mode,
        difficulty,
        upcoming_only: upcomingOnly ? 'true' : 'false',
        page,
        limit: 12,
      });
      if (res.success) {
        setHackathons(res.data || []);
        setPagination(res.pagination || { total: 180, total_pages: 15 });
      }
    } catch (e) {
      console.warn('Error fetching hackathons:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHackathons();
  }, [page, domain, mode, difficulty, upcomingOnly]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    setPage(1);
    fetchHackathons();
  };

  const handleOpenCompat = async (hack) => {
    try {
      const res = await api.hackathons.getCompatibility(hack.hackathon_id, 'TEAM0001');
      if (res.success) {
        setSelectedCompatData(res.data);
        setSelectedHackName(hack.hackathon_name);
        setIsCompatModalOpen(true);
      }
    } catch (e) {
      console.warn('Compatibility lookup failed:', e);
    }
  };

  return (
    <div className="page-container">
      {/* Page Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">Event Discovery</span>
          <span className="badge badge-accent">180 Relational Records</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Explore Hackathons</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Discover hackathons curated across India, complete with mode, required skill profiles, and explainable compatibility scoring.
        </p>
      </div>

      {/* Filters & Search Toolbar */}
      <div className="card" style={{ padding: '1.25rem', marginBottom: '2rem' }}>
        <form onSubmit={handleSearchSubmit} style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center' }}>
          {/* Search Input */}
          <div style={{ flex: '1 1 240px', minWidth: '220px', position: 'relative' }}>
            <Search size={16} color="var(--text-muted)" style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)' }} />
            <input
              type="text"
              className="form-control"
              placeholder="Search hackathons, domains, organizers..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              style={{ paddingLeft: '36px' }}
            />
          </div>

          {/* Domain Filter */}
          <div style={{ flex: '0 1 180px' }}>
            <select
              className="form-select"
              value={domain}
              onChange={(e) => { setDomain(e.target.value); setPage(1); }}
            >
              <option value="">All Domains</option>
              <option value="Artificial Intelligence">AI & Machine Learning</option>
              <option value="Web3 & Blockchain">Web3 & Blockchain</option>
              <option value="FinTech">FinTech</option>
              <option value="Healthcare">Healthcare Tech</option>
              <option value="Cybersecurity">Cybersecurity</option>
              <option value="IoT & Smart Cities">IoT & Smart Cities</option>
              <option value="Open Innovation">Open Innovation</option>
            </select>
          </div>

          {/* Mode Filter */}
          <div style={{ flex: '0 1 140px' }}>
            <select
              className="form-select"
              value={mode}
              onChange={(e) => { setMode(e.target.value); setPage(1); }}
            >
              <option value="">All Modes</option>
              <option value="Online">Online</option>
              <option value="Offline">Offline</option>
              <option value="Hybrid">Hybrid</option>
            </select>
          </div>

          {/* Difficulty Filter */}
          <div style={{ flex: '0 1 150px' }}>
            <select
              className="form-select"
              value={difficulty}
              onChange={(e) => { setDifficulty(e.target.value); setPage(1); }}
            >
              <option value="">All Difficulties</option>
              <option value="Beginner">Beginner</option>
              <option value="Intermediate">Intermediate</option>
              <option value="Advanced">Advanced</option>
            </select>
          </div>

          {/* Upcoming Only Checkbox */}
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
            <input
              type="checkbox"
              checked={upcomingOnly}
              onChange={(e) => { setUpcomingOnly(e.target.checked); setPage(1); }}
              style={{ accentColor: 'var(--color-olive-800)' }}
            />
            <span>Open Deadlines Only</span>
          </label>

          <button type="submit" className="btn btn-primary btn-sm">
            <span>Filter</span>
          </button>
        </form>
      </div>

      {/* Grid of Hackathons */}
      {loading ? (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1.5rem' }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="card skeleton" style={{ height: '280px' }} />
          ))}
        </div>
      ) : hackathons.length === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '3.5rem 1.5rem' }}>
          <Compass size={40} color="var(--color-olive-400)" style={{ marginBottom: '1rem' }} />
          <h3 style={{ fontSize: '1.35rem', marginBottom: '0.5rem' }}>No Hackathons Found</h3>
          <p style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
            Try adjusting your search query, difficulty filters, or uncheck "Open Deadlines Only".
          </p>
        </div>
      ) : (
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: '1.5rem',
          marginBottom: '2.5rem',
        }}>
          {hackathons.map((h) => (
            <div key={h.hackathon_id} className="card card-hover" style={{ display: 'flex', flexDirection: 'column' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <span className="badge badge-accent">{h.domain}</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--text-muted)' }}>
                  {h.mode} • {h.difficulty_level}
                </span>
              </div>

              <h3 style={{ fontSize: '1.25rem', marginBottom: '0.35rem' }}>
                <Link to={`/hackathons/${h.hackathon_id}`} style={{ color: 'var(--color-olive-900)' }}>
                  {h.hackathon_name}
                </Link>
              </h3>

              <div style={{ fontSize: '0.825rem', color: 'var(--text-secondary)', marginBottom: '0.85rem' }}>
                {h.organizer} • {h.city}, {h.state}
              </div>

              <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
                padding: '0.75rem',
                backgroundColor: 'var(--color-bg-warm)',
                borderRadius: 'var(--radius-md)',
                marginBottom: '1rem',
                fontSize: '0.775rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Prize Pool</span>
                  <strong style={{ color: 'var(--color-olive-850)', fontSize: '0.9rem' }}>₹{h.prize_pool?.toLocaleString()}</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Roster Limits</span>
                  <strong>{h.team_min_size} - {h.team_max_size} Members</strong>
                </div>
                <div style={{ gridColumn: 'span 2' }}>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Registration Deadline</span>
                  <strong style={{ color: h.is_open ? 'var(--color-olive-900)' : 'var(--color-danger)' }}>
                    {h.registration_deadline} {h.is_open ? '(Open)' : '(Closed)'}
                  </strong>
                </div>
              </div>

              {h.required_skills && h.required_skills.length > 0 && (
                <div style={{ marginBottom: '1rem' }}>
                  <div style={{ fontSize: '0.725rem', fontWeight: 600, color: 'var(--text-muted)', marginBottom: '0.3rem' }}>
                    Required Tech:
                  </div>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.3rem' }}>
                    {h.required_skills.map((s, idx) => (
                      <span key={idx} className="badge badge-olive" style={{ fontSize: '0.7rem' }}>
                        {s.skill_name}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ marginTop: 'auto', paddingTop: '0.85rem', borderTop: '1px solid var(--border-subtle)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <CompatibilityBadge
                  score={82.4}
                  isRecommended={true}
                  size="sm"
                  onClick={() => handleOpenCompat(h)}
                />
                <Link to={`/hackathons/${h.hackathon_id}`} className="btn btn-secondary btn-sm">
                  View Details
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
            Page <strong>{page}</strong> of <strong>{pagination.total_pages}</strong> ({pagination.total} Total)
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

      {/* Compatibility Modal */}
      <CompatibilityModal
        isOpen={isCompatModalOpen}
        onClose={() => setIsCompatModalOpen(false)}
        data={selectedCompatData}
        hackathonName={selectedHackName}
      />
    </div>
  );
}
