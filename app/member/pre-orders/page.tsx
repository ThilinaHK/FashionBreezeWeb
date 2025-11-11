'use client';

import { useState, useEffect } from 'react';

export default function MemberPreOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedImages, setSelectedImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const response = await fetch('/api/member/pre-orders');
      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      'pending': 'bg-warning',
      'approved': 'bg-info',
      'in_progress': 'bg-primary',
      'ready': 'bg-success',
      'delivered': 'bg-dark',
      'rejected': 'bg-danger'
    };
    return badges[status as keyof typeof badges] || 'bg-secondary';
  };

  return (
    <div className="container py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>My Pre-Orders</h2>
        <a href="/tailoring/browse" className="btn btn-primary">
          + New Pre-Order
        </a>
      </div>

      {loading ? (
        <div className="text-center py-5">
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : orders.length === 0 ? (
        <div className="text-center py-5">
          <h4>No Pre-Orders Found</h4>
          <p className="text-muted">You haven't placed any tailoring orders yet.</p>
          <a href="/tailoring/browse" className="btn btn-primary">Browse Designs</a>
        </div>
      ) : (
        <div className="row">
          {orders.map((order) => (
            <div key={order._id} className="col-md-6 mb-4">
              <div className="card">
                <div className="card-header d-flex justify-content-between">
                  <span className="fw-bold">{order.orderNumber}</span>
                  <span className={`badge ${getStatusBadge(order.status)}`}>
                    {order.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {order.designImages && order.designImages.length > 0 && (
                  <div className="position-relative overflow-hidden" style={{ height: '200px' }}>
                    <img 
                      src={order.designImages[0]} 
                      alt={order.designName}
                      className="w-100 h-100 object-fit-cover cursor-pointer"
                      onClick={() => {
                        setSelectedImages(order.designImages);
                        setCurrentImageIndex(0);
                        setShowSlideshow(true);
                      }}
                    />
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark bg-opacity-75">
                        <i className="bi bi-images"></i> {order.designImages.length}
                      </span>
                    </div>
                    <div className="position-absolute bottom-0 start-0 end-0 p-2" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                      <button 
                        className="btn btn-sm btn-light btn-outline-primary"
                        onClick={(e) => {
                          e.stopPropagation();
                          setSelectedImages(order.designImages);
                          setCurrentImageIndex(0);
                          setShowSlideshow(true);
                        }}
                      >
                        <i className="bi bi-play-circle"></i> Slideshow
                      </button>
                    </div>
                  </div>
                )}
                <div className="card-body">
                  <h5 className="card-title d-flex align-items-center">
                    <i className="bi bi-scissors me-2 text-primary"></i>
                    {order.designName}
                  </h5>
                  <p className="card-text">
                    <strong><i className="bi bi-tag"></i> Type:</strong> {order.designType}<br/>
                    <strong><i className="bi bi-box"></i> Quantity:</strong> {order.quantity}<br/>
                    <strong><i className="bi bi-calendar"></i> Delivery:</strong> {new Date(order.deliveryDate).toLocaleDateString()}<br/>
                    <strong><i className="bi bi-person-check"></i> Fitting:</strong> {order.fittingOption}
                  </p>
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="text-success fw-bold">
                      <i className="bi bi-currency-rupee"></i> {order.estimatedPrice}
                    </span>
                    <a href={`/member/pre-orders/${order._id}`} className="btn btn-sm btn-primary">
                      <i className="bi bi-eye"></i> View Details
                    </a>
                  </div>
                </div>
                <div className="card-footer text-muted">
                  Ordered: {new Date(order.createdAt).toLocaleDateString()}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Slideshow Modal */}
      {showSlideshow && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 position-absolute top-0 start-0 end-0 z-3">
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <span className="text-white">
                    <i className="bi bi-images"></i> {currentImageIndex + 1} / {selectedImages.length}
                  </span>
                  <button 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowSlideshow(false)}
                  ></button>
                </div>
              </div>
              
              <div className="modal-body d-flex align-items-center justify-content-center p-0 position-relative">
                <img 
                  src={selectedImages[currentImageIndex]} 
                  alt={`Design ${currentImageIndex + 1}`}
                  className="img-fluid" 
                  style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                />
                
                {selectedImages.length > 1 && (
                  <>
                    <button 
                      className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-3"
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : selectedImages.length - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button 
                      className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-3"
                      onClick={() => setCurrentImageIndex(prev => prev < selectedImages.length - 1 ? prev + 1 : 0)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>
              
              {selectedImages.length > 1 && (
                <div className="position-absolute bottom-0 start-0 end-0 p-3">
                  <div className="d-flex justify-content-center gap-2">
                    {selectedImages.map((img, index) => (
                      <div 
                        key={index}
                        className={`border rounded cursor-pointer ${index === currentImageIndex ? 'border-primary border-3' : 'border-light'}`}
                        style={{ width: '60px', height: '60px' }}
                        onClick={() => setCurrentImageIndex(index)}
                      >
                        <img 
                          src={img} 
                          alt={`Thumbnail ${index + 1}`}
                          className="w-100 h-100 object-fit-cover rounded"
                        />
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}