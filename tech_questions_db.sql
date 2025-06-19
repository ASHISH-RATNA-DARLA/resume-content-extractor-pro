-- Technical Interview Questions Database Schema and Sample Data for SDE-HIRE

-- Create the main technical questions table
CREATE TABLE technical_questions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_text TEXT NOT NULL,
    question_type VARCHAR(20) NOT NULL CHECK (question_type IN ('mcq', 'short_answer', 'long_answer')),
    tech_stack VARCHAR(50) NOT NULL,
    difficulty_level VARCHAR(20) NOT NULL CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
    topic VARCHAR(100) NOT NULL,
    is_premium BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create MCQ options table (for multiple choice questions)
CREATE TABLE mcq_options (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES technical_questions(id) ON DELETE CASCADE,
    option_text TEXT NOT NULL,
    is_correct BOOLEAN DEFAULT FALSE,
    option_label CHAR(1) NOT NULL CHECK (option_label IN ('A', 'B', 'C', 'D'))
);

-- Create expected answers table (for short/long answer questions)
CREATE TABLE expected_answers (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    question_id UUID REFERENCES technical_questions(id) ON DELETE CASCADE,
    sample_answer TEXT NOT NULL,
    key_points JSONB, -- Store key points that should be covered
    scoring_criteria TEXT
);

-- Create user responses table
CREATE TABLE user_responses (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID NOT NULL, -- References auth.users
    question_id UUID REFERENCES technical_questions(id) ON DELETE CASCADE,
    user_answer TEXT NOT NULL,
    ai_score INTEGER CHECK (ai_score >= 0 AND ai_score <= 100),
    ai_feedback TEXT,
    time_taken INTEGER, -- in seconds
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Insert sample technical questions

-- DBMS Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('What is the difference between DELETE, TRUNCATE, and DROP commands in SQL?', 'short_answer', 'DBMS', 'medium', 'SQL Commands', false),
('Which of the following is NOT a property of ACID transactions?', 'mcq', 'DBMS', 'easy', 'Transactions', false),
('Explain the concept of database normalization and its advantages.', 'long_answer', 'DBMS', 'medium', 'Normalization', false),
('What is a deadlock in database systems and how can it be prevented?', 'short_answer', 'DBMS', 'hard', 'Concurrency Control', true),
('Which isolation level prevents dirty reads but allows phantom reads?', 'mcq', 'DBMS', 'medium', 'Isolation Levels', false);

-- Operating Systems Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('What is the difference between a process and a thread?', 'short_answer', 'Operating Systems', 'easy', 'Process Management', false),
('Which scheduling algorithm can cause starvation?', 'mcq', 'Operating Systems', 'medium', 'CPU Scheduling', false),
('Explain the concept of virtual memory and its benefits.', 'long_answer', 'Operating Systems', 'medium', 'Memory Management', false),
('What is thrashing in operating systems and how can it be avoided?', 'short_answer', 'Operating Systems', 'hard', 'Memory Management', true),
('Which of the following is a non-preemptive scheduling algorithm?', 'mcq', 'Operating Systems', 'easy', 'CPU Scheduling', false);

-- Computer Networks Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('Explain the difference between TCP and UDP protocols.', 'short_answer', 'Computer Networks', 'easy', 'Transport Layer', false),
('Which layer of the OSI model is responsible for routing?', 'mcq', 'Computer Networks', 'easy', 'OSI Model', false),
('What is the purpose of NAT (Network Address Translation)?', 'short_answer', 'Computer Networks', 'medium', 'Network Layer', false),
('Explain how HTTPS ensures secure communication over the internet.', 'long_answer', 'Computer Networks', 'medium', 'Application Layer', true),
('What is the maximum number of hosts possible in a /24 subnet?', 'mcq', 'Computer Networks', 'medium', 'Subnetting', false);

-- Object-Oriented Programming Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('What are the four pillars of Object-Oriented Programming?', 'short_answer', 'OOP', 'easy', 'OOP Fundamentals', false),
('Which OOP concept allows a class to have multiple methods with the same name?', 'mcq', 'OOP', 'easy', 'Polymorphism', false),
('Explain the difference between method overloading and method overriding.', 'short_answer', 'OOP', 'medium', 'Polymorphism', false),
('What is the diamond problem in multiple inheritance and how is it resolved?', 'long_answer', 'OOP', 'hard', 'Inheritance', true),
('Which access modifier makes a member accessible only within the same package?', 'mcq', 'OOP', 'medium', 'Access Modifiers', false);

-- Cloud Computing Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('What are the three main service models in cloud computing?', 'short_answer', 'Cloud Computing', 'easy', 'Service Models', false),
('Which cloud deployment model offers the highest level of control and security?', 'mcq', 'Cloud Computing', 'easy', 'Deployment Models', false),
('Explain the concept of auto-scaling in cloud computing.', 'short_answer', 'Cloud Computing', 'medium', 'Scalability', false),
('What is the difference between horizontal and vertical scaling?', 'short_answer', 'Cloud Computing', 'medium', 'Scalability', false),
('Describe the benefits and challenges of microservices architecture.', 'long_answer', 'Cloud Computing', 'hard', 'Architecture', true);

-- DevOps Questions
INSERT INTO technical_questions (question_text, question_type, tech_stack, difficulty_level, topic, is_premium) VALUES
('What is the primary goal of DevOps practices?', 'short_answer', 'DevOps', 'easy', 'DevOps Fundamentals', false),
('Which tool is commonly used for container orchestration?', 'mcq', 'DevOps', 'medium', 'Containerization', false),
('Explain the concept of Infrastructure as Code (IaC).', 'short_answer', 'DevOps', 'medium', 'Infrastructure', false),
('What is the difference between continuous integration and continuous deployment?', 'short_answer', 'DevOps', 'medium', 'CI/CD', false),
('Describe the benefits of using containerization in software deployment.', 'long_answer', 'DevOps', 'medium', 'Containerization', true);

-- Insert MCQ options
INSERT INTO mcq_options (question_id, option_text, is_correct, option_label) VALUES
-- ACID properties question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is NOT a property of ACID%'), 'Atomicity', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is NOT a property of ACID%'), 'Consistency', false, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is NOT a property of ACID%'), 'Isolation', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is NOT a property of ACID%'), 'Availability', true, 'D'),

-- Isolation levels question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which isolation level prevents dirty reads%'), 'Read Uncommitted', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which isolation level prevents dirty reads%'), 'Read Committed', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which isolation level prevents dirty reads%'), 'Repeatable Read', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which isolation level prevents dirty reads%'), 'Serializable', false, 'D'),

-- Scheduling algorithm question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which scheduling algorithm can cause starvation%'), 'Round Robin', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which scheduling algorithm can cause starvation%'), 'Shortest Job First', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which scheduling algorithm can cause starvation%'), 'First Come First Serve', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which scheduling algorithm can cause starvation%'), 'Priority Scheduling', false, 'D'),

-- Non-preemptive scheduling question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is a non-preemptive%'), 'Round Robin', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is a non-preemptive%'), 'Shortest Remaining Time First', false, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is a non-preemptive%'), 'First Come First Serve', true, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which of the following is a non-preemptive%'), 'Multilevel Queue', false, 'D'),

-- OSI model layer question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which layer of the OSI model is responsible for routing%'), 'Transport Layer', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which layer of the OSI model is responsible for routing%'), 'Network Layer', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which layer of the OSI model is responsible for routing%'), 'Data Link Layer', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which layer of the OSI model is responsible for routing%'), 'Physical Layer', false, 'D'),

-- Subnet hosts question
((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the maximum number of hosts possible in a /24%'), '256', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the maximum number of hosts possible in a /24%'), '254', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the maximum number of hosts possible in a /24%'), '255', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the maximum number of hosts possible in a /24%'), '128', false, 'D'),

-- OOP polymorphism question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which OOP concept allows a class to have multiple methods%'), 'Inheritance', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which OOP concept allows a class to have multiple methods%'), 'Encapsulation', false, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which OOP concept allows a class to have multiple methods%'), 'Polymorphism', true, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which OOP concept allows a class to have multiple methods%'), 'Abstraction', false, 'D'),

-- Access modifier question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which access modifier makes a member accessible only within the same package%'), 'private', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which access modifier makes a member accessible only within the same package%'), 'protected', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which access modifier makes a member accessible only within the same package%'), 'public', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which access modifier makes a member accessible only within the same package%'), 'final', false, 'D'),

-- Cloud deployment model question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which cloud deployment model offers the highest level%'), 'Public Cloud', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which cloud deployment model offers the highest level%'), 'Private Cloud', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which cloud deployment model offers the highest level%'), 'Hybrid Cloud', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which cloud deployment model offers the highest level%'), 'Community Cloud', false, 'D'),

-- Container orchestration question
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which tool is commonly used for container orchestration%'), 'Docker', false, 'A'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which tool is commonly used for container orchestration%'), 'Kubernetes', true, 'B'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which tool is commonly used for container orchestration%'), 'Jenkins', false, 'C'),
((SELECT id FROM technical_questions WHERE question_text LIKE 'Which tool is commonly used for container orchestration%'), 'Ansible', false, 'D');

-- Insert sample expected answers for short/long answer questions
INSERT INTO expected_answers (question_id, sample_answer, key_points, scoring_criteria) VALUES
((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the difference between DELETE, TRUNCATE%'), 
 'DELETE removes specific rows based on conditions and can be rolled back. TRUNCATE removes all rows from a table, is faster, and cannot be rolled back. DROP removes the entire table structure and data permanently.',
 '["DELETE is conditional and transactional", "TRUNCATE removes all data and is faster", "DROP removes table structure", "Rollback capabilities differ"]',
 'Check for understanding of SQL commands, transaction behavior, and performance implications'),

((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the difference between a process and a thread%'), 
 'A process is an independent program in execution with its own memory space. A thread is a lightweight subprocess that shares memory space with other threads in the same process. Threads have lower overhead for creation and context switching.',
 '["Process independence vs thread sharing", "Memory space differences", "Overhead and performance", "Context switching"]',
 'Evaluate understanding of process management, memory allocation, and performance considerations'),

((SELECT id FROM technical_questions WHERE question_text LIKE 'Explain the difference between TCP and UDP%'), 
 'TCP is connection-oriented, reliable, and provides ordered delivery with error checking. UDP is connectionless, faster, but unreliable with no guarantee of delivery or order. TCP is used for web browsing, email; UDP for streaming, gaming.',
 '["Connection-oriented vs connectionless", "Reliability differences", "Performance trade-offs", "Use cases"]',
 'Assess knowledge of transport protocols, reliability mechanisms, and appropriate use cases'),

((SELECT id FROM technical_questions WHERE question_text LIKE 'What are the four pillars of Object-Oriented Programming%'), 
 'The four pillars are: 1) Encapsulation - bundling data and methods together, 2) Inheritance - creating new classes based on existing ones, 3) Polymorphism - same interface for different data types, 4) Abstraction - hiding complex implementation details.',
 '["Encapsulation definition", "Inheritance concept", "Polymorphism explanation", "Abstraction principle"]',
 'Check for complete understanding of OOP fundamentals and ability to explain each concept clearly'),

((SELECT id FROM technical_questions WHERE question_text LIKE 'What are the three main service models in cloud computing%'), 
 'The three main service models are: 1) IaaS (Infrastructure as a Service) - provides virtualized computing resources, 2) PaaS (Platform as a Service) - provides development and deployment platforms, 3) SaaS (Software as a Service) - provides complete applications over the internet.',
 '["IaaS definition and examples", "PaaS capabilities", "SaaS characteristics", "Service level differences"]',
 'Evaluate understanding of cloud service models and their practical applications'),

((SELECT id FROM technical_questions WHERE question_text LIKE 'What is the primary goal of DevOps practices%'), 
 'DevOps aims to bridge the gap between development and operations teams, enabling faster, more reliable software delivery through automation, collaboration, and continuous integration/deployment practices.',
 '["Development and operations integration", "Automation emphasis", "Continuous delivery", "Collaboration improvement"]',
 'Assess understanding of DevOps philosophy and its practical benefits');

-- Create indexes for better performance
CREATE INDEX idx_tech_questions_stack ON technical_questions(tech_stack);
CREATE INDEX idx_tech_questions_difficulty ON technical_questions(difficulty_level);
CREATE INDEX idx_tech_questions_type ON technical_questions(question_type);
CREATE INDEX idx_tech_questions_premium ON technical_questions(is_premium);
CREATE INDEX idx_user_responses_user_id ON user_responses(user_id);
CREATE INDEX idx_user_responses_question_id ON user_responses(question_id);

-- Create a view for easy question retrieval with options
CREATE VIEW question_with_options AS
SELECT 
    tq.id,
    tq.question_text,
    tq.question_type,
    tq.tech_stack,
    tq.difficulty_level,
    tq.topic,
    tq.is_premium,
    CASE 
        WHEN tq.question_type = 'mcq' THEN 
            json_agg(
                json_build_object(
                    'option_label', mo.option_label,
                    'option_text', mo.option_text,
                    'is_correct', mo.is_correct
                ) ORDER BY mo.option_label
            )
        ELSE NULL
    END as options,
    ea.sample_answer,
    ea.key_points,
    ea.scoring_criteria
FROM technical_questions tq
LEFT JOIN mcq_options mo ON tq.id = mo.question_id
LEFT JOIN expected_answers ea ON tq.id = ea.question_id
GROUP BY tq.id, tq.question_text, tq.question_type, tq.tech_stack, 
         tq.difficulty_level, tq.topic, tq.is_premium, 
         ea.sample_answer, ea.key_points, ea.scoring_criteria;

-- Sample queries for testing

-- Get all DBMS questions for free users
-- SELECT * FROM question_with_options WHERE tech_stack = 'DBMS' AND is_premium = false;

-- Get medium difficulty questions across all stacks
-- SELECT * FROM question_with_options WHERE difficulty_level = 'medium';

-- Get all MCQ questions with their options
-- SELECT * FROM question_with_options WHERE question_type = 'mcq';

-- Get user's response history
-- SELECT ur.*, tq.question_text, tq.tech_stack 
-- FROM user_responses ur 
-- JOIN technical_questions tq ON ur.question_id = tq.id 
-- WHERE ur.user_id = 'user_uuid_here';
