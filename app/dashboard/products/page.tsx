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
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    price: 0,
    category: '',
    subcategory: '',
    image: '',
    sizes: { S: 0, M: 0, L: 0, XL: 0 },
    status: 'instock' as 'active' | 'inactive' | 'draft' | 'outofstock' | 'instock',
    rating: 4.0,
    reviewCount: 0
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
      price: 0,
      category: '',
      subcategory: '',
      image: '',
      sizes: { S: 0, M: 0, L: 0, XL: 0 },
      status: 'instock',
      rating: 4.0,
      reviewCount: 0
    });
    setEditingProduct(null);
    setShowAddForm(false);
  };

  const startEdit = (product: Product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name,
      code: product.code,
      price: product.price,
      category: typeof product.category === 'string' ? product.category : product.category.name,
      subcategory: product.subcategory || '',
      image: product.image,
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
      reviewCount: product.reviewCount || 0
    });
    setShowAddForm(true);
  };

  const getSubcategories = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
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

      {showAddForm && (
        <div className="card mb-4">
          <div className="card-header">
            <h5>{editingProduct ? 'Edit Product' : 'Add New Product'}</h5>
          </div>
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <label className="form-label">Product Name</label>
                  <input
                    type="text"
                    className="form-control"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
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
                  />
                </div>
              </div>

              <div className="row">
                <div className="col-md-4 mb-3">
                  <label className="form-label">Price (₹)</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.price}
                    onChange={(e) => setFormData({...formData, price: Number(e.target.value)})}
                    required
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Category</label>
                  <select
                    className="form-select"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})}
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
                    value={formData.subcategory}
                    onChange={(e) => setFormData({...formData, subcategory: e.target.value})}
                    disabled={!formData.category}
                  >
                    <option value="">Select Subcategory</option>
                    {getSubcategories(formData.category).map(sub => (
                      <option key={sub.slug} value={sub.name}>{sub.name}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="mb-3">
                <label className="form-label">Image URL</label>
                <input
                  type="url"
                  className="form-control"
                  value={formData.image}
                  onChange={(e) => setFormData({...formData, image: e.target.value})}
                  required
                />
              </div>

              <div className="row">
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size S Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sizes.S}
                    onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, S: Number(e.target.value)}})}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size M Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sizes.M}
                    onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, M: Number(e.target.value)}})}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size L Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sizes.L}
                    onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, L: Number(e.target.value)}})}
                  />
                </div>
                <div className="col-md-3 mb-3">
                  <label className="form-label">Size XL Stock</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.sizes.XL}
                    onChange={(e) => setFormData({...formData, sizes: {...formData.sizes, XL: Number(e.target.value)}})}
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
                  />
                </div>
                <div className="col-md-4 mb-3">
                  <label className="form-label">Review Count</label>
                  <input
                    type="number"
                    className="form-control"
                    value={formData.reviewCount}
                    onChange={(e) => setFormData({...formData, reviewCount: Number(e.target.value)})}
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success" disabled={loading}>
                  {loading ? (
                    <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                  ) : (
                    <>{editingProduct ? 'Update Product' : 'Add Product'}</>
                  )}
                </button>
                <button type="button" className="btn btn-secondary" onClick={resetForm}>
                  Cancel
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

      <div className="card">
        <div className="card-header">
          <h5>Products ({products.length})</h5>
        </div>
        <div className="card-body">
          <div className="table-responsive">
            <table className="table table-striped">
              <thead>
                <tr>
                  <th>Image</th>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Category</th>
                  <th>Subcategory</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((product) => (
                  <tr key={product.id}>
                    <td>
                      <img src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} />
                    </td>
                    <td>{product.name}</td>
                    <td>{product.code}</td>
                    <td>{typeof product.category === 'string' ? product.category : product.category.name}</td>
                    <td>{product.subcategory || '-'}</td>
                    <td>₹{product.price}</td>
                    <td>
                      {typeof product.sizes === 'object' ? 
                        Object.values(product.sizes).reduce((a, b) => a + b, 0) : 0}
                    </td>
                    <td>
                      <span className={`badge ${product.status === 'instock' ? 'bg-success' : 'bg-danger'}`}>
                        {product.status}
                      </span>
                    </td>
                    <td>
                      <button 
                        className="btn btn-sm btn-outline-primary me-2"
                        onClick={() => startEdit(product)}
                      >
                        <i className="bi bi-pencil"></i>
                      </button>
                      <button 
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(product)}
                        disabled={deleting === String(product._id || product.id)}
                      >
                        {deleting === String(product._id || product.id) ? (
                          <i className="bi bi-hourglass-split"></i>
                        ) : (
                          <i className="bi bi-trash"></i>
                        )}
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