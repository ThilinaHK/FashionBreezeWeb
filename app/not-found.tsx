import Link from 'next/link'

export default function NotFound() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center text-white">
            <div className="mb-4">
              <div className="display-1 fw-bold mb-3" style={{ fontSize: '8rem', lineHeight: 1 }}>
                404
              </div>
            </div>
            <h1 className="display-4 fw-bold mb-3">Page Not Found</h1>
            <p className="lead mb-4 opacity-90">
              The page you're looking for doesn't exist or has been moved.
            </p>
            <div className="d-flex gap-3 justify-content-center flex-wrap">
              <Link
                href="/"
                className="btn btn-light btn-lg px-4 py-3"
                style={{
                  borderRadius: '15px',
                  fontWeight: '600',
                  textDecoration: 'none'
                }}
              >
                <i className="bi bi-house me-2"></i>
                Go Home
              </Link>
              <Link
                href="/contact"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{
                  borderRadius: '15px',
                  fontWeight: '600',
                  borderWidth: '2px',
                  textDecoration: 'none'
                }}
              >
                <i className="bi bi-headset me-2"></i>
                Contact Support
              </Link>
            </div>
            <div className="mt-5">
              <p className="mb-2 opacity-75">Popular pages:</p>
              <div className="d-flex gap-3 justify-content-center flex-wrap">
                <Link href="/about" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  About Us
                </Link>
                <span className="opacity-50">•</span>
                <Link href="/register" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  Register
                </Link>
                <span className="opacity-50">•</span>
                <Link href="/login" className="text-white text-decoration-none opacity-75 hover-opacity-100">
                  Login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}