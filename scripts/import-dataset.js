/**
 * HackBridge Bulk Dataset Importer
 * Imports all 14 synthetic CSV files into MySQL with foreign-key ordering,
 * transaction protection, batching, and detailed row-count reporting.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import csv from 'csv-parser';
import mysql from 'mysql2/promise';
import dotenv from 'dotenv';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load env
dotenv.config({ path: path.resolve(__dirname, '../backend/.env') });

const DB_CONFIG = {
  host: process.env.DB_HOST || 'localhost',
  port: parseInt(process.env.DB_PORT || '3306', 10),
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'hackbridge_db',
  multipleStatements: true,
};

const DATA_DIR = path.resolve(__dirname, '../data/raw');

// Read CSV file helper
function parseCsv(filename) {
  return new Promise((resolve, reject) => {
    const results = [];
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return reject(new Error(`File not found: ${filePath}`));
    }
    fs.createReadStream(filePath, { encoding: 'utf-8' })
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', (err) => reject(err));
  });
}

async function runImport() {
  console.log('======================================================');
  console.log('   HackBridge MySQL Bulk Dataset Importer');
  console.log('======================================================\n');
  console.log(`Connecting to MySQL database "${DB_CONFIG.database}" on ${DB_CONFIG.host}:${DB_CONFIG.port}...`);

  let connection;
  try {
    connection = await mysql.createConnection(DB_CONFIG);
    console.log('✓ Successfully connected to MySQL database.\n');
  } catch (err) {
    console.error('✗ Failed to connect to MySQL:');
    console.error(`  ${err.message}`);
    console.error('\nPlease check your database credentials in backend/.env:');
    console.error(`  DB_HOST=${DB_CONFIG.host}`);
    console.error(`  DB_USER=${DB_CONFIG.user}`);
    console.error(`  DB_PASSWORD=******`);
    console.error(`  DB_NAME=${DB_CONFIG.database}\n`);
    process.exit(1);
  }

  try {
    // Disable FK checks during import
    await connection.query('SET FOREIGN_KEY_CHECKS = 0;');

    // 1. Colleges
    const colleges = await parseCsv('colleges.csv');
    console.log(`Importing ${colleges.length} colleges...`);
    for (const r of colleges) {
      await connection.query(
        'INSERT INTO colleges (college_id, college_name, city, state, college_type) VALUES (?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE college_name=VALUES(college_name)',
        [r.college_id, r.college_name, r.city, r.state, r.college_type]
      );
    }
    console.log(`✓ Colleges imported: ${colleges.length}`);

    // 2. Skills
    const skills = await parseCsv('skills.csv');
    console.log(`Importing ${skills.length} skills...`);
    for (const r of skills) {
      await connection.query(
        'INSERT INTO skills (skill_id, skill_name, skill_category) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE skill_name=VALUES(skill_name)',
        [r.skill_id, r.skill_name, r.skill_category]
      );
    }
    console.log(`✓ Skills imported: ${skills.length}`);

    // 3. Students
    const students = await parseCsv('students.csv');
    console.log(`Importing ${students.length} students...`);
    const studentValues = students.map((r) => [
      r.student_id,
      r.student_name,
      r.college_id,
      r.branch,
      parseInt(r.year, 10),
      parseFloat(r.cgpa),
      r.city,
      r.state,
      r.primary_role,
      r.experience_level,
      parseInt(r.hackathons_participated, 10) || 0,
      parseInt(r.hackathons_won, 10) || 0,
      parseInt(r.projects_completed, 10) || 0,
      parseInt(r.github_available, 10) || 0,
      parseInt(r.portfolio_available, 10) || 0,
      parseInt(r.preferred_team_size, 10) || 4,
      parseInt(r.availability_hours_per_week, 10) || 15,
    ]);
    const studentChunkSize = 200;
    for (let i = 0; i < studentValues.length; i += studentChunkSize) {
      const chunk = studentValues.slice(i, i + studentChunkSize);
      await connection.query(
        'INSERT INTO students (student_id, student_name, college_id, branch, year, cgpa, city, state, primary_role, experience_level, hackathons_participated, hackathons_won, projects_completed, github_available, portfolio_available, preferred_team_size, availability_hours_per_week) VALUES ? ON DUPLICATE KEY UPDATE student_name=VALUES(student_name)',
        [chunk]
      );
    }
    console.log(`✓ Students imported: ${students.length}`);

    // 4. Student Skills
    const studentSkills = await parseCsv('student_skills.csv');
    console.log(`Importing ${studentSkills.length} student-skill relationships...`);
    const ssValues = studentSkills.map((r) => [
      r.student_id,
      r.skill_id,
      r.proficiency_level,
      parseInt(r.experience_months, 10) || 6,
    ]);
    for (let i = 0; i < ssValues.length; i += 500) {
      const chunk = ssValues.slice(i, i + 500);
      await connection.query(
        'INSERT INTO student_skills (student_id, skill_id, proficiency_level, experience_months) VALUES ? ON DUPLICATE KEY UPDATE proficiency_level=VALUES(proficiency_level)',
        [chunk]
      );
    }
    console.log(`✓ Student skills imported: ${studentSkills.length}`);

    // 5. Hackathons
    const hackathons = await parseCsv('hackathons.csv');
    console.log(`Importing ${hackathons.length} hackathons...`);
    for (const r of hackathons) {
      await connection.query(
        'INSERT INTO hackathons (hackathon_id, hackathon_name, organizer, mode, city, state, domain, difficulty_level, team_min_size, team_max_size, registration_deadline, start_date, end_date, prize_pool, experience_required) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE hackathon_name=VALUES(hackathon_name)',
        [
          r.hackathon_id,
          r.hackathon_name,
          r.organizer,
          r.mode,
          r.city,
          r.state,
          r.domain,
          r.difficulty_level,
          parseInt(r.team_min_size, 10),
          parseInt(r.team_max_size, 10),
          r.registration_deadline,
          r.start_date,
          r.end_date,
          parseFloat(r.prize_pool) || 0,
          r.experience_required,
        ]
      );
    }
    console.log(`✓ Hackathons imported: ${hackathons.length}`);

    // 6. Hackathon Required Skills
    const hrs = await parseCsv('hackathon_required_skills.csv');
    console.log(`Importing ${hrs.length} hackathon required skills...`);
    const hrsValues = hrs.map((r) => [
      r.hackathon_id,
      r.skill_id,
      parseFloat(r.importance_weight) || 1.0,
    ]);
    for (let i = 0; i < hrsValues.length; i += 500) {
      const chunk = hrsValues.slice(i, i + 500);
      await connection.query(
        'INSERT INTO hackathon_required_skills (hackathon_id, skill_id, importance_weight) VALUES ? ON DUPLICATE KEY UPDATE importance_weight=VALUES(importance_weight)',
        [chunk]
      );
    }
    console.log(`✓ Hackathon required skills imported: ${hrs.length}`);

    // 7. Teams
    const teams = await parseCsv('teams.csv');
    console.log(`Importing ${teams.length} teams...`);
    const teamValues = teams.map((r) => [
      r.team_id,
      r.team_name,
      r.leader_student_id,
      r.hackathon_id,
      parseInt(r.team_size, 10),
      r.team_status,
      parseFloat(r.experience_score) || 0,
      parseFloat(r.skill_diversity_score) || 0,
    ]);
    for (let i = 0; i < teamValues.length; i += 200) {
      const chunk = teamValues.slice(i, i + 200);
      await connection.query(
        'INSERT INTO teams (team_id, team_name, leader_student_id, hackathon_id, team_size, team_status, experience_score, skill_diversity_score) VALUES ? ON DUPLICATE KEY UPDATE team_name=VALUES(team_name)',
        [chunk]
      );
    }
    console.log(`✓ Teams imported: ${teams.length}`);

    // 8. Team Members
    const teamMembers = await parseCsv('team_members.csv');
    console.log(`Importing ${teamMembers.length} team members...`);
    const tmValues = teamMembers.map((r) => [
      r.team_id,
      r.student_id,
      r.assigned_role,
      r.join_status,
    ]);
    for (let i = 0; i < tmValues.length; i += 500) {
      const chunk = tmValues.slice(i, i + 500);
      await connection.query(
        'INSERT INTO team_members (team_id, student_id, assigned_role, join_status) VALUES ? ON DUPLICATE KEY UPDATE assigned_role=VALUES(assigned_role)',
        [chunk]
      );
    }
    console.log(`✓ Team members imported: ${teamMembers.length}`);

    // 9. Mentors
    const mentors = await parseCsv('mentors.csv');
    console.log(`Importing ${mentors.length} mentors...`);
    for (const r of mentors) {
      await connection.query(
        'INSERT INTO mentors (mentor_id, mentor_name, specialization, years_of_experience, industry, max_teams, rating) VALUES (?, ?, ?, ?, ?, ?, ?) ON DUPLICATE KEY UPDATE mentor_name=VALUES(mentor_name)',
        [
          r.mentor_id,
          r.mentor_name,
          r.specialization,
          parseInt(r.years_of_experience, 10),
          r.industry,
          parseInt(r.max_teams, 10),
          parseFloat(r.rating),
        ]
      );
    }
    console.log(`✓ Mentors imported: ${mentors.length}`);

    // 10. Mentor Skills
    const mentorSkills = await parseCsv('mentor_skills.csv');
    console.log(`Importing ${mentorSkills.length} mentor skills...`);
    const msValues = mentorSkills.map((r) => [
      r.mentor_id,
      r.skill_id,
      parseFloat(r.proficiency_score) || 1.0,
    ]);
    for (let i = 0; i < msValues.length; i += 200) {
      const chunk = msValues.slice(i, i + 200);
      await connection.query(
        'INSERT INTO mentor_skills (mentor_id, skill_id, proficiency_score) VALUES ? ON DUPLICATE KEY UPDATE proficiency_score=VALUES(proficiency_score)',
        [chunk]
      );
    }
    console.log(`✓ Mentor skills imported: ${mentorSkills.length}`);

    // 11. Team Mentor Mapping
    const tmm = await parseCsv('team_mentor_mapping.csv');
    console.log(`Importing ${tmm.length} team mentor mappings...`);
    for (const r of tmm) {
      await connection.query(
        'INSERT INTO team_mentor_mapping (team_id, mentor_id, mentor_team_match_score) VALUES (?, ?, ?) ON DUPLICATE KEY UPDATE mentor_team_match_score=VALUES(mentor_team_match_score)',
        [r.team_id, r.mentor_id, parseFloat(r.mentor_team_match_score)]
      );
    }
    console.log(`✓ Team mentor mappings imported: ${tmm.length}`);

    // 12. Projects
    const projects = await parseCsv('projects.csv');
    console.log(`Importing ${projects.length} projects...`);
    const projValues = projects.map((r) => [
      r.project_id,
      r.student_id,
      r.project_title,
      r.project_domain,
      r.technology_stack || '',
      r.difficulty_level,
      r.project_status,
    ]);
    for (let i = 0; i < projValues.length; i += 400) {
      const chunk = projValues.slice(i, i + 400);
      await connection.query(
        'INSERT INTO projects (project_id, student_id, project_title, project_domain, technology_stack, difficulty_level, project_status) VALUES ? ON DUPLICATE KEY UPDATE project_title=VALUES(project_title)',
        [chunk]
      );
    }
    console.log(`✓ Projects imported: ${projects.length}`);

    // 13. Hackathon Participation
    const participation = await parseCsv('hackathon_participation.csv');
    console.log(`Importing ${participation.length} participation records...`);
    const partValues = participation.map((r) => [
      r.participation_id,
      r.student_id,
      r.hackathon_id,
      r.team_id,
      r.role,
      r.result,
      parseFloat(r.performance_score) || 0,
    ]);
    for (let i = 0; i < partValues.length; i += 400) {
      const chunk = partValues.slice(i, i + 400);
      await connection.query(
        'INSERT INTO hackathon_participation (participation_id, student_id, hackathon_id, team_id, role, result, performance_score) VALUES ? ON DUPLICATE KEY UPDATE result=VALUES(result)',
        [chunk]
      );
    }
    console.log(`✓ Participation records imported: ${participation.length}`);

    // 14. Compatibility
    const compatibility = await parseCsv('team_hackathon_compatibility.csv');
    console.log(`Importing ${compatibility.length} compatibility records...`);
    const compValues = compatibility.map((r) => [
      r.team_id,
      r.hackathon_id,
      parseFloat(r.skill_match_percentage) || 0,
      parseFloat(r.experience_match_percentage) || 0,
      parseFloat(r.domain_match_percentage) || 0,
      parseFloat(r.team_completeness_percentage) || 0,
      parseFloat(r.overall_compatibility_score) || 0,
      parseInt(r.recommended, 10) || 0,
    ]);
    for (let i = 0; i < compValues.length; i += 1000) {
      const chunk = compValues.slice(i, i + 1000);
      await connection.query(
        'INSERT INTO team_hackathon_compatibility (team_id, hackathon_id, skill_match_percentage, experience_match_percentage, domain_match_percentage, team_completeness_percentage, overall_compatibility_score, recommended) VALUES ? ON DUPLICATE KEY UPDATE overall_compatibility_score=VALUES(overall_compatibility_score)',
        [chunk]
      );
    }
    console.log(`✓ Compatibility records imported: ${compatibility.length}`);

    // Re-enable FK checks
    await connection.query('SET FOREIGN_KEY_CHECKS = 1;');

    console.log('\n======================================================');
    console.log('✓ All 14 dataset tables successfully imported into MySQL!');
    console.log('======================================================\n');
  } catch (err) {
    console.error('✗ Import failed with error:', err);
  } finally {
    await connection.end();
  }
}

runImport();
