/**
 * HackBridge Team Management & Smart Formation Routes
 */

import { Router } from 'express';
import { dataStore } from '../repositories/dataStore.js';
import { authenticate } from '../middleware/auth.js';
import {
  analyzeTeamCompleteness,
  recommendTeammatesForTeam,
} from '../services/teamFormationEngine.js';

const router = Router();

// GET /api/teams
router.get('/', (req, res) => {
  const {
    hackathon_id,
    team_status,
    search = '',
    page = 1,
    limit = 20,
  } = req.query;

  let results = Array.from(dataStore.teams.values());

  if (hackathon_id) {
    results = results.filter(t => t.hackathon_id === hackathon_id);
  }

  if (team_status) {
    results = results.filter(t => t.team_status.toLowerCase() === team_status.toLowerCase());
  }

  if (search) {
    const q = search.toLowerCase();
    results = results.filter(t =>
      t.team_name.toLowerCase().includes(q) ||
      t.team_id.toLowerCase().includes(q)
    );
  }

  const total = results.length;
  const p = parseInt(page, 10);
  const l = parseInt(limit, 10);
  const startIndex = (p - 1) * l;
  const paginated = results.slice(startIndex, startIndex + l);

  const enhanced = paginated.map(t => {
    const hackathon = dataStore.hackathons.get(t.hackathon_id);
    const leader = dataStore.students.get(t.leader_student_id);
    const members = dataStore.teamMembers.get(t.team_id) || [];
    const acceptedCount = members.filter(m => m.join_status === 'Accepted').length || t.team_size;

    return {
      ...t,
      team_size: acceptedCount,
      hackathon_name: hackathon ? hackathon.hackathon_name : t.hackathon_id,
      hackathon_domain: hackathon ? hackathon.domain : '',
      hackathon_deadline: hackathon ? hackathon.registration_deadline : '',
      leader_name: leader ? leader.student_name : t.leader_student_id,
      college_id: leader ? leader.college_id : null,
      college_name: leader ? (dataStore.colleges.get(leader.college_id)?.college_name) : null,
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

// GET /api/teams/:id
router.get('/:id', (req, res) => {
  const team = dataStore.teams.get(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found' });

  const hackathon = dataStore.hackathons.get(team.hackathon_id);
  const leader = dataStore.students.get(team.leader_student_id);
  const rawMembers = dataStore.teamMembers.get(team.team_id) || [];

  const members = rawMembers.map(m => {
    const student = dataStore.students.get(m.student_id);
    const skills = student ? (dataStore.studentSkills.get(student.student_id) || []) : [];
    const college = student ? dataStore.colleges.get(student.college_id) : null;
    return {
      ...m,
      student_name: student ? student.student_name : m.student_id,
      branch: student ? student.branch : '',
      college_name: college ? college.college_name : '',
      primary_role: student ? student.primary_role : '',
      cgpa: student ? student.cgpa : null,
      skills: skills.slice(0, 4),
    };
  });

  // Include leader if missing from member list
  if (!members.some(m => m.student_id === team.leader_student_id) && leader) {
    const leaderCollege = dataStore.colleges.get(leader.college_id);
    members.unshift({
      team_id: team.team_id,
      student_id: leader.student_id,
      assigned_role: 'Team Leader',
      join_status: 'Accepted',
      student_name: leader.student_name,
      branch: leader.branch,
      college_name: leaderCollege ? leaderCollege.college_name : '',
      primary_role: leader.primary_role,
      cgpa: leader.cgpa,
      skills: (dataStore.studentSkills.get(leader.student_id) || []).slice(0, 4),
    });
  }

  // Pending Applications
  const applications = dataStore.teamApplications
    .filter(a => a.team_id === team.team_id)
    .map(a => {
      const stu = dataStore.students.get(a.student_id);
      return {
        ...a,
        student_name: stu ? stu.student_name : a.student_id,
        primary_role: stu ? stu.primary_role : '',
      };
    });

  // Mentors assigned to this team
  const mentorMappings = dataStore.teamMentorMapping.get(team.team_id) || [];
  const assignedMentors = mentorMappings.map(mm => {
    const mentor = dataStore.mentors.get(mm.mentor_id);
    return {
      ...mm,
      mentor_name: mentor ? mentor.mentor_name : mm.mentor_id,
      specialization: mentor ? mentor.specialization : '',
      rating: mentor ? mentor.rating : null,
    };
  });

  res.json({
    success: true,
    data: {
      ...team,
      hackathon,
      leader,
      members,
      applications,
      assigned_mentors: assignedMentors,
    },
  });
});

// POST /api/teams (Create team)
router.post('/', authenticate, (req, res) => {
  const { team_name, hackathon_id, leader_student_id, target_role } = req.body;

  if (!team_name || !hackathon_id) {
    return res.status(400).json({
      success: false,
      message: 'Team name and hackathon ID are required.',
    });
  }

  const leaderId = leader_student_id || req.user.profile_id || 'STU0001';
  const leader = dataStore.students.get(leaderId);
  const hackathon = dataStore.hackathons.get(hackathon_id);

  if (!hackathon) {
    return res.status(404).json({ success: false, message: 'Selected hackathon not found.' });
  }

  // Constraint: Student cannot join or lead two teams in the same event
  for (const t of dataStore.teams.values()) {
    if (t.hackathon_id === hackathon_id) {
      if (t.leader_student_id === leaderId) {
        return res.status(400).json({
          success: false,
          message: 'You already lead a team for this hackathon.',
        });
      }
      const members = dataStore.teamMembers.get(t.team_id) || [];
      if (members.some(m => m.student_id === leaderId && m.join_status === 'Accepted')) {
        return res.status(400).json({
          success: false,
          message: 'You are already registered on a team for this event.',
        });
      }
    }
  }

  const teamId = `TEAM_${Date.now().toString().slice(-6)}`;
  const newTeam = {
    team_id: teamId,
    team_name,
    leader_student_id: leaderId,
    hackathon_id,
    team_size: 1,
    team_status: 'Forming',
    experience_score: leader ? (leader.cgpa * 10) : 60,
    skill_diversity_score: 35.0,
    created_at: new Date().toISOString(),
  };

  dataStore.teams.set(teamId, newTeam);

  // Add leader as accepted member
  dataStore.teamMembers.set(teamId, [
    {
      team_id: teamId,
      student_id: leaderId,
      assigned_role: target_role || (leader ? leader.primary_role : 'Team Leader'),
      join_status: 'Accepted',
    },
  ]);

  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Team created successfully!',
    data: newTeam,
  });
});

// POST /api/teams/:id/apply (Join request)
router.post('/:id/apply', authenticate, (req, res) => {
  const team = dataStore.teams.get(req.params.id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  const studentId = req.body.student_id || req.user.profile_id || 'STU0001';
  const { message = 'I would love to collaborate with your team!' } = req.body;

  // Check if student already in team
  const members = dataStore.teamMembers.get(team.team_id) || [];
  if (members.some(m => m.student_id === studentId)) {
    return res.status(400).json({
      success: false,
      message: 'You are already a member or have an active status in this team.',
    });
  }

  // Check duplicate application
  const existingApp = dataStore.teamApplications.find(
    a => a.team_id === team.team_id && a.student_id === studentId && a.status === 'pending'
  );
  if (existingApp) {
    return res.status(400).json({
      success: false,
      message: 'You already have a pending join application for this team.',
    });
  }

  const newApp = {
    id: `APP_${Date.now()}`,
    team_id: team.team_id,
    student_id: studentId,
    message,
    status: 'pending',
    created_at: new Date().toISOString(),
  };

  dataStore.teamApplications.push(newApp);

  // Notify team leader
  dataStore.notifications.push({
    id: `NOTIF_${Date.now()}`,
    user_id: team.leader_student_id,
    title: 'New Team Join Application',
    message: `A student applied to join "${team.team_name}".`,
    type: 'team_application',
    link: `/teams/${team.team_id}`,
    is_read: 0,
    created_at: new Date().toISOString(),
  });

  dataStore.persistOperationalData();

  res.status(201).json({
    success: true,
    message: 'Application submitted to team leader.',
    data: newApp,
  });
});

// POST /api/teams/:id/applications/:appId/decision
router.post('/:id/applications/:appId/decision', authenticate, (req, res) => {
  const { decision } = req.body; // 'accepted' | 'rejected'
  const app = dataStore.teamApplications.find(a => a.id === req.params.appId);
  if (!app) return res.status(404).json({ success: false, message: 'Application not found.' });

  const team = dataStore.teams.get(app.team_id);
  if (!team) return res.status(404).json({ success: false, message: 'Team not found.' });

  // Verify leader permissions
  if (req.user.role !== 'admin' && req.user.profile_id !== team.leader_student_id) {
    return res.status(403).json({ success: false, message: 'Only team leaders can accept or reject applications.' });
  }

  app.status = decision === 'accepted' ? 'accepted' : 'rejected';

  if (decision === 'accepted') {
    const rawMembers = dataStore.teamMembers.get(team.team_id) || [];
    const stu = dataStore.students.get(app.student_id);

    rawMembers.push({
      team_id: team.team_id,
      student_id: app.student_id,
      assigned_role: stu ? stu.primary_role : 'Developer',
      join_status: 'Accepted',
    });

    dataStore.teamMembers.set(team.team_id, rawMembers);
    team.team_size = rawMembers.filter(m => m.join_status === 'Accepted').length;
    dataStore.teams.set(team.team_id, team);
  }

  // Notify applicant
  dataStore.notifications.push({
    id: `NOTIF_${Date.now()}`,
    user_id: app.student_id,
    title: `Team Application ${decision === 'accepted' ? 'Accepted' : 'Declined'}`,
    message: `Your request to join "${team.team_name}" was ${decision}.`,
    type: decision === 'accepted' ? 'team_accepted' : 'team_rejected',
    link: `/teams/${team.team_id}`,
    is_read: 0,
    created_at: new Date().toISOString(),
  });

  dataStore.persistOperationalData();

  res.json({
    success: true,
    message: `Application marked as ${decision}.`,
    data: app,
  });
});

// GET /api/teams/:id/completeness
router.get('/:id/completeness', (req, res) => {
  try {
    const analysis = analyzeTeamCompleteness(req.params.id);
    res.json({ success: true, data: analysis });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

// GET /api/teams/:id/recommended-teammates
router.get('/:id/recommended-teammates', (req, res) => {
  try {
    const limit = parseInt(req.query.limit, 10) || 8;
    const candidates = recommendTeammatesForTeam(req.params.id, limit);
    res.json({ success: true, data: candidates });
  } catch (err) {
    res.status(404).json({ success: false, message: err.message });
  }
});

export default router;
