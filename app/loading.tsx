export default function Loading() {
  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center" style={{
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
    }}>
      <div className="text-center">
        <div className="mb-4">
          <div className="spinner-border text-light" role="status" style={{
            width: '4rem',
            height: '4rem',
            borderWidth: '0.3rem'
          }}>
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
        <div className="text-white">
          <h4 className="fw-light mb-2">Fashion Breeze</h4>
          <p className="mb-0 opacity-75">Loading your premium fashion experience...</p>
        </div>
      </div>
    </div>
  )
}