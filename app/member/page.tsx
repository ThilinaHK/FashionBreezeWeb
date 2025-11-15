'use client';

import { useState, useEffect } from 'react';

export default function MemberDashboard() {
  const [stats, setStats] = useState({
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    try {
      const response = await fetch('/api/member/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3" style={{color: '#22c55e'}}>
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-arrow-left me-2"></i>Back to Shop
            </a>
            <a href="/profile" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-person-circle me-2"></i>My Profile
            </a>
          </div>
        </div>
      </nav>
      
      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>Member Dashboard</h1>
          <div style={{width: '120px', height: '4px', background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', margin: '0 auto', borderRadius: '2px'}}></div>
        </div>
      
        <div className="row mb-5">
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-lg" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white'}}>
              <div className="card-body py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-bag-check" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.totalOrders}</h2>
                <p className="mb-0 fw-semibold">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-lg" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #000000 0%, #374151 100%)', color: 'white'}}>
              <div className="card-body py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-clock-history" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.pendingOrders}</h2>
                <p className="mb-0 fw-semibold">Pending Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-4">
            <div className="card text-center border-0 shadow-lg" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)', color: 'white'}}>
              <div className="card-body py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-check-circle" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.completedOrders}</h2>
                <p className="mb-0 fw-semibold">Completed Orders</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #000000 0%, #1f2937 100%)', color: 'white'}}>
              <div className="card-body text-center py-5">
                <div className="bg-green-500 bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px', background: 'rgba(34, 197, 94, 0.2)'}}>
                  <i className="bi bi-scissors" style={{fontSize: '2rem', color: '#22c55e'}}></i>
                </div>
                <h4 className="fw-bold mb-3" style={{color: '#22c55e'}}>📦 Pre-Orders</h4>
                <p className="text-light mb-4">Manage your tailoring orders and track progress</p>
                <a href="/member/pre-orders" className="btn btn-lg px-4" style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600'}}>
                  <i className="bi bi-eye me-2"></i>View Pre-Orders
                </a>
              </div>
            </div>
          </div>
          <div className="col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white'}}>
              <div className="card-body text-center py-5">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-4" style={{width: '80px', height: '80px'}}>
                  <i className="bi bi-palette" style={{fontSize: '2rem'}}></i>
                </div>
                <h4 className="fw-bold mb-3">👕 Browse Designs</h4>
                <p className="text-white mb-4">Explore new tailoring designs and collections</p>
                <a href="/tailoring/browse" className="btn btn-lg px-4" style={{background: 'rgba(0, 0, 0, 0.3)', border: '2px solid white', borderRadius: '12px', color: 'white', fontWeight: '600'}}>
                  <i className="bi bi-search me-2"></i>Browse Designs
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}