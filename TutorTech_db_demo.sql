--------------------------------------------------------------------------------------------------------------
------------------------------------ DATABASE SCHEMA SECTION -------------------------------------------------
--------------------------------------------------------------------------------------------------------------

-- Table: course_information
DROP TABLE IF EXISTS course_information;
CREATE TABLE IF NOT EXISTS course_information
(
	-- course code ex. EE499
	course_code VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course title ex. Metrology
	course_title VARCHAR(100) NOT NULL,
	-- total credits of course
	credits INT NOT NULL,
	-- Description of course
	course_description TEXT
);

-- ---------------- Course Modules Table ----------------
CREATE TABLE course_modules (
    id SERIAL PRIMARY KEY,                       -- globally unique module id
    course_code VARCHAR(10) NOT NULL,            -- course it belongs to
    module_sequence INT NOT NULL,                -- 1, 2, 3... within a course
    module_title VARCHAR(100) NOT NULL,          -- e.g., "Module 1"
    module_description TEXT,                     -- description
    
    CONSTRAINT uq_course_module UNIQUE (course_code, module_sequence),
    CONSTRAINT fk_course FOREIGN KEY (course_code)
        REFERENCES course_information (course_code)
        ON DELETE CASCADE
);

-- Table: course_lectures
DROP TABLE IF EXISTS course_lectures;
CREATE TABLE IF NOT EXISTS course_lectures (
    lecture_id VARCHAR(10) NOT NULL PRIMARY KEY,
    module_id INT NOT NULL,
    lecture_title VARCHAR(100) NOT NULL,
    video_link VARCHAR(100) NOT NULL,

    -- foreign key constraint
    CONSTRAINT fk_lecture_module FOREIGN KEY (module_id)
        REFERENCES course_modules (module_id)
        ON DELETE CASCADE
);


-- Table: course_assignments
DROP TABLE IF EXISTS course_assignments;
CREATE TABLE IF NOT EXISTS course_assignments (
    assignment_id VARCHAR(10) NOT NULL PRIMARY KEY,
    module_id INT NOT NULL,
    assignment_title VARCHAR(100) NOT NULL,
    max_score INT NOT NULL,

    -- foreign key constraint
    CONSTRAINT fk_assignment_module FOREIGN KEY (module_id)
        REFERENCES course_modules (module_id)
        ON DELETE CASCADE
);


-- Table: assignment_questions
CREATE TABLE IF NOT EXISTS assignment_questions
(
    question_id SERIAL PRIMARY KEY, -- unique ID for each question
    assignment_id VARCHAR(10) NOT NULL, -- references the assignment
    question_text TEXT NOT NULL, -- the actual question prompt
    question_type VARCHAR(20) NOT NULL DEFAULT 'text', -- text, multiple_choice, file_upload, etc.
    max_points INT NOT NULL, -- points for grading this question
    options JSONB, -- for multiple_choice: { "choices": [...], "answer": "..." }
    correct_answer JSONB NOT NULL, -- correct answer or list of expected keywords for AI grading
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(assignment_id) -- link to assignment
);


-- Table: student_information
DROP TABLE IF EXISTS student_information;
CREATE TABLE IF NOT EXISTS student_information
(
	-- user identification
	user_id VARCHAR(8) NOT NULL PRIMARY KEY,
	-- user first & last name
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	-- user email
	email VARCHAR(255) NOT NULL,
	-- user password
	user_password VARCHAR(20) NOT NULL
);

-- Table: enrollments
DROP TABLE IF EXISTS enrollments;
CREATE TABLE enrollments (
	-- enrollment id
    enrollment_id SERIAL PRIMARY KEY,
    -- foreign key for user id and course code
    user_id VARCHAR(50) REFERENCES student_information(user_id),
    course_code VARCHAR(50) REFERENCES course_information(course_code),
    -- enrollment date
    enrollment_date TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Table: grades
CREATE TABLE IF NOT EXISTS grades (
    grade_id SERIAL PRIMARY KEY,                
    user_id VARCHAR(20) NOT NULL,               
    assignment_id VARCHAR(20) NOT NULL,         
    course_code VARCHAR(10) NOT NULL,           
    score NUMERIC(5, 2) DEFAULT 0,             
    max_score NUMERIC(5, 2) DEFAULT 0,         
    submission_date TIMESTAMP DEFAULT NOW(),    
    UNIQUE (user_id, assignment_id),            

    -- foreign key to link with existing tables
    FOREIGN KEY (user_id) REFERENCES student_information(user_id) ON DELETE CASCADE,
    FOREIGN KEY (course_code) REFERENCES course_information(course_code) ON DELETE CASCADE
);

DROP TABLE IF EXISTS assignment_results;
CREATE TABLE IF NOT EXISTS assignment_results (
    user_id VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(10) NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT,
    points_awarded INT,
    max_points INT,
    correct BOOLEAN,
    correct_answer JSONB,
    PRIMARY KEY (user_id, assignment_id, question_id),
    FOREIGN KEY (user_id) REFERENCES student_information(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES assignment_questions(question_id) ON DELETE CASCADE
);





--------------------------------------------------------------------------------------------------------------
-------------------------------------------------- MOCK DATA SECTION -----------------------------------------
--------------------------------------------------------------------------------------------------------------


-- course_information MOCK DATA inserts ----------------------------------------------------------------------
INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('EE499', 'Contemporary Developments: Microelectronics Metrology', 3, "This course offers a comprehensive study of metrology, focusing on precise measurement and its vital role across industries. Students will explore measurement systems, calibration techniques, uncertainty, and traceability to ensure accuracy and consistency. The course covers error analysis, proper use of metrology tools, and statistical methods for evaluating data. Students will gain hands-on experience with industry-standard equipment, applying metrology principles to real-world scenarios.");

INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('EE599', 'Device Physics and Characterization', 3, "This course provides an overview of the fundamental physics governing the electrical, optical, and thermal properties of semiconductor devices. Students will also examine the role of semiconductor materials in modern technology and their applications in electronic and photonic devices. This course is intended for graduate students in electrical engineering, materials science, and physics programs. Prerequisites include courses in semiconductor physics and electrical measurements at the undergraduate level.");

INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('PHY530', 'Spectroscopy', 3, "This graduate-level course provides an in-depth overview of spectroscopic techniques used to probe the electronic, vibrational, rotational, and magnetic structure of atoms, molecules, and solids. Theoretical foundations of atomic and molecular spectroscopy are developed, including treatment of absorption, emission, scattering of electromagnetic radiation.");

INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('DOE', 'Design of Experiments', 3, "This chapter introduces the fundamental concepts and methods of Design of Experiments (DOE), a vital tool used to improve processes and optimize results in various fields. The chapter covers topics such as factorial designs, response surface methods, and statistical techniques for analyzing experimental data. By the end of this chapter, students will understand how to design efficient experiments that yield maximum information with minimal resources. Through real-world examples, students will explore how DOE can be applied to identify critical factors, streamline processes, and drive innovation in engineering and research.");

INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('EGRFE', 'Fundamental Engineering', 3, "The FE (Fundamentals of Engineering) exam is the first step in the process of becoming a licensed professional engineer (PE). It is a computer-based exam administered year-round at NCEES-approved Pearson VUE test centers.");

INSERT INTO course_information (course_code, course_title, credits, course_description)
	VALUES ('SPC', ' Statistical Process Control', 3, "This course provides an in-depth introduction to Statistical Process Control (SPC), a key methodology used to monitor and control manufacturing processes. Topics covered include the principles of variability, control charts, process capability analysis, and the use of statistical methods to ensure product quality and process stability. Through practical examples and case studies, students will learn how to implement SPC techniques to detect and reduce variations in processes, improve quality control, and enhance operational efficiency in a range of industries.");

-------------------------------------------------------------------------------------------------------------

-- course_modules MOCK DATA inserts ------------------------------------------------------------------------
INSERT INTO course_modules (course_code, module_title, module_description, module_sequence)
VALUES 
  ('EE499', 'Introduction', 'Introductory module for EE499', 1),
  ('EE599', 'Introduction', 'Introductory module for EE599', 1),
  ('PHY530', 'Introduction', 'Introductory module for PHY530', 1),
  ('DOE', 'Introduction', 'Introductory module for DOE', 1),
  ('EGRFE', 'Introduction', 'Introductory module for EGRFE', 1),
  ('SPC', 'Introduction', 'Introductory module for SPC', 1);
-------------------------------------------------------------------------------------------------------------

-- course_lectures MOCK DATA inserts ------------------------------------------------------------------------

-- ---------------- course_lectures MOCK DATA inserts (module_id = 1) ----------------
INSERT INTO course_lectures(lecture_id, module_id, lecture_title, video_link)
VALUES
  ('LEC01', 1, 'Getting Started', 'https://youtu.be/1mqXu3eXylI'),
  ('LEC02', 2, 'Getting Started', 'https://youtu.be/0N9fVpQmDCQ'),
  ('LEC03', 3, 'Getting Started', 'https://youtu.be/ifxaJ3lZ-yc'),
  ('LEC04', 4, 'Getting Started', 'https://youtu.be/2bKGmQCDBtQ'),
  ('LEC05', 5, 'Getting Started', 'https://youtu.be/azFrptUJOlI'),
  ('LEC06', 6, 'Getting Started', 'https://youtu.be/B9h5_eVaGXM');



-------------------------------------------------------------------------------------------------------------

-- course_assignments MOCK DATA inserts ------------------------------------------------------------------------
INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT01', 'EE499', 'EE499 - Assignment 1', 5, 1);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT02', 'EE599', 'EE599 - Assignment 1', 10, 2);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT03', 'PHY530', 'PHY530 - Assignment 1', 15, 3);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT04', 'DOE', 'DOE - Assignment 1', 20, 4);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT05', 'EGRFE', 'EGRFE - Assignment 1', 25, 5);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score, module_id)
	VALUES ('ASGMT06', 'SPC', 'SPC - Assignment 1', 30, 6);

--assignment_questions MOCK DATA inserts -------------------------------------------------------------------------------------------

-- ASGMT01 - Metrology Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT01', 'What is the primary goal of metrology?', 'text', NULL, '["accurate", "measurement"]'::jsonb, 1),
('ASGMT01', 'Which instrument is commonly used for precise length measurement?', 'multiple_choice', '{"choices": ["Ruler", "Caliper", "Micrometer", "Tape Measure"], "answer": "Micrometer"}'::jsonb, '"Micrometer"'::jsonb, 1),
('ASGMT01', 'True or False: Calibration ensures measurement accuracy.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "True"}'::jsonb, '"True"'::jsonb, 1),
('ASGMT01', 'Describe the importance of traceability in measurement systems.', 'text', NULL, '["traceability", "verified", "measurements"]'::jsonb, 1),
('ASGMT01', 'What is the standard unit of measurement for electrical resistance?', 'multiple_choice', '{"choices": ["Volt", "Ohm", "Watt", "Ampere"], "answer": "Ohm"}'::jsonb, '"Ohm"'::jsonb, 1);

-- ASGMT02 - EE599 Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT02', 'What is the primary charge carrier in an n-type semiconductor?', 'multiple_choice', '{"choices": ["Holes", "Electrons", "Protons", "Neutrons"], "answer": "Electrons"}'::jsonb, '"Electrons"'::jsonb, 2),
('ASGMT02', 'Describe how bandgap energy affects the conductivity of a semiconductor.', 'text', NULL, '["bandgap", "energy", "conductivity"]'::jsonb, 2),
('ASGMT02', 'True or False: Thermal conductivity increases with decreasing temperature in metals.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "False"}'::jsonb, '"False"'::jsonb, 2),
('ASGMT02', 'What device measures the electrical properties of a semiconductor?', 'multiple_choice', '{"choices": ["Oscilloscope", "Spectrum Analyzer", "Curve Tracer", "Multimeter"], "answer": "Curve Tracer"}'::jsonb, '"Curve Tracer"'::jsonb, 2),
('ASGMT02', 'Explain the role of doping in semiconductor devices.', 'text', NULL, '["doping", "charge", "carriers"]'::jsonb, 2);

-- ASGMT03 - Spectroscopy Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT03', 'What type of spectroscopy is used to study molecular vibrations?', 'multiple_choice', '{"choices": ["NMR", "Infrared", "UV-Vis", "Raman"], "answer": "Infrared"}'::jsonb, '"Infrared"'::jsonb, 3),
('ASGMT03', 'Describe the difference between absorption and emission spectra.', 'text', NULL, '["absorption", "energy", "emission", "release"]'::jsonb, 3),
('ASGMT03', 'True or False: UV-Vis spectroscopy is commonly used to study the electronic structure of molecules.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "True"}'::jsonb, '"True"'::jsonb, 3),
('ASGMT03', 'Which technique uses magnetic fields to analyze atomic nuclei?', 'multiple_choice', '{"choices": ["Raman", "NMR", "IR", "X-ray"], "answer": "NMR"}'::jsonb, '"NMR"'::jsonb, 3),
('ASGMT03', 'Explain how Raman spectroscopy differs from infrared spectroscopy.', 'text', NULL, '["raman", "scattering", "infrared", "absorption"]'::jsonb, 3);

-- ASGMT04 - DOE Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT04', 'What is the primary goal of Design of Experiments (DOE)?', 'multiple_choice', '{"choices": ["Reduce cost", "Optimize processes", "Increase production", "Improve quality"], "answer": "Optimize processes"}'::jsonb, '"Optimize processes"'::jsonb, 4),
('ASGMT04', 'Explain what a factorial design is in the context of DOE.', 'text', NULL, '["factorial", "combinations", "factors"]'::jsonb, 4),
('ASGMT04', 'True or False: Randomization helps reduce the impact of confounding variables.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "True"}'::jsonb, '"True"'::jsonb, 4),
('ASGMT04', 'Which term describes the variable being measured in an experiment?', 'multiple_choice', '{"choices": ["Factor", "Response", "Level", "Interaction"], "answer": "Response"}'::jsonb, '"Response"'::jsonb, 4),
('ASGMT04', 'Describe why replication is important in experimental design.', 'text', NULL, '["replication", "reliability", "results"]'::jsonb, 4);

-- ASGMT05 - FE Exam Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT05', 'What does the FE exam stand for?', 'multiple_choice', '{"choices": ["Fundamentals of Engineering", "Final Examination", "Field Evaluation", "Federal Exam"], "answer": "Fundamentals of Engineering"}'::jsonb, '"Fundamentals of Engineering"'::jsonb, 5),
('ASGMT05', 'Explain the importance of the FE exam for aspiring engineers.', 'text', NULL, '["first", "step", "professional", "licensure"]'::jsonb, 5),
('ASGMT05', 'True or False: The FE exam is only available for electrical engineers.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "False"}'::jsonb, '"False"'::jsonb, 5),
('ASGMT05', 'Which organization administers the FE exam?', 'multiple_choice', '{"choices": ["NCEES", "IEEE", "ASME", "ABET"], "answer": "NCEES"}'::jsonb, '"NCEES"'::jsonb, 5),
('ASGMT05', 'List two topics typically covered in the FE exam.', 'text', NULL, '["ethics", "mathematics"]'::jsonb, 5);

-- ASGMT06 - SPC Assignment
INSERT INTO assignment_questions (assignment_id, question_text, question_type, options, correct_answer, max_points) VALUES
('ASGMT06', 'What is the primary goal of Statistical Process Control (SPC)?', 'multiple_choice', '{"choices": ["Increase production", "Monitor and control processes", "Reduce costs", "Improve safety"], "answer": "Monitor and control processes"}'::jsonb, '"Monitor and control processes"'::jsonb, 6),
('ASGMT06', 'Explain how control charts are used in SPC.', 'text', NULL, '["control", "charts", "monitor", "stability"]'::jsonb, 6),
('ASGMT06', 'True or False: SPC focuses only on final product inspection.', 'multiple_choice', '{"choices": ["True", "False"], "answer": "False"}'::jsonb, '"False"'::jsonb, 6),
('ASGMT06', 'Which control chart is used for monitoring the mean of a process?', 'multiple_choice', '{"choices": ["P-chart", "X-bar chart", "R-chart", "C-chart"], "answer": "X-bar chart"}'::jsonb, '"X-bar chart"'::jsonb, 6),
('ASGMT06', 'Describe the difference between common cause and special cause variation.', 'text', NULL, '["common", "cause", "natural", "special", "unusual"]'::jsonb, 6);

-------------------------------------------------------------------------------------------------------------

-- student_information MOCK DATA insert
INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('jh1', 'Josefina', 'Hoffman', 'jh1@gmail.com', 'jhPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('tm2', 'Titus', 'Munoz', 'tm2@gmail.com', 'tmPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('db3', 'Darnell', 'Brady', 'db3@gmail.com', 'dbPassword');
-------------------------------------------------------------------------------------------------------------

-- enrollments MOCK DATA insert -----------------------------------------------------------------------------
INSERT INTO enrollments (user_id, course_code) VALUES 
('jh1', 'EE499'),
('jh1', 'EE599'),
('jh1', 'PHY530'),
('jh1', 'DOE');


--------------------------------------------------------------------------------------------------------------
-------------------------------------------- DATABASE CHANGES/ALTER STATEMENTS -------------------------------
--------------------------------------------------------------------------------------------------------------
-- The following section contains query statements that you can use to alter your local version of your datase --
-- This section should be replaced when new changes to our schema are pushed to the github -- 


-- The following scripts should be ran for the implementation of module functionality for courses  --

---------------------------- (1) CREATE COURSE MODULES TABLE  --------------------------
DROP TABLE IF EXISTS course_modules;

CREATE TABLE course_modules (
    id SERIAL PRIMARY KEY, -- unique identifier for joins
    course_code VARCHAR(10) NOT NULL,
    module_sequence INT NOT NULL,
    module_title VARCHAR(100) NOT NULL,
    module_description TEXT,

    CONSTRAINT uq_course_module UNIQUE (course_code, module_sequence),
    CONSTRAINT fk_course FOREIGN KEY (course_code)
        REFERENCES course_information (course_code)
        ON DELETE CASCADE
);


---------------------------- (2) ALTER COURSE LECTURES TABLE  --------------------------
-- Step 1: Add new column for module_id
ALTER TABLE course_lectures
ADD COLUMN module_id INT;

-- Step 2: Drop old course_code foreign key
ALTER TABLE course_lectures
DROP CONSTRAINT course_code;

-- Step 3: Drop course_code column
ALTER TABLE course_lectures
DROP COLUMN course_code;

-- Step 4: Add new foreign key to course_modules
ALTER TABLE course_lectures
ADD CONSTRAINT fk_lecture_module FOREIGN KEY (module_id)
    REFERENCES course_modules (module_id)
    ON DELETE CASCADE;


---------------------------- (3) ALTER COURSE ASSIGNMENTS TABLE  --------------------------
-- Step 1: Add new column for module_id
ALTER TABLE course_assignments
ADD COLUMN module_id INT;

-- Step 2: Drop old course_code foreign key
ALTER TABLE course_assignments
DROP CONSTRAINT course_code;

-- Step 3: Drop course_code column
ALTER TABLE course_assignments
DROP COLUMN course_code;

-- Step 4: Add new foreign key to course_modules
ALTER TABLE course_assignments
ADD CONSTRAINT fk_assignment_module FOREIGN KEY (module_id)
    REFERENCES course_modules (module_id)
    ON DELETE CASCADE;

---------------------------- (4) INSERT MOCK DATA FOR MODULES  --------------------------
INSERT INTO course_modules (course_code, module_title, module_description, module_sequence)
VALUES 
  ('EE499', 'Introduction', 'Introductory module for EE499', 1),
  ('EE599', 'Introduction', 'Introductory module for EE599', 1),
  ('PHY530', 'Introduction', 'Introductory module for PHY530', 1),
  ('DOE', 'Introduction', 'Introductory module for DOE', 1),
  ('EGRFE', 'Introduction', 'Introductory module for EGRFE', 1),
  ('SPC', 'Introduction', 'Introductory module for SPC', 1);

---------------------------- (5) UPDATE COURSE_LECTURES  --------------------------
UPDATE course_lectures SET module_id = 1 WHERE lecture_id = 'LEC01'; -- EE499
UPDATE course_lectures SET module_id = 2 WHERE lecture_id = 'LEC02'; -- EE599
UPDATE course_lectures SET module_id = 3 WHERE lecture_id = 'LEC03'; -- PHY530
UPDATE course_lectures SET module_id = 4 WHERE lecture_id = 'LEC04'; -- DOE
UPDATE course_lectures SET module_id = 5 WHERE lecture_id = 'LEC05'; -- EGRFE
UPDATE course_lectures SET module_id = 6 WHERE lecture_id = 'LEC06'; -- SPC

---------------------------- (6) UPDATE COURSE_ASSIGNMENTS  --------------------------
UPDATE course_assignments SET module_id = 1 WHERE assignment_id = 'ASGMT01'; -- EE499
UPDATE course_assignments SET module_id = 2 WHERE assignment_id = 'ASGMT02'; -- EE599
UPDATE course_assignments SET module_id = 3 WHERE assignment_id = 'ASGMT03'; -- PHY530
UPDATE course_assignments SET module_id = 4 WHERE assignment_id = 'ASGMT04'; -- DOE
UPDATE course_assignments SET module_id = 5 WHERE assignment_id = 'ASGMT05'; -- EGRFE
UPDATE course_assignments SET module_id = 6 WHERE assignment_id = 'ASGMT06'; -- SPC

---------------------------- (7) UPDATE COURSE_ASSIGNMENTS assignment titles  --------------------------
UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT01';

UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT02';

UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT03';

UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT04';

UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT05';

UPDATE course_assignments
SET assignment_title = 'Getting Started'
WHERE assignment_id = 'ASGMT06';

---------------------------- (7) UPDATE COURSE_LECTURES lecture titles  --------------------------
UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC01';

UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC02';

UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC03';

UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC04';

UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC05';

UPDATE course_lectures
SET lecture_title = 'Getting Started'
WHERE lecture_id = 'LEC06';

---------------------------- (8) Create Assignment Results table  --------------------------
DROP TABLE IF EXISTS assignment_results;
CREATE TABLE IF NOT EXISTS assignment_results (
    user_id VARCHAR(50) NOT NULL,
    assignment_id VARCHAR(10) NOT NULL,
    question_id INT NOT NULL,
    user_answer TEXT,
    points_awarded INT,
    max_points INT,
    correct BOOLEAN,
    correct_answer JSONB,
    PRIMARY KEY (user_id, assignment_id, question_id),
    FOREIGN KEY (user_id) REFERENCES student_information(user_id) ON DELETE CASCADE,
    FOREIGN KEY (assignment_id) REFERENCES course_assignments(assignment_id) ON DELETE CASCADE,
    FOREIGN KEY (question_id) REFERENCES assignment_questions(question_id) ON DELETE CASCADE
);

---------------------------- (8) Create a bunch of mock modules for EE499  --------------------------
INSERT INTO course_modules (course_code, module_sequence, module_title, module_description)
VALUES 
  ('EE499', 2,'The Basics', 'Advanced Topics in Mircoelectronics Metrology.');
  ('EE499', 3, 'Measurement Systems & Calibration', 'Explore various measurement systems and calibration standards used in metrology.'),
  ('EE499', 4, 'Uncertainty & Traceability', 'Understand the principles of uncertainty and traceability in precision measurement.'),
  ('EE499', 5, 'Statistical Methods in Metrology', 'Apply statistical tools to analyze and validate measurement data.');

---------------------------- (9) Create a bunch of mock lectures for each module  --------------------------
-- Lectures for Module 2 (id: 7)
INSERT INTO course_lectures (lecture_id, module_id, lecture_title, video_link)
VALUES 
  ('LEC201', 7, 'Overview of Metrology Instruments', 'https://youtu.be/abc123'),
  ('LEC202', 7, 'Precision Measurement Techniques', 'https://youtu.be/def456'),
  ('LEC203', 7, 'Advanced Sensors and Automation', 'https://youtu.be/ghi789');

-- Lectures for Module 3 (id: 8)
INSERT INTO course_lectures (lecture_id, module_id, lecture_title, video_link) VALUES
  ('LEC07', 8, 'Introduction to Measurement Systems', 'https://youtu.be/dQw4w9WgXcQ'),
  ('LEC08', 8, 'Fundamentals of Calibration', 'https://youtu.be/dQw4w9WgXcQ');

-- Lectures for Module 4 (id: 9)
INSERT INTO course_lectures (lecture_id, module_id, lecture_title, video_link) VALUES
  ('LEC09', 9, 'Understanding Measurement Uncertainty', 'https://youtu.be/dQw4w9WgXcQ'),
  ('LEC10', 9, 'Traceability in Metrology', 'https://youtu.be/dQw4w9WgXcQ');

-- Lectures for Module 5 (id: 10)
INSERT INTO course_lectures (lecture_id, module_id, lecture_title, video_link) VALUES
  ('LEC11', 10, 'Intro to Statistical Techniques', 'https://youtu.be/dQw4w9WgXcQ'),
  ('LEC12', 10, 'Data Validation Methods', 'https://youtu.be/dQw4w9WgXcQ');


---------------------------- (10) Create a bunch of mock assignments for each module  --------------------------
-- Assignments for Module 2 (id: 7)
INSERT INTO course_assignments (assignment_id, module_id, assignment_title, max_score)
VALUES 
  ('ASGMT201', 7, 'Measurement Fundamentals', 10),
  ('ASGMT202', 7, 'Report: Sensor Calibration', 15),
  ('ASGMT203', 7, 'Future of Metrology', 20);

-- Assignments for Module 3 (id: 8)
INSERT INTO course_assignments (assignment_id, module_id, assignment_title, max_score) VALUES
  ('ASGMT07', 8, 'Measurement Device Report', 10),
  ('ASGMT08', 8, 'Calibration Lab Exercise', 15);

-- Assignments for Module 4 (id: 9)
INSERT INTO course_assignments (assignment_id, module_id, assignment_title, max_score) VALUES
  ('ASGMT09', 9, 'Uncertainty Analysis Worksheet', 10),
  ('ASGMT10', 9, 'Traceability Case Study', 15);

-- Assignments for Module 5 (id: 10)
INSERT INTO course_assignments (assignment_id, module_id, assignment_title, max_score) VALUES
  ('ASGMT11', 10, 'Data Set Analysis', 15),
  ('ASGMT12', 10, 'Statistical Report', 20);
