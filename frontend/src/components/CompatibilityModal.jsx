import React from 'react';
import { X, CheckCircle2, AlertTriangle, Sparkles, BookOpen, Layers, Users, Zap } from 'lucide-react';

export default function CompatibilityModal({ isOpen, onClose, data, hackathonName, teamName }) {
  if (!isOpen || !data) return null;

  const {
    overall_compatibility_score = 0,
    skill_match_percentage = 0,
    experience_match_percentage = 0,
    domain_match_percentage = 0,
    team_completeness_percentage = 0,
    recommended = 0,
    is_eligible = true,
    eligibility_issues = [],
    explanations = [],
    missing_skills = [],
  } = data;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '640px' }}>
        {/* Modal Header */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1.5rem' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.35rem' }}>
              <span className="badge badge-olive">Explainable Recommendation Engine</span>
              {recommended === 1 && <span className="badge badge-accent">Recommended Event</span>}
            </div>
            <h3 style={{ fontSize: '1.45rem' }}>Compatibility Analysis</h3>
            <p style={{ fontSize: '0.875rem' }}>
              Evaluation between <strong>{teamName || 'Your Team'}</strong> and <strong>{hackathonName || 'Hackathon Event'}</strong>
            </p>
          </div>
          <button
            onClick={onClose}
            style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}
          >
            <X size={22} />
          </button>
        </div>

        {/* Overall Score Banner */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: 'var(--color-bg-warm)',
          padding: '1.25rem 1.5rem',
          borderRadius: 'var(--radius-lg)',
          marginBottom: '1.5rem',
          border: '1px solid var(--border-subtle)',
        }}>
          <div>
            <div style={{ fontSize: '0.825rem', fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
              Weighted Match Score
            </div>
            <div style={{ fontSize: '2.5rem', fontFamily: 'var(--font-display)', fontWeight: 700, color: 'var(--color-olive-900)' }}>
              {overall_compatibility_score.toFixed(1)}%
            </div>
          </div>
          <div style={{ textAlign: 'right', maxWidth: '240px' }}>
            {is_eligible ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-success)', fontWeight: 600, fontSize: '0.9rem' }}>
                <CheckCircle2 size={18} />
                <span>Eligible for Registration</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', color: 'var(--color-danger)', fontWeight: 600, fontSize: '0.9rem' }}>
                <AlertTriangle size={18} />
                <span>Eligibility Warning</span>
              </div>
            )}
            <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', marginTop: '0.25rem' }}>
              Formula: 45% Skills + 20% Exp + 20% Domain + 15% Completeness
            </div>
          </div>
        </div>

        {/* Eligibility Issues Alert */}
        {!is_eligible && eligibility_issues.length > 0 && (
          <div style={{
            background: 'var(--color-danger-bg)',
            border: '1px solid rgba(163, 42, 42, 0.3)',
            borderRadius: 'var(--radius-md)',
            padding: '0.85rem 1rem',
            marginBottom: '1.5rem',
          }}>
            <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--color-danger)', marginBottom: '0.35rem' }}>
              Eligibility Criteria Not Met:
            </div>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.825rem', color: 'var(--color-danger)' }}>
              {eligibility_issues.map((issue, idx) => (
                <li key={idx}>{issue}</li>
              ))}
            </ul>
          </div>
        )}

        {/* 4 Formula Component Bars */}
        <div style={{ marginBottom: '1.5rem' }}>
          <h4 style={{ fontSize: '1rem', marginBottom: '1rem', fontFamily: 'var(--font-sans)', fontWeight: 700 }}>
            Component Score Breakdown
          </h4>

          {/* 1. Skill Match */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Zap size={14} color="var(--color-olive-600)" /> Required Skills Match (45% weight)
              </span>
              <span style={{ fontWeight: 700 }}>{skill_match_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, skill_match_percentage)}%`, height: '100%', background: 'var(--color-olive-700)', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>

          {/* 2. Experience Match */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Layers size={14} color="var(--color-olive-600)" /> Experience Level Alignment (20% weight)
              </span>
              <span style={{ fontWeight: 700 }}>{experience_match_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, experience_match_percentage)}%`, height: '100%', background: 'var(--color-accent-400)', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>

          {/* 3. Domain Match */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <BookOpen size={14} color="var(--color-olive-600)" /> Project Domain Relevance (20% weight)
              </span>
              <span style={{ fontWeight: 700 }}>{domain_match_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, domain_match_percentage)}%`, height: '100%', background: 'var(--color-olive-500)', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>

          {/* 4. Team Completeness */}
          <div style={{ marginBottom: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '0.35rem' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.35rem', fontWeight: 600 }}>
                <Users size={14} color="var(--color-olive-600)" /> Team Size & Completeness (15% weight)
              </span>
              <span style={{ fontWeight: 700 }}>{team_completeness_percentage.toFixed(1)}%</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: 'var(--color-bg-warm)', borderRadius: 'var(--radius-pill)', overflow: 'hidden' }}>
              <div style={{ width: `${Math.min(100, team_completeness_percentage)}%`, height: '100%', background: 'var(--color-rust-500)', borderRadius: 'var(--radius-pill)' }} />
            </div>
          </div>
        </div>

        {/* Explainable Reasoning */}
        {explanations.length > 0 && (
          <div style={{ marginBottom: '1.5rem', background: 'var(--color-bg-surface-elevated)', padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-subtle)' }}>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
              Analysis Highlights:
            </h5>
            <ul style={{ paddingLeft: '1.25rem', fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
              {explanations.map((exp, idx) => (
                <li key={idx} style={{ marginBottom: '0.25rem' }}>{exp}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Missing Skills Warning */}
        {missing_skills.length > 0 && (
          <div style={{ marginBottom: '1.5rem' }}>
            <h5 style={{ fontSize: '0.875rem', fontWeight: 700, marginBottom: '0.5rem', fontFamily: 'var(--font-sans)' }}>
              Identified Skill Gaps for this Event:
            </h5>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.4rem' }}>
              {missing_skills.map((s, idx) => (
                <span key={idx} className="badge badge-warning">
                  {s.skill_name} (wt: {s.importance_weight})
                </span>
              ))}
            </div>
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1.5rem' }}>
          <button className="btn btn-primary" onClick={onClose}>
            Close Analysis
          </button>
        </div>
      </div>
    </div>
  );
}
