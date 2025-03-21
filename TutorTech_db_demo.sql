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
DROP TABLE IF EXISTS grades;
CREATE TABLE IF NOT EXISTS grades
(
	-- unique id
	unique_id VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course code
	course_code VARCHAR(10) NOT NULL,
	-- user identification
	user_id VARCHAR(8) NOT NULL,
	-- score
	graded_score INT,
	-- foreign key constraint
	CONSTRAINT course_code FOREIGN KEY (course_code)
		REFERENCES course_information (course_code),
	CONSTRAINT user_id FOREIGN KEY (user_id)
		REFERENCES student_information (user_id)
);

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
	
-------------------------------------------------------------------------------------------------------------

-- student_information MOCK DATA insert
INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('jh1', 'Josefina', 'Hoffman', 'jh1@gmail.com', 'jhPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('tm2', 'Titus', 'Munoz', 'tm2@gmail.com', 'tmPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('db3', 'Darnell', 'Brady', 'db3@gmail.com', 'dbPassword');
-------------------------------------------------------------------------------------------------------------

-- student_information MOCK DATA insert
INSERT INTO enrollments (user_id, course_code) VALUES 
('jh1', 'EE499'),
('jh1', 'EE599'),
('jh1', 'PHY530'),
('jh1', 'DOE');

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



