/**
 * HackBridge Platform Analytics Page
 * Built with Recharts: College participation, domain distribution, and skill supply vs demand.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { BarChart3, TrendingUp, Award, Layers, Sparkles } from 'lucide-react';

const COLORS = ['#223222', '#D99511', '#527052', '#C75736', '#23547B', '#8C5D08', '#718F71'];

export default function AnalyticsPage() {
  const [overview, setOverview] = useState(null);
  const [colleges, setColleges] = useState([]);
  const [domains, setDomains] = useState([]);
  const [skills, setSkills] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadAnalytics() {
      try {
        const [overRes, colRes, domRes, skRes] = await Promise.all([
          api.analytics.getOverview(),
          api.analytics.getColleges(),
          api.analytics.getDomains(),
          api.analytics.getSkills(),
        ]);
        if (overRes.success) setOverview(overRes.data);
        if (colRes.success) setColleges(colRes.data || []);
        if (domRes.success) setDomains(domRes.data || []);
        if (skRes.success) setSkills(skRes.data || []);
      } catch (e) {
        console.warn('Analytics fetch error:', e);
      } finally {
        setLoading(false);
      }
    }
    loadAnalytics();
  }, []);

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-olive">Dataset Relational Intelligence</span>
          <span className="badge badge-accent">Interactive Visualizations</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Platform Analytics & Insights</h2>
        <p style={{ fontSize: '0.95rem' }}>
          Real-time metrics computed directly from 1,200 student records, 720 teams, and 180 hackathon specifications.
        </p>
      </div>

      {/* KPI Stats Grid */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '1.25rem',
        marginBottom: '2.5rem',
      }}>
        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Students</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            {overview?.total_students?.toLocaleString() || '1,200'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)' }}>Across 60 Institutions</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Active Teams</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            {overview?.total_teams?.toLocaleString() || '720'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)' }}>Multi-College Rosters</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Distinct Winning Teams</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-accent-700)' }}>
            {overview?.distinct_winning_teams || '120'}
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Unique historical rosters</span>
        </div>

        <div className="card">
          <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Total Prize Money</span>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
            ₹{(overview?.total_prize_pool_inr ? (overview.total_prize_pool_inr / 10000000).toFixed(1) : '18.4')} Cr
          </div>
          <span style={{ fontSize: '0.75rem', color: 'var(--color-olive-600)' }}>Curated Opportunities</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(420px, 1fr))', gap: '2rem', marginBottom: '2.5rem' }}>
        {/* Chart 1: College Participation & Wins */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Top Participating Colleges</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Teams created vs distinct event wins (evaluates institutional collaboration).
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <BarChart data={colleges.slice(0, 7)} margin={{ top: 10, right: 10, left: -20, bottom: 40 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D5" />
                <XAxis dataKey="college_name" tick={{ fontSize: 10 }} interval={0} angle={-25} textAnchor="end" />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DDD5C4' }} />
                <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
                <Bar dataKey="team_count" name="Teams Formed" fill="#223222" radius={[4, 4, 0, 0]} />
                <Bar dataKey="wins_count" name="Event Wins" fill="#D99511" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Chart 2: Domain Distribution */}
        <div className="card">
          <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Hackathon Domain Breakdown</h3>
          <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
            Distribution of 180 hackathons across key technology domains.
          </p>
          <div style={{ width: '100%', height: 320 }}>
            <ResponsiveContainer>
              <PieChart>
                <Pie
                  data={domains}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  innerRadius={50}
                  paddingAngle={3}
                  dataKey="hackathons"
                  nameKey="name"
                  label={({ name, percent }) => `${name.slice(0, 10)} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {domains.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Chart 3: Skill Demand vs Supply */}
      <div className="card">
        <h3 style={{ fontSize: '1.25rem', marginBottom: '0.5rem' }}>Skill Demand vs Student Supply</h3>
        <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1.5rem' }}>
          Skills demanded by event requirements vs skills recorded across 1,200 student profiles.
        </p>
        <div style={{ width: '100%', height: 320 }}>
          <ResponsiveContainer>
            <BarChart data={skills} margin={{ top: 10, right: 10, left: -20, bottom: 20 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#E8E2D5" />
              <XAxis dataKey="skill" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} />
              <Tooltip contentStyle={{ backgroundColor: '#FFFFFF', borderRadius: '8px', border: '1px solid #DDD5C4' }} />
              <Legend verticalAlign="top" wrapperStyle={{ paddingBottom: '10px' }} />
              <Bar dataKey="demand_count" name="Hackathon Demand" fill="#C75736" radius={[4, 4, 0, 0]} />
              <Bar dataKey="student_supply" name="Student Supply" fill="#527052" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
