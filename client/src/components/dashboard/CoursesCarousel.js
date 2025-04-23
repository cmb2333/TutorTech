/* ------------------------------ CoursesCarousel.js ------------------------------
Component: CoursesCarousel

Overview:
  Renders a horizontal, scrollable carousel of enrolled course cards.
  Each card includes a course image, title, and completion progress bar.
  Navigation is handled via external left/right arrows placed outside the carousel.

Core Features:
  - Responsive carousel that adapts to screen size (mobile → desktop)
  - Displays course banner images from /assets/courses/<course_code>.jpg
  - Shows real-time course progress using a green progress bar
  - Cards link to individual course detail pages
  - Custom navigation arrows override default carousel controls

Props:
  - courses (Array): List of enrolled course objects with course_code and course_title
  - progressByCourse (Object): Map of course_code → completion percentage

Dependencies:
  - react-multi-carousel for responsive horizontal scrolling
  - react-bootstrap for layout and card components
  - react-router-dom for linking to course detail pages

Styling:
  - Scoped via CoursesCarousel.css
  - Supports external arrow controls and spacing between cards
---------------------------------------------------------------------------------- */


/* ------------------------------ React + Libraries ------------------------------ */
import React, { useEffect, useRef } from 'react';
import { Card, ProgressBar } from 'react-bootstrap';
import Carousel from 'react-multi-carousel';
import { Link } from 'react-router-dom';

/* ------------------------------ Styles ------------------------------ */
import 'react-multi-carousel/lib/styles.css';
import './styles/CoursesCarousel.css';



// ---------------------- responsive breakpoints for Carousel ----------------------
const responsive = {
  superLargeDesktop: { breakpoint: { max: 4000, min: 1536 }, items: 5 },
  desktop: { breakpoint: { max: 1536, min: 1024 }, items: 4 },
  tablet: { breakpoint: { max: 1024, min: 768 }, items: 2 },
  mobile: { breakpoint: { max: 768, min: 0 }, items: 1 },
};

/* ---------------------- CoursesCarousel Component ----------------------
   Props:
     - courses: array of enrolled courses to display
     - progressByCourse: map of course_code => completion percentage
   Features:
     - Horizontal carousel with custom navigation
     - Course cards link to their individual course pages
------------------------------------------------------------------------ */
const CoursesCarousel = ({ courses, progressByCourse }) => {
  const carouselRef = useRef(); // gives access to Carousel navigation methods

  // ---------------------- force carousel resize after data loads ----------------------
  useEffect(() => {
    if (courses?.length > 0) {
      setTimeout(() => {
        window.dispatchEvent(new Event('resize')); // recalculates width
      }, 100);
    }
  }, [courses]);

  // ---------------------- prevent rendering when no data ----------------------
  if (!courses || courses.length === 0) return null;

  // ---------------------- Carousel Navigation Methods ----------------------
  const goLeft = () => {
    carouselRef.current?.previous();
  };

  const goRight = () => {
    carouselRef.current?.next();
  };

  return (
    <div className="carousel-container">
      {/* left arrow button */}
      <button className="carousel-arrow left" onClick={goLeft}>
        <span className="material-symbols-outlined">chevron_left</span>
      </button>

      {/* carousel wrapper (allows padding space for arrows) */}
      <div className="carousel-inner-wrapper">
        <Carousel
          responsive={responsive}
          infinite
          autoPlay={false}
          arrows={false} // disable built-in arrows
          ref={carouselRef} // gives access to nav methods
        >
          {/* Render each course as a card in the carousel */}
          {courses.map((course, index) => (
            <div className="course-slide-spacing" key={index}>
              <Link
                to={`/courses/${course.course_code}`}
                className="course-link"
              >
                <Card className="course-card">
                  <Card.Img
                    variant="top"
                    src={`/assets/courses/${course.course_code}.jpg`}
                    alt={`Image for ${course.course_title}`}
                  />
                  <Card.Body>
                    <Card.Title title={course.course_title}>
                      {course.course_title}
                    </Card.Title>

                    {/* Completion progress bar (default to 0%) */}
                    <ProgressBar
                      now={progressByCourse?.[course.course_code] || 0}
                      variant="success"
                      label={`${progressByCourse?.[course.course_code] || 0}%`}
                      className="mt-2"
                    />

                  </Card.Body>
                </Card>
              </Link>
            </div>
          ))}
        </Carousel>
      </div>

      {/* right arrow button */}
      <button className="carousel-arrow right" onClick={goRight}>
        <span className="material-symbols-outlined">chevron_right</span>
      </button>
    </div>
  );
};

export default CoursesCarousel;

