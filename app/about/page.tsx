export default function AboutPage() {
  return (
    <div className="about-page">
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
                <a className="nav-link active" href="/about">
                  <i className="bi bi-info-circle me-1"></i>About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link" href="/contact">
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

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">About Fashion Breeze</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
            </div>

            <div className="card border-0 shadow-sm mb-5">
              <div className="card-body p-5">
                <h2 className="h3 mb-4">Our Story</h2>
                <p className="lead mb-4">Fashion Breeze was born from a passion for bringing the latest fashion trends to everyone, everywhere. We believe that style should be accessible, affordable, and authentic.</p>
                <p className="mb-4">Since our inception, we've been committed to curating a diverse collection of clothing and accessories that cater to every taste, occasion, and budget. From casual everyday wear to special occasion outfits, we've got you covered.</p>
              </div>
            </div>

            <div className="row g-4 mb-5">
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-heart-fill display-4 text-danger mb-3"></i>
                    <h5 className="fw-bold">Quality First</h5>
                    <p className="text-muted">We source only the finest materials and work with trusted suppliers to ensure every piece meets our high standards.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-lightning-charge-fill display-4 text-warning mb-3"></i>
                    <h5 className="fw-bold">Fast Delivery</h5>
                    <p className="text-muted">Quick and reliable shipping across Sri Lanka. Your fashion finds delivered right to your doorstep.</p>
                  </div>
                </div>
              </div>
              <div className="col-md-4">
                <div className="card border-0 shadow-sm h-100">
                  <div className="card-body text-center p-4">
                    <i className="bi bi-people-fill display-4 text-primary mb-3"></i>
                    <h5 className="fw-bold">Customer Care</h5>
                    <p className="text-muted">Our dedicated support team is here to help you with any questions or concerns you may have.</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                <h2 className="h3 mb-4">Our Mission</h2>
                <p className="mb-3">To make fashion accessible to everyone by providing:</p>
                <ul className="list-unstyled">
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>High-quality products at affordable prices</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>Exceptional customer service</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>A seamless shopping experience</li>
                  <li className="mb-2"><i className="bi bi-check-circle-fill text-success me-2"></i>The latest fashion trends and timeless classics</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}