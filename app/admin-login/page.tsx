'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminLoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      const response = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(data.user));
        router.push('/dashboard');
      } else {
        setError(data.error || 'Login failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="admin-login-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'var(--gradient-primary)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze - Admin
          </a>
          <a href="/" className="btn btn-outline-light">
            <i className="bi bi-arrow-left me-2"></i>Back to Shop
          </a>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-4">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Admin Login</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
              <p className="lead mt-3">Access Admin Dashboard</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Email Address</label>
                    <input 
                      type="email" 
                      className="form-control" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                      placeholder="Enter admin email" 
                    />
                  </div>
                  <div className="mb-4">
                    <label className="form-label fw-bold">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      placeholder="Enter password" 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                    {loading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Logging in...</>
                    ) : (
                      <><i className="bi bi-shield-check me-2"></i>Login to Dashboard</>
                    )}
                  </button>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}