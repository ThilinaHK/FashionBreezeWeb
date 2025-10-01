'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Check for admin credentials
    if (email === 'admin@fashionbreeze.com') {
      localStorage.setItem('adminLoggedIn', 'true');
      router.push('/dashboard');
      setLoading(false);
      return;
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.user.id);
        localStorage.setItem('userEmail', data.user.email);
        router.push('/');
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
    <div className="login-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'var(--gradient-primary)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze
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
              <h1 className="display-4 fw-bold mb-3">Login</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
              <p className="lead mt-3">Welcome back to Fashion Breeze</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="mb-4">
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
                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
                    {loading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Logging in...</>
                    ) : (
                      <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
                    )}
                  </button>
                  <div className="text-center">
                    <p className="mb-2">Don't have an account? <a href="/register" className="text-primary">Register here</a></p>
                    <hr className="my-3" />
                    <div className="alert alert-info" role="alert">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Admin Access:</strong> Use <code>admin@fashionbreeze.com</code> to access dashboard<br/>
                      <strong>Customer Login:</strong> Use any registered email to access customer features
                    </div>
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}