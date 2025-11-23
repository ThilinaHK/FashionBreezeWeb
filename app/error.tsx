'use client'

import { useEffect } from 'react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)'
    }}>
      <div className="container">
        <div className="row justify-content-center">
          <div className="col-md-6 text-center text-white">
            <div className="mb-4">
              <i className="bi bi-exclamation-triangle-fill" style={{ fontSize: '4rem' }}></i>
            </div>
            <h1 className="display-4 fw-bold mb-3">Oops!</h1>
            <h4 className="fw-light mb-4">Something went wrong</h4>
            <p className="lead mb-4 opacity-90">
              We encountered an unexpected error. Don't worry, our team has been notified.
            </p>
            <div className="d-flex gap-3 justify-content-center">
              <button
                onClick={reset}
                className="btn btn-light btn-lg px-4 py-3"
                style={{
                  borderRadius: '15px',
                  fontWeight: '600'
                }}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>
                Try Again
              </button>
              <a
                href="/"
                className="btn btn-outline-light btn-lg px-4 py-3"
                style={{
                  borderRadius: '15px',
                  fontWeight: '600',
                  borderWidth: '2px'
                }}
              >
                <i className="bi bi-house me-2"></i>
                Go Home
              </a>
            </div>
            {error.digest && (
              <div className="mt-4">
                <small className="opacity-75">Error ID: {error.digest}</small>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}