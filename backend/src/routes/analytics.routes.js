/**
 * HackBridge Platform Analytics Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// GET /api/analytics/overview
router.get('/overview', (req, res) => {
  const totalStudents = dataStore.students.size;
  const totalColleges = dataStore.colleges.size;
  const totalHackathons = dataStore.hackathons.size;
  const totalTeams = dataStore.teams.size;
  const totalMentors = dataStore.mentors.size;
  const totalProjects = Array.from(dataStore.projects.values()).flat().length;

  let totalPrizeMoney = 0;
  for (const h of dataStore.hackathons.values()) {
    totalPrizeMoney += h.prize_pool || 0;
  }

  // Count distinct winners across hackathons
  const winnerTeams = new Set();
  for (const p of dataStore.hackathonParticipation) {
    if (p.result && p.result.toLowerCase() === 'winner') {
      winnerTeams.add(p.team_id);
    }
  }

  res.json({
    success: true,
    data: {
      total_students: totalStudents,
      total_colleges: totalColleges,
      total_hackathons: totalHackathons,
      total_teams: totalTeams,
      total_mentors: totalMentors,
      total_projects: totalProjects,
      total_prize_pool_inr: totalPrizeMoney,
      distinct_winning_teams: winnerTeams.size,
      total_compatibility_calculations: dataStore.teamCompatibility.size,
      pool_active_students: dataStore.matchingPool.size,
    },
  });
});

// GET /api/analytics/colleges
router.get('/colleges', (req, res) => {
  // Aggregate participation, teams, and wins by college
  const collegeStats = new Map();

  for (const c of dataStore.colleges.values()) {
    collegeStats.set(c.college_id, {
      college_id: c.college_id,
      college_name: c.college_name,
      city: c.city,
      state: c.state,
      student_count: 0,
      team_count: 0,
      wins_count: 0,
    });
  }

  // Student count
  for (const s of dataStore.students.values()) {
    const entry = collegeStats.get(s.college_id);
    if (entry) entry.student_count++;
  }

  // Team count & Wins by distinct team
  const winningTeamsSeen = new Set();
  for (const p of dataStore.hackathonParticipation) {
    if (p.result && p.result.toLowerCase() === 'winner') {
      winningTeamsSeen.add(p.team_id);
    }
  }

  for (const t of dataStore.teams.values()) {
    const leader = dataStore.students.get(t.leader_student_id);
    if (leader && collegeStats.has(leader.college_id)) {
      const entry = collegeStats.get(leader.college_id);
      entry.team_count++;
      if (winningTeamsSeen.has(t.team_id)) {
        entry.wins_count++;
      }
    }
  }

  const sorted = Array.from(collegeStats.values())
    .sort((a, b) => b.team_count - a.team_count)
    .slice(0, 15);

  res.json({ success: true, data: sorted });
});

// GET /api/analytics/domains
router.get('/domains', (req, res) => {
  const domainCounts = {};

  for (const h of dataStore.hackathons.values()) {
    const d = h.domain || 'Other';
    domainCounts[d] = (domainCounts[d] || 0) + 1;
  }

  const chartData = Object.entries(domainCounts).map(([name, count]) => ({
    name,
    hackathons: count,
  })).sort((a, b) => b.hackathons - a.hackathons);

  res.json({ success: true, data: chartData });
});

// GET /api/analytics/skills
router.get('/skills', (req, res) => {
  const demand = {};
  const supply = {};

  // Demand from required skills
  for (const skills of dataStore.hackathonRequiredSkills.values()) {
    for (const s of skills) {
      const name = s.skill_name || s.skill_id;
      demand[name] = (demand[name] || 0) + 1;
    }
  }

  // Supply from student skills
  for (const skills of dataStore.studentSkills.values()) {
    for (const s of skills) {
      const name = s.skill_name || s.skill_id;
      supply[name] = (supply[name] || 0) + 1;
    }
  }

  const topSkills = Object.keys(demand)
    .sort((a, b) => demand[b] - demand[a])
    .slice(0, 10)
    .map(name => ({
      skill: name,
      demand_count: demand[name] || 0,
      student_supply: supply[name] || 0,
    }));

  res.json({ success: true, data: topSkills });
});

export default router;
