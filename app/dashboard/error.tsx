'use client'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 text-center">
          <i className="bi bi-exclamation-triangle display-1 text-warning mb-4"></i>
          <h2 className="mb-3">Dashboard Error</h2>
          <p className="lead mb-4">Something went wrong while loading the dashboard.</p>
          <div className="d-flex gap-3 justify-content-center">
            <button 
              onClick={reset}
              className="btn btn-primary"
            >
              <i className="bi bi-arrow-clockwise me-2"></i>Try Again
            </button>
            <a href="/" className="btn btn-outline-secondary">
              <i className="bi bi-house me-2"></i>Go Home
            </a>
          </div>
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-3 bg-light rounded text-start">
              <small className="text-muted">Error: {error.message}</small>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}