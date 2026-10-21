# HackBridge Relational Data Dictionary

This document details the 14 relational CSV files from the synthetic dataset and operational tables implemented in HackBridge.

---

## 1. Dataset Tables (from `data/raw/*.csv`)

| Table Name | Total Rows | Primary Key | Description |
|---|---|---|---|
| `colleges` | 60 | `college_id` | Participating higher education institutions across Indian states. |
| `skills` | 82 | `skill_id` | Catalog of technical and domain skills across engineering categories. |
| `students` | 1,200 | `student_id` | Student innovators with academic year, CGPA, role, and availability. |
| `student_skills` | 7,699 | `(student_id, skill_id)` | Student skill proficiencies (`Beginner`, `Intermediate`, `Advanced`, `Expert`). |
| `hackathons` | 180 | `hackathon_id` | Hackathon events with domain, mode, deadlines, and prize pool. |
| `hackathon_required_skills` | 1,214 | `(hackathon_id, skill_id)` | Required skills for each hackathon with normalized importance weights. |
| `teams` | 720 | `team_id` | Collaborative student teams targeting specific hackathons. |
| `team_members` | 2,923 | `(team_id, student_id)` | Team membership rosters with assigned roles and join statuses. |
| `mentors` | 100 | `mentor_id` | Industry mentors with specialization, experience, and max capacity. |
| `mentor_skills` | 784 | `(mentor_id, skill_id)` | Mentor technical competencies and proficiency scores (0.0 to 1.0). |
| `team_mentor_mapping` | 120 | `(team_id, mentor_id)` | Active team-mentor assignments with computed match scores. |
| `projects` | 3,634 | `project_id` | Completed projects showcasing domains and technology stacks. |
| `hackathon_participation` | 2,384 | `participation_id` | Historical outcomes (`Winner`, `Runner-up`, `Finalist`, `Participant`). |
| `team_hackathon_compatibility` | 14,400 | `(team_id, hackathon_id)` | Computed 4-part compatibility scores and recommendation flags. |

---

## 2. Operational Application Tables

| Table Name | Primary Key | Foreign Keys | Description |
|---|---|---|---|
| `users` | `user_id` | `college_id -> colleges` | Authentication records with bcrypt hashed passwords and JWT roles. |
| `team_applications` | `id` | `team_id`, `student_id` | Pending and decided student applications to join team rosters. |
| `team_invitations` | `id` | `team_id`, `student_id` | Direct invitations sent to student innovators. |
| `hackathon_applications` | `id` | `hackathon_id`, `team_id` | Official team registrations for hackathons. |
| `mentorship_requests` | `id` | `mentor_id`, `team_id` | Incoming and decided team mentorship requests. |
| `notifications` | `id` | `user_id` | Persisted alerts for status changes, invites, and deadline updates. |
| `announcements` | `id` | `hackathon_id` | Official organizer announcements and updates. |
| `matching_pool` | `id` | `student_id` | Active participants in the "I Don't Have A Team" pool. |
| `audit_logs` | `id` | `user_id` | System audit trail for security and governance. |
