'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function RegisterPage() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    phone: '',
    country: '',
    address: {
      line1: '',
      line2: '',
      line3: ''
    }
  });

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const checkEmailExists = async (email: string) => {
    try {
      const response = await fetch('/api/auth/check-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      const data = await response.json();
      return data.exists;
    } catch (error) {
      return false;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    try {
      // Validate passwords match
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match.');
        setLoading(false);
        return;
      }
      
      if (formData.password.length < 6) {
        setError('Password must be at least 6 characters long.');
        setLoading(false);
        return;
      }
      
      // Check if email already exists
      const emailExists = await checkEmailExists(formData.email);
      if (emailExists) {
        setError('Email address is already registered. Please use a different email.');
        setLoading(false);
        return;
      }

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('userRegistered', 'true');
        localStorage.setItem('userName', data.user.name);
        localStorage.setItem('userId', data.userId);
        localStorage.setItem('userEmail', data.user.email);
        localStorage.setItem('userPhone', data.user.phone);
        localStorage.setItem('userCountry', data.user.country);
        if (data.user.address) {
          localStorage.setItem('userAddress', JSON.stringify(data.user.address));
        }
        document.cookie = `userId=${data.userId}; path=/; max-age=86400`;
        router.push('/');
      } else {
        setError(data.error || 'Registration failed');
      }
    } catch (error) {
      setError('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('address.')) {
      const addressField = name.split('.')[1];
      setFormData(prev => ({
        ...prev,
        address: {
          ...prev.address,
          [addressField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: value
      }));
    }
  };

  return (
    <div className="register-page">
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
          <div className="col-lg-6">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">Register</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
              <p className="lead mt-3">Create your account to place orders</p>
            </div>

            <div className="card border-0 shadow-sm">
              <div className="card-body p-5">
                {error && (
                  <div className="alert alert-danger" role="alert">
                    <i className="bi bi-exclamation-triangle me-2"></i>{error}
                  </div>
                )}
                <form onSubmit={handleSubmit}>
                  <div className="row g-3">
                    <div className="col-12">
                      <label className="form-label fw-bold">Full Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter your full name" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Email Address *</label>
                      <input 
                        type="email" 
                        className="form-control" 
                        name="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter your email"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Password *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="password"
                        value={formData.password}
                        onChange={handleInputChange}
                        required 
                        minLength={6}
                        placeholder="Enter password (min 6 characters)"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Confirm Password *</label>
                      <input 
                        type="password" 
                        className="form-control" 
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleInputChange}
                        required 
                        minLength={6}
                        placeholder="Confirm your password"
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Phone Number *</label>
                      <input 
                        type="tel" 
                        className="form-control" 
                        name="phone"
                        value={formData.phone}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter your phone number" 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Country *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="country"
                        value={formData.country}
                        onChange={handleInputChange}
                        required 
                        placeholder="Enter your country" 
                      />
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold">Address Line 1 *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="address.line1"
                        value={formData.address.line1}
                        onChange={handleInputChange}
                        required 
                        placeholder="Street address" 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Address Line 2</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="address.line2"
                        value={formData.address.line2}
                        onChange={handleInputChange}
                        placeholder="Apartment, suite, etc." 
                      />
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Address Line 3</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        name="address.line3"
                        value={formData.address.line3}
                        onChange={handleInputChange}
                        placeholder="City, postal code" 
                      />
                    </div>
                    <div className="col-12">
                      <button type="submit" className="btn btn-primary btn-lg w-100" disabled={loading}>
                        {loading ? (
                          <><i className="bi bi-hourglass-split me-2"></i>Creating Account...</>
                        ) : (
                          <><i className="bi bi-person-plus me-2"></i>Create Account</>
                        )}
                      </button>
                    </div>
                    <div className="col-12 text-center">
                      <p className="mb-0">Already have an account? <a href="/login" className="text-primary">Login here</a></p>
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