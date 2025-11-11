'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

export default function DesignDetails() {
  const params = useParams();
  const [design, setDesign] = useState<any>(null);
  const [orderData, setOrderData] = useState({
    designCode: '',
    designType: '',
    fabricOption: 'own',
    colorStyleNotes: '',
    quantity: 1,
    chest: '',
    waist: '',
    hip: '',
    height: '',
    sleeveLength: '',
    shoulderWidth: '',
    measurementOption: 'manual',
    deliveryDate: '',
    orderType: 'pre-order',
    fittingOption: 'shop',
    specialInstructions: '',
    estimatedPrice: 0,
    advancePayment: 0,
    paymentMethod: 'cash'
  });
  const [selectedFabric, setSelectedFabric] = useState('');

  useEffect(() => {
    fetchDesign();
  }, [params.id]);

  const fetchDesign = async () => {
    const response = await fetch(`/api/designs/${params.id}`);
    const data = await response.json();
    setDesign(data);
  };

  const handleOrder = async () => {
    const finalOrderData = {
      designId: params.id,
      designName: design.name,
      designCode: orderData.designCode || design.name,
      designType: orderData.designType || design.category,
      ...orderData,
      selectedFabric: orderData.fabricOption === 'purchase' ? selectedFabric : null,
      customerInfo: {
        name: 'Customer Name',
        email: 'customer@email.com',
        phone: '+1234567890'
      }
    };

    const response = await fetch('/api/tailoring/orders', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(finalOrderData)
    });

    if (response.ok) {
      const result = await response.json();
      alert(`Order placed successfully! Reference: ${result.orderNumber}`);
    }
  };

  if (!design) return <div>Loading...</div>;

  return (
    <div className="container py-4">
      <div className="row">
        <div className="col-md-6">
          <h2>{design.name}</h2>
          <p>{design.description}</p>
          <p className="h4 text-success">Rs. {design.priceRange.min} - Rs. {design.priceRange.max}</p>
          <span className="badge bg-primary">{design.category}</span>
        </div>
        
        <div className="col-md-6">
          <div className="card">
            <div className="card-header">
              <h5>Design Selection</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Design Code/Name"
                    value={orderData.designCode}
                    onChange={(e) => setOrderData({...orderData, designCode: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <select
                    className="form-control"
                    value={orderData.designType}
                    onChange={(e) => setOrderData({...orderData, designType: e.target.value})}
                  >
                    <option value="">Design Type</option>
                    <option value="shirt">Shirt</option>
                    <option value="dress">Dress</option>
                    <option value="blouse">Blouse</option>
                    <option value="trouser">Trouser</option>
                  </select>
                </div>
                <div className="col-md-6">
                  <input
                    type="text"
                    className="form-control"
                    placeholder="Color/Style Notes"
                    value={orderData.colorStyleNotes}
                    onChange={(e) => setOrderData({...orderData, colorStyleNotes: e.target.value})}
                  />
                </div>
                <div className="col-md-6">
                  <input
                    type="number"
                    className="form-control"
                    placeholder="Quantity"
                    min="1"
                    value={orderData.quantity}
                    onChange={(e) => setOrderData({...orderData, quantity: Number(e.target.value)})}
                  />
                </div>
              </div>
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5>Measurements</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="measurementOption"
                    value="manual"
                    checked={orderData.measurementOption === 'manual'}
                    onChange={(e) => setOrderData({...orderData, measurementOption: e.target.value})}
                  />
                  <label className="form-check-label">Manual Entry</label>
                </div>
                <div className="form-check form-check-inline">
                  <input
                    className="form-check-input"
                    type="radio"
                    name="measurementOption"
                    value="pickup"
                    checked={orderData.measurementOption === 'pickup'}
                    onChange={(e) => setOrderData({...orderData, measurementOption: e.target.value})}
                  />
                  <label className="form-check-label">Request Pickup</label>
                </div>
              </div>
              
              {orderData.measurementOption === 'manual' && (
                <div className="row g-3">
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Chest/Bust (inches)"
                      value={orderData.chest}
                      onChange={(e) => setOrderData({...orderData, chest: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Waist (inches)"
                      value={orderData.waist}
                      onChange={(e) => setOrderData({...orderData, waist: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Hip (inches)"
                      value={orderData.hip}
                      onChange={(e) => setOrderData({...orderData, hip: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Height"
                      value={orderData.height}
                      onChange={(e) => setOrderData({...orderData, height: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Sleeve Length"
                      value={orderData.sleeveLength}
                      onChange={(e) => setOrderData({...orderData, sleeveLength: e.target.value})}
                    />
                  </div>
                  <div className="col-md-6">
                    <input
                      type="text"
                      className="form-control"
                      placeholder="Shoulder Width"
                      value={orderData.shoulderWidth}
                      onChange={(e) => setOrderData({...orderData, shoulderWidth: e.target.value})}
                    />
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5>Fabric Selection</h5>
            </div>
            <div className="card-body">
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="fabricOption"
                  value="own"
                  checked={orderData.fabricOption === 'own'}
                  onChange={(e) => setOrderData({...orderData, fabricOption: e.target.value})}
                />
                <label className="form-check-label">Bring Own Fabric</label>
              </div>
              <div className="form-check">
                <input
                  className="form-check-input"
                  type="radio"
                  name="fabricOption"
                  value="purchase"
                  checked={orderData.fabricOption === 'purchase'}
                  onChange={(e) => setOrderData({...orderData, fabricOption: e.target.value})}
                />
                <label className="form-check-label">Purchase from Tailor</label>
              </div>
              
              {orderData.fabricOption === 'purchase' && (
                <select
                  className="form-select mt-2"
                  value={selectedFabric}
                  onChange={(e) => setSelectedFabric(e.target.value)}
                >
                  <option value="">Select Fabric</option>
                  <option value="cotton">Cotton - Rs. 2000/yard</option>
                  <option value="silk">Silk - Rs. 5000/yard</option>
                  <option value="linen">Linen - Rs. 3000/yard</option>
                  <option value="wool">Wool - Rs. 4000/yard</option>
                </select>
              )}
            </div>
          </div>

          <div className="card mt-3">
            <div className="card-header">
              <h5>Order Preferences</h5>
            </div>
            <div className="card-body">
              <div className="row g-3">
                <div className="col-md-6">
                  <label className="form-label">Delivery Date</label>
                  <input
                    type="date"
                    className="form-control"
                    value={orderData.deliveryDate}
                    onChange={(e) => setOrderData({...orderData, deliveryDate: e.target.value})}
                    min={new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]}
                  />
                </div>
                <div className="col-md-6">
                  <label className="form-label">Payment Method</label>
                  <select
                    className="form-control"
                    value={orderData.paymentMethod}
                    onChange={(e) => setOrderData({...orderData, paymentMethod: e.target.value})}
                  >
                    <option value="cash">Cash on Delivery</option>
                    <option value="online">Online Payment</option>
                    <option value="bank">Bank Transfer</option>
                  </select>
                </div>
                <div className="col-12">
                  <label className="form-label">Special Instructions</label>
                  <textarea
                    className="form-control"
                    rows={3}
                    placeholder="Any special requests..."
                    value={orderData.specialInstructions}
                    onChange={(e) => setOrderData({...orderData, specialInstructions: e.target.value})}
                  />
                </div>
              </div>
            </div>
          </div>

          <button className="btn btn-success btn-lg w-100 mt-3" onClick={handleOrder}>
            Place Pre-Order
          </button>
        </div>
      </div>
    </div>
  );
}