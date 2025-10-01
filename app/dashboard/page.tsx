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
    cost: 0,
    vat: 0,
    price: 0,
    category: '',
    image: '',
    status: 'instock'
  });
  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [deletingProduct, setDeletingProduct] = useState<number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [updatingCustomer, setUpdatingCustomer] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);

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
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products');
      const products = await response.json();
      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch('/api/categories');
      const categories = await response.json();
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers');
      const customers = await response.json();
      setCustomers(Array.isArray(customers) ? customers : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      setOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      if (response.ok) {
        // Update local state immediately
        const updatedOrder = orders.find(order => order._id === orderId);
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        
        // Send notification to customer
        if (updatedOrder?.customerInfo?.email) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: updatedOrder.customerInfo.email,
              orderNumber: updatedOrder.orderNumber || orderId.slice(-8),
              status: status,
              customerName: updatedOrder.customerInfo.name
            })
          });
        }
        
        setToast({message: `Order status updated to ${status}. Customer notified!`, type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setToast({message: 'Failed to update order status', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingOrder(null);
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
        cost: product.cost || 0,
        vat: product.vat || 0,
        price: product.price,
        category: product.category,
        image: product.image,
        status: product.status
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: '', cost: 0, vat: 0, price: 0, category: '', image: '', status: 'instock' });
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
        const result = await response.json();
        // Update products immediately without reload
        if (editingProduct) {
          setProducts(products.map(p => 
            (p.id === editingProduct.id || p._id === editingProduct._id) ? { ...p, ...formData } : p
          ));
        } else {
          setProducts([...products, { id: result.id || result._id || Date.now(), ...formData }]);
        }
        closeModal();
        setToast({message: editingProduct ? 'Product updated successfully!' : 'Product created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving product:', error);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (id: number) => {
    if (confirm('Are you sure you want to delete this product?')) {
      setDeletingProduct(id);
      try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        if (response.ok) {
          setProducts(products.filter(p => p.id !== id && p._id !== id));
          setToast({message: 'Product deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setToast({message: 'Failed to delete product', type: 'error'});
      } finally {
        setDeletingProduct(null);
        setTimeout(() => setToast(null), 3000);
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
    setSavingCategory(true);
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const body = editingCategory ? { id: editingCategory._id || editingCategory.id, name: categoryName } : { name: categoryName };
      
      console.log('Saving category:', { method, body });
      
      const response = await fetch('/api/categories', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        const result = await response.json();
        console.log('Category save result:', result);
        
        // Update categories immediately
        if (editingCategory) {
          setCategories(categories.map(cat => {
            const catId = cat._id || cat.id;
            const editId = editingCategory._id || editingCategory.id;
            return catId === editId ? { ...cat, name: categoryName } : cat;
          }));
        } else {
          const newCategory = { 
            _id: result._id || result.id || Date.now().toString(), 
            id: result.id || result._id || Date.now(), 
            name: categoryName, 
            productCount: 0 
          };
          setCategories([...categories, newCategory]);
        }
        
        // Reload categories from server to ensure sync
        await loadCategories();
        
        setShowCategoryModal(false);
        setCategoryName('');
        setEditingCategory(null);
        setToast({message: editingCategory ? 'Category updated successfully!' : 'Category created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        console.error('Category save failed:', errorData);
        setToast({message: 'Failed to save category', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setToast({message: 'Failed to save category', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingCategory(false);
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

  const updateCustomerStatus = async (customerId: string, status: string) => {
    setUpdatingCustomer(customerId);
    try {
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status })
      });
      if (response.ok) {
        setCustomers(customers.map(customer => 
          (customer._id === customerId || customer.id === customerId) ? { ...customer, status } : customer
        ));
        setToast({message: 'Customer status updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      setToast({message: 'Failed to update customer status', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingCustomer(null);
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
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search products by name, code, or category..."
                  value={productFilter}
                  onChange={(e) => setProductFilter(e.target.value)}
                />
                {productFilter && (
                  <small className="text-muted mt-1">
                    {products.filter(p => 
                      p.name.toLowerCase().includes(productFilter.toLowerCase()) ||
                      p.code.toLowerCase().includes(productFilter.toLowerCase()) ||
                      p.category.toLowerCase().includes(productFilter.toLowerCase())
                    ).length} results found
                  </small>
                )}
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Category</th>
                      <th>Cost</th>
                      <th>Price</th>
                      <th>Profit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.filter(product => 
                      product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
                      product.code.toLowerCase().includes(productFilter.toLowerCase()) ||
                      product.category.toLowerCase().includes(productFilter.toLowerCase())
                    ).map(product => (
                      <tr key={product.id}>
                        <td>
                          <img src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} className="rounded" />
                        </td>
                        <td className="fw-bold">{product.name}</td>
                        <td><span className="badge bg-secondary">{product.code}</span></td>
                        <td><span className="badge bg-info">{product.category}</span></td>
                        <td className="text-danger">LKR {product.cost || 0}</td>
                        <td className="fw-bold text-success">LKR {product.price}</td>
                        <td className="fw-bold text-primary">LKR {((product.price || 0) - (product.cost || 0) - (product.vat || 0)).toFixed(2)}</td>
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
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product.id)} disabled={deletingProduct === product.id}>
                              {deletingProduct === product.id ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Deleting...</span>
                                </div>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
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
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search categories by name..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
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
                    {loadingCategories ? (
                      <tr>
                        <td colSpan={4} className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.filter(category => 
                        category.name.toLowerCase().includes(categoryFilter.toLowerCase())
                      ).map(category => (
                      <tr key={category.id || category._id}>
                        <td>{category.id || category._id}</td>
                        <td className="fw-bold">{category.name}</td>
                        <td><span className="badge bg-info">{category.productCount || 0}</span></td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openCategoryModal(category)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(category.id || category._id)}>
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
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search customers by name, email, or country..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Country</th>
                      <th>Address</th>
                      <th>Registered</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCustomers ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      customers.filter(customer => 
                      customer.name.toLowerCase().includes(customerFilter.toLowerCase()) ||
                      customer.email.toLowerCase().includes(customerFilter.toLowerCase()) ||
                      customer.country.toLowerCase().includes(customerFilter.toLowerCase()) ||
                      (customer.address?.line1 || '').toLowerCase().includes(customerFilter.toLowerCase())
                    ).map((customer, index) => (
                      <tr key={customer._id || index}>
                        <td><span className="badge bg-secondary">{customer._id?.slice(-8) || customer.id}</span></td>
                        <td className="fw-bold">{customer.name || 'N/A'}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td>{customer.phone || 'N/A'}</td>
                        <td>{customer.country || 'N/A'}</td>
                        <td>
                          {customer.address ? (
                            <div className="small">
                              {customer.address.line1}<br/>
                              {customer.address.line2 && <>{customer.address.line2}<br/></>}
                              {customer.address.line3}
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <select 
                            className="form-select form-select-sm" 
                            value={customer.status || 'active'}
                            onChange={(e) => updateCustomerStatus(customer._id || customer.id, e.target.value)}
                          >
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                          </select>
                        </td>
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
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search orders by customer name or order ID..."
                  value={orderFilter}
                  onChange={(e) => setOrderFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.filter(order => 
                      (order.customerInfo?.name || '').toLowerCase().includes(orderFilter.toLowerCase()) ||
                      (order._id || '').toLowerCase().includes(orderFilter.toLowerCase())
                    ).map((order, index) => (
                      <tr key={order._id || index}>
                        <td><span className="badge bg-secondary">{order.orderNumber || order._id?.slice(-8) || `FB${index + 1}`}</span></td>
                        <td>{order.customerInfo?.name || 'N/A'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {order.items?.slice(0, 3).map((item: any, i: number) => (
                              <span key={i} className="badge bg-info" title={`${item.name} (${item.code})`}>
                                {item.code || 'N/A'}
                              </span>
                            ))}
                            {order.items?.length > 3 && (
                              <span className="badge bg-secondary">+{order.items.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="fw-bold text-success">LKR {order.total?.toFixed(2) || '0.00'}</td>
                        <td>
                          <select 
                            className="form-select form-select-sm" 
                            value={order.status || 'pending'}
                            onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                            disabled={updatingOrder === order._id}
                          >
                            <option value="pending">Pending</option>
                            <option value="confirmed">Confirmed</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                            <option value="cancelled">Cancelled</option>
                          </select>
                          {updatingOrder === order._id && (
                            <div className="spinner-border spinner-border-sm mt-1" role="status">
                              <span className="visually-hidden">Updating...</span>
                            </div>
                          )}
                        </td>
                        <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-info" onClick={() => {setSelectedOrder(order); setShowOrderModal(true);}}>
                            <i className="bi bi-eye"></i> View
                          </button>
                        </td>
                      </tr>
                      ))
                    )}
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
                      <label className="form-label">Cost Price</label>
                      <input type="number" className="form-control" value={formData.cost} onChange={(e) => setFormData({...formData, cost: +e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">VAT Amount</label>
                      <input type="number" className="form-control" value={formData.vat} onChange={(e) => setFormData({...formData, vat: +e.target.value})} />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Selling Price</label>
                      <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: +e.target.value})} required />
                    </div>
                    <div className="mb-3">
                      <div className="alert alert-info">
                        <strong>Profit: LKR {(formData.price - formData.cost - formData.vat).toFixed(2)}</strong>
                      </div>
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Category</label>
                      <select className="form-control" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})} required>
                        <option value="">Select Category</option>
                        {categories.map(category => (
                          <option key={category.id || category._id} value={category.name}>
                            {category.name}
                          </option>
                        ))}
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
                    <button type="submit" className="btn btn-success" disabled={savingCategory}>
                      {savingCategory ? (
                        <><i className="bi bi-hourglass-split me-1"></i>Saving...</>
                      ) : (
                        editingCategory ? 'Update' : 'Create'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2"></i>Order Details - {selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="fw-bold">Order Information</h6>
                      <p><strong>Order Number:</strong> {selectedOrder.orderNumber || 'N/A'}</p>
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
                      <h6 className="fw-bold">Customer Information</h6>
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
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Toast Notification */}
        {toast && (
          <div className={`position-fixed top-0 end-0 m-3`} style={{zIndex: 9999}}>
            <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
              <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
              {toast.message}
              <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}