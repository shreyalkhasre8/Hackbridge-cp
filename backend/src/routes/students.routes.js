/**
 * HackBridge Student Routes & Profile Management
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';

const router = Router();

// Calculate student profile completeness score
function getCompleteness(student, skills = [], projects = []) {
  let score = 0;
  const missing = [];

  if (student.student_name) score += 10;
  if (student.college_id) score += 10; else missing.push('College affiliation');
  if (student.branch && student.year) score += 15; else missing.push('Academic branch & year');
  if (student.primary_role) score += 15; else missing.push('Primary technical role');
  if (skills.length >= 3) score += 20; else if (skills.length > 0) score += 10; else missing.push('At least 3 technical skills');
  if (projects.length >= 1) score += 15; else missing.push('Completed projects portfolio');
  if (student.github_available) score += 5; else missing.push('GitHub profile URL');
  if (student.portfolio_available) score += 5; else missing.push('Personal portfolio website');
  if (student.availability_hours_per_week > 0) score += 5; else missing.push('Weekly availability hours');

  return {
    score: Math.min(100, score),
    missing_fields: missing,
    is_complete: missing.length === 0,
  };
}

// GET /api/students
router.get('/', (req, res) => {
  const {
    search = '',
    college_id,
    primary_role,
    experience_level,
    skill,
    page = 1,
    limit = 20,
  } = req.query;

  let results = Array.from(dataStore.students.values());

  if (college_id) {
    results = results.filter(s => s.college_id === college_id);
  }

  if (primary_role) {
    results = results.filter(s => s.primary_role.toLowerCase() === primary_role.toLowerCase());
  }

  if (experience_level) {
    results = results.filter(s => s.experience_level.toLowerCase() === experience_level.toLowerCase());
  }

  if (skill) {
    const matchingStuIds = new Set();
    for (const [stuId, sList] of dataStore.studentSkills.entries()) {
      if (sList.some(sk => sk.skill_name.toLowerCase().includes(skill.toLowerCase()))) {
        matchingStuIds.add(stuId);
      }
    }
    results = results.filter(s => matchingStuIds.has(s.student_id));
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(s =>
      s.student_name.toLowerCase().includes(q) ||
      s.branch.toLowerCase().includes(q) ||
      s.primary_role.toLowerCase().includes(q) ||
      s.city.toLowerCase().includes(q)
    );
  }

  const total = results.length;
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  const startIndex = (p - 1) * l;
  const paginated = results.slice(startIndex, startIndex + l);

  const enhanced = paginated.map(s => {
    const college = dataStore.colleges.get(s.college_id);
    const skills = dataStore.studentSkills.get(s.student_id) || [];
    return {
      ...s,
      college_name: college ? college.college_name : s.college_id,
      college_city: college ? college.city : s.city,
      skills: skills.slice(0, 5),
    };
  });

  res.json({
    success: true,
    data: enhanced,
    pagination: {
      total,
      page: p,
      limit: l,
      total_pages: Math.ceil(total / l),
    },
  });
});

// GET /api/students/:id
router.get('/:id', (req, res) => {
  const student = dataStore.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student not found' });
  }

  const college = dataStore.colleges.get(student.college_id);
  const skills = dataStore.studentSkills.get(student.student_id) || [];
  const projects = dataStore.projects.get(student.student_id) || [];
  const participations = dataStore.hackathonParticipation.filter(p => p.student_id === student.student_id);

  // Teams where student is a member
  const memberTeams = [];
  for (const [teamId, members] of dataStore.teamMembers.entries()) {
    const match = members.find(m => m.student_id === student.student_id);
    if (match) {
      const team = dataStore.teams.get(teamId);
      if (team) {
        memberTeams.push({
          ...team,
          assigned_role: match.assigned_role,
          join_status: match.join_status,
          hackathon: dataStore.hackathons.get(team.hackathon_id),
        });
      }
    }
  }

  const completeness = getCompleteness(student, skills, projects);

  res.json({
    success: true,
    data: {
      ...student,
      college_name: college ? college.college_name : student.college_id,
      skills,
      projects,
      participations: participations.map(p => ({
        ...p,
        hackathon_name: dataStore.hackathons.get(p.hackathon_id)?.hackathon_name || p.hackathon_id,
      })),
      teams: memberTeams,
      completeness,
    },
  });
});

// PUT /api/students/:id
router.put('/:id', authenticate, (req, res) => {
  const student = dataStore.students.get(req.params.id);
  if (!student) {
    return res.status(404).json({ success: false, message: 'Student profile not found' });
  }

  const {
    student_name,
    branch,
    year,
    cgpa,
    primary_role,
    experience_level,
    github_available,
    portfolio_available,
    preferred_team_size,
    availability_hours_per_week,
  } = req.body;

  if (student_name !== undefined) student.student_name = student_name;
  if (branch !== undefined) student.branch = branch;
  if (year !== undefined) student.year = parseInt(year, 10);
  if (cgpa !== undefined) student.cgpa = parseFloat(cgpa);
  if (primary_role !== undefined) student.primary_role = primary_role;
  if (experience_level !== undefined) student.experience_level = experience_level;
  if (github_available !== undefined) student.github_available = parseInt(github_available, 10);
  if (portfolio_available !== undefined) student.portfolio_available = parseInt(portfolio_available, 10);
  if (preferred_team_size !== undefined) student.preferred_team_size = parseInt(preferred_team_size, 10);
  if (availability_hours_per_week !== undefined) student.availability_hours_per_week = parseInt(availability_hours_per_week, 10);

  dataStore.students.set(student.student_id, student);

  const skills = dataStore.studentSkills.get(student.student_id) || [];
  const projects = dataStore.projects.get(student.student_id) || [];
  const completeness = getCompleteness(student, skills, projects);

  res.json({
    success: true,
    message: 'Profile updated successfully',
    data: { ...student, completeness },
  });
});

// GET /api/students/:id/completeness
router.get('/:id/completeness', (req, res) => {
  const student = dataStore.students.get(req.params.id);
  if (!student) return res.status(404).json({ success: false, message: 'Student not found' });

  const skills = dataStore.studentSkills.get(student.student_id) || [];
  const projects = dataStore.projects.get(student.student_id) || [];
  const completeness = getCompleteness(student, skills, projects);

  res.json({
    success: true,
    data: completeness,
  });
});

export default router;
