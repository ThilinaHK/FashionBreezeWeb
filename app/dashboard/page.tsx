'use client';

import { useState, useEffect } from 'react';
import { Product } from '../types';

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      const userData = localStorage.getItem('adminUser');
      
      if (loggedIn && userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="dashboard-page">
        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <i className="bi bi-shield-x display-1 text-danger mb-4"></i>
              <h2 className="mb-3">Access Denied</h2>
              <p className="lead mb-4">You need to login as admin to access the dashboard.</p>
              <a href="/login" className="btn btn-primary btn-lg">
                <i className="bi bi-box-arrow-in-right me-2"></i>Login
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'var(--gradient-primary)'}}>
        <div className="container">
          <a href="/dashboard" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze - Admin Dashboard
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn btn-outline-light">
              <i className="bi bi-shop me-2"></i>View Store
            </a>
            <a href="/admin-dashboard" className="btn btn-outline-success">
              <i className="bi bi-speedometer2 me-2"></i>Analytics Dashboard
            </a>
            <button onClick={logout} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row mb-4">
          <div className="col-12">
            <h1 className="display-4 fw-bold mb-3">Admin Dashboard</h1>
            <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', borderRadius: '2px'}}></div>
          </div>
        </div>

        <div className="row g-4">
          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-box-seam display-4 text-primary mb-3"></i>
                <h5 className="fw-bold">Product Management</h5>
                <p className="text-muted mb-3">Manage your product catalog</p>
                <a href="/dashboard/products" className="btn btn-primary">
                  <i className="bi bi-arrow-right me-2"></i>Manage Products
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-scissors display-4 text-success mb-3"></i>
                <h5 className="fw-bold">Tailoring Services</h5>
                <p className="text-muted mb-3">Manage custom tailoring orders</p>
                <a href="/tailoring" className="btn btn-success">
                  <i className="bi bi-arrow-right me-2"></i>View Tailoring
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-person display-4 text-info mb-3"></i>
                <h5 className="fw-bold">Member Portal</h5>
                <p className="text-muted mb-3">Customer member dashboard</p>
                <a href="/member" className="btn btn-info">
                  <i className="bi bi-arrow-right me-2"></i>Member Area
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-palette display-4 text-warning mb-3"></i>
                <h5 className="fw-bold">Design Management</h5>
                <p className="text-muted mb-3">Manage tailoring designs</p>
                <a href="/dashboard/designs" className="btn btn-warning">
                  <i className="bi bi-arrow-right me-2"></i>Manage Designs
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-speedometer2 display-4 text-danger mb-3"></i>
                <h5 className="fw-bold">Analytics Dashboard</h5>
                <p className="text-muted mb-3">View detailed analytics</p>
                <a href="/admin-dashboard" className="btn btn-danger">
                  <i className="bi bi-arrow-right me-2"></i>View Analytics
                </a>
              </div>
            </div>
          </div>

          <div className="col-md-6 col-lg-4">
            <div className="card border-0 shadow-sm h-100">
              <div className="card-body text-center p-4">
                <i className="bi bi-shop display-4 text-secondary mb-3"></i>
                <h5 className="fw-bold">View Store</h5>
                <p className="text-muted mb-3">Visit the main store</p>
                <a href="/" className="btn btn-secondary">
                  <i className="bi bi-arrow-right me-2"></i>Go to Store
                </a>
              </div>
            </div>
          </div>
        </div>

        <div className="row mt-5">
          <div className="col-12">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-5">
                <h3 className="fw-bold mb-3">Welcome to Fashion Breeze Admin</h3>
                <p className="lead text-muted mb-4">
                  Manage your e-commerce store and tailoring services from this central dashboard.
                </p>
                <div className="row g-3">
                  <div className="col-md-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>Product Management</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>Tailoring Services</span>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="d-flex align-items-center justify-content-center">
                      <i className="bi bi-check-circle text-success me-2"></i>
                      <span>Analytics & Reports</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}