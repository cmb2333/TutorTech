import React from 'react';
import { Container, Carousel, Card } from 'react-bootstrap';


function HomeCarousel() {

  return (
    <section className="home-carousel">
    <Container>
      <h2>Courses Offered</h2>
      <Carousel variant='dark'>
        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">EE499</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>Contemporary Developments: Microelectronics Metrology: This course offers a comprehensive study of metrology, focusing on precise measurement and its vital role across industries. Students will explore measurement systems, calibration techniques, uncertainty, and traceability to ensure accuracy and consistency. The course covers error analysis, proper use of metrology tools, and statistical methods for evaluating data. Students will gain hands-on experience with industry-standard equipment, applying metrology principles to real-world scenarios.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">EE599</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>Device Physics and Characterization: This course provides an overview of the fundamental physics governing the electrical, optical, and thermal properties of semiconductor devices. Students will also examine the role of semiconductor materials in modern technology and their applications in electronic and photonic devices. This course is intended for graduate students in electrical engineering, materials science, and physics programs. Prerequisites include courses in semiconductor physics and electrical measurements at the undergraduate level.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/exampleCourse.jpg" alt="Course Image" />
            <Card.Body>
                <Card.Title className="course-title">PHY530</Card.Title>
            </Card.Body>
            <Card.Body>
                <Card.Text>Spectroscopy: This graduate-level course provides an in-depth overview of spectroscopic techniques used to probe the electronic, vibrational, rotational, and magnetic structure of atoms, molecules, and solids. Theoretical foundations of atomic and molecular spectroscopy are developed, including treatment of absorption, emission, scattering of electromagnetic radiation.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

      </Carousel>
    </Container>
  </section>
  );
}

export default HomeCarousel;