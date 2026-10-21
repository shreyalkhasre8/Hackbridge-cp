# HackBridge REST API Reference & Contracts

Base URL: `http://localhost:5000/api`

---

## 1. Authentication (`/api/auth`)

### `POST /auth/register`
Creates a new account and generates a JWT.
- **Request Body**:
  ```json
  {
    "name": "Aarav Sharma",
    "email": "aarav@university.edu",
    "password": "Password123!",
    "role": "student",
    "college_id": "C001",
    "branch": "Computer Science",
    "year": 3
  }
  ```
- **Response** (`201 Created`):
  ```json
  {
    "success": true,
    "message": "Account registered successfully.",
    "token": "eyJhbGciOi...",
    "user": { "user_id": "USR_...", "name": "Aarav Sharma", "email": "...", "role": "student" }
  }
  ```

### `POST /auth/login`
Authenticates credentials and issues a JWT token.
- **Request Body**: `{ "email": "student@hackbridge.edu", "password": "Demo@123" }`
- **Response** (`200 OK`): Token and user profile details.

### `POST /auth/demo-login`
Instant 1-click evaluator persona login.
- **Request Body**: `{ "role": "student" | "mentor" | "college" | "admin" }`
- **Response** (`200 OK`): Token and pre-seeded persona user object.

### `GET /auth/me`
Returns current user profile based on Bearer token in `Authorization` header.

---

## 2. Students (`/api/students`)

### `GET /students`
Query students across colleges with filters.
- **Query Parameters**:
  - `search` (string): Text query across name, branch, role, city.
  - `college_id` (string): e.g. `C001`.
  - `primary_role` (string): e.g. `AI/ML Engineer`.
  - `experience_level` (string): `Beginner`, `Intermediate`, `Advanced`.
  - `skill` (string): e.g. `Python`.
  - `page` (number, default: 1), `limit` (number, default: 20).

### `GET /students/:id`
Retrieves full student profile, verified skills list, completed portfolio projects, hackathon participation outcomes, and profile completeness calculation.

### `PUT /students/:id`
Updates profile fields (branch, year, CGPA, availability hours, portfolio links).

### `GET /students/:id/completeness`
Calculates profile completeness score (0–100%) and returns missing profile fields.

---

## 3. Teams & Smart Formation (`/api/teams`)

### `GET /teams`
Lists teams with filters for `hackathon_id`, `team_status`, `search`, and pagination.

### `GET /teams/:id`
Retrieves team details including leader, accepted roster members, pending join applications, and assigned mentors.

### `POST /teams`
Creates a new team roster.
- **Body**: `{ "team_name": "NeuralCrafters", "hackathon_id": "HACK001", "target_role": "Team Lead" }`
- **Enforces**: Unique team per student per hackathon.

### `POST /teams/:id/apply`
Submits a request to join a team.

### `POST /teams/:id/applications/:appId/decision`
Team leader accepts or rejects join application. Accepts member into roster and updates `team_size`.
- **Body**: `{ "decision": "accepted" | "rejected" }`

### `GET /teams/:id/completeness`
Returns roster completeness analysis:
- `completeness_score` (0–100%)
- `skill_coverage_percentage`
- `role_diversity_percentage`
- `covered_roles` & `missing_roles`
- `missing_skills`

### `GET /teams/:id/recommended-teammates`
Returns ranked candidate students from other colleges with complementary skills and missing role capabilities.

---

## 4. Hackathons & Explainable Matching (`/api/hackathons`)

### `GET /hackathons`
Search and filter hackathons from the 180-event catalog.
- **Query Parameters**: `domain`, `mode`, `difficulty`, `search`, `upcoming_only`, `page`, `limit`.

### `GET /hackathons/:id`
Returns hackathon details, required skill weights, registered teams count, and official announcements.

### `GET /hackathons/:id/compatibility/:teamId`
Calculates explainable team-hackathon compatibility score and eligibility:
- `overall_compatibility_score`: $0.45 \times \text{Skill} + 0.20 \times \text{Exp} + 0.20 \times \text{Domain} + 0.15 \times \text{Completeness}$
- `recommended`: 1 if score $\ge 70$, else 0.
- `is_eligible`: boolean checking registration deadline and team size bounds.
- `eligibility_issues`: plain-English reasons if ineligible.
- `explanations`: plain-English analysis highlights.

### `POST /hackathons/:id/apply`
Registers team for hackathon. Re-validates eligibility on backend.

### `POST /hackathons/:id/announcements`
Organizer or admin publishes an announcement.

---

## 5. Mentors (`/api/mentors`)

### `GET /mentors`
Lists mentors with filters for `specialization`, `industry`, `min_rating`, `available_only`.

### `GET /mentors/:id`
Returns mentor details, skills, assigned teams, and capacity status.

### `GET /mentors/match/:teamId`
Returns ranked recommendations for a team using the weighted formula:
$$\text{Score} = 0.65 \times \text{Skill Proficiency} + 0.25 \times \text{Domain Fit} + 0.10 \times \text{Rating}$$

### `POST /mentors/:id/request`
Sends a mentorship request for a team. Enforces `current_teams < max_teams`.

### `POST /mentors/requests/:requestId/decision`
Mentor accepts or rejects request. Enforces capacity before accepting.

---

## 6. Smart Matching Pool (`/api/matching-pool`)

### `POST /matching-pool/join`
Adds student to "I Don't Have A Team" pool with preferred role, target hackathon, and weekly hours.

### `POST /matching-pool/leave`
Removes student from matching pool.

### `GET /matching-pool/status/:studentId`
Returns pool registration status and complementary matched forming teams.

---

## 7. Distributed Database Management System (`/api/ddbms`)

### `GET /ddbms/cluster`
Returns cluster health, autonomous college nodes (Node A, Node B, Node C), and fragment record counts.

### `POST /ddbms/query`
Executes distributed query simulation.
- **Body**:
  ```json
  {
    "query_type": "union" | "multi_condition" | "aggregate" | "distributed_join" | "local",
    "params": { "skill": "Python", "role": "Frontend Developer", "college_id": "C001" }
  }
  ```
- **Returns**: Execution time in ms, queried fragments, generated distributed SQL query execution plan, and result rows.

---

## 8. Analytics & Administration

- `GET /api/analytics/overview`: Platform-wide totals (students, colleges, hackathons, teams, prize money, winning teams).
- `GET /api/analytics/colleges`: Top colleges by participation and event wins.
- `GET /api/analytics/domains`: Hackathon and project distribution across domains.
- `GET /api/analytics/skills`: Skill demand vs student supply.
- `GET /api/admin/users`: User management list.
- `PUT /api/admin/users/:id/role`: Update user role permissions.
- `GET /api/health`: System health, dataset row counts, and MySQL pool status.
