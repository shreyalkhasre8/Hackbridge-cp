/**
 * HackBridge Explainable Hackathon Recommendation & Eligibility Engine
 * Implements the exact weighted compatibility model from the dataset specification:
 * Overall = 0.45 * skill_match + 0.20 * experience_match + 0.20 * domain_match + 0.15 * team_completeness
 */

import { dataStore } from '../repositories/dataStore.js';

const PROFICIENCY_SCORES = {
  Beginner: 0.25,
  Intermediate: 0.50,
  Advanced: 0.80,
  Expert: 1.00,
};

const DIFFICULTY_THRESHOLDS = {
  Beginner: 25,
  Intermediate: 50,
  Advanced: 75,
  Expert: 90,
};

/**
 * Calculate team-hackathon compatibility score and detailed breakdown
 * @param {string} teamId
 * @param {string} hackathonId
 */
export function calculateCompatibility(teamId, hackathonId) {
  const team = dataStore.teams.get(teamId);
  const hackathon = dataStore.hackathons.get(hackathonId);

  if (!team || !hackathon) {
    throw new Error(`Team (${teamId}) or Hackathon (${hackathonId}) not found`);
  }

  // Get accepted team members
  const rawMembers = dataStore.teamMembers.get(teamId) || [];
  const acceptedMemberIds = rawMembers
    .filter(m => m.join_status.toLowerCase() === 'accepted' || m.student_id === team.leader_student_id)
    .map(m => m.student_id);

  // If leader not in team_members, ensure leader is included
  if (!acceptedMemberIds.includes(team.leader_student_id)) {
    acceptedMemberIds.unshift(team.leader_student_id);
  }

  const acceptedCount = Math.max(1, acceptedMemberIds.length);

  // 1. SKILL MATCH (45%)
  const requiredSkills = dataStore.hackathonRequiredSkills.get(hackathonId) || [];
  let totalWeight = 0;
  let weightedSkillScore = 0;
  const skillBreakdown = [];

  for (const req of requiredSkills) {
    const weight = req.importance_weight || 1.0;
    totalWeight += weight;

    // Find the strongest proficiency among accepted members for this skill
    let strongestProfScore = 0;
    let strongestProfLevel = 'Missing';
    let coveredByStudent = null;

    for (const stuId of acceptedMemberIds) {
      const stuSkills = dataStore.studentSkills.get(stuId) || [];
      const matchSkill = stuSkills.find(s => s.skill_id === req.skill_id);
      if (matchSkill) {
        const pScore = PROFICIENCY_SCORES[matchSkill.proficiency_level] || 0.25;
        if (pScore > strongestProfScore) {
          strongestProfScore = pScore;
          strongestProfLevel = matchSkill.proficiency_level;
          coveredByStudent = stuId;
        }
      }
    }

    weightedSkillScore += strongestProfScore * weight;
    skillBreakdown.push({
      skill_id: req.skill_id,
      skill_name: req.skill_name || req.skill_id,
      importance_weight: weight,
      covered: strongestProfScore > 0,
      strongest_proficiency: strongestProfLevel,
      score: Math.round(strongestProfScore * 100),
      student_id: coveredByStudent,
    });
  }

  const skillMatchPercentage = totalWeight > 0
    ? Math.round((weightedSkillScore / totalWeight) * 10000) / 100
    : 100;

  // 2. EXPERIENCE MATCH (20%)
  const threshold = DIFFICULTY_THRESHOLDS[hackathon.difficulty_level] || 50;
  const teamExpScore = team.experience_score || 50;
  const expMatchRaw = Math.min(100, (100 * teamExpScore) / threshold);
  const experienceMatchPercentage = Math.round(expMatchRaw * 100) / 100;

  // 3. DOMAIN MATCH (20%)
  // Mean fraction of each member's projects in the candidate domain
  let totalDomainFraction = 0;
  const memberDomainDetails = [];

  for (const stuId of acceptedMemberIds) {
    const stuProjects = dataStore.projects.get(stuId) || [];
    if (stuProjects.length === 0) {
      memberDomainDetails.push({ student_id: stuId, project_count: 0, domain_matches: 0, fraction: 0 });
      continue;
    }
    const matchingProjects = stuProjects.filter(p =>
      p.project_domain.toLowerCase().includes(hackathon.domain.toLowerCase()) ||
      hackathon.domain.toLowerCase().includes(p.project_domain.toLowerCase())
    );
    const fraction = matchingProjects.length / stuProjects.length;
    totalDomainFraction += fraction;
    memberDomainDetails.push({
      student_id: stuId,
      project_count: stuProjects.length,
      domain_matches: matchingProjects.length,
      fraction,
    });
  }

  const domainMatchPercentage = Math.round((totalDomainFraction / acceptedCount) * 10000) / 100;

  // 4. TEAM COMPLETENESS (15%)
  let completenessRaw = 100;
  if (acceptedCount < hackathon.team_min_size) {
    completenessRaw = (acceptedCount / hackathon.team_min_size) * 100;
  } else if (acceptedCount > hackathon.team_max_size) {
    completenessRaw = (hackathon.team_max_size / acceptedCount) * 100;
  }
  const teamCompletenessPercentage = Math.min(100, Math.round(completenessRaw * 100) / 100);

  // OVERALL WEIGHTED SCORE
  const overallRaw =
    0.45 * skillMatchPercentage +
    0.20 * experienceMatchPercentage +
    0.20 * domainMatchPercentage +
    0.15 * teamCompletenessPercentage;

  const overallCompatibilityScore = Math.round(overallRaw * 100) / 100;
  const recommended = overallCompatibilityScore >= 70 ? 1 : 0;

  // Generate plain-language explanations
  const explanations = [];
  if (skillMatchPercentage >= 75) {
    explanations.push('Strong required-skill coverage across active team members.');
  } else if (skillMatchPercentage >= 50) {
    explanations.push('Moderate skill coverage; some required skills have beginner proficiency.');
  } else {
    const missingSkills = skillBreakdown.filter(s => !s.covered).map(s => s.skill_name).slice(0, 3);
    explanations.push(`Skill gap detected in: ${missingSkills.join(', ')}.`);
  }

  if (domainMatchPercentage >= 50) {
    explanations.push(`High domain alignment in ${hackathon.domain} based on prior team projects.`);
  } else if (domainMatchPercentage > 0) {
    explanations.push(`Partial domain experience in ${hackathon.domain}.`);
  } else {
    explanations.push(`Limited previous project evidence in ${hackathon.domain}.`);
  }

  if (acceptedCount >= hackathon.team_min_size && acceptedCount <= hackathon.team_max_size) {
    explanations.push(`Roster size (${acceptedCount}) perfectly meets event capacity (${hackathon.team_min_size}-${hackathon.team_max_size} members).`);
  } else if (acceptedCount < hackathon.team_min_size) {
    explanations.push(`Team has ${acceptedCount} member(s), needing at least ${hackathon.team_min_size} to participate.`);
  } else {
    explanations.push(`Team exceeds maximum size limit of ${hackathon.team_max_size} members.`);
  }

  // ELIGIBILITY CHECK
  const today = new Date().toISOString().split('T')[0];
  const deadlinePassed = hackathon.registration_deadline < today;
  const sizeEligible = acceptedCount >= hackathon.team_min_size && acceptedCount <= hackathon.team_max_size;

  const eligibilityIssues = [];
  if (deadlinePassed) {
    eligibilityIssues.push(`Registration closed on ${hackathon.registration_deadline}.`);
  }
  if (!sizeEligible) {
    eligibilityIssues.push(`Current roster size (${acceptedCount}) does not satisfy event bounds (${hackathon.team_min_size}-${hackathon.team_max_size} members).`);
  }

  const isEligible = eligibilityIssues.length === 0;

  return {
    team_id: teamId,
    hackathon_id: hackathonId,
    skill_match_percentage: skillMatchPercentage,
    experience_match_percentage: experienceMatchPercentage,
    domain_match_percentage: domainMatchPercentage,
    team_completeness_percentage: teamCompletenessPercentage,
    overall_compatibility_score: overallCompatibilityScore,
    recommended,
    is_eligible: isEligible,
    eligibility_issues: eligibilityIssues,
    explanations,
    skill_breakdown: skillBreakdown,
    missing_skills: skillBreakdown.filter(s => !s.covered),
  };
}
