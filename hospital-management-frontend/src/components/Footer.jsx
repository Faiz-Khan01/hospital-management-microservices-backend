import React from 'react';

function Footer() {
  return (
    <footer className="bg-dark text-white pt-4 pb-2 mt-5">
      <div className="container text-center">
        <div className="row">
          <div className="col-md-12">
            <h5>Hospital Management System</h5>
            <p className="text-muted small">
              Secure Centralized Medical Gateway Architecture | Powered by Spring Boot Microservices
            </p>
          </div>
        </div>
        <hr className="bg-secondary" />
        <p className="small mb-0">
          © {new Date().getFullYear()} HealthCare Solutions Inc. | All rights reserved.
        </p>
      </div>
    </footer>
  );
}

export default Footer;