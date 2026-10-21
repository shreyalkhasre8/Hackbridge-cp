# HackBridge synthetic relational dataset

All people, colleges, organizers, events and results are fictional. Names are Indian-style; cities and states are real geographic labels. No scraped personal information or claims about real institutions. Snapshot: 2026-10-13. Seed: 20261013. UTF-8 CSV; headers; IDs are strings; booleans are 0/1; dates ISO YYYY-MM-DD; monetary amounts INR.

## Size

- students.csv: 1,200 rows
- colleges.csv: 60 rows
- skills.csv: 82 rows
- student_skills.csv: 7,699 rows
- hackathons.csv: 180 rows
- hackathon_required_skills.csv: 1,214 rows
- teams.csv: 720 rows
- team_members.csv: 2,923 rows
- mentors.csv: 100 rows
- mentor_skills.csv: 784 rows
- team_mentor_mapping.csv: 120 rows
- projects.csv: 3,634 rows
- hackathon_participation.csv: 2,384 rows
- team_hackathon_compatibility.csv: 14,400 rows

## Generation and consistency

Role-biased skill profiles contain 3–10 skills, except 18 intentionally empty profiles. Missing skills mean no recorded evidence, not necessarily no ability. Year and a latent technical ability influence proficiency, projects, profile availability and team recruitment. Participation counters and completed-project counts are computed from actual child records. Experienced skills improve team recruitment and stochastic outcomes; success is deliberately imperfect. Historical event teams cover 120 past events; 120 current teams target 60 future events. Membership applications are included only for current teams. Teams are event-specific rosters; a student can have multiple historical rosters, but cannot join two teams in the same event. Current teams also avoid duplicate accepted members within an event. These are snapshots, not full membership or profile change histories.

All historic events end before the snapshot. Complete/Registered and finished teams satisfy event size limits. Forming teams can be below the minimum. Accepted roster counts equal team_size; pending/rejected applications do not count. Leader is always accepted. Finalist team status includes Runner-up outcomes. At most one Winner and one Runner-up per event; results are based on noisy performance and ranking. Some events have no winner when performance is low. All accepted members of a historical team have one participation row with the same outcome and score.

Mentor assignments cover current teams only, one mentor per assigned team, with simultaneous capacity enforced; historical mentor assignments are intentionally omitted. Profiles have coherent domain skills, and allocation selects the best available match. No negative mentor labels are supplied.

## Scoring

Skill match: for each event skill, take the strongest accepted member proficiency (Beginner=.25, Intermediate=.50, Advanced=.80, Expert=1.00; absent=0), multiply by importance, and normalize by total importance to a percentage. Complementary members can collectively cover skills.

Team experience_score is the mean latent member technical ability times 100. This field is synthetic and must be replaced with measurable evidence in a real platform. Experience match is min(100, 100*experience_score/threshold), with threshold 25/50/75 for Beginner/Intermediate/Advanced. Domain match is the mean fraction of each member's projects in the candidate domain; students with no projects contribute zero. Team completeness is accepted size divided by the minimum, capped at 100; oversized candidate pairs use maximum divided by size. Candidate pairs may be ineligible for registration despite a high rule score; always apply size and date eligibility filters before recommending real events.

Overall = .45*skill_match + .20*experience_match + .20*domain_match + .15*team_completeness, rounded to two decimals. recommended=1 when rounded overall >=70, otherwise 0. Compatibility includes each team's target plus 19 sampled alternative events, unique pairs. Historical candidate pairs support retrospective analysis; current recommendation serving must filter to future registration deadlines. High and low scores arise from skill/domain mismatch and incomplete teams, rather than independently randomized labels.

Mentor match = .65*weighted skill proficiency percentage + .25*domain fit + .10*normalized rating; domain fit is 100 for exact specialization and 20 otherwise; rating normalized as rating*20. Member skill gaps can be computed directly from required skills minus team coverage. Performance = .62*skill coverage + .38*latent experience + Gaussian noise (SD=13), capped at 0–100. Results additionally depend on event ranking and minimum performance.

## Files for each application

| Application | CSV files | Suggested use |
|---|---|---|
| Team/student-to-team recommendation | students, student_skills, skills, teams, team_members, hackathon_required_skills | Build candidate pair features: missing-skill contribution, proficiency, role diversity, availability, size. Accepted/Pending/Rejected is workflow state, not reliable preference ground truth. Create negative candidates explicitly; exclude current membership from predictive inputs. |
| Hackathon recommendation and suitability | team_hackathon_compatibility, teams, team_members, student_skills, hackathons, hackathon_required_skills, projects | Candidate ranking, skill-gap explanations and weighted suitability. Personal recommendation needs aggregation of student skills and interests. |
| Mentor recommendation | mentors, mentor_skills, team_mentor_mapping, teams, hackathons, hackathon_required_skills | Rank candidate mentors from expertise and capacity. Enumerate unassigned candidates for evaluation; assignments are constrained choices, not unbiased preference labels. |
| Skill-gap analysis | skills, student_skills, team_members, hackathon_required_skills | Compare accepted-member coverage against required skills and importance. |
| Dashboard analytics | students, colleges, teams, hackathons, projects, hackathon_participation, team_mentor_mapping | College participation, domains, project activity, results, roster status, mentor capacity. Aggregate participation by distinct teams for team-level wins. |

## ML evaluation limits

recommended and overall score are deterministic engineered targets, not observed user behavior. Feeding the four component scores into a model predicting recommended recreates a rule and cannot demonstrate learned real-world intelligence. Use the formula as a transparent baseline. To study learned matching, derive raw skills/roles/project features, hold out students/teams/events, and evaluate with separately collected real outcomes later. Do not use IDs or names as predictive features. Split groups by team and preferably hackathon/student to avoid repeated-entity leakage; graph-connected splits may be needed because rosters share students. All profiles are snapshot data, so retrospective prediction of historical wins risks using projects/skills acquired later. A genuinely temporal benchmark requires dated profile and project histories, which these schemas do not contain. Outcome-generating ability is deliberately synthetic. The data is appropriate for demos, pipeline development, rule comparison and exploratory ML, not evidence of production accuracy.

Categorical strings are canonical and consistent; use IDs for joins. technology_stack is semicolon-delimited and can be empty for no recorded skills; all other fields are populated. Composite keys and foreign keys are listed in relationships.txt. data_dictionary.csv describes every supplied dataset column, types, keys and nullability. validation_report.json records validation results and counts. generate.py reproduces generation with Python 3 standard library only; run it in the extracted folder, and outputs are written beside the script. No external dependencies required.
