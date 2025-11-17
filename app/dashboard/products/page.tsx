'use client';

import { useState, useEffect } from 'react';
import { Product, Category } from '../../types/index';

export default function ProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [showAddForm, setShowAddForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    search: '',
    category: '',
    status: ''
  });
  const [activeTab, setActiveTab] = useState('basic');
  const [showRestockForm, setShowRestockForm] = useState(false);
  const [restockProduct, setRestockProduct] = useState<Product | null>(null);
  const [restockData, setRestockData] = useState({ S: 0, M: 0, L: 0, XL: 0 });
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    price: 0,
    originalPrice: 0,
    discount: 0,
    promoCode: '',
    category: '',
    subcategory: '',
    image: '',
    additionalImages: [''],
    sizes: { S: 0, M: 0, L: 0, XL: 0 },
    status: 'instock' as 'active' | 'inactive' | 'draft' | 'outofstock' | 'instock',
    rating: 4.0,
    reviewCount: 0,
    color: '',
    brand: '',
    style: '',
    sleeveType: '',
    neckline: '',
    pattern: '',
    sleeveLength: '',
    fitType: '',
    fabric: '',
    composition: '',
    specifications: {
      material: '',
      careInstructions: '',
      origin: '',
      weight: ''
    },
    seo: {
      metaTitle: '',
      metaDescription: '',
      keywords: ''
    }
  });

  useEffect(() => {
    loadProducts();
    loadCategories();
  }, []);

  const loadProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      setProducts(data);
    } catch (error) {
      console.error('Error loading products:', error);
    }
  };

  const loadCategories = async () => {
    try {
      const response = await fetch('/api/categories');
      const data = await response.json();
      setCategories(data);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getFilteredProducts = () => {
    return products.filter(product => {
      const matchesSearch = !filters.search || 
        product.name.toLowerCase().includes(filters.search.toLowerCase()) ||
        product.code.toLowerCase().includes(filters.search.toLowerCase());
      
      const matchesCategory = !filters.category || 
        (typeof product.category === 'string' ? product.category : product.category.name) === filters.category;
      
      const matchesStatus = !filters.status || product.status === filters.status;
      
      return matchesSearch && matchesCategory && matchesStatus;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const productId = editingProduct ? (editingProduct._id || editingProduct.id) : null;
      const url = editingProduct ? `/api/products/${productId}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const response = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      });

      if (response.ok) {
        loadProducts();
        resetForm();
        setToast({message: editingProduct ? 'Product updated successfully!' : 'Product added successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({message: 'Failed to save product', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({message: 'Error saving product', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (product: Product) => {
    if (confirm('Are you sure you want to delete this product?')) {
      const productId = product._id || product.id;
      setDeleting(String(productId));
      try {
        const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        if (response.ok) {
          loadProducts();
          setToast({message: 'Product deleted successfully!', type: 'success'});
        } else {
          setToast({message: 'Failed to delete product', type: 'error'});
        }
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        console.error('Error deleting product:', error);
        setToast({message: 'Error deleting product', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      } finally {
        setDeleting(null);
      }
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      code: '',
      description: '',
      price: 0,
      originalPrice: 0,
      discount: 0,
      promoCode: '',
      category: '',
      subcategory: '',
      image: '',
      additionalImages: [''],
      sizes: { S: 0, M: 0, L: 0, XL: 0 },
      status: 'instock',
      rating: 4.0,
      reviewCount: 0,
      color: '',
      brand: '',
      style: '',
      sleeveType: '',
      neckline: '',
      pattern: '',
      sleeveLength: '',
      fitType: '',
      fabric: '',
      composition: '',
      specifications: {
        material: '',
        careInstructions: '',
        origin: '',
        weight: ''
      },
      seo: {
        metaTitle: '',
        metaDescription: '',
        keywords: ''
      }
    });
    setEditingProduct(null);
    setShowAddForm(false);
    setActiveTab('basic');
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      description: product.description || '',
      price: product.price,
      originalPrice: (product as any).originalPrice || product.price,
      discount: (product as any).discount || 0,
      promoCode: (product as any).promoCode || '',
      category: typeof product.category === 'string' ? product.category : product.category.name,
      subcategory: product.subcategory || '',
      image: product.image,
      additionalImages: (product as any).additionalImages || [''],
      sizes: (() => {
        if (typeof product.sizes === 'object' && product.sizes && !Array.isArray(product.sizes)) {
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
      color: (product as any).color || '',
      brand: (product as any).brand || '',
      style: (product as any).style || '',
      sleeveType: (product as any).sleeveType || '',
      neckline: (product as any).neckline || '',
      pattern: (product as any).pattern || '',
      sleeveLength: (product as any).sleeveLength || '',
      fitType: (product as any).fitType || '',
      fabric: (product as any).fabric || '',
      composition: (product as any).composition || '',
      specifications: (product as any).specifications || {
        material: '',
        careInstructions: '',
        origin: '',
        weight: ''
      },
      seo: (product as any).seo || {
        metaTitle: '',
        metaDescription: '',
        keywords: ''
      }
    });
    setShowAddForm(true);
    setActiveTab('basic');
  };

  const getSubcategories = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  };

  const handleRestock = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!restockProduct) return;
    
    setLoading(true);
    try {
      const productId = restockProduct._id || restockProduct.id;
      const response = await fetch(`/api/products/${productId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ sizes: restockData })
      });

      if (response.ok) {
        loadProducts();
        setShowRestockForm(false);
        setRestockProduct(null);
        setRestockData({ S: 0, M: 0, L: 0, XL: 0 });
        setToast({message: 'Stock updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        setToast({message: 'Failed to update stock', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating stock:', error);
      setToast({message: 'Error updating stock', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setLoading(false);
    }
  };

  const startRestock = (product: Product) => {
    setRestockProduct(product);
    const currentSizes = (() => {
      if (typeof product.sizes === 'object' && product.sizes && !Array.isArray(product.sizes)) {
        const sizes = product.sizes as { [key: string]: number };
        return {
          S: sizes.S || 0,
          M: sizes.M || 0,
          L: sizes.L || 0,
          XL: sizes.XL || 0
        };
      }
      return { S: 0, M: 0, L: 0, XL: 0 };
    })();
    setRestockData(currentSizes);
    setShowRestockForm(true);
  };

  return (
    <div className="container-fluid py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Product Management</h2>
        <button 
          className="btn btn-primary"
          onClick={() => setShowAddForm(true)}
        >
          <i className="bi bi-plus-circle me-2"></i>Add Product
        </button>
      </div>

      {showRestockForm && (
        <div className="card mb-4 shadow-lg border-0" style={{borderRadius: '15px'}}>
          <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', borderRadius: '15px 15px 0 0'}}>
            <h5 className="mb-0 fw-bold"><i className="bi bi-box-seam me-2"></i>Restock Product: {restockProduct?.name}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleRestock}>
              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size S Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={restockData.S}
                    onChange={(e) => setRestockData({...restockData, S: Number(e.target.value)})}
                    style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size M Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={restockData.M}
                    onChange={(e) => setRestockData({...restockData, M: Number(e.target.value)})}
                    style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size L Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={restockData.L}
                    onChange={(e) => setRestockData({...restockData, L: Number(e.target.value)})}
                    style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size XL Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={restockData.XL}
                    onChange={(e) => setRestockData({...restockData, XL: Number(e.target.value)})}
                    style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                  />
                </div>
              </div>
              <div className="d-flex gap-3">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? 'Updating...' : 'Update Stock'}
                </button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowRestockForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showAddForm && (
        <div className="card mb-4 shadow-lg border-0" style={{borderRadius: '15px'}}>
          <div className="card-header text-white" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', borderRadius: '15px 15px 0 0'}}>
            <div className="d-flex align-items-center">
              <i className={`bi ${editingProduct ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`} style={{fontSize: '1.2rem'}}></i>
              <h5 className="mb-0 fw-bold">{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
            </div>
          </div>
          <div className="card-body p-0">
            <ul className="nav nav-tabs" style={{borderBottom: '2px solid #e9ecef'}}>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'basic' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('basic')}>
                  <i className="bi bi-info-circle me-2"></i>Basic Info
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'specifications' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('specifications')}>
                  <i className="bi bi-gear me-2"></i>Specifications
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'images' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('images')}>
                  <i className="bi bi-images me-2"></i>Images
                </button>
              </li>
              <li className="nav-item">
                <button className={`nav-link ${activeTab === 'seo' ? 'active' : ''}`} type="button" onClick={() => setActiveTab('seo')}>
                  <i className="bi bi-search me-2"></i>SEO
                </button>
              </li>
            </ul>
            <form onSubmit={handleSubmit} className="p-4">
              {activeTab === 'basic' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Name</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        required
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        placeholder="Enter product name"
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Product Code</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.code}
                        onChange={(e) => setFormData({...formData, code: e.target.value})}
                        required
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        placeholder="Enter product code"
                      />
                    </div>
                  </div>

                  <div className="mb-3">
                    <label className="form-label">Product Description</label>
                    <textarea
                      className="form-control"
                      rows={4}
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      placeholder="Enter product description..."
                      style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                    />
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Pricing & Discounts</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Original Price (LKR)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.originalPrice}
                          onChange={(e) => {
                            const original = Number(e.target.value);
                            const final = original - (original * formData.discount / 100);
                            setFormData({...formData, originalPrice: original, price: final});
                          }}
                          required
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                          placeholder="0.00"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Discount (%)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.discount}
                          onChange={(e) => {
                            const disc = Number(e.target.value);
                            const final = formData.originalPrice - (formData.originalPrice * disc / 100);
                            setFormData({...formData, discount: disc, price: final});
                          }}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Final Price (LKR)</label>
                        <input
                          type="number"
                          className="form-control"
                          value={formData.price}
                          readOnly
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px', backgroundColor: '#f8f9fa'}}
                        />
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Promo Code</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.promoCode}
                          onChange={(e) => setFormData({...formData, promoCode: e.target.value})}
                          placeholder="e.g., SAVE20, NEWUSER"
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        />
                      </div>
                      <div className="col-md-6 mb-3">
                        <label className="form-label">Savings</label>
                        <div className="form-control" style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px', backgroundColor: '#f8f9fa'}}>
                          LKR {(formData.originalPrice - formData.price).toFixed(2)} ({formData.discount}% off)
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="mb-4">
                    <h6 className="fw-bold mb-3">Product Details</h6>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Color</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.color}
                          onChange={(e) => setFormData({...formData, color: e.target.value})}
                          placeholder="Color name or hex"
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Brand Name</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.brand}
                          onChange={(e) => setFormData({...formData, brand: e.target.value})}
                          placeholder="Enter brand name"
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        />
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Style</label>
                        <select
                          className="form-select"
                          value={formData.style}
                          onChange={(e) => setFormData({...formData, style: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Style</option>
                          <option value="casual">Casual</option>
                          <option value="formal">Formal</option>
                          <option value="party">Party</option>
                          <option value="sports">Sports</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Sleeve Type</label>
                        <select
                          className="form-select"
                          value={formData.sleeveType}
                          onChange={(e) => setFormData({...formData, sleeveType: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Sleeve Type</option>
                          <option value="short">Short Sleeve</option>
                          <option value="long">Long Sleeve</option>
                          <option value="sleeveless">Sleeveless</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Neckline</label>
                        <select
                          className="form-select"
                          value={formData.neckline}
                          onChange={(e) => setFormData({...formData, neckline: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Neckline</option>
                          <option value="round">Round Neck</option>
                          <option value="v-neck">V-Neck</option>
                          <option value="collar">Collar</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Pattern Type</label>
                        <select
                          className="form-select"
                          value={formData.pattern}
                          onChange={(e) => setFormData({...formData, pattern: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Pattern</option>
                          <option value="solid">Solid</option>
                          <option value="striped">Striped</option>
                          <option value="printed">Printed</option>
                        </select>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Fit Type</label>
                        <select
                          className="form-select"
                          value={formData.fitType}
                          onChange={(e) => setFormData({...formData, fitType: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Fit</option>
                          <option value="regular">Regular Fit</option>
                          <option value="slim">Slim Fit</option>
                          <option value="loose">Loose Fit</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Fabric</label>
                        <select
                          className="form-select"
                          value={formData.fabric}
                          onChange={(e) => setFormData({...formData, fabric: e.target.value})}
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        >
                          <option value="">Select Fabric</option>
                          <option value="cotton">Cotton</option>
                          <option value="polyester">Polyester</option>
                          <option value="blend">Cotton Blend</option>
                        </select>
                      </div>
                      <div className="col-md-4 mb-3">
                        <label className="form-label">Composition</label>
                        <input
                          type="text"
                          className="form-control"
                          value={formData.composition}
                          onChange={(e) => setFormData({...formData, composition: e.target.value})}
                          placeholder="e.g., 100% Polyester"
                          style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Category</label>
                      <select
                        className="form-select"
                        value={formData.category}
                        onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
                        required
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
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
                        value={formData.subcategory}
                        onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                        disabled={!formData.category}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      >
                        <option value="">Select Subcategory</option>
                        {getSubcategories(formData.category).map(sub => (
                          <option key={sub.slug} value={sub.name}>{sub.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Size S Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.sizes.S}
                        onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, S: Number(e.target.value)}})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Size M Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.sizes.M}
                        onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, M: Number(e.target.value)}})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Size L Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.sizes.L}
                        onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, L: Number(e.target.value)}})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-3 mb-3">
                      <label className="form-label">Size XL Stock</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.sizes.XL}
                        onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, XL: Number(e.target.value)}})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                  </div>

                  <div className="row">
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Status</label>
                      <select
                        className="form-select"
                        value={formData.status}
                        onChange={(e) => setFormData({...formData, status: e.target.value as any})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      >
                        <option value="instock">In Stock</option>
                        <option value="outofstock">Out of Stock</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Rating</label>
                      <input
                        type="number"
                        step="0.1"
                        min="0"
                        max="5"
                        className="form-control"
                        value={formData.rating}
                        onChange={(e) => setFormData({...formData, rating: Number(e.target.value)})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-4 mb-3">
                      <label className="form-label">Review Count</label>
                      <input
                        type="number"
                        className="form-control"
                        value={formData.reviewCount}
                        onChange={(e) => setFormData({...formData, reviewCount: Number(e.target.value)})}
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'specifications' && (
                <div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Material</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.specifications.material}
                        onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, material: e.target.value}})}
                        placeholder="e.g., 100% Cotton"
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Care Instructions</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.specifications.careInstructions}
                        onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, careInstructions: e.target.value}})}
                        placeholder="e.g., Machine wash cold"
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                  </div>
                  <div className="row">
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Origin</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.specifications.origin}
                        onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, origin: e.target.value}})}
                        placeholder="e.g., Sri Lanka"
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                    <div className="col-md-6 mb-3">
                      <label className="form-label">Weight/Fit</label>
                      <input
                        type="text"
                        className="form-control"
                        value={formData.specifications.weight}
                        onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, weight: e.target.value}})}
                        placeholder="e.g., Regular Fit"
                        style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      />
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'images' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Main Image URL</label>
                    <input
                      type="url"
                      className="form-control"
                      value={formData.image}
                      onChange={(e) => setFormData({...formData, image: e.target.value})}
                      required
                      style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                      placeholder="https://example.com/image.jpg"
                    />
                    {formData.image && (
                      <div className="mt-2">
                        <img src={formData.image} alt="Main preview" style={{width: '100px', height: '100px', objectFit: 'cover', borderRadius: '8px'}} />
                        <div className="mt-1">
                          <small className="text-muted">Image loaded</small>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Additional Images</label>
                    {formData.additionalImages.map((img, index) => (
                      <div key={index} className="d-flex gap-2 mb-2">
                        <div className="flex-grow-1">
                          <input
                            type="url"
                            className="form-control"
                            value={img}
                            onChange={(e) => {
                              const newImages = [...formData.additionalImages];
                              newImages[index] = e.target.value;
                              setFormData({...formData, additionalImages: newImages});
                            }}
                            placeholder="https://example.com/image.jpg"
                            style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                          />
                          {img && (
                            <div className="mt-1">
                              <img src={img} alt={`Preview ${index + 1}`} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />
                              <div className="mt-1">
                                <small className="text-muted">Image {index + 1}</small>
                              </div>
                            </div>
                          )}
                        </div>
                        <button
                          type="button"
                          className="btn btn-outline-danger"
                          onClick={() => {
                            const newImages = formData.additionalImages.filter((_, i) => i !== index);
                            setFormData({...formData, additionalImages: newImages});
                          }}
                        >
                          <i className="bi bi-trash"></i>
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      className="btn btn-outline-primary"
                      onClick={() => setFormData({...formData, additionalImages: [...formData.additionalImages, '']})}
                    >
                      <i className="bi bi-plus me-2"></i>Add Image
                    </button>
                  </div>
                </div>
              )}

              {activeTab === 'seo' && (
                <div>
                  <div className="mb-3">
                    <label className="form-label">Meta Title</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.seo.metaTitle}
                      onChange={(e) => setFormData({...formData, seo: {...formData.seo, metaTitle: e.target.value}})}
                      placeholder="SEO title for search engines"
                      style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Meta Description</label>
                    <textarea
                      className="form-control"
                      rows={3}
                      value={formData.seo.metaDescription}
                      onChange={(e) => setFormData({...formData, seo: {...formData.seo, metaDescription: e.target.value}})}
                      placeholder="SEO description for search engines"
                      style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                    />
                  </div>
                  <div className="mb-3">
                    <label className="form-label">Keywords</label>
                    <input
                      type="text"
                      className="form-control"
                      value={formData.seo.keywords}
                      onChange={(e) => setFormData({...formData, seo: {...formData.seo, keywords: e.target.value}})}
                      placeholder="keyword1, keyword2, keyword3"
                      style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '12px 16px'}}
                    />
                  </div>
                </div>
              )}

              <div className="d-flex gap-3 pt-3" style={{borderTop: '1px solid #e9ecef'}}>
                <button type="submit" className="btn btn-lg px-4" disabled={loading} style={{
                  background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600',
                  boxShadow: '0 4px 15px rgba(16, 185, 129, 0.3)'
                }}>
                  {loading ? (
                    <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                  ) : (
                    <><i className={`bi ${editingProduct ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
                <button type="button" className="btn btn-lg px-4" onClick={resetForm} style={{
                  background: 'linear-gradient(135deg, #6b7280 0%, #4b5563 100%)',
                  border: 'none',
                  borderRadius: '12px',
                  color: 'white',
                  fontWeight: '600'
                }}>
                  <i className="bi bi-x-circle me-2"></i>Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {toast && (
        <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
          <i className={`bi ${toast.type === 'success' ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
          {toast.message}
          <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
        </div>
      )}

      <div className="card mb-4 shadow-sm border-0" style={{borderRadius: '12px'}}>
        <div className="card-body p-4">
          <div className="row g-3">
            <div className="col-md-4">
              <label className="form-label fw-semibold">Search Products</label>
              <input
                type="text"
                className="form-control"
                placeholder="Search by name or code..."
                value={filters.search}
                onChange={(e) => setFilters({...filters, search: e.target.value})}
                style={{borderRadius: '8px', border: '2px solid #e9ecef'}}
              />
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Category</label>
              <select
                className="form-select"
                value={filters.category}
                onChange={(e) => setFilters({...filters, category: e.target.value})}
                style={{borderRadius: '8px', border: '2px solid #e9ecef'}}
              >
                <option value="">All Categories</option>
                {categories.map(cat => (
                  <option key={cat._id} value={cat.name}>{cat.name}</option>
                ))}
              </select>
            </div>
            <div className="col-md-3">
              <label className="form-label fw-semibold">Status</label>
              <select
                className="form-select"
                value={filters.status}
                onChange={(e) => setFilters({...filters, status: e.target.value})}
                style={{borderRadius: '8px', border: '2px solid #e9ecef'}}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="instock">In Stock</option>
                <option value="outofstock">Out of Stock</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-2 d-flex align-items-end">
              <button
                className="btn btn-outline-secondary w-100"
                onClick={() => setFilters({search: '', category: '', status: ''})}
                style={{borderRadius: '8px'}}
              >
                <i className="bi bi-arrow-clockwise me-1"></i>Clear
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="card shadow-lg border-0" style={{borderRadius: '15px'}}>
        <div className="card-header text-white d-flex justify-content-between align-items-center" style={{background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)', borderRadius: '15px 15px 0 0'}}>
          <div className="d-flex align-items-center">
            <i className="bi bi-grid-3x3-gap me-2" style={{fontSize: '1.2rem'}}></i>
            <h5 className="mb-0 fw-bold">Products ({getFilteredProducts().length})</h5>
          </div>
          <span className="badge px-3 py-2" style={{background: 'rgba(255,255,255,0.2)', fontSize: '0.9rem'}}>
            Showing: {getFilteredProducts().length} of {products.length}
          </span>
        </div>
        <div className="card-body p-0">
          <div className="table-responsive">
            <table className="table table-hover mb-0">
              <thead style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100)'}}>
                <tr>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Image</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Name</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Code</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Category</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Price</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Stock</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Status</th>
                  <th className="fw-bold text-dark" style={{padding: '16px', borderBottom: '2px solid #dee2e6'}}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {getFilteredProducts().map((product) => (
                  <tr key={product.id} style={{borderBottom: '1px solid #f1f3f4'}}>
                    <td style={{padding: '16px'}}>
                      <img src={product.image} alt={product.name} style={{width: '60px', height: '60px', objectFit: 'cover', borderRadius: '8px', boxShadow: '0 2px 8px rgba(0,0,0,0.1)'}} />
                    </td>
                    <td style={{padding: '16px'}}>
                      <div className="fw-semibold text-dark">{product.name}</div>
                      {product.subcategory && <small className="text-muted">{product.subcategory}</small>}
                    </td>
                    <td style={{padding: '16px'}}>
                      <span className="badge bg-light text-dark px-2 py-1" style={{fontSize: '0.8rem'}}>{product.code}</span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span className="badge bg-primary px-2 py-1">{typeof product.category === 'string' ? product.category : product.category.name}</span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span className="fw-bold text-success" style={{fontSize: '1.1rem'}}>LKR {product.price.toLocaleString()}</span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span className="badge bg-info px-2 py-1">
                        {typeof product.sizes === 'object' ? 
                          Object.values(product.sizes).reduce((a, b) => typeof b === 'number' ? a + b : a + (b?.stock || 0), 0) : 0} units
                      </span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <span className={`badge px-3 py-2 ${product.status === 'instock' || product.status === 'active' ? 'bg-success' : 'bg-danger'}`} style={{fontSize: '0.8rem'}}>
                        <i className={`bi ${product.status === 'instock' || product.status === 'active' ? 'bi-check-circle' : 'bi-x-circle'} me-1`}></i>
                        {product.status === 'instock' || product.status === 'active' ? 'In Stock' : 'Out of Stock'}
                      </span>
                    </td>
                    <td style={{padding: '16px'}}>
                      <div className="d-flex gap-2">
                        <button 
                          className="btn btn-sm px-3 py-2"
                          onClick={() => startEdit(product)}
                          style={{background: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)', border: 'none', borderRadius: '8px', color: 'white'}}
                          title="Edit Product"
                        >
                          <i className="bi bi-pencil-square"></i>
                        </button>
                        <button 
                          className="btn btn-sm px-3 py-2"
                          onClick={() => startRestock(product)}
                          style={{background: 'linear-gradient(135deg, #059669 0%, #047857 100%)', border: 'none', borderRadius: '8px', color: 'white'}}
                          title="Restock Product"
                        >
                          <i className="bi bi-box-seam"></i>
                        </button>
                        <button 
                          className="btn btn-sm px-3 py-2"
                          onClick={() => handleDelete(product)}
                          disabled={deleting === String(product._id || product.id)}
                          style={{background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', border: 'none', borderRadius: '8px', color: 'white'}}
                          title="Delete Product"
                        >
                          {deleting === String(product._id || product.id) ? (
                            <i className="bi bi-hourglass-split"></i>
                          ) : (
                            <i className="bi bi-trash"></i>
                          )}
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
    </div>
  );
}