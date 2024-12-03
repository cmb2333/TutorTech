import React from 'react';

function Footer() {
  return (
    <footer className="footer text-light">
      <div className="container py-4">
        <div className="row">
          {/* Location Section */}
          <div className="col-md-4">
            <h5>Location</h5>
            <p>123 University Ave, Flagstaff, AZ 86001</p>
          </div>

          {/* Contact Info Section */}
          <div className="col-md-4">
            <h5>Contact Info</h5>
            <p>Email: support@tutortech.com</p>
            <p>Phone: +1 (555) 123-4567</p>
          </div>

          {/* Common Links Section */}
          <div className="col-md-4">
            <h5>Quick Links</h5>
            <ul className="list-unstyled">
              <li><a href="/" className="text-light">Home</a></li>
              <li><a href="/about" className="text-light">About Us</a></li>
            </ul>
          </div>
        </div>
      </div>
      <a href="#" class="back-to-top d-flex align-items-center justify-content-center active">
                  <i className="bi bi-arrow-up"></i>
      </a>
    </footer>
  );
}

export default Footer;
