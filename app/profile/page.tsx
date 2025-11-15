'use client';

import { useState, useEffect } from 'react';
// import { useSocket } from '../components/SocketProvider';

interface Customer {
  name: string;
  email: string;
  phone: string;
  country: string;
  address?: {
    line1: string;
    line2?: string;
    line3?: string;
  };
}

export default function ProfilePage() {
  // const { socket, isConnected } = useSocket();
  const [customer, setCustomer] = useState<Customer | null>(null);
  const [isRegistered, setIsRegistered] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [editMode, setEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: { line1: '', line2: '', line3: '' },
    deliveryAddress: {
      country: '',
      region: '',
      district: '',
      city: '',
      addressLine: ''
    }
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [ordersPerPage] = useState(5);
  const [statusFilter, setStatusFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  const [updateLoading, setUpdateLoading] = useState(false);
  const [verifyingOrder, setVerifyingOrder] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('profile');
  const [chatMessages, setChatMessages] = useState<{text: string, isCustomer: boolean, timestamp: Date}[]>([]);
  const [chatInput, setChatInput] = useState('');
  const [showReturnModal, setShowReturnModal] = useState(false);
  const [returnData, setReturnData] = useState({ orderId: '', type: '', reason: '', description: '' });
  const [returns, setReturns] = useState<any[]>([]);
  const [showOrderHistoryModal, setShowOrderHistoryModal] = useState(false);
  const [selectedOrderHistory, setSelectedOrderHistory] = useState<any[]>([]);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<any>(null);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verifyData, setVerifyData] = useState({ orderId: '', verified: true, notes: '' });
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [uploadOrderId, setUploadOrderId] = useState('');
  const [uploadLoading, setUploadLoading] = useState(false);
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [countries, setCountries] = useState<string[]>([]);
  const [regions, setRegions] = useState<string[]>([]);
  const [districts, setDistricts] = useState<string[]>([]);
  const [cities, setCities] = useState<string[]>([]);
  const [deliveryAddress, setDeliveryAddress] = useState({
    cityId: 0,
    city: '',
    district: '',
    region: '',
    country: '',
    addressLine: ''
  });
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewData, setReviewData] = useState({ productId: '', rating: 5, comment: '' });
  const [submittingReview, setSubmittingReview] = useState(false);
  const [toast, setToast] = useState<{message: string, type: string} | null>(null);
  const [preOrders, setPreOrders] = useState<any[]>([]);

  useEffect(() => {
    loadProfile();
    loadAddresses();
    if (activeTab === 'preorders') {
      loadPreOrders();
    }
  }, [activeTab]);

  // useEffect(() => {
  //   if (socket && isConnected) {
  //     socket.on('orderStatusChanged', (data) => {
  //       const userId = localStorage.getItem('userId');
  //       if (userId) {
  //         loadProfile(); // Reload orders to get updated status
  //       }
  //     });

  //     socket.on('paymentSlipStatusChanged', (data) => {
  //       const userEmail = localStorage.getItem('userEmail');
  //       if (userEmail === data.customerEmail) {
  //         loadProfile(); // Reload orders to get updated slip status
  //         setToast({message: `Payment slip ${data.status === 'verified' ? 'approved' : 'rejected'} for order ${data.orderNumber}`, type: data.status === 'verified' ? 'success' : 'error'});
  //         setTimeout(() => setToast(null), 5000);
  //       }
  //     });
  //   }
  // }, [socket, isConnected]);

  const loadProfile = async () => {
    if (typeof window !== 'undefined') {
      const registered = localStorage.getItem('userRegistered') === 'true';
      const userId = localStorage.getItem('userId');
      const userEmail = localStorage.getItem('userEmail');
      
      setIsRegistered(registered);
      
      if (registered && userId) {
        try {
          const userResponse = await fetch(`/api/customers?id=${userId}`);
          
          if (!userResponse.ok) {
            throw new Error(`Failed to fetch user data: ${userResponse.status}`);
          }
          
          const userData = await userResponse.json();
          
          if (userData && Array.isArray(userData) && userData.length > 0) {
            const user = userData[0];
            setCustomer(user);
            setFormData({
              name: user.name || '',
              email: user.email || '',
              phone: user.phone || '',
              country: user.country || '',
              address: {
                line1: user.address?.line1 || '',
                line2: user.address?.line2 || '',
                line3: user.address?.line3 || ''
              },
              deliveryAddress: user.deliveryAddress || {
                country: '',
                region: '',
                district: '',
                city: '',
                addressLine: ''
              }
            });
            
            if (user.deliveryAddress) {
              setDeliveryAddress(user.deliveryAddress);
            }
            
            // Load orders for this specific user
            const ordersResponse = await fetch(`/api/orders?userId=${userId}`);
            const ordersData = await ordersResponse.json();
            console.log('Customer profile - loaded orders:', ordersData.length);
            const ordersWithSlips = ordersData.filter((order: any) => order.paymentSlip);
            console.log('Customer profile - orders with payment slips:', ordersWithSlips.length);
            if (ordersWithSlips.length > 0) {
              console.log('Sample customer order with slip:', ordersWithSlips[0]);
            }
            setOrders(Array.isArray(ordersData) ? ordersData : []);
            
            // Load returns for this specific user
            const returnsResponse = await fetch(`/api/returns/customer?email=${encodeURIComponent(user.email)}`);
            const returnsData = await returnsResponse.json();
            setReturns(Array.isArray(returnsData) ? returnsData : []);
            
            loadAddresses();
          } else {
            console.error('User not found or invalid response:', userData);
            // Clear invalid session
            localStorage.removeItem('userRegistered');
            localStorage.removeItem('userId');
            localStorage.removeItem('userEmail');
            setIsRegistered(false);
          }
        } catch (error) {
          console.error('Error loading profile:', error);
          // On error, clear potentially corrupted session
          localStorage.removeItem('userRegistered');
          localStorage.removeItem('userId');
          localStorage.removeItem('userEmail');
          setIsRegistered(false);
        }
      }
      setLoading(false);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.clear();
      window.location.href = '/';
    }
  };

  const viewOrderDetails = (order: any) => {
    setSelectedOrder(order);
    setShowOrderModal(true);
  };

  const closeOrderModal = () => {
    setShowOrderModal(false);
    setSelectedOrder(null);
  };

  const verifyOrder = async (orderId: string) => {
    setVerifyingOrder(orderId);
    try {
      const response = await fetch('/api/orders/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId })
      });
      const data = await response.json();
      if (data.success) {
        loadProfile();
        if (data.unavailableCount > 0) {
          alert(`${data.unavailableCount} items are no longer available`);
        } else {
          alert('All items are available!');
        }
      }
    } catch (error) {
      alert('Failed to verify order');
    } finally {
      setVerifyingOrder(null);
    }
  };

  const toggleEditMode = () => {
    setEditMode(!editMode);
  };

  const saveProfile = async () => {
    setUpdateLoading(true);
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          ...formData
        })
      });
      
      const data = await response.json();
      
      if (data.success) {
        setCustomer({ ...customer, ...formData });
        localStorage.setItem('userEmail', formData.email);
        setEditMode(false);
        alert('Profile updated successfully!');
      } else {
        alert(data.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile');
    } finally {
      setUpdateLoading(false);
    }
  };

  const getFilteredOrders = () => {
    let filtered = [...orders];
    
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter);
    }
    
    if (dateFilter !== 'all') {
      const now = new Date();
      const filterDate = new Date();
      
      if (dateFilter === '7days') {
        filterDate.setDate(now.getDate() - 7);
      } else if (dateFilter === '30days') {
        filterDate.setDate(now.getDate() - 30);
      } else if (dateFilter === '90days') {
        filterDate.setDate(now.getDate() - 90);
      }
      
      filtered = filtered.filter(order => new Date(order.createdAt) >= filterDate);
    }
    
    return filtered;
  };

  const getPaginatedOrders = () => {
    const filtered = getFilteredOrders();
    const startIndex = (currentPage - 1) * ordersPerPage;
    return filtered.slice(startIndex, startIndex + ordersPerPage);
  };

  const getTotalPages = () => {
    return Math.ceil(getFilteredOrders().length / ordersPerPage);
  };

  const handleReturn = (orderId: string, type: 'return' | 'damage') => {
    setReturnData({ orderId, type, reason: '', description: '' });
    setShowReturnModal(true);
  };

  const submitReturn = async () => {
    try {
      const response = await fetch('/api/returns', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...returnData,
          customerInfo: {
            name: customer?.name,
            email: customer?.email,
            phone: customer?.phone
          }
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        alert(`${returnData.type === 'damage' ? 'Damage claim' : 'Return request'} submitted successfully! Reference: ${result.returnId}`);
        setShowReturnModal(false);
        setReturnData({ orderId: '', type: '', reason: '', description: '' });
        loadProfile(); // Reload to update returns list
      }
    } catch (error) {
      console.error('Error submitting return:', error);
      alert('Failed to submit request. Please try again.');
    }
  };

  const viewOrderHistory = async (order: any) => {
    try {
      const response = await fetch(`/api/orders/history?orderId=${order._id}`);
      const history = await response.json();
      setSelectedOrderHistory(Array.isArray(history) ? history : []);
      setSelectedOrderForHistory(order);
      setShowOrderHistoryModal(true);
    } catch (error) {
      console.error('Error loading order history:', error);
      alert('Failed to load order history');
    }
  };

  const openVerifyModal = (orderId: string, verified: boolean = true) => {
    setVerifyData({ orderId, verified, notes: '' });
    setShowVerifyModal(true);
  };

  const loadPreOrders = async () => {
    try {
      const response = await fetch('/api/member/pre-orders');
      const data = await response.json();
      setPreOrders(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading pre-orders:', error);
      setPreOrders([]);
    }
  };

  const loadAddresses = async () => {
    try {
      const response = await fetch('/api/addresses?type=city');
      if (response.ok) {
        const data = await response.json();
        console.log('All cities:', data);
        const filteredCities = Array.isArray(data) ? data.filter(city => city.name === 'Avissawella') : [];
        console.log('Filtered cities:', filteredCities);
        setCities(filteredCities);
      }
    } catch (error) {
      console.error('Error loading cities:', error);
      setCities([]);
    }
  };

  const handleCityChange = async (cityId: string) => {
    try {
      const response = await fetch(`/api/addresses?cityId=${cityId}`);
      const hierarchy = await response.json();
      
      setDeliveryAddress({
        cityId: parseInt(cityId),
        city: hierarchy.city?.name || '',
        district: hierarchy.district?.name || '',
        region: hierarchy.region?.name || '',
        country: hierarchy.country?.name || '',
        addressLine: deliveryAddress.addressLine
      });
    } catch (error) {
      console.error('Error loading city hierarchy:', error);
    }
  };

  const saveDeliveryAddress = async () => {
    try {
      const response = await fetch('/api/auth/update', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: localStorage.getItem('userId'),
          deliveryAddress
        })
      });
      
      if (response.ok) {
        alert('Delivery address saved successfully!');
      }
    } catch (error) {
      console.error('Error saving delivery address:', error);
      alert('Failed to save delivery address');
    }
  };

  const submitVerification = async () => {
    console.log('Submitting verification:', verifyData);
    try {
      const response = await fetch('/api/orders/verify-delivery', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: verifyData.orderId,
          verified: verifyData.verified,
          customerNotes: verifyData.notes
        })
      });
      
      console.log('Response status:', response.status);
      const result = await response.json();
      console.log('Response data:', result);
      
      if (response.ok && result.success) {
        // Update local orders state immediately
        setOrders(orders.map(order => 
          order._id === verifyData.orderId 
            ? { 
                ...order, 
                deliveryVerified: verifyData.verified, 
                customerNotes: verifyData.notes, 
                verifiedAt: new Date(),
                status: verifyData.verified ? 'customer_verified' : order.status
              }
            : order
        ));
        
        alert(verifyData.verified ? 'Delivery confirmed successfully!' : 'Issue reported successfully!');
        setShowVerifyModal(false);
        setVerifyData({ orderId: '', verified: true, notes: '' });
      } else {
        alert(result.error || 'Failed to submit verification');
      }
    } catch (error) {
      console.error('Error verifying delivery:', error);
      alert('Failed to submit verification');
    }
  };

  const submitReview = async () => {
    setSubmittingReview(true);
    try {
      const response = await fetch('/api/reviews', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: selectedOrder._id,
          productId: reviewData.productId,
          rating: reviewData.rating,
          comment: reviewData.comment,
          customerName: customer?.name,
          customerEmail: customer?.email
        })
      });
      
      if (response.ok) {
        alert('Review submitted successfully!');
        setShowReviewModal(false);
        setReviewData({ productId: '', rating: 5, comment: '' });
      } else {
        const error = await response.json();
        alert(error.error || 'Failed to submit review');
      }
    } catch (error) {
      alert('Failed to submit review');
    } finally {
      setSubmittingReview(false);
    }
  };

  const uploadPaymentSlip = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setUploadLoading(true);
    
    const formData = new FormData(event.currentTarget);
    const file = formData.get('slip') as File;
    
    if (!file) {
      alert('Please select a file');
      setUploadLoading(false);
      return;
    }
    
    try {
      // Convert to base64 on client side
      const base64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          console.log('FileReader result:', reader.result);
          resolve(reader.result as string);
        };
        reader.onerror = () => reject(reader.error);
        reader.readAsDataURL(file);
      });
      
      console.log('Client - File name:', file.name);
      console.log('Client - File size:', file.size);
      console.log('Client - File type:', file.type);
      console.log('Client - Base64 length:', base64.length);
      console.log('Client - Base64 preview:', base64.substring(0, 50) + '...');
      
      const response = await fetch('/api/orders/upload-slip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: uploadOrderId,
          base64Data: base64
        })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        alert('Payment slip uploaded successfully!');
        setShowUploadModal(false);
        setUploadOrderId('');
        
        // Force reload orders to get updated data
        const ordersResponse = await fetch(`/api/orders?userId=${localStorage.getItem('userId')}`);
        const ordersData = await ordersResponse.json();
        setOrders(Array.isArray(ordersData) ? ordersData : []);
        
        console.log('=== AFTER UPLOAD DEBUG ===');
        const updatedOrder = ordersData.find((o: any) => o._id === uploadOrderId);
        console.log('Updated order:', updatedOrder);
        console.log('Has paymentSlip:', !!updatedOrder?.paymentSlip);
        console.log('PaymentSlip data:', updatedOrder?.paymentSlip);
        console.log('=== END DEBUG ===');
      } else {
        alert(result.error || 'Upload failed');
      }
    } catch (error) {
      alert('Upload failed');
    } finally {
      setUploadLoading(false);
    }
  };

  if (!isRegistered) {
    return (
      <div className="profile-page">
        <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)'}}>
          <div className="container">
            <a href="/" className="navbar-brand fw-bold fs-3" style={{color: '#22c55e'}}>
              <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
              Fashion Breeze
            </a>
            <a href="/" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-arrow-left me-2"></i>Back to Shop
            </a>
          </div>
        </nav>

        <div className="container py-5">
          <div className="row justify-content-center">
            <div className="col-lg-6 text-center">
              <i className="bi bi-person-x display-1 text-muted mb-4"></i>
              <h2 className="mb-3">Not Registered</h2>
              <p className="lead mb-4">You need to register first to view your profile.</p>
              <a href="/register" className="btn btn-primary btn-lg">
                <i className="bi bi-person-plus me-2"></i>Register Now
              </a>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="profile-page">
      <nav className="navbar navbar-expand-lg navbar-dark shadow-lg" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)'}}>
        <div className="container">
          <a href="/" className="navbar-brand fw-bold fs-3" style={{color: '#22c55e'}}>
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '40px', marginRight: '10px'}} />
            Fashion Breeze
          </a>
          <div className="d-flex align-items-center gap-3">
            <a href="/" className="btn" style={{background: 'rgba(34, 197, 94, 0.2)', border: '2px solid #22c55e', color: '#22c55e', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-arrow-left me-2"></i>Back to Shop
            </a>
            <button onClick={logout} className="btn" style={{background: 'rgba(220, 38, 38, 0.2)', border: '2px solid #dc2626', color: '#dc2626', borderRadius: '12px', fontWeight: '600'}}>
              <i className="bi bi-box-arrow-right me-2"></i>Logout
            </button>
          </div>
        </div>
      </nav>

      <div className="container-fluid py-5">
        <div className="row">
          <div className="col-12">
            <div className="text-center mb-4">
              <h1 className="display-5 fw-bold mb-3" style={{background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', backgroundClip: 'text'}}>My Profile</h1>
              <div style={{width: '100px', height: '4px', background: 'linear-gradient(135deg, #22c55e 0%, #000000 100%)', margin: '0 auto', borderRadius: '2px'}}></div>
            </div>

            <div className="row mb-4">
              <div className="col-12">
                <div className="nav-tabs-container p-3 rounded-4 shadow-sm" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 20%, #1a1a1a 80%, #000000 100%)', border: '2px solid #22c55e'}}>
                  <ul className="nav justify-content-center flex-wrap" style={{gap: '1rem'}}>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'profile' ? 'active' : ''}`} onClick={() => setActiveTab('profile')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'profile' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'profile' ? 'white' : '#000000',
                        boxShadow: activeTab === 'profile' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-person-circle me-2"></i>Personal Info
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'orders' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'orders' ? 'white' : '#000000',
                        boxShadow: activeTab === 'orders' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-clock-history me-2"></i>Order History
                        <span className={`badge ms-2`} style={{fontSize: '0.7rem', fontWeight: 'bold', background: activeTab === 'orders' ? '#ffffff' : '#22c55e', color: activeTab === 'orders' ? '#000000' : '#ffffff'}}>2</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'returns' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'returns' ? 'white' : '#000000',
                        boxShadow: activeTab === 'returns' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-arrow-return-left me-2"></i>My Returns
                        <span className={`badge ms-2`} style={{fontSize: '0.7rem', fontWeight: 'bold', background: activeTab === 'returns' ? '#ffffff' : '#22c55e', color: activeTab === 'returns' ? '#000000' : '#ffffff'}}>0</span>
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'delivery' ? 'active' : ''}`} onClick={() => setActiveTab('delivery')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'delivery' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'delivery' ? 'white' : '#000000',
                        boxShadow: activeTab === 'delivery' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-geo-alt me-2"></i>Delivery Address
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'preorders' ? 'active' : ''}`} onClick={() => setActiveTab('preorders')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'preorders' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'preorders' ? 'white' : '#000000',
                        boxShadow: activeTab === 'preorders' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-scissors me-2"></i>Pre-Orders
                      </button>
                    </li>
                    <li className="nav-item">
                      <button className={`nav-link ${activeTab === 'chat' ? 'active' : ''}`} onClick={() => setActiveTab('chat')} style={{
                        borderRadius: '15px',
                        fontWeight: '600',
                        padding: '1rem 2rem',
                        border: '2px solid rgba(255,255,255,0.2)',
                        background: activeTab === 'chat' ? 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)' : 'rgba(255,255,255,0.9)',
                        color: activeTab === 'chat' ? 'white' : '#000000',
                        boxShadow: activeTab === 'chat' ? '0 8px 25px rgba(0,0,0,0.15)' : 'none',
                        backdropFilter: 'blur(10px)',
                        transition: 'all 0.3s ease'
                      }}>
                        <i className="bi bi-whatsapp me-2"></i>WhatsApp Support
                      </button>
                    </li>
                  </ul>
                </div>
              </div>
            </div>

            {activeTab === 'profile' && (
              <div className="card border-0" style={{borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'}}>
                <div className="card-header" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '2rem', border: 'none'}}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                        <i className="bi bi-person-circle" style={{fontSize: '1.5rem'}}></i>
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold">Personal Information</h4>
                        <p className="mb-0 opacity-75">Manage your account details</p>
                      </div>
                    </div>
                    <div>
                      {editMode ? (
                        <>
                          <button className="btn btn-light me-2" onClick={saveProfile} disabled={updateLoading} style={{borderRadius: '12px', fontWeight: '600'}}>
                            {updateLoading ? (
                              <><i className="bi bi-hourglass-split me-1"></i>Saving...</>
                            ) : (
                              <><i className="bi bi-check me-1"></i>Save Changes</>
                            )}
                          </button>
                          <button className="btn btn-outline-light" onClick={toggleEditMode} style={{borderRadius: '12px', fontWeight: '600'}}>
                            <i className="bi bi-x me-1"></i>Cancel
                          </button>
                        </>
                      ) : (
                        <button className="btn btn-light" onClick={toggleEditMode} style={{borderRadius: '12px', fontWeight: '600', color: '#22c55e', background: 'rgba(34, 197, 94, 0.1)', border: '2px solid #22c55e'}}>
                          <i className="bi bi-pencil me-1"></i>Edit Profile
                        </button>
                      )}
                    </div>
                  </div>
                </div>
                <div className="card-body" style={{padding: '2.5rem'}}>
                  {!customer ? (
                    <div className="text-center py-5">
                      <div className="spinner-border" style={{color: '#667eea', width: '3rem', height: '3rem'}} role="status">
                        <span className="visually-hidden">Loading...</span>
                      </div>
                      <p className="mt-3 text-muted fw-semibold">Loading profile information...</p>
                    </div>
                  ) : (
                  <div className="row g-4">
                    <div className="col-md-6">
                      <div className="profile-field p-3 rounded-3" style={{background: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>
                          <i className="bi bi-person-fill me-2" style={{color: '#667eea'}}></i>Full Name
                        </label>
                        {editMode ? (
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                          />
                        ) : (
                          <div className="fw-semibold" style={{color: '#495057', fontSize: '1.1rem'}}>{customer.name || 'Not provided'}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="profile-field p-3 rounded-3" style={{background: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>
                          <i className="bi bi-envelope-fill me-2" style={{color: '#667eea'}}></i>Email Address
                        </label>
                        {editMode ? (
                          <input 
                            type="email" 
                            className="form-control" 
                            value={formData.email}
                            onChange={(e) => setFormData({...formData, email: e.target.value})}
                            style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                          />
                        ) : (
                          <div className="fw-semibold" style={{color: '#495057', fontSize: '1.1rem'}}>{customer.email || 'Not provided'}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="profile-field p-3 rounded-3" style={{background: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>
                          <i className="bi bi-telephone-fill me-2" style={{color: '#667eea'}}></i>Phone Number
                        </label>
                        {editMode ? (
                          <input 
                            type="tel" 
                            className="form-control" 
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                          />
                        ) : (
                          <div className="fw-semibold" style={{color: '#495057', fontSize: '1.1rem'}}>{customer.phone || 'Not provided'}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-md-6">
                      <div className="profile-field p-3 rounded-3" style={{background: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>
                          <i className="bi bi-globe me-2" style={{color: '#667eea'}}></i>Country
                        </label>
                        {editMode ? (
                          <input 
                            type="text" 
                            className="form-control" 
                            value={formData.country}
                            onChange={(e) => setFormData({...formData, country: e.target.value})}
                            style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                          />
                        ) : (
                          <div className="fw-semibold" style={{color: '#495057', fontSize: '1.1rem'}}>{customer.country || 'Not provided'}</div>
                        )}
                      </div>
                    </div>
                    <div className="col-12">
                      <div className="profile-field p-3 rounded-3" style={{background: '#f8f9fa', border: '1px solid #e9ecef'}}>
                        <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>
                          <i className="bi bi-geo-alt-fill me-2" style={{color: '#667eea'}}></i>Delivery Address
                        </label>
                        {editMode ? (
                          <div className="row g-3">
                            <div className="col-md-6">
                              <select 
                                className="form-select" 
                                value={deliveryAddress.cityId || ''}
                                onChange={(e) => handleCityChange(e.target.value)}
                                style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                              >
                                <option value="">Select City</option>
                                {cities.map((city: any) => (
                                  <option key={city.id} value={city.id}>{city.name}</option>
                                ))}
                              </select>
                            </div>
                            <div className="col-12">
                              <textarea 
                                className="form-control" 
                                rows={2}
                                value={deliveryAddress.addressLine}
                                onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine: e.target.value})}
                                placeholder="Enter detailed address"
                                style={{borderRadius: '10px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                              ></textarea>
                            </div>
                          </div>
                        ) : (
                          <div className="fw-semibold" style={{color: '#495057', fontSize: '1.1rem'}}>
                            {deliveryAddress.city ? (
                              <>
                                {deliveryAddress.addressLine}<br />
                                {deliveryAddress.city}, {deliveryAddress.district}, {deliveryAddress.region}, {deliveryAddress.country}
                              </>
                            ) : 'Not provided'}
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'orders' && (
            <div className="card border-0" style={{borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'}}>
              <div className="card-header" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '2rem', border: 'none'}}>
                <div className="d-flex justify-content-between align-items-center">
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                      <i className="bi bi-clock-history" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">Order History</h4>
                      <p className="mb-0 opacity-75">Track your purchases and deliveries</p>
                    </div>
                  </div>
                  <div className="bg-white bg-opacity-20 rounded-3 px-3 py-2">
                    <span className="fw-bold text-white">{getFilteredOrders().length}</span>
                    <small className="ms-1 opacity-75 text-white">orders</small>
                  </div>
                </div>
              </div>
              <div className="card-body" style={{padding: '2rem'}}>
                <div className="row mb-4">
                  <div className="col-md-4">
                    <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>Filter by Status</label>
                    <select className="form-select" value={statusFilter} onChange={(e) => {setStatusFilter(e.target.value); setCurrentPage(1);}} style={{borderRadius: '12px', border: '2px solid #e9ecef', padding: '0.75rem'}}>
                      <option value="all">All Status</option>
                      <option value="pending">Pending</option>
                      <option value="confirmed">Confirmed</option>
                      <option value="shipped">Shipped</option>
                      <option value="delivered">Delivered</option>
                    </select>
                  </div>
                  <div className="col-md-4">
                    <label className="form-label fw-bold mb-2" style={{color: '#2c3e50'}}>Filter by Date</label>
                    <select className="form-select" value={dateFilter} onChange={(e) => {setDateFilter(e.target.value); setCurrentPage(1);}} style={{borderRadius: '12px', border: '2px solid #e9ecef', padding: '0.75rem'}}>
                      <option value="all">All Time</option>
                      <option value="7days">Last 7 Days</option>
                      <option value="30days">Last 30 Days</option>
                      <option value="90days">Last 90 Days</option>
                    </select>
                  </div>
                  <div className="col-md-4 d-flex align-items-end">
                    <button className="btn" onClick={() => {setStatusFilter('all'); setDateFilter('all'); setCurrentPage(1);}} style={{background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600', padding: '0.75rem 1.5rem'}}>
                      <i className="bi bi-arrow-clockwise me-2"></i>Reset Filters
                    </button>
                  </div>
                </div>
                {loading ? (
                  <div className="text-center py-4">
                    <div className="spinner-border text-primary" role="status">
                      <span className="visually-hidden">Loading...</span>
                    </div>
                  </div>
                ) : orders.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x display-4 text-muted mb-3"></i>
                    <p className="text-muted">No orders found</p>
                  </div>
                ) : (
                  <>
                    <div className="table-responsive" style={{width: '100%'}}>
                      <table className="table table-hover align-middle" style={{width: '100%', minWidth: '1000px'}}>
                        <thead className="table-dark">
                          <tr>
                            <th scope="col" style={{width: '120px'}}>Order ID</th>
                            <th scope="col" style={{width: '150px'}}>Date & Time</th>
                            <th scope="col" style={{width: '300px'}}>Items</th>
                            <th scope="col" style={{width: '120px'}}>Total Amount</th>
                            <th scope="col" style={{width: '140px'}}>Payment</th>
                            <th scope="col" style={{width: '120px'}}>Status</th>
                            <th scope="col" style={{width: '200px'}}>Actions</th>
                          </tr>
                        </thead>
                        <tbody>
                          {getPaginatedOrders().map((order, index) => (
                            <tr key={order._id || index}>
                              <td>
                                <div className="fw-bold text-primary">FB{String(order.id || (index + 1)).padStart(6, '0')}</div>
                              </td>
                              <td>
                                <div className="fw-medium">{new Date(order.createdAt || Date.now()).toLocaleDateString()}</div>
                                <small className="text-muted">{new Date(order.createdAt || Date.now()).toLocaleTimeString()}</small>
                              </td>
                              <td>
                                <div className="items-preview">
                                  {order.items?.slice(0, 2).map((item: any, i: number) => (
                                    <div key={i} className="d-flex align-items-center mb-1">
                                      {item.image && (
                                        <img src={item.image} alt={item.name} className="me-2 rounded" style={{width: '32px', height: '32px', objectFit: 'cover'}} />
                                      )}
                                      <div>
                                        <div className="fw-medium small">{item.name?.substring(0, 15)}...</div>
                                        <small className="text-muted">Size: {item.size}, Color: {item.color}, Qty: {item.quantity}</small>
                                      </div>
                                    </div>
                                  ))}
                                  {order.items?.length > 2 && (
                                    <small className="text-muted fw-medium">+{order.items.length - 2} more items</small>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="fw-bold text-success" style={{fontSize: '1.1rem'}}>LKR {order.total?.toLocaleString() || '0'}</div>
                              </td>
                              <td>
                                <div className="mb-1">
                                  <span className="badge bg-info text-dark small">
                                    {order.paymentMethod?.replace('_', ' ').toUpperCase() || 'COD'}
                                  </span>
                                </div>
                                <span className={`badge small ${
                                  order.paymentStatus === 'paid' ? 'bg-success' :
                                  order.paymentStatus === 'failed' ? 'bg-danger' : 'bg-warning text-dark'
                                }`}>
                                  {order.paymentStatus?.toUpperCase() || 'PENDING'}
                                </span>
                                {order.paymentSlip && (
                                  <div className="mt-1">
                                    <span className={`badge small ${
                                      order.paymentSlip.status === 'verified' ? 'bg-success' :
                                      order.paymentSlip.status === 'rejected' ? 'bg-danger' : 'bg-info'
                                    }`}>
                                      SLIP {order.paymentSlip.status?.toUpperCase()}
                                    </span>

                                  </div>
                                )}
                              </td>
                              <td>
                                <div className="d-flex flex-column gap-1">
                                  <span className={`badge px-2 py-1 ${
                                    order.status === 'confirmed' ? 'bg-success' :
                                    order.status === 'pending' ? 'bg-warning text-dark' :
                                    order.status === 'shipped' ? 'bg-info' :
                                    order.status === 'delivered' ? 'bg-primary' :
                                  order.status === 'customer_verified' ? 'bg-success' : 'bg-secondary'
                                  }`}>
                                    {order.status?.toUpperCase() || 'PENDING'}
                                  </span>
                                  {order.status === 'customer_verified' && (
                                    <span className="badge bg-success" style={{fontSize: '0.7rem'}}>
                                      <i className="bi bi-check-circle me-1"></i>VERIFIED
                                    </span>
                                  )}
                                </div>
                              </td>
                              <td>
                                <div className="d-flex gap-1 flex-wrap">
                                  <button 
                                    className="btn btn-sm btn-outline-primary" 
                                    onClick={() => viewOrderDetails(order)}
                                    title="View Details"
                                  >
                                    <i className="bi bi-eye"></i>
                                  </button>

                                  <button 
                                    className="btn btn-sm btn-outline-info" 
                                    onClick={() => viewOrderHistory(order)}
                                    title="View Status History"
                                  >
                                    <i className="bi bi-clock-history"></i>
                                  </button>
                                  {/* Debug info - remove this after testing */}
                                  <button 
                                    className="btn btn-sm btn-outline-secondary" 
                                    onClick={() => {
                                      console.log('=== ORDER DEBUG ===');
                                      console.log('Order ID:', order._id);
                                      console.log('Payment Method:', order.paymentMethod);
                                      console.log('Order Status:', order.status);
                                      console.log('Has Payment Slip:', !!order.paymentSlip);
                                      console.log('Should show upload?', (order.paymentMethod === 'bank_transfer' || order.status === 'confirmed') && !order.paymentSlip);
                                      console.log('Full Order:', order);
                                      console.log('==================');
                                    }}
                                    title="Debug Order"
                                  >
                                    <i className="bi bi-bug"></i>
                                  </button>

                                  {/* Upload/View Payment Slip */}
                                  {(order.paymentMethod?.toLowerCase().replace(/\s+/g, '_') === 'bank_transfer' || order.status?.toLowerCase() === 'confirmed') && (
                                    <div className="d-flex gap-1">
                                      {(!order.paymentSlip || order.paymentSlip?.status === 'rejected') && (
                                        <button 
                                          className="btn btn-sm btn-outline-success" 
                                          onClick={() => {
                                            setUploadOrderId(order._id); 
                                            setShowUploadModal(true);
                                          }}
                                          title={order.paymentSlip?.status === 'rejected' ? 'Resubmit Payment Slip' : (order.status?.toLowerCase() === 'confirmed' ? 'Upload Bank Deposit Slip' : 'Upload Payment Slip')}
                                        >
                                          <i className="bi bi-upload me-1"></i>
                                          {order.paymentSlip?.status === 'rejected' ? 'Resubmit' : (order.status?.toLowerCase() === 'confirmed' ? 'Deposit' : 'Upload')}
                                        </button>
                                      )}
                                      {order.paymentSlip && (
                                        <button 
                                          className={`btn btn-sm ${
                                            order.paymentSlip.status === 'verified' ? 'btn-success' :
                                            order.paymentSlip.status === 'rejected' ? 'btn-danger' : 'btn-warning'
                                          }`}
                                          onClick={() => {
                                            setSelectedSlip(order); 
                                            setShowSlipModal(true);
                                          }}
                                          title="View Payment Slip"
                                        >
                                          <i className="bi bi-file-image me-1"></i>
                                          View
                                        </button>
                                      )}
                                    </div>
                                  )}

                                  {order.status === 'delivered' && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-outline-success" 
                                        onClick={() => openVerifyModal(order._id, true)}
                                        title="Confirm Delivery"
                                      >
                                        <i className="bi bi-check-circle"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-warning" 
                                        onClick={() => openVerifyModal(order._id, false)}
                                        title="Report Issue"
                                      >
                                        <i className="bi bi-exclamation-triangle"></i>
                                      </button>
                                    </>
                                  )}
                                  {order.status === 'customer_verified' && (
                                    <>
                                      <button 
                                        className="btn btn-sm btn-outline-primary" 
                                        onClick={() => {
                                          setSelectedOrder(order);
                                          setShowReviewModal(true);
                                        }}
                                        title="Add Review"
                                      >
                                        <i className="bi bi-star"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-success" 
                                        onClick={() => handleReturn(order._id, 'return')} 
                                        title="Return Item"
                                      >
                                        <i className="bi bi-arrow-return-left"></i>
                                      </button>
                                      <button 
                                        className="btn btn-sm btn-outline-danger" 
                                        onClick={() => handleReturn(order._id, 'damage')} 
                                        title="Report Damage"
                                      >
                                        <i className="bi bi-exclamation-triangle"></i>
                                      </button>
                                    </>
                                  )}
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                    
                    {getTotalPages() > 1 && (
                      <nav className="mt-3">
                        <ul className="pagination pagination-sm justify-content-center">
                          <li className={`page-item ${currentPage === 1 ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage - 1)} disabled={currentPage === 1}>
                              <i className="bi bi-chevron-left"></i>
                            </button>
                          </li>
                          {Array.from({ length: getTotalPages() }, (_, i) => i + 1).map(page => (
                            <li key={page} className={`page-item ${currentPage === page ? 'active' : ''}`}>
                              <button className="page-link" onClick={() => setCurrentPage(page)}>
                                {page}
                              </button>
                            </li>
                          ))}
                          <li className={`page-item ${currentPage === getTotalPages() ? 'disabled' : ''}`}>
                            <button className="page-link" onClick={() => setCurrentPage(currentPage + 1)} disabled={currentPage === getTotalPages()}>
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </li>
                        </ul>
                        <div className="text-center small text-muted">
                          Showing {((currentPage - 1) * ordersPerPage) + 1} to {Math.min(currentPage * ordersPerPage, getFilteredOrders().length)} of {getFilteredOrders().length} orders
                        </div>
                      </nav>
                    )}
                  </>
                )}
              </div>
            </div>
            )}

            {activeTab === 'preorders' && (
              <div className="card border-0" style={{borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'}}>
                <div className="card-header" style={{background: 'linear-gradient(135deg, #000000 0%, #22c55e 50%, #1a1a1a 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '2rem', border: 'none'}}>
                  <div className="d-flex justify-content-between align-items-center">
                    <div className="d-flex align-items-center">
                      <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                        <i className="bi bi-scissors" style={{fontSize: '1.5rem'}}></i>
                      </div>
                      <div>
                        <h4 className="mb-1 fw-bold">Tailoring Pre-Orders</h4>
                        <p className="mb-0 opacity-75">Manage your custom tailoring orders</p>
                      </div>
                    </div>
                    <a href="/tailoring/browse" className="btn btn-light">
                      <i className="bi bi-plus-circle me-2"></i>New Pre-Order
                    </a>
                  </div>
                </div>
                <div className="card-body" style={{padding: '2rem'}}>
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-scissors" style={{fontSize: '4rem', color: '#22c55e'}}></i>
                    </div>
                    <h5 className="mb-3">No Pre-Orders Yet</h5>
                    <p className="text-muted mb-4">You haven't placed any tailoring pre-orders yet.</p>
                    <a href="/tailoring/browse" className="btn btn-lg" style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600'}}>
                      <i className="bi bi-plus-circle me-2"></i>Browse Designs
                    </a>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'returns' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-warning text-dark">
                  <h5 className="mb-0"><i className="bi bi-arrow-return-left me-2"></i>My Returns & Damage Claims</h5>
                </div>
                <div className="card-body">
                  {returns.length === 0 ? (
                    <div className="text-center py-4">
                      <i className="bi bi-inbox display-4 text-muted mb-3"></i>
                      <p className="text-muted">No return requests found</p>
                    </div>
                  ) : (
                    <div className="table-responsive">
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            <th>Return ID</th>
                            <th>Order ID</th>
                            <th>Type</th>
                            <th>Reason</th>
                            <th>Status</th>
                            <th>Date</th>
                          </tr>
                        </thead>
                        <tbody>
                          {returns.map((returnItem, index) => (
                            <tr key={index}>
                              <td><span className="badge bg-secondary">{returnItem.returnId}</span></td>
                              <td><span className="badge bg-primary">{returnItem.orderId?.slice(-8)}</span></td>
                              <td>
                                <span className={`badge ${returnItem.type === 'damage' ? 'bg-danger' : 'bg-info'}`}>
                                  <i className={`bi ${returnItem.type === 'damage' ? 'bi-exclamation-triangle' : 'bi-arrow-return-left'} me-1`}></i>
                                  {returnItem.type === 'damage' ? 'Damage' : 'Return'}
                                </span>
                              </td>
                              <td>{returnItem.reason}</td>
                              <td>
                                <span className={`badge ${
                                  returnItem.status === 'approved' ? 'bg-success' :
                                  returnItem.status === 'rejected' ? 'bg-danger' :
                                  returnItem.status === 'processing' ? 'bg-info' : 'bg-warning'
                                }`}>
                                  {returnItem.status}
                                </span>
                              </td>
                              <td>{new Date(returnItem.createdAt).toLocaleDateString()}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>
              </div>
            )}

            {activeTab === 'delivery' && (
              <div className="card border-0" style={{borderRadius: '20px', boxShadow: '0 20px 60px rgba(0,0,0,0.1)'}}>
                <div className="card-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '2rem', border: 'none'}}>
                  <div className="d-flex align-items-center">
                    <div className="bg-white bg-opacity-20 rounded-circle p-3 me-3">
                      <i className="bi bi-geo-alt" style={{fontSize: '1.5rem'}}></i>
                    </div>
                    <div>
                      <h4 className="mb-1 fw-bold">Delivery Address</h4>
                      <p className="mb-0 opacity-75">Set your preferred delivery location</p>
                    </div>
                  </div>
                </div>
                <div className="card-body" style={{padding: '2.5rem'}}>
                  <div className="row g-4">
                    <div className="col-md-6">
                      <label className="form-label fw-bold">Select City *</label>
                      <select 
                        className="form-select" 
                        value={deliveryAddress.cityId || ''}
                        onChange={(e) => handleCityChange(e.target.value)}
                        style={{borderRadius: '12px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                      >
                        <option value="">Select City</option>
                        {cities.map((city: any) => (
                          <option key={city.id} value={city.id}>{city.name}</option>
                        ))}
                      </select>
                    </div>
                    {deliveryAddress.city && (
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Address Hierarchy</label>
                        <div className="p-3 bg-light rounded" style={{borderRadius: '12px'}}>
                          <div className="small text-muted mb-1">Country: <strong>{deliveryAddress.country}</strong></div>
                          <div className="small text-muted mb-1">Region: <strong>{deliveryAddress.region}</strong></div>
                          <div className="small text-muted mb-1">District: <strong>{deliveryAddress.district}</strong></div>
                          <div className="small text-muted">City: <strong>{deliveryAddress.city}</strong></div>
                        </div>
                      </div>
                    )}
                    <div className="col-12">
                      <label className="form-label fw-bold">Address Line</label>
                      <textarea 
                        className="form-control" 
                        rows={3}
                        value={deliveryAddress.addressLine}
                        onChange={(e) => setDeliveryAddress({...deliveryAddress, addressLine: e.target.value})}
                        placeholder="Enter your detailed address (house number, street, landmarks, etc.)"
                        style={{borderRadius: '12px', border: '2px solid #e9ecef', padding: '0.75rem'}}
                      ></textarea>
                    </div>
                    <div className="col-12">
                      <button 
                        className="btn btn-lg px-4" 
                        onClick={saveDeliveryAddress}
                        disabled={!deliveryAddress.cityId}
                        style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600'}}
                      >
                        <i className="bi bi-check-circle me-2"></i>Save Delivery Address
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'chat' && (
              <div className="card border-0 shadow-sm">
                <div className="card-header bg-success text-white">
                  <h5 className="mb-0"><i className="bi bi-whatsapp me-2"></i>WhatsApp Support</h5>
                </div>
                <div className="card-body">
                  <div className="row">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Quick Actions</h6>
                      <div className="d-grid gap-2">
                        <button 
                          className="btn btn-success" 
                          onClick={() => window.open(`https://wa.me/94707003722?text=Hi, I need help with my account: ${customer?.name} (${customer?.email})`, '_blank')}
                        >
                          <i className="bi bi-whatsapp me-2"></i>Contact Support
                        </button>
                        <button 
                          className="btn btn-outline-success" 
                          onClick={() => window.open(`https://wa.me/94707003722?text=Hi, I want to check my order status. Customer: ${customer?.name}`, '_blank')}
                        >
                          <i className="bi bi-question-circle me-2"></i>Order Status Inquiry
                        </button>
                        <button 
                          className="btn btn-outline-success" 
                          onClick={() => window.open(`https://wa.me/94707003722?text=Hi, I need help with product information. Customer: ${customer?.name}`, '_blank')}
                        >
                          <i className="bi bi-info-circle me-2"></i>Product Information
                        </button>
                        <button 
                          className="btn btn-outline-success" 
                          onClick={() => window.open(`https://wa.me/94707003722?text=Hi, I want to return/exchange an item. Customer: ${customer?.name}`, '_blank')}
                        >
                          <i className="bi bi-arrow-repeat me-2"></i>Return/Exchange
                        </button>
                      </div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Support Information</h6>
                      <div className="bg-light p-3 rounded">
                        <p className="mb-2"><strong>WhatsApp Number:</strong> +94 70 700 3722</p>
                        <p className="mb-2"><strong>Support Hours:</strong> 9:00 AM - 8:00 PM</p>
                        <p className="mb-2"><strong>Response Time:</strong> Usually within 30 minutes</p>
                        <p className="mb-0"><strong>Languages:</strong> English, Sinhala</p>
                      </div>
                      <div className="mt-3">
                        <h6 className="fw-bold mb-2">Frequently Asked</h6>
                        <ul className="list-unstyled small">
                          <li className="mb-1">• Order tracking and delivery status</li>
                          <li className="mb-1">• Size and fit guidance</li>
                          <li className="mb-1">• Return and exchange policy</li>
                          <li className="mb-1">• Payment and billing questions</li>
                          <li className="mb-1">• Product availability</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showOrderModal && selectedOrder && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(10px)'}}>
          <div className="modal-dialog modal-xl" style={{maxWidth: '900px'}}>
            <div className="modal-content" style={{borderRadius: '20px', border: 'none', boxShadow: '0 25px 80px rgba(0,0,0,0.4)'}}>
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '2rem', border: 'none'}}>
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-3 me-4">
                    <i className="bi bi-receipt-cutoff" style={{fontSize: '1.5rem'}}></i>
                  </div>
                  <div>
                    <h3 className="modal-title mb-1 fw-bold">Order Details</h3>
                    <p className="mb-0 opacity-75">#{selectedOrder.orderNumber || selectedOrder._id?.slice(-8) || 'N/A'}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-light rounded-circle" onClick={closeOrderModal} style={{width: '45px', height: '45px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-x" style={{fontSize: '1.3rem'}}></i>
                </button>
              </div>
              <div className="modal-body" style={{padding: '2rem', maxHeight: '70vh', overflowY: 'auto'}}>
                <div className="row g-4 mb-4">
                  <div className="col-md-4">
                    <div className="info-card p-3 rounded-3" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '1px solid #dee2e6'}}>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-calendar-event text-primary me-2" style={{fontSize: '1.2rem'}}></i>
                        <h6 className="mb-0 fw-bold">Order Info</h6>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Order Date</small>
                        <span className="fw-semibold">{new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</span>
                      </div>
                      <div className="mb-2">
                        <small className="text-muted d-block">Status</small>
                        <span className={`badge px-3 py-2 ${
                          selectedOrder.status === 'confirmed' ? 'bg-success' :
                          selectedOrder.status === 'pending' ? 'bg-warning text-dark' :
                          selectedOrder.status === 'shipped' ? 'bg-info' :
                          selectedOrder.status === 'delivered' ? 'bg-primary' : 'bg-secondary'
                        }`} style={{fontSize: '0.8rem', borderRadius: '10px'}}>
                          {selectedOrder.status?.toUpperCase() || 'PENDING'}
                        </span>
                      </div>
                      <div>
                        <small className="text-muted d-block">Payment</small>
                        <div className="d-flex flex-column">
                          <span className="fw-semibold small">{(selectedOrder.paymentMethod || 'cash_on_delivery').replace('_', ' ').toUpperCase()}</span>
                          <span className={`badge badge-sm mt-1 align-self-start ${
                            selectedOrder.paymentStatus === 'paid' ? 'bg-success' :
                            selectedOrder.paymentStatus === 'failed' ? 'bg-danger' : 'bg-warning text-dark'
                          }`} style={{fontSize: '0.7rem'}}>
                            {selectedOrder.paymentStatus?.toUpperCase() || 'PENDING'}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="col-md-8">
                    <div className="info-card p-3 rounded-3" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '1px solid #dee2e6'}}>
                      <div className="d-flex align-items-center mb-3">
                        <i className="bi bi-person-circle text-success me-2" style={{fontSize: '1.2rem'}}></i>
                        <h6 className="mb-0 fw-bold">Customer Details</h6>
                      </div>
                      <div className="row g-3">
                        <div className="col-md-6">
                          <small className="text-muted d-block">Full Name</small>
                          <span className="fw-semibold">{selectedOrder.customerInfo?.name || 'N/A'}</span>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted d-block">Email Address</small>
                          <span className="fw-semibold">{selectedOrder.customerInfo?.email || 'N/A'}</span>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted d-block">Phone Number</small>
                          <span className="fw-semibold">{selectedOrder.customerInfo?.phone || 'N/A'}</span>
                        </div>
                        <div className="col-md-6">
                          <small className="text-muted d-block">Delivery Address</small>
                          <span className="fw-semibold">{selectedOrder.customerInfo?.address || 'N/A'}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="order-items-section">
                  <div className="d-flex align-items-center mb-4">
                    <i className="bi bi-bag-check text-info me-2" style={{fontSize: '1.2rem'}}></i>
                    <h6 className="mb-0 fw-bold">Order Items ({selectedOrder.items?.length || 0})</h6>
                  </div>
                  <div className="items-container">
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <div key={index} className="item-card d-flex align-items-center p-3 mb-3" style={{background: '#f8f9fa', borderRadius: '15px', border: '1px solid #e9ecef'}}>
                        <div className="position-relative me-3">
                          {item.image && (
                            <img src={item.image} alt={item.name} className="rounded-3" style={{width: '80px', height: '80px', objectFit: 'cover'}} />
                          )}
                          <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{fontSize: '0.7rem'}}>
                            {item.quantity || 0}
                          </span>
                        </div>
                        <div className="flex-grow-1">
                          <h6 className="mb-1 fw-bold" style={{color: '#2c3e50'}}>{item.name || 'N/A'}</h6>
                          <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="badge bg-light text-dark" style={{fontSize: '0.7rem'}}>Code: {item.code || 'N/A'}</span>
                            {item.size && (
                              <span className="badge bg-light text-dark" style={{fontSize: '0.7rem'}}>Size: {item.size}</span>
                            )}
                            {item.color && (
                              <span className="badge bg-light text-dark" style={{fontSize: '0.7rem'}}>Color: {item.color}</span>
                            )}
                          </div>
                          <div className="d-flex justify-content-between align-items-center">
                            <div>
                              <span className="text-muted small">Unit Price: </span>
                              <span className="fw-semibold">LKR {item.price?.toLocaleString() || '0'}</span>
                            </div>
                            <div className="text-end">
                              <div className="fw-bold" style={{color: '#27ae60', fontSize: '1.1rem'}}>LKR {((item.price || 0) * (item.quantity || 0)).toLocaleString()}</div>
                              <small className="text-muted">Total</small>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-4">
                        <i className="bi bi-inbox" style={{fontSize: '3rem', color: '#e9ecef'}}></i>
                        <p className="text-muted mt-2">No items found</p>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="order-summary mt-4 p-4 rounded-3" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white'}}>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="opacity-75">Subtotal ({selectedOrder.items?.length || 0} items)</span>
                    <span className="fw-semibold">LKR {selectedOrder.total?.toLocaleString() || '0'}</span>
                  </div>
                  <div className="d-flex justify-content-between align-items-center mb-3">
                    <span className="opacity-75">Delivery Charges</span>
                    <span className="fw-semibold">FREE</span>
                  </div>
                  <hr className="my-3 opacity-25" />
                  <div className="d-flex justify-content-between align-items-center">
                    <span className="fw-bold" style={{fontSize: '1.2rem'}}>Grand Total</span>
                    <span className="fw-bold" style={{fontSize: '1.4rem'}}>LKR {selectedOrder.total?.toLocaleString() || '0'}</span>
                  </div>
                </div>
              </div>
              <div className="modal-footer" style={{padding: '1.5rem 2rem', border: 'none', borderRadius: '0 0 20px 20px', background: '#f8f9fa'}}>
                <button type="button" className="btn btn-lg px-4" onClick={closeOrderModal} style={{background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600'}}>
                  <i className="bi bi-x-circle me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Order History Modal */}
      {showOrderHistoryModal && selectedOrderForHistory && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.8)', backdropFilter: 'blur(5px)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content" style={{borderRadius: '15px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '15px 15px 0 0', padding: '1.5rem', border: 'none'}}>
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <i className="bi bi-clock-history" style={{fontSize: '1.2rem'}}></i>
                  </div>
                  <div>
                    <h5 className="modal-title mb-1 fw-bold">Order Status History</h5>
                    <p className="mb-0 opacity-75">FB{String(selectedOrderForHistory.id || 1).padStart(6, '0')}</p>
                  </div>
                </div>
                <button type="button" className="btn btn-light rounded-circle" onClick={() => setShowOrderHistoryModal(false)} style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-x" style={{fontSize: '1.2rem'}}></i>
                </button>
              </div>
              <div className="modal-body" style={{padding: '2rem'}}>
                {selectedOrderHistory.length === 0 ? (
                  <div className="text-center py-5">
                    <i className="bi bi-clock-history display-4 text-muted mb-3"></i>
                    <h6 className="text-muted">No status changes recorded yet</h6>
                    <p className="text-muted small">Status updates will appear here when your order is processed</p>
                  </div>
                ) : (
                  <div className="timeline">
                    {selectedOrderHistory.map((history, index) => (
                      <div key={index} className="timeline-item d-flex mb-4">
                        <div className="timeline-marker me-3">
                          <div className={`rounded-circle d-flex align-items-center justify-content-center ${
                            history.newStatus === 'confirmed' ? 'bg-success' :
                            history.newStatus === 'shipped' ? 'bg-info' :
                            history.newStatus === 'delivered' ? 'bg-primary' :
                            history.newStatus === 'cancelled' ? 'bg-danger' : 'bg-warning'
                          }`} style={{width: '40px', height: '40px'}}>
                            <i className={`bi ${
                              history.newStatus === 'confirmed' ? 'bi-check-circle' :
                              history.newStatus === 'shipped' ? 'bi-truck' :
                              history.newStatus === 'delivered' ? 'bi-house-check' :
                              history.newStatus === 'cancelled' ? 'bi-x-circle' : 'bi-clock'
                            } text-white`}></i>
                          </div>
                        </div>
                        <div className="timeline-content flex-grow-1">
                          <div className="card border-0" style={{background: '#f8f9fa'}}>
                            <div className="card-body p-3">
                              <div className="d-flex justify-content-between align-items-start mb-2">
                                <div>
                                  <h6 className="mb-1 fw-bold text-capitalize">{history.newStatus}</h6>
                                  <small className="text-muted">Changed from: {history.previousStatus}</small>
                                </div>
                                <span className={`badge ${
                                  history.newStatus === 'confirmed' ? 'bg-success' :
                                  history.newStatus === 'shipped' ? 'bg-info' :
                                  history.newStatus === 'delivered' ? 'bg-primary' :
                                  history.newStatus === 'cancelled' ? 'bg-danger' : 'bg-warning text-dark'
                                }`}>
                                  {history.newStatus.toUpperCase()}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between align-items-center">
                                <small className="text-muted">
                                  <i className="bi bi-person-circle me-1"></i>
                                  Updated by: {history.changedBy?.username || 'System'}
                                </small>
                                <small className="text-muted">
                                  <i className="bi bi-calendar3 me-1"></i>
                                  {new Date(history.timestamp).toLocaleDateString()}
                                  <i className="bi bi-clock ms-2 me-1"></i>
                                  {new Date(history.timestamp).toLocaleTimeString()}
                                </small>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="modal-footer" style={{padding: '1.5rem', border: 'none', borderRadius: '0 0 15px 15px', background: '#f8f9fa'}}>
                <button type="button" className="btn btn-lg px-4" onClick={() => setShowOrderHistoryModal(false)} style={{background: 'linear-gradient(135deg, #6c757d 0%, #495057 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600'}}>
                  <i className="bi bi-x-circle me-2"></i>Close
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Verification Modal */}
      {showVerifyModal && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi ${verifyData.verified ? 'bi-check-circle' : 'bi-exclamation-triangle'} me-2`}></i>
                  {verifyData.verified ? 'Confirm Delivery' : 'Report Delivery Issue'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowVerifyModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <p className="text-muted">
                    {verifyData.verified 
                      ? 'Please confirm that you have received your order in good condition.' 
                      : 'Please describe the issue with your delivery.'}
                  </p>
                </div>
                <div className="mb-3">
                  <label className="form-label">Notes (Optional)</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={verifyData.notes}
                    onChange={(e) => setVerifyData({...verifyData, notes: e.target.value})}
                    placeholder={verifyData.verified 
                      ? 'Any additional comments about the delivery...' 
                      : 'Please describe the issue in detail...'}
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowVerifyModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className={`btn ${verifyData.verified ? 'btn-success' : 'btn-warning'}`} 
                  onClick={submitVerification}
                >
                  {verifyData.verified ? 'Confirm Delivery' : 'Report Issue'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Return/Damage Modal */}
      {showReturnModal && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header">
                <h5 className="modal-title">
                  <i className={`bi ${returnData.type === 'damage' ? 'bi-exclamation-triangle' : 'bi-arrow-return-left'} me-2`}></i>
                  {returnData.type === 'damage' ? 'Report Damage' : 'Return Request'}
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReturnModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Reason</label>
                  <select 
                    className="form-select" 
                    value={returnData.reason}
                    onChange={(e) => setReturnData({...returnData, reason: e.target.value})}
                  >
                    <option value="">Select reason</option>
                    {returnData.type === 'damage' ? (
                      <>
                        <option value="Damaged during shipping">Damaged during shipping</option>
                        <option value="Manufacturing defect">Manufacturing defect</option>
                        <option value="Wrong item received">Wrong item received</option>
                      </>
                    ) : (
                      <>
                        <option value="Wrong size">Wrong size</option>
                        <option value="Not as described">Not as described</option>
                        <option value="Changed mind">Changed mind</option>
                        <option value="Quality issues">Quality issues</option>
                      </>
                    )}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Description</label>
                  <textarea 
                    className="form-control" 
                    rows={3}
                    value={returnData.description}
                    onChange={(e) => setReturnData({...returnData, description: e.target.value})}
                    placeholder="Please provide details about the issue..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReturnModal(false)}>Cancel</button>
                <button type="button" className="btn btn-primary" onClick={submitReturn} disabled={!returnData.reason}>
                  Submit {returnData.type === 'damage' ? 'Damage Claim' : 'Return Request'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Upload Payment Slip Modal */}
      {showUploadModal && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-upload me-2"></i>
                  {orders.find(o => o._id === uploadOrderId)?.status === 'confirmed' ? 'Upload Bank Deposit Slip' : 'Upload Payment Slip'}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => {setShowUploadModal(false); setUploadOrderId('');}}></button>
              </div>
              <form onSubmit={uploadPaymentSlip}>
                <div className="modal-body">
                  <div className="mb-3">
                    <div className="alert alert-info">
                      <i className="bi bi-info-circle me-2"></i>
                      <strong>Order ID:</strong> {uploadOrderId}<br/>
                      <strong>Status:</strong> {orders.find(o => o._id === uploadOrderId)?.status === 'confirmed' ? 'Confirmed - Bank Deposit Required' : 'Bank Transfer Payment'}
                    </div>
                  </div>
                  <div className="mb-3">
                    <label className="form-label fw-bold">Payment Slip Image/Document *</label>
                    <input 
                      type="file" 
                      className="form-control" 
                      name="slip"
                      accept="image/*,.pdf"
                      required
                    />
                    <div className="form-text">Supported formats: JPG, PNG, PDF (Max 10MB)<br/>
                      <small className="text-muted">Upload your bank deposit slip or payment receipt</small>
                    </div>
                  </div>
                  <div className="alert alert-warning">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    <strong>Important:</strong> Please ensure the bank deposit slip clearly shows:
                    <ul className="mb-0 mt-2">
                      <li>Transaction date and time</li>
                      <li>Amount deposited: LKR {orders.find(o => o._id === uploadOrderId)?.total?.toFixed(2) || '0.00'}</li>
                      <li>Reference number</li>
                      <li>Bank details and branch</li>
                    </ul>
                  </div>
                  <div className="alert alert-success">
                    <i className="bi bi-bank me-2"></i>
                    <strong>Our Bank Details:</strong><br/>
                    Bank: Commercial Bank of Ceylon<br/>
                    Account: Fashion Breeze (Pvt) Ltd<br/>
                    Account No: 8001234567890
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowUploadModal(false)}>Cancel</button>
                  <button type="submit" className="btn btn-primary" disabled={uploadLoading}>
                    {uploadLoading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Uploading...</>
                    ) : (
                      <><i className="bi bi-upload me-2"></i>Upload Slip</>
                    )}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Payment Slip View Modal */}
      {showSlipModal && selectedSlip && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.8)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title">
                  <i className="bi bi-file-earmark-image me-2"></i>Payment Slip - Order {selectedSlip.orderNumber || selectedSlip._id?.slice(-8)}
                </h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowSlipModal(false)}></button>
              </div>
              <div className="modal-body text-center">
                <div className="mb-3">
                  <span className={`badge fs-6 ${
                    selectedSlip.paymentSlip?.status === 'verified' ? 'bg-success' :
                    selectedSlip.paymentSlip?.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                  }`}>
                    {selectedSlip.paymentSlip?.status?.toUpperCase() || 'PENDING'}
                  </span>
                </div>
                <div className="mb-3">
                  <small className="text-muted">Uploaded: {new Date(selectedSlip.paymentSlip?.uploadedAt).toLocaleString()}</small>
                </div>
                <div className="mb-4">
                  {(selectedSlip.paymentSlip?.imageData || selectedSlip.paymentSlip?.filename) ? (
                    <div>
                      <img 
                        src={selectedSlip.paymentSlip.imageData || selectedSlip.paymentSlip.filename} 
                        alt="Payment Slip" 
                        className="img-fluid rounded shadow"
                        style={{maxHeight: '500px', maxWidth: '100%'}}
                        onError={(e) => {
                          console.error('Image load error:', e);
                          (e.target as HTMLImageElement).style.display = 'none';
                          (e.target as HTMLImageElement).nextElementSibling?.classList.remove('d-none');
                        }}
                      />
                      <div className="text-center py-5 d-none">
                        <i className="bi bi-exclamation-triangle display-4 text-warning"></i>
                        <p className="text-muted mt-2">Failed to load payment slip image</p>
                        <small className="text-muted">Image data may be corrupted</small>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-5">
                      <i className="bi bi-file-image display-4 text-muted"></i>
                      <p className="text-muted mt-2">No payment slip available</p>
                    </div>
                  )}
                </div>
                {selectedSlip.paymentSlip?.status === 'rejected' && (
                  <div className="alert alert-danger">
                    <i className="bi bi-exclamation-triangle me-2"></i>
                    Your payment slip was rejected. Please contact support or upload a new slip.
                  </div>
                )}
                {selectedSlip.paymentSlip?.status === 'verified' && (
                  <div className="alert alert-success">
                    <i className="bi bi-check-circle me-2"></i>
                    Your payment has been verified successfully!
                  </div>
                )}
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowSlipModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Modal */}
      {showReviewModal && selectedOrder && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog">
            <div className="modal-content">
              <div className="modal-header bg-warning text-dark">
                <h5 className="modal-title">
                  <i className="bi bi-star me-2"></i>Add Product Review
                </h5>
                <button type="button" className="btn-close" onClick={() => setShowReviewModal(false)}></button>
              </div>
              <div className="modal-body">
                <div className="mb-3">
                  <label className="form-label">Select Product</label>
                  <select 
                    className="form-select" 
                    value={reviewData.productId}
                    onChange={(e) => setReviewData({...reviewData, productId: e.target.value})}
                  >
                    <option value="">Choose a product to review</option>
                    {selectedOrder.items?.map((item: any, index: number) => (
                      <option key={index} value={item.id || item._id}>
                        {item.name} - {item.code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="mb-3">
                  <label className="form-label">Rating</label>
                  <div className="d-flex gap-2">
                    {[1, 2, 3, 4, 5].map(star => (
                      <button
                        key={star}
                        type="button"
                        className={`btn ${star <= reviewData.rating ? 'btn-warning' : 'btn-outline-warning'}`}
                        onClick={() => setReviewData({...reviewData, rating: star})}
                      >
                        <i className="bi bi-star-fill"></i>
                      </button>
                    ))}
                    <span className="ms-2 align-self-center">{reviewData.rating} star{reviewData.rating !== 1 ? 's' : ''}</span>
                  </div>
                </div>
                <div className="mb-3">
                  <label className="form-label">Review Comment</label>
                  <textarea 
                    className="form-control" 
                    rows={4}
                    value={reviewData.comment}
                    onChange={(e) => setReviewData({...reviewData, comment: e.target.value})}
                    placeholder="Share your experience with this product..."
                  ></textarea>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setShowReviewModal(false)}>Cancel</button>
                <button 
                  type="button" 
                  className="btn btn-warning" 
                  onClick={submitReview}
                  disabled={!reviewData.productId || submittingReview}
                >
                  {submittingReview ? 'Submitting...' : 'Submit Review'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}