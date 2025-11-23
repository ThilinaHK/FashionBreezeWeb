'use client';

import { useState, useEffect } from 'react';

export default function ReportsPage() {
  const [activeTab, setActiveTab] = useState('sales');
  const [loading, setLoading] = useState(false);
  const [salesData, setSalesData] = useState<any>(null);
  const [productsData, setProductsData] = useState<any>(null);
  const [usersData, setUsersData] = useState<any>(null);
  const [ordersData, setOrdersData] = useState<any>(null);

  useEffect(() => {
    loadReports();
  }, [activeTab]);

  const loadReports = async () => {
    setLoading(true);
    try {
      switch (activeTab) {
        case 'sales':
          const salesRes = await fetch('/api/analytics/sales');
          if (salesRes.ok) setSalesData(await salesRes.json());
          break;
        case 'products':
          const productsRes = await fetch('/api/analytics/top-products');
          if (productsRes.ok) setProductsData(await productsRes.json());
          break;
        case 'users':
          const usersRes = await fetch('/api/reports/user-activity');
          if (usersRes.ok) setUsersData(await usersRes.json());
          break;
        case 'orders':
          const ordersRes = await fetch('/api/reports/orders');
          if (ordersRes.ok) setOrdersData(await ordersRes.json());
          break;
      }
    } catch (error) {
      console.error('Error loading reports:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Reports & Analytics</h2>
        <button className="btn btn-primary" onClick={loadReports}>
          <i className="bi bi-arrow-clockwise me-2"></i>Refresh
        </button>
      </div>

      <ul className="nav nav-tabs mb-4">
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => setActiveTab('sales')}>
            <i className="bi bi-graph-up me-2"></i>Sales Report
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
            <i className="bi bi-box me-2"></i>Products Report
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
            <i className="bi bi-receipt me-2"></i>Orders Report
          </button>
        </li>
        <li className="nav-item">
          <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
            <i className="bi bi-people me-2"></i>User Activity
          </button>
        </li>
      </ul>

      {loading && (
        <div className="text-center py-5">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      )}

      {activeTab === 'sales' && salesData && (
        <div className="row g-4">
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Total Sales</h5>
                <h3 className="text-success">₹{salesData.totalSales?.toLocaleString() || 0}</h3>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card text-center">
              <div className="card-body">
                <h5 className="card-title">Total Orders</h5>
                <h3 className="text-primary">{salesData.totalOrders || 0}</h3>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'products' && productsData && (
        <div className="card">
          <div className="card-header">
            <h5>Top Products</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>Product</th>
                    <th>Category</th>
                    <th>Stock</th>
                    <th>Status</th>
                  </tr>
                </thead>
                <tbody>
                  {productsData.map((product: any) => (
                    <tr key={product._id}>
                      <td>{product.name}</td>
                      <td>{typeof product.category === 'string' ? product.category : product.category?.name}</td>
                      <td>{product.totalStock || 0}</td>
                      <td>
                        <span className={`badge ${product.status === 'active' ? 'bg-success' : 'bg-danger'}`}>
                          {product.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'orders' && ordersData && (
        <div className="row g-4">
          <div className="col-md-6">
            <div className="card">
              <div className="card-header">
                <h5>Order Status Summary</h5>
              </div>
              <div className="card-body">
                {ordersData.statusSummary?.map((status: any) => (
                  <div key={status._id} className="d-flex justify-content-between mb-2">
                    <span className="text-capitalize">{status._id}</span>
                    <span className="badge bg-primary">{status.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'users' && usersData && (
        <div className="card">
          <div className="card-header">
            <h5>User Activity Report</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table">
                <thead>
                  <tr>
                    <th>User</th>
                    <th>Role</th>
                    <th>Products Created</th>
                    <th>Total Activities</th>
                  </tr>
                </thead>
                <tbody>
                  {usersData.map((user: any) => (
                    <tr key={user.user.id}>
                      <td>{user.user.username}</td>
                      <td>
                        <span className="badge bg-info">{user.user.role}</span>
                      </td>
                      <td>{user.stats.productsCreated}</td>
                      <td>
                        <span className="badge bg-primary">{user.stats.totalActivities}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}