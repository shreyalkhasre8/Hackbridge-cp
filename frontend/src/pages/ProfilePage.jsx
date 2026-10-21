/**
 * HackBridge Student Profile & Technical Skills Editor
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  User,
  Zap,
  Code,
  FolderGit2,
  CheckCircle2,
  Save,
  AlertCircle,
  ExternalLink,
} from 'lucide-react';

export default function ProfilePage() {
  const { user, addToast } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  // Edit fields
  const [branch, setBranch] = useState('');
  const [year, setYear] = useState(3);
  const [cgpa, setCgpa] = useState(8.5);
  const [primaryRole, setPrimaryRole] = useState('');
  const [experienceLevel, setExperienceLevel] = useState('');
  const [availabilityHours, setAvailabilityHours] = useState(15);
  const [githubAvailable, setGithubAvailable] = useState(1);
  const [portfolioAvailable, setPortfolioAvailable] = useState(0);

  const studentId = user?.profile_id || 'STU0001';

  const fetchProfile = async () => {
    try {
      const res = await api.students.getById(studentId);
      if (res.success) {
        const s = res.data;
        setProfile(s);
        setBranch(s.branch || '');
        setYear(s.year || 3);
        setCgpa(s.cgpa || 8.0);
        setPrimaryRole(s.primary_role || '');
        setExperienceLevel(s.experience_level || '');
        setAvailabilityHours(s.availability_hours_per_week || 15);
        setGithubAvailable(s.github_available || 1);
        setPortfolioAvailable(s.portfolio_available || 0);
      }
    } catch (e) {
      console.warn('Error loading student profile:', e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProfile();
  }, [user]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const res = await api.students.update(studentId, {
        branch,
        year: parseInt(year, 10),
        cgpa: parseFloat(cgpa),
        primary_role: primaryRole,
        experience_level: experienceLevel,
        availability_hours_per_week: parseInt(availabilityHours, 10),
        github_available: githubAvailable ? 1 : 0,
        portfolio_available: portfolioAvailable ? 1 : 0,
      });
      if (res.success) {
        addToast('Profile updated successfully!', 'success');
        fetchProfile();
      }
    } catch (err) {
      addToast(err.message || 'Error updating profile', 'danger');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="page-container">
        <div className="card skeleton" style={{ height: '350px' }} />
      </div>
    );
  }

  const completeness = profile?.completeness || { score: 85, missing_fields: [] };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">{profile?.college_name || 'Academic Institution'}</span>
          <span className="badge badge-accent">Student ID: {profile?.student_id}</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>{profile?.student_name}'s Innovation Profile</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Your profile determines your team compatibility percentage and hackathon recommendations.
        </p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(340px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Left Column: Edit Form */}
        <div className="card">
          <h3 style={{ fontSize: '1.35rem', marginBottom: '1.25rem' }}>Academic & Collaboration Preferences</h3>

          <form onSubmit={handleSave}>
            <div className="form-group">
              <label className="form-label">Academic Branch</label>
              <input
                type="text"
                className="form-control"
                value={branch}
                onChange={(e) => setBranch(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
              <div className="form-group">
                <label className="form-label">Year of Study</label>
                <select
                  className="form-select"
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                >
                  <option value={1}>1st Year</option>
                  <option value={2}>2nd Year</option>
                  <option value={3}>3rd Year</option>
                  <option value={4}>4th Year</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">Current CGPA</label>
                <input
                  type="number"
                  step="0.01"
                  min="5.0"
                  max="10.0"
                  className="form-control"
                  value={cgpa}
                  onChange={(e) => setCgpa(Number(e.target.value))}
                  required
                />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Primary Technical Role</label>
              <select
                className="form-select"
                value={primaryRole}
                onChange={(e) => setPrimaryRole(e.target.value)}
              >
                <option value="Frontend Developer">Frontend Developer</option>
                <option value="Backend Developer">Backend Developer</option>
                <option value="AI/ML Engineer">AI/ML Engineer</option>
                <option value="UI/UX Designer">UI/UX Designer</option>
                <option value="Full Stack Developer">Full Stack Developer</option>
                <option value="Cloud/DevOps Engineer">Cloud/DevOps Engineer</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Experience Tier</label>
              <select
                className="form-select"
                value={experienceLevel}
                onChange={(e) => setExperienceLevel(e.target.value)}
              >
                <option value="Beginner">Beginner (1-2 Projects)</option>
                <option value="Intermediate">Intermediate (3-5 Projects)</option>
                <option value="Advanced">Advanced (Multiple Hackathons)</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label">Weekly Hackathon Commitment: {availabilityHours} hrs/week</label>
              <input
                type="range"
                min="5"
                max="40"
                step="5"
                value={availabilityHours}
                onChange={(e) => setAvailabilityHours(Number(e.target.value))}
                style={{ width: '100%', accentColor: 'var(--color-olive-850)' }}
              />
            </div>

            <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={githubAvailable === 1}
                  onChange={(e) => setGithubAvailable(e.target.checked ? 1 : 0)}
                  style={{ accentColor: 'var(--color-olive-850)' }}
                />
                <span>GitHub Profile Active</span>
              </label>

              <label style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', fontSize: '0.85rem', cursor: 'pointer' }}>
                <input
                  type="checkbox"
                  checked={portfolioAvailable === 1}
                  onChange={(e) => setPortfolioAvailable(e.target.checked ? 1 : 0)}
                  style={{ accentColor: 'var(--color-olive-850)' }}
                />
                <span>Portfolio Website Live</span>
              </label>
            </div>

            <button type="submit" className="btn btn-primary" style={{ width: '100%' }} disabled={saving}>
              <Save size={16} />
              <span>{saving ? 'Saving Profile...' : 'Save Profile Changes'}</span>
            </button>
          </form>
        </div>

        {/* Right Column: Skills & Portfolio Projects */}
        <div>
          {/* Completeness Card */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <h4 style={{ fontSize: '1.1rem' }}>Profile Completeness Score</h4>
              <span style={{ fontSize: '1.35rem', fontWeight: 700, fontFamily: 'var(--font-display)', color: 'var(--color-olive-900)' }}>
                {completeness.score}%
              </span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${completeness.score}%`, height: '100%', background: 'var(--color-olive-700)', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>

          {/* Technical Skills List */}
          <div className="card" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Verified Technical Skills</h4>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem' }}>
              {profile?.skills?.map((s, idx) => (
                <div
                  key={idx}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '0.4rem',
                    padding: '0.35rem 0.65rem',
                    backgroundColor: 'var(--color-bg-warm)',
                    borderRadius: 'var(--radius-pill)',
                    fontSize: '0.8rem',
                  }}
                >
                  <span style={{ fontWeight: 600 }}>{s.skill_name}</span>
                  <span className="badge badge-olive" style={{ fontSize: '0.675rem' }}>
                    {s.proficiency_level}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Projects Portfolio */}
          <div className="card">
            <h4 style={{ fontSize: '1.15rem', marginBottom: '1rem' }}>Completed Portfolio Projects</h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {profile?.projects?.map((p) => (
                <div
                  key={p.project_id}
                  style={{
                    padding: '0.75rem',
                    backgroundColor: 'var(--color-bg-warm)',
                    borderRadius: 'var(--radius-md)',
                    fontSize: '0.825rem',
                  }}
                >
                  <strong style={{ color: 'var(--color-olive-900)' }}>{p.project_title}</strong>
                  <div style={{ color: 'var(--text-muted)', fontSize: '0.75rem', marginTop: '0.2rem' }}>
                    Domain: {p.project_domain} • Stack: {p.technology_stack || 'General Tech'}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
