'use client';

import { useState, useEffect } from 'react';

export default function PremiumCollection() {
  const [activeTab, setActiveTab] = useState('collection');
  const [preOrders, setPreOrders] = useState<any[]>([]);
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);

  const premiumProducts = [
    {
      id: 1,
      name: 'Royal Silk Saree',
      price: 25000,
      originalPrice: 35000,
      image: 'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=500',
      category: 'Sarees',
      rating: 4.9,
      reviews: 127,
      badge: 'Bestseller'
    },
    {
      id: 2,
      name: 'Designer Lehenga',
      price: 45000,
      originalPrice: 60000,
      image: 'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=500',
      category: 'Lehengas',
      rating: 4.8,
      reviews: 89,
      badge: 'Limited Edition'
    },
    {
      id: 3,
      name: 'Premium Kurta Set',
      price: 8500,
      originalPrice: 12000,
      image: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=500',
      category: 'Kurtas',
      rating: 4.7,
      reviews: 156,
      badge: 'New Arrival'
    },
    {
      id: 4,
      name: 'Bridal Collection',
      price: 85000,
      originalPrice: 120000,
      image: 'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b5e?w=500',
      category: 'Bridal',
      rating: 5.0,
      reviews: 45,
      badge: 'Exclusive'
    }
  ];

  useEffect(() => {
    if (activeTab === 'preorders') {
      fetchPreOrders();
    }
  }, [activeTab]);

  const fetchPreOrders = async () => {
    setPreOrders([
      {
        id: 1,
        orderNumber: 'PO001',
        designName: 'Custom Wedding Dress',
        status: 'in_progress',
        estimatedPrice: 35000,
        deliveryDate: '2024-02-15',
        designImages: ['https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b5e?w=400']
      },
      {
        id: 2,
        orderNumber: 'PO002',
        designName: 'Silk Saree Blouse',
        status: 'approved',
        estimatedPrice: 8500,
        deliveryDate: '2024-01-28',
        designImages: ['https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400']
      }
    ]);
  };

  return (
    <div className="min-vh-100" style={{ background: 'linear-gradient(135deg, #f8f9fa 0%, #e8f5e8 100%)' }}>
      {/* Hero Section */}
      <div className="position-relative overflow-hidden" style={{ background: 'var(--gradient-primary)', minHeight: '60vh' }}>
        <div className="container py-5">
          <div className="row align-items-center min-vh-50">
            <div className="col-lg-6 text-white">
              <h1 className="display-3 fw-bold mb-4">Our Premium Collection</h1>
              <p className="lead mb-4 opacity-75">Discover exclusive designs crafted with the finest materials and exceptional attention to detail.</p>
              <div className="d-flex gap-3">
                <button 
                  className={`btn btn-lg px-4 ${activeTab === 'collection' ? 'btn-success' : 'btn-outline-light'}`}
                  onClick={() => setActiveTab('collection')}
                >
                  <i className="bi bi-gem me-2"></i>Premium Collection
                </button>
                <button 
                  className={`btn btn-lg px-4 ${activeTab === 'preorders' ? 'btn-success' : 'btn-outline-light'}`}
                  onClick={() => setActiveTab('preorders')}
                >
                  <i className="bi bi-scissors me-2"></i>My Pre-Orders
                </button>
              </div>
            </div>
            <div className="col-lg-6">
              <div className="position-relative">
                <img 
                  src="https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=600" 
                  alt="Premium Collection" 
                  className="img-fluid rounded-4 shadow-lg"
                  style={{ transform: 'rotate(2deg)' }}
                />
                <div className="position-absolute top-0 start-0 bg-success text-white px-3 py-2 rounded-3 m-3">
                  <i className="bi bi-star-fill me-1"></i>Premium Quality
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-5">
        {activeTab === 'collection' && (
          <div>
            {/* Stats Section */}
            <div className="row mb-5">
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-gem text-success fs-4"></i>
                    </div>
                    <h3 className="text-success fw-bold">50+</h3>
                    <p className="text-muted mb-0">Premium Designs</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-people text-success fs-4"></i>
                    </div>
                    <h3 className="text-success fw-bold">1000+</h3>
                    <p className="text-muted mb-0">Happy Customers</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-award text-success fs-4"></i>
                    </div>
                    <h3 className="text-success fw-bold">4.9</h3>
                    <p className="text-muted mb-0">Average Rating</p>
                  </div>
                </div>
              </div>
              <div className="col-md-3 mb-3">
                <div className="card border-0 shadow-sm h-100 text-center">
                  <div className="card-body">
                    <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                      <i className="bi bi-truck text-success fs-4"></i>
                    </div>
                    <h3 className="text-success fw-bold">7</h3>
                    <p className="text-muted mb-0">Days Delivery</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Premium Products Grid */}
            <div className="row">
              {premiumProducts.map((product) => (
                <div key={product.id} className="col-lg-6 mb-4">
                  <div className="card border-0 shadow-lg h-100 overflow-hidden" style={{ borderRadius: '20px' }}>
                    <div className="position-relative">
                      <img 
                        src={product.image} 
                        alt={product.name}
                        className="card-img-top"
                        style={{ height: '300px', objectFit: 'cover', cursor: 'pointer' }}
                        onClick={() => {
                          setSelectedImage(product.image);
                          setShowImageModal(true);
                        }}
                      />
                      <div className="position-absolute top-0 start-0 m-3">
                        <span className={`badge px-3 py-2 ${
                          product.badge === 'Bestseller' ? 'bg-warning text-dark' :
                          product.badge === 'Limited Edition' ? 'bg-danger' :
                          product.badge === 'New Arrival' ? 'bg-info' : 'bg-success'
                        }`}>
                          {product.badge}
                        </span>
                      </div>
                      <div className="position-absolute top-0 end-0 m-3">
                        <div className="bg-white bg-opacity-90 rounded-pill px-2 py-1">
                          <i className="bi bi-star-fill text-warning me-1"></i>
                          <small className="fw-bold">{product.rating}</small>
                        </div>
                      </div>
                    </div>
                    <div className="card-body p-4">
                      <div className="d-flex justify-content-between align-items-start mb-2">
                        <h5 className="card-title fw-bold mb-0">{product.name}</h5>
                        <span className="badge bg-light text-dark">{product.category}</span>
                      </div>
                      <div className="mb-3">
                        <span className="text-success fw-bold fs-4">Rs. {product.price.toLocaleString()}</span>
                        <span className="text-muted text-decoration-line-through ms-2">Rs. {product.originalPrice.toLocaleString()}</span>
                        <span className="badge bg-success ms-2">
                          {Math.round((1 - product.price / product.originalPrice) * 100)}% OFF
                        </span>
                      </div>
                      <div className="d-flex align-items-center mb-3">
                        <div className="text-warning me-2">
                          {[...Array(5)].map((_, i) => (
                            <i key={i} className={`bi bi-star${i < Math.floor(product.rating) ? '-fill' : ''}`}></i>
                          ))}
                        </div>
                        <small className="text-muted">({product.reviews} reviews)</small>
                      </div>
                      <div className="d-grid gap-2">
                        <button className="btn btn-success btn-lg">
                          <i className="bi bi-cart-plus me-2"></i>Add to Cart
                        </button>
                        <button className="btn btn-outline-success">
                          <i className="bi bi-heart me-2"></i>Add to Wishlist
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {activeTab === 'preorders' && (
          <div>
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h2 className="fw-bold">My Pre-Orders</h2>
              <a href="/tailoring/browse" className="btn btn-success">
                <i className="bi bi-plus-circle me-2"></i>New Pre-Order
              </a>
            </div>

            {preOrders.length === 0 ? (
              <div className="text-center py-5">
                <i className="bi bi-scissors display-4 text-muted mb-3"></i>
                <h4>No Pre-Orders Found</h4>
                <p className="text-muted">You haven't placed any tailoring orders yet.</p>
                <a href="/tailoring/browse" className="btn btn-success">Browse Designs</a>
              </div>
            ) : (
              <div className="row">
                {preOrders.map((order) => (
                  <div key={order.id} className="col-lg-6 mb-4">
                    <div className="card border-0 shadow-sm h-100" style={{ borderRadius: '15px' }}>
                      {order.designImages && order.designImages.length > 0 && (
                        <div className="position-relative">
                          <img 
                            src={order.designImages[0]} 
                            alt={order.designName}
                            className="card-img-top"
                            style={{ height: '200px', objectFit: 'cover', cursor: 'pointer' }}
                            onClick={() => {
                              setSelectedImage(order.designImages[0]);
                              setShowImageModal(true);
                            }}
                          />
                          <div className="position-absolute top-0 end-0 m-3">
                            <span className={`badge px-3 py-2 ${
                              order.status === 'pending' ? 'bg-warning text-dark' :
                              order.status === 'approved' ? 'bg-info' :
                              order.status === 'in_progress' ? 'bg-primary' :
                              order.status === 'ready' ? 'bg-success' : 'bg-secondary'
                            }`}>
                              {order.status.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}
                      <div className="card-body p-4">
                        <div className="d-flex justify-content-between align-items-start mb-3">
                          <h5 className="card-title fw-bold">{order.designName}</h5>
                          <span className="badge bg-light text-dark">{order.orderNumber}</span>
                        </div>
                        <div className="row g-3 mb-3">
                          <div className="col-6">
                            <small className="text-muted d-block">Estimated Price</small>
                            <span className="fw-bold text-success">Rs. {order.estimatedPrice?.toLocaleString()}</span>
                          </div>
                          <div className="col-6">
                            <small className="text-muted d-block">Delivery Date</small>
                            <span className="fw-bold">{new Date(order.deliveryDate).toLocaleDateString()}</span>
                          </div>
                        </div>
                        <div className="d-grid">
                          <a href={`/member/pre-orders/${order.id}`} className="btn btn-outline-success">
                            <i className="bi bi-eye me-2"></i>View Details
                          </a>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0">
                <button 
                  className="btn-close btn-close-white ms-auto" 
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img 
                  src={selectedImage} 
                  alt="Product view" 
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}