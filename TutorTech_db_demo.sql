-- Database: TutorTech_db_demo

-- Table: public.course_information

CREATE TABLE IF NOT EXISTS public.course_information (
    course_code VARCHAR(5) NOT NULL,
    course_title VARCHAR(255) NOT NULL,
    credits INTEGER NOT NULL,
    CONSTRAINT course_information_pkey PRIMARY KEY (course_code)
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.course_information
    OWNER TO postgres;

-- Insert mock data for course_information
INSERT INTO public.course_information (course_code, course_title, credits)
VALUES 
    ('EE499', 'Microelectronics Metrology', 3),
    ('EE599', 'Device Physics and Characterization', 3),
    ('EE530', 'Spectroscopy', 3);


-- Table: public.login_information

CREATE TABLE IF NOT EXISTS public.login_information (
    user_id VARCHAR(50) PRIMARY KEY,
    password VARCHAR(50) NOT NULL
)
TABLESPACE pg_default;

ALTER TABLE public.login_information
    OWNER TO postgres;

-- Insert mock data for login_information
INSERT INTO public.login_information (user_id, password)
VALUES 
    ('jh1', 'jhPassword'),
    ('tm2', 'tmPassword'),
    ('db3', 'dbPassword');


-- Table: public.student_information

CREATE TABLE IF NOT EXISTS public.student_information (
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    user_id VARCHAR(50) REFERENCES login_information(user_id),
    email VARCHAR(100)
)
TABLESPACE pg_default;

ALTER TABLE public.student_information
    OWNER TO postgres;

-- Insert mock data for student_information
INSERT INTO public.student_information (first_name, last_name, user_id, email)
VALUES 
    ('Josefina', 'Hoffman', 'jh1', 'jh1@gmail.com'),
    ('Titus', 'Munoz', 'tm2', 'tm2@gmail.com'),
    ('Darnell', 'Brady', 'db3', 'db3@gmail.com');
