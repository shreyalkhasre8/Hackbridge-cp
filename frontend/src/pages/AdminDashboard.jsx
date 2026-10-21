/**
 * HackBridge Platform Administration & Moderation Console
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Shield,
  Users,
  Settings,
  Database,
  Activity,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
} from 'lucide-react';

export default function AdminDashboard() {
  const { addToast } = useAuth();
  const [users, setUsers] = useState([]);
  const [adminStats, setAdminStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = async () => {
    setLoading(true);
    try {
      const [uRes, sRes] = await Promise.all([
        api.admin.getUsers(),
        api.admin.getStats(),
      ]);
      if (uRes.success) setUsers(uRes.data || []);
      if (sRes.success) setAdminStats(sRes.data);
    } catch (e) {
      console.warn('Error fetching admin data:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAdminData();
  }, []);

  const handleRoleChange = async (userId, newRole) => {
    try {
      const res = await api.admin.updateUserRole(userId, newRole);
      if (res.success) {
        addToast(`Role updated to ${newRole}`, 'success');
        setUsers(prev => prev.map(u => u.user_id === userId ? { ...u, role: newRole } : u));
      }
    } catch (err) {
      addToast(err.message || 'Error updating role', 'danger');
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-accent">Superuser Access</span>
          <span className="badge badge-olive">Platform Moderation</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Administration Console</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Manage user permissions, monitor system operational state, and verify platform health.
        </p>
      </div>

      {/* Admin KPI Stats */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Registered Accounts</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            {adminStats?.registered_users || users.length}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)' }}>Operational Users</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Team Applications</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            {adminStats?.pending_team_applications || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting leader approval</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Pending Mentorships</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            {adminStats?.pending_mentorship_requests || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Awaiting mentor response</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Matching Pool Size</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent-700)' }}>
            {adminStats?.matching_pool_count || 0}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Active student seekers</span>
        </div>
      </div>

      {/* User Management Table */}
      <div className="card">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
          <div>
            <h3 style={{ fontSize: '1.35rem' }}>Registered Users & Role Governance</h3>
            <p style={{ fontSize: '0.825rem', color: 'var(--text-muted)' }}>
              Server-enforced role authorization for Students, Mentors, College Organizers, and Admins.
            </p>
          </div>
          <button className="btn btn-secondary btn-sm" onClick={fetchAdminData}>
            <RefreshCw size={14} />
            <span>Refresh</span>
          </button>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ backgroundColor: 'var(--color-bg-warm)', borderBottom: '2px solid var(--border-default)', textAlign: 'left' }}>
                <th style={{ padding: '0.75rem 1rem' }}>User ID</th>
                <th style={{ padding: '0.75rem 1rem' }}>Full Name</th>
                <th style={{ padding: '0.75rem 1rem' }}>Email</th>
                <th style={{ padding: '0.75rem 1rem' }}>Current Role</th>
                <th style={{ padding: '0.75rem 1rem' }}>Role Permission</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.user_id} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                  <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.775rem', color: 'var(--color-olive-700)' }}>
                    {u.user_id}
                  </td>
                  <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{u.name}</td>
                  <td style={{ padding: '0.75rem 1rem', color: 'var(--text-secondary)' }}>{u.email}</td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <span className="badge badge-olive" style={{ textTransform: 'capitalize' }}>
                      {u.role}
                    </span>
                  </td>
                  <td style={{ padding: '0.75rem 1rem' }}>
                    <select
                      className="form-select"
                      style={{ padding: '0.3rem 0.5rem', fontSize: '0.775rem', width: 'auto' }}
                      value={u.role}
                      onChange={(e) => handleRoleChange(u.user_id, e.target.value)}
                    >
                      <option value="student">Student</option>
                      <option value="mentor">Mentor</option>
                      <option value="college">College Organizer</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
