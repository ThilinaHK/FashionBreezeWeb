'use client';

import { useState, useEffect } from 'react';
import { Product, Category, Order } from '../types';

interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  size?: string;
}

export default function DashboardPage() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [banners, setBanners] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const [deleteLoading, setDeleteLoading] = useState<string | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      const userData = localStorage.getItem('adminUser');
      
      if (loggedIn && userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        loadData();
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  const loadData = async () => {
    setSearchLoading(true);
    try {
      const [productsRes, categoriesRes, ordersRes, bannersRes, customersRes] = await Promise.all([
        fetch('/api/products'),
        fetch('/api/categories'),
        fetch('/api/orders'),
        fetch('/api/banners'),
        fetch('/api/customers')
      ]);
      
      const [productsData, categoriesData, ordersData, bannersData, customersData] = await Promise.all([
        productsRes.json(),
        categoriesRes.json(),
        ordersRes.json(),
        bannersRes.json(),
        customersRes.json()
      ]);
      
      setProducts(productsData);
      setCategories(categoriesData);
      setOrders(ordersData);
      setBanners(bannersData);
      setCustomers(customersData);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setSearchLoading(false);
    }
  };

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 3000);
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

        <ul className="nav nav-pills mb-4" role="tablist">
          <li className="nav-item" role="presentation">
            <button 
              className={`nav-link ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => setActiveTab('overview')}
            >
              <i className="bi bi-house me-2"></i>Overview
            </button>
          </li>
          <li className="nav-item" role="presentation">
            <a href="/admin-dashboard" className="nav-link text-success">
              <i className="bi bi-speedometer2 me-2"></i>Full Dashboard
            </a>
          </li>
        </ul>

        {activeTab === 'overview' && (
          <div className="row g-4">
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
        )}

        {toast && (
          <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show position-fixed`} 
               style={{top: '20px', right: '20px', zIndex: 1050}} role="alert">
            <i className={`bi ${toast.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
            {toast.message}
            <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
          </div>
        )}
      </div>
    </div>
  );
}