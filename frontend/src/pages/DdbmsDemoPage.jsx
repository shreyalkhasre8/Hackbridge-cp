/**
 * HackBridge Distributed Database Management System (DDBMS) Simulation Page
 * Demonstrates 3-node horizontal fragmentation, full reference replication,
 * location transparency, and distributed query execution.
 */

import React, { useState, useEffect } from 'react';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import {
  Database,
  Server,
  Play,
  Cpu,
  RefreshCw,
  Layers,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Clock,
  Terminal,
} from 'lucide-react';

export default function DdbmsDemoPage() {
  const { addToast } = useAuth();
  const [cluster, setCluster] = useState(null);
  const [loadingCluster, setLoadingCluster] = useState(true);
  const [queryType, setQueryType] = useState('union');
  const [skillFilter, setSkillFilter] = useState('Python');
  const [roleFilter, setRoleFilter] = useState('Frontend Developer');
  const [executing, setExecuting] = useState(false);
  const [queryResult, setQueryResult] = useState(null);

  const fetchCluster = async () => {
    setLoadingCluster(true);
    try {
      const res = await api.ddbms.getCluster();
      if (res.success) setCluster(res.data);
    } catch (e) {
      console.warn('Error fetching DDBMS cluster:', e);
    } finally {
      setLoadingCluster(false);
    }
  };

  useEffect(() => {
    fetchCluster();
    // Run default query
    handleRunQuery('union');
  }, []);

  const handleRunQuery = async (type = queryType) => {
    setExecuting(true);
    try {
      const res = await api.ddbms.runQuery(type, {
        skill: skillFilter,
        role: roleFilter,
        college_id: 'C001',
      });
      if (res.success) {
        setQueryResult(res.data);
        addToast(`Distributed query executed across ${res.data.fragments_queried?.length} nodes`, 'success');
      }
    } catch (err) {
      addToast(err.message || 'Distributed query failed', 'danger');
    } finally {
      setExecuting(false);
    }
  };

  return (
    <div className="page-container">
      {/* Header */}
      <div style={{ marginBottom: '2.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.45rem', marginBottom: '0.35rem' }}>
          <span className="badge badge-accent">Academic Requirement 13</span>
          <span className="badge badge-olive">Autonomous Node Simulation</span>
        </div>
        <h2 style={{ fontSize: '2.2rem' }}>Distributed Database Management System (DDBMS)</h2>
        <p style={{ fontSize: '0.95rem', maxWidth: '760px' }}>
          Demonstrates horizontal fragmentation of student rosters by college node, read-replicated reference tables (skills & hackathons), and transparent distributed query execution.
        </p>
      </div>

      {/* 3 Autonomous Nodes Visual Grid */}
      <div style={{ marginBottom: '2.5rem' }}>
        <h3 style={{ fontSize: '1.35rem', marginBottom: '1rem' }}>Simulated College Autonomous Nodes</h3>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '1.5rem',
        }}>
          {cluster?.nodes?.map((node, idx) => (
            <div key={node.node_id} className="card" style={{ borderTop: '4px solid var(--color-olive-700)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                  <Server size={18} color="var(--color-olive-700)" />
                  <strong style={{ fontSize: '0.95rem' }}>Node {String.fromCharCode(65 + idx)}</strong>
                </div>
                <span className="badge badge-success">● {node.status}</span>
              </div>

              <h4 style={{ fontSize: '1.05rem', marginBottom: '0.25rem', color: 'var(--color-olive-900)' }}>
                {node.college_name}
              </h4>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Schema: <code style={{ color: 'var(--color-olive-800)' }}>{node.database_name}</code> • Latency: {node.latency_ms}ms
              </div>

              {/* Fragment Statistics */}
              <div style={{
                backgroundColor: 'var(--color-bg-warm)',
                padding: '0.75rem',
                borderRadius: 'var(--radius-md)',
                fontSize: '0.775rem',
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '0.5rem',
              }}>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Local Students</span>
                  <strong>{node.fragment_records?.students} records</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Local Teams</span>
                  <strong>{node.fragment_records?.teams} records</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Replicated Skills</span>
                  <strong>{node.fragment_records?.replicated_skills} synced</strong>
                </div>
                <div>
                  <span style={{ color: 'var(--text-muted)', display: 'block' }}>Replicated Events</span>
                  <strong>{node.fragment_records?.replicated_hackathons} synced</strong>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Interactive Distributed Query Runner */}
      <div className="card" style={{ marginBottom: '2.5rem', padding: '2rem' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem', flexWrap: 'wrap', gap: '1rem' }}>
          <div>
            <h3 style={{ fontSize: '1.45rem' }}>Interactive Distributed Query Console</h3>
            <p style={{ fontSize: '0.85rem' }}>Select a distributed query pattern to evaluate query decomposition across fragments.</p>
          </div>

          <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
            <button
              className={`btn btn-sm ${queryType === 'union' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setQueryType('union'); handleRunQuery('union'); }}
            >
              Distributed UNION
            </button>
            <button
              className={`btn btn-sm ${queryType === 'multi_condition' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setQueryType('multi_condition'); handleRunQuery('multi_condition'); }}
            >
              Multi-Condition Filter
            </button>
            <button
              className={`btn btn-sm ${queryType === 'aggregate' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setQueryType('aggregate'); handleRunQuery('aggregate'); }}
            >
              Distributed Aggregate
            </button>
            <button
              className={`btn btn-sm ${queryType === 'distributed_join' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setQueryType('distributed_join'); handleRunQuery('distributed_join'); }}
            >
              Distributed JOIN
            </button>
            <button
              className={`btn btn-sm ${queryType === 'local' ? 'btn-primary' : 'btn-secondary'}`}
              onClick={() => { setQueryType('local'); handleRunQuery('local'); }}
            >
              Local Fragment
            </button>
          </div>
        </div>

        {/* SQL Execution Plan Box */}
        {queryResult && (
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: 'var(--color-olive-900)',
              color: '#FFFFFF',
              padding: '0.65rem 1rem',
              borderTopLeftRadius: 'var(--radius-md)',
              borderTopRightRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              fontWeight: 600,
            }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '0.4rem' }}>
                <Terminal size={14} color="var(--color-accent-400)" />
                <span>Distributed SQL Execution Plan</span>
              </span>
              <span style={{ color: 'var(--color-accent-300)' }}>
                Time: {queryResult.execution_time_ms}ms • Nodes: {queryResult.fragments_queried?.length}
              </span>
            </div>
            <pre style={{
              backgroundColor: '#162216',
              color: '#A8D5A8',
              padding: '1.25rem',
              borderBottomLeftRadius: 'var(--radius-md)',
              borderBottomRightRadius: 'var(--radius-md)',
              fontFamily: 'var(--font-mono)',
              fontSize: '0.825rem',
              overflowX: 'auto',
              lineHeight: 1.6,
            }}>
              {queryResult.sql_execution_plan}
            </pre>
          </div>
        )}

        {/* Results Table */}
        {queryResult && queryResult.results && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
              <span style={{ fontSize: '0.9rem', fontWeight: 700 }}>
                Query Execution Results ({queryResult.total_rows} Rows Retrieved)
              </span>
              <span className="badge badge-olive">
                Fragments Queried: {queryResult.fragments_queried?.join(', ')}
              </span>
            </div>

            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
                <thead>
                  <tr style={{ backgroundColor: 'var(--color-bg-warm)', borderBottom: '2px solid var(--border-default)', textAlign: 'left' }}>
                    <th style={{ padding: '0.75rem 1rem' }}>Fragment Source</th>
                    <th style={{ padding: '0.75rem 1rem' }}>College Node</th>
                    {queryType === 'aggregate' ? (
                      <th style={{ padding: '0.75rem 1rem' }}>Total Talent Count</th>
                    ) : (
                      <>
                        <th style={{ padding: '0.75rem 1rem' }}>Student Name</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Field / Role</th>
                        <th style={{ padding: '0.75rem 1rem' }}>Matched Detail</th>
                      </>
                    )}
                  </tr>
                </thead>
                <tbody>
                  {queryResult.results.slice(0, 8).map((row, idx) => (
                    <tr key={idx} style={{ borderBottom: '1px solid var(--border-subtle)' }}>
                      <td style={{ padding: '0.75rem 1rem', fontFamily: 'var(--font-mono)', fontSize: '0.8rem', color: 'var(--color-olive-700)' }}>
                        {row.fragment}
                      </td>
                      <td style={{ padding: '0.75rem 1rem', fontWeight: 600 }}>{row.node_name}</td>
                      {queryType === 'aggregate' ? (
                        <td style={{ padding: '0.75rem 1rem', fontWeight: 700, color: 'var(--color-olive-900)' }}>
                          {row.total_students} Students Synced
                        </td>
                      ) : (
                        <>
                          <td style={{ padding: '0.75rem 1rem' }}>{row.student_name}</td>
                          <td style={{ padding: '0.75rem 1rem' }}>{row.primary_role || row.team_name}</td>
                          <td style={{ padding: '0.75rem 1rem', color: 'var(--text-muted)' }}>
                            {row.matched_skill || row.hackathon_name || (row.availability_hours ? `${row.availability_hours} hrs/wk` : `CGPA: ${row.cgpa}`)}
                          </td>
                        </>
                      )}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
