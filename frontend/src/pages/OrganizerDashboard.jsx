/**
 * HackBridge College Hackathon Organizer Dashboard
 */

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Building,
  PlusCircle,
  Megaphone,
  Users,
  Compass,
  Calendar,
  Send,
  CheckCircle2,
} from 'lucide-react';

export default function OrganizerDashboard() {
  const { user, addToast } = useAuth();
  const [hackathons, setHackathons] = useState([]);
  const [loading, setLoading] = useState(true);

  // Announcement Form
  const [selectedHackId, setSelectedHackId] = useState('');
  const [annTitle, setAnnTitle] = useState('');
  const [annContent, setAnnContent] = useState('');
  const [postingAnn, setPostingAnn] = useState(false);

  const fetchOrganizerData = async () => {
    try {
      const res = await api.hackathons.getAll({ limit: 8 });
      if (res.success) {
        setHackathons(res.data || []);
        if (res.data.length > 0) setSelectedHackId(res.data[0].hackathon_id);
      }
    } catch (e) {
      console.warn('Error fetching organizer data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrganizerData();
  }, []);

  const handlePostAnnouncement = async (e) => {
    e.preventDefault();
    if (!annTitle || !annContent || !selectedHackId) {
      addToast('Please fill out all announcement fields', 'warning');
      return;
    }
    setPostingAnn(true);
    try {
      const res = await api.hackathons.createAnnouncement(selectedHackId, {
        title: annTitle,
        content: annContent,
        pinned: 1,
      });
      if (res.success) {
        addToast('Announcement published to student teams!', 'success');
        setAnnTitle('');
        setAnnContent('');
      }
    } catch (err) {
      addToast(err.message || 'Error publishing announcement', 'danger');
    } finally {
      setPostingAnn(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">Institutional Innovation Cell</span>
          <span className="badge badge-accent">Host Portal</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Organizer Management Console</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Manage your institution's hackathons, publish time-sensitive student announcements, and oversee participation.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Post Announcement Form */}
        <div className="card">
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1.25rem' }}>
            <Megaphone size={20} color="var(--color-olive-700)" />
            <h3 style={{ fontSize: '1.35rem' }}>Broadcast Announcement</h3>
          </div>

          <form onSubmit={handlePostAnnouncement}>
            <div className="form-group">
              <label className="form-label">Target Hackathon</label>
              <select
                className="form-select"
                value={selectedHackId}
                onChange={(e) => setSelectedHackId(e.target.value)}
              >
                {hackathons.map(h => (
                  <option key={h.hackathon_id} value={h.hackathon_id}>
                    {h.hackathon_name} ({h.domain})
                  </option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Announcement Title</label>
              <input
                type="text"
                className="form-control"
                placeholder="e.g. Problem Statements & API Keys Released"
                value={annTitle}
                onChange={(e) => setAnnTitle(e.target.value)}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Content / Instructions</label>
              <textarea
                className="form-textarea"
                rows={3}
                placeholder="Share evaluation guidelines, submission deadlines, or server links..."
                value={annContent}
                onChange={(e) => setAnnContent(e.target.value)}
                required
              />
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={postingAnn}>
              <Send size={15} />
              <span>{postingAnn ? 'Publishing...' : 'Publish Announcement'}</span>
            </button>
          </form>
        </div>

        {/* Institution Hackathons List */}
        <div className="card">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <h3 style={{ fontSize: '1.35rem' }}>Managed Hackathons</h3>
            <span className="badge badge-olive">{hackathons.length} Active Events</span>
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
            {hackathons.slice(0, 4).map(h => (
              <div
                key={h.hackathon_id}
                style={{
                  padding: '0.85rem',
                  backgroundColor: 'var(--color-bg-warm)',
                  borderRadius: 'var(--radius-md)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.2rem' }}>
                  <strong style={{ fontSize: '0.95rem', color: 'var(--color-olive-900)' }}>
                    {h.hackathon_name}
                  </strong>
                  <span className="badge badge-accent">{h.mode}</span>
                </div>
                <div style={{ fontSize: '0.775rem', color: 'var(--text-muted)' }}>
                  Deadline: {h.registration_deadline} • Prize: ₹{h.prize_pool?.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
