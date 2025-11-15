'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '../types';

interface Order {
  _id: string;
  customerInfo?: {
    name: string;
    email: string;
  };
  total: number;
  status: string;
  createdAt: string;
}

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      if (loggedIn) {
        setIsLoggedIn(true);
        loadData();
      }
    }
  }, []);

  const loadData = async () => {
    setLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, customersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/customers')
      ]);
      
      const [productsData, categoriesData, ordersData, customersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ordersRes.json(),
        customersRes.json()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
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

        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-pills justify-content-center" role="tablist">
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
                  onClick={() => setActiveTab('overview')}
                >
                  <i className="bi bi-house me-2"></i>Overview
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'products' ? 'active' : ''}`}
                  onClick={() => setActiveTab('products')}
                >
                  <i className="bi bi-box-seam me-2"></i>Products
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`}
                  onClick={() => setActiveTab('categories')}
                >
                  <i className="bi bi-tags me-2"></i>Categories
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`}
                  onClick={() => setActiveTab('orders')}
                >
                  <i className="bi bi-cart-check me-2"></i>Orders
                </button>
              </li>
              <li className="nav-item" role="presentation">
                <button 
                  className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`}
                  onClick={() => setActiveTab('customers')}
                >
                  <i className="bi bi-people me-2"></i>Customers
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="row mb-3">
          <div className="col-12">
            <div className="d-flex flex-wrap gap-2 justify-content-center">
              <a href="/dashboard/products" className="btn btn-outline-primary btn-sm">
                <i className="bi bi-gear me-2"></i>Product Manager
              </a>
              <a href="/dashboard/designs" className="btn btn-outline-warning btn-sm">
                <i className="bi bi-palette me-2"></i>Design Manager
              </a>
              <a href="/tailoring" className="btn btn-outline-info btn-sm">
                <i className="bi bi-scissors me-2"></i>Tailoring
              </a>
              <a href="/member" className="btn btn-outline-secondary btn-sm">
                <i className="bi bi-person me-2"></i>Member Portal
              </a>
            </div>
          </div>
        </div>

        <div className="tab-content">
          {activeTab === 'overview' && (
            <div className="tab-pane fade show active">
              <div className="row g-4 mb-4">
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100 bg-primary text-white">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-box-seam display-4 mb-3"></i>
                      <h5 className="fw-bold">{products.length}</h5>
                      <p className="mb-0">Total Products</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100 bg-success text-white">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-tags display-4 mb-3"></i>
                      <h5 className="fw-bold">{categories.length}</h5>
                      <p className="mb-0">Categories</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100 bg-info text-white">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-cart-check display-4 mb-3"></i>
                      <h5 className="fw-bold">{orders.length}</h5>
                      <p className="mb-0">Total Orders</p>
                    </div>
                  </div>
                </div>
                <div className="col-md-6 col-lg-3">
                  <div className="card border-0 shadow-sm h-100 bg-warning text-white">
                    <div className="card-body text-center p-4">
                      <i className="bi bi-currency-rupee display-4 mb-3"></i>
                      <h5 className="fw-bold">LKR {orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}</h5>
                      <p className="mb-0">Total Revenue</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'products' && (
            <div className="tab-pane fade show active">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                  <h5 className="mb-0"><i className="bi bi-box-seam me-2"></i>Products Overview</h5>
                  <a href="/dashboard/products" className="btn btn-light btn-sm">
                    <i className="bi bi-gear me-2"></i>Manage Products
                  </a>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {products.slice(0, 6).map((product, index) => (
                      <div key={index} className="col-md-4">
                        <div className="card border">
                          <img src={product.image} alt={product.name} className="card-img-top" style={{height: '200px', objectFit: 'cover'}} />
                          <div className="card-body">
                            <h6 className="card-title">{product.name}</h6>
                            <p className="text-success fw-bold">LKR {product.price}</p>
                            <span className={`badge ${product.status === 'instock' ? 'bg-success' : 'bg-danger'}`}>
                              {product.status}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {products.length > 6 && (
                    <div className="text-center mt-3">
                      <a href="/dashboard/products" className="btn btn-primary">
                        View All {products.length} Products
                      </a>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {activeTab === 'categories' && (
            <div className="tab-pane fade show active">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0"><i className="bi bi-tags me-2"></i>Categories</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {categories.map((category, index) => (
                      <div key={index} className="col-md-3">
                        <div className="card border text-center">
                          <div className="card-body">
                            <i className="bi bi-tag display-4 text-success mb-3"></i>
                            <h6 className="card-title">{category.name}</h6>
                            <p className="text-muted small">Products: {products.filter(p => p.category === category.name).length}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'orders' && (
            <div className="tab-pane fade show active">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-info text-white">
                  <h5 className="mb-0"><i className="bi bi-cart-check me-2"></i>Recent Orders</h5>
                </div>
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Order ID</th>
                          <th>Customer</th>
                          <th>Total</th>
                          <th>Status</th>
                          <th>Date</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orders.slice(0, 10).map((order, index) => (
                          <tr key={index}>
                            <td><span className="badge bg-secondary">{order._id?.slice(-8) || `ORD${index + 1}`}</span></td>
                            <td>{order.customerInfo?.name || 'N/A'}</td>
                            <td className="fw-bold text-success">LKR {order.total?.toFixed(2) || '0.00'}</td>
                            <td>
                              <span className={`badge ${
                                order.status === 'delivered' ? 'bg-success' :
                                order.status === 'shipped' ? 'bg-info' :
                                order.status === 'confirmed' ? 'bg-primary' : 'bg-warning'
                              }`}>
                                {order.status || 'pending'}
                              </span>
                            </td>
                            <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'customers' && (
            <div className="tab-pane fade show active">
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0"><i className="bi bi-people me-2"></i>Customers</h5>
                </div>
                <div className="card-body">
                  <div className="row g-3">
                    {customers.slice(0, 8).map((customer, index) => (
                      <div key={index} className="col-md-3">
                        <div className="card border">
                          <div className="card-body text-center">
                            <i className="bi bi-person-circle display-4 text-primary mb-2"></i>
                            <h6 className="card-title">{customer.name || 'Customer'}</h6>
                            <p className="text-muted small">{customer.email || 'No email'}</p>
                            <p className="text-muted small">{customer.country || 'No location'}</p>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {customers.length > 8 && (
                    <div className="text-center mt-3">
                      <span className="text-muted">Showing 8 of {customers.length} customers</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}