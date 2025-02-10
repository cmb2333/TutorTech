-- Table: course_information
DROP TABLE IF EXISTS course_information;
CREATE TABLE IF NOT EXISTS course_information
(
	-- course code ex. EE499
	course_code VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course title ex. Metrology
	course_title VARCHAR(100) NOT NULL,
	-- total credits of course
	credits INT NOT NULL
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

-- course_information MOCK DATA inserts ----------------------------------------------------------------------
INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('EE499', 'Contemporary Developments: Microelectronics Metrology', 3);

INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('EE599', 'Device Physics and Characterization', 3);

INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('PHY530', 'Spectroscopy', 3);

INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('DOE', 'Design of Experiments', 3);

INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('EGRFE', 'Fundamental Engineering', 3);

INSERT INTO course_information (course_code, course_title, credits)
	VALUES ('SPC', ' Statistical Process Control', 3);

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
	VALUES ('ASGMT01', 'EE499', 'EE499 - Assignment 1', '5');

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT02', 'EE599', 'EE599 - Assignment 1', '10');

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT03', 'PHY530', 'PHY530 - Assignment 1', '15');

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT04', 'DOE', 'DOE - Assignment 1', '20');

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT05', 'EGRFE', 'EGRFE - Assignment 1', '25');

INSERT INTO course_assignments(assignment_id, course_code, assignment_title, max_score)
	VALUES ('ASGMT06', 'SPC', 'SPC - Assignment 1', '30');
	
-------------------------------------------------------------------------------------------------------------

-- student_information MOCK DATA insert
INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('jh1', 'Josefina', 'Hoffman', 'jh1@gmail.com', 'jhPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('tm2', 'Titus', 'Munoz', 'tm2@gmail.com', 'tmPassword');

INSERT INTO student_information (user_id, first_name, last_name, email, user_password)
    VALUES ('db3', 'Darnell', 'Brady', 'db3@gmail.com', 'dbPassword');
-------------------------------------------------------------------------------------------------------------


