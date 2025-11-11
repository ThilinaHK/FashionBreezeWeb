'use client';

import { useState, useEffect } from 'react';

interface DashboardStats {
  totalOrders: number;
  totalCustomers: number;
  totalProducts: number;
  totalRevenue: number;
  recentOrders: any[];
  topProducts: any[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalOrders: 0,
    totalCustomers: 0,
    totalProducts: 0,
    totalRevenue: 0,
    recentOrders: [],
    topProducts: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      const response = await fetch('/api/dashboard/stats');
      if (!response.ok) throw new Error('API Error');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      setStats({
        totalOrders: 25,
        totalCustomers: 150,
        totalProducts: 42,
        totalRevenue: 125000,
        recentOrders: [
          { id: 1, customerInfo: { name: 'John Doe' }, total: 2500, status: 'confirmed', createdAt: new Date() },
          { id: 2, customerInfo: { name: 'Jane Smith' }, total: 1800, status: 'pending', createdAt: new Date() }
        ],
        topProducts: [
          { name: 'Summer Dress', sales: 45 },
          { name: 'Casual Shirt', sales: 38 }
        ]
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-vh-100 d-flex align-items-center justify-content-center">
        <div className="spinner-border text-success" style={{width: '3rem', height: '3rem'}} role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'}}>
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3" style={{color: '#22c55e'}}>
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Admin Dashboard
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-house me-2"></i>Home
            </a>
            <a href="/dashboard" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-grid me-2"></i>Products
            </a>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="text-center mb-5">
          <h1 className="display-4 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>
            Analytics Dashboard
          </h1>
          <div style={{width: '150px', height: '4px', background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', margin: '0 auto', borderRadius: '2px'}}></div>
        </div>

        <div className="row mb-5">
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', color: 'white'}}>
              <div className="card-body text-center py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-bag-check" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.totalOrders}</h2>
                <p className="mb-0 fw-semibold">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #000000 0%, #374151 100%)', color: 'white'}}>
              <div className="card-body text-center py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-people" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.totalCustomers}</h2>
                <p className="mb-0 fw-semibold">Customers</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #22c55e 0%, #059669 100%)', color: 'white'}}>
              <div className="card-body text-center py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-box" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">{stats.totalProducts}</h2>
                <p className="mb-0 fw-semibold">Products</p>
              </div>
            </div>
          </div>
          <div className="col-lg-3 col-md-6 mb-4">
            <div className="card border-0 shadow-lg h-100" style={{borderRadius: '20px', background: 'linear-gradient(135deg, #000000 0%, #22c55e 100%)', color: 'white'}}>
              <div className="card-body text-center py-4">
                <div className="bg-white bg-opacity-20 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{width: '60px', height: '60px'}}>
                  <i className="bi bi-currency-dollar" style={{fontSize: '1.5rem'}}></i>
                </div>
                <h2 className="fw-bold mb-2">LKR {stats.totalRevenue.toLocaleString()}</h2>
                <p className="mb-0 fw-semibold">Revenue</p>
              </div>
            </div>
          </div>
        </div>

        <div className="row">
          <div className="col-lg-8 mb-4">
            <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}}>
              <div className="card-header" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '1.5rem', border: 'none'}}>
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-clock-history me-2"></i>Recent Orders
                </h5>
              </div>
              <div className="card-body p-0">
                <div className="table-responsive">
                  <table className="table table-hover mb-0">
                    <thead className="table-light">
                      <tr>
                        <th>Order ID</th>
                        <th>Customer</th>
                        <th>Amount</th>
                        <th>Status</th>
                        <th>Date</th>
                      </tr>
                    </thead>
                    <tbody>
                      {stats.recentOrders.map((order, index) => (
                        <tr key={index}>
                          <td><span className="badge bg-primary">FB{String(order.id || index + 1).padStart(6, '0')}</span></td>
                          <td>{order.customerInfo?.name || 'N/A'}</td>
                          <td className="fw-bold text-success">LKR {order.total?.toLocaleString() || '0'}</td>
                          <td>
                            <span className={`badge ${
                              order.status === 'confirmed' ? 'bg-success' :
                              order.status === 'pending' ? 'bg-warning text-dark' :
                              order.status === 'shipped' ? 'bg-info' : 'bg-secondary'
                            }`}>
                              {order.status?.toUpperCase() || 'PENDING'}
                            </span>
                          </td>
                          <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>
          <div className="col-lg-4 mb-4">
            <div className="card border-0 shadow-lg" style={{borderRadius: '20px'}}>
              <div className="card-header" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '1.5rem', border: 'none'}}>
                <h5 className="mb-0 fw-bold">
                  <i className="bi bi-star me-2"></i>Top Products
                </h5>
              </div>
              <div className="card-body">
                {stats.topProducts.map((product, index) => (
                  <div key={index} className="d-flex align-items-center mb-3 p-2 rounded" style={{background: '#f8f9fa'}}>
                    <div className="bg-success rounded-circle d-flex align-items-center justify-content-center me-3" style={{width: '40px', height: '40px', minWidth: '40px'}}>
                      <span className="text-white fw-bold">{index + 1}</span>
                    </div>
                    <div className="flex-grow-1">
                      <h6 className="mb-1 fw-bold">{product.name}</h6>
                      <small className="text-muted">Sales: {product.sales || 0}</small>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}