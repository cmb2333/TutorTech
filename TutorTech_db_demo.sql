-- Table: course_information
-- DROP TABLE IF EXISTS course_information;
CREATE TABLE IF NOT EXISTS course_information
(
	-- course code ex. EE499
	course_code VARCHAR(10) NOT NULL PRIMARY KEY,
	-- course title ex. Metrology
	course_title VARCHAR(100) NOT NULL,
	-- description of course
	course_description TEXT NULL,
	-- total credits of course
	credits INT NOT NULL
);

-- Table: student_information
-- DROP TABLE IF EXISTS student_information
CREATE TABLE IF NOT EXISTS student_information
(
	-- user identification
	user_id VARCHAR(8) NOT NULL PRIMARY KEY,
	-- user first & last name
	first_name VARCHAR(100) NOT NULL,
	last_name VARCHAR(100) NOT NULL,
	-- user email
	email VARCHAR(255) NOT NULL
);

-- Table: login_information
-- DROP TABLE IF EXISTS login_information
CREATE TABLE IF NOT EXISTS login_information
(
	-- user identification
	user_id VARCHAR(8) NOT NULL PRIMARY KEY,
	-- user password
	password VARCHAR(20) NOT NULL,
	-- foreign key constraint
	CONSTRAINT user_id FOREIGN KEY (user_id)
		REFERENCES student_information (user_id)
);

-- course_information MOCK DATA inserts
INSERT INTO course_information (course_code, course_title, course_description, credits)
	VALUES ('EE499', 'Contemporary Developments: Microelectronics Metrology', 'This course offers a comprehensive study of metrology, focusing on precise measurement and its vital role across industries. Students will explore measurement systems, calibration techniques, uncertainty, and traceability to ensure accuracy and consistency. The course covers error analysis, proper use of metrology tools, and statistical methods for evaluating data. Students will gain hands-on experience with industry-standard equipment, applying metrology principles to real-world scenarios.', 3);

INSERT INTO course_information (course_code, course_title, course_description, credits)
	VALUES ('EE599', 'Device Physics and Characterization', 'This course provides an overview of the fundamental physics governing the electrical, optical, and thermal properties of semiconductor devices. Students will also examine the role of semiconductor materials in modern technology and their applications in electronic and photonic devices. This course is intended for graduate students in electrical engineering, materials science, and physics programs. Prerequisites include courses in semiconductor physics and electrical measurements at the undergraduate level.', 3);

INSERT INTO course_information (course_code, course_title, course_description, credits)
	VALUES ('PHY530', 'Spectroscopy', 'This graduate-level course provides an in-depth overview of spectroscopic techniques used to probe the electronic, vibrational, rotational, and magnetic structure of atoms, molecules, and solids. Theoretical foundations of atomic and molecular spectroscopy are developed, including treatment of absorption, emission, scattering of electromagnetic radiation.', 3);

--student_information MOCK DATA insert
INSERT INTO student_information (user_id, first_name, last_name, email)
	VALUES ('jh1', 'Josefina', 'Hoffman', 'jh1@gmail.com'), ('tm2', 'Titus', 'Munoz', 'tm2@gmail.com'),('db3', 'Darnell', 'Brady', 'jdb3@gmail.com');

-- login_information MOCK DATA insert
INSERT INTO login_information
	VALUES ('jh1', 'jhPassword'), ('tm2', 'tmPassword'), ('db3', 'dbPassword');



