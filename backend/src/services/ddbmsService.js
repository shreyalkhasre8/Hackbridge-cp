/**
 * HackBridge Distributed Database Management System (DDBMS) Simulation Service
 * Implements horizontal fragmentation across college database nodes,
 * shared reference replication, location transparency, and distributed query execution.
 */

import { dataStore } from '../repositories/dataStore.js';
import { getPool } from '../config/db.js';

// Three simulated autonomous college nodes
export const DDBMS_NODES = [
  {
    node_id: 'NODE_C001',
    college_id: 'C001',
    college_name: 'Sahyadri Institute of Engineering, Pune',
    database_name: 'college_C001_db',
    location: 'Pune, Maharashtra',
    status: 'ONLINE',
    latency_ms: 12,
  },
  {
    node_id: 'NODE_C002',
    college_id: 'C002',
    college_name: 'Sahyadri Institute of Engineering, Mumbai',
    database_name: 'college_C002_db',
    location: 'Mumbai, Maharashtra',
    status: 'ONLINE',
    latency_ms: 18,
  },
  {
    node_id: 'NODE_C003',
    college_id: 'C003',
    college_name: 'Sahyadri Institute of Engineering, Nagpur',
    database_name: 'college_C003_db',
    location: 'Nagpur, Maharashtra',
    status: 'ONLINE',
    latency_ms: 24,
  },
];

class DdbmsService {
  /**
   * Get cluster health and fragment statistics
   */
  getClusterStatus() {
    const nodes = DDBMS_NODES.map(node => {
      // Count records belonging to this node's horizontal fragment
      const studentsInNode = Array.from(dataStore.students.values())
        .filter(s => s.college_id === node.college_id);

      const studentIds = new Set(studentsInNode.map(s => s.student_id));
      const teamsInNode = Array.from(dataStore.teams.values())
        .filter(t => studentIds.has(t.leader_student_id));

      const projectsInNode = Array.from(dataStore.projects.values())
        .flat()
        .filter(p => studentIds.has(p.student_id));

      return {
        ...node,
        fragment_records: {
          students: studentsInNode.length,
          teams: teamsInNode.length,
          projects: projectsInNode.length,
          replicated_skills: dataStore.skills.size,
          replicated_hackathons: dataStore.hackathons.size,
        },
      };
    });

    return {
      master_schema: 'hackbridge_db',
      fragmentation_type: 'Horizontal Fragmentation (by college_id)',
      replication_model: 'Full Read-Replication (skills, hackathons)',
      consistency_protocol: 'Two-Phase Commit (2PC) / Read-Committed Snapshot',
      location_transparency: 'Transparent Client Abstraction Layer',
      nodes,
    };
  }

  /**
   * Execute a distributed query simulation across node fragments
   * @param {string} queryType ('local' | 'union' | 'multi_condition' | 'aggregate' | 'distributed_join')
   * @param {object} params
   */
  async executeDistributedQuery(queryType, params = {}) {
    const startTime = Date.now();
    const fragmentsQueried = [];
    let results = [];
    let sqlPlan = '';

    switch (queryType) {
      case 'local': {
        // Query single node
        const collegeId = params.college_id || 'C001';
        const targetNode = DDBMS_NODES.find(n => n.college_id === collegeId) || DDBMS_NODES[0];
        fragmentsQueried.push(targetNode.database_name);

        const role = params.role || 'Frontend Developer';
        sqlPlan = `SELECT student_name, branch, primary_role, cgpa FROM ${targetNode.database_name}.students WHERE primary_role = '${role}'`;

        results = Array.from(dataStore.students.values())
          .filter(s => s.college_id === collegeId && (!role || s.primary_role.toLowerCase() === role.toLowerCase()))
          .map(s => ({
            fragment: targetNode.database_name,
            node_name: targetNode.college_name,
            student_id: s.student_id,
            student_name: s.student_name,
            branch: s.branch,
            primary_role: s.primary_role,
            cgpa: s.cgpa,
          }));
        break;
      }

      case 'union': {
        // Distributed UNION query across all 3 nodes
        for (const node of DDBMS_NODES) {
          fragmentsQueried.push(node.database_name);
        }
        const skill = params.skill || 'Python';
        sqlPlan = DDBMS_NODES.map(
          n => `SELECT '${n.college_name}' AS node, s.student_name, s.primary_role FROM ${n.database_name}.students s JOIN ${n.database_name}.student_skills ss ON s.student_id = ss.student_id WHERE ss.skill_name LIKE '%${skill}%'`
        ).join('\nUNION ALL\n');

        const matchingStudentIds = new Set();
        for (const [stuId, skills] of dataStore.studentSkills.entries()) {
          if (skills.some(sk => sk.skill_name.toLowerCase().includes(skill.toLowerCase()))) {
            matchingStudentIds.add(stuId);
          }
        }

        for (const node of DDBMS_NODES) {
          const students = Array.from(dataStore.students.values())
            .filter(s => s.college_id === node.college_id && matchingStudentIds.has(s.student_id));

          for (const s of students) {
            results.push({
              fragment: node.database_name,
              node_name: node.college_name,
              student_id: s.student_id,
              student_name: s.student_name,
              branch: s.branch,
              primary_role: s.primary_role,
              matched_skill: skill,
            });
          }
        }
        break;
      }

      case 'multi_condition': {
        // Multi-condition distributed filter: role + availability
        for (const node of DDBMS_NODES) {
          fragmentsQueried.push(node.database_name);
        }
        const minHours = params.min_hours || 15;
        sqlPlan = DDBMS_NODES.map(
          n => `SELECT s.student_name, s.primary_role, s.availability_hours_per_week FROM ${n.database_name}.students s WHERE s.availability_hours_per_week >= ${minHours} AND s.github_available = 1`
        ).join('\nUNION ALL\n');

        for (const node of DDBMS_NODES) {
          const students = Array.from(dataStore.students.values())
            .filter(s => s.college_id === node.college_id && s.availability_hours_per_week >= minHours && s.github_available === 1);

          for (const s of students) {
            results.push({
              fragment: node.database_name,
              node_name: node.college_name,
              student_id: s.student_id,
              student_name: s.student_name,
              primary_role: s.primary_role,
              availability_hours: s.availability_hours_per_week,
              github: true,
            });
          }
        }
        break;
      }

      case 'aggregate': {
        // Distributed aggregation: count per college
        for (const node of DDBMS_NODES) {
          fragmentsQueried.push(node.database_name);
        }
        sqlPlan = DDBMS_NODES.map(
          n => `SELECT '${n.college_name}' AS college, COUNT(*) AS student_count FROM ${n.database_name}.students`
        ).join('\nUNION ALL\n');

        for (const node of DDBMS_NODES) {
          const count = Array.from(dataStore.students.values())
            .filter(s => s.college_id === node.college_id).length;
          results.push({
            fragment: node.database_name,
            node_name: node.college_name,
            total_students: count,
            status: 'Synced',
          });
        }
        break;
      }

      case 'distributed_join': {
        // Distributed Join: Join local student fragment with local team member fragment & replicated hackathon
        for (const node of DDBMS_NODES) {
          fragmentsQueried.push(node.database_name);
        }
        sqlPlan = DDBMS_NODES.map(
          n => `SELECT s.student_name, t.team_name, h.hackathon_name FROM ${n.database_name}.students s JOIN ${n.database_name}.team_members tm ON s.student_id = tm.student_id JOIN ${n.database_name}.teams t ON tm.team_id = t.team_id JOIN ${n.database_name}.replicated_hackathons h ON t.hackathon_id = h.hackathon_id`
        ).join('\nUNION ALL\n');

        for (const node of DDBMS_NODES) {
          const students = Array.from(dataStore.students.values())
            .filter(s => s.college_id === node.college_id);

          for (const s of students.slice(0, 10)) {
            const stuTeams = dataStore.teamMembers.get(s.student_id) || [];
            if (stuTeams.length > 0) {
              const team = dataStore.teams.get(stuTeams[0].team_id);
              if (team) {
                const hackathon = dataStore.hackathons.get(team.hackathon_id);
                results.push({
                  fragment: node.database_name,
                  node_name: node.college_name,
                  student_name: s.student_name,
                  team_name: team.team_name,
                  hackathon_name: hackathon?.hackathon_name || 'Hackathon Event',
                });
              }
            }
          }
        }
        break;
      }

      default:
        throw new Error(`Unsupported distributed query type: ${queryType}`);
    }

    const executionTimeMs = Date.now() - startTime + Math.floor(Math.random() * 8 + 4);

    return {
      query_type: queryType,
      fragments_queried: fragmentsQueried,
      total_rows: results.length,
      execution_time_ms: executionTimeMs,
      sql_execution_plan: sqlPlan,
      results: results.slice(0, 50),
    };
  }
}

export const ddbmsService = new DdbmsService();
