'use client';

import { useState, useEffect } from 'react';
interface Customer {
  name: string;
  email: string;
  phone: string;
  country: string;
  address?: {
    line1: string;
    line2?: string;
    line3?: string;
  };
}

export default function ProfilePage() {
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: { line1: '', line2: '', line3: '' }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('userRegistered') === 'true';
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      setIsRegistered(registered);
      
      if (registered && userId) {
        try {
          const userResponse = await fetch('/api/auth/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ email: userEmail })
          });
          const userData = await userResponse.json();
          if (userData.success) {
            setCustomer(userData.user);
            setFormData({
              name: userData.user.name || '',
              email: userData.user.email || '',
              phone: userData.user.phone || '',
              country: userData.user.country || '',
              address: {
                line1: userData.user.address?.line1 || '',
                line2: userData.user.address?.line2 || '',
                line3: userData.user.address?.line3 || ''
              }
            });
          }
          
          const ordersResponse = await fetch(`/api/orders?userId=${userId}`);
          const ordersData = await ordersResponse.json();
          setOrders(Array.isArray(ordersData) ? ordersData : []);
        } catch (error) {
          console.error('Error loading profile:', error);
        }
      }
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const verifyOrder = async (orderId: string) => {
    setVerifyingOrder(orderId);
    try {
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.success) {
        loadProfile();
        if (data.unavailableCount > 0) {
          alert(`${data.unavailableCount} items are no longer available`);
        } else {
          alert('All items are available!');
        }
      }
    } catch (error) {
      alert('Failed to verify order');
    } finally {
      setVerifyingOrder(null);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveProfile = async () => {
    setUpdateLoading(true);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          ...formData
        })
      });
      
      if (response.ok) {
        setCustomer({ ...customer, ...formData });
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        alert('Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === '7days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === '30days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === '90days') {
        filterDate.setDate(now.getDate() - 90);
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
    }
    
    return filtered;
  };

  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders();
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filtered.slice(startIndex, startIndex + ordersPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredOrders().length / ordersPerPage);
  };

  if (!isRegistered) {
    return (
      <div className="profile-page">
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
            <div className="col-lg-6 text-center">
              <i className="bi bi-person-x display-1 text-muted mb-4"></i>
              <h2 className="mb-3">Not Registered</h2>
              <p className="lead mb-4">You need to register first to view your profile.</p>
              <a href="/register" className="btn btn-primary btn-lg">
                <i className="bi bi-person-plus me-2"></i>Register Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'var(--gradient-primary)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn btn-outline-light">
              <i className="bi bi-arrow-left me-2"></i>Back to Shop
            </a>
            <button onClick={logout} className="btn btn-outline-danger">
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-lg-8">
            <div className="text-center mb-5">
              <h1 className="display-4 fw-bold mb-3">My Profile</h1>
              <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
            </div>

            {customer && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-light d-flex justify-content-between align-items-center">
                  <h5 className="mb-0"><i className="bi bi-person-circle me-2"></i>Personal Information</h5>
                  <div>
                    {editMode ? (
                      <>
                        <button className="btn btn-success btn-sm me-2" onClick={saveProfile} disabled={updateLoading}>
                          {updateLoading ? (
                            <><i className="bi bi-hourglass-split me-1"></i>Saving...</>
                          ) : (
                            <><i className="bi bi-check me-1"></i>Save</>
                          )}
                        </button>
                        <button className="btn btn-secondary btn-sm" onClick={toggleEditMode}>
                          <i className="bi bi-x me-1"></i>Cancel
                        </button>
                      </>
                    ) : (
                      <button className="btn btn-primary btn-sm" onClick={toggleEditMode}>
                        <i className="bi bi-pencil me-1"></i>Edit Profile
                      </button>
                    )}
                  </div>
                </div>
                <div className="card-body p-5">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold"><i className="bi bi-person-fill text-primary me-2"></i>Full Name</label>
                      {editMode ? (
                        <input 
                          type="text" 
                          className="form-control" 
                          value={formData.name}
                          onChange={(e) => setFormData({...formData, name: e.target.value})}
                        />
                      ) : (
                        <p className="text-muted">{customer.name || 'N/A'}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold"><i className="bi bi-envelope-fill text-primary me-2"></i>Email Address</label>
                      {editMode ? (
                        <input 
                          type="email" 
                          className="form-control" 
                          value={formData.email}
                          onChange={(e) => setFormData({...formData, email: e.target.value})}
                        />
                      ) : (
                        <p className="text-muted">{customer.email || 'N/A'}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold"><i className="bi bi-telephone-fill text-primary me-2"></i>Phone Number</label>
                      {editMode ? (
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={formData.phone}
                          onChange={(e) => setFormData({...formData, phone: e.target.value})}
                        />
                      ) : (
                        <p className="text-muted">{customer.phone || 'N/A'}</p>
                      )}
                    </div>
                    <div className="col-md-6">
                      <label className="form-label fw-bold"><i className="bi bi-globe text-primary me-2"></i>Country</label>
                      {editMode ? (
                        <input 
                          type="text" 
                          className="form-control" 
                          value={formData.country}
                          onChange={(e) => setFormData({...formData, country: e.target.value})}
                        />
                      ) : (
                        <p className="text-muted">{customer.country || 'N/A'}</p>
                      )}
                    </div>
                    <div className="col-12">
                      <label className="form-label fw-bold"><i className="bi bi-geo-alt-fill text-primary me-2"></i>Delivery Address</label>
                      {editMode ? (
                        <div>
                          <input 
                            type="text" 
                            className="form-control mb-2" 
                            placeholder="Address Line 1"
                            value={formData.address.line1}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, line1: e.target.value}})}
                          />
                          <input 
                            type="text" 
                            className="form-control mb-2" 
                            placeholder="Address Line 2 (Optional)"
                            value={formData.address.line2}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, line2: e.target.value}})}
                          />
                          <input 
                            type="text" 
                            className="form-control" 
                            placeholder="Address Line 3 (Optional)"
                            value={formData.address.line3}
                            onChange={(e) => setFormData({...formData, address: {...formData.address, line3: e.target.value}})}
                          />
                        </div>
                      ) : (
                        <div className="text-muted">
                          {customer.address?.line1 ? (
                            <>
                              {customer.address.line1}<br />
                              {customer.address.line2 && <>{customer.address.line2}<br /></>}
                              {customer.address.line3 && <>{customer.address.line3}<br /></>}
                            </>
                          ) : 'N/A'}
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

            <div className="card border-0 shadow-sm mt-4">
              <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
                <h5 className="mb-0"><i className="bi bi-clock-history me-2"></i>Order History</h5>
                <span className="badge bg-light text-dark">{getFilteredOrders().length} orders</span>
              </div>
              <div className="card-body">
                <div className="row mb-3">
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Filter by Status</label>
                    <select className="form-select form-select-sm" value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label small fw-bold">Filter by Date</label>
                    <select className="form-select form-select-sm" value={dateFilter} onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}}>
                      <option value="all">All Time</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                    </select>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button className="btn btn-outline-secondary btn-sm" onClick={() => {setStatusFilter('all'); setDateFilter('all'); setCurrentPage(1);}}>
                      <i className="bi bi-arrow-clockwise me-1"></i>Reset Filters
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                    <p className="text-muted">No orders found</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Order ID</th>
                            <th>Date</th>
                            <th>Items</th>
                            <th>Total</th>
                            <th>Status</th>
                            <th>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPaginatedOrders().map((order, index) => (
                            <tr key={order._id || index}>
                              <td><span className="badge bg-secondary">{order._id?.slice(-8) || `ORD${index + 1}`}</span></td>
                              <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                              <td>
                                <div className="d-flex flex-wrap gap-2">
                                  {order.items?.slice(0, 3).map((item: any, i: number) => (
                                    <div key={i} className="d-flex align-items-center bg-light rounded p-1" style={{maxWidth: '150px'}}>
                                      {item.image && (
                                        <img src={item.image} alt={item.name} className="me-1 rounded" style={{width: '25px', height: '25px', objectFit: 'cover'}} />
                                      )}
                                      <span className="small text-truncate" title={`${item.name} (${item.size}) x${item.quantity}`}>
                                        {item.name?.substring(0, 8)}...
                                      </span>
                                    </div>
                                  ))}
                                  {order.items?.length > 3 && (
                                    <span className="badge bg-secondary align-self-center">+{order.items.length - 3}</span>
                                  )}
                                </div>
                              </td>
                              <td className="fw-bold text-success">LKR {order.total?.toFixed(2) || '0.00'}</td>
                              <td>
                                <span className={`badge ${
                                  order.status === 'confirmed' ? 'bg-success' :
                                  order.status === 'pending' ? 'bg-warning' :
                                  order.status === 'shipped' ? 'bg-info' :
                                  order.status === 'delivered' ? 'bg-primary' : 'bg-secondary'
                                }`}>
                                  {order.status || 'pending'}
                                </span>
                              </td>
                              <td>
                                <div className="d-flex gap-1">
                                  <button className="btn btn-sm btn-outline-primary" onClick={() => viewOrderDetails(order)}>
                                    <i className="bi bi-eye me-1"></i>View
                                  </button>
                                  <button className="btn btn-sm btn-outline-warning" onClick={() => verifyOrder(order._id)} disabled={verifyingOrder === order._id}>
                                    {verifyingOrder === order._id ? (
                                      <div className="spinner-border spinner-border-sm" role="status"></div>
                                    ) : (
                                      <><i className="bi bi-check-circle me-1"></i>Verify</>
                                    )}
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {getTotalPages() > 1 && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                              <i className="bi bi-chevron-left"></i>
                            </button>
                          </li>
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(page)}>
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === getTotalPages() ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === getTotalPages()}>
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                        <div className="text-center small text-muted">
                          Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, getFilteredOrders().length)} of {getFilteredOrders().length} orders
                        </div>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {showOrderModal && selectedOrder && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-receipt me-2"></i>Order Details - {selectedOrder._id?.slice(-8) || 'N/A'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={closeOrderModal}></button>
              </div>
              <div className="modal-body">
                <div className="row mb-4">
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Order Information</h6>
                    <p><strong>Order ID:</strong> {selectedOrder._id || 'N/A'}</p>
                    <p><strong>Date:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> 
                      <span className={`badge ms-2 ${
                        selectedOrder.status === 'confirmed' ? 'bg-success' :
                        selectedOrder.status === 'pending' ? 'bg-warning' :
                        selectedOrder.status === 'shipped' ? 'bg-info' :
                        selectedOrder.status === 'delivered' ? 'bg-primary' : 'bg-secondary'
                      }`}>
                        {selectedOrder.status || 'pending'}
                      </span>
                    </p>
                  </div>
                  <div className="col-md-6">
                    <h6 className="fw-bold mb-3">Customer Information</h6>
                    <p><strong>Name:</strong> {selectedOrder.customerInfo?.name || 'N/A'}</p>
                    <p><strong>Email:</strong> {selectedOrder.customerInfo?.email || 'N/A'}</p>
                    <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                  </div>
                </div>
                
                <h6 className="fw-bold mb-3">Order Items</h6>
                <div className="table-responsive">
                  <table className="table table-bordered">
                    <thead className="table-light">
                      <tr>
                        <th>Product</th>
                        <th>Size</th>
                        <th>Quantity</th>
                        <th>Price</th>
                        <th>Total</th>
                      </tr>
                    </thead>
                    <tbody>
                      {selectedOrder.items?.map((item: any, index: number) => (
                        <tr key={index}>
                          <td>
                            <div className="d-flex align-items-center">
                              {item.image && (
                                <img src={item.image} alt={item.name} className="me-2 rounded" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                              )}
                              <div>
                                <strong>{item.name || 'N/A'}</strong><br />
                                <small className="text-muted">{item.code || 'N/A'}</small>
                              </div>
                            </div>
                          </td>
                          <td>{item.size || 'N/A'}</td>
                          <td>{item.quantity || 0}</td>
                          <td>LKR {item.price?.toFixed(2) || '0.00'}</td>
                          <td className="fw-bold">LKR {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                        </tr>
                      )) || (
                        <tr>
                          <td colSpan={5} className="text-center text-muted">No items found</td>
                        </tr>
                      )}
                    </tbody>
                    <tfoot className="table-light">
                      <tr>
                        <th colSpan={4} className="text-end">Total Amount:</th>
                        <th className="text-success">LKR {selectedOrder.total?.toFixed(2) || '0.00'}</th>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={closeOrderModal}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}