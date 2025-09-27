-- Initial seed data for AlumniVerse
-- This file contains sample data for development and testing

-- Sample users (passwords are hashed for 'TestPassword123!')
INSERT INTO users (
  id, first_name, last_name, email, password_hash, is_email_verified, role,
  bio, branch, graduation_year, current_position, company, location, phone,
  skills, experience, education, social_links
) VALUES 
(
  uuid_generate_v4(),
  'Admin',
  'User',
  'admin@sit.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O', -- TestPassword123!
  true,
  'admin',
  'System administrator for AlumniVerse platform',
  'Computer Science',
  2020,
  'Platform Administrator',
  'SIT',
  'Bangalore',
  '+91-9876543210',
  '["System Administration", "Database Management", "Security"]',
  '[{"company": "SIT", "position": "Admin", "duration": "2020-Present"}]',
  '[{"institution": "SIT", "degree": "B.Tech", "year": 2020}]',
  '{"linkedin": "https://linkedin.com/in/admin", "email": "admin@sit.ac.in"}'
),
(
  uuid_generate_v4(),
  'John',
  'Doe',
  'john.doe@sit.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
  true,
  'user',
  'Software Engineer with 3 years of experience in full-stack development',
  'Computer Science',
  2021,
  'Senior Software Engineer',
  'Tech Solutions Inc.',
  'Bangalore',
  '+91-9876543211',
  '["JavaScript", "React", "Node.js", "Python", "AWS"]',
  '[{"company": "Tech Solutions Inc.", "position": "Software Engineer", "duration": "2021-Present"}]',
  '[{"institution": "SIT", "degree": "B.Tech Computer Science", "year": 2021}]',
  '{"linkedin": "https://linkedin.com/in/johndoe", "github": "https://github.com/johndoe"}'
),
(
  uuid_generate_v4(),
  'Jane',
  'Smith',
  'jane.smith@sit.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
  true,
  'user',
  'Product Manager passionate about building user-centric solutions',
  'Information Science',
  2020,
  'Product Manager',
  'Innovation Labs',
  'Mumbai',
  '+91-9876543212',
  '["Product Management", "Agile", "User Research", "Analytics"]',
  '[{"company": "Innovation Labs", "position": "Product Manager", "duration": "2020-Present"}]',
  '[{"institution": "SIT", "degree": "B.Tech Information Science", "year": 2020}]',
  '{"linkedin": "https://linkedin.com/in/janesmith", "twitter": "https://twitter.com/janesmith"}'
),
(
  uuid_generate_v4(),
  'Raj',
  'Patel',
  'raj.patel@sit.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
  true,
  'user',
  'Data Scientist specializing in machine learning and AI',
  'Electronics',
  2019,
  'Senior Data Scientist',
  'AI Corp',
  'Hyderabad',
  '+91-9876543213',
  '["Python", "Machine Learning", "TensorFlow", "Data Analysis", "SQL"]',
  '[{"company": "AI Corp", "position": "Data Scientist", "duration": "2019-Present"}]',
  '[{"institution": "SIT", "degree": "B.Tech Electronics", "year": 2019}]',
  '{"linkedin": "https://linkedin.com/in/rajpatel", "kaggle": "https://kaggle.com/rajpatel"}'
),
(
  uuid_generate_v4(),
  'Priya',
  'Sharma',
  'priya.sharma@sit.ac.in',
  '$2b$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj/VcSAg9S6O',
  true,
  'user',
  'UX Designer creating delightful user experiences',
  'Computer Science',
  2022,
  'UX Designer',
  'Design Studio',
  'Pune',
  '+91-9876543214',
  '["UI/UX Design", "Figma", "Adobe Creative Suite", "User Research", "Prototyping"]',
  '[{"company": "Design Studio", "position": "UX Designer", "duration": "2022-Present"}]',
  '[{"institution": "SIT", "degree": "B.Tech Computer Science", "year": 2022}]',
  '{"linkedin": "https://linkedin.com/in/priyasharma", "behance": "https://behance.net/priyasharma"}'
);

-- Sample jobs
INSERT INTO jobs (
  id, title, description, company, location, type, experience_level, salary_range,
  required_skills, application_url, contact_email, deadline, posted_by
) VALUES 
(
  uuid_generate_v4(),
  'Full Stack Developer',
  'We are looking for a talented Full Stack Developer to join our growing team. You will be responsible for developing and maintaining web applications using modern technologies.',
  'Tech Solutions Inc.',
  'Bangalore',
  'job',
  'mid',
  '8-12 LPA',
  '["JavaScript", "React", "Node.js", "MongoDB", "AWS"]',
  'https://techsolutions.com/careers',
  'hr@techsolutions.com',
  '2024-12-31 23:59:59+00',
  (SELECT id FROM users WHERE email = 'john.doe@sit.ac.in')
),
(
  uuid_generate_v4(),
  'Data Science Intern',
  'Exciting internship opportunity for students interested in data science and machine learning. Work on real-world projects with experienced mentors.',
  'AI Corp',
  'Hyderabad',
  'internship',
  'entry',
  '25,000-30,000 per month',
  '["Python", "Machine Learning", "Statistics", "SQL"]',
  'https://aicorp.com/internships',
  'internships@aicorp.com',
  '2024-11-30 23:59:59+00',
  (SELECT id FROM users WHERE email = 'raj.patel@sit.ac.in')
),
(
  uuid_generate_v4(),
  'UX Designer',
  'Join our design team to create beautiful and intuitive user experiences. We are looking for someone passionate about user-centered design.',
  'Design Studio',
  'Pune',
  'job',
  'mid',
  '6-10 LPA',
  '["UI/UX Design", "Figma", "User Research", "Prototyping", "Adobe Creative Suite"]',
  'https://designstudio.com/jobs',
  'careers@designstudio.com',
  '2024-12-15 23:59:59+00',
  (SELECT id FROM users WHERE email = 'priya.sharma@sit.ac.in')
);

-- Sample events
INSERT INTO events (
  id, title, description, type, event_date, location, max_attendees,
  registration_deadline, is_virtual, agenda, tags, organized_by
) VALUES 
(
  uuid_generate_v4(),
  'SIT Alumni Networking Night 2024',
  'Join us for an evening of networking, reconnecting with fellow alumni, and sharing career experiences. Light refreshments will be provided.',
  'networking',
  '2024-11-15 18:00:00+00',
  'SIT Campus, Bangalore',
  100,
  '2024-11-10 23:59:59+00',
  false,
  '[{"time": "6:00 PM", "activity": "Registration & Welcome"}, {"time": "6:30 PM", "activity": "Networking Session"}, {"time": "8:00 PM", "activity": "Panel Discussion"}, {"time": "9:00 PM", "activity": "Dinner & Closing"}]',
  '["networking", "alumni", "career", "SIT"]',
  (SELECT id FROM users WHERE email = 'admin@sit.ac.in')
),
(
  uuid_generate_v4(),
  'Tech Talk: Future of AI',
  'An insightful session on the latest trends in Artificial Intelligence and Machine Learning. Industry experts will share their experiences and insights.',
  'seminar',
  '2024-11-20 14:00:00+00',
  'Virtual Event',
  200,
  '2024-11-18 23:59:59+00',
  true,
  '[{"time": "2:00 PM", "activity": "Welcome & Introduction"}, {"time": "2:15 PM", "activity": "Keynote: AI Trends"}, {"time": "3:00 PM", "activity": "Panel Discussion"}, {"time": "3:45 PM", "activity": "Q&A Session"}, {"time": "4:00 PM", "activity": "Closing Remarks"}]',
  '["AI", "technology", "seminar", "virtual"]',
  (SELECT id FROM users WHERE email = 'raj.patel@sit.ac.in')
),
(
  uuid_generate_v4(),
  'Career Guidance Workshop',
  'A comprehensive workshop for recent graduates and students on career planning, interview preparation, and industry insights.',
  'workshop',
  '2024-12-05 10:00:00+00',
  'SIT Campus, Bangalore',
  50,
  '2024-12-01 23:59:59+00',
  false,
  '[{"time": "10:00 AM", "activity": "Registration"}, {"time": "10:30 AM", "activity": "Career Planning Session"}, {"time": "12:00 PM", "activity": "Lunch Break"}, {"time": "1:00 PM", "activity": "Interview Preparation"}, {"time": "2:30 PM", "activity": "Industry Insights"}, {"time": "3:30 PM", "activity": "Q&A & Networking"}]',
  '["career", "workshop", "guidance", "students"]',
  (SELECT id FROM users WHERE email = 'jane.smith@sit.ac.in')
);

-- Sample event attendees
INSERT INTO event_attendees (event_id, user_id, attendance_status) VALUES 
((SELECT id FROM events WHERE title = 'SIT Alumni Networking Night 2024'), (SELECT id FROM users WHERE email = 'john.doe@sit.ac.in'), 'registered'),
((SELECT id FROM events WHERE title = 'SIT Alumni Networking Night 2024'), (SELECT id FROM users WHERE email = 'jane.smith@sit.ac.in'), 'registered'),
((SELECT id FROM events WHERE title = 'Tech Talk: Future of AI'), (SELECT id FROM users WHERE email = 'john.doe@sit.ac.in'), 'registered'),
((SELECT id FROM events WHERE title = 'Tech Talk: Future of AI'), (SELECT id FROM users WHERE email = 'priya.sharma@sit.ac.in'), 'registered'),
((SELECT id FROM events WHERE title = 'Career Guidance Workshop'), (SELECT id FROM users WHERE email = 'raj.patel@sit.ac.in'), 'registered');

-- Sample badges
INSERT INTO badges (user_id, badge_type, category, title, description, points, awarded_by) VALUES 
((SELECT id FROM users WHERE email = 'john.doe@sit.ac.in'), 'early_adopter', 'engagement', 'Early Adopter', 'One of the first users to join the platform', 50, (SELECT id FROM users WHERE email = 'admin@sit.ac.in')),
((SELECT id FROM users WHERE email = 'john.doe@sit.ac.in'), 'profile_complete', 'profile', 'Profile Master', 'Completed all profile sections', 25, (SELECT id FROM users WHERE email = 'admin@sit.ac.in')),
((SELECT id FROM users WHERE email = 'jane.smith@sit.ac.in'), 'early_adopter', 'engagement', 'Early Adopter', 'One of the first users to join the platform', 50, (SELECT id FROM users WHERE email = 'admin@sit.ac.in')),
((SELECT id FROM users WHERE email = 'jane.smith@sit.ac.in'), 'event_organizer', 'contribution', 'Event Organizer', 'Organized first alumni event', 40, (SELECT id FROM users WHERE email = 'admin@sit.ac.in')),
((SELECT id FROM users WHERE email = 'raj.patel@sit.ac.in'), 'job_poster', 'contribution', 'Job Creator', 'Posted first job opportunity', 30, (SELECT id FROM users WHERE email = 'admin@sit.ac.in')),
((SELECT id FROM users WHERE email = 'priya.sharma@sit.ac.in'), 'profile_complete', 'profile', 'Profile Master', 'Completed all profile sections', 25, (SELECT id FROM users WHERE email = 'admin@sit.ac.in'))
ON CONFLICT (user_id, badge_type) DO NOTHING;
