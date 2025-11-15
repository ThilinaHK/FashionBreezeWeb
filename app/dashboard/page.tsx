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

  // Category form state
  const [categoryForm, setCategoryForm] = useState({ name: '', description: '', image: '' });
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Subcategory form state
  const [subcategoryForm, setSubcategoryForm] = useState({ name: '', description: '', categoryId: '' });
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);

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

  // Initialize Bootstrap dropdowns
  useEffect(() => {
    if (typeof window !== 'undefined' && window.bootstrap) {
      const dropdowns = document.querySelectorAll('.dropdown-toggle');
      dropdowns.forEach(dropdown => {
        new window.bootstrap.Dropdown(dropdown);
      });
    }
  }, [activeTab]);

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
            <a href="/admin-dashboard" className="btn btn-outline-success">
              <i className="bi bi-speedometer2 me-2"></i>Full Admin Dashboard
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

        {/* Quick Access to Full Dashboard */}
        <div className="alert alert-info d-flex justify-content-between align-items-center mb-4">
          <div>
            <i className="bi bi-info-circle me-2"></i>
            <strong>New!</strong> Access the comprehensive admin dashboard with advanced features
          </div>
          <a href="/admin-dashboard" className="btn btn-primary">
            <i className="bi bi-speedometer2 me-2"></i>Go to Full Admin Dashboard
          </a>
        </div>

        {/* Navigation Tabs */}
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
              className={`nav-link ${activeTab === 'subcategories' ? 'active' : ''}`}
              onClick={() => setActiveTab('subcategories')}
            >
              <i className="bi bi-tag me-2"></i>Subcategories
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
              className={`nav-link ${activeTab === 'banners' ? 'active' : ''}`}
              onClick={() => setActiveTab('banners')}
            >
              <i className="bi bi-images me-2"></i>Banners
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
          <li className="nav-item" role="presentation">
            <a href="/reports" className="nav-link text-info">
              <i className="bi bi-graph-up me-2"></i>Reports
            </a>
          </li>
          <li className="nav-item" role="presentation">
            <a href="/admin-dashboard" className="nav-link text-success">
              <i className="bi bi-speedometer2 me-2"></i>Full Dashboard
            </a>
          </li>
        </ul>

        {/* Tab Content */}
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
                  <h5 className="fw-bold">₹{orders.reduce((sum, order) => sum + (order.total || 0), 0).toLocaleString()}</h5>
                  <p className="mb-0">Total Revenue</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'products' && <ProductManagement />}
        {activeTab === 'categories' && <CategoryManagement />}
        {activeTab === 'subcategories' && <SubcategoryManagement />}
        {activeTab === 'orders' && <OrderManagement />}
        {activeTab === 'banners' && <BannerManagement />}
        {activeTab === 'customers' && <CustomerManagement />}

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

  // Product Management Component
  function ProductManagement() {
    const [showAddProduct, setShowAddProduct] = useState(false);
    const [productForm, setProductForm] = useState({
      name: '',
      code: '',
      price: 0,
      category: '',
      subcategory: '',
      images: ['', '', '', ''],
      sizes: { S: 0, M: 0, L: 0, XL: 0 },
      status: 'instock' as 'active' | 'inactive' | 'draft' | 'outofstock' | 'instock',
      rating: 4.0,
      reviewCount: 0,
      promoCode: '',
      discount: 0,
      originalPrice: 0,
      details: {
        color: '',
        brand: '',
        style: '',
        sleeveType: '',
        neckline: '',
        patternType: '',
        sleeveLength: '',
        fitType: '',
        fabric: '',
        material: '',
        composition: '',
        careInstructions: '',
        pockets: 'No',
        sheer: 'No'
      },
      specifications: {
        material: '',
        care: '',
        weight: '',
        origin: 'Sri Lanka'
      }
    });
    const [editingProduct, setEditingProduct] = useState<Product | null>(null);
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [productLoading, setProductLoading] = useState(false);
    const [deletingProductId, setDeletingProductId] = useState<string | null>(null);
    const [showRestockModal, setShowRestockModal] = useState(false);
    const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
    const [restockSizes, setRestockSizes] = useState({ S: 0, M: 0, L: 0, XL: 0 });

    const generateProductCode = () => {
      const timestamp = Date.now().toString().slice(-6);
      const random = Math.random().toString(36).substring(2, 5).toUpperCase();
      return `FB${timestamp}${random}`;
    };

    const handleImageUpload = async (file: File, index: number) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          const newImages = [...productForm.images];
          newImages[index] = base64;
          setProductForm({...productForm, images: newImages});
        };
        reader.readAsDataURL(file);
      }
    };

    const handleProductSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      
      // Validation
      if (!productForm.name.trim()) {
        showToast('Product name is required', 'error');
        return;
      }
      if (!productForm.images[0]) {
        showToast('At least one product image is required', 'error');
        return;
      }
      if (!productForm.category) {
        showToast('Category is required', 'error');
        return;
      }
      
      setProductLoading(true);
      try {
        const sizesArray = Object.entries(productForm.sizes).map(([size, stock]) => ({
          size,
          stock: Number(stock),
          price: productForm.price
        }));
        
        const productData = {
          ...productForm,
          image: productForm.images[0] || '',
          images: productForm.images.filter(img => img !== ''),
          sizes: sizesArray
        };
        
        const url = editingProduct ? `/api/products/${editingProduct._id || editingProduct.id}` : '/api/products';
        const method = editingProduct ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        });

        if (response.ok) {
          loadData();
          resetProductForm();
          showToast(editingProduct ? 'Product updated successfully!' : 'Product added successfully!', 'success');
        } else {
          const errorData = await response.json();
          showToast(errorData.error || 'Failed to save product', 'error');
        }
      } catch (error) {
        showToast('Error saving product', 'error');
      } finally {
        setProductLoading(false);
      }
    };

    const resetProductForm = () => {
      setProductForm({
        name: '',
        code: generateProductCode(),
        price: 0,
        category: '',
        subcategory: '',
        images: ['', '', '', ''],
        sizes: { S: 0, M: 0, L: 0, XL: 0 },
        status: 'instock',
        rating: 4.0,
        reviewCount: 0,
        promoCode: '',
        discount: 0,
        originalPrice: 0,
        details: {
          color: '',
          brand: '',
          style: '',
          sleeveType: '',
          neckline: '',
          patternType: '',
          sleeveLength: '',
          fitType: '',
          fabric: '',
          material: '',
          composition: '',
          careInstructions: '',
          pockets: 'No',
          sheer: 'No'
        },
        specifications: {
          material: '',
          care: '',
          weight: '',
          origin: 'Sri Lanka'
        }
      });
      setEditingProduct(null);
      setShowAddProduct(false);
      setImageFiles([]);
    };

    const startEditProduct = (product: Product) => {
      setEditingProduct(product);
      setProductForm({
        name: product.name,
        code: product.code,
        price: product.price,
        category: typeof product.category === 'string' ? product.category : product.category.name,
        subcategory: product.subcategory || '',
        images: Array.isArray(product.images) ? [...product.images, '', '', '', ''].slice(0, 4) : [product.image || '', '', '', ''],
        sizes: (() => {
          if (Array.isArray(product.sizes)) {
            const sizesObj = { S: 0, M: 0, L: 0, XL: 0 };
            product.sizes.forEach((sizeItem: any) => {
              if (sizesObj.hasOwnProperty(sizeItem.size)) {
                sizesObj[sizeItem.size as keyof typeof sizesObj] = sizeItem.stock || 0;
              }
            });
            return sizesObj;
          } else if (typeof product.sizes === 'object' && product.sizes && !Array.isArray(product.sizes)) {
            const sizes = product.sizes as { [key: string]: number };
            return {
              S: sizes.S || 0,
              M: sizes.M || 0,
              L: sizes.L || 0,
              XL: sizes.XL || 0
            };
          }
          return { S: 0, M: 0, L: 0, XL: 0 };
        })(),
        status: product.status,
        rating: typeof product.rating === 'number' ? product.rating : product.rating?.average || 4.0,
        reviewCount: product.reviewCount || 0,
        promoCode: product.promoCode || '',
        discount: product.discount || 0,
        originalPrice: product.originalPrice || product.price,
        details: (product as any).details || {
          color: '',
          brand: '',
          style: '',
          sleeveType: '',
          neckline: '',
          patternType: '',
          sleeveLength: '',
          fitType: '',
          fabric: '',
          material: '',
          composition: '',
          careInstructions: '',
          pockets: 'No',
          sheer: 'No'
        },
        specifications: (product as any).specifications || {
          material: '',
          care: '',
          weight: '',
          origin: 'Sri Lanka'
        }
      });
      setShowAddProduct(true);
    };

    const handleRestock = (product: Product) => {
      setRestockingProduct(product);
      setRestockSizes({ S: 0, M: 0, L: 0, XL: 0 });
      setShowRestockModal(true);
    };

    const submitRestock = async () => {
      if (!restockingProduct) return;
      
      setLoading(true);
      try {
        const response = await fetch('/api/products/restock', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ 
            productId: restockingProduct._id || restockingProduct.id, 
            sizes: restockSizes,
            sendEmail: true
          })
        });
        
        if (response.ok) {
          loadData();
          setShowRestockModal(false);
          showToast('Product restocked and customers notified!', 'success');
        } else {
          showToast('Failed to restock product', 'error');
        }
      } catch (error) {
        showToast('Error restocking product', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteProduct = async (product: Product) => {
      if (confirm(`Are you sure you want to delete "${product.name}"? This action cannot be undone.`)) {
        const productId = String(product._id || product.id);
        setDeletingProductId(productId);
        try {
          const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
          if (response.ok) {
            loadData();
            showToast('Product deleted successfully!', 'success');
          } else {
            const errorData = await response.json();
            showToast(errorData.error || 'Failed to delete product', 'error');
          }
        } catch (error) {
          showToast('Error deleting product', 'error');
        } finally {
          setDeletingProductId(null);
        }
      }
    };

    const startAddProduct = () => {
      resetProductForm();
      setProductForm(prev => ({...prev, code: generateProductCode()}));
      setShowAddProduct(true);
    };

    return (
      <div>
        {showAddProduct && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleProductSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={productForm.name}
                      onChange={(e) => setProductForm({...productForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Product Code (Auto-generated)</label>
                    <div className="input-group">
                      <input
                        type="text"
                        className="form-control"
                        value={productForm.code}
                        readOnly
                      />
                      <button type="button" className="btn btn-outline-secondary" onClick={() => setProductForm({...productForm, code: generateProductCode()})}>
                        <i className="bi bi-arrow-clockwise"></i>
                      </button>
                    </div>
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Price</label>
                    <div className="input-group">
                      <span className="input-group-text">₹</span>
                      <input
                        type="number"
                        className="form-control"
                        value={productForm.price}
                        onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                        required
                      />
                    </div>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Category</label>
                    <select
                      className="form-select"
                      value={productForm.category}
                      onChange={(e) => setProductForm({...productForm, category: e.target.value, subcategory: ''})}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat._id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="col-md-4 mb-3">
                    <label className="form-label">Subcategory</label>
                    <select
                      className="form-select"
                      value={productForm.subcategory}
                      onChange={(e) => setProductForm({...productForm, subcategory: e.target.value})}
                      disabled={!productForm.category}
                    >
                      <option value="">Select Subcategory</option>
                      {categories.find(cat => cat.name === productForm.category)?.subcategories?.map(sub => (
                        <option key={sub.slug} value={sub.name}>{sub.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="mb-3">
                  <label className="form-label">Product Images (Upload up to 4 images)</label>
                  <div className="row g-3">
                    {[0, 1, 2, 3].map((index) => (
                      <div key={index} className="col-md-3">
                        <div className="border rounded p-3 text-center" style={{minHeight: '200px'}}>
                          {productForm.images[index] ? (
                            <div>
                              <img 
                                src={productForm.images[index]} 
                                alt={`Product ${index + 1}`} 
                                style={{width: '100%', height: '120px', objectFit: 'cover'}} 
                                className="mb-2 rounded"
                              />
                              <button 
                                type="button" 
                                className="btn btn-sm btn-outline-danger d-block w-100"
                                onClick={() => {
                                  const newImages = [...productForm.images];
                                  newImages[index] = '';
                                  setProductForm({...productForm, images: newImages});
                                }}
                              >
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div>
                              <i className="bi bi-cloud-upload display-4 text-muted mb-2"></i>
                              <p className="text-muted mb-2">Image {index + 1}</p>
                              <input
                                type="file"
                                accept="image/*"
                                className="form-control"
                                onChange={(e) => {
                                  const file = e.target.files?.[0];
                                  if (file) handleImageUpload(file, index);
                                }}
                              />
                            </div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Size S Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.sizes.S}
                      onChange={(e) => setProductForm({...productForm, sizes: {...productForm.sizes, S: Number(e.target.value)}})}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Size M Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.sizes.M}
                      onChange={(e) => setProductForm({...productForm, sizes: {...productForm.sizes, M: Number(e.target.value)}})}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Size L Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.sizes.L}
                      onChange={(e) => setProductForm({...productForm, sizes: {...productForm.sizes, L: Number(e.target.value)}})}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Size XL Stock</label>
                    <input
                      type="number"
                      className="form-control"
                      value={productForm.sizes.XL}
                      onChange={(e) => setProductForm({...productForm, sizes: {...productForm.sizes, XL: Number(e.target.value)}})}
                    />
                  </div>
                </div>

                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={productForm.status}
                      onChange={(e) => setProductForm({...productForm, status: e.target.value as any})}
                    >
                      <option value="instock">In Stock</option>
                      <option value="outofstock">Out of Stock</option>
                      <option value="active">Active</option>
                      <option value="inactive">Inactive</option>
                    </select>
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Rating</label>
                    <input
                      type="number"
                      step="0.1"
                      min="0"
                      max="5"
                      className="form-control"
                      value={productForm.rating}
                      onChange={(e) => setProductForm({...productForm, rating: Number(e.target.value)})}
                    />
                  </div>
                </div>

                {/* Pricing & Discount Section */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0"><i className="bi bi-percent me-2"></i>Pricing & Discounts</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Original Price</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control"
                            value={productForm.originalPrice || productForm.price}
                            onChange={(e) => setProductForm({...productForm, originalPrice: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Discount (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          min="0"
                          max="100"
                          value={productForm.discount}
                          onChange={(e) => {
                            const discount = Number(e.target.value);
                            const originalPrice = productForm.originalPrice || productForm.price;
                            const discountedPrice = originalPrice - (originalPrice * discount / 100);
                            setProductForm({...productForm, discount, price: discountedPrice});
                          }}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Final Price</label>
                        <div className="input-group">
                          <span className="input-group-text">₹</span>
                          <input
                            type="number"
                            className="form-control"
                            value={productForm.price}
                            onChange={(e) => setProductForm({...productForm, price: Number(e.target.value)})}
                          />
                        </div>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Promo Code</label>
                        <input
                          type="text"
                          className="form-control"
                          placeholder="e.g., SAVE20, NEWUSER"
                          value={productForm.promoCode}
                          onChange={(e) => setProductForm({...productForm, promoCode: e.target.value.toUpperCase()})}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Savings</label>
                        <div className="form-control bg-light">
                          ₹{((productForm.originalPrice || productForm.price) - productForm.price).toFixed(2)} 
                          ({productForm.discount}% off)
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Details Section */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0"><i className="bi bi-info-circle me-2"></i>Product Details</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Color</label>
                        <div className="input-group">
                          <input type="color" className="form-control form-control-color" value={productForm.details.color || '#000000'} 
                                 onChange={(e) => setProductForm({...productForm, details: {...productForm.details, color: e.target.value}})} />
                          <input type="text" className="form-control" value={productForm.details.color} placeholder="Color name or hex" 
                                 onChange={(e) => setProductForm({...productForm, details: {...productForm.details, color: e.target.value}})} />
                        </div>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Brand Name</label>
                        <input type="text" className="form-control" placeholder="Enter brand name" value={productForm.details.brand} 
                               onChange={(e) => setProductForm({...productForm, details: {...productForm.details, brand: e.target.value}})} />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Style</label>
                        <select className="form-select" value={productForm.details.style} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, style: e.target.value}})}>
                          <option value="">Select Style</option>
                          <option value="Casual">Casual</option>
                          <option value="Formal">Formal</option>
                          <option value="Party">Party</option>
                          <option value="Sports">Sports</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Sleeve Type</label>
                        <select className="form-select" value={productForm.details.sleeveType} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, sleeveType: e.target.value}})}>
                          <option value="">Select Sleeve Type</option>
                          <option value="Batwing Sleeve">Batwing Sleeve</option>
                          <option value="Regular Sleeve">Regular Sleeve</option>
                          <option value="Bell Sleeve">Bell Sleeve</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Neckline</label>
                        <select className="form-select" value={productForm.details.neckline} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, neckline: e.target.value}})}>
                          <option value="">Select Neckline</option>
                          <option value="V neck">V neck</option>
                          <option value="Round neck">Round neck</option>
                          <option value="Collar">Collar</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Pattern Type</label>
                        <select className="form-select" value={productForm.details.patternType} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, patternType: e.target.value}})}>
                          <option value="">Select Pattern</option>
                          <option value="Striped">Striped</option>
                          <option value="Solid">Solid</option>
                          <option value="Floral">Floral</option>
                          <option value="Printed">Printed</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Sleeve Length</label>
                        <select className="form-select" value={productForm.details.sleeveLength} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, sleeveLength: e.target.value}})}>
                          <option value="">Select Length</option>
                          <option value="Half Sleeve">Half Sleeve</option>
                          <option value="Full Sleeve">Full Sleeve</option>
                          <option value="Sleeveless">Sleeveless</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fit Type</label>
                        <select className="form-select" value={productForm.details.fitType} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, fitType: e.target.value}})}>
                          <option value="">Select Fit</option>
                          <option value="Regular Fit">Regular Fit</option>
                          <option value="Slim Fit">Slim Fit</option>
                          <option value="Loose Fit">Loose Fit</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Fabric</label>
                        <select className="form-select" value={productForm.details.fabric} 
                                onChange={(e) => setProductForm({...productForm, details: {...productForm.details, fabric: e.target.value}})}>
                          <option value="">Select Fabric</option>
                          <option value="Non-Stretch">Non-Stretch</option>
                          <option value="Stretch">Stretch</option>
                          <option value="Cotton">Cotton</option>
                          <option value="Polyester">Polyester</option>
                        </select>
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Composition</label>
                        <input type="text" className="form-control" placeholder="e.g., 100% Polyester" 
                               value={productForm.details.composition} 
                               onChange={(e) => setProductForm({...productForm, details: {...productForm.details, composition: e.target.value}})} />
                      </div>
                      <div className="col-md-12 mb-3">
                        <label className="form-label">Care Instructions</label>
                        <textarea className="form-control" rows={2} placeholder="Machine wash or professional dry clean" 
                                  value={productForm.details.careInstructions} 
                                  onChange={(e) => setProductForm({...productForm, details: {...productForm.details, careInstructions: e.target.value}})} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Product Specifications Section */}
                <div className="card mb-3">
                  <div className="card-header">
                    <h6 className="mb-0"><i className="bi bi-gear me-2"></i>Product Specifications</h6>
                  </div>
                  <div className="card-body">
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Material</label>
                        <input type="text" className="form-control" placeholder="Woven Fabric" 
                               value={productForm.specifications.material} 
                               onChange={(e) => setProductForm({...productForm, specifications: {...productForm.specifications, material: e.target.value}})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Care</label>
                        <input type="text" className="form-control" placeholder="Machine wash or professional dry clean" 
                               value={productForm.specifications.care} 
                               onChange={(e) => setProductForm({...productForm, specifications: {...productForm.specifications, care: e.target.value}})} />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Weight</label>
                        <select className="form-select" value={productForm.specifications.weight} 
                                onChange={(e) => setProductForm({...productForm, specifications: {...productForm.specifications, weight: e.target.value}})}>
                          <option value="">Select Weight</option>
                          <option value="Light Weight">Light Weight</option>
                          <option value="Regular Fit">Regular Fit</option>
                          <option value="Heavy Weight">Heavy Weight</option>
                        </select>
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Origin</label>
                        <select className="form-select" value={productForm.specifications.origin} 
                                onChange={(e) => setProductForm({...productForm, specifications: {...productForm.specifications, origin: e.target.value}})}>
                          <option value="Sri Lanka">Sri Lanka</option>
                          <option value="India">India</option>
                          <option value="China">China</option>
                          <option value="Bangladesh">Bangladesh</option>
                        </select>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={productLoading}>
                    {productLoading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                    ) : (
                      <><i className="bi bi-check-circle me-2"></i>{editingProduct ? 'Update Product' : 'Add Product'}</>
                    )}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetProductForm} disabled={productLoading}>
                    <i className="bi bi-x-circle me-2"></i>Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Product Management</h5>
            <div className="d-flex gap-2">
              <button className="btn btn-primary" onClick={startAddProduct}>
                <i className="bi bi-plus-circle me-2"></i>Add New Product
              </button>
              <a href="/dashboard/products" className="btn btn-outline-primary">
                <i className="bi bi-list me-2"></i>View All Products
              </a>
            </div>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Images</th>
                    <th>Name</th>
                    <th>Code</th>
                    <th>Category</th>
                    <th>Price</th>
                    <th>Discount</th>
                    <th>Stock</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {products.slice(0, 5).map((product) => (
                    <tr key={product.id}>
                      <td>
                        <div className="d-flex gap-1">
                          {Array.isArray(product.images) ? (
                            product.images.slice(0, 2).map((img, idx) => (
                              <img key={idx} src={img} alt={product.name} style={{width: '30px', height: '30px', objectFit: 'cover'}} className="rounded" />
                            ))
                          ) : (
                            <img src={product.image} alt={product.name} style={{width: '40px', height: '40px', objectFit: 'cover'}} className="rounded" />
                          )}
                          {Array.isArray(product.images) && product.images.length > 2 && (
                            <span className="badge bg-secondary">+{product.images.length - 2}</span>
                          )}
                        </div>
                      </td>
                      <td>{product.name}</td>
                      <td><code>{product.code}</code></td>
                      <td>{typeof product.category === 'string' ? product.category : product.category?.name}</td>
                      <td>
                        <div>
                          {product.originalPrice && product.originalPrice > product.price ? (
                            <>
                              <span className="text-decoration-line-through text-muted small">₹{product.originalPrice}</span><br/>
                              <span className="fw-bold text-success">₹{product.price.toLocaleString()}</span>
                            </>
                          ) : (
                            <span>₹{product.price.toLocaleString()}</span>
                          )}
                        </div>
                      </td>
                      <td>
                        {product.discount > 0 ? (
                          <div>
                            <span className="badge bg-danger">{product.discount}% OFF</span>
                            {product.promoCode && (
                              <><br/><small className="text-primary">{product.promoCode}</small></>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted">-</span>
                        )}
                      </td>
                      <td>
                        {(() => {
                          if (!product.sizes) return 0;
                          if (typeof product.sizes === 'object' && !Array.isArray(product.sizes)) {
                            return Object.values(product.sizes).reduce((a: number, b: any) => {
                              return a + (typeof b === 'number' ? b : 0);
                            }, 0);
                          }
                          return 0;
                        })()}
                      </td>
                      <td>
                        <span className={`badge ${product.status === 'instock' ? 'bg-success' : 'bg-danger'}`}>
                          {product.status}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-1" 
                          title="Edit"
                          onClick={() => startEditProduct(product)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-success me-1" 
                          title="Restock"
                          onClick={() => handleRestock(product)}
                        >
                          <i className="bi bi-arrow-up-circle"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger" 
                          title="Delete"
                          onClick={() => handleDeleteProduct(product)}
                          disabled={deletingProductId === String(product._id || product.id)}
                        >
                          {deletingProductId === String(product._id || product.id) ? 
                            <i className="bi bi-hourglass-split"></i> : 
                            <i className="bi bi-trash"></i>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Restock Modal */}
        {showRestockModal && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">Restock: {restockingProduct?.name}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowRestockModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Size S Stock</label>
                      <input type="number" className="form-control" min="0" 
                             value={restockSizes.S} 
                             onChange={(e) => setRestockSizes({...restockSizes, S: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Size M Stock</label>
                      <input type="number" className="form-control" min="0" 
                             value={restockSizes.M} 
                             onChange={(e) => setRestockSizes({...restockSizes, M: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Size L Stock</label>
                      <input type="number" className="form-control" min="0" 
                             value={restockSizes.L} 
                             onChange={(e) => setRestockSizes({...restockSizes, L: Number(e.target.value)})} />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Size XL Stock</label>
                      <input type="number" className="form-control" min="0" 
                             value={restockSizes.XL} 
                             onChange={(e) => setRestockSizes({...restockSizes, XL: Number(e.target.value)})} />
                    </div>
                  </div>
                  <div className="alert alert-info">
                    <strong>Total:</strong> {Object.values(restockSizes).reduce((a, b) => a + b, 0)} items
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-success" onClick={submitRestock} disabled={loading}>
                    {loading ? 'Restocking...' : 'Restock'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Category Management Component
  function CategoryManagement() {
    const handleCategorySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        let response;
        if (editingCategory) {
          response = await fetch(`/api/categories/${editingCategory._id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryForm)
          });
        } else {
          response = await fetch('/api/categories', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryForm)
          });
        }

        if (response.ok) {
          loadData();
          setCategoryForm({ name: '', description: '', image: '' });
          setEditingCategory(null);
          showToast(editingCategory ? 'Category updated!' : 'Category added!', 'success');
        } else {
          showToast('Failed to save category', 'error');
        }
      } catch (error) {
        showToast('Error saving category', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteCategory = async (categoryId: string) => {
      if (confirm('Are you sure? This will delete all subcategories too.')) {
        setDeleteLoading(categoryId);
        try {
          const response = await fetch(`/api/categories/${categoryId}`, { method: 'DELETE' });
          if (response.ok) {
            loadData();
            showToast('Category deleted!', 'success');
          } else {
            showToast('Failed to delete category', 'error');
          }
        } catch (error) {
          showToast('Error deleting category', 'error');
        } finally {
          setDeleteLoading(null);
        }
      }
    };

    return (
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">{editingCategory ? 'Edit Category' : 'Add Category'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCategorySubmit}>
                <div className="mb-3">
                  <label className="form-label">Category Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={categoryForm.name}
                    onChange={(e) => setCategoryForm({...categoryForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={categoryForm.description}
                    onChange={(e) => setCategoryForm({...categoryForm, description: e.target.value})}
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Image URL</label>
                  <input
                    type="url"
                    className="form-control"
                    value={categoryForm.image}
                    onChange={(e) => setCategoryForm({...categoryForm, image: e.target.value})}
                  />
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Saving...' : (editingCategory ? 'Update' : 'Add Category')}
                  </button>
                  {editingCategory && (
                    <button type="button" className="btn btn-secondary" 
                            onClick={() => {setEditingCategory(null); setCategoryForm({ name: '', description: '', image: '' });}}>
                      Cancel
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Categories ({categories.length})</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Subcategories</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map((category) => (
                      <tr key={category._id}>
                        <td>
                          {category.image && (
                            <img src={category.image} alt={category.name} style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                          )}
                        </td>
                        <td>{category.name}</td>
                        <td>{category.description}</td>
                        <td>{category.subcategories?.length || 0}</td>
                        <td>
                          <button 
                            className="btn btn-sm btn-outline-primary me-2"
                            onClick={() => {
                              setEditingCategory(category);
                              setCategoryForm({
                                name: category.name,
                                description: category.description || '',
                                image: category.image || ''
                              });
                            }}
                          >
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-danger"
                            onClick={() => handleDeleteCategory(category._id)}
                            disabled={deleteLoading === category._id}
                          >
                            {deleteLoading === category._id ? 
                              <i className="bi bi-hourglass-split"></i> : 
                              <i className="bi bi-trash"></i>
                            }
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Subcategory Management Component
  function SubcategoryManagement() {
    const handleSubcategorySubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch('/api/categories/subcategories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(subcategoryForm)
        });

        if (response.ok) {
          loadData();
          setSubcategoryForm({ name: '', description: '', categoryId: '' });
          showToast('Subcategory added!', 'success');
        } else {
          const errorData = await response.json();
          showToast(errorData.error || 'Failed to add subcategory', 'error');
        }
      } catch (error) {
        showToast('Error adding subcategory', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteSubcategory = async (categoryId: string, subcategorySlug: string) => {
      if (confirm('Are you sure you want to delete this subcategory?')) {
        try {
          const response = await fetch('/api/categories/subcategories', {
            method: 'DELETE',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ categoryId, subcategorySlug })
          });
          if (response.ok) {
            loadData();
            showToast('Subcategory deleted!', 'success');
          } else {
            showToast('Failed to delete subcategory', 'error');
          }
        } catch (error) {
          showToast('Error deleting subcategory', 'error');
        }
      }
    };

    return (
      <div className="row">
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">Add Subcategory</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleSubcategorySubmit}>
                <div className="mb-3">
                  <label className="form-label">Parent Category</label>
                  <select
                    className="form-select"
                    value={subcategoryForm.categoryId}
                    onChange={(e) => setSubcategoryForm({...subcategoryForm, categoryId: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    {categories.map(cat => (
                      <option key={cat._id} value={cat._id}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Subcategory Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={subcategoryForm.name}
                    onChange={(e) => setSubcategoryForm({...subcategoryForm, name: e.target.value})}
                    required
                  />
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    value={subcategoryForm.description}
                    onChange={(e) => setSubcategoryForm({...subcategoryForm, description: e.target.value})}
                  />
                </div>
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Adding...' : 'Add Subcategory'}
                </button>
              </form>
            </div>
          </div>
        </div>
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0">All Subcategories</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Description</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {categories.map(category => 
                      category.subcategories?.map(sub => (
                        <tr key={`${category._id}-${sub.slug}`}>
                          <td>{category.name}</td>
                          <td>{sub.name}</td>
                          <td>{sub.description}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-danger"
                              onClick={() => handleDeleteSubcategory(category._id, sub.slug)}
                            >
                              <i className="bi bi-trash"></i>
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
        </div>
      </div>
    );
  }

  // Order Management Component
  function OrderManagement() {
    const [filters, setFilters] = useState({
      orderId: '',
      productCode: '',
      paymentMethod: '',
      status: '',
      paymentStatus: ''
    });
    const [showOrderModal, setShowOrderModal] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

    const filteredOrders = orders.filter(order => {
      return (
        (!filters.orderId || order._id?.toLowerCase().includes(filters.orderId.toLowerCase()) || order.orderNumber?.toLowerCase().includes(filters.orderId.toLowerCase())) &&
        (!filters.productCode || order.items?.some((item: OrderItem) => item.name.toLowerCase().includes(filters.productCode.toLowerCase()))) &&
        (!filters.paymentMethod || order.paymentMethod === filters.paymentMethod) &&
        (!filters.status || order.status === filters.status) &&
        (!filters.paymentStatus || order.paymentStatus === filters.paymentStatus)
      );
    });

    const clearFilters = () => {
      setFilters({
        orderId: '',
        productCode: '',
        paymentMethod: '',
        status: '',
        paymentStatus: ''
      });
    };

    const updateOrderStatus = async (orderId: string, status: string) => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });

        if (response.ok) {
          loadData();
          showToast('Order status updated!', 'success');
        } else {
          const errorData = await response.json();
          showToast(errorData.error || 'Failed to update order', 'error');
        }
      } catch (error) {
        showToast('Error updating order', 'error');
      }
    };

    const updatePaymentStatus = async (orderId: string, paymentStatus: string) => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentStatus })
        });

        if (response.ok) {
          loadData();
          showToast('Payment status updated!', 'success');
        } else {
          showToast('Failed to update payment status', 'error');
        }
      } catch (error) {
        showToast('Error updating payment status', 'error');
      }
    };

    const verifyPayment = async (orderId: string, verified: boolean) => {
      try {
        const response = await fetch(`/api/orders/${orderId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ paymentVerified: verified })
        });

        if (response.ok) {
          loadData();
          showToast(`Payment ${verified ? 'verified' : 'rejected'}!`, 'success');
        } else {
          showToast('Failed to verify payment', 'error');
        }
      } catch (error) {
        showToast('Error verifying payment', 'error');
      }
    };

    const getStatusBadge = (status: string) => {
      const statusColors: {[key: string]: string} = {
        pending: 'bg-warning',
        confirmed: 'bg-info',
        processing: 'bg-primary',
        shipped: 'bg-success',
        delivered: 'bg-success',
        cancelled: 'bg-danger'
      };
      return statusColors[status] || 'bg-secondary';
    };

    const getPaymentBadge = (status: string) => {
      const paymentColors: {[key: string]: string} = {
        pending: 'bg-warning',
        paid: 'bg-success',
        failed: 'bg-danger',
        verified: 'bg-success',
        rejected: 'bg-danger'
      };
      return paymentColors[status] || 'bg-secondary';
    };

    const getPaymentMethodIcon = (method: string) => {
      const icons: {[key: string]: string} = {
        cash_on_delivery: 'bi-cash',
        bank_transfer: 'bi-bank',
        card: 'bi-credit-card',
        digital_wallet: 'bi-wallet2'
      };
      return icons[method] || 'bi-currency-dollar';
    };

    const viewOrderDetails = (order: Order) => {
      setSelectedOrder(order);
      setShowOrderModal(true);
    };

    const printInvoice = () => {
      const printContent = document.getElementById('invoice-content');
      const originalContent = document.body.innerHTML;
      document.body.innerHTML = printContent?.innerHTML || '';
      window.print();
      document.body.innerHTML = originalContent;
      window.location.reload();
    };

    return (
      <div className="card">
        <div className="card-header">
          <h5 className="mb-0">Order Management ({filteredOrders.length} of {orders.length})</h5>
        </div>
        <div className="card-body">
          {/* Filter Section */}
          <div className="row mb-4 p-3 bg-light rounded">
            <div className="col-md-2 mb-2">
              <label className="form-label small">Order ID</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Search order ID"
                value={filters.orderId}
                onChange={(e) => setFilters({...filters, orderId: e.target.value})}
              />
            </div>
            <div className="col-md-2 mb-2">
              <label className="form-label small">Product</label>
              <input
                type="text"
                className="form-control form-control-sm"
                placeholder="Product name"
                value={filters.productCode}
                onChange={(e) => setFilters({...filters, productCode: e.target.value})}
              />
            </div>
            <div className="col-md-2 mb-2">
              <label className="form-label small">Payment Method</label>
              <select
                className="form-select form-select-sm"
                value={filters.paymentMethod}
                onChange={(e) => setFilters({...filters, paymentMethod: e.target.value})}
              >
                <option value="">All Methods</option>
                <option value="cash_on_delivery">Cash on Delivery</option>
                <option value="bank_transfer">Bank Transfer</option>
                <option value="card">Card</option>
                <option value="digital_wallet">Digital Wallet</option>
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <label className="form-label small">Order Status</label>
              <select
                className="form-select form-select-sm"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
              >
                <option value="">All Status</option>
                <option value="pending">Pending</option>
                <option value="confirmed">Confirmed</option>
                <option value="processing">Processing</option>
                <option value="shipped">Shipped</option>
                <option value="delivered">Delivered</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
            <div className="col-md-2 mb-2">
              <label className="form-label small">Payment Status</label>
              <select
                className="form-select form-select-sm"
                value={filters.paymentStatus}
                onChange={(e) => setFilters({...filters, paymentStatus: e.target.value})}
              >
                <option value="">All Payment</option>
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="failed">Failed</option>
                <option value="verified">Verified</option>
                <option value="rejected">Rejected</option>
              </select>
            </div>
            <div className="col-md-2 mb-2 d-flex align-items-end">
              <button className="btn btn-outline-secondary btn-sm" onClick={clearFilters}>
                <i className="bi bi-x-circle me-1"></i>Clear
              </button>
            </div>
          </div>
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Order ID</th>
                  <th>Customer</th>
                  <th>Items</th>
                  <th>Total</th>
                  <th>Payment</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredOrders.map((order) => (
                  <tr key={order._id}>
                    <td>#{order._id?.slice(-6)}</td>
                    <td>
                      <div>
                        <strong>{order.customerInfo?.name}</strong><br/>
                        <small className="text-muted">{order.customerInfo?.email}</small><br/>
                        <small className="text-muted">{order.customerInfo?.phone}</small>
                      </div>
                    </td>
                    <td>
                      {order.items?.slice(0, 2).map((item: OrderItem, idx: number) => (
                        <div key={idx} className="small">
                          {item.name} x{item.quantity}
                        </div>
                      ))}
                      {(order.items?.length || 0) > 2 && (
                        <small className="text-muted">+{(order.items?.length || 0) - 2} more</small>
                      )}
                    </td>
                    <td>₹{order.total}</td>
                    <td>
                      <div className="d-flex flex-column gap-1">
                        <div className="d-flex align-items-center gap-1">
                          <i className={`${getPaymentMethodIcon(order.paymentMethod)} text-muted`}></i>
                          <small>{order.paymentMethod?.replace('_', ' ')}</small>
                        </div>
                        <span className={`badge ${getPaymentBadge(order.paymentStatus)} badge-sm`}>
                          {order.paymentStatus}
                        </span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${getStatusBadge(order.status)}`}>
                        {order.status}
                      </span>
                    </td>
                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                    <td>
                      <div className="d-flex gap-1">
                        <button 
                          className="btn btn-sm btn-outline-info me-1" 
                          title="View Details"
                          onClick={() => viewOrderDetails(order)}
                        >
                          <i className="bi bi-eye"></i>
                        </button>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-primary dropdown-toggle" 
                                  type="button" data-bs-toggle="dropdown">
                            Status
                          </button>
                          <ul className="dropdown-menu">
                            <li><button className="dropdown-item" onClick={() => updateOrderStatus(order._id, 'confirmed')}>Confirmed</button></li>
                            <li><button className="dropdown-item" onClick={() => updateOrderStatus(order._id, 'processing')}>Processing</button></li>
                            <li><button className="dropdown-item" onClick={() => updateOrderStatus(order._id, 'shipped')}>Shipped</button></li>
                            <li><button className="dropdown-item" onClick={() => updateOrderStatus(order._id, 'delivered')}>Delivered</button></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><button className="dropdown-item text-danger" onClick={() => updateOrderStatus(order._id, 'cancelled')}>Cancel</button></li>
                          </ul>
                        </div>
                        <div className="dropdown">
                          <button className="btn btn-sm btn-outline-success dropdown-toggle" 
                                  type="button" data-bs-toggle="dropdown">
                            Payment
                          </button>
                          <ul className="dropdown-menu">
                            <li><h6 className="dropdown-header">Payment Status</h6></li>
                            <li><button className="dropdown-item" onClick={() => updatePaymentStatus(order._id, 'pending')}>Pending</button></li>
                            <li><button className="dropdown-item" onClick={() => updatePaymentStatus(order._id, 'paid')}>Paid</button></li>
                            <li><button className="dropdown-item" onClick={() => updatePaymentStatus(order._id, 'failed')}>Failed</button></li>
                            <li><hr className="dropdown-divider"/></li>
                            <li><h6 className="dropdown-header">Verification</h6></li>
                            <li><button className="dropdown-item text-success" onClick={() => verifyPayment(order._id, true)}>
                              <i className="bi bi-check-circle me-2"></i>Verify Payment
                            </button></li>
                            <li><button className="dropdown-item text-danger" onClick={() => verifyPayment(order._id, false)}>
                              <i className="bi bi-x-circle me-2"></i>Reject Payment
                            </button></li>
                          </ul>
                        </div>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Order Details Modal */}
        {showOrderModal && selectedOrder && (
          <div className="modal show d-block" style={{backgroundColor: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2"></i>
                    Order Details - #{selectedOrder._id?.slice(-8)}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div id="invoice-content">
                    <style>
                      {`
                        @media print {
                          body { font-family: Arial, sans-serif; }
                          .invoice-header { text-align: center; margin-bottom: 30px; }
                          .invoice-details { margin-bottom: 20px; }
                          table { width: 100%; border-collapse: collapse; }
                          th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
                          th { background-color: #f2f2f2; }
                          .total-row { font-weight: bold; }
                        }
                      `}
                    </style>
                    <div className="invoice-header">
                      <h2>Fashion Breeze</h2>
                      <p>Invoice #{selectedOrder._id?.slice(-8)}</p>
                      <p>Date: {new Date(selectedOrder.createdAt).toLocaleDateString()}</p>
                    </div>
                  <div className="row">
                    {/* Customer Information */}
                    <div className="col-md-6 mb-4">
                      <h6 className="fw-bold mb-3"><i className="bi bi-person me-2"></i>Customer Information</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="mb-2"><strong>Name:</strong> {selectedOrder.customerInfo?.name}</p>
                          <p className="mb-2"><strong>Email:</strong> {selectedOrder.customerInfo?.email}</p>
                          <p className="mb-2"><strong>Phone:</strong> {selectedOrder.customerInfo?.phone}</p>
                          <p className="mb-0"><strong>Address:</strong> {selectedOrder.customerInfo?.address}</p>
                        </div>
                      </div>
                    </div>

                    {/* Order Information */}
                    <div className="col-md-6 mb-4">
                      <h6 className="fw-bold mb-3"><i className="bi bi-info-circle me-2"></i>Order Information</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <p className="mb-2"><strong>Order Date:</strong> {new Date(selectedOrder.createdAt).toLocaleString()}</p>
                          <p className="mb-2">
                            <strong>Status:</strong> 
                            <span className={`badge ms-2 ${getStatusBadge(selectedOrder.status)}`}>
                              {selectedOrder.status}
                            </span>
                          </p>
                          <p className="mb-2">
                            <strong>Payment Method:</strong> 
                            <i className={`${getPaymentMethodIcon(selectedOrder.paymentMethod)} ms-2 me-1`}></i>
                            {selectedOrder.paymentMethod?.replace('_', ' ')}
                          </p>
                          <p className="mb-0">
                            <strong>Payment Status:</strong> 
                            <span className={`badge ms-2 ${getPaymentBadge(selectedOrder.paymentStatus)}`}>
                              {selectedOrder.paymentStatus}
                            </span>
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Order Items */}
                    <div className="col-12 mb-4">
                      <h6 className="fw-bold mb-3"><i className="bi bi-bag me-2"></i>Order Items</h6>
                      <div className="table-responsive">
                        <table className="table table-bordered">
                          <thead className="table-dark">
                            <tr>
                              <th>Product</th>
                              <th>Size</th>
                              <th>Quantity</th>
                              <th>Price</th>
                              <th>Total</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedOrder.items?.map((item: OrderItem, index: number) => (
                              <tr key={index}>
                                <td>{item.name}</td>
                                <td>{item.size || 'N/A'}</td>
                                <td>{item.quantity}</td>
                                <td>₹{item.price.toLocaleString()}</td>
                                <td>₹{(item.price * item.quantity).toLocaleString()}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Order Summary */}
                    <div className="col-12">
                      <h6 className="fw-bold mb-3"><i className="bi bi-calculator me-2"></i>Order Summary</h6>
                      <div className="card bg-light">
                        <div className="card-body">
                          <div className="row">
                            <div className="col-md-6">
                              <p className="mb-2"><strong>Subtotal:</strong> ₹{(selectedOrder.total - (selectedOrder.deliveryCost || 0)).toLocaleString()}</p>
                              <p className="mb-2"><strong>Delivery Cost:</strong> ₹{(selectedOrder.deliveryCost || 0).toLocaleString()}</p>
                              <hr/>
                              <p className="mb-0 fs-5"><strong>Total Amount:</strong> <span className="text-success">₹{selectedOrder.total.toLocaleString()}</span></p>
                            </div>
                            <div className="col-md-6">
                              {selectedOrder.notes && (
                                <div>
                                  <p className="mb-2"><strong>Notes:</strong></p>
                                  <p className="text-muted">{selectedOrder.notes}</p>
                                </div>
                              )}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-success" onClick={printInvoice}>
                    <i className="bi bi-printer me-2"></i>Print Invoice
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
                  <div className="dropdown">
                    <button className="btn btn-primary dropdown-toggle" type="button" data-bs-toggle="dropdown">
                      Update Status
                    </button>
                    <ul className="dropdown-menu">
                      <li><button className="dropdown-item" onClick={() => {updateOrderStatus(selectedOrder._id, 'confirmed'); setShowOrderModal(false);}}>Confirmed</button></li>
                      <li><button className="dropdown-item" onClick={() => {updateOrderStatus(selectedOrder._id, 'processing'); setShowOrderModal(false);}}>Processing</button></li>
                      <li><button className="dropdown-item" onClick={() => {updateOrderStatus(selectedOrder._id, 'shipped'); setShowOrderModal(false);}}>Shipped</button></li>
                      <li><button className="dropdown-item" onClick={() => {updateOrderStatus(selectedOrder._id, 'delivered'); setShowOrderModal(false);}}>Delivered</button></li>
                      <li><hr className="dropdown-divider"/></li>
                      <li><button className="dropdown-item text-danger" onClick={() => {updateOrderStatus(selectedOrder._id, 'cancelled'); setShowOrderModal(false);}}>Cancel</button></li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  // Email Configuration Component
  function EmailConfiguration() {
    const [testEmail, setTestEmail] = useState('');
    const [emailLoading, setEmailLoading] = useState(false);

    const saveEmailConfig = async (e: React.FormEvent) => {
      e.preventDefault();
      setEmailLoading(true);
      try {
        const response = await fetch('/api/email/config', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(emailConfig)
        });

        if (response.ok) {
          showToast('Email configuration saved!', 'success');
        } else {
          showToast('Failed to save email config', 'error');
        }
      } catch (error) {
        showToast('Error saving email config', 'error');
      } finally {
        setEmailLoading(false);
      }
    };

    const sendTestEmail = async () => {
      if (!testEmail) {
        showToast('Please enter test email address', 'error');
        return;
      }
      setEmailLoading(true);
      try {
        const response = await fetch('/api/email/test', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ email: testEmail })
        });

        if (response.ok) {
          showToast('Test email sent successfully!', 'success');
        } else {
          showToast('Failed to send test email', 'error');
        }
      } catch (error) {
        showToast('Error sending test email', 'error');
      } finally {
        setEmailLoading(false);
      }
    };

    return (
      <div className="row">
        <div className="col-md-8">
          <div className="card">
            <div className="card-header">
              <h5 className="mb-0"><i className="bi bi-gear me-2"></i>Email Configuration</h5>
            </div>
            <div className="card-body">
              <form onSubmit={saveEmailConfig}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Host</label>
                    <input type="text" className="form-control" placeholder="smtp.gmail.com" 
                           value={emailConfig.smtpHost} 
                           onChange={(e) => setEmailConfig({...emailConfig, smtpHost: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Port</label>
                    <input type="number" className="form-control" 
                           value={emailConfig.smtpPort} 
                           onChange={(e) => setEmailConfig({...emailConfig, smtpPort: Number(e.target.value)})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Username</label>
                    <input type="email" className="form-control" 
                           value={emailConfig.smtpUser} 
                           onChange={(e) => setEmailConfig({...emailConfig, smtpUser: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">SMTP Password</label>
                    <input type="password" className="form-control" 
                           value={emailConfig.smtpPass} 
                           onChange={(e) => setEmailConfig({...emailConfig, smtpPass: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">From Email</label>
                    <input type="email" className="form-control" 
                           value={emailConfig.fromEmail} 
                           onChange={(e) => setEmailConfig({...emailConfig, fromEmail: e.target.value})} required />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">From Name</label>
                    <input type="text" className="form-control" 
                           value={emailConfig.fromName} 
                           onChange={(e) => setEmailConfig({...emailConfig, fromName: e.target.value})} required />
                  </div>
                </div>
                
                <div className="mb-3">
                  <h6>Email Notifications</h6>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" 
                           checked={emailConfig.orderStatusEnabled} 
                           onChange={(e) => setEmailConfig({...emailConfig, orderStatusEnabled: e.target.checked})} />
                    <label className="form-check-label">Order Status Change Notifications</label>
                  </div>
                  <div className="form-check">
                    <input className="form-check-input" type="checkbox" 
                           checked={emailConfig.newArrivalsEnabled} 
                           onChange={(e) => setEmailConfig({...emailConfig, newArrivalsEnabled: e.target.checked})} />
                    <label className="form-check-label">New Arrivals Notifications</label>
                  </div>
                </div>

                <button type="submit" className="btn btn-success" disabled={emailLoading}>
                  {emailLoading ? 'Saving...' : 'Save Configuration'}
                </button>
              </form>
            </div>
          </div>
        </div>
        
        <div className="col-md-4">
          <div className="card">
            <div className="card-header">
              <h6 className="mb-0"><i className="bi bi-envelope-check me-2"></i>Test Email</h6>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <label className="form-label">Test Email Address</label>
                <input type="email" className="form-control" 
                       value={testEmail} 
                       onChange={(e) => setTestEmail(e.target.value)} 
                       placeholder="test@example.com" />
              </div>
              <button className="btn btn-primary w-100" onClick={sendTestEmail} disabled={emailLoading}>
                {emailLoading ? 'Sending...' : 'Send Test Email'}
              </button>
            </div>
          </div>
          
          <div className="card mt-3">
            <div className="card-header">
              <h6 className="mb-0"><i className="bi bi-info-circle me-2"></i>Email Templates</h6>
            </div>
            <div className="card-body">
              <small className="text-muted">
                <strong>Order Status:</strong> Sent when order status changes<br/>
                <strong>New Arrivals:</strong> Sent when new products are added<br/>
                <strong>Order Confirmation:</strong> Sent when order is placed
              </small>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Banner Management Component
  function BannerManagement() {
    const [showAddBanner, setShowAddBanner] = useState(false);
    const [bannerForm, setBannerForm] = useState({ title: '', image: '', isActive: true, order: 0 });
    const [editingBanner, setEditingBanner] = useState<any>(null);
    const [bannerLoading, setBannerLoading] = useState(false);

    const handleImageUpload = async (file: File) => {
      if (file && file.type.startsWith('image/')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const base64 = e.target?.result as string;
          setBannerForm({...bannerForm, image: base64});
        };
        reader.readAsDataURL(file);
      }
    };

    const handleBannerSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setBannerLoading(true);
      try {
        const url = '/api/banners';
        const method = editingBanner ? 'PUT' : 'POST';
        const body = editingBanner ? {...bannerForm, id: editingBanner._id} : bannerForm;
        
        const response = await fetch(url, {
          method,
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body)
        });

        if (response.ok) {
          loadData();
          resetBannerForm();
          showToast(editingBanner ? 'Banner updated!' : 'Banner added!', 'success');
        } else {
          showToast('Failed to save banner', 'error');
        }
      } catch (error) {
        showToast('Error saving banner', 'error');
      } finally {
        setBannerLoading(false);
      }
    };

    const resetBannerForm = () => {
      setBannerForm({ title: '', image: '', isActive: true, order: 0 });
      setEditingBanner(null);
      setShowAddBanner(false);
    };

    const startEditBanner = (banner: any) => {
      setEditingBanner(banner);
      setBannerForm({
        title: banner.title,
        image: banner.image,
        isActive: banner.isActive,
        order: banner.order
      });
      setShowAddBanner(true);
    };

    const handleDeleteBanner = async (bannerId: string) => {
      if (confirm('Are you sure you want to delete this banner?')) {
        setDeleteLoading(bannerId);
        try {
          const response = await fetch(`/api/banners?id=${bannerId}`, { method: 'DELETE' });
          if (response.ok) {
            loadData();
            showToast('Banner deleted!', 'success');
          } else {
            showToast('Failed to delete banner', 'error');
          }
        } catch (error) {
          showToast('Error deleting banner', 'error');
        } finally {
          setDeleteLoading(null);
        }
      }
    };

    return (
      <div>
        {showAddBanner && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">{editingBanner ? 'Edit Banner' : 'Add New Banner'}</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleBannerSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Banner Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={bannerForm.title}
                      onChange={(e) => setBannerForm({...bannerForm, title: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Order</label>
                    <input
                      type="number"
                      className="form-control"
                      value={bannerForm.order}
                      onChange={(e) => setBannerForm({...bannerForm, order: Number(e.target.value)})}
                    />
                  </div>
                  <div className="col-md-3 mb-3">
                    <label className="form-label">Status</label>
                    <select
                      className="form-select"
                      value={bannerForm.isActive.toString()}
                      onChange={(e) => setBannerForm({...bannerForm, isActive: e.target.value === 'true'})}
                    >
                      <option value="true">Active</option>
                      <option value="false">Inactive</option>
                    </select>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Banner Image</label>
                  <div className="border rounded p-3 text-center" style={{minHeight: '200px'}}>
                    {bannerForm.image ? (
                      <div>
                        <img 
                          src={bannerForm.image} 
                          alt="Banner" 
                          style={{width: '100%', maxHeight: '300px', objectFit: 'cover'}} 
                          className="mb-2 rounded"
                        />
                        <button 
                          type="button" 
                          className="btn btn-outline-danger d-block mx-auto"
                          onClick={() => setBannerForm({...bannerForm, image: ''})}
                        >
                          Remove Image
                        </button>
                      </div>
                    ) : (
                      <div>
                        <i className="bi bi-cloud-upload display-4 text-muted mb-2"></i>
                        <p className="text-muted mb-2">Upload Banner Image</p>
                        <input
                          type="file"
                          accept="image/*"
                          className="form-control"
                          onChange={(e) => {
                            const file = e.target.files?.[0];
                            if (file) handleImageUpload(file);
                          }}
                        />
                      </div>
                    )}
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={bannerLoading}>
                    {bannerLoading ? 'Saving...' : (editingBanner ? 'Update Banner' : 'Add Banner')}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={resetBannerForm}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        <div className="card">
          <div className="card-header d-flex justify-content-between align-items-center">
            <h5 className="mb-0">Banner Management ({banners.length})</h5>
            <button className="btn btn-primary" onClick={() => setShowAddBanner(true)}>
              <i className="bi bi-plus-circle me-2"></i>Add New Banner
            </button>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Image</th>
                    <th>Title</th>
                    <th>Order</th>
                    <th>Status</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {banners.map((banner) => (
                    <tr key={banner._id}>
                      <td>
                        <img src={banner.image} alt={banner.title} style={{width: '80px', height: '50px', objectFit: 'cover'}} className="rounded" />
                      </td>
                      <td>{banner.title}</td>
                      <td>{banner.order}</td>
                      <td>
                        <span className={`badge ${banner.isActive ? 'bg-success' : 'bg-secondary'}`}>
                          {banner.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEditBanner(banner)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteBanner(banner._id)}
                          disabled={deleteLoading === banner._id}
                        >
                          {deleteLoading === banner._id ? 
                            <i className="bi bi-hourglass-split"></i> : 
                            <i className="bi bi-trash"></i>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Customer Management Component
  function CustomerManagement() {
    const [showEditCustomer, setShowEditCustomer] = useState(false);
    const [editingCustomer, setEditingCustomer] = useState<any>(null);
    const [customerForm, setCustomerForm] = useState({
      name: '', email: '', phone: '', country: '',
      address: { line1: '', line2: '', line3: '' }
    });
    const [showCustomerOrders, setShowCustomerOrders] = useState(false);
    const [customerOrders, setCustomerOrders] = useState<any[]>([]);
    const [selectedCustomerId, setSelectedCustomerId] = useState('');

    const startEditCustomer = (customer: any) => {
      setEditingCustomer(customer);
      setCustomerForm({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        country: customer.country,
        address: customer.address || { line1: '', line2: '', line3: '' }
      });
      setShowEditCustomer(true);
    };

    const handleCustomerSubmit = async (e: React.FormEvent) => {
      e.preventDefault();
      setLoading(true);
      try {
        const response = await fetch('/api/customers', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: editingCustomer._id, ...customerForm })
        });

        if (response.ok) {
          loadData();
          setShowEditCustomer(false);
          showToast('Customer updated successfully!', 'success');
        } else {
          showToast('Failed to update customer', 'error');
        }
      } catch (error) {
        showToast('Error updating customer', 'error');
      } finally {
        setLoading(false);
      }
    };

    const handleDeleteCustomer = async (customerId: string) => {
      if (confirm('Are you sure? This will delete the customer and all their orders.')) {
        setDeleteLoading(customerId);
        try {
          const response = await fetch(`/api/customers?id=${customerId}`, { method: 'DELETE' });
          if (response.ok) {
            loadData();
            showToast('Customer deleted successfully!', 'success');
          } else {
            showToast('Failed to delete customer', 'error');
          }
        } catch (error) {
          showToast('Error deleting customer', 'error');
        } finally {
          setDeleteLoading(null);
        }
      }
    };

    const viewCustomerOrders = async (customerId: string) => {
      try {
        const response = await fetch(`/api/orders?userId=${customerId}`);
        const orders = await response.json();
        setCustomerOrders(orders);
        setSelectedCustomerId(customerId);
        setShowCustomerOrders(true);
      } catch (error) {
        showToast('Error loading customer orders', 'error');
      }
    };

    return (
      <div>
        {showEditCustomer && (
          <div className="card mb-4">
            <div className="card-header">
              <h5 className="mb-0">Edit Customer</h5>
            </div>
            <div className="card-body">
              <form onSubmit={handleCustomerSubmit}>
                <div className="row">
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Name</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.name}
                      onChange={(e) => setCustomerForm({...customerForm, name: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Email</label>
                    <input
                      type="email"
                      className="form-control"
                      value={customerForm.email}
                      onChange={(e) => setCustomerForm({...customerForm, email: e.target.value})}
                      required
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Phone</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.phone}
                      onChange={(e) => setCustomerForm({...customerForm, phone: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Country</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.country}
                      onChange={(e) => setCustomerForm({...customerForm, country: e.target.value})}
                    />
                  </div>
                  <div className="col-12 mb-3">
                    <label className="form-label">Address Line 1</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.address.line1}
                      onChange={(e) => setCustomerForm({...customerForm, address: {...customerForm.address, line1: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address Line 2</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.address.line2}
                      onChange={(e) => setCustomerForm({...customerForm, address: {...customerForm.address, line2: e.target.value}})}
                    />
                  </div>
                  <div className="col-md-6 mb-3">
                    <label className="form-label">Address Line 3</label>
                    <input
                      type="text"
                      className="form-control"
                      value={customerForm.address.line3}
                      onChange={(e) => setCustomerForm({...customerForm, address: {...customerForm.address, line3: e.target.value}})}
                    />
                  </div>
                </div>
                <div className="d-flex gap-2">
                  <button type="submit" className="btn btn-success" disabled={loading}>
                    {loading ? 'Updating...' : 'Update Customer'}
                  </button>
                  <button type="button" className="btn btn-secondary" onClick={() => setShowEditCustomer(false)}>
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {showCustomerOrders && (
          <div className="card mb-4">
            <div className="card-header d-flex justify-content-between align-items-center">
              <h5 className="mb-0">Customer Orders ({customerOrders.length})</h5>
              <button className="btn btn-secondary" onClick={() => setShowCustomerOrders(false)}>
                Close
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-striped">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Status</th>
                      <th>Date</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customerOrders.map((order) => (
                      <tr key={order._id}>
                        <td>#{order._id?.slice(-6)}</td>
                        <td>{order.items?.length || 0} items</td>
                        <td>₹{order.total}</td>
                        <td>
                          <span className={`badge ${order.status === 'delivered' ? 'bg-success' : order.status === 'cancelled' ? 'bg-danger' : 'bg-warning'}`}>
                            {order.status}
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
        )}

        <div className="card">
          <div className="card-header">
            <h5 className="mb-0">Customer Management ({customers.length})</h5>
          </div>
          <div className="card-body">
            <div className="table-responsive">
              <table className="table table-striped">
                <thead>
                  <tr>
                    <th>Name</th>
                    <th>Email</th>
                    <th>Phone</th>
                    <th>Country</th>
                    <th>Orders</th>
                    <th>Total Spent</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {customers.map((customer) => (
                    <tr key={customer._id}>
                      <td>{customer.name}</td>
                      <td>{customer.email}</td>
                      <td>{customer.phone}</td>
                      <td>{customer.country}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-info"
                          onClick={() => viewCustomerOrders(customer._id)}
                        >
                          {customer.orderCount} orders
                        </button>
                      </td>
                      <td>₹{customer.totalSpent?.toLocaleString() || 0}</td>
                      <td>
                        <button 
                          className="btn btn-sm btn-outline-primary me-2"
                          onClick={() => startEditCustomer(customer)}
                        >
                          <i className="bi bi-pencil"></i>
                        </button>
                        <button 
                          className="btn btn-sm btn-outline-danger"
                          onClick={() => handleDeleteCustomer(customer._id)}
                          disabled={deleteLoading === customer._id}
                        >
                          {deleteLoading === customer._id ? 
                            <i className="bi bi-hourglass-split"></i> : 
                            <i className="bi bi-trash"></i>
                          }
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    );
  }
}