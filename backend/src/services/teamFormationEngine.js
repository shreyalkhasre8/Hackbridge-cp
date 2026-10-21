/**
 * HackBridge Smart Team Formation Engine
 * Forms balanced, complementary teams by analyzing role coverage,
 * missing skills, availability overlap, and domain interest.
 */

import { dataStore } from '../repositories/dataStore.js';

const DESIRED_ROLES = [
  'Frontend Developer',
  'Backend Developer',
  'AI/ML Engineer',
  'UI/UX Designer',
  'Cloud/DevOps Engineer',
];

/**
 * Analyze team composition and detect missing roles and skills
 * @param {string} teamId
 */
export function analyzeTeamCompleteness(teamId) {
  const team = dataStore.teams.get(teamId);
  if (!team) throw new Error(`Team ${teamId} not found`);

  const rawMembers = dataStore.teamMembers.get(teamId) || [];
  const acceptedMembers = rawMembers.filter(m => m.join_status.toLowerCase() === 'accepted');

  // Include leader if not explicitly in rawMembers
  const memberStudentIds = new Set(acceptedMembers.map(m => m.student_id));
  if (!memberStudentIds.has(team.leader_student_id)) {
    memberStudentIds.add(team.leader_student_id);
    acceptedMembers.unshift({
      team_id: teamId,
      student_id: team.leader_student_id,
      assigned_role: 'Team Leader',
      join_status: 'Accepted',
    });
  }

  const memberStudents = [];
  const coveredRoles = new Set();
  const coveredSkillIds = new Set();
  let totalAvailability = 0;

  for (const m of acceptedMembers) {
    const student = dataStore.students.get(m.student_id);
    if (student) {
      memberStudents.push(student);
      if (m.assigned_role) coveredRoles.add(m.assigned_role);
      if (student.primary_role) coveredRoles.add(student.primary_role);
      totalAvailability += student.availability_hours_per_week || 15;

      const skills = dataStore.studentSkills.get(student.student_id) || [];
      for (const s of skills) {
        coveredSkillIds.add(s.skill_id);
      }
    }
  }

  // Hackathon required skills
  const hackathon = dataStore.hackathons.get(team.hackathon_id);
  const requiredSkills = hackathon
    ? (dataStore.hackathonRequiredSkills.get(hackathon.hackathon_id) || [])
    : [];

  const missingSkills = [];
  let requiredCoveredCount = 0;

  for (const req of requiredSkills) {
    if (coveredSkillIds.has(req.skill_id)) {
      requiredCoveredCount++;
    } else {
      missingSkills.push({
        skill_id: req.skill_id,
        skill_name: req.skill_name || req.skill_id,
        importance_weight: req.importance_weight,
      });
    }
  }

  const skillCoveragePct = requiredSkills.length > 0
    ? Math.round((requiredCoveredCount / requiredSkills.length) * 100)
    : 100;

  // Missing Roles analysis
  const missingRoles = DESIRED_ROLES.filter(r => !coveredRoles.has(r));

  // Role Diversity: distinct roles divided by 4 (standard team size)
  const roleDiversityPct = Math.min(100, Math.round((coveredRoles.size / 4) * 100));

  // Overall completeness
  const targetSize = hackathon ? hackathon.team_min_size : 4;
  const sizeScore = Math.min(100, Math.round((memberStudents.length / targetSize) * 100));
  const completenessScore = Math.round(0.40 * skillCoveragePct + 0.35 * roleDiversityPct + 0.25 * sizeScore);

  return {
    team_id: teamId,
    team_name: team.team_name,
    member_count: memberStudents.length,
    target_min_size: hackathon ? hackathon.team_min_size : 2,
    target_max_size: hackathon ? hackathon.team_max_size : 5,
    completeness_score: completenessScore,
    skill_coverage_percentage: skillCoveragePct,
    role_diversity_percentage: roleDiversityPct,
    covered_roles: Array.from(coveredRoles),
    missing_roles: missingRoles,
    missing_skills: missingSkills,
    average_availability_hours: memberStudents.length > 0 ? Math.round(totalAvailability / memberStudents.length) : 0,
  };
}

/**
 * Recommend complementary student candidates for a team
 * @param {string} teamId
 * @param {number} limit
 */
export function recommendTeammatesForTeam(teamId, limit = 8) {
  const analysis = analyzeTeamCompleteness(teamId);
  const team = dataStore.teams.get(teamId);
  const hackathon = dataStore.hackathons.get(team.hackathon_id);
  const existingMemberIds = new Set(
    (dataStore.teamMembers.get(teamId) || []).map(m => m.student_id).concat(team.leader_student_id)
  );

  const missingSkillIds = new Set(analysis.missing_skills.map(s => s.skill_id));
  const missingRoles = new Set(analysis.missing_roles);

  const candidates = [];

  for (const student of dataStore.students.values()) {
    if (existingMemberIds.has(student.student_id)) continue;

    const stuSkills = dataStore.studentSkills.get(student.student_id) || [];
    let coveredMissingSkillsCount = 0;
    const complementarySkills = [];

    for (const ss of stuSkills) {
      if (missingSkillIds.has(ss.skill_id)) {
        coveredMissingSkillsCount++;
        complementarySkills.push(ss.skill_name || ss.skill_id);
      }
    }

    const matchesMissingRole = missingRoles.has(student.primary_role);

    // Calculate complementary match score
    // Factors: missing skill coverage (40%), missing role fit (30%), experience & cgpa (15%), availability (15%)
    const skillFactor = analysis.missing_skills.length > 0
      ? Math.min(100, (coveredMissingSkillsCount / analysis.missing_skills.length) * 100)
      : 80;

    const roleFactor = matchesMissingRole ? 100 : 40;
    const expFactor = Math.min(100, (student.cgpa / 10) * 50 + (student.projects_completed * 10));
    const availFactor = Math.min(100, ((student.availability_hours_per_week || 15) / 20) * 100);

    const matchScore = Math.round(0.40 * skillFactor + 0.30 * roleFactor + 0.15 * expFactor + 0.15 * availFactor);

    if (matchScore >= 40) {
      const reasons = [];
      if (matchesMissingRole) {
        reasons.push(`Fills missing team role: ${student.primary_role}`);
      }
      if (complementarySkills.length > 0) {
        reasons.push(`Covers needed skills: ${complementarySkills.slice(0, 3).join(', ')}`);
      }
      if (student.availability_hours_per_week >= 15) {
        reasons.push(`Strong availability: ${student.availability_hours_per_week} hrs/week`);
      }

      candidates.push({
        student_id: student.student_id,
        student_name: student.student_name,
        college_id: student.college_id,
        college_name: dataStore.colleges.get(student.college_id)?.college_name || student.college_id,
        branch: student.branch,
        year: student.year,
        primary_role: student.primary_role,
        experience_level: student.experience_level,
        match_score: matchScore,
        complementary_skills: complementarySkills,
        reasons,
      });
    }
  }

  // Sort descending by match score
  candidates.sort((a, b) => b.match_score - a.match_score);
  return candidates.slice(0, limit);
}

/**
 * Smart automatic matching for "I Don't Have A Team" pool
 * @param {string} studentId
 */
export function matchStudentToPool(studentId) {
  const student = dataStore.students.get(studentId);
  if (!student) throw new Error(`Student ${studentId} not found`);

  const poolEntry = dataStore.matchingPool.get(studentId);
  const targetHackathonId = poolEntry?.hackathon_id || null;

  // Find forming teams that target this hackathon or open forming teams
  const formingTeams = Array.from(dataStore.teams.values())
    .filter(t => t.team_status.toLowerCase() === 'forming' && (!targetHackathonId || t.hackathon_id === targetHackathonId));

  const teamRecommendations = [];

  for (const t of formingTeams.slice(0, 30)) {
    const analysis = analyzeTeamCompleteness(t.team_id);
    const stuSkills = dataStore.studentSkills.get(studentId) || [];
    const missingSkillIds = new Set(analysis.missing_skills.map(s => s.skill_id));

    const complementarySkills = stuSkills.filter(s => missingSkillIds.has(s.skill_id)).map(s => s.skill_name);
    const matchesMissingRole = analysis.missing_roles.includes(student.primary_role);

    const fitScore = Math.round(
      (matchesMissingRole ? 45 : 15) +
      Math.min(40, complementarySkills.length * 20) +
      Math.min(15, (student.availability_hours_per_week / 20) * 15)
    );

    teamRecommendations.push({
      team_id: t.team_id,
      team_name: t.team_name,
      hackathon_id: t.hackathon_id,
      hackathon_name: dataStore.hackathons.get(t.hackathon_id)?.hackathon_name || t.hackathon_id,
      current_size: analysis.member_count,
      missing_roles: analysis.missing_roles,
      fit_score: fitScore,
      complementary_skills: complementarySkills,
      reasons: [
        matchesMissingRole ? `Matches missing role: ${student.primary_role}` : 'General technical contributor',
        complementarySkills.length > 0 ? `Brings needed skills: ${complementarySkills.join(', ')}` : 'Complementary project capacity',
      ],
    });
  }

  teamRecommendations.sort((a, b) => b.fit_score - a.fit_score);

  return {
    student_id: studentId,
    student_name: student.student_name,
    primary_role: student.primary_role,
    recommended_teams: teamRecommendations.slice(0, 8),
  };
}
