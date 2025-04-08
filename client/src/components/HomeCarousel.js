import React from 'react';
import { Container, Carousel, Card } from 'react-bootstrap';


function HomeCarousel() {

  return (
    <section className="home-carousel">
    <Container>
      <h2>Courses Offered</h2>
      <Carousel>
        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/EE499.jpg" alt="Course Image" className='carousel-image'/>
            <Card.Title className="course-title">EE499 - Contemporary Developments: Microelectronics Metrology</Card.Title>
            <Card.Body>
                <Card.Text>Contemporary Developments: Microelectronics Metrology: This course offers a comprehensive study of metrology, focusing on precise measurement and its vital role across industries. Students will explore measurement systems, calibration techniques, uncertainty, and traceability to ensure accuracy and consistency. The course covers error analysis, proper use of metrology tools, and statistical methods for evaluating data. Students will gain hands-on experience with industry-standard equipment, applying metrology principles to real-world scenarios.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/EE599.jpg" alt="Course Image" />
            <Card.Title className="course-title">EE599 - Device Physics and Characterization</Card.Title>
            <Card.Body>
                <Card.Text>This course provides an overview of the fundamental physics governing the electrical, optical, and thermal properties of semiconductor devices. Students will also examine the role of semiconductor materials in modern technology and their applications in electronic and photonic devices. This course is intended for graduate students in electrical engineering, materials science, and physics programs. Prerequisites include courses in semiconductor physics and electrical measurements at the undergraduate level.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/PHY530.jpg" alt="Course Image" />
            <Card.Title className="course-title">PHY530 - Spectroscopy</Card.Title>
            <Card.Body>
                <Card.Text>This graduate-level course provides an in-depth overview of spectroscopic techniques used to probe the electronic, vibrational, rotational, and magnetic structure of atoms, molecules, and solids. Theoretical foundations of atomic and molecular spectroscopy are developed, including treatment of absorption, emission, scattering of electromagnetic radiation.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/DOE.jpg" alt="Course Image" />
            <Card.Title className="course-title">DOE - Design of Experiments</Card.Title>
            <Card.Body>
                <Card.Text>This chapter introduces the fundamental concepts and methods of Design of Experiments (DOE), a vital tool used to improve processes and optimize results in various fields. The chapter covers topics such as factorial designs, response surface methods, and statistical techniques for analyzing experimental data. By the end of this chapter, students will understand how to design efficient experiments that yield maximum information with minimal resources. Through real-world examples, students will explore how DOE can be applied to identify critical factors, streamline processes, and drive innovation in engineering and research.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/EGRFE.jpg" alt="Course Image" />
            <Card.Title className="course-title">EGRFE - Fundamental Engineering</Card.Title>
            <Card.Body>
                <Card.Text>The FE (Fundamentals of Engineering) exam is the first step in the process of becoming a licensed professional engineer (PE). It is a computer-based exam administered year-round at NCEES-approved Pearson VUE test centers.</Card.Text>
                <div>
                </div>
            </Card.Body>
          </Card>
        </Carousel.Item>

        <Carousel.Item className='carousel-content'>
          <Card className="carousel-card">
            <Card.Img variant="top" src="/assets/courses/SPC.jpg" alt="Course Image" />
            <Card.Title className="course-title">SPC - Statistical Process Control</Card.Title>
            <Card.Body>
                <Card.Text>This course provides an in-depth introduction to Statistical Process Control (SPC), a key methodology used to monitor and control manufacturing processes. Topics covered include the principles of variability, control charts, process capability analysis, and the use of statistical methods to ensure product quality and process stability. Through practical examples and case studies, students will learn how to implement SPC techniques to detect and reduce variations in processes, improve quality control, and enhance operational efficiency in a range of industries.</Card.Text>
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