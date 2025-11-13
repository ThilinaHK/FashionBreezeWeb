'use client';

import { useState, useEffect } from 'react';
import { TailoringDesign } from '../../types';

export default function DesignManagement() {
  const [designs, setDesigns] = useState<TailoringDesign[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState<Partial<TailoringDesign>>({
    name: '',
    description: '',
    images: [],
    fabricTypes: [],
    priceRange: { min: 0, max: 0 },
    measurements: [],
    category: '',
    createdBy: 'admin'
  });

  useEffect(() => {
    fetchDesigns();
  }, []);

  const fetchDesigns = async () => {
    const response = await fetch('/api/designs');
    const data = await response.json();
    setDesigns(data);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const response = await fetch('/api/designs', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData)
    });
    
    if (response.ok) {
      fetchDesigns();
      setShowForm(false);
    }
  };

  return (
    <div className="container-fluid">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2>Design Management</h2>
        <button className="btn btn-primary" onClick={() => setShowForm(true)}>
          Add Design
        </button>
      </div>

      {showForm && (
        <div className="card mb-4">
          <div className="card-body">
            <form onSubmit={handleSubmit}>
              <div className="row">
                <div className="col-md-6 mb-3">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Design Name"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                    required
                  />
                </div>
                <div className="col-md-6 mb-3">
                  <select
                    className="form-control"
                    value={formData.category}
                    onChange={(e) => setFormData({...formData, category: e.target.value})}
                    required
                  >
                    <option value="">Select Category</option>
                    <option value="shirts">Shirts</option>
                    <option value="dresses">Dresses</option>
                    <option value="saree-jackets">Saree Jackets</option>
                    <option value="trousers">Trousers</option>
                  </select>
                </div>
              </div>
              
              <textarea
                className="form-control mb-3"
                rows={3}
                placeholder="Description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                required
              />

              <div className="row mb-3">
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Min Price"
                    value={formData.priceRange?.min}
                    onChange={(e) => setFormData({
                      ...formData, 
                      priceRange: {...formData.priceRange!, min: Number(e.target.value)}
                    })}
                    required
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Max Price"
                    value={formData.priceRange?.max}
                    onChange={(e) => setFormData({
                      ...formData, 
                      priceRange: {...formData.priceRange!, max: Number(e.target.value)}
                    })}
                    required
                  />
                </div>
              </div>

              <div className="d-flex gap-2">
                <button type="submit" className="btn btn-success">Save</button>
                <button type="button" className="btn btn-secondary" onClick={() => setShowForm(false)}>
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="row">
        {designs.map((design) => (
          <div key={design._id} className="col-md-4 mb-4">
            <div className="card">
              <div className="card-body">
                <h5>{design.name}</h5>
                <p className="text-muted">{design.description}</p>
                <p>${design.priceRange.min} - ${design.priceRange.max}</p>
                <span className="badge bg-primary">{design.category}</span>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}