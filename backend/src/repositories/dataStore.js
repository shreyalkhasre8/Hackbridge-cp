/**
 * HackBridge In-Memory Relational Data Store
 * Loads and indexes the synthetic dataset from data/raw CSVs and provides
 * fast relational joins, queries, and operational tables.
 */

import fs from 'fs';
import path from 'path';
import readline from 'readline';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../../../data/raw');
const OP_DATA_FILE = path.resolve(__dirname, '../../../data/operational.json');

function parseCsvLine(line) {
  const result = [];
  let current = '';
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const char = line[i];
    if (char === '"') {
      if (inQuotes && line[i + 1] === '"') {
        current += '"';
        i++;
      } else {
        inQuotes = !inQuotes;
      }
    } else if (char === ',' && !inQuotes) {
      result.push(current.trim());
      current = '';
    } else {
      current += char;
    }
  }
  result.push(current.trim());
  return result;
}

function readCsv(filename) {
  return new Promise((resolve, reject) => {
    const filePath = path.join(DATA_DIR, filename);
    if (!fs.existsSync(filePath)) {
      return resolve([]);
    }
    const results = [];
    let headers = null;
    const rl = readline.createInterface({
      input: fs.createReadStream(filePath, { encoding: 'utf-8' }),
      crlfDelay: Infinity,
    });
    rl.on('line', (line) => {
      const trimmed = line.trim();
      if (!trimmed) return;
      const parsed = parseCsvLine(trimmed);
      if (!headers) {
        headers = parsed;
      } else {
        const obj = {};
        for (let i = 0; i < headers.length; i++) {
          obj[headers[i]] = parsed[i] !== undefined ? parsed[i] : '';
        }
        results.push(obj);
      }
    });
    rl.on('close', () => resolve(results));
    rl.on('error', reject);
  });
}

class DataStore {
  constructor() {
    this.isLoaded = false;
    // Relational Tables
    this.colleges = new Map();
    this.skills = new Map();
    this.skillsByName = new Map();
    this.students = new Map();
    this.studentSkills = new Map(); // student_id -> [{ skill_id, proficiency_level, experience_months }]
    this.hackathons = new Map();
    this.hackathonRequiredSkills = new Map(); // hackathon_id -> [{ skill_id, importance_weight }]
    this.teams = new Map();
    this.teamMembers = new Map(); // team_id -> [{ student_id, assigned_role, join_status }]
    this.mentors = new Map();
    this.mentorSkills = new Map(); // mentor_id -> [{ skill_id, proficiency_score }]
    this.teamMentorMapping = new Map(); // team_id -> [{ mentor_id, mentor_team_match_score }]
    this.projects = new Map(); // student_id -> [projects]
    this.hackathonParticipation = [];
    this.teamCompatibility = new Map(); // `${team_id}_${hackathon_id}` -> compatibility

    // Operational Tables
    this.users = new Map();
    this.teamApplications = [];
    this.teamInvitations = [];
    this.hackathonApplications = [];
    this.mentorshipRequests = [];
    this.notifications = [];
    this.announcements = [];
    this.matchingPool = new Map(); // student_id -> pool entry
    this.auditLogs = [];
  }

  async init() {
    if (this.isLoaded) return;
    console.log('[DataStore] Loading HackBridge datasets from data/raw...');

    const [
      collegesData,
      skillsData,
      studentsData,
      studentSkillsData,
      hackathonsData,
      hrsData,
      teamsData,
      teamMembersData,
      mentorsData,
      mentorSkillsData,
      tmmData,
      projectsData,
      participationData,
      compatibilityData,
    ] = await Promise.all([
      readCsv('colleges.csv'),
      readCsv('skills.csv'),
      readCsv('students.csv'),
      readCsv('student_skills.csv'),
      readCsv('hackathons.csv'),
      readCsv('hackathon_required_skills.csv'),
      readCsv('teams.csv'),
      readCsv('team_members.csv'),
      readCsv('mentors.csv'),
      readCsv('mentor_skills.csv'),
      readCsv('team_mentor_mapping.csv'),
      readCsv('projects.csv'),
      readCsv('hackathon_participation.csv'),
      readCsv('team_hackathon_compatibility.csv'),
    ]);

    // Index Colleges
    for (const c of collegesData) {
      this.colleges.set(c.college_id, c);
    }

    // Index Skills
    for (const s of skillsData) {
      this.skills.set(s.skill_id, s);
      this.skillsByName.set(s.skill_name.toLowerCase(), s);
    }

    // Index Students
    for (const s of studentsData) {
      this.students.set(s.student_id, {
        ...s,
        year: parseInt(s.year, 10),
        cgpa: parseFloat(s.cgpa),
        hackathons_participated: parseInt(s.hackathons_participated, 10) || 0,
        hackathons_won: parseInt(s.hackathons_won, 10) || 0,
        projects_completed: parseInt(s.projects_completed, 10) || 0,
        github_available: parseInt(s.github_available, 10) || 0,
        portfolio_available: parseInt(s.portfolio_available, 10) || 0,
        preferred_team_size: parseInt(s.preferred_team_size, 10) || 4,
        availability_hours_per_week: parseInt(s.availability_hours_per_week, 10) || 15,
      });
    }

    // Index Student Skills
    for (const ss of studentSkillsData) {
      if (!this.studentSkills.has(ss.student_id)) {
        this.studentSkills.set(ss.student_id, []);
      }
      this.studentSkills.get(ss.student_id).push({
        skill_id: ss.skill_id,
        skill_name: this.skills.get(ss.skill_id)?.skill_name || ss.skill_id,
        proficiency_level: ss.proficiency_level,
        experience_months: parseInt(ss.experience_months, 10) || 6,
      });
    }

    // Index Hackathons
    for (const h of hackathonsData) {
      this.hackathons.set(h.hackathon_id, {
        ...h,
        team_min_size: parseInt(h.team_min_size, 10),
        team_max_size: parseInt(h.team_max_size, 10),
        prize_pool: parseFloat(h.prize_pool) || 0,
      });
    }

    // Index Hackathon Required Skills
    for (const hrs of hrsData) {
      if (!this.hackathonRequiredSkills.has(hrs.hackathon_id)) {
        this.hackathonRequiredSkills.set(hrs.hackathon_id, []);
      }
      this.hackathonRequiredSkills.get(hrs.hackathon_id).push({
        skill_id: hrs.skill_id,
        skill_name: this.skills.get(hrs.skill_id)?.skill_name || hrs.skill_id,
        importance_weight: parseFloat(hrs.importance_weight) || 1.0,
      });
    }

    // Index Teams
    for (const t of teamsData) {
      this.teams.set(t.team_id, {
        ...t,
        team_size: parseInt(t.team_size, 10),
        experience_score: parseFloat(t.experience_score) || 0,
        skill_diversity_score: parseFloat(t.skill_diversity_score) || 0,
      });
    }

    // Index Team Members
    for (const tm of teamMembersData) {
      if (!this.teamMembers.has(tm.team_id)) {
        this.teamMembers.set(tm.team_id, []);
      }
      this.teamMembers.get(tm.team_id).push(tm);
    }

    // Index Mentors
    for (const m of mentorsData) {
      this.mentors.set(m.mentor_id, {
        ...m,
        years_of_experience: parseInt(m.years_of_experience, 10),
        max_teams: parseInt(m.max_teams, 10),
        rating: parseFloat(m.rating),
      });
    }

    // Index Mentor Skills
    for (const ms of mentorSkillsData) {
      if (!this.mentorSkills.has(ms.mentor_id)) {
        this.mentorSkills.set(ms.mentor_id, []);
      }
      this.mentorSkills.get(ms.mentor_id).push({
        skill_id: ms.skill_id,
        skill_name: this.skills.get(ms.skill_id)?.skill_name || ms.skill_id,
        proficiency_score: parseFloat(ms.proficiency_score) || 1.0,
      });
    }

    // Index Team Mentor Mapping
    for (const tm of tmmData) {
      if (!this.teamMentorMapping.has(tm.team_id)) {
        this.teamMentorMapping.set(tm.team_id, []);
      }
      this.teamMentorMapping.get(tm.team_id).push({
        mentor_id: tm.mentor_id,
        mentor_team_match_score: parseFloat(tm.mentor_team_match_score),
      });
    }

    // Index Projects
    for (const p of projectsData) {
      if (!this.projects.has(p.student_id)) {
        this.projects.set(p.student_id, []);
      }
      this.projects.get(p.student_id).push(p);
    }

    // Index Hackathon Participation
    this.hackathonParticipation = participationData.map(p => ({
      ...p,
      performance_score: parseFloat(p.performance_score) || 0,
    }));

    // Index Compatibility
    for (const c of compatibilityData) {
      const key = `${c.team_id}_${c.hackathon_id}`;
      this.teamCompatibility.set(key, {
        ...c,
        skill_match_percentage: parseFloat(c.skill_match_percentage) || 0,
        experience_match_percentage: parseFloat(c.experience_match_percentage) || 0,
        domain_match_percentage: parseFloat(c.domain_match_percentage) || 0,
        team_completeness_percentage: parseFloat(c.team_completeness_percentage) || 0,
        overall_compatibility_score: parseFloat(c.overall_compatibility_score) || 0,
        recommended: parseInt(c.recommended, 10) || 0,
      });
    }

    // Seed Operational Data & Demo Users
    await this.seedOperationalData();

    this.isLoaded = true;
    console.log(`[DataStore] Successfully loaded:
      - ${this.colleges.size} colleges
      - ${this.skills.size} skills
      - ${this.students.size} students
      - ${studentSkillsData.length} student skills
      - ${this.hackathons.size} hackathons
      - ${this.teams.size} teams
      - ${teamMembersData.length} team members
      - ${this.mentors.size} mentors
      - ${projectsData.length} projects
      - ${this.teamCompatibility.size} compatibility calculations
      - ${this.users.size} operational users seeded
    `);
  }

  async seedOperationalData() {
    // Check if operational.json exists
    if (fs.existsSync(OP_DATA_FILE)) {
      try {
        const raw = fs.readFileSync(OP_DATA_FILE, 'utf-8');
        const parsed = JSON.parse(raw);
        if (parsed.users) {
          for (const u of parsed.users) this.users.set(u.email, u);
        }
        if (parsed.teamApplications) this.teamApplications = parsed.teamApplications;
        if (parsed.teamInvitations) this.teamInvitations = parsed.teamInvitations;
        if (parsed.hackathonApplications) this.hackathonApplications = parsed.hackathonApplications;
        if (parsed.mentorshipRequests) this.mentorshipRequests = parsed.mentorshipRequests;
        if (parsed.notifications) this.notifications = parsed.notifications;
        if (parsed.announcements) this.announcements = parsed.announcements;
        if (parsed.matchingPool) {
          for (const m of parsed.matchingPool) this.matchingPool.set(m.student_id, m);
        }
        if (parsed.auditLogs) this.auditLogs = parsed.auditLogs;
      } catch (e) {
        console.warn('[DataStore] Could not read operational.json, creating fresh seed:', e.message);
      }
    }

    // Ensure Demo Accounts Exist
    const demoPasswordHash = await bcrypt.hash('Demo@123', 10);

    const demoUsers = [
      {
        user_id: 'USR_STUDENT_01',
        name: 'Aarav Patel',
        email: 'student@hackbridge.edu',
        password_hash: demoPasswordHash,
        role: 'student',
        profile_id: 'STU0001',
        college_id: 'COL001',
        avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        created_at: new Date().toISOString(),
      },
      {
        user_id: 'USR_MENTOR_01',
        name: 'Dr. Vikram Malhotra',
        email: 'mentor@hackbridge.edu',
        password_hash: demoPasswordHash,
        role: 'mentor',
        profile_id: 'MEN001',
        college_id: 'COL001',
        avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150',
        created_at: new Date().toISOString(),
      },
      {
        user_id: 'USR_COLLEGE_01',
        name: 'IIT Bombay Dean of Academics',
        email: 'organizer@hackbridge.edu',
        password_hash: demoPasswordHash,
        role: 'college',
        profile_id: 'COL001',
        college_id: 'COL001',
        avatar_url: 'https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=150',
        created_at: new Date().toISOString(),
      },
      {
        user_id: 'USR_ADMIN_01',
        name: 'HackBridge Platform Administrator',
        email: 'admin@hackbridge.edu',
        password_hash: demoPasswordHash,
        role: 'admin',
        profile_id: 'ADMIN001',
        college_id: null,
        avatar_url: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150',
        created_at: new Date().toISOString(),
      },
    ];

    for (const u of demoUsers) {
      if (!this.users.has(u.email)) {
        this.users.set(u.email, u);
      }
    }

    // Seed Initial Announcements if empty
    if (this.announcements.length === 0) {
      this.announcements = [
        {
          id: 'ANN001',
          hackathon_id: 'HACK001',
          title: 'Smart India AI Sprint: Mentorship Sessions Open',
          content: 'Verified industry mentors from top tech companies are now accepting team mentorship requests. Connect early to prepare your architecture.',
          author: 'IIT Bombay Innovation Cell',
          pinned: 1,
          created_at: new Date(Date.now() - 2 * 86400000).toISOString(),
        },
        {
          id: 'ANN002',
          hackathon_id: 'HACK002',
          title: 'Registration Deadline Extended by 48 Hours',
          content: 'Due to overwhelming requests from participating colleges across Karnataka and Maharashtra, team submissions remain open until midnight Friday.',
          author: 'National Hackathon Council',
          pinned: 0,
          created_at: new Date(Date.now() - 4 * 86400000).toISOString(),
        },
        {
          id: 'ANN003',
          hackathon_id: 'HACK005',
          title: 'Problem Statements & Evaluation Rubric Published',
          content: 'Tracks include FinTech AI, Healthcare IoT, and Decentralized Identity. Review the submission guidelines and API endpoints in the event brochure.',
          author: 'BITS Pilani Center for Entrepreneurship',
          pinned: 1,
          created_at: new Date(Date.now() - 6 * 86400000).toISOString(),
        },
      ];
    }

    // Seed notifications for student
    if (this.notifications.length === 0) {
      this.notifications = [
        {
          id: 'NOTIF_001',
          user_id: 'USR_STUDENT_01',
          title: 'Team Application Update',
          message: 'Your application to join "NeuralCraft" for Smart India AI Sprint has been accepted!',
          type: 'team_accepted',
          link: '/teams/TEAM0001',
          is_read: 0,
          created_at: new Date(Date.now() - 3600000 * 2).toISOString(),
        },
        {
          id: 'NOTIF_002',
          user_id: 'USR_STUDENT_01',
          title: 'New High Compatibility Hackathon',
          message: 'Inter-College Web3 Summit has an 86.4% match with your team skills. Registration closes soon.',
          type: 'hackathon_recommendation',
          link: '/hackathons/HACK001',
          is_read: 0,
          created_at: new Date(Date.now() - 3600000 * 12).toISOString(),
        },
        {
          id: 'NOTIF_003',
          user_id: 'USR_MENTOR_01',
          title: 'New Mentorship Request',
          message: 'Team "CodeCrafters" requested your guidance for Cloud & Distributed Systems track.',
          type: 'mentorship_request',
          link: '/mentor/dashboard',
          is_read: 0,
          created_at: new Date(Date.now() - 3600000 * 4).toISOString(),
        },
      ];
    }

    this.persistOperationalData();
  }

  persistOperationalData() {
    try {
      const data = {
        users: Array.from(this.users.values()),
        teamApplications: this.teamApplications,
        teamInvitations: this.teamInvitations,
        hackathonApplications: this.hackathonApplications,
        mentorshipRequests: this.mentorshipRequests,
        notifications: this.notifications,
        announcements: this.announcements,
        matchingPool: Array.from(this.matchingPool.values()),
        auditLogs: this.auditLogs.slice(-500),
      };
      fs.writeFileSync(OP_DATA_FILE, JSON.stringify(data, null, 2), 'utf-8');
    } catch (e) {
      console.warn('[DataStore] Error saving operational data:', e.message);
    }
  }
}

export const dataStore = new DataStore();
