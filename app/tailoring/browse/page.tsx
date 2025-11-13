'use client';

import { useState, useEffect } from 'react';
import { TailoringDesign } from '../../types';

export default function BrowseDesigns() {
  const [designs, setDesigns] = useState<TailoringDesign[]>([]);
  const [filters, setFilters] = useState({
    category: '',
    occasion: '',
    priceRange: '',
    fabricType: ''
  });
  const [selectedImage, setSelectedImage] = useState<string>('');
  const [showImageModal, setShowImageModal] = useState(false);
  const [isRegistered, setIsRegistered] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  useEffect(() => {
    fetchDesigns();
    checkRegistration();
  }, []);

  const checkRegistration = () => {
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('userRegistered') === 'true';
      setIsRegistered(registered);
    }
  };

  const fetchDesigns = async () => {
    try {
      const response = await fetch('/api/designs');
      const data = await response.json();
      setDesigns(Array.isArray(data) ? data : []);
    } catch (error) {
      // Fallback sample designs if API fails
      setDesigns([
        {
          _id: '1',
          name: 'Classic Business Shirt',
          description: 'Professional tailored shirt perfect for office wear',
          category: 'shirts',
          priceRange: { min: 3500, max: 5000 },
          images: [
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400',
            'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=400',
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400'
          ],
          fabricTypes: ['Cotton', 'Linen'],
          measurements: ['chest', 'waist', 'sleeve'],
          isActive: true,
          createdBy: 'sample'
        },
        {
          _id: '2',
          name: 'Elegant Evening Dress',
          description: 'Beautiful custom dress for special occasions',
          category: 'dresses',
          priceRange: { min: 8000, max: 12000 },
          images: [
            'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b5e?w=400',
            'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'
          ],
          fabricTypes: ['Silk', 'Chiffon'],
          measurements: ['bust', 'waist', 'hip', 'length'],
          isActive: true,
          createdBy: 'sample'
        },
        {
          _id: '3',
          name: 'Traditional Saree Jacket',
          description: 'Beautifully crafted saree blouse with intricate details',
          category: 'saree-jackets',
          priceRange: { min: 4000, max: 7000 },
          images: [
            'https://images.unsplash.com/photo-1583391733956-6c78276477e2?w=400',
            'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400'
          ],
          fabricTypes: ['Silk', 'Brocade'],
          measurements: ['bust', 'waist', 'sleeve'],
          isActive: true,
          createdBy: 'sample'
        },
        {
          _id: '4',
          name: 'Formal Trousers',
          description: 'Perfectly fitted formal trousers for any occasion',
          category: 'trousers',
          priceRange: { min: 2500, max: 4000 },
          images: [
            'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400'
          ],
          fabricTypes: ['Wool', 'Cotton'],
          measurements: ['waist', 'hip', 'length'],
          isActive: true,
          createdBy: 'sample'
        },
        {
          _id: '5',
          name: 'Wedding Lehenga Choli',
          description: 'Stunning bridal outfit with heavy embroidery work',
          category: 'dresses',
          priceRange: { min: 15000, max: 25000 },
          images: [
            'https://images.unsplash.com/photo-1583391733981-24c4d5d3e9b2?w=400',
            'https://images.unsplash.com/photo-1594736797933-d0401ba2fe65?w=400',
            'https://images.unsplash.com/photo-1566479179817-c0ae8e5b4b5e?w=400'
          ],
          fabricTypes: ['Silk', 'Velvet', 'Brocade'],
          measurements: ['bust', 'waist', 'hip', 'length'],
          isActive: true,
          createdBy: 'sample'
        },
        {
          _id: '6',
          name: 'Casual Cotton Shirt',
          description: 'Comfortable everyday shirt with modern fit',
          category: 'shirts',
          priceRange: { min: 2000, max: 3500 },
          images: [
            'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400',
            'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400'
          ],
          fabricTypes: ['Cotton'],
          measurements: ['chest', 'waist', 'sleeve'],
          isActive: true,
          createdBy: 'sample'
        }
      ]);
    }
  };

  const filteredDesigns = designs.filter(design => {
    if (filters.category && design.category !== filters.category) return false;
    if (filters.priceRange) {
      const [min, max] = filters.priceRange.split('-').map(Number);
      if (design.priceRange.min < min || design.priceRange.max > max) return false;
    }
    return true;
  });

  return (
    <div className="container-fluid py-4">
      <div className="row">
        {/* Sidebar Filters */}
        <div className="col-lg-3 mb-4">
          <div className="card border-0 shadow-sm sticky-top" style={{ top: '20px' }}>
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-funnel me-2"></i>Filters</h5>
            </div>
            <div className="card-body">
              {/* Search */}
              <div className="mb-4">
                <label className="form-label fw-bold">Search Designs</label>
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search by name..."
                    value={filters.fabricType}
                    onChange={(e) => setFilters({...filters, fabricType: e.target.value})}
                  />
                  <span className="input-group-text"><i className="bi bi-search"></i></span>
                </div>
              </div>
              
              {/* Category Filter */}
              <div className="mb-4">
                <label className="form-label fw-bold">Category</label>
                <select className="form-select" value={filters.category} onChange={(e) => setFilters({...filters, category: e.target.value})}>
                  <option value="">All Categories</option>
                  <option value="shirts">Shirts</option>
                  <option value="dresses">Dresses</option>
                  <option value="saree-jackets">Saree Jackets</option>
                  <option value="trousers">Trousers</option>
                </select>
              </div>
              
              {/* Occasion Filter */}
              <div className="mb-4">
                <label className="form-label fw-bold">Occasion</label>
                <select className="form-select" value={filters.occasion} onChange={(e) => setFilters({...filters, occasion: e.target.value})}>
                  <option value="">All Occasions</option>
                  <option value="casual">Casual</option>
                  <option value="office">Office</option>
                  <option value="wedding">Wedding</option>
                  <option value="party">Party</option>
                </select>
              </div>
              
              {/* Price Range Filter */}
              <div className="mb-4">
                <label className="form-label fw-bold">Price Range</label>
                <select className="form-select" value={filters.priceRange} onChange={(e) => setFilters({...filters, priceRange: e.target.value})}>
                  <option value="">All Prices</option>
                  <option value="0-3000">Under Rs. 3,000</option>
                  <option value="3000-8000">Rs. 3,000 - 8,000</option>
                  <option value="8000-15000">Rs. 8,000 - 15,000</option>
                  <option value="15000-999999">Above Rs. 15,000</option>
                </select>
              </div>
              
              {/* Clear Filters */}
              <button 
                className="btn btn-outline-success w-100"
                onClick={() => setFilters({ category: '', occasion: '', priceRange: '', fabricType: '' })}
              >
                <i className="bi bi-arrow-clockwise me-2"></i>Clear All Filters
              </button>
            </div>
          </div>
        </div>
        
        {/* Main Content */}
        <div className="col-lg-9">
          <div className="d-flex justify-content-between align-items-center mb-4">
            <h2 className="mb-0">Browse Tailoring Designs</h2>
            <span className="text-muted">{filteredDesigns.length} designs found</span>
          </div>

          {filteredDesigns.length === 0 ? (
            <div className="text-center py-5">
              <i className="bi bi-search display-4 text-muted mb-3"></i>
              <h4>No designs found</h4>
              <p className="text-muted">Try adjusting your filters or check back later for new designs.</p>
            </div>
          ) : (
            <div className="row">
              {filteredDesigns.map((design) => (
          <div key={design._id} className="col-md-4 mb-4">
            <div className="card h-100 shadow-sm">
              {design.images && design.images.length > 0 && (
                <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                  <img 
                    src={design.images[0]} 
                    alt={design.name}
                    className="w-100 h-100 object-fit-cover cursor-pointer"
                    style={{ cursor: 'pointer', transition: 'transform 0.3s ease' }}
                    onClick={() => {
                      setSelectedImage(design.images[0]);
                      setShowImageModal(true);
                    }}
                    onMouseEnter={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                    onMouseLeave={(e) => e.currentTarget.style.transform = 'scale(1)'}
                  />
                  {design.images.length > 1 && (
                    <div className="position-absolute top-0 end-0 m-2">
                      <span className="badge bg-dark bg-opacity-75">
                        <i className="bi bi-images"></i> {design.images.length}
                      </span>
                    </div>
                  )}
                  <div className="position-absolute bottom-0 start-0 end-0 p-2 bg-gradient" style={{ background: 'linear-gradient(transparent, rgba(0,0,0,0.7))' }}>
                    <span className="badge bg-primary">{design.category}</span>
                  </div>
                </div>
              )}
              <div className="card-body">
                <h5 className="card-title d-flex align-items-center">
                  <i className="bi bi-scissors me-2 text-primary"></i>
                  {design.name}
                </h5>
                <p className="card-text text-muted">{design.description}</p>
                <div className="d-flex justify-content-between align-items-center mb-3">
                  <span className="text-success fw-bold">
                    <i className="bi bi-currency-rupee"></i> {design.priceRange.min} - {design.priceRange.max}
                  </span>
                </div>
                {design.images && design.images.length > 1 && (
                  <div className="mb-3">
                    <div className="d-flex gap-1 flex-wrap">
                      {design.images.slice(1, 4).map((image, index) => (
                        <div 
                          key={index}
                          className="position-relative overflow-hidden rounded cursor-pointer"
                          style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                          onClick={() => {
                            setSelectedImage(image);
                            setShowImageModal(true);
                          }}
                        >
                          <img 
                            src={image} 
                            alt={`${design.name} view ${index + 2}`}
                            className="w-100 h-100 object-fit-cover"
                          />
                        </div>
                      ))}
                      {design.images.length > 4 && (
                        <div 
                          className="d-flex align-items-center justify-content-center bg-light rounded cursor-pointer"
                          style={{ width: '50px', height: '50px', cursor: 'pointer' }}
                          onClick={() => window.location.href = `/tailoring/design/${design._id}`}
                        >
                          <small className="text-muted">+{design.images.length - 4}</small>
                        </div>
                      )}
                    </div>
                  </div>
                )}
                <div className="d-grid">
                  {isRegistered ? (
                    <a href={`/tailoring/design/${design._id}`} className="btn btn-primary">
                      <i className="bi bi-eye"></i> View Details & Order
                    </a>
                  ) : (
                    <button 
                      className="btn btn-primary" 
                      onClick={() => setShowRegisterModal(true)}
                    >
                      <i className="bi bi-person-plus"></i> Register to Order
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Modal */}
      {showImageModal && (
        <div 
          className="modal fade show d-block" 
          style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}
          onClick={() => setShowImageModal(false)}
        >
          <div className="modal-dialog modal-lg modal-dialog-centered">
            <div className="modal-content bg-transparent border-0">
              <div className="modal-header border-0 pb-0">
                <button 
                  type="button" 
                  className="btn-close btn-close-white ms-auto" 
                  onClick={() => setShowImageModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center p-0">
                <img 
                  src={selectedImage} 
                  alt="Design view" 
                  className="img-fluid rounded shadow-lg"
                  style={{ maxHeight: '80vh' }}
                />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Registration Required Modal */}
      {showRegisterModal && (
        <div className="modal fade show d-block" style={{ backgroundColor: 'rgba(0,0,0,0.8)' }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content" style={{ borderRadius: '15px' }}>
              <div className="modal-header border-0 text-center">
                <div className="w-100">
                  <div className="bg-success bg-opacity-10 rounded-circle d-inline-flex align-items-center justify-content-center mb-3" style={{ width: '60px', height: '60px' }}>
                    <i className="bi bi-person-plus text-success fs-3"></i>
                  </div>
                  <h4 className="modal-title fw-bold">Member Registration Required</h4>
                </div>
                <button 
                  className="btn-close" 
                  onClick={() => setShowRegisterModal(false)}
                ></button>
              </div>
              <div className="modal-body text-center px-4">
                <p className="text-muted mb-4">
                  To place tailoring orders and access our premium services, please register as a member.
                </p>
                <div className="row g-3 mb-4">
                  <div className="col-4">
                    <div className="text-success">
                      <i className="bi bi-scissors fs-4 d-block mb-2"></i>
                      <small>Custom Tailoring</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-success">
                      <i className="bi bi-images fs-4 d-block mb-2"></i>
                      <small>Design Gallery</small>
                    </div>
                  </div>
                  <div className="col-4">
                    <div className="text-success">
                      <i className="bi bi-truck fs-4 d-block mb-2"></i>
                      <small>Order Tracking</small>
                    </div>
                  </div>
                </div>
              </div>
              <div className="modal-footer border-0 justify-content-center">
                <a href="/register" className="btn btn-success btn-lg px-4">
                  <i className="bi bi-person-plus me-2"></i>Register Now
                </a>
                <a href="/login" className="btn btn-outline-success px-4">
                  <i className="bi bi-box-arrow-in-right me-2"></i>Login
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}