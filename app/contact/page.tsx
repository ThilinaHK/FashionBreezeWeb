'use client';

import { useState } from 'react';

export default function ContactPage() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [message, setMessage] = useState('');
  const [messageSent, setMessageSent] = useState(false);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (name && email && message) {
      const whatsappMessage = `Contact Form Submission:\\nName: ${name}\\nEmail: ${email}\\nMessage: ${message}`;
      const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(whatsappMessage)}`;
      window.open(whatsappUrl, '_blank');
      
      setMessageSent(true);
      setName('');
      setEmail('');
      setMessage('');
      
      setTimeout(() => setMessageSent(false), 3000);
    }
  };

  return (
    <div className="contact-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'var(--gradient-primary)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link" href="/">
                  <i className="bi bi-bag me-1"></i>Products
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/about">
                  <i className="bi bi-info-circle me-1"></i>About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link active" href="/contact">
                  <i className="bi bi-telephone me-1"></i>Contact Us
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              <a href="/register" className="btn btn-outline-light">
                <i className="bi bi-person-plus me-2"></i>Register
              </a>
              <a href="/" className="btn btn-light">
                <i className="bi bi-arrow-left me-2"></i>Shop Now
              </a>
            </div>
          </div>
        </div>
      </nav>

      {messageSent && (
        <div className="container mt-3">
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Message sent!</strong> We'll get back to you soon.
          </div>
        </div>
      )}

      <div className="container py-5">
        <div className="row">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Contact Us</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
              <p className="lead mt-3">We'd love to hear from you. Send us a message!</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <form onSubmit={sendMessage}>
                  <div className="row g-3">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Full Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        required 
                        placeholder="Enter your name" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Email Address</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required 
                        placeholder="Enter your email" 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Message</label>
                      <textarea 
                        className="form-control" 
                        rows={5} 
                        value={message}
                        onChange={(e) => setMessage(e.target.value)}
                        required 
                        placeholder="Tell us how we can help you..."
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg px-4">
                        <i className="bi bi-send me-2"></i>Send Message
                      </button>
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>

          <div className="col-lg-4">
            <div className="card border-0 shadow-sm mb-4">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-4">Get in Touch</h5>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-telephone-fill text-primary me-3 fs-5"></i>
                  <div>
                    <strong>Phone</strong><br />
                    <a href="tel:+94707003722" className="text-decoration-none">+94 70 700 3722</a>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-3">
                  <i className="bi bi-envelope-fill text-primary me-3 fs-5"></i>
                  <div>
                    <strong>Email</strong><br />
                    <a href="mailto:info@fashionbreeze.lk" className="text-decoration-none">info@fashionbreeze.lk</a>
                  </div>
                </div>
                <div className="d-flex align-items-center mb-4">
                  <i className="bi bi-geo-alt-fill text-primary me-3 fs-5"></i>
                  <div>
                    <strong>Address</strong><br />
                    Colombo, Sri Lanka
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <a href="https://facebook.com/fashionbreeze" target="_blank" className="btn btn-outline-primary">
                    <i className="bi bi-facebook"></i>
                  </a>
                  <a href="https://instagram.com/fashionbreeze" target="_blank" className="btn btn-outline-primary">
                    <i className="bi bi-instagram"></i>
                  </a>
                  <a href="https://wa.me/94707003722" target="_blank" className="btn btn-outline-success">
                    <i className="bi bi-whatsapp"></i>
                  </a>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-4">
                <h5 className="fw-bold mb-3">Business Hours</h5>
                <div className="mb-2">
                  <strong>Monday - Friday:</strong><br />
                  9:00 AM - 8:00 PM
                </div>
                <div className="mb-2">
                  <strong>Saturday:</strong><br />
                  10:00 AM - 6:00 PM
                </div>
                <div>
                  <strong>Sunday:</strong><br />
                  Closed
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}