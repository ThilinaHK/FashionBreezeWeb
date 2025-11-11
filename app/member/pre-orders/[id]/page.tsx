'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function OrderDetails() {
  const params = useParams();
  const [order, setOrder] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showSlideshow, setShowSlideshow] = useState(false);

  useEffect(() => {
    fetchOrder();
  }, [params.id]);

  const fetchOrder = async () => {
    try {
      const response = await fetch(`/api/member/pre-orders/${params.id}`);
      const data = await response.json();
      setOrder(data);
    } catch (error) {
      console.error('Error fetching order:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="container py-4"><div>Loading...</div></div>;
  if (!order) return <div className="container py-4"><div>Order not found</div></div>;

  return (
    <div className="container py-4">
      <div className="row mb-4">
        <div className="col-12">
          <div className="card border-0 shadow-sm bg-gradient" style={{ background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)' }}>
            <div className="card-body text-white">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h2 className="mb-1"><i className="bi bi-receipt"></i> Order Details</h2>
                  <p className="mb-0 opacity-75">Complete information about your tailoring order</p>
                </div>
                <a href="/member/pre-orders" className="btn btn-light">
                  <i className="bi bi-arrow-left"></i> Back to Orders
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Design Images Gallery */}
      {order.designImages && order.designImages.length > 0 && (
        <div className="card mb-4">
          <div className="card-header">
            <h5><i className="bi bi-images"></i> Design Gallery</h5>
          </div>
          <div className="card-body">
            <div className="row g-2">
              {order.designImages.map((image: string, index: number) => (
                <div key={index} className="col-md-2 col-4">
                  <div 
                    className="position-relative overflow-hidden rounded cursor-pointer shadow-sm"
                    style={{ aspectRatio: '1', cursor: 'pointer' }}
                    onClick={() => {
                      setCurrentImageIndex(index);
                      setShowSlideshow(true);
                    }}
                  >
                    <img 
                      src={image} 
                      alt={`Design view ${index + 1}`}
                      className="w-100 h-100 object-fit-cover hover-zoom"
                      style={{ transition: 'transform 0.3s ease' }}
                      onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                      onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                    />
                    <div className="position-absolute top-0 end-0 m-1">
                      <span className="badge bg-dark bg-opacity-75">
                        <i className="bi bi-play-circle"></i>
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-2">
              <p className="text-muted mb-0">
                <i className="bi bi-info-circle"></i> Click on any image to start slideshow
              </p>
              <button 
                className="btn btn-sm btn-primary"
                onClick={() => {
                  setCurrentImageIndex(0);
                  setShowSlideshow(true);
                }}
              >
                <i className="bi bi-play-circle"></i> Start Slideshow
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="row">
        <div className="col-lg-8">
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-white border-0">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <h5 className="mb-1"><i className="bi bi-receipt-cutoff text-primary"></i> Order #{order.orderNumber}</h5>
                  <small className="text-muted">Placed on {new Date(order.createdAt).toLocaleDateString()}</small>
                </div>
                <span className={`badge fs-6 px-3 py-2 ${
                  order.status === 'pending' ? 'bg-warning' :
                  order.status === 'approved' ? 'bg-info' :
                  order.status === 'in_progress' ? 'bg-primary' :
                  order.status === 'ready' ? 'bg-success' : 'bg-dark'
                }`}>
                  <i className="bi bi-circle-fill me-1" style={{ fontSize: '0.5rem' }}></i>
                  {order.status.replace('_', ' ').toUpperCase()}
                </span>
              </div>
            </div>
            <div className="card-body">
              <div className="row">
                <div className="col-md-6">
                  <h6>Design Information</h6>
                  <p><strong>Design:</strong> {order.designName}</p>
                  <p><strong>Type:</strong> {order.designType}</p>
                  <p><strong>Code:</strong> {order.designCode}</p>
                  <p><strong>Quantity:</strong> {order.quantity}</p>
                  {order.colorStyleNotes && <p><strong>Style Notes:</strong> {order.colorStyleNotes}</p>}
                </div>
                <div className="col-md-6">
                  <h6>Order Preferences</h6>
                  <p><strong>Order Type:</strong> {order.orderType}</p>
                  <p><strong>Delivery Date:</strong> {new Date(order.deliveryDate).toLocaleDateString()}</p>
                  <p><strong>Fitting:</strong> {order.fittingOption}</p>
                  <p><strong>Payment:</strong> {order.paymentMethod}</p>
                </div>
              </div>
              
              {order.measurementOption === 'manual' && (
                <div className="mt-4">
                  <h6>Measurements</h6>
                  <div className="row">
                    <div className="col-md-4">
                      <p><strong>Chest:</strong> {order.chest}</p>
                      <p><strong>Waist:</strong> {order.waist}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Hip:</strong> {order.hip}</p>
                      <p><strong>Height:</strong> {order.height}</p>
                    </div>
                    <div className="col-md-4">
                      <p><strong>Sleeve:</strong> {order.sleeveLength}</p>
                      <p><strong>Shoulder:</strong> {order.shoulderWidth}</p>
                    </div>
                  </div>
                </div>
              )}

              {order.specialInstructions && (
                <div className="mt-4">
                  <h6>Special Instructions</h6>
                  <p>{order.specialInstructions}</p>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="col-lg-4">
          <div className="card border-0 shadow-sm mb-3">
            <div className="card-header bg-success text-white">
              <h6 className="mb-0"><i className="bi bi-credit-card"></i> Payment Summary</h6>
            </div>
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-light rounded">
                <span><i className="bi bi-tag"></i> Estimated Price:</span>
                <span className="fw-bold">Rs. {order.estimatedPrice}</span>
              </div>
              <div className="d-flex justify-content-between align-items-center mb-2 p-2 bg-success bg-opacity-10 rounded">
                <span><i className="bi bi-check-circle text-success"></i> Advance Paid:</span>
                <span className="text-success fw-bold">Rs. {order.advancePayment}</span>
              </div>
              <hr className="my-3"/>
              <div className="d-flex justify-content-between align-items-center p-3 bg-primary bg-opacity-10 rounded">
                <span className="fw-bold"><i className="bi bi-wallet"></i> Balance Due:</span>
                <span className="fw-bold fs-5 text-primary">Rs. {order.estimatedPrice - order.advancePayment}</span>
              </div>
            </div>
          </div>

          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h6 className="mb-0"><i className="bi bi-clock-history"></i> Order Timeline</h6>
            </div>
            <div className="card-body">
              <div className="timeline">
                <div className="d-flex align-items-center mb-3 p-2 bg-light rounded">
                  <div className="bg-primary rounded-circle p-2 me-3">
                    <i className="bi bi-plus text-white"></i>
                  </div>
                  <div>
                    <strong>Order Placed</strong><br/>
                    <small className="text-muted">{new Date(order.createdAt).toLocaleDateString()}</small>
                  </div>
                </div>
                {order.updatedAt && (
                  <div className="d-flex align-items-center p-2 bg-light rounded">
                    <div className="bg-info rounded-circle p-2 me-3">
                      <i className="bi bi-arrow-clockwise text-white"></i>
                    </div>
                    <div>
                      <strong>Last Updated</strong><br/>
                      <small className="text-muted">{new Date(order.updatedAt).toLocaleDateString()}</small>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Slideshow Modal */}
      {showSlideshow && order.designImages && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.9)' }}>
          <div className="modal-dialog modal-fullscreen">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 position-absolute top-0 start-0 end-0 z-3">
                <div className="d-flex justify-content-between w-100 align-items-center">
                  <span className="text-white">
                    <i className="bi bi-images"></i> {currentImageIndex + 1} / {order.designImages.length}
                  </span>
                  <button 
                    className="btn-close btn-close-white" 
                    onClick={() => setShowSlideshow(false)}
                  ></button>
                </div>
              </div>
              
              <div className="modal-body d-flex align-items-center justify-content-center p-0 position-relative">
                <img 
                  src={order.designImages[currentImageIndex]} 
                  alt={`Design ${currentImageIndex + 1}`}
                  className="img-fluid" 
                  style={{ maxHeight: '90vh', maxWidth: '90vw' }}
                />
                
                {order.designImages.length > 1 && (
                  <>
                    <button 
                      className="btn btn-light position-absolute start-0 top-50 translate-middle-y ms-3"
                      onClick={() => setCurrentImageIndex(prev => prev > 0 ? prev - 1 : order.designImages.length - 1)}
                    >
                      <i className="bi bi-chevron-left"></i>
                    </button>
                    <button 
                      className="btn btn-light position-absolute end-0 top-50 translate-middle-y me-3"
                      onClick={() => setCurrentImageIndex(prev => prev < order.designImages.length - 1 ? prev + 1 : 0)}
                    >
                      <i className="bi bi-chevron-right"></i>
                    </button>
                  </>
                )}
              </div>
              
              {order.designImages.length > 1 && (
                <div className="position-absolute bottom-0 start-0 end-0 p-3">
                  <div className="d-flex justify-content-center gap-2 flex-wrap">
                    {order.designImages.map((img: string, index: number) => (
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