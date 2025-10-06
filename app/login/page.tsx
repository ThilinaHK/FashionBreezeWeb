'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGoogleLogin = () => {
    // Simulate Google OAuth login
    const googleUser = {
      id: 'google_' + Date.now(),
      name: 'Google User',
      email: 'user@gmail.com',
      provider: 'google'
    };
    
    // Set cookie for authentication
    document.cookie = `userId=${googleUser.id}; path=/; max-age=86400`;
    
    // Save to MongoDB as customer
    fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: googleUser.name,
        email: googleUser.email,
        phone: '',
        country: '',
        address: { line1: '', line2: '', line3: '' },
        provider: 'google'
      })
    }).then(() => {
      router.push('/');
    }).catch(() => {
      router.push('/');
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    // Try admin login first
    try {
      const adminResponse = await fetch('/api/auth/admin-login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const adminData = await adminResponse.json();
      
      if (adminData.success && adminData.isAdmin) {
        localStorage.setItem('adminLoggedIn', 'true');
        localStorage.setItem('adminUser', JSON.stringify(adminData.user));
        router.push('/dashboard');
        setLoading(false);
        return;
      }
    } catch (error) {
      // Continue to customer login if admin login fails
    }
    
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.user.email);
        document.cookie = `userId=${data.userId}; path=/; max-age=86400`;
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
                  <div className="mb-3">
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
                  <div className="mb-4">
                    <label className="form-label fw-bold">Password</label>
                    <input 
                      type="password" 
                      className="form-control" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                      placeholder="Enter your password" 
                    />
                  </div>
                  <button type="submit" className="btn btn-primary btn-lg w-100 mb-3" disabled={loading}>
                    {loading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Logging in...</>
                    ) : (
                      <><i className="bi bi-box-arrow-in-right me-2"></i>Login</>
                    )}
                  </button>
                  
                  <div className="text-center mb-3">
                    <span className="text-muted">or</span>
                  </div>
                  
                  <button type="button" className="btn btn-outline-danger btn-lg w-100 mb-3" onClick={handleGoogleLogin}>
                    <i className="bi bi-google me-2"></i>Continue with Google
                  </button>
                  <div className="text-center">
                    <p className="mb-2">Don't have an account? <a href="/register" className="text-primary">Register here</a></p>
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