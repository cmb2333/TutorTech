import React, { useState, useRef } from 'react';
import { Modal } from 'react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faEnvelope } from '@fortawesome/free-solid-svg-icons';
import './styles/contact.css';
import emailjs from 'emailjs-com'; 
import { useNavigate } from 'react-router-dom'; 

function Contact() {

  // state to control visibility of modal
  const [showModal, setShowModal] = useState(false);

  // create reference of form 
  const form = useRef(); 

  const navigate = useNavigate();

  // contents of the form
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: ''
  });

  // close and show the modal
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  // form submission, sends email via EmailJS
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  const sendEmail = (e) => {

    // prevent the form from refreshing the page
    e.preventDefault(); 

    emailjs.sendForm(
      'EMAILJS_SERVICE_ID', // your EmailJS Service ID
      'EMAILJS_TEMPLATE_ID', // your EmailJS Template ID
      form.current,            // data from form
      'EMAILJS_PUBLIC_KEY' // your EmailJS User ID
    )
    .then(
      (result) => {
        console.log('Email sent:', result.text);
        alert('Email sent successfully!');
        navigate('/'); // redirect to home
      },
      (error) => {
        console.error('Email error:', error.text);
        alert('Failed to send email. Please try again later.');
      }
    );
  };

  return (
    <section className="contact-page">
      <div className="container-fluid p-0">
        <div className="styled-page">
          <div className="map-container">
            <iframe
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3261.1489689987075!2d-111.65218482557572!3d35.17783945746481!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x872d8f7134435d4f%3A0xc8afc8bfc38c6214!2sEngineering%20Projects%2C%20560%20E%20Pine%20Knoll%20Dr%2C%20Flagstaff%2C%20AZ%2086011!5e0!3m2!1sen!2sus!4v1733602761834!5m2!1sen!2sus"
              width="100%"
              height="100%"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
              title="Google Map Embed"
            />
          </div>

          <div className="mail-icon-container" onClick={handleShow}>
            <FontAwesomeIcon icon={faEnvelope} />
          </div>

          <Modal show={showModal} onHide={handleClose} centered>
            <Modal.Header closeButton className="modal-header">
              <Modal.Title className="modal-title">Contact Us</Modal.Title>
            </Modal.Header>
            <Modal.Body>
              <form ref={form} onSubmit={sendEmail}> {/* Attach ref to the form */}
                <div className="container">
                  <div className="row input-container contact-form">
                    <div className="col-md-6 col-12">
                      <div className="styled-input">
                        <input
                          className="contact-input"
                          type="text"
                          name="name"
                          value={formData.name}
                          onChange={handleChange}
                          required
                        />
                        <label>Name</label>
                      </div>
                    </div>

                    <div className="col-md-6 col-12">
                      <div className="styled-input">
                        <input
                          className="contact-input"
                          type="email"
                          name="email"
                          value={formData.email}
                          onChange={handleChange}
                          required
                        />
                        <label>Email</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="styled-input wide">
                        <input
                          className="contact-input"
                          type="text"
                          name="subject"
                          value={formData.subject}
                          onChange={handleChange}
                          required
                        />
                        <label>Subject</label>
                      </div>
                    </div>

                    <div className="col-12">
                      <div className="styled-input wide">
                        <textarea
                          className="contact-input"
                          name="message"
                          value={formData.message}
                          onChange={handleChange}
                          required
                        ></textarea>
                        <label>Message</label>
                      </div>
                    </div>

                    <div className="col-12 text-center">
                      <button type="submit" className="submit-btn">
                        Send Message
                      </button>
                    </div>
                  </div>
                </div>
              </form>
            </Modal.Body>
            <Modal.Footer className="modal-footer">
              <p>
                For any questions, contact{' '}
                <a href="mailto:MRTL@nau.edu">MRTL@nau.edu</a> or call{' '}
                <a href="tel:+19285237079">+1 928 523 7079</a>
              </p>
            </Modal.Footer>
          </Modal>
        </div>
      </div>
    </section>
  );
}

export default Contact;
