-- Table: public.course_information

-- DROP TABLE IF EXISTS public.course_information;

CREATE TABLE IF NOT EXISTS public.course_information
(
    course_code character varying(5) COLLATE pg_catalog."default" NOT NULL,
    course_title character varying(255) COLLATE pg_catalog."default" NOT NULL,
    credits integer NOT NULL,
    CONSTRAINT course_information_pkey PRIMARY KEY (course_code)
)

TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.course_information
    OWNER to postgres;



-- course_information MOCK DATA
INSERT INTO public.course_information(
	course_code, course_title, credits)
	VALUES ('EE499', 'Microelectronics Metrology', 3);

INSERT INTO public.course_information(
	course_code, course_title, credits)
	VALUES ('EE599', 'Device Physics and Characterization', 3);

INSERT INTO public.course_information(
	course_code, course_title, credits)
	VALUES ('EE530', 'Spectroscopy', 3);



-- login_information MOCK DATA
INSERT INTO public.login_infomation(
	user_id, password)
	VALUES ('jh1', 'jhPassword');

INSERT INTO public.login_infomation(
	user_id, password)
	VALUES ('tm2', 'tmPassword');

INSERT INTO public.login_infomation(
	user_id, password)
	VALUES ('db3', 'dbPassword');



-- student_information MOCK DATA
INSERT INTO public.student_information(
	first_name, last_name, user_id, email)
	VALUES ('Josefina', 'Hoffman', 'jh1', 'jh1@gmail.com');

INSERT INTO public.student_information(
	first_name, last_name, user_id, email)
	VALUES ('Titus', 'Munoz', 'tm2', 'tm2@gmail.com');

INSERT INTO public.student_information(
	first_name, last_name, user_id, email)
	VALUES ('Darnell', 'Brady', 'db3', 'jdb3@gmail.com');