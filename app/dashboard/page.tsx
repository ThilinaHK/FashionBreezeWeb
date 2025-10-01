'use client';

import { useState, useEffect } from 'react';
import { Product } from '../types';

export default function DashboardPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: 0,
    category: '',
    image: '',
    status: 'instock'
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      setIsLoggedIn(loggedIn);
      
      if (loggedIn) {
        loadProducts();
        loadCategories();
        loadCustomers();
        loadOrders();
      }
    }
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      setCategories(categories);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const loadCustomers = async () => {
    try {
      const response = await fetch('/api/customers');
      const customers = await response.json();
      setCustomers(customers);
    } catch (error) {
      console.error('Error loading customers:', error);
    }
  };

  const loadOrders = async () => {
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      setOrders(orders);
    } catch (error) {
      console.error('Error loading orders:', error);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    try {
      await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      loadOrders();
    } catch (error) {
      console.error('Error updating order status:', error);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminLoggedIn');
      window.location.href = '/login';
    }
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        price: product.price,
        category: product.category,
        image: product.image,
        status: product.status
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: '', price: 0, category: '', image: '', status: 'instock' });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      const url = editingProduct ? `/api/products/${editingProduct.id}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });
      
      if (response.ok) {
        await loadProducts();
        closeModal();
        alert(editingProduct ? 'Product updated successfully!' : 'Product created successfully!');
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      try {
        await fetch(`/api/products/${id}`, { method: 'DELETE' });
        loadProducts();
      } catch (error) {
        console.error('Error deleting product:', error);
      }
    }
  };

  const openCategoryModal = (category?: any) => {
    setEditingCategory(category || null);
    setCategoryName(category?.name || '');
    setShowCategoryModal(true);
  };

  const saveCategoryHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory ? { id: editingCategory.id, name: categoryName } : { name: categoryName };
      
      await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      loadCategories();
      setShowCategoryModal(false);
      setCategoryName('');
    } catch (error) {
      console.error('Error saving category:', error);
    }
  };

  const deleteCategory = async (id: number) => {
    if (confirm('Delete this category?')) {
      try {
        await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        loadCategories();
      } catch (error) {
        console.error('Error deleting category:', error);
      }
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
            <ul className="nav nav-tabs">
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                  <i className="bi bi-box-seam me-2"></i>Products
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                  <i className="bi bi-tags me-2"></i>Categories
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                  <i className="bi bi-people me-2"></i>Customers
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                  <i className="bi bi-cart-check me-2"></i>Orders
                </button>
              </li>
            </ul>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-box-seam display-4 text-primary mb-3"></i>
                <h3 className="fw-bold">{products.length}</h3>
                <p className="text-muted mb-0">Total Products</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-people display-4 text-info mb-3"></i>
                <h3 className="fw-bold">{customers.length}</h3>
                <p className="text-muted mb-0">Customers</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-cart-check display-4 text-warning mb-3"></i>
                <h3 className="fw-bold">{orders.length}</h3>
                <p className="text-muted mb-0">Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-tags display-4 text-success mb-3"></i>
                <h3 className="fw-bold">{categories.length}</h3>
                <p className="text-muted mb-0">Categories</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'products' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-list me-2"></i>Product Management</h5>
              <button className="btn btn-light" onClick={() => openModal()}>
                <i className="bi bi-plus-circle me-2"></i>Add Product
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} className="rounded" />
                        </td>
                        <td className="fw-bold">{product.name}</td>
                        <td><span className="badge bg-secondary">{product.code}</span></td>
                        <td><span className="badge bg-info">{product.category}</span></td>
                        <td className="fw-bold text-success">LKR {product.price}</td>
                        <td>
                          <span className={`badge ${product.status === 'instock' ? 'bg-success' : 'bg-danger'}`}>
                            {product.status === 'instock' ? 'In Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openModal(product)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product.id)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-tags me-2"></i>Category Management</h5>
              <button className="btn btn-light" onClick={() => openCategoryModal()}>
                <i className="bi bi-plus-circle me-2"></i>Add Category
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Products</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => (
                      <tr key={category.id}>
                        <td>{category.id}</td>
                        <td className="fw-bold">{category.name}</td>
                        <td><span className="badge bg-info">{category.productCount}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openCategoryModal(category)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(category.id)}>
                            <i className="bi bi-trash"></i>
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'customers' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-people me-2"></i>Customer Management</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Country</th>
                      <th>Registered</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers.map((customer, index) => (
                      <tr key={customer._id || index}>
                        <td className="fw-bold">{customer.name}</td>
                        <td>{customer.email}</td>
                        <td>{customer.phone}</td>
                        <td>{customer.country}</td>
                        <td>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0"><i className="bi bi-cart-check me-2"></i>Order Management</h5>
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
                    {orders.map((order, index) => (
                      <tr key={order._id || index}>
                        <td><span className="badge bg-secondary">{order._id?.slice(-8) || `ORD${index + 1}`}</span></td>
                        <td>{order.customerInfo?.name || 'N/A'}</td>
                        <td className="fw-bold text-success">LKR {order.total?.toFixed(2) || '0.00'}</td>
                        <td>
                          <select 
                            className="form-select form-select-sm" 
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                        </td>
                        <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingProduct ? 'Edit Product' : 'Add Product'}</h5>
                  <button type="button" className="btn-close" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Name</label>
                      <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Code</label>
                      <input type="text" className="form-control" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Price</label>
                      <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: +e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select className="form-control" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                        <option value="">Select Category</option>
                        <option value="For Men">For Men</option>
                        <option value="For Women">For Women</option>
                        <option value="Kids">Kids</option>
                        <option value="Hair">Hair</option>
                        <option value="Fragrances">Fragrances</option>
                        <option value="Skin">Skin</option>
                        <option value="Home">Home</option>
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Image URL</label>
                      <input type="url" className="form-control" value={formData.image} onChange={(e) => setFormData({...formData, image: e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Status</label>
                      <select className="form-control" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})}>
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                      </select>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={closeModal}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? 'Saving...' : (editingProduct ? 'Update' : 'Create')}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                </div>
                <form onSubmit={saveCategoryHandler}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success">
                      {editingCategory ? 'Update' : 'Create'}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}