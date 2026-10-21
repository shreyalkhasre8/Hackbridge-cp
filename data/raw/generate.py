import random,csv,json,math,zipfile,collections,datetime
from pathlib import Path
R=random.Random(20261013); OUT=Path(__file__).resolve().parent; tables={}
def put(name,cols,rows):
 rows=[dict(zip(cols.split(),r)) for r in rows];tables[name]=rows
 with (OUT/(name+'.csv')).open('w',newline='',encoding='utf-8') as f:
  w=csv.DictWriter(f,fieldnames=cols.split());w.writeheader();w.writerows(rows)
 return rows
def clamp(x,a=0,b=100):return round(max(a,min(b,x)),2)
locations=[('Pune','Maharashtra'),('Mumbai','Maharashtra'),('Nagpur','Maharashtra'),('Chandrapur','Maharashtra'),('Bengaluru','Karnataka'),('Mysuru','Karnataka'),('Chennai','Tamil Nadu'),('Coimbatore','Tamil Nadu'),('Hyderabad','Telangana'),('Warangal','Telangana'),('Delhi','Delhi'),('Jaipur','Rajasthan'),('Ahmedabad','Gujarat'),('Surat','Gujarat'),('Kolkata','West Bengal'),('Bhubaneswar','Odisha'),('Ranchi','Jharkhand'),('Patna','Bihar'),('Lucknow','Uttar Pradesh'),('Indore','Madhya Pradesh'),('Bhopal','Madhya Pradesh'),('Kochi','Kerala'),('Thiruvananthapuram','Kerala'),('Chandigarh','Chandigarh'),('Guwahati','Assam'),('Visakhapatnam','Andhra Pradesh'),('Raipur','Chhattisgarh'),('Dehradun','Uttarakhand'),('Panaji','Goa'),('Jammu','Jammu and Kashmir')]
first='Aarav Advait Aditya Akash Aniket Arjun Atharv Dhruv Harsh Ishaan Karan Manav Nikhil Om Pranav Rahul Rohan Sahil Shreyas Varun Vihaan Yash Aditi Ananya Anushka Avani Diya Isha Kavya Meera Neha Nisha Pooja Priya Riya Sakshi Sanika Shreya Shruti Sneha Tanvi Vaishnavi Zara'.split();last='Patil Deshmukh Kulkarni Joshi Shinde Pawar Jadhav More Nair Menon Iyer Rao Reddy Naidu Gowda Shetty Sharma Verma Gupta Singh Yadav Mishra Das Roy Banerjee Chatterjee Mehta Shah Patel Trivedi Jain Sahu Mohanty Behera Kumar Sinha Bhat Qureshi Khan Fernandes'.split()
names=R.sample([a+' '+b for a in first for b in last],1300)
colleges=put('colleges','college_id college_name city state college_type',[(f'C{i+1:03}',f'{["Sahyadri","Pragati","Navchetan","Sarvodaya"][i//30]} Institute of Engineering, {locations[i%30][0]}',*locations[i%30],R.choice(['Private','Government','Autonomous'])) for i in range(60)])
groups={'Programming':'Python|Java|C|C++|JavaScript|TypeScript|Go|Rust|R|SQL','Frontend':'HTML|CSS|React|Angular|Vue.js|Next.js|Tailwind CSS','Backend':'Node.js|Express.js|REST API|FastAPI|Flask|Django|Spring Boot|GraphQL','Database':'MongoDB|MySQL|PostgreSQL|Firebase|Supabase|Redis','AI/ML':'TensorFlow|PyTorch|Scikit-learn|OpenCV|NLP|Machine Learning|Deep Learning|LLMs','Data Science':'Pandas|NumPy|Data Analytics|Power BI|Tableau|Statistics|Apache Spark','Cloud':'AWS|Azure|Google Cloud|Serverless','DevOps':'Docker|Git|GitHub|Kubernetes|CI/CD|Linux|Terraform','Design':'Figma|UI Design|UX Research|Prototyping','Mobile':'Flutter|React Native|Kotlin|Android SDK|Dart','IoT':'Arduino|ESP32|IoT|Sensors|Embedded Programming|MQTT|Raspberry Pi','Security':'Cybersecurity|Network Security|Cryptography|Ethical Hacking|OAuth','Blockchain':'Blockchain|Solidity|Web3.js|Smart Contracts'}
skills=put('skills','skill_id skill_name skill_category',[(f'SK{i+1:03}',s,c) for i,(s,c) in enumerate((s,c) for c,v in groups.items() for s in v.split('|'))]);sid={s['skill_name']:s['skill_id'] for s in skills};cat={s['skill_id']:s['skill_category'] for s in skills}
roles={'Frontend Developer':'HTML|CSS|JavaScript|React|TypeScript|Figma|Next.js','Backend Developer':'Python|Java|Node.js|Express.js|PostgreSQL|REST API|FastAPI','Full Stack Developer':'HTML|CSS|JavaScript|React|Node.js|MongoDB|REST API','AI/ML Developer':'Python|TensorFlow|PyTorch|Scikit-learn|Pandas|Machine Learning|Deep Learning','Data Scientist':'Python|R|Pandas|NumPy|Statistics|Scikit-learn|Machine Learning','Data Analyst':'SQL|Python|Pandas|Power BI|Tableau|Data Analytics|Statistics','UI/UX Designer':'Figma|UI Design|UX Research|Prototyping|HTML|CSS','Android Developer':'Java|Kotlin|Android SDK|Flutter|Dart|Firebase','Cloud Developer':'AWS|Azure|Google Cloud|Docker|Serverless|Python','DevOps':'Docker|Kubernetes|CI/CD|Linux|Terraform|Git|AWS','Cybersecurity':'Cybersecurity|Network Security|Cryptography|Ethical Hacking|Linux|Python','IoT Developer':'Arduino|ESP32|IoT|Sensors|Embedded Programming|C++|MQTT','Blockchain Developer':'Blockchain|Solidity|Web3.js|Smart Contracts|JavaScript|Cryptography'}
domains={'AI/ML':'Python|Machine Learning|Scikit-learn|Pandas|TensorFlow','FinTech':'Python|REST API|PostgreSQL|Cryptography|React','HealthTech':'Python|Machine Learning|REST API|PostgreSQL|React','EdTech':'React|Node.js|Firebase|UI Design|REST API','Agriculture':'IoT|ESP32|Sensors|Python|Data Analytics','Cybersecurity':'Cybersecurity|Network Security|Cryptography|Python|Linux','Blockchain':'Blockchain|Solidity|Web3.js|Smart Contracts|JavaScript','IoT':'IoT|Arduino|ESP32|Sensors|MQTT','Smart Cities':'IoT|Sensors|Data Analytics|REST API|React','Sustainability':'Python|Data Analytics|IoT|Sensors|React','Web Development':'HTML|CSS|JavaScript|React|Node.js','Data Science':'Python|Pandas|NumPy|Statistics|Scikit-learn','Cloud Computing':'AWS|Docker|Kubernetes|REST API|Terraform','Social Impact':'React|Firebase|UI Design|REST API|Python','Open Innovation':'Python|JavaScript|REST API|Git|UI Design'}
levels=['Beginner','Intermediate','Advanced','Expert']; pv=dict(zip(levels,[.25,.5,.8,1.])); students=[];ss=[];ability={};sm={}
for i in range(1200):
 st=f'ST{i+1:04}';c=R.choice(colleges);year=R.choices([1,2,3,4],[.18,.3,.3,.22])[0];a=max(.05,min(.98,R.betavariate(2,2)*.65+year*.07));ability[st]=a;role=R.choice(list(roles)); n=0 if i<18 else R.randint(3,10);pool=[sid[s] for s in roles[role].split('|')]; selected=[]
 while len(selected)<n:
  s=R.choice(pool if R.random()<.82 else list(sid.values()))
  if s not in selected:selected.append(s)
 sm[st]={}
 for s in selected:
  lv=levels[min(3,max(0,int(a*4+R.gauss(0,.55))))];months=R.randint(1,max(2,int((year*12-5)*(.35+pv[lv]*.6))));ss.append((st,s,lv,months));sm[st][s]=pv[lv]
 students.append((st,names[i],c['college_id'],R.choice(['Computer Engineering','Computer Science and Engineering','CSE (AI & ML)','Information Technology','Electronics and Telecommunication','Electrical Engineering','Mechanical Engineering','Civil Engineering']),year,clamp(6.2+2.9*a+R.gauss(0,.55),5,10),c['city'],c['state'],role,levels[min(3,int(a*4))],0,0,0,int(R.random()<.35+.6*a),int(R.random()<.1+.65*a),R.choice([3,4,5,6]),R.randint(4,12)+int(a*12)))
# Students are rewritten after all histories and projects have been generated.
put('students','student_id student_name college_id branch year cgpa city state primary_role experience_level hackathons_participated hackathons_won projects_completed github_available portfolio_available preferred_team_size availability_hours_per_week',students)
put('student_skills','student_id skill_id proficiency_level experience_months',ss)
hacks=[];hr=[];req={};today=datetime.date(2026,10,13)
for i in range(180):
 hid=f'H{i+1:03}';dom=list(domains)[i%15];city,state=R.choice(locations);start=today-datetime.timedelta(days=(120-i)*5+10) if i<120 else today+datetime.timedelta(days=(i-120)*5+15);difficulty=R.choices(['Beginner','Intermediate','Advanced'],[.25,.5,.25])[0];exp={'Beginner':'Beginner','Intermediate':'Intermediate','Advanced':'Advanced'}[difficulty];hacks.append((hid,f'{dom} {R.choice(["Sprint","Challenge","Buildathon","Innovation Jam"])} {i+1:03}',f'{city} Innovation Collective {i%8+1}',R.choice(['Online','Offline','Hybrid']),city,state,dom,difficulty,3,R.choice([4,5,6]),str(start-datetime.timedelta(days=7)),str(start),str(start+datetime.timedelta(days=2)),R.choice([25000,50000,100000,200000,500000]),exp));req[hid]={sid[s]:R.randint(3,5) for s in domains[dom].split('|')}
 for s in R.sample([sid['Git'],sid['GitHub'],sid['Figma'],sid['REST API']],2):req[hid].setdefault(s,R.randint(1,2))
 hr.extend((hid,s,w) for s,w in req[hid].items())
put('hackathons','hackathon_id hackathon_name organizer mode city state domain difficulty_level team_min_size team_max_size registration_deadline start_date end_date prize_pool experience_required',hacks);put('hackathon_required_skills','hackathon_id skill_id importance_weight',hr)
projects=[];project_domains=collections.defaultdict(collections.Counter)
for st in tables['students']:
 n=max(0,round(1+ability[st['student_id']]*4+R.gauss(0,1)))
 if not sm[st['student_id']]:n=R.choice([0,1])
 preferred=max(domains,key=lambda d:sum(sid[s] in sm[st['student_id']] for s in domains[d].split('|')))
 for j in range(n):
  d=preferred if R.random()<.8 else R.choice(list(domains));status=R.choices(['Completed','Ongoing'],[.8,.2])[0]; stack=sorted(sm[st['student_id']],key=sm[st['student_id']].get,reverse=True)[:R.randint(2,5)]; projects.append((f'P{len(projects)+1:05}',st['student_id'],f'{d} {R.choice(["Assistant","Portal","Monitor","Planner","Prediction Engine"])} {j+1}',d,';'.join(next(s['skill_name'] for s in skills if s['skill_id']==sk) for sk in stack),st['experience_level'] if st['experience_level']!='Expert' else 'Advanced',status));project_domains[st['student_id']][d]+=1
put('projects','project_id student_id project_title project_domain technology_stack difficulty_level project_status',projects)
teamrows=[];members=[];accepted={};participation=[];used=collections.defaultdict(set)
for i in range(720):
 tid=f'T{i+1:04}';historic=i<600;h=tables['hackathons'][i//5] if historic else tables['hackathons'][120+(i-600)%60];hid=h['hackathon_id'];forming=not historic and R.random()<.65;size=R.choice([1,2]) if forming else R.randint(3,h['team_max_size']); candidates=[s for s in sm if s not in used[hid]]
 # Correlated recruitment, with both specialist and mixed/weak teams.
 coherence=R.random(); candidates.sort(key=lambda s:sum(sm[s].get(sk,0)*w for sk,w in req[hid].items())*coherence+R.random()*12,reverse=True);chosen=candidates[:size];used[hid].update(chosen);accepted[tid]=chosen
 experience=clamp(sum(ability[s] for s in chosen)/size*100);diversity=clamp(len({cat[sk] for s in chosen for sk in sm[s]})/10*100)
 coverage=sum(w*max(sm[s].get(sk,0) for s in chosen) for sk,w in req[hid].items())/sum(req[hid].values())*100
 perf=clamp(.62*coverage+.38*experience+R.gauss(0,13));result='Winner' if perf>=83 else 'Runner-up' if perf>=77 else 'Finalist' if perf>=69 else 'Shortlisted' if perf>=58 else 'Participant'
 status={'Winner':'Winner','Runner-up':'Finalist','Finalist':'Finalist','Shortlisted':'Participated','Participant':'Participated'}[result] if historic else ('Forming' if forming else R.choice(['Complete','Registered']))
 teamrows.append((tid,f'{R.choice(["Byte","Code","Neural","Logic","Circuit","Pixel"])} {R.choice(["Pioneers","Crafters","Titans","Minds","Builders"])} {i+1:03}',chosen[0],hid,size,status,experience,diversity))
 for s in chosen:
  role=tables['students'][int(s[2:])-1]['primary_role'];members.append((tid,s,role,'Accepted'))
  if historic:participation.append((f'PA{len(participation)+1:05}',s,hid,tid,role,result,perf))
 if not historic:
  for s in R.sample([s for s in sm if s not in chosen],R.randint(1,3)):members.append((tid,s,tables['students'][int(s[2:])-1]['primary_role'],R.choice(['Pending','Rejected'])))
put('teams','team_id team_name leader_student_id hackathon_id team_size team_status experience_score skill_diversity_score',teamrows);put('team_members','team_id student_id assigned_role join_status',members);put('hackathon_participation','participation_id student_id hackathon_id team_id role result performance_score',participation)
counts=collections.Counter(p[1] for p in participation);wins=collections.Counter(p[1] for p in participation if p[5]=='Winner');pc=collections.Counter(p[1] for p in projects if p[-1]=='Completed')
for s in tables['students']:s.update(hackathons_participated=counts[s['student_id']],hackathons_won=wins[s['student_id']],projects_completed=pc[s['student_id']])
put('students',' '.join(tables['students'][0]),[list(s.values()) for s in tables['students']])
mentors=[];ms=[];mm={}
for i in range(100):
 mid=f'M{i+1:03}';d=list(domains)[i%15];years=R.randint(3,20);mentors.append((mid,names[1200+i],d,years,R.choice(['Software Services','Financial Services','Healthcare Technology','Education Technology','Manufacturing','Research','Consulting']),R.randint(2,5),clamp(R.gauss(4.25,.4),2.5,5)));mm[mid]={sid[s]:R.randint(7,10) for s in domains[d].split('|')}
 for sk in R.sample(list(sid.values()),3):mm[mid].setdefault(sk,R.randint(4,8))
 ms.extend((mid,s,v) for s,v in mm[mid].items())
put('mentors','mentor_id mentor_name specialization years_of_experience industry max_teams rating',mentors);put('mentor_skills','mentor_id skill_id proficiency_score',ms)
mapping=[];loads=collections.Counter()
for t in tables['teams'][600:]:
 h=tables['hackathons'][int(t['hackathon_id'][1:])-1];options=[]
 for m in tables['mentors']:
  if loads[m['mentor_id']]>=m['max_teams']:continue
  skill=sum(w*mm[m['mentor_id']].get(sk,0)/10 for sk,w in req[h['hackathon_id']].items())/sum(req[h['hackathon_id']].values())*100
  score=clamp(.65*skill+.25*(100 if m['specialization']==h['domain'] else 20)+.1*m['rating']*20)
  options.append((score,m['mentor_id']))
 score,mid=max(options);loads[mid]+=1;mapping.append((t['team_id'],mid,score))
put('team_mentor_mapping','team_id mentor_id mentor_team_match_score',mapping)
compat=[]
for t in tables['teams']:
 chosen=accepted[t['team_id']];target=t['hackathon_id']; selections=R.sample([h['hackathon_id'] for h in tables['hackathons'] if h['hackathon_id']!=target],19)+[target]
 for hid in selections:
  h=tables['hackathons'][int(hid[1:])-1]; skill=clamp(sum(w*max(sm[s].get(sk,0) for s in chosen) for sk,w in req[hid].items())/sum(req[hid].values())*100); required={'Beginner':25,'Intermediate':50,'Advanced':75}[h['experience_required']];experience=clamp(t['experience_score']/required*100)
  domain=clamp(sum(project_domains[s][h['domain']]/max(1,sum(project_domains[s].values())) for s in chosen)/len(chosen)*100);complete=clamp(t['team_size']/h['team_min_size']*100) if t['team_size']<=h['team_max_size'] else clamp(h['team_max_size']/t['team_size']*100)
  overall=round(.45*skill+.2*experience+.2*domain+.15*complete,2);compat.append((t['team_id'],hid,skill,experience,domain,complete,overall,int(overall>=70)))
put('team_hackathon_compatibility','team_id hackathon_id skill_match_percentage experience_match_percentage domain_match_percentage team_completeness_percentage overall_compatibility_score recommended',compat)
# Enforce one winner and one runner-up at most per event, preserving stochastic team ranking.
for h in tables['hackathons'][:120]:
 ts=[t for t in tables['teams'] if t['hackathon_id']==h['hackathon_id']];rank=sorted(ts,key=lambda t:next(p['performance_score'] for p in tables['hackathon_participation'] if p['team_id']==t['team_id']),reverse=True)
 for pos,t in enumerate(rank):
  score=next(p['performance_score'] for p in tables['hackathon_participation'] if p['team_id']==t['team_id']);result='Winner' if pos==0 and score>=65 else 'Runner-up' if pos==1 and score>=60 else 'Finalist' if score>=60 else 'Shortlisted' if score>=50 else 'Participant'
  t['team_status']={'Winner':'Winner','Runner-up':'Finalist','Finalist':'Finalist','Shortlisted':'Participated','Participant':'Participated'}[result]
  for p in tables['hackathon_participation']:
   if p['team_id']==t['team_id']:p['result']=result
for name in ['teams','hackathon_participation']:put(name,' '.join(tables[name][0]),[list(r.values()) for r in tables[name]])
wins=collections.Counter(p['student_id'] for p in tables['hackathon_participation'] if p['result']=='Winner')
for s in tables['students']:s['hackathons_won']=wins[s['student_id']]
put('students',' '.join(tables['students'][0]),[list(s.values()) for s in tables['students']])
keys={'students':['student_id'],'colleges':['college_id'],'skills':['skill_id'],'student_skills':['student_id','skill_id'],'hackathons':['hackathon_id'],'hackathon_required_skills':['hackathon_id','skill_id'],'teams':['team_id'],'team_members':['team_id','student_id'],'mentors':['mentor_id'],'mentor_skills':['mentor_id','skill_id'],'team_mentor_mapping':['team_id','mentor_id'],'projects':['project_id'],'hackathon_participation':['participation_id'],'team_hackathon_compatibility':['team_id','hackathon_id']}
parent={'student_id':'students','leader_student_id':'students','college_id':'colleges','skill_id':'skills','hackathon_id':'hackathons','team_id':'teams','mentor_id':'mentors'}
desc={
'student_id':'Unique synthetic student identifier.','student_name':'Fictional Indian-style full name; not a real identity.','college_id':'College identifier.','branch':'Engineering degree branch.','year':'Current study year, 1 to 4.','cgpa':'Current CGPA on a 10-point scale.','city':'College or event city; students use college city.','state':'Indian state or union territory corresponding to city.','primary_role':'Preferred technical contribution role.','experience_level':'Latent technical proficiency category; not inferred solely from participation count.','hackathons_participated':'Count of student rows in hackathon_participation; historical events only.','hackathons_won':'Count of historical Winner outcomes.','projects_completed':'Count of Completed project records.','github_available':'1 if a GitHub profile is available; otherwise 0.','portfolio_available':'1 if a portfolio is available; otherwise 0.','preferred_team_size':'Preferred number of accepted members, 3 to 6.','availability_hours_per_week':'Estimated weekly hours available for collaboration.','college_name':'Fictional engineering college name; no real affiliation implied.','college_type':'Private, Government or Autonomous; simplified institutional classification.','skill_id':'Unique technical skill identifier.','skill_name':'Canonical case-sensitive skill name.','skill_category':'Technical skill category.','proficiency_level':'Beginner, Intermediate, Advanced or Expert.','experience_months':'Months of experience with this skill.','hackathon_id':'Unique hackathon identifier.','hackathon_name':'Fictional event name.','organizer':'Fictional organizing body.','mode':'Online, Offline or Hybrid.','domain':'Canonical hackathon domain.','difficulty_level':'Beginner, Intermediate or Advanced.','team_min_size':'Minimum permitted accepted team members.','team_max_size':'Maximum permitted accepted team members.','registration_deadline':'Registration closing date, ISO YYYY-MM-DD, seven days before start.','start_date':'Event start date, ISO YYYY-MM-DD.','end_date':'Event end date, ISO YYYY-MM-DD.','prize_pool':'Total nominal prize pool in Indian rupees (INR).','experience_required':'Required technical experience tier.','importance_weight':'Required skill importance, integer 1 to 5.','team_id':'Unique team identifier; team roster belongs to one event.','team_name':'Fictional unique team display name.','leader_student_id':'Student identifier of an accepted team member who leads the team.','team_size':'Count of Accepted membership rows only; excludes Pending and Rejected.','team_status':'Forming, Complete, Registered, Participated, Finalist or Winner; Runner-up maps to Finalist.','experience_score':'Mean member latent technical ability times 100; synthetic feature, not an observed assessment.','skill_diversity_score':'Number of distinct accepted-member skill categories divided by 10, capped at 100.','assigned_role':'Member technical role, consistent with student primary_role.','join_status':'Pending, Accepted or Rejected; pending/rejected are applications only.','mentor_id':'Unique mentor identifier.','mentor_name':'Fictional Indian-style mentor name.','specialization':'Primary expertise domain from hackathon domain vocabulary.','years_of_experience':'Professional experience, 3 to 20 years.','industry':'Broad professional industry.','max_teams':'Maximum simultaneously assigned current teams.','rating':'Synthetic mentor rating on a 5-point scale.','proficiency_score':'Mentor skill proficiency, integer 1 to 10.','mentor_team_match_score':'0 to 100: 65% weighted required-skill proficiency + 25% domain fit + 10% rating normalized to 100.','project_id':'Unique project identifier.','project_title':'Synthetic project title; unique identity is project_id, not title.','project_domain':'Canonical project domain.','technology_stack':'Semicolon-separated skill names actually present in the owner skill profile; empty for missing-skill profiles.','project_status':'Completed or Ongoing.','participation_id':'Unique student-event-team participation identifier.','role':'Technical contribution role during the event.','result':'Participant, Shortlisted, Finalist, Runner-up or Winner; team members share the outcome.','performance_score':'Synthetic team performance 0 to 100 from skill coverage, ability and Gaussian noise; shared by team members.','skill_match_percentage':'Weighted required-skill coverage using strongest accepted member per skill; Beginner=.25, Intermediate=.5, Advanced=.8, Expert=1; absent=0.','experience_match_percentage':'100*team experience_score/required threshold; capped at 100; thresholds 25, 50, 75.','domain_match_percentage':'Mean member fraction of projects in the candidate event domain, multiplied by 100; no projects=0.','team_completeness_percentage':'100*accepted size/minimum for undersized teams, capped at 100; oversized teams use 100*maximum/size.','overall_compatibility_score':'Rounded to two decimals: .45*skill + .20*experience + .20*domain + .15*completeness.','recommended':'1 if rounded overall_compatibility_score >=70, else 0; rule label, not a real preference.'}
dictionary=[]
for name,rows in tables.items():
 for col,val in rows[0].items():
  pk=col in keys[name];fk=col in parent and not(name==parent[col] and col!='leader_student_id');ref=(parent[col]+'.'+('student_id' if col=='leader_student_id' else col)) if fk else ''
  typ='integer' if isinstance(val,int) else 'decimal' if isinstance(val,float) else 'date' if col in ['registration_deadline','start_date','end_date'] else 'string'
  dictionary.append((name+'.csv',col,typ,'Yes' if pk else 'No',ref,'Yes' if col=='technology_stack' else 'No',desc[col]))
put('data_dictionary','file_name column_name data_type primary_key foreign_key nullable description',dictionary)
relations=['HackBridge relational schema','Primary keys:']+[f'{n}.csv: ({", ".join(k)})' for n,k in keys.items()]+['','Foreign keys:']
for name,rows in tables.items():
 if name=='data_dictionary':continue
 for c in rows[0]:
  if c in parent and not(name==parent[c] and c!='leader_student_id'):relations.append(f'{name}.{c} -> {parent[c]}.{"student_id" if c=="leader_student_id" else c}')
relations+=['','Additional constraints: (student_id,hackathon_id) is unique in participation. Each participation team belongs to that event and the student has Accepted membership. Leaders are Accepted members. Team size counts Accepted members only. Mentor mappings cover current teams only and honor mentor capacity. Historical rosters can recur across different dates. Candidate compatibility pairs are not registrations.']
(OUT/'relationships.txt').write_text('\n'.join(relations))
checks=[]
def check(label,test):
 assert test,label
 checks.append({'check':label,'status':'PASS'})
# Validate reloaded CSVs, not just generator objects.
loaded={n:list(csv.DictReader((OUT/(n+'.csv')).open())) for n in keys}
ids={n:{r[keys[n][0]] for r in rows} for n,rows in loaded.items()}
for n,rows in loaded.items():
 check(n+': unique primary key',len({tuple(r[k] for k in keys[n]) for r in rows})==len(rows));check(n+': no duplicate full rows',len({tuple(r.values()) for r in rows})==len(rows))
 for c in rows[0]:
  if c in parent and not(n==parent[c] and c!='leader_student_id'):check(n+'.'+c+': valid foreign keys',all(r[c] in ids[parent[c]] for r in rows))
for h in loaded['hackathons']:check(h['hackathon_id']+': ordered valid dates',datetime.date.fromisoformat(h['registration_deadline'])<datetime.date.fromisoformat(h['start_date'])<=datetime.date.fromisoformat(h['end_date']))
byh={h['hackathon_id']:h for h in loaded['hackathons']};byt={t['team_id']:t for t in loaded['teams']};ams=collections.defaultdict(set)
for m in loaded['team_members']:
 if m['join_status']=='Accepted':ams[m['team_id']].add(m['student_id'])
for t in loaded['teams']:
 size=int(t['team_size']);h=byh[t['hackathon_id']];check(t['team_id']+': accepted size and leader',size==len(ams[t['team_id']]) and t['leader_student_id'] in ams[t['team_id']]);check(t['team_id']+': registration eligibility',size<=int(h['team_max_size']) and (t['team_status']=='Forming' or size>=int(h['team_min_size'])))
check('Participation unique student/event',len({(p['student_id'],p['hackathon_id']) for p in loaded['hackathon_participation']})==len(loaded['hackathon_participation']))
check('Participation accepted membership and event',all(p['student_id'] in ams[p['team_id']] and byt[p['team_id']]['hackathon_id']==p['hackathon_id'] and datetime.date.fromisoformat(byh[p['hackathon_id']]['end_date'])<today for p in loaded['hackathon_participation']))
check('Participation scores 0 to 100',all(0<=float(p['performance_score'])<=100 for p in loaded['hackathon_participation']))
for s in loaded['students']:
 st=s['student_id'];check(st+': denormalized history counters',int(s['hackathons_participated'])==counts[st] and int(s['hackathons_won'])==wins[st] and int(s['projects_completed'])==pc[st])
check('Skill importance 1 to 5',all(1<=int(r['importance_weight'])<=5 for r in loaded['hackathon_required_skills']))
check('Mentor proficiency 1 to 10',all(1<=int(r['proficiency_score'])<=10 for r in loaded['mentor_skills']))
check('Mentor capacity respected',all(loads[m['mentor_id']]<=int(m['max_teams']) for m in loaded['mentors']))
check('Mentor match scores 0 to 100',all(0<=float(r['mentor_team_match_score'])<=100 for r in loaded['team_mentor_mapping']))
for c in loaded['team_hackathon_compatibility']:
 values=[float(c[k]) for k in ['skill_match_percentage','experience_match_percentage','domain_match_percentage','team_completeness_percentage']];overall=round(.45*values[0]+.20*values[1]+.20*values[2]+.15*values[3],2)
 assert all(0<=x<=100 for x in values) and abs(overall-float(c['overall_compatibility_score']))<.001 and int(c['recommended'])==int(overall>=70)
check('All compatibility ranges, formulas and labels',True)
positive=sum(int(c['recommended']) for c in loaded['team_hackathon_compatibility']);check('Both compatibility label classes exist',0<positive<len(compat))
minima={'students':1000,'colleges':50,'skills':60,'hackathons':150,'teams':250,'mentors':100,'projects':1500,'student_skills':5000,'hackathon_participation':2000,'team_hackathon_compatibility':3000}
for n,minimum in minima.items():check(n+': target scale',len(loaded[n])>=minimum)
report={'seed':20261013,'snapshot_date':str(today),'status':'PASS','failed_checks':0,'passed_checks':len(checks),'row_counts':{n:len(r) for n,r in loaded.items()},'recommended_positive':positive,'recommended_negative':len(compat)-positive,'students_without_skills':sum(not v for v in sm.values()),'incomplete_teams':sum(t['team_status']=='Forming' for t in loaded['teams']),'checks':checks}
(OUT/'validation_report.json').write_text(json.dumps(report,indent=2))
readme='''# HackBridge synthetic relational dataset

All people, colleges, organizers, events and results are fictional. Names are Indian-style; cities and states are real geographic labels. No scraped personal information or claims about real institutions. Snapshot: 2026-10-13. Seed: 20261013. UTF-8 CSV; headers; IDs are strings; booleans are 0/1; dates ISO YYYY-MM-DD; monetary amounts INR.

## Size

'''+ '\n'.join(f'- {n}.csv: {len(r):,} rows' for n,r in loaded.items())+f'''

## Generation and consistency

Role-biased skill profiles contain 3–10 skills, except {report['students_without_skills']} intentionally empty profiles. Missing skills mean no recorded evidence, not necessarily no ability. Year and a latent technical ability influence proficiency, projects, profile availability and team recruitment. Participation counters and completed-project counts are computed from actual child records. Experienced skills improve team recruitment and stochastic outcomes; success is deliberately imperfect. Historical event teams cover 120 past events; 120 current teams target 60 future events. Membership applications are included only for current teams. Teams are event-specific rosters; a student can have multiple historical rosters, but cannot join two teams in the same event. Current teams also avoid duplicate accepted members within an event. These are snapshots, not full membership or profile change histories.

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
'''
(OUT/'README.md').write_text(readme)
# Include portable reproducibility script, which writes beside itself when extracted.
source=Path(__file__).read_text().replace("OUT=Path(__file__).resolve().parent","OUT=Path(__file__).resolve().parent")
(OUT/'generate.py').write_text(source)
zip_path=OUT.parent/'HackBridge_Dataset.zip'
with zipfile.ZipFile(zip_path,'w',zipfile.ZIP_DEFLATED) as z:
 for p in sorted(OUT.iterdir()):z.write(p,p.name)
print(json.dumps({k:v for k,v in report.items() if k!='checks'},indent=2))
print('ZIP:',zip_path,zip_path.stat().st_size)
