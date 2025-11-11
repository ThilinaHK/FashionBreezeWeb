'use client';

import { useState, useEffect } from 'react';
import { TailoringDesign } from '@/app/types';
import AnalyticsSection from './analytics-section';

export default function TailoringDashboard() {
  const [designs, setDesigns] = useState<TailoringDesign[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [showForm, setShowForm] = useState(false);
  const [activeTab, setActiveTab] = useState('designs');
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentTailor, setCurrentTailor] = useState<any>(null);
  const [formData, setFormData] = useState<Partial<TailoringDesign>>({
    name: '',
    description: '',
    images: ['', '', '', '', '', ''],
    fabricTypes: [],
    priceRange: { min: 0, max: 0 },
    measurements: [],
    category: '',
    createdBy: 'tailor'
  });

  useEffect(() => {
    const loggedIn = localStorage.getItem('tailorLoggedIn') === 'true';
    const tailorData = localStorage.getItem('tailorUser');
    
    if (loggedIn && tailorData) {
      setCurrentTailor(JSON.parse(tailorData));
      setIsLoggedIn(true);
      fetchDesigns();
    } else {
      setIsLoggedIn(false);
    }
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      if (activeTab === 'orders') {
        fetchOrders();
      }
      if (activeTab === 'analytics') {
        fetchAnalytics();
      }
    }
  }, [activeTab, isLoggedIn]);

  const fetchDesigns = async () => {
    const response = await fetch('/api/designs');
    const data = await response.json();
    setDesigns(data);
  };

  const fetchOrders = async () => {
    const response = await fetch('/api/tailoring/orders');
    const data = await response.json();
    setOrders(data);
  };

  const fetchAnalytics = async () => {
    const response = await fetch('/api/tailoring/analytics');
    const data = await response.json();
    setAnalytics(data);
  };

  const updateOrderStatus = async (orderId: string, status: string, comments?: string) => {
    const response = await fetch('/api/tailoring/orders', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ orderId, status, comments })
    });
    
    if (response.ok) {
      fetchOrders();
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      fetchDesigns();
      setShowForm(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('tailorLoggedIn');
    localStorage.removeItem('tailorUser');
    window.location.href = '/tailor-auth/login';
  };

  if (!isLoggedIn) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <h2>Access Denied</h2>
          <p>Please login as a tailor to access this dashboard.</p>
          <a href="/tailor-auth/login" className="btn btn-primary">Login</a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 bg-light">
      <nav className="navbar navbar-dark bg-dark">
        <div className="container-fluid">
          <span className="navbar-brand">Tailoring Dashboard - {currentTailor?.shopName}</span>
          <div className="d-flex gap-2">
            <a href="/tailoring/browse" className="btn btn-outline-light">
              Browse Designs
            </a>
            <button className="btn btn-outline-light" onClick={() => setShowForm(true)}>
              + New Design
            </button>
            <button className="btn btn-outline-danger" onClick={logout}>
              Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid p-0">
        <ul className="nav nav-tabs">
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'designs' ? 'active' : ''}`} onClick={() => setActiveTab('designs')}>
              Designs
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
              Orders
            </button>
          </li>
          <li className="nav-item">
            <button className={`nav-link ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
              Analytics
            </button>
          </li>
        </ul>
      </div>

      <div className="container-fluid p-4">
        {showForm && (
          <div className="card mb-4">
            <div className="card-header">
              <h5>Add New Design</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Design Name"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <select
                      className="form-control"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                      required
                    >
                      <option value="">Select Category</option>
                      <option value="shirts">Shirts</option>
                      <option value="dresses">Dresses</option>
                      <option value="saree-jackets">Saree Jackets</option>
                      <option value="trousers">Trousers</option>
                    </select>
                  </div>
                </div>
                
                <textarea
                  className="form-control mb-3"
                  rows={3}
                  placeholder="Description"
                  value={formData.description}
                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                  required
                />

                <div className="mb-3">
                  <label className="form-label fw-bold">Design Images (6 Different Angles)</label>
                  <div className="row g-3">
                    {['Front View', 'Back View', 'Side View', 'Detail View', 'Full View', 'Close-up'].map((label, index) => (
                      <div key={index} className="col-md-4">
                        <label className="form-label small">{label}</label>
                        <input
                          type="file"
                          className="form-control"
                          accept="image/*"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              const reader = new FileReader();
                              reader.onload = (event) => {
                                const newImages = [...(formData.images || [])];
                                newImages[index] = event.target?.result as string;
                                setFormData({...formData, images: newImages});
                              };
                              reader.readAsDataURL(file);
                            }
                          }}
                        />
                        {formData.images?.[index] && (
                          <div className="mt-2">
                            <img 
                              src={formData.images[index]} 
                              alt={label}
                              className="img-thumbnail"
                              style={{width: '100px', height: '80px', objectFit: 'cover'}}
                            />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row mb-3">
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Min Price"
                      value={formData.priceRange?.min}
                      onChange={(e) => setFormData({
                        ...formData, 
                        priceRange: {...formData.priceRange!, min: Number(e.target.value)}
                      })}
                      required
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="number"
                      className="form-control"
                      placeholder="Max Price"
                      value={formData.priceRange?.max}
                      onChange={(e) => setFormData({
                        ...formData, 
                        priceRange: {...formData.priceRange!, max: Number(e.target.value)}
                      })}
                      required
                    />
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-primary">Save Design</button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="row">
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-primary">{designs.length}</h3>
                <p>Total Designs</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card">
              <div className="card-body text-center">
                <h3 className="text-success">{designs.filter(d => d.isActive).length}</h3>
                <p>Active Designs</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'designs' && (
          <div className="row mt-4">
            {designs.map((design) => (
              <div key={design._id} className="col-md-4 mb-4">
                <div className="card">
                  {design.images && design.images[0] && (
                    <img 
                      src={design.images[0]} 
                      className="card-img-top" 
                      alt={design.name}
                      style={{height: '200px', objectFit: 'cover'}}
                    />
                  )}
                  <div className="card-body">
                    <h5>{design.name}</h5>
                    <p className="text-muted">{design.description}</p>
                    <p className="fw-bold">Rs. {design.priceRange.min} - Rs. {design.priceRange.max}</p>
                    <span className="badge bg-primary">{design.category}</span>
                    {design.images && design.images.filter(img => img).length > 1 && (
                      <div className="mt-2">
                        <small className="text-muted">
                          {design.images.filter(img => img).length} images
                        </small>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="mt-4">
            <div className="table-responsive">
              <table className="table table-hover">
                <thead>
                  <tr>
                    <th>Order #</th>
                    <th>Customer</th>
                    <th>Design</th>
                    <th>Status</th>
                    <th>Delivery Date</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((order) => (
                    <tr key={order._id}>
                      <td><span className="badge bg-secondary">{order.orderNumber}</span></td>
                      <td>{order.customerInfo?.name}</td>
                      <td>{order.designName}</td>
                      <td>
                        <span className={`badge ${
                          order.status === 'pending' ? 'bg-warning' :
                          order.status === 'approved' ? 'bg-info' :
                          order.status === 'in_progress' ? 'bg-primary' :
                          order.status === 'ready' ? 'bg-success' :
                          order.status === 'delivered' ? 'bg-dark' : 'bg-danger'
                        }`}>
                          {order.status.replace('_', ' ').toUpperCase()}
                        </span>
                      </td>
                      <td>{new Date(order.deliveryDate).toLocaleDateString()}</td>
                      <td>
                        <div className="btn-group">
                          {order.status === 'pending' && (
                            <>
                              <button 
                                className="btn btn-sm btn-success"
                                onClick={() => updateOrderStatus(order._id, 'approved')}
                              >
                                Approve
                              </button>
                              <button 
                                className="btn btn-sm btn-danger"
                                onClick={() => updateOrderStatus(order._id, 'rejected', 'Please review measurements')}
                              >
                                Reject
                              </button>
                            </>
                          )}
                          {order.status === 'approved' && (
                            <button 
                              className="btn btn-sm btn-primary"
                              onClick={() => updateOrderStatus(order._id, 'in_progress')}
                            >
                              Start Work
                            </button>
                          )}
                          {order.status === 'in_progress' && (
                            <button 
                              className="btn btn-sm btn-success"
                              onClick={() => updateOrderStatus(order._id, 'ready')}
                            >
                              Mark Ready
                            </button>
                          )}
                          {order.status === 'ready' && (
                            <button 
                              className="btn btn-sm btn-dark"
                              onClick={() => updateOrderStatus(order._id, 'delivered')}
                            >
                              Delivered
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'analytics' && (
          <AnalyticsSection analytics={analytics} />
        )}
      </div>
    </div>
  );
}