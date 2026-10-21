# HackBridge — 4-Member Work Division & Responsibilities

Based on `HackBridge_Workflow_and_4_Member_Work_Division.pdf`, the system is divided by **feature ownership** rather than separating frontend and backend completely. Each member owns complete end-to-end modules—UI, REST API endpoints, business logic, and automated testing—while the Database Lead maintains the master schema to ensure zero conflicting migrations or fragmented foreign keys.

---

## Member 1: Authentication, Profiles & Database/DDBMS Lead (Person 1)

### Primary Ownership: Modules 1 & 7
- **Authentication & User Profiles**:
  - Registration, login, and token generation using JWT and `bcryptjs` password hashing.
  - Server-side role-based authorization (`student`, `mentor`, `college`, `admin`).
  - Student profile management (branch, year, CGPA, primary role, experience level, availability, GitHub/portfolio).
  - Profile completeness scoring engine with missing fields explanation.
  - Authenticated session management and persistent token strategy.
- **Database & DDBMS Architecture**:
  - Master relational MySQL 8 schema (`database/schema.sql`) with foreign keys, cascading rules, and composite primary keys.
  - 3-node horizontal fragmentation schema (`database/ddbms_simulation.sql`) for simulated college autonomous nodes:
    - Node A: `college_C001_db` (Sahyadri Institute of Engineering, Pune)
    - Node B: `college_C002_db` (Sahyadri Institute of Engineering, Mumbai)
    - Node C: `college_C003_db` (Sahyadri Institute of Engineering, Nagpur)
  - Full read-replication of shared reference tables (`skills`, `hackathons`).
  - Distributed query execution service (`backend/src/services/ddbmsService.js`) covering Local Fragment, Distributed UNION, Multi-Condition, Distributed Aggregate, and Distributed JOIN queries.
  - Location transparency abstraction layer.

---

## Member 2: Teams, Smart Formation, Search & Notifications (Person 2)

### Primary Ownership: Modules 2 & 6
- **Team Management**:
  - Team creation, roster management, search, and join application lifecycle (`pending`, `accepted`, `rejected`).
  - Enforcing platform constraints: preventing duplicate rosters for the same hackathon and roster size bounds.
  - Acceptance/rejection workflows with automatic leader ownership transfer.
- **Smart Team Formation ("I Don't Have A Team" Feature)**:
  - Registration pool for unmatched students (`backend/src/routes/matchingPool.routes.js`).
  - Complementary skill & role matching algorithm (`backend/src/services/teamFormationEngine.js`), ensuring diverse teams rather than stacking duplicate abilities.
  - Team completeness score (0–100%) and missing-role detection (`analyzeTeamCompleteness`).
  - Teammate recommendations for missing roster roles.
- **Search & Notifications**:
  - Multi-entity global search across hackathons, students, teams, and mentors.
  - Persisted notifications pipeline for team applications, acceptance decisions, invitations, and deadline alerts.
  - Unread count badges and mark-all-read capabilities.

---

## Member 3: Hackathons, Eligibility & Recommendation Engine (Person 3)

### Primary Ownership: Modules 3 & 4
- **Hackathon & Announcement Management**:
  - Full CRUD operations for hackathons, mode filtering (`Online`, `Offline`, `Hybrid`), domains, and prize money.
  - Organizer announcements feed with broadcast publishing and pinned alerts.
  - Real dataset integration of 180 hackathon specifications.
- **Eligibility Engine**:
  - Independent eligibility validation: registration deadline expiration check, team minimum and maximum member limits, and experience tier matching.
  - Plain-English eligibility diagnostic messages explaining exact failure reasons.
- **Explainable Hackathon Recommendation Engine**:
  - Implementation of the documented 4-component weighted model:
    $$\text{Overall Compatibility} = 0.45 \times \text{Skill Match} + 0.20 \times \text{Experience Match} + 0.20 \times \text{Domain Match} + 0.15 \times \text{Team Completeness}$$
  - Transparent component score breakdown modal and skill-gap identification.
  - Verification against 14,400 compatibility pairs from the synthetic relational dataset.

---

## Member 4: Mentors, Dashboards & Administration (Person 4)

### Primary Ownership: Modules 5 & 8
- **Mentor Management & Matching Engine**:
  - Verified mentor profiles with domain specialization, industry background, and satisfaction ratings.
  - Documented weighted mentor recommendation formula:
    $$\text{Mentor Match} = 0.65 \times \text{Weighted Skill Proficiency} + 0.25 \times \text{Domain Fit} + 0.10 \times \text{Normalized Rating}$$
  - Strict server-side capacity enforcement (`current_teams < max_teams`).
  - Mentorship request and approval/rejection lifecycle.
- **Role-Based Dashboards & Analytics**:
  - Student Dashboard: Profile completeness progress ring, current teams, recommended hackathons, notifications.
  - Mentor Dashboard: Assigned teams, incoming requests, capacity progress bar.
  - College/Organizer Dashboard: Managed hackathons, broadcast announcements, campus participation metrics.
  - Admin Dashboard: Registered accounts table, 1-click role modification, cluster health monitor.
  - Recharts Visualizations: College participation vs wins, domain distribution pie chart, and skill supply vs demand bar chart.

---

## Shared Development Standards

1. **REST API Naming Convention**: Common `/api/auth`, `/api/students`, `/api/teams`, `/api/hackathons`, `/api/mentors`, `/api/matching-pool`, `/api/notifications`, `/api/analytics`, `/api/ddbms`, `/api/admin`.
2. **Design Tokens**: Standardized CSS variables (`theme.css`) for warm cream surfaces, deep olive greens, mustard accents, and elegant typography.
3. **Database Integrity**: Person 1 leads schema reviews and migrations; all database changes are documented in `database/schema.sql`.
