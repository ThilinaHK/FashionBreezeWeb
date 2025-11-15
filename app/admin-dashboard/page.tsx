'use client';

import { useState, useEffect } from 'react';
import { Product, Category, Order } from '../types';

export default function AdminDashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeSection, setActiveSection] = useState('overview');
  const [stats, setStats] = useState({
    totalProducts: 0,
    totalCategories: 0,
    totalOrders: 0,
    totalRevenue: 0,
    pendingOrders: 0,
    lowStockProducts: 0
  });

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      const userData = localStorage.getItem('adminUser');
      
      if (loggedIn && userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadDashboardStats();
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const loadDashboardStats = async () => {
    try {
      const [productsRes, categoriesRes, ordersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders')
      ]);
      
      const [products, categories, orders] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ordersRes.json()
      ]);
      
      const totalRevenue = orders.reduce((sum: number, order: Order) => sum + (order.total || 0), 0);
      const pendingOrders = orders.filter((order: Order) => order.status === 'pending').length;
      const lowStockProducts = products.filter((product: Product) => {
        const totalStock = typeof product.sizes === 'object' ? 
          Object.values(product.sizes).reduce((a, b) => a + b, 0) : 0;
        return totalStock < 5;
      }).length;

      setStats({
        totalProducts: products.length,
        totalCategories: categories.length,
        totalOrders: orders.length,
        totalRevenue,
        pendingOrders,
        lowStockProducts
      });
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
  };

  if (!isLoggedIn) {
    return (
      <div className="admin-dashboard-page">
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
    <div className="admin-dashboard-page">
      {/* Navigation Header */}
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'}}>
        <div className="container-fluid">
          <a href="/admin-dashboard" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze - Admin Control Panel
          </a>
          <div className="d-flex align-items-center gap-3">
            <span className="text-white">Welcome, {currentUser?.username}</span>
            <a href="/" className="btn btn-outline-light">
              <i className="bi bi-shop me-2"></i>View Store
            </a>
            <button onClick={logout} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-4">
        <div className="row">
          {/* Sidebar Navigation */}
          <div className="col-md-3 col-lg-2">
            <div className="card border-0 shadow-sm">
              <div className="card-header bg-primary text-white">
                <h6 className="mb-0"><i className="bi bi-grid-3x3-gap me-2"></i>Dashboard Menu</h6>
              </div>
              <div className="list-group list-group-flush">
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveSection('overview')}
                >
                  <i className="bi bi-house me-2"></i>Overview
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveSection('products')}
                >
                  <i className="bi bi-box-seam me-2"></i>Product Management
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'tailoring' ? 'active' : ''}`}
                  onClick={() => setActiveSection('tailoring')}
                >
                  <i className="bi bi-scissors me-2"></i>Tailoring Services
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'members' ? 'active' : ''}`}
                  onClick={() => setActiveSection('members')}
                >
                  <i className="bi bi-person me-2"></i>Member Portal
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'designs' ? 'active' : ''}`}
                  onClick={() => setActiveSection('designs')}
                >
                  <i className="bi bi-palette me-2"></i>Design Management
                </button>
                <button 
                  className={`list-group-item list-group-item-action ${activeSection === 'analytics' ? 'active' : ''}`}
                  onClick={() => setActiveSection('analytics')}
                >
                  <i className="bi bi-graph-up me-2"></i>Analytics Dashboard
                </button>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div className="col-md-9 col-lg-10">
            {activeSection === 'overview' && (
              <div>
                <div className="d-flex justify-content-between align-items-center mb-4">
                  <h2 className="fw-bold">Dashboard Overview</h2>
                  <button onClick={loadDashboardStats} className="btn btn-outline-primary">
                    <i className="bi bi-arrow-clockwise me-2"></i>Refresh
                  </button>
                </div>

                {/* Stats Cards */}
                <div className="row g-4 mb-5">
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-primary text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-box-seam display-4 mb-3"></i>
                        <h3 className="fw-bold">{stats.totalProducts}</h3>
                        <p className="mb-0">Total Products</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-success text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-cart-check display-4 mb-3"></i>
                        <h3 className="fw-bold">{stats.totalOrders}</h3>
                        <p className="mb-0">Total Orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-info text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-currency-rupee display-4 mb-3"></i>
                        <h3 className="fw-bold">₹{stats.totalRevenue.toLocaleString()}</h3>
                        <p className="mb-0">Total Revenue</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-warning text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-clock display-4 mb-3"></i>
                        <h3 className="fw-bold">{stats.pendingOrders}</h3>
                        <p className="mb-0">Pending Orders</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-danger text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-exclamation-triangle display-4 mb-3"></i>
                        <h3 className="fw-bold">{stats.lowStockProducts}</h3>
                        <p className="mb-0">Low Stock Items</p>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm bg-secondary text-white">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-tags display-4 mb-3"></i>
                        <h3 className="fw-bold">{stats.totalCategories}</h3>
                        <p className="mb-0">Categories</p>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Quick Actions */}
                <div className="row g-4">
                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-box-seam display-4 text-primary mb-3"></i>
                        <h5 className="fw-bold">Product Management</h5>
                        <p className="text-muted mb-3">Manage your product catalog</p>
                        <button 
                          className="btn btn-primary"
                          onClick={() => setActiveSection('products')}
                        >
                          <i className="bi bi-arrow-right me-2"></i>Manage Products
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-scissors display-4 text-success mb-3"></i>
                        <h5 className="fw-bold">Tailoring Services</h5>
                        <p className="text-muted mb-3">Manage custom tailoring orders</p>
                        <button 
                          className="btn btn-success"
                          onClick={() => setActiveSection('tailoring')}
                        >
                          <i className="bi bi-arrow-right me-2"></i>View Tailoring
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-person display-4 text-info mb-3"></i>
                        <h5 className="fw-bold">Member Portal</h5>
                        <p className="text-muted mb-3">Customer member dashboard</p>
                        <button 
                          className="btn btn-info"
                          onClick={() => setActiveSection('members')}
                        >
                          <i className="bi bi-arrow-right me-2"></i>Member Area
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-palette display-4 text-warning mb-3"></i>
                        <h5 className="fw-bold">Design Management</h5>
                        <p className="text-muted mb-3">Manage tailoring designs</p>
                        <button 
                          className="btn btn-warning"
                          onClick={() => setActiveSection('designs')}
                        >
                          <i className="bi bi-arrow-right me-2"></i>Manage Designs
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="col-md-6 col-lg-4">
                    <div className="card border-0 shadow-sm h-100">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-graph-up display-4 text-danger mb-3"></i>
                        <h5 className="fw-bold">Analytics Dashboard</h5>
                        <p className="text-muted mb-3">View detailed analytics</p>
                        <button 
                          className="btn btn-danger"
                          onClick={() => setActiveSection('analytics')}
                        >
                          <i className="bi bi-arrow-right me-2"></i>View Analytics
                        </button>
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

                {/* Welcome Section */}
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
            )}

            {activeSection === 'products' && (
              <div>
                <h2 className="fw-bold mb-4">Product Management</h2>
                <div className="card">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-box-seam display-1 text-primary mb-4"></i>
                    <h4>Product Management System</h4>
                    <p className="text-muted mb-4">Manage your entire product catalog with advanced features</p>
                    <a href="/dashboard" className="btn btn-primary btn-lg">
                      <i className="bi bi-arrow-right me-2"></i>Go to Product Dashboard
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'tailoring' && (
              <div>
                <h2 className="fw-bold mb-4">Tailoring Services</h2>
                <div className="card">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-scissors display-1 text-success mb-4"></i>
                    <h4>Tailoring Management</h4>
                    <p className="text-muted mb-4">Manage custom tailoring orders and services</p>
                    <a href="/tailoring" className="btn btn-success btn-lg">
                      <i className="bi bi-arrow-right me-2"></i>View Tailoring Dashboard
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'members' && (
              <div>
                <h2 className="fw-bold mb-4">Member Portal</h2>
                <div className="card">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-person display-1 text-info mb-4"></i>
                    <h4>Customer Member Dashboard</h4>
                    <p className="text-muted mb-4">Manage customer memberships and accounts</p>
                    <a href="/member" className="btn btn-info btn-lg">
                      <i className="bi bi-arrow-right me-2"></i>Access Member Portal
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'designs' && (
              <div>
                <h2 className="fw-bold mb-4">Design Management</h2>
                <div className="card">
                  <div className="card-body text-center p-5">
                    <i className="bi bi-palette display-1 text-warning mb-4"></i>
                    <h4>Tailoring Design Management</h4>
                    <p className="text-muted mb-4">Manage and organize tailoring designs</p>
                    <a href="/dashboard/designs" className="btn btn-warning btn-lg">
                      <i className="bi bi-arrow-right me-2"></i>Manage Designs
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'analytics' && (
              <div>
                <h2 className="fw-bold mb-4">Analytics Dashboard</h2>
                <div className="row g-4">
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-graph-up display-4 text-primary mb-3"></i>
                        <h5>Sales Analytics</h5>
                        <p className="text-muted">View detailed sales reports and trends</p>
                        <div className="h4 text-primary">₹{stats.totalRevenue.toLocaleString()}</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-people display-4 text-success mb-3"></i>
                        <h5>Customer Analytics</h5>
                        <p className="text-muted">Track customer behavior and preferences</p>
                        <div className="h4 text-success">{stats.totalOrders} Orders</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-box display-4 text-info mb-3"></i>
                        <h5>Inventory Analytics</h5>
                        <p className="text-muted">Monitor stock levels and product performance</p>
                        <div className="h4 text-info">{stats.totalProducts} Products</div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="card">
                      <div className="card-body text-center p-4">
                        <i className="bi bi-exclamation-triangle display-4 text-warning mb-3"></i>
                        <h5>Alerts & Notifications</h5>
                        <p className="text-muted">Important alerts and system notifications</p>
                        <div className="h4 text-warning">{stats.lowStockProducts} Low Stock</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}