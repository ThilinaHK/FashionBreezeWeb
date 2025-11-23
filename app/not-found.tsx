export default function NotFound() {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-lg-6 text-center">
          <h1 className="display-1">404</h1>
          <h2 className="mb-3">Page Not Found</h2>
          <p className="lead mb-4">The page you are looking for does not exist.</p>
          <a href="/" className="btn btn-primary">
            Go Home
          </a>
        </div>
      </div>
    </div>
  );
}