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

-- Table: course_lectures
DROP TABLE IF EXISTS course_lectures;
CREATE TABLE IF NOT EXISTS course_lectures
(
	-- lecture id
	lecture_id VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course_code
	course_code VARCHAR(10) NOT NULL,
	-- lecture title
	lecture_title VARCHAR(100) NOT NULL,
	-- video link of lectures
	video_link VARCHAR(100) NOT NULL,
	-- foreign key constraint
	CONSTRAINT course_code FOREIGN KEY (course_code)
		REFERENCES course_information (course_code)
);

-- Table: course_assignments
DROP TABLE IF EXISTS course_assignments;
CREATE TABLE IF NOT EXISTS course_assignments
(
    -- assignment id
	assignment_id VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course code
	course_code VARCHAR(10) NOT NULL,
	-- assignment title
	assignment_title VARCHAR(100) NOT NULL,
	-- max score
	max_score INT NOT NULL,
	-- foreign key constraint
	CONSTRAINT course_code FOREIGN KEY (course_code)
		REFERENCES course_information (course_code)

		-- future field: type (VARCHAR) to support assignment categories (quiz, exam, homework)

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

-- course_lectures MOCK DATA inserts ------------------------------------------------------------------------
INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC01', 'EE499', 'EE499 - Lecture', 'https://youtu.be/1mqXu3eXylI');

INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC02', 'EE599', 'EE599 - Lecture', 'https://youtu.be/0N9fVpQmDCQ');

INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC03', 'PHY530', 'PHY530 - Lecture', 'https://youtu.be/ifxaJ3lZ-yc');

INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC04', 'DOE', 'DOE - Lecture', 'https://youtu.be/2bKGmQCDBtQ');

INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC05', 'EGRFE', 'EGRFE - Lecture', 'https://youtu.be/azFrptUJOlI');

INSERT INTO course_lectures(lecture_id, course_code, lecture_title, video_link)
	VALUES ('LEC06', 'SPC', 'SPC - Lecture', 'https://youtu.be/B9h5_eVaGXM');

-------------------------------------------------------------------------------------------------------------

-- course_assignments MOCK DATA inserts ------------------------------------------------------------------------
INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT01', 'EE499', 'EE499 - Assignment 1', 5);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT02', 'EE599', 'EE599 - Assignment 1', 10);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT03', 'PHY530', 'PHY530 - Assignment 1', 15);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT04', 'DOE', 'DOE - Assignment 1', 20);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT05', 'EGRFE', 'EGRFE - Assignment 1', 25);

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT06', 'SPC', 'SPC - Assignment 1', 30);

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

-- ALTER student_information table to add learning preferences column
ALTER TABLE student_information ADD COLUMN learning_preferences TEXT;

-- ALTER assignment_questions TABLE to change correct_answer to JSONB (allows for list of keywords for free response questions)
ALTER TABLE assignment_questions
ALTER COLUMN correct_answer TYPE JSONB
USING to_jsonb(correct_answer);  -- convert existing values

-- UPDATE assignment_questions values for free response questions to include a list  of keywords
UPDATE assignment_questions SET correct_answer = '["accurate", "measurement"]'::jsonb
WHERE question_text = 'What is the primary goal of metrology?';

UPDATE assignment_questions SET correct_answer = '["traceability", "verified", "measurements"]'::jsonb
WHERE question_text = 'Describe the importance of traceability in measurement systems.';

UPDATE assignment_questions SET correct_answer = '["bandgap", "energy", "conductivity"]'::jsonb
WHERE question_text = 'Describe how bandgap energy affects the conductivity of a semiconductor.';

UPDATE assignment_questions SET correct_answer = '["doping", "charge", "carriers"]'::jsonb
WHERE question_text = 'Explain the role of doping in semiconductor devices.';

UPDATE assignment_questions SET correct_answer = '["absorption", "energy", "emission", "release"]'::jsonb
WHERE question_text = 'Describe the difference between absorption and emission spectra.';

UPDATE assignment_questions SET correct_answer = '["raman", "scattering", "infrared", "absorption"]'::jsonb
WHERE question_text = 'Explain how Raman spectroscopy differs from infrared spectroscopy.';

UPDATE assignment_questions SET correct_answer = '["factorial", "combinations", "factors"]'::jsonb
WHERE question_text = 'Explain what a factorial design is in the context of DOE.';

UPDATE assignment_questions SET correct_answer = '["replication", "reliability", "results"]'::jsonb
WHERE question_text = 'Describe why replication is important in experimental design.';

UPDATE assignment_questions SET correct_answer = '["first", "step", "professional", "licensure"]'::jsonb
WHERE question_text = 'Explain the importance of the FE exam for aspiring engineers.';

UPDATE assignment_questions SET correct_answer = '["ethics", "mathematics"]'::jsonb
WHERE question_text = 'List two topics typically covered in the FE exam.';

UPDATE assignment_questions SET correct_answer = '["control", "charts", "monitor", "stability"]'::jsonb
WHERE question_text = 'Explain how control charts are used in SPC.';

UPDATE assignment_questions SET correct_answer = '["common", "cause", "natural", "special", "unusual"]'::jsonb
WHERE question_text = 'Describe the difference between common cause and special cause variation.';
