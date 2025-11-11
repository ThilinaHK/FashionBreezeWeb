'use client';

import { useState, useEffect } from 'react';
import { Product } from '../types';
import ImageWithFallback from '../components/ImageWithFallback';

// import { useSocket } from '../components/SocketProvider';

export default function DashboardPage() {
  // const { socket, isConnected } = useSocket();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<any[]>([]);
  const [customers, setCustomers] = useState<any[]>([]);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [activeTab, setActiveTab] = useState('products');
  const [showModal, setShowModal] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [categoryName, setCategoryName] = useState('');
  const [categoryDeliveryCost, setCategoryDeliveryCost] = useState(0);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    cost: 0,
    vat: 0,
    price: 0,
    category: '',
    subcategory: '',
    brand: '',
    image: '',
    images: ['', '', '', ''] as string[],
    status: 'instock' as 'instock' | 'outofstock',
    sizes: [] as Array<{size: string, colors: Array<{name: string, code: string, stock: number, price: number}>, stock: number, price: number}>,
    colors: [] as Array<{name: string, code: string, image: string}>,
    description: '',
    specifications: {
      material: '',
      careInstructions: '',
      weight: '',
      origin: ''
    }
  });
  const [saving, setSaving] = useState(false);
  const [updatingOrder, setUpdatingOrder] = useState<string | null>(null);
  const [updatingPayment, setUpdatingPayment] = useState<string | null>(null);
  const [savingCategory, setSavingCategory] = useState(false);
  const [productFilter, setProductFilter] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [orderFilter, setOrderFilter] = useState('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string | null>(null);
  const [paymentStatusFilter, setPaymentStatusFilter] = useState<string | null>(null);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [loadingCategories, setLoadingCategories] = useState(true);
  const [loadingCustomers, setLoadingCustomers] = useState(true);
  const [loadingOrders, setLoadingOrders] = useState(true);
  const [deletingProduct, setDeletingProduct] = useState<string | number | null>(null);
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error'} | null>(null);
  const [updatingCustomer, setUpdatingCustomer] = useState<string | null>(null);
  const [updatingReturn, setUpdatingReturn] = useState<string | null>(null);
  const [showOrderModal, setShowOrderModal] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<any>(null);
  const [users, setUsers] = useState<any[]>([]);
  const [showUserModal, setShowUserModal] = useState(false);
  const [editingUser, setEditingUser] = useState<any>(null);
  const [userFormData, setUserFormData] = useState({
    username: '',
    email: '',
    password: '',
    role: 'staff',
    privileges: {
      products: false,
      categories: false,
      orders: false,
      customers: false,
      users: false,
      analytics: false
    },
    status: 'active'
  });
  const [loadingUsers, setLoadingUsers] = useState(true);
  const [savingUser, setSavingUser] = useState(false);
  const [userFilter, setUserFilter] = useState('');
  const [userReports, setUserReports] = useState<any[]>([]);
  const [loadingReports, setLoadingReports] = useState(false);
  const [returns, setReturns] = useState<any[]>([]);
  const [loadingReturns, setLoadingReturns] = useState(false);
  const [showReturnDetailsModal, setShowReturnDetailsModal] = useState(false);
  const [selectedReturn, setSelectedReturn] = useState<any>(null);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [orderHistory, setOrderHistory] = useState<any[]>([]);
  const [selectedOrderForHistory, setSelectedOrderForHistory] = useState<any>(null);
  const [salesData, setSalesData] = useState<any>(null);
  const [loadingSales, setLoadingSales] = useState(false);
  const [addresses, setAddresses] = useState<any[]>([]);
  const [loadingAddresses, setLoadingAddresses] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [editingAddress, setEditingAddress] = useState<any>(null);
  const [showRestockModal, setShowRestockModal] = useState(false);
  const [restockingProduct, setRestockingProduct] = useState<Product | null>(null);
  const [restockData, setRestockData] = useState<{[key: string]: number}>({});
  const [showSlipModal, setShowSlipModal] = useState(false);
  const [selectedSlip, setSelectedSlip] = useState<any>(null);
  const [stockAlerts, setStockAlerts] = useState<any[]>([]);
  const [loadingStockAlerts, setLoadingStockAlerts] = useState(false);
  const [topProducts, setTopProducts] = useState<any[]>([]);
  const [loadingTopProducts, setLoadingTopProducts] = useState(false);
  const [analyticsData, setAnalyticsData] = useState<any>(null);
  const [loadingAnalytics, setLoadingAnalytics] = useState(false);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const [selectedMonth, setSelectedMonth] = useState<number | null>(null);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [addressFormData, setAddressFormData] = useState({
    name: '',
    type: 'country',
    parentId: null as number | null
  });
  const [parentAddresses, setParentAddresses] = useState<any[]>([]);
  const [savingAddress, setSavingAddress] = useState(false);
  const [showCustomerModal, setShowCustomerModal] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [customerFormData, setCustomerFormData] = useState({
    name: '',
    email: '',
    phone: '',
    country: '',
    address: { line1: '', line2: '', line3: '' }
  });
  const [savingCustomer, setSavingCustomer] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [loadingSlides, setLoadingSlides] = useState(false);
  const [showSlideModal, setShowSlideModal] = useState(false);
  const [editingSlide, setEditingSlide] = useState<any>(null);
  const [slideFormData, setSlideFormData] = useState({
    title: '',
    subtitle: '',
    image: '',
    saleType: 'flash_sale',
    discount: 0,
    validUntil: '',
    isActive: true,
    order: 1
  });
  const [savingSlide, setSavingSlide] = useState(false);
  const [tailors, setTailors] = useState<any[]>([]);
  const [loadingTailors, setLoadingTailors] = useState(false);
  const [showSubcategoryModal, setShowSubcategoryModal] = useState(false);
  const [editingSubcategory, setEditingSubcategory] = useState<any>(null);
  const [subcategoryFormData, setSubcategoryFormData] = useState({
    name: '',
    categoryId: '',
    description: ''
  });
  const [savingSubcategory, setSavingSubcategory] = useState(false);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const loggedIn = localStorage.getItem('adminLoggedIn') === 'true';
      const userData = localStorage.getItem('adminUser');
      
      if (loggedIn && userData) {
        const user = JSON.parse(userData);
        setCurrentUser(user);
        setIsLoggedIn(true);
        
        // Load essential data first
        loadProducts();
        loadCategories();
        
        // Load other data after a short delay to improve perceived performance
        setTimeout(() => {
          loadCustomers();
          loadOrders();
          loadUsers();
          loadSalesData();
        }, 100);
        
        setTimeout(() => {
          loadUserReports();
          loadReturns();
          loadAddresses();
          loadStockAlerts();
          loadTopProducts();
          loadSlides();
          loadTailors();
        }, 200);
      } else {
        setIsLoggedIn(false);
      }
    }
  }, []);

  // useEffect(() => {
  //   if (socket && isConnected) {
  //     socket.on('newOrder', (data) => {
  //       setToast({message: `🛒 New Order: ${data.orderNumber} from ${data.customerName} - LKR ${data.total.toFixed(2)} (${data.itemCount} items)`, type: 'success'});
  //       setTimeout(() => setToast(null), 8000);
  //       loadOrders();
  //       loadSalesData();
  //     });

  //     socket.on('paymentSlipUploaded', (data) => {
  //       setToast({message: `💳 Payment Slip Uploaded: ${data.orderNumber} from ${data.customerName}`, type: 'success'});
  //       setTimeout(() => setToast(null), 8000);
  //       loadOrders();
  //     });

  //     socket.on('paymentSlipStatusChanged', (data) => {
  //       setToast({message: `📋 Payment Slip ${data.status.toUpperCase()}: ${data.orderNumber}`, type: data.status === 'verified' ? 'success' : 'error'});
  //       setTimeout(() => setToast(null), 8000);
  //       loadOrders();
  //     });
  //   }
  // }, [socket, isConnected]);



  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const response = await fetch('/api/products', {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const products = await response.json();
      setProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]);
    } finally {
      setLoadingProducts(false);
    }
  };

  const loadCategories = async () => {
    setLoadingCategories(true);
    try {
      const response = await fetch(`/api/categories?t=${Date.now()}`, {
        headers: { 'Cache-Control': 'no-cache' }
      });
      const categories = await response.json();
      setCategories(Array.isArray(categories) ? categories : []);
    } catch (error) {
      console.error('Error loading categories:', error);
      setCategories([]);
    } finally {
      setLoadingCategories(false);
    }
  };

  const loadCustomers = async () => {
    setLoadingCustomers(true);
    try {
      const response = await fetch('/api/customers');
      const customers = await response.json();
      setCustomers(Array.isArray(customers) ? customers : []);
    } catch (error) {
      console.error('Error loading customers:', error);
      setCustomers([]);
    } finally {
      setLoadingCustomers(false);
    }
  };

  const loadOrders = async () => {
    setLoadingOrders(true);
    try {
      const response = await fetch('/api/orders');
      const orders = await response.json();
      console.log('Admin dashboard - loaded orders:', orders.length);
      const ordersWithSlips = orders.filter((order: any) => order.paymentSlip);
      console.log('Admin dashboard - orders with payment slips:', ordersWithSlips.length);
      if (ordersWithSlips.length > 0) {
        console.log('Sample order with slip:', ordersWithSlips[0].paymentSlip);
      }
      setOrders(Array.isArray(orders) ? orders : []);
    } catch (error) {
      console.error('Error loading orders:', error);
      setOrders([]);
    } finally {
      setLoadingOrders(false);
    }
  };

  const loadUsers = async () => {
    setLoadingUsers(true);
    try {
      const response = await fetch('/api/users');
      const users = await response.json();
      setUsers(Array.isArray(users) ? users : []);
    } catch (error) {
      console.error('Error loading users:', error);
      setUsers([]);
    } finally {
      setLoadingUsers(false);
    }
  };

  const loadUserReports = async () => {
    setLoadingReports(true);
    try {
      const response = await fetch('/api/reports/user-activity');
      const reports = await response.json();
      setUserReports(Array.isArray(reports) ? reports : []);
    } catch (error) {
      console.error('Error loading user reports:', error);
      setUserReports([]);
    } finally {
      setLoadingReports(false);
    }
  };

  const loadReturns = async () => {
    setLoadingReturns(true);
    try {
      const response = await fetch('/api/returns');
      const returnsData = await response.json();
      setReturns(Array.isArray(returnsData) ? returnsData : []);
    } catch (error) {
      console.error('Error loading returns:', error);
      setReturns([]);
    } finally {
      setLoadingReturns(false);
    }
  };

  const loadSalesData = async () => {
    setLoadingSales(true);
    try {
      const response = await fetch('/api/analytics/sales');
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error loading sales data:', error);
      setSalesData(null);
    } finally {
      setLoadingSales(false);
    }
  };

  const loadStockAlerts = async () => {
    setLoadingStockAlerts(true);
    try {
      const response = await fetch('/api/products/stock-alerts');
      const alerts = await response.json();
      setStockAlerts(Array.isArray(alerts) ? alerts : []);
    } catch (error) {
      console.error('Error loading stock alerts:', error);
      setStockAlerts([]);
    } finally {
      setLoadingStockAlerts(false);
    }
  };

  const loadTopProducts = async () => {
    setLoadingTopProducts(true);
    try {
      const response = await fetch('/api/analytics/top-products');
      const products = await response.json();
      setTopProducts(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading top products:', error);
      setTopProducts([]);
    } finally {
      setLoadingTopProducts(false);
    }
  };

  const loadAnalytics = async () => {
    setLoadingAnalytics(true);
    try {
      const params = new URLSearchParams({
        year: selectedYear.toString(),
        ...(selectedMonth && { month: selectedMonth.toString() }),
        ...(selectedCategory && { category: selectedCategory })
      });
      const response = await fetch(`/api/analytics/product-orders?${params}`);
      const data = await response.json();
      setAnalyticsData(data);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setAnalyticsData(null);
    } finally {
      setLoadingAnalytics(false);
    }
  };

  const downloadPDF = async () => {
    if (!analyticsData) return;
    
    const jsPDF = (await import('jspdf')).default;
    
    const pdf = new jsPDF('p', 'mm', 'a4');
    const pageWidth = pdf.internal.pageSize.getWidth();
    const pageHeight = pdf.internal.pageSize.getHeight();
    
    // Header with logo space
    pdf.setFontSize(24);
    pdf.setTextColor(102, 126, 234); // Primary color
    pdf.text('FASHION BREEZE', pageWidth / 2, 25, { align: 'center' });
    
    pdf.setFontSize(16);
    pdf.setTextColor(0, 0, 0);
    pdf.text('Product Orders Calendar Report', pageWidth / 2, 35, { align: 'center' });
    
    // Report details
    pdf.setFontSize(12);
    const reportTitle = `${selectedCategory || 'All Categories'} - ${selectedYear}${selectedMonth ? ` (${new Date(0, selectedMonth - 1).toLocaleString('default', { month: 'long' })})` : ''}`;
    pdf.text(reportTitle, pageWidth / 2, 45, { align: 'center' });
    
    pdf.setFontSize(10);
    pdf.setTextColor(128, 128, 128);
    pdf.text(`Generated on: ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`, pageWidth / 2, 52, { align: 'center' });
    
    // Summary statistics box
    const totalOrders = Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.orders, 0) as number;
    const totalRevenue = Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.revenue, 0) as number;
    const totalQuantity = Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.quantity, 0) as number;
    const activeDays = Object.values(analyticsData.dailyData).filter((day: any) => day.orders > 0).length as number;
    
    // Summary box
    pdf.setDrawColor(200, 200, 200);
    pdf.rect(15, 60, pageWidth - 30, 35);
    
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('SUMMARY STATISTICS', pageWidth / 2, 70, { align: 'center' });
    
    pdf.setFontSize(11);
    const summaryY = 78;
    pdf.text(`Total Orders: ${totalOrders}`, 25, summaryY);
    pdf.text(`Total Revenue: LKR ${totalRevenue.toFixed(2)}`, 25, summaryY + 7);
    pdf.text(`Total Quantity: ${totalQuantity}`, 25, summaryY + 14);
    pdf.text(`Active Days: ${activeDays}`, 25, summaryY + 21);
    
    // Average calculations
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const avgDailyOrders = activeDays > 0 ? totalOrders / activeDays : 0;
    
    pdf.text(`Avg Order Value: LKR ${avgOrderValue.toFixed(2)}`, pageWidth / 2 + 10, summaryY);
    pdf.text(`Avg Daily Orders: ${avgDailyOrders.toFixed(1)}`, pageWidth / 2 + 10, summaryY + 7);
    pdf.text(`Peak Day Revenue: LKR ${Math.max(...Object.values(analyticsData.dailyData).map((day: any) => day.revenue)).toFixed(2)}`, pageWidth / 2 + 10, summaryY + 14);
    pdf.text(`Peak Day Orders: ${Math.max(...Object.values(analyticsData.dailyData).map((day: any) => day.orders))}`, pageWidth / 2 + 10, summaryY + 21);
    
    // Data table header
    let yPos = 110;
    pdf.setFontSize(12);
    pdf.setTextColor(0, 0, 0);
    pdf.text('DAILY BREAKDOWN', pageWidth / 2, yPos, { align: 'center' });
    
    yPos += 15;
    
    // Table headers
    pdf.setFillColor(102, 126, 234);
    pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
    
    pdf.setFontSize(10);
    pdf.setTextColor(255, 255, 255);
    pdf.text('Date', 25, yPos);
    pdf.text('Day', 60, yPos);
    pdf.text('Orders', 90, yPos);
    pdf.text('Quantity', 120, yPos);
    pdf.text('Revenue (LKR)', 150, yPos);
    
    yPos += 10;
    pdf.setTextColor(0, 0, 0);
    
    // Data rows
    const sortedData = Object.entries(analyticsData.dailyData).sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime());
    
    sortedData.forEach(([date, data]: [string, any], index) => {
      if (yPos > pageHeight - 30) {
        pdf.addPage();
        yPos = 30;
        
        // Repeat headers on new page
        pdf.setFillColor(102, 126, 234);
        pdf.rect(20, yPos - 5, pageWidth - 40, 10, 'F');
        
        pdf.setFontSize(10);
        pdf.setTextColor(255, 255, 255);
        pdf.text('Date', 25, yPos);
        pdf.text('Day', 60, yPos);
        pdf.text('Orders', 90, yPos);
        pdf.text('Quantity', 120, yPos);
        pdf.text('Revenue (LKR)', 150, yPos);
        
        yPos += 10;
        pdf.setTextColor(0, 0, 0);
      }
      
      // Alternate row colors
      if (index % 2 === 0) {
        pdf.setFillColor(248, 249, 250);
        pdf.rect(20, yPos - 4, pageWidth - 40, 8, 'F');
      }
      
      const dateObj = new Date(date);
      pdf.text(dateObj.toLocaleDateString(), 25, yPos);
      pdf.text(dateObj.toLocaleDateString('en', {weekday: 'short'}), 60, yPos);
      pdf.text(data.orders.toString(), 90, yPos);
      pdf.text(data.quantity.toString(), 120, yPos);
      pdf.text(data.revenue.toFixed(2), 150, yPos);
      yPos += 8;
    });
    
    // Footer
    const footerY = pageHeight - 20;
    pdf.setFontSize(8);
    pdf.setTextColor(128, 128, 128);
    pdf.text('Fashion Breeze Admin Dashboard - Confidential Report', pageWidth / 2, footerY, { align: 'center' });
    pdf.text(`Page 1 of ${pdf.getNumberOfPages()}`, pageWidth - 20, footerY, { align: 'right' });
    
    const fileName = `fashion-breeze-orders-report-${selectedYear}${selectedMonth ? `-${selectedMonth.toString().padStart(2, '0')}` : ''}-${new Date().toISOString().split('T')[0]}.pdf`;
    pdf.save(fileName);
  };

  const loadAddresses = async () => {
    setLoadingAddresses(true);
    try {
      console.log('Loading addresses...');
      const response = await fetch('/api/addresses');
      console.log('Address response status:', response.status);
      
      if (!response.ok) {
        const errorText = await response.text();
        console.error('Address API error:', errorText);
        throw new Error(`HTTP ${response.status}: ${errorText}`);
      }
      
      const data = await response.json();
      console.log('Address data received:', data);
      setAddresses(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error loading addresses:', error);
      setAddresses([]);
      setToast({message: `Failed to load addresses: ${(error as Error).message}`, type: 'error'});
      setTimeout(() => setToast(null), 5000);
    } finally {
      setLoadingAddresses(false);
    }
  };

  const loadParentAddresses = async (type: string) => {
    try {
      let parentType = '';
      if (type === 'region') parentType = 'country';
      else if (type === 'district') parentType = 'region';
      else if (type === 'city') parentType = 'district';
      
      if (parentType) {
        const response = await fetch(`/api/addresses?type=${parentType}`);
        const data = await response.json();
        setParentAddresses(Array.isArray(data) ? data : []);
      } else {
        setParentAddresses([]);
      }
    } catch (error) {
      console.error('Error loading parent addresses:', error);
      setParentAddresses([]);
    }
  };

  const openAddressModal = (address?: any) => {
    if (address) {
      setEditingAddress(address);
      setAddressFormData({
        name: address.name,
        type: address.type,
        parentId: address.parentId
      });
      loadParentAddresses(address.type);
    } else {
      setEditingAddress(null);
      setAddressFormData({ name: '', type: 'country', parentId: null });
      setParentAddresses([]);
    }
    setShowAddressModal(true);
  };

  const handleTypeChange = (type: string) => {
    setAddressFormData({ ...addressFormData, type, parentId: null });
    loadParentAddresses(type);
  };

  const saveAddress = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingAddress(true);
    try {
      const method = editingAddress ? 'PUT' : 'POST';
      const body = editingAddress ? { id: editingAddress.id, ...addressFormData } : addressFormData;
      
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      
      const response = await fetch('/api/addresses', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-name': currentUser.username || ''
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await loadAddresses();
        setShowAddressModal(false);
        setToast({message: editingAddress ? 'Address updated successfully!' : 'Address created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setToast({message: errorData.error || 'Failed to save address', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving address:', error);
      setToast({message: 'Failed to save address', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingAddress(false);
    }
  };

  const deleteAddress = async (address: any) => {
    if (confirm('Are you sure you want to delete this address?')) {
      try {
        const response = await fetch(`/api/addresses?id=${address.id}`, { method: 'DELETE' });
        if (response.ok) {
          await loadAddresses();
          setToast({message: 'Address deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting address:', error);
        setToast({message: 'Failed to delete address', type: 'error'});
      } finally {
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const seedAddresses = async () => {
    try {
      console.log('Seeding addresses...');
      const response = await fetch('/api/addresses/seed', { method: 'POST' });
      console.log('Seed response status:', response.status);
      
      if (response.ok) {
        const result = await response.json();
        console.log('Seed result:', result);
        await loadAddresses();
        setToast({message: result.message || 'Dummy addresses created successfully!', type: 'success'});
      } else {
        const errorData = await response.json();
        console.error('Seed error:', errorData);
        setToast({message: errorData.error || 'Failed to create dummy addresses', type: 'error'});
      }
    } catch (error) {
      console.error('Error seeding addresses:', error);
      setToast({message: `Failed to create dummy addresses: ${(error as Error).message}`, type: 'error'});
    } finally {
      setTimeout(() => setToast(null), 5000);
    }
  };

  const viewOrderHistory = async (orderId: string) => {
    try {
      const response = await fetch(`/api/orders/history?orderId=${orderId}`);
      const history = await response.json();
      setOrderHistory(Array.isArray(history) ? history : []);
      setSelectedOrderForHistory(orders.find(o => o._id === orderId));
      setShowHistoryModal(true);
    } catch (error) {
      console.error('Error loading order history:', error);
      setToast({message: 'Failed to load order history', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updateReturnStatus = async (returnId: string, status: string, adminNotes?: string) => {
    setUpdatingReturn(returnId);
    try {
      const response = await fetch('/api/returns', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ returnId, status, adminNotes })
      });
      
      if (response.ok) {
        await loadReturns();
        setToast({message: 'Return status updated successfully!', type: 'success'});
      }
    } catch (error) {
      console.error('Error updating return status:', error);
      setToast({message: 'Failed to update return status', type: 'error'});
    } finally {
      setUpdatingReturn(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const viewReturnDetails = async (returnItem: any) => {
    try {
      // Get order details for the return
      const orderResponse = await fetch(`/api/orders`);
      const allOrders = await orderResponse.json();
      const relatedOrder = allOrders.find((order: any) => order._id === returnItem.orderId);
      
      setSelectedReturn({ ...returnItem, orderDetails: relatedOrder });
      setShowReturnDetailsModal(true);
    } catch (error) {
      console.error('Error loading return details:', error);
      setToast({message: 'Failed to load return details', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const openUserModal = (user?: any) => {
    if (user) {
      setEditingUser(user);
      setUserFormData({
        username: user.username,
        email: user.email,
        password: '',
        role: user.role,
        privileges: user.privileges || {
          products: false,
          categories: false,
          orders: false,
          customers: false,
          users: false,
          analytics: false
        },
        status: user.status
      });
    } else {
      setEditingUser(null);
      setUserFormData({
        username: '',
        email: '',
        password: '',
        role: 'staff',
        privileges: {
          products: false,
          categories: false,
          orders: false,
          customers: false,
          users: false,
          analytics: false
        },
        status: 'active'
      });
    }
    setShowUserModal(true);
  };

  const saveUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingUser(true);
    try {
      const method = editingUser ? 'PUT' : 'POST';
      const body = editingUser ? { id: editingUser.id, ...userFormData } : userFormData;
      
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      
      const response = await fetch('/api/users', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-name': currentUser.username || ''
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await loadUsers();
        setShowUserModal(false);
        setToast({message: editingUser ? 'User updated successfully!' : 'User created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setToast({message: errorData.error || 'Failed to save user', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving user:', error);
      setToast({message: 'Failed to save user', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingUser(false);
    }
  };

  const deleteUser = async (user: any) => {
    if (confirm('Are you sure you want to delete this user?')) {
      try {
        const response = await fetch(`/api/users?id=${user.id}`, { method: 'DELETE' });
        if (response.ok) {
          setUsers(users.filter(u => u.id !== user.id));
          setToast({message: 'User deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting user:', error);
        setToast({message: 'Failed to delete user', type: 'error'});
      } finally {
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const updateOrderStatus = async (orderId: string, status: string) => {
    setUpdatingOrder(orderId);
    try {
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-name': currentUser.username || ''
        },
        body: JSON.stringify({ orderId, status })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        const updatedOrder = orders.find(order => order._id === orderId);
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, status } : order
        ));
        

        
        if (updatedOrder?.customerInfo?.email) {
          await fetch('/api/notifications', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              email: updatedOrder.customerInfo.email,
              orderNumber: updatedOrder.orderNumber || orderId.slice(-8),
              status: status,
              customerName: updatedOrder.customerInfo.name
            })
          });
        }
        
        setToast({message: `Order status updated to ${status}. Customer notified!`, type: 'success'});
      } else {
        setToast({message: result.error || 'Failed to update order status', type: 'error'});
      }
    } catch (error) {
      console.error('Error updating order status:', error);
      setToast({message: 'Failed to update order status', type: 'error'});
    } finally {
      setUpdatingOrder(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const updatePaymentInfo = async (orderId: string, field: string, value: string) => {
    setUpdatingPayment(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, [field]: value })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, [field]: value } : order
        ));
        setToast({message: `Payment ${field.replace('payment', '').toLowerCase()} updated successfully!`, type: 'success'});
      } else {
        setToast({message: result.error || 'Failed to update payment information', type: 'error'});
      }
    } catch (error) {
      console.error('Error updating payment info:', error);
      setToast({message: 'Failed to update payment information', type: 'error'});
    } finally {
      setUpdatingPayment(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const cancelOrder = async (order: any) => {
    if (confirm('Are you sure you want to cancel this order?')) {
      await updateOrderStatus(order._id, 'cancelled');
    }
  };

  const toggleOrderActive = async (orderId: string, isActive: boolean) => {
    setUpdatingOrder(orderId);
    try {
      const response = await fetch('/api/orders', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, isActive })
      });
      
      const result = await response.json();
      
      if (response.ok && result.success) {
        setOrders(orders.map(order => 
          order._id === orderId ? { ...order, isActive } : order
        ));
        setToast({message: `Order ${isActive ? 'activated' : 'deactivated'} successfully!`, type: 'success'});
      } else {
        setToast({message: result.error || 'Failed to update order status', type: 'error'});
      }
    } catch (error) {
      console.error('Error updating order active status:', error);
      setToast({message: 'Failed to update order status', type: 'error'});
    } finally {
      setUpdatingOrder(null);
      setTimeout(() => setToast(null), 3000);
    }
  };

  const logout = () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('adminLoggedIn');
      localStorage.removeItem('adminUser');
      window.location.href = '/login';
    }
  };

  const hasPrivilege = (privilege: string) => {
    return currentUser?.privileges?.[privilege] === true;
  };

  const getSubcategories = (categoryName: string) => {
    const category = categories.find(cat => cat.name === categoryName);
    return category?.subcategories || [];
  };

  const openSubcategoryModal = (subcategory?: any, category?: any) => {
    if (subcategory && category) {
      setEditingSubcategory({...subcategory, categoryId: category._id});
      setSubcategoryFormData({
        name: subcategory.name,
        categoryId: category._id,
        description: subcategory.description || ''
      });
    } else {
      setEditingSubcategory(null);
      setSubcategoryFormData({ name: '', categoryId: '', description: '' });
    }
    setShowSubcategoryModal(true);
  };

  const saveSubcategory = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSubcategory(true);
    try {
      const category = categories.find(cat => cat._id === subcategoryFormData.categoryId);
      if (!category) return;
      
      let updatedSubcategories = [...(category.subcategories || [])];
      
      if (editingSubcategory) {
        // Edit existing
        const index = updatedSubcategories.findIndex(sub => sub.slug === editingSubcategory.slug);
        if (index !== -1) {
          updatedSubcategories[index] = {
            ...updatedSubcategories[index],
            name: subcategoryFormData.name,
            description: subcategoryFormData.description
          };
        }
      } else {
        // Add new
        updatedSubcategories.push({
          name: subcategoryFormData.name,
          slug: subcategoryFormData.name.toLowerCase().replace(/\s+/g, '-'),
          description: subcategoryFormData.description,
          isActive: true
        });
      }
      
      const response = await fetch('/api/categories', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: category._id,
          subcategories: updatedSubcategories
        })
      });
      
      if (response.ok) {
        loadCategories();
        setShowSubcategoryModal(false);
        setToast({message: editingSubcategory ? 'Subcategory updated successfully!' : 'Subcategory added successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      setToast({message: 'Failed to save subcategory', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingSubcategory(false);
    }
  };

  const deleteSubcategory = async (categoryId: string, subcategorySlug: string) => {
    if (confirm('Are you sure you want to delete this subcategory?')) {
      try {
        const category = categories.find(cat => cat._id === categoryId);
        if (!category) return;
        
        const updatedSubcategories = category.subcategories?.filter(sub => sub.slug !== subcategorySlug) || [];
        
        const response = await fetch('/api/categories', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            id: categoryId,
            subcategories: updatedSubcategories
          })
        });
        
        if (response.ok) {
          loadCategories();
          setToast({message: 'Subcategory deleted successfully!', type: 'success'});
          setTimeout(() => setToast(null), 3000);
        }
      } catch (error) {
        setToast({message: 'Failed to delete subcategory', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const generateProductCode = () => {
    const prefix = 'FB';
    const timestamp = Date.now().toString().slice(-6);
    const random = Math.floor(Math.random() * 100).toString().padStart(2, '0');
    return `${prefix}${timestamp}${random}`;
  };

  const openModal = (product?: Product) => {
    if (product) {
      setEditingProduct(product);
      setFormData({
        name: product.name,
        code: product.code,
        cost: product.cost || 0,
        vat: product.vat || 0,
        price: product.price,
        category: product.category,
        subcategory: (product as any).subcategory || '',
        brand: (product as any).brand || '',
        image: product.image,
        images: Array.isArray((product as any).additionalImages) ? 
          (product as any).additionalImages.concat(['', '', '', '']).slice(0, 4) : 
          ['', '', '', ''],
        status: (product.status as any) === 'active' ? 'instock' : product.status as 'instock' | 'outofstock',
        sizes: Array.isArray(product.sizes) ? product.sizes.map(size => ({
          size: size.size,
          colors: Array.isArray((size as any).colors) ? (size as any).colors : [],
          stock: size.stock,
          price: size.price
        })) : [],
        colors: Array.isArray((product as any).colors) ? (product as any).colors : [],
        description: (product as any).description || '',
        specifications: {
          material: (product as any).specifications?.material || '',
          careInstructions: (product as any).specifications?.careInstructions || '',
          weight: (product as any).specifications?.weight || '',
          origin: (product as any).specifications?.origin || ''
        }
      });
    } else {
      setEditingProduct(null);
      setFormData({ name: '', code: generateProductCode(), cost: 0, vat: 0, price: 0, category: '', subcategory: '', brand: '', image: '', images: ['', '', '', ''], status: 'instock', sizes: [], colors: [], description: '', specifications: { material: '', careInstructions: '', weight: '', origin: '' } });
    }
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setEditingProduct(null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      // Check for duplicate product code
      const isDuplicate = products.some(p => 
        p.code === formData.code && 
        (!editingProduct || (
          (p._id || p.id) !== (editingProduct._id || editingProduct.id)
        ))
      );
      
      if (isDuplicate) {
        setToast({message: 'Product code already exists. Please use a different code.', type: 'error'});
        setTimeout(() => setToast(null), 3000);
        setSaving(false);
        return;
      }
      
      const productId = editingProduct ? (editingProduct.id || editingProduct._id) : null;
      const url = editingProduct ? `/api/products/${productId}` : '/api/products';
      const method = editingProduct ? 'PUT' : 'POST';
      
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      
      const response = await fetch(url, {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-name': currentUser.username || ''
        },
        body: JSON.stringify({
          name: formData.name,
          code: formData.code,
          cost: formData.cost,
          vat: formData.vat,
          price: formData.price,
          category: formData.category,
          subcategory: formData.subcategory,
          brand: formData.brand,
          image: formData.image,
          additionalImages: formData.images.filter(img => img && img.trim()),
          status: formData.status,
          sizes: formData.sizes,
          colors: formData.colors,
          description: formData.description,
          specifications: formData.specifications
        })
      });
      
      if (response.ok) {
        const result = await response.json();
        // Always reload products after insert/update
        await loadProducts();
        await loadStockAlerts();
        closeModal();
        setToast({message: editingProduct ? 'Product updated successfully!' : 'Product created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setToast({message: errorData.error || 'Failed to save product', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving product:', error);
      setToast({message: 'Failed to save product', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSaving(false);
    }
  };

  const deleteProduct = async (product: Product) => {
    const productId = product._id || product.id;
    const productKey = product._id || product.id || product.code;
    if (confirm('Are you sure you want to delete this product?')) {
      setDeletingProduct(productKey);
      try {
        // Check if product is in any orders
        const ordersResponse = await fetch('/api/orders');
        const allOrders = await ordersResponse.json();
        const productInOrders = allOrders.some((order: any) => 
          order.items?.some((item: any) => 
            item.id === product.id || 
            item._id === String(product.id) || 
            item.code === product.code
          )
        );
        
        if (productInOrders) {
          setToast({message: 'Cannot delete product: It exists in customer orders', type: 'error'});
          setDeletingProduct(null);
          setTimeout(() => setToast(null), 3000);
          return;
        }
        
        const response = await fetch(`/api/products/${productId}`, { method: 'DELETE' });
        if (response.ok) {
          await loadProducts();
          setToast({message: 'Product deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting product:', error);
        setToast({message: 'Failed to delete product', type: 'error'});
      } finally {
        setDeletingProduct(null);
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const openCategoryModal = (category?: any) => {
    console.log('Opening category modal with:', category);
    console.log('Delivery cost from category:', category?.deliveryCost);
    setEditingCategory(category || null);
    setCategoryName(category?.name || '');
    setCategoryDeliveryCost(Number(category?.deliveryCost) || 300);
    setShowCategoryModal(true);
  };

  const saveCategoryHandler = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCategory(true);
    try {
      const method = editingCategory ? 'PUT' : 'POST';
      const categoryId = editingCategory?._id || editingCategory?.id;
      const deliveryCostValue = Number(categoryDeliveryCost) || 300;
      
      const body = editingCategory ? 
        { _id: categoryId, id: categoryId, name: categoryName, deliveryCost: deliveryCostValue } : 
        { name: categoryName, deliveryCost: deliveryCostValue };
      
      console.log('Saving category with data:', body);
      console.log('Delivery cost value:', deliveryCostValue);
      console.log('Category ID being used:', categoryId);
      
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      
      const response = await fetch('/api/categories', {
        method,
        headers: { 
          'Content-Type': 'application/json',
          'x-user-id': currentUser.id || '',
          'x-user-name': currentUser.username || ''
        },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await loadCategories();
        setShowCategoryModal(false);
        setCategoryName('');
        setCategoryDeliveryCost(300);
        setEditingCategory(null);
        
        // Trigger product refresh to update delivery costs
        if (typeof window !== 'undefined') {
          localStorage.setItem('products_timestamp', Date.now().toString());
          localStorage.setItem('categories_updated', 'true');
        }
        
        setToast({message: editingCategory ? 'Category updated successfully! Delivery costs will be recalculated.' : 'Category created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
        setToast({message: errorData.error || 'Failed to save category', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving category:', error);
      setToast({message: 'Failed to save category', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingCategory(false);
    }
  };

  const deleteCategory = async (id: number) => {
    if (confirm('Delete this category?')) {
      try {
        // Check if category has products
        const categoryToDelete = categories.find(cat => (cat.id || cat._id) === id);
        const productsInCategory = products.filter(product => 
          product.category === categoryToDelete?.name
        );
        
        if (productsInCategory.length > 0) {
          setToast({message: `Cannot delete category: ${productsInCategory.length} products are using this category`, type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
        
        const response = await fetch('/api/categories', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id })
        });
        
        if (response.ok) {
          await loadCategories();
          setToast({message: 'Category deleted successfully!', type: 'success'});
        } else {
          const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
          setToast({message: errorData.error || 'Failed to delete category', type: 'error'});
        }
        setTimeout(() => setToast(null), 3000);
      } catch (error) {
        console.error('Error deleting category:', error);
        setToast({message: 'Failed to delete category', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const updateCustomerStatus = async (customerId: string, status: string) => {
    setUpdatingCustomer(customerId);
    try {
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, status })
      });
      if (response.ok) {
        setCustomers(customers.map(customer => 
          (customer._id === customerId || customer.id === customerId) ? { ...customer, status } : customer
        ));
        setToast({message: 'Customer status updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating customer status:', error);
      setToast({message: 'Failed to update customer status', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setUpdatingCustomer(null);
    }
  };

  const openCustomerModal = (customer?: any) => {
    if (customer) {
      setEditingCustomer(customer);
      setCustomerFormData({
        name: customer.name || '',
        email: customer.email || '',
        phone: customer.phone || '',
        country: customer.country || '',
        address: {
          line1: customer.address?.line1 || '',
          line2: customer.address?.line2 || '',
          line3: customer.address?.line3 || ''
        }
      });
    } else {
      setEditingCustomer(null);
      setCustomerFormData({
        name: '',
        email: '',
        phone: '',
        country: '',
        address: { line1: '', line2: '', line3: '' }
      });
    }
    setShowCustomerModal(true);
  };

  const saveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingCustomer(true);
    try {
      const customerId = editingCustomer._id || editingCustomer.id;
      const response = await fetch('/api/customers', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ customerId, ...customerFormData })
      });
      
      if (response.ok) {
        await loadCustomers();
        setShowCustomerModal(false);
        setToast({message: 'Customer updated successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setToast({message: errorData.error || 'Failed to update customer', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving customer:', error);
      setToast({message: 'Failed to save customer', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingCustomer(false);
    }
  };

  const printInvoice = (order: any) => {
    const printWindow = window.open('', '_blank');
    const subtotal = order.items?.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0) || 0;
    const discount = order.discount || 0;
    const deliveryFee = order.deliveryFee || 0;
    
    const invoiceHTML = `
      <!DOCTYPE html>
      <html>
      <head>
        <title>Invoice - ${order.orderNumber || order._id?.slice(-8)}</title>
        <style>
          * { margin: 0; padding: 0; box-sizing: border-box; }
          body { font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; color: #333; line-height: 1.6; }
          .invoice-container { max-width: 800px; margin: 0 auto; padding: 40px; background: white; }
          .header { text-align: center; margin-bottom: 40px; border-bottom: 3px solid #667eea; padding-bottom: 20px; }
          .company-name { font-size: 32px; font-weight: bold; color: #667eea; margin-bottom: 5px; }
          .invoice-title { font-size: 24px; color: #666; letter-spacing: 2px; }
          .invoice-info { display: flex; justify-content: space-between; margin-bottom: 30px; }
          .invoice-details, .customer-details { flex: 1; }
          .customer-details { margin-left: 40px; }
          .section-title { font-size: 18px; font-weight: bold; color: #667eea; margin-bottom: 10px; border-bottom: 1px solid #eee; padding-bottom: 5px; }
          .detail-item { margin-bottom: 8px; }
          .detail-label { font-weight: 600; color: #555; }
          .items-table { width: 100%; border-collapse: collapse; margin: 30px 0; box-shadow: 0 2px 10px rgba(0,0,0,0.1); }
          .items-table th { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 15px 10px; text-align: left; font-weight: 600; }
          .items-table td { padding: 12px 10px; border-bottom: 1px solid #eee; }
          .items-table tr:hover { background-color: #f8f9fa; }
          .summary-section { margin-top: 30px; }
          .summary-table { width: 300px; margin-left: auto; }
          .summary-row { display: flex; justify-content: space-between; padding: 8px 0; border-bottom: 1px solid #eee; }
          .summary-total { font-size: 20px; font-weight: bold; color: #667eea; border-top: 2px solid #667eea; padding-top: 10px; margin-top: 10px; }
          .payment-info { background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0; }
          .status-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-size: 12px; font-weight: bold; text-transform: uppercase; }
          .status-paid { background: #d4edda; color: #155724; }
          .status-pending { background: #fff3cd; color: #856404; }
          .status-failed { background: #f8d7da; color: #721c24; }
          .discount-row { color: #28a745; font-weight: 600; }
          .promotion-note { background: #e7f3ff; padding: 10px; border-left: 4px solid #007bff; margin: 10px 0; font-style: italic; }
          @media print { body { margin: 0; } .invoice-container { padding: 20px; } }
        </style>
      </head>
      <body>
        <div class="invoice-container">
          <div class="header">
            <div class="company-name">FASHION BREEZE</div>
            <div class="invoice-title">INVOICE</div>
          </div>
          
          <div class="invoice-info">
            <div class="invoice-details">
              <div class="section-title">Invoice Details</div>
              <div class="detail-item"><span class="detail-label">Invoice No:</span> FB${order.orderNumber || order._id?.slice(-8)}</div>
              <div class="detail-item"><span class="detail-label">Date:</span> ${new Date(order.createdAt).toLocaleDateString('en-US', {year: 'numeric', month: 'long', day: 'numeric'})}</div>
              <div class="detail-item"><span class="detail-label">Status:</span> <span class="status-badge status-${order.paymentStatus || 'pending'}">${order.status?.toUpperCase()}</span></div>
            </div>
            
            <div class="customer-details">
              <div class="section-title">Bill To</div>
              <div class="detail-item"><span class="detail-label">Name:</span> ${order.customerInfo?.name || 'N/A'}</div>
              <div class="detail-item"><span class="detail-label">Email:</span> ${order.customerInfo?.email || 'N/A'}</div>
              <div class="detail-item"><span class="detail-label">Phone:</span> ${order.customerInfo?.phone || 'N/A'}</div>
              <div class="detail-item"><span class="detail-label">Address:</span> ${order.customerInfo?.address || 'N/A'}</div>
            </div>
          </div>
          
          <div class="payment-info">
            <div class="section-title">Payment Information</div>
            <div class="detail-item"><span class="detail-label">Method:</span> ${(order.paymentMethod || 'cash_on_delivery').replace('_', ' ').toUpperCase()}</div>
            <div class="detail-item"><span class="detail-label">Status:</span> <span class="status-badge status-${order.paymentStatus || 'pending'}">${(order.paymentStatus || 'pending').toUpperCase()}</span></div>
          </div>
          
          ${order.promotion ? `<div class="promotion-note">🎉 Promotion Applied: ${order.promotion}</div>` : ''}
          
          <table class="items-table">
            <thead>
              <tr>
                <th>Code</th>
                <th>Product</th>
                <th>Size</th>
                <th>Color</th>
                <th>Qty</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              ${order.items?.map((item: any) => `
                <tr>
                  <td><strong>${item.code || 'N/A'}</strong></td>
                  <td>${item.name}</td>
                  <td>${item.size || 'N/A'}</td>
                  <td>${item.color || 'N/A'}</td>
                  <td>${item.quantity}</td>
                  <td>LKR ${item.price?.toFixed(2)}</td>
                  <td><strong>LKR ${(item.price * item.quantity).toFixed(2)}</strong></td>
                </tr>
              `).join('') || ''}
            </tbody>
          </table>
          
          <div class="summary-section">
            <div class="summary-table">
              <div class="summary-row">
                <span>Subtotal:</span>
                <span>LKR ${subtotal.toFixed(2)}</span>
              </div>
              ${discount > 0 ? `
                <div class="summary-row discount-row">
                  <span>Discount:</span>
                  <span>-LKR ${discount.toFixed(2)}</span>
                </div>
              ` : ''}
              <div class="summary-row">
                <span>Delivery:</span>
                <span>${deliveryFee > 0 ? `LKR ${deliveryFee.toFixed(2)}` : 'FREE'}</span>
              </div>
              <div class="summary-row summary-total">
                <span>GRAND TOTAL:</span>
                <span>LKR ${order.total?.toFixed(2)}</span>
              </div>
            </div>
          </div>
          
          <div class="bank-details" style="margin-top: 30px; padding: 20px; background: #f8f9fa; border-radius: 8px;">
            <div class="section-title">Bank Details for Payments</div>
            <div style="display: flex; justify-content: space-between;">
              <div>
                <div class="detail-item"><span class="detail-label">Bank:</span> Commercial Bank of Ceylon</div>
                <div class="detail-item"><span class="detail-label">Account Name:</span> Fashion Breeze (Pvt) Ltd</div>
                <div class="detail-item"><span class="detail-label">Account No:</span> 8001234567890</div>
              </div>
              <div>
                <div class="detail-item"><span class="detail-label">Branch:</span> Colombo Main Branch</div>
                <div class="detail-item"><span class="detail-label">Swift Code:</span> CCEYLKLX</div>
                <div class="detail-item"><span class="detail-label">Branch Code:</span> 001</div>
              </div>
            </div>
          </div>
          
          <div style="text-align: center; margin-top: 40px; color: #666; font-size: 14px;">
            <p>Thank you for shopping with Fashion Breeze!</p>
            <p>For support: +94 70 700 3722 | info@fashionbreeze.lk</p>
          </div>
        </div>
        <script>window.print();</script>
      </body>
      </html>
    `;
    printWindow?.document.write(invoiceHTML);
    printWindow?.document.close();
  };

  const openRestockModal = (product: Product) => {
    setRestockingProduct(product);
    const initialData: {[key: string]: number} = {};
    
    if (Array.isArray(product.sizes)) {
      product.sizes.forEach(size => {
        if (size.colors && size.colors.length > 0) {
          size.colors.forEach((color: any) => {
            initialData[`${size.size}-${color.name}`] = 0;
          });
        } else {
          initialData[size.size] = 0;
        }
      });
    }
    
    setRestockData(initialData);
    setShowRestockModal(true);
  };

  const handleRestock = async () => {
    if (!restockingProduct) return;
    
    try {
      const productId = restockingProduct._id || restockingProduct.id;
      const response = await fetch(`/api/products/${productId}/restock`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ restockData })
      });
      
      if (response.ok) {
        const totalNewStock = Object.values(restockData).reduce((sum: number, stock: number) => sum + stock, 0);
        

        
        await loadProducts();
        await loadStockAlerts();
        setShowRestockModal(false);
        setRestockingProduct(null);
        setRestockData({});
        setToast({message: 'Product restocked successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error restocking product:', error);
      setToast({message: 'Failed to restock product', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const deleteCustomer = async (customer: any) => {
    const customerId = customer._id || customer.id;
    if (confirm('Are you sure you want to delete this customer?')) {
      try {
        // Check if customer has orders
        const customerOrders = orders.filter(order => 
          order.customerInfo?.email === customer.email
        );
        
        if (customerOrders.length > 0) {
          setToast({message: `Cannot delete customer: Has ${customerOrders.length} orders`, type: 'error'});
          setTimeout(() => setToast(null), 3000);
          return;
        }
        
        const response = await fetch('/api/customers', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ customerId })
        });
        
        if (response.ok) {
          setCustomers(customers.filter(c => (c._id || c.id) !== customerId));
          setToast({message: 'Customer deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting customer:', error);
        setToast({message: 'Failed to delete customer', type: 'error'});
      } finally {
        setTimeout(() => setToast(null), 3000);
      }
    }
  };

  const updateSlipStatus = async (orderId: string, status: string) => {
    try {
      const response = await fetch('/api/orders/update-slip-status', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ orderId, status })
      });
      
      if (response.ok) {
        await loadOrders();
        setToast({message: `Payment slip ${status}!`, type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating slip status:', error);
      setToast({message: 'Failed to update slip status', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const loadSlides = async () => {
    setLoadingSlides(true);
    try {
      const response = await fetch('/api/slideshow');
      const slides = await response.json();
      setSlides(Array.isArray(slides) ? slides : []);
    } catch (error) {
      console.error('Error loading slides:', error);
      setSlides([]);
    } finally {
      setLoadingSlides(false);
    }
  };

  const openSlideModal = (slide?: any) => {
    if (slide) {
      setEditingSlide(slide);
      setSlideFormData({
        title: slide.title,
        subtitle: slide.subtitle,
        image: slide.image,
        saleType: slide.saleType,
        discount: slide.discount,
        validUntil: slide.validUntil ? new Date(slide.validUntil).toISOString().split('T')[0] : '',
        isActive: slide.isActive,
        order: slide.order
      });
    } else {
      setEditingSlide(null);
      setSlideFormData({
        title: '',
        subtitle: '',
        image: '',
        saleType: 'flash_sale',
        discount: 0,
        validUntil: '',
        isActive: true,
        order: slides.length + 1
      });
    }
    setShowSlideModal(true);
  };

  const saveSlide = async (e: React.FormEvent) => {
    e.preventDefault();
    setSavingSlide(true);
    try {
      const method = editingSlide ? 'PUT' : 'POST';
      const body = editingSlide ? { id: editingSlide._id || editingSlide.id, ...slideFormData } : slideFormData;
      
      const response = await fetch('/api/slideshow', {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body)
      });
      
      if (response.ok) {
        await loadSlides();
        setShowSlideModal(false);
        setToast({message: editingSlide ? 'Slide updated successfully!' : 'Slide created successfully!', type: 'success'});
        setTimeout(() => setToast(null), 3000);
      } else {
        const errorData = await response.json();
        setToast({message: errorData.error || 'Failed to save slide', type: 'error'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error saving slide:', error);
      setToast({message: 'Failed to save slide', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    } finally {
      setSavingSlide(false);
    }
  };

  const loadTailors = async () => {
    setLoadingTailors(true);
    try {
      const response = await fetch('/api/tailors');
      const tailors = await response.json();
      setTailors(Array.isArray(tailors) ? tailors : []);
    } catch (error) {
      console.error('Error loading tailors:', error);
      setTailors([]);
    } finally {
      setLoadingTailors(false);
    }
  };

  const updateTailorStatus = async (tailorId: string, status: string) => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('adminUser') || '{}');
      const response = await fetch('/api/tailors', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tailorId, status, approvedBy: currentUser.username })
      });
      
      if (response.ok) {
        loadTailors();
        setToast({message: `Tailor ${status} successfully!`, type: 'success'});
        setTimeout(() => setToast(null), 3000);
      }
    } catch (error) {
      console.error('Error updating tailor status:', error);
      setToast({message: 'Failed to update tailor status', type: 'error'});
      setTimeout(() => setToast(null), 3000);
    }
  };

  const deleteSlide = async (slide: any) => {
    if (confirm('Are you sure you want to delete this slide?')) {
      try {
        const response = await fetch(`/api/slideshow?id=${slide._id || slide.id}`, { method: 'DELETE' });
        if (response.ok) {
          await loadSlides();
          setToast({message: 'Slide deleted successfully!', type: 'success'});
        }
      } catch (error) {
        console.error('Error deleting slide:', error);
        setToast({message: 'Failed to delete slide', type: 'error'});
      } finally {
        setTimeout(() => setToast(null), 3000);
      }
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
              <i className="bi bi-speedometer2 me-2"></i>Analytics Dashboard
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

        <div className="row mb-4">
          <div className="col-12">
            <ul className="nav nav-tabs">
              {hasPrivilege('products') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => setActiveTab('products')}>
                    <i className="bi bi-box-seam me-2"></i>Products
                  </button>
                </li>
              )}
              {hasPrivilege('categories') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => setActiveTab('categories')}>
                    <i className="bi bi-tags me-2"></i>Categories
                  </button>
                </li>
              )}
              {hasPrivilege('customers') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => setActiveTab('customers')}>
                    <i className="bi bi-people me-2"></i>Customers
                  </button>
                </li>
              )}
              {hasPrivilege('orders') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => setActiveTab('orders')}>
                    <i className="bi bi-cart-check me-2"></i>Orders
                  </button>
                </li>
              )}
              {hasPrivilege('users') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
                    <i className="bi bi-people-fill me-2"></i>Users
                  </button>
                </li>
              )}
              {hasPrivilege('analytics') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => setActiveTab('reports')}>
                    <i className="bi bi-graph-up me-2"></i>Reports
                  </button>
                </li>
              )}
              {hasPrivilege('analytics') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'top-products' ? 'active' : ''}`} onClick={() => setActiveTab('top-products')}>
                    <i className="bi bi-trophy me-2"></i>Top Products
                  </button>
                </li>
              )}
              {hasPrivilege('analytics') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'calendar' ? 'active' : ''}`} onClick={() => {setActiveTab('calendar'); loadAnalytics();}}>
                    <i className="bi bi-calendar3 me-2"></i>Calendar Report
                  </button>
                </li>
              )}
              {hasPrivilege('orders') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'returns' ? 'active' : ''}`} onClick={() => setActiveTab('returns')}>
                    <i className="bi bi-arrow-return-left me-2"></i>Returns
                  </button>
                </li>
              )}
              {hasPrivilege('customers') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'addresses' ? 'active' : ''}`} onClick={() => setActiveTab('addresses')}>
                    <i className="bi bi-geo-alt me-2"></i>Addresses
                  </button>
                </li>
              )}
              {hasPrivilege('products') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'slideshow' ? 'active' : ''}`} onClick={() => setActiveTab('slideshow')}>
                    <i className="bi bi-images me-2"></i>Slideshow
                  </button>
                </li>
              )}
              <li className="nav-item">
                <a href="/tailoring" className="nav-link">
                  <i className="bi bi-scissors me-2"></i>Tailoring
                </a>
              </li>
              <li className="nav-item">
                <a href="/member" className="nav-link">
                  <i className="bi bi-person me-2"></i>Member
                </a>
              </li>
              {hasPrivilege('users') && (
                <li className="nav-item">
                  <button className={`nav-link ${activeTab === 'tailors' ? 'active' : ''}`} onClick={() => setActiveTab('tailors')}>
                    <i className="bi bi-people me-2"></i>Tailors
                  </button>
                </li>
              )}
            </ul>
          </div>
        </div>

        {stockAlerts.length > 0 && (
          <div className="alert alert-warning d-flex align-items-center mb-4" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <div>
              <strong>Stock Alert:</strong> {stockAlerts.length} product(s) need attention - 
              {stockAlerts.filter(p => p.isOutOfStock).length} out of stock, 
              {stockAlerts.filter(p => p.isLowStock && !p.isOutOfStock).length} low stock
            </div>
          </div>
        )}

        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-currency-dollar display-4 text-success mb-3"></i>
                {loadingSales ? (
                  <div className="spinner-border text-success" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="fw-bold">LKR {salesData?.today?.revenue?.toFixed(2) || '0.00'}</h3>
                    <p className="text-muted mb-1">Today's Revenue</p>
                    {salesData?.yesterday?.revenue && (
                      <small className={`badge ${salesData.today.revenue >= salesData.yesterday.revenue ? 'bg-success' : 'bg-danger'}`}>
                        {salesData.today.revenue >= salesData.yesterday.revenue ? '+' : ''}
                        {((salesData.today.revenue - salesData.yesterday.revenue) / (salesData.yesterday.revenue || 1) * 100).toFixed(1)}%
                      </small>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-cart-check display-4 text-primary mb-3"></i>
                {loadingSales ? (
                  <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="fw-bold">{salesData?.today?.orders || 0}</h3>
                    <p className="text-muted mb-1">Today's Orders</p>
                    {salesData?.yesterday?.orders && (
                      <small className={`badge ${salesData.today.orders >= salesData.yesterday.orders ? 'bg-success' : 'bg-danger'}`}>
                        {salesData.today.orders >= salesData.yesterday.orders ? '+' : ''}
                        {salesData.today.orders - salesData.yesterday.orders}
                      </small>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-box-seam display-4 text-warning mb-3"></i>
                {loadingSales ? (
                  <div className="spinner-border text-warning" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="fw-bold">{salesData?.today?.productsSold || 0}</h3>
                    <p className="text-muted mb-1">Products Sold Today</p>
                    {salesData?.yesterday?.productsSold && (
                      <small className={`badge ${salesData.today.productsSold >= salesData.yesterday.productsSold ? 'bg-success' : 'bg-danger'}`}>
                        {salesData.today.productsSold >= salesData.yesterday.productsSold ? '+' : ''}
                        {salesData.today.productsSold - salesData.yesterday.productsSold}
                      </small>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-graph-up display-4 text-info mb-3"></i>
                {loadingSales ? (
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                ) : (
                  <>
                    <h3 className="fw-bold">LKR {salesData?.week?.revenue?.toFixed(2) || '0.00'}</h3>
                    <p className="text-muted mb-1">This Week</p>
                    <small className="text-muted">{salesData?.week?.orders || 0} orders</small>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="row g-4 mb-5">
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-box-seam display-4 text-primary mb-3"></i>
                <h3 className="fw-bold">{products.length}</h3>
                <p className="text-muted mb-0">Total Products</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-people display-4 text-info mb-3"></i>
                <h3 className="fw-bold">{customers.length}</h3>
                <p className="text-muted mb-0">Customers</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-cart-check display-4 text-warning mb-3"></i>
                <h3 className="fw-bold">{orders.length}</h3>
                <p className="text-muted mb-0">Total Orders</p>
              </div>
            </div>
          </div>
          <div className="col-md-3">
            <div className="card border-0 shadow-sm">
              <div className="card-body text-center p-4">
                <i className="bi bi-people-fill display-4 text-danger mb-3"></i>
                <h3 className="fw-bold">{users.length}</h3>
                <p className="text-muted mb-0">Users</p>
              </div>
            </div>
          </div>
        </div>

        {activeTab === 'products' && hasPrivilege('products') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0">
                <i className="bi bi-list me-2"></i>Product Management
                {loadingProducts && <span className="spinner-border spinner-border-sm ms-2" role="status"></span>}
                {!loadingProducts && <span className="badge bg-light text-primary ms-2">{products.length}</span>}
              </h5>
              <div className="d-flex gap-2">
                <button className="btn btn-outline-light btn-sm" onClick={loadProducts} disabled={loadingProducts}>
                  <i className="bi bi-arrow-clockwise me-1"></i>Refresh
                </button>
                <button className="btn btn-light" onClick={() => openModal()}>
                  <i className="bi bi-plus-circle me-2"></i>Add Product
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-8">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search products by name, code, or category..."
                    value={productFilter}
                    onChange={(e) => setProductFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-4">
                  <select 
                    className="form-select" 
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                  >
                    <option value="">All Categories</option>
                    {categories.map(category => (
                      <option key={category.id || category._id} value={category.name}>
                        {category.name}
                      </option>
                    ))}
                  </select>
                </div>
                {(productFilter || categoryFilter) && (
                  <div className="col-12">
                    <small className="text-muted">
                      {products.filter(p => {
                        const matchesSearch = !productFilter || 
                          p.name.toLowerCase().includes(productFilter.toLowerCase()) ||
                          p.code.toLowerCase().includes(productFilter.toLowerCase()) ||
                          p.category.toLowerCase().includes(productFilter.toLowerCase());
                        const matchesCategory = !categoryFilter || p.category === categoryFilter;
                        return matchesSearch && matchesCategory;
                      }).length} results found
                    </small>
                  </div>
                )}
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Image</th>
                      <th>Name</th>
                      <th>Code</th>
                      <th>Brand</th>
                      <th>Category</th>
                      <th>Subcategory</th>
                      <th>Cost</th>
                      <th>Price</th>
                      <th>Profit</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingProducts ? (
                      <tr>
                        <td colSpan={11} className="text-center py-5">
                          <div className="d-flex flex-column align-items-center">
                            <div className="spinner-border text-primary mb-3" role="status">
                              <span className="visually-hidden">Loading...</span>
                            </div>
                            <p className="text-muted mb-0">Loading products...</p>
                            <small className="text-muted">This may take a few seconds</small>
                          </div>
                        </td>
                      </tr>
                    ) : products.length === 0 ? (
                      <tr>
                        <td colSpan={11} className="text-center py-5">
                          <div className="text-muted">
                            <i className="bi bi-box-seam display-4 mb-3"></i>
                            <p className="mb-0">No products found</p>
                            <small>Click "Add Product" to create your first product</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      products.filter(product => {
                        const matchesSearch = !productFilter || 
                          product.name.toLowerCase().includes(productFilter.toLowerCase()) ||
                          product.code.toLowerCase().includes(productFilter.toLowerCase()) ||
                          product.category.toLowerCase().includes(productFilter.toLowerCase());
                        const matchesCategory = !categoryFilter || product.category === categoryFilter;
                        return matchesSearch && matchesCategory;
                      }).map(product => (
                      <tr key={product._id || product.id || product.code}>
                        <td>
                          <ImageWithFallback src={product.image} alt={product.name} style={{width: '50px', height: '50px', objectFit: 'cover'}} className="rounded" />
                        </td>
                        <td className="fw-bold">{product.name}</td>
                        <td><span className="badge bg-secondary">{product.code}</span></td>
                        <td><span className="badge bg-primary">{(product as any).brand || 'N/A'}</span></td>
                        <td><span className="badge bg-info">{product.category}</span></td>
                        <td><span className="badge bg-secondary">{product.subcategory || '-'}</span></td>
                        <td className="text-danger">LKR {product.cost || 0}</td>
                        <td className="fw-bold text-success">LKR {product.price}</td>
                        <td className="fw-bold text-primary">LKR {((product.price || 0) - (product.cost || 0) - (product.vat || 0)).toFixed(2)}</td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <span className={`badge ${(product.status === 'instock' || product.status === 'active') ? 'bg-success' : 'bg-danger'}`}>
                              {(product.status === 'instock' || product.status === 'active') ? 'In Stock' : 'Out of Stock'}
                            </span>
                            {stockAlerts.find(alert => alert._id === product._id) && (
                              <span className="badge bg-warning text-dark">
                                <i className="bi bi-exclamation-triangle me-1"></i>Low Stock
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-success" onClick={() => openRestockModal(product)} title="Restock">
                              <i className="bi bi-plus-square"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openModal(product)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteProduct(product)} disabled={deletingProduct === (product._id || product.id || product.code)}>
                              {deletingProduct === (product._id || product.id || product.code) ? (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Deleting...</span>
                                </div>
                              ) : (
                                <i className="bi bi-trash"></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'categories' && hasPrivilege('categories') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-tags me-2"></i>Category & Subcategory Management</h5>
              <div>
                <button className="btn btn-light me-2" onClick={() => setShowSubcategoryModal(true)}>
                  <i className="bi bi-plus-circle me-2"></i>Add Subcategory
                </button>
                <button className="btn btn-light" onClick={() => openCategoryModal()}>
                  <i className="bi bi-plus-circle me-2"></i>Add Category
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search categories by name..."
                  value={categoryFilter}
                  onChange={(e) => setCategoryFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Subcategories</th>
                      <th>Products</th>
                      <th>Delivery Cost</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCategories ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      categories.filter(category => 
                        category.name.toLowerCase().includes(categoryFilter.toLowerCase())
                      ).map(category => (
                      <tr key={category.id || category._id}>
                        <td>{category.id || category._id}</td>
                        <td className="fw-bold">{category.name}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {category.subcategories?.slice(0, 3).map((sub: any) => (
                              <span key={sub.slug} className="badge bg-secondary" style={{fontSize: '0.7rem'}}>
                                {sub.name}
                                <button 
                                  className="btn btn-sm ms-1 p-0" 
                                  style={{fontSize: '0.6rem', color: 'white'}} 
                                  onClick={() => openSubcategoryModal(sub, category)}
                                >
                                  <i className="bi bi-pencil"></i>
                                </button>
                                <button 
                                  className="btn btn-sm ms-1 p-0" 
                                  style={{fontSize: '0.6rem', color: 'white'}} 
                                  onClick={() => deleteSubcategory(category._id, sub.slug)}
                                >
                                  <i className="bi bi-x"></i>
                                </button>
                              </span>
                            ))}
                            {category.subcategories?.length > 3 && (
                              <span className="badge bg-light text-dark">+{category.subcategories.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td><span className="badge bg-info">{category.productCount || 0}</span></td>
                        <td className="fw-bold text-success">LKR {(category.deliveryCost || 0).toFixed(2)}</td>
                        <td>
                          <button className="btn btn-sm btn-outline-primary me-2" onClick={() => openCategoryModal(category)}>
                            <i className="bi bi-pencil"></i>
                          </button>
                          <button className="btn btn-sm btn-outline-danger" onClick={() => deleteCategory(category.id || category._id)}>
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
        )}

        {activeTab === 'customers' && hasPrivilege('customers') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-people me-2"></i>Customer Management</h5>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search customers by name, email, or country..."
                  value={customerFilter}
                  onChange={(e) => setCustomerFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Email</th>
                      <th>Phone</th>
                      <th>Country</th>
                      <th>Address</th>
                      <th>Registered</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingCustomers ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      customers.filter(customer => 
                        !customerFilter || (
                          (customer.name || '').toLowerCase().includes(customerFilter.toLowerCase()) ||
                          (customer.email || '').toLowerCase().includes(customerFilter.toLowerCase()) ||
                          (customer.country || '').toLowerCase().includes(customerFilter.toLowerCase()) ||
                          (customer.address?.line1 || '').toLowerCase().includes(customerFilter.toLowerCase())
                        )
                      ).map((customer, index) => (
                      <tr key={customer._id || index}>
                        <td><span className="badge bg-secondary">{customer._id?.slice(-8) || customer.id}</span></td>
                        <td className="fw-bold">{customer.name || 'N/A'}</td>
                        <td>{customer.email || 'N/A'}</td>
                        <td>{customer.phone || 'N/A'}</td>
                        <td>{customer.country || 'N/A'}</td>
                        <td>
                          {customer.address ? (
                            <div className="small">
                              {customer.address.line1}<br/>
                              {customer.address.line2 && <>{customer.address.line2}<br/></>}
                              {customer.address.line3}
                            </div>
                          ) : 'N/A'}
                        </td>
                        <td>{new Date(customer.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1 align-items-center">
                            <select 
                              className="form-select form-select-sm" 
                              value={customer.status || 'active'}
                              onChange={(e) => updateCustomerStatus(customer._id || customer.id, e.target.value)}
                              disabled={updatingCustomer === (customer._id || customer.id)}
                            >
                              <option value="active">Active</option>
                              <option value="inactive">Inactive</option>
                            </select>
                            {updatingCustomer === (customer._id || customer.id) && (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Updating...</span>
                              </div>
                            )}
                            <button 
                              className="btn btn-outline-primary btn-sm me-1" 
                              onClick={() => openCustomerModal(customer)}
                            >
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button 
                              className="btn btn-outline-danger btn-sm" 
                              onClick={() => deleteCustomer(customer)}
                            >
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'orders' && hasPrivilege('orders') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-cart-check me-2"></i>Order Management</h5>
              <button className="btn btn-light btn-sm" onClick={loadOrders} title="Refresh Orders">
                <i className="bi bi-arrow-clockwise me-1"></i>Refresh
              </button>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-3">
                <div className="col-md-6">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Search orders by customer name or order ID..."
                    value={orderFilter}
                    onChange={(e) => setOrderFilter(e.target.value)}
                  />
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select" 
                    value={orderStatusFilter || ''}
                    onChange={(e) => setOrderStatusFilter(e.target.value || null)}
                  >
                    <option value="">All Status</option>
                    <option value="pending">Pending</option>
                    <option value="confirmed">Confirmed</option>
                    <option value="shipped">Shipped</option>
                    <option value="delivered">Delivered</option>
                    <option value="customer_verified">Customer Verified</option>
                    <option value="cancelled">Cancelled</option>
                  </select>
                </div>
                <div className="col-md-3">
                  <select 
                    className="form-select" 
                    value={paymentStatusFilter || ''}
                    onChange={(e) => setPaymentStatusFilter(e.target.value || null)}
                  >
                    <option value="">All Payment</option>
                    <option value="pending">Pending</option>
                    <option value="paid">Paid</option>
                    <option value="failed">Failed</option>
                  </select>
                </div>
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Items</th>
                      <th>Total</th>
                      <th>Payment</th>
                      <th>Payment Slip</th>
                      <th>Status</th>
                      <th>Active</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingOrders ? (
                      <tr>
                        <td colSpan={10} className="text-center py-4">
                          <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      orders.filter(order => {
                        const matchesSearch = !orderFilter || 
                          (order.customerInfo?.name || '').toLowerCase().includes(orderFilter.toLowerCase()) ||
                          (order._id || '').toLowerCase().includes(orderFilter.toLowerCase());
                        const matchesStatus = !orderStatusFilter || order.status === orderStatusFilter;
                        const matchesPayment = !paymentStatusFilter || order.paymentStatus === paymentStatusFilter;
                        return matchesSearch && matchesStatus && matchesPayment;
                      }).map((order, index) => (
                      <tr key={order._id || index} className={order.status === 'cancelled' ? 'table-secondary text-muted' : ''} style={order.status === 'cancelled' ? {opacity: 0.6} : {}}>
                        <td><span className="badge bg-secondary">{order.orderNumber || order._id?.slice(-8) || `FB${index + 1}`}</span></td>
                        <td>{order.customerInfo?.name || 'N/A'}</td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {order.items?.slice(0, 3).map((item: any, i: number) => (
                              <span key={i} className="badge bg-info" title={`${item.name} (${item.code})`}>
                                {item.code || 'N/A'}
                              </span>
                            ))}
                            {order.items?.length > 3 && (
                              <span className="badge bg-secondary">+{order.items.length - 3}</span>
                            )}
                          </div>
                        </td>
                        <td className="fw-bold text-success">LKR {order.total?.toFixed(2) || '0.00'}</td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <select 
                              className="form-select form-select-sm" 
                              value={order.paymentMethod || 'cash_on_delivery'}
                              onChange={(e) => updatePaymentInfo(order._id, 'paymentMethod', e.target.value)}
                              disabled={updatingPayment === order._id}
                            >
                              <option value="cash_on_delivery">Cash on Delivery</option>
                              <option value="bank_transfer">Bank Transfer</option>
                              <option value="card_payment">Card Payment</option>
                              <option value="mobile_payment">Mobile Payment</option>
                            </select>
                            <select 
                              className="form-select form-select-sm" 
                              value={order.paymentStatus || 'pending'}
                              onChange={(e) => updatePaymentInfo(order._id, 'paymentStatus', e.target.value)}
                              disabled={updatingPayment === order._id}
                            >
                              <option value="pending">Pending</option>
                              <option value="paid">Paid</option>
                              <option value="failed">Failed</option>
                            </select>
                            {updatingPayment === order._id && (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Updating...</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td className="text-center">
                          {order.paymentSlip ? (
                            <div className="d-flex flex-column align-items-center gap-1">
                              <button 
                                className={`btn btn-sm ${
                                  order.paymentSlip.status === 'verified' ? 'btn-success' :
                                  order.paymentSlip.status === 'rejected' ? 'btn-danger' : 'btn-warning'
                                }`}
                                onClick={() => {setSelectedSlip(order); setShowSlipModal(true);}}
                                title={`Payment Slip - ${order.paymentSlip.status?.toUpperCase() || 'PENDING'}`}
                              >
                                <i className="bi bi-file-earmark-image"></i>
                              </button>
                              <small className={`badge ${
                                order.paymentSlip.status === 'verified' ? 'bg-success' :
                                order.paymentSlip.status === 'rejected' ? 'bg-danger' : 'bg-warning text-dark'
                              }`}>
                                {order.paymentSlip.status?.toUpperCase() || 'PENDING'}
                              </small>
                            </div>
                          ) : (
                            <div className="text-muted text-center">
                              <i className="bi bi-file-earmark-x fs-4" title="No payment slip uploaded"></i>
                              <br />
                              <small>No Slip</small>
                            </div>
                          )}
                        </td>
                        <td>
                          <div className="d-flex flex-column gap-1">
                            <div className="d-flex align-items-center gap-2">
                              <select 
                                className="form-select form-select-sm" 
                                value={order.status || 'pending'}
                                onChange={(e) => updateOrderStatus(order._id, e.target.value)}
                                disabled={updatingOrder === order._id || order.status === 'customer_verified'}
                              >
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="shipped">Shipped</option>
                                <option value="delivered">Delivered</option>
                                <option value="customer_verified">Customer Verified</option>
                                <option value="cancelled">Cancelled</option>
                              </select>
                              {updatingOrder === order._id && (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Updating...</span>
                                </div>
                              )}
                            </div>
                            {order.status === 'customer_verified' && (
                              <span className="badge bg-success" style={{fontSize: '0.7rem'}}>
                                <i className="bi bi-check-circle me-1"></i>Delivered Success
                              </span>
                            )}
                          </div>
                        </td>
                        <td>
                          <div className="d-flex align-items-center gap-2">
                            <div className="form-check form-switch">
                              <input 
                                className="form-check-input" 
                                type="checkbox" 
                                checked={order.isActive !== false}
                                onChange={(e) => toggleOrderActive(order._id, e.target.checked)}
                                disabled={updatingOrder === order._id}
                              />
                              <label className="form-check-label small">
                                {order.isActive !== false ? 'Active' : 'Inactive'}
                              </label>
                            </div>
                            {updatingOrder === order._id && (
                              <div className="spinner-border spinner-border-sm" role="status">
                                <span className="visually-hidden">Updating...</span>
                              </div>
                            )}
                          </div>
                        </td>
                        <td>{new Date(order.createdAt || Date.now()).toLocaleDateString()}</td>
                        <td>
                          <div className="d-flex gap-1">
                            <button className="btn btn-sm btn-outline-info" onClick={() => {setSelectedOrder(order); setShowOrderModal(true);}}>
                              <i className="bi bi-eye"></i> View
                            </button>
                            <button className="btn btn-sm btn-outline-primary" onClick={() => printInvoice(order)} title="Print Invoice">
                              <i className="bi bi-printer"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-secondary" onClick={() => viewOrderHistory(order._id)} title="View History">
                              <i className="bi bi-clock-history"></i>
                            </button>
                            <button 
                              className="btn btn-sm btn-outline-danger" 
                              onClick={() => cancelOrder(order)} 
                              disabled={order.status === 'cancelled'}
                              title={order.status === 'cancelled' ? 'Order already cancelled' : 'Cancel Order'}
                            >
                              <i className="bi bi-x-circle"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'reports' && hasPrivilege('analytics') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-dark text-white">
              <h5 className="mb-0"><i className="bi bi-graph-up me-2"></i>User Activity Reports</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>User</th>
                      <th>Role</th>
                      <th>Products Created</th>
                      <th>Products Updated</th>
                      <th>Categories Created</th>
                      <th>Categories Updated</th>
                      <th>Total Activities</th>
                      <th>Recent Activities</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingReports ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-dark" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      userReports.map(report => (
                        <tr key={report.user.id}>
                          <td>
                            <div>
                              <strong>{report.user.username}</strong>
                              <br />
                              <small className="text-muted">ID: {report.user.id}</small>
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              report.user.role === 'admin' ? 'bg-danger' :
                              report.user.role === 'manager' ? 'bg-warning' : 'bg-info'
                            }`}>
                              {report.user.role}
                            </span>
                          </td>
                          <td><span className="badge bg-success">{report.stats.productsCreated}</span></td>
                          <td><span className="badge bg-primary">{report.stats.productsUpdated}</span></td>
                          <td><span className="badge bg-success">{report.stats.categoriesCreated}</span></td>
                          <td><span className="badge bg-primary">{report.stats.categoriesUpdated}</span></td>
                          <td><span className="badge bg-dark">{report.stats.totalActivities}</span></td>
                          <td>
                            <div className="d-flex flex-wrap gap-1">
                              {report.recentActivities.slice(0, 3).map((activity: any, i: number) => (
                                <span 
                                  key={i} 
                                  className={`badge ${activity.type === 'product' ? 'bg-info' : 'bg-warning'}`}
                                  title={`${activity.action} ${activity.name} on ${new Date(activity.date).toLocaleDateString()}`}
                                >
                                  {activity.action === 'created' ? '+' : '✎'} {activity.type}
                                </span>
                              ))}
                              {report.recentActivities.length > 3 && (
                                <span className="badge bg-secondary">+{report.recentActivities.length - 3}</span>
                              )}
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'returns' && hasPrivilege('orders') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-warning text-dark">
              <h5 className="mb-0"><i className="bi bi-arrow-return-left me-2"></i>Returns & Damage Claims</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Return ID</th>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Type</th>
                      <th>Reason</th>
                      <th>Status</th>
                      <th>Date</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingReturns ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-warning" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      returns.map(returnItem => (
                        <tr key={returnItem.returnId}>
                          <td><span className="badge bg-secondary">{returnItem.returnId}</span></td>
                          <td><span className="badge bg-info">{returnItem.orderId}</span></td>
                          <td>{returnItem.customerInfo?.name || 'N/A'}</td>
                          <td>
                            <span className={`badge ${returnItem.type === 'damage' ? 'bg-danger' : 'bg-warning'}`}>
                              {returnItem.type === 'damage' ? 'Damage Claim' : 'Return Request'}
                            </span>
                          </td>
                          <td>
                            <small title={returnItem.description}>
                              {returnItem.reason}
                            </small>
                          </td>
                          <td>
                            <div className="d-flex align-items-center gap-2">
                              <select 
                                className="form-select form-select-sm" 
                                value={returnItem.status}
                                onChange={(e) => updateReturnStatus(returnItem.returnId, e.target.value)}
                                disabled={updatingReturn === returnItem.returnId}
                              >
                                <option value="pending">Pending</option>
                                <option value="approved">Approved</option>
                                <option value="rejected">Rejected</option>
                                <option value="processed">Processed</option>
                                <option value="refunded">Refunded</option>
                              </select>
                              {updatingReturn === returnItem.returnId && (
                                <div className="spinner-border spinner-border-sm" role="status">
                                  <span className="visually-hidden">Updating...</span>
                                </div>
                              )}
                            </div>
                          </td>
                          <td>{new Date(returnItem.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button 
                              className="btn btn-sm btn-outline-info"
                              onClick={() => viewReturnDetails(returnItem)}
                              title="View Details"
                            >
                              <i className="bi bi-eye"></i>
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
        )}

        {activeTab === 'addresses' && hasPrivilege('customers') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-geo-alt me-2"></i>Address Management</h5>
              <div>
                <button className="btn btn-light me-2" onClick={seedAddresses}>
                  <i className="bi bi-database me-2"></i>Seed Data
                </button>
                <button className="btn btn-light" onClick={() => openAddressModal()}>
                  <i className="bi bi-plus-circle me-2"></i>Add Address
                </button>
              </div>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Name</th>
                      <th>Type</th>
                      <th>Parent</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingAddresses ? (
                      <tr>
                        <td colSpan={7} className="text-center py-4">
                          <div className="spinner-border text-info" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      addresses.map(address => (
                        <tr key={address.id}>
                          <td><span className="badge bg-secondary">{address.id}</span></td>
                          <td className="fw-bold">{address.name}</td>
                          <td>
                            <span className={`badge ${
                              address.type === 'country' ? 'bg-primary' :
                              address.type === 'region' ? 'bg-info' :
                              address.type === 'district' ? 'bg-warning' : 'bg-success'
                            }`}>
                              {address.type}
                            </span>
                          </td>
                          <td>
                            {address.parentId ? (
                              <span className="badge bg-light text-dark">
                                {addresses.find(a => a.id === address.parentId)?.name || address.parentId}
                              </span>
                            ) : (
                              <span className="text-muted">Root</span>
                            )}
                          </td>
                          <td>
                            <span className={`badge ${address.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {address.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openAddressModal(address)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteAddress(address)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'top-products' && hasPrivilege('analytics') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-success text-white">
              <h5 className="mb-0"><i className="bi bi-trophy me-2"></i>Most Ordered Products</h5>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Rank</th>
                      <th>Product</th>
                      <th>Code</th>
                      <th>Total Orders</th>
                      <th>Total Quantity</th>
                      <th>Total Revenue</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingTopProducts ? (
                      <tr>
                        <td colSpan={6} className="text-center py-4">
                          <div className="spinner-border text-success" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      topProducts.map((product, index) => (
                        <tr key={product.code || index}>
                          <td>
                            <span className={`badge ${
                              index === 0 ? 'bg-warning' :
                              index === 1 ? 'bg-secondary' :
                              index === 2 ? 'bg-dark' : 'bg-light text-dark'
                            }`}>
                              #{index + 1}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex align-items-center">
                              {product.image && (
                                <img src={product.image} alt={product.name} className="me-2 rounded" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                              )}
                              <strong>{product.name}</strong>
                            </div>
                          </td>
                          <td><span className="badge bg-info">{product.code}</span></td>
                          <td><span className="badge bg-primary">{product.totalOrders}</span></td>
                          <td><span className="badge bg-success">{product.totalQuantity}</span></td>
                          <td className="fw-bold text-success">LKR {product.totalRevenue.toFixed(2)}</td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'calendar' && hasPrivilege('analytics') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-info text-white">
              <h5 className="mb-0"><i className="bi bi-calendar3 me-2"></i>Product Orders Calendar Report</h5>
            </div>
            <div className="card-body">
              <div className="row g-3 mb-4">
                <div className="col-md-3">
                  <select className="form-select" value={selectedYear} onChange={(e) => setSelectedYear(parseInt(e.target.value))}>
                    {[2024, 2023, 2022].map(year => (
                      <option key={year} value={year}>{year}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={selectedMonth || ''} onChange={(e) => setSelectedMonth(e.target.value ? parseInt(e.target.value) : null)}>
                    <option value="">All Year</option>
                    {Array.from({length: 12}, (_, i) => (
                      <option key={i+1} value={i+1}>{new Date(0, i).toLocaleString('default', {month: 'long'})}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <select className="form-select" value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
                    <option value="">All Categories</option>
                    {categories.map(cat => (
                      <option key={cat.id || cat._id} value={cat.name}>{cat.name}</option>
                    ))}
                  </select>
                </div>
                <div className="col-md-3">
                  <div className="d-flex gap-2">
                    <button className="btn btn-info" onClick={loadAnalytics} disabled={loadingAnalytics}>
                      {loadingAnalytics ? <i className="bi bi-hourglass-split"></i> : <i className="bi bi-search"></i>} Filter
                    </button>
                    {analyticsData && (
                      <button className="btn btn-success" onClick={downloadPDF} disabled={loadingAnalytics}>
                        <i className="bi bi-download"></i> PDF
                      </button>
                    )}
                  </div>
                </div>
              </div>
              
              {loadingAnalytics ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-info" role="status">
                    <span className="visually-hidden">Loading...</span>
                  </div>
                </div>
              ) : analyticsData ? (
                <>
                  <div className="row g-4 mb-4">
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                          <i className="bi bi-cart-check display-4 text-primary mb-2"></i>
                          <h4 className="fw-bold">{Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.orders, 0)}</h4>
                          <p className="text-muted mb-0">Total Orders</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                          <i className="bi bi-currency-dollar display-4 text-success mb-2"></i>
                          <h4 className="fw-bold">LKR {Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.revenue, 0).toFixed(2)}</h4>
                          <p className="text-muted mb-0">Total Revenue</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                          <i className="bi bi-box-seam display-4 text-warning mb-2"></i>
                          <h4 className="fw-bold">{Object.values(analyticsData.dailyData).reduce((sum: number, day: any) => sum + day.quantity, 0)}</h4>
                          <p className="text-muted mb-0">Total Quantity</p>
                        </div>
                      </div>
                    </div>
                    <div className="col-md-3">
                      <div className="card border-0 shadow-sm">
                        <div className="card-body text-center">
                          <i className="bi bi-calendar-check display-4 text-info mb-2"></i>
                          <h4 className="fw-bold">{Object.values(analyticsData.dailyData).filter((day: any) => day.orders > 0).length}</h4>
                          <p className="text-muted mb-0">Active Days</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="row g-2">
                    {Object.entries(analyticsData.dailyData || {}).map(([date, data]: [string, any]) => (
                      <div key={date} className="col-md-2 col-sm-3 col-4">
                        <div className={`card border ${data.orders > 0 ? 'border-success bg-light' : 'border-light'}`}>
                          <div className="card-body p-2 text-center">
                            <div className="fw-bold">{new Date(date).getDate()}</div>
                            <small className="text-muted">{new Date(date).toLocaleDateString('en', {weekday: 'short'})}</small>
                            {data.orders > 0 && (
                              <>
                                <div className="badge bg-primary">{data.orders}</div>
                                <div className="small text-success">LKR {data.revenue.toFixed(0)}</div>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              ) : (
                <div className="text-center py-5 text-muted">
                  <i className="bi bi-calendar3 display-4 mb-3"></i>
                  <p>Select filters and click "Filter" to view calendar report</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'users' && hasPrivilege('users') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-danger text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-people-fill me-2"></i>User Management</h5>
              <button className="btn btn-light" onClick={() => openUserModal()}>
                <i className="bi bi-plus-circle me-2"></i>Add User
              </button>
            </div>
            <div className="card-body">
              <div className="mb-3">
                <input 
                  type="text" 
                  className="form-control" 
                  placeholder="Search users by username, email, or role..."
                  value={userFilter}
                  onChange={(e) => setUserFilter(e.target.value)}
                />
              </div>
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Username</th>
                      <th>Email</th>
                      <th>Role</th>
                      <th>Privileges</th>
                      <th>Status</th>
                      <th>Last Login</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingUsers ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-danger" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      users.filter(user => 
                        (user.username || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                        (user.email || '').toLowerCase().includes(userFilter.toLowerCase()) ||
                        (user.role || '').toLowerCase().includes(userFilter.toLowerCase())
                      ).map(user => (
                      <tr key={user.id}>
                        <td><span className="badge bg-secondary">{user.id}</span></td>
                        <td className="fw-bold">{user.username}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className={`badge ${
                            user.role === 'admin' ? 'bg-danger' :
                            user.role === 'manager' ? 'bg-warning' : 'bg-info'
                          }`}>
                            {user.role}
                          </span>
                        </td>
                        <td>
                          <div className="d-flex flex-wrap gap-1">
                            {Object.entries(user.privileges || {}).filter(([_, value]) => value).map(([key]) => (
                              <span key={key} className="badge bg-success" style={{fontSize: '0.7rem'}}>
                                {key}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td>
                          <span className={`badge ${user.status === 'active' ? 'bg-success' : 'bg-secondary'}`}>
                            {user.status}
                          </span>
                        </td>
                        <td>{user.lastLogin ? new Date(user.lastLogin).toLocaleDateString() : 'Never'}</td>
                        <td>
                          <div className="d-flex gap-2">
                            <button className="btn btn-sm btn-outline-primary" onClick={() => openUserModal(user)}>
                              <i className="bi bi-pencil"></i>
                            </button>
                            <button className="btn btn-sm btn-outline-danger" onClick={() => deleteUser(user)}>
                              <i className="bi bi-trash"></i>
                            </button>
                          </div>
                        </td>
                      </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'slideshow' && hasPrivilege('products') && (
          <div className="card border-0 shadow-sm">
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <h5 className="mb-0"><i className="bi bi-images me-2"></i>Slideshow Management</h5>
              <button className="btn btn-light" onClick={() => openSlideModal()}>
                <i className="bi bi-plus-circle me-2"></i>Add Slide
              </button>
            </div>
            <div className="card-body">
              <div className="table-responsive">
                <table className="table table-hover">
                  <thead>
                    <tr>
                      <th>Preview</th>
                      <th>Title</th>
                      <th>Sale Type</th>
                      <th>Discount</th>
                      <th>Valid Until</th>
                      <th>Order</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {loadingSlides ? (
                      <tr>
                        <td colSpan={8} className="text-center py-4">
                          <div className="spinner-border text-primary" role="status">
                            <span className="visually-hidden">Loading...</span>
                          </div>
                        </td>
                      </tr>
                    ) : slides.length === 0 ? (
                      <tr>
                        <td colSpan={8} className="text-center py-5">
                          <div className="text-muted">
                            <i className="bi bi-images display-4 mb-3"></i>
                            <p className="mb-0">No slides found</p>
                            <small>Click "Add Slide" to create your first promotional slide</small>
                          </div>
                        </td>
                      </tr>
                    ) : (
                      slides.map(slide => (
                        <tr key={slide._id || slide.id}>
                          <td>
                            <img src={slide.image} alt={slide.title} style={{width: '80px', height: '50px', objectFit: 'cover'}} className="rounded" />
                          </td>
                          <td>
                            <div>
                              <strong>{slide.title}</strong>
                              {slide.subtitle && <><br/><small className="text-muted">{slide.subtitle}</small></>}
                            </div>
                          </td>
                          <td>
                            <span className={`badge ${
                              slide.saleType === 'flash_sale' ? 'bg-danger' :
                              slide.saleType === 'seasonal' ? 'bg-warning' :
                              slide.saleType === 'clearance' ? 'bg-info' : 'bg-success'
                            }`}>
                              {slide.saleType.replace('_', ' ').toUpperCase()}
                            </span>
                          </td>
                          <td>
                            {slide.discount > 0 ? (
                              <span className="badge bg-success">{slide.discount}% OFF</span>
                            ) : (
                              <span className="text-muted">No discount</span>
                            )}
                          </td>
                          <td>
                            {slide.validUntil ? (
                              <small>{new Date(slide.validUntil).toLocaleDateString()}</small>
                            ) : (
                              <span className="text-muted">No expiry</span>
                            )}
                          </td>
                          <td><span className="badge bg-secondary">{slide.order}</span></td>
                          <td>
                            <span className={`badge ${slide.isActive ? 'bg-success' : 'bg-secondary'}`}>
                              {slide.isActive ? 'Active' : 'Inactive'}
                            </span>
                          </td>
                          <td>
                            <div className="d-flex gap-2">
                              <button className="btn btn-sm btn-outline-primary" onClick={() => openSlideModal(slide)}>
                                <i className="bi bi-pencil"></i>
                              </button>
                              <button className="btn btn-sm btn-outline-danger" onClick={() => deleteSlide(slide)}>
                                <i className="bi bi-trash"></i>
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {showSubcategoryModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className={`bi ${editingSubcategory ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingSubcategory ? 'Edit Subcategory' : 'Add New Subcategory'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowSubcategoryModal(false)}></button>
                </div>
                <form onSubmit={saveSubcategory}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label fw-bold">Subcategory Name *</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={subcategoryFormData.name}
                        onChange={(e) => setSubcategoryFormData({...subcategoryFormData, name: e.target.value})}
                        required 
                        placeholder="e.g., T-Shirts"
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Category *</label>
                      <select 
                        className="form-select" 
                        value={subcategoryFormData.categoryId}
                        onChange={(e) => setSubcategoryFormData({...subcategoryFormData, categoryId: e.target.value})}
                        required
                        disabled={!!editingSubcategory}
                      >
                        <option value="">Select Category</option>
                        {categories.map(cat => (
                          <option key={cat._id} value={cat._id}>{cat.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="mb-3">
                      <label className="form-label fw-bold">Description</label>
                      <textarea 
                        className="form-control" 
                        rows={3}
                        value={subcategoryFormData.description}
                        onChange={(e) => setSubcategoryFormData({...subcategoryFormData, description: e.target.value})}
                        placeholder="Optional description for this subcategory"
                      />
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSubcategoryModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success" disabled={savingSubcategory}>
                      {savingSubcategory ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className={`bi ${editingSubcategory ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingSubcategory ? 'Update Subcategory' : 'Create Subcategory'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showSlideModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className={`bi ${editingSlide ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingSlide ? 'Edit Slide' : 'Add New Slide'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowSlideModal(false)}></button>
                </div>
                <form onSubmit={saveSlide}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Title *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={slideFormData.title}
                          onChange={(e) => setSlideFormData({...slideFormData, title: e.target.value})}
                          required 
                          placeholder="e.g., Summer Sale"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Subtitle</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={slideFormData.subtitle}
                          onChange={(e) => setSlideFormData({...slideFormData, subtitle: e.target.value})}
                          placeholder="e.g., Up to 70% OFF"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Sale Type *</label>
                        <select 
                          className="form-select" 
                          value={slideFormData.saleType}
                          onChange={(e) => setSlideFormData({...slideFormData, saleType: e.target.value})}
                          required
                        >
                          <option value="flash_sale">Flash Sale</option>
                          <option value="seasonal">Seasonal Sale</option>
                          <option value="clearance">Clearance</option>
                          <option value="new_arrival">New Arrival</option>
                          <option value="featured">Featured</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Discount (%)</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={slideFormData.discount}
                          onChange={(e) => setSlideFormData({...slideFormData, discount: +e.target.value})}
                          min="0"
                          max="100"
                          placeholder="0"
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Valid Until</label>
                        <input 
                          type="date" 
                          className="form-control" 
                          value={slideFormData.validUntil}
                          onChange={(e) => setSlideFormData({...slideFormData, validUntil: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Display Order</label>
                        <input 
                          type="number" 
                          className="form-control" 
                          value={slideFormData.order}
                          onChange={(e) => setSlideFormData({...slideFormData, order: +e.target.value})}
                          min="1"
                          required
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Slide Image *</label>
                        <input 
                          type="file" 
                          className="form-control" 
                          accept="image/*" 
                          required={!slideFormData.image}
                          onChange={async (e) => {
                            const file = e.target.files?.[0];
                            if (file) {
                              try {
                                const uploadData = new FormData();
                                uploadData.append('file', file);
                                const response = await fetch('/api/upload', { method: 'POST', body: uploadData });
                                if (!response.ok) {
                                  throw new Error(`Upload failed: ${response.status}`);
                                }
                                const result = await response.json();
                                if (result.url) {
                                  setSlideFormData(prev => ({...prev, image: result.url}));
                                } else if (result.error) {
                                  setToast({message: result.error, type: 'error'});
                                  setTimeout(() => setToast(null), 3000);
                                }
                              } catch (error) {
                                console.error('Upload error:', error);
                                setToast({message: 'Failed to upload image', type: 'error'});
                                setTimeout(() => setToast(null), 3000);
                              }
                            }
                          }}
                        />
                        {slideFormData.image && (
                          <div className="mt-2">
                            <img src={slideFormData.image} alt="Preview" className="img-fluid rounded" style={{maxHeight: '200px'}} />
                            <small className="text-success d-block">✓ Image uploaded successfully</small>
                          </div>
                        )}
                      </div>
                      <div className="col-12">
                        <div className="form-check">
                          <input 
                            className="form-check-input" 
                            type="checkbox" 
                            checked={slideFormData.isActive}
                            onChange={(e) => setSlideFormData({...slideFormData, isActive: e.target.checked})}
                          />
                          <label className="form-check-label fw-bold">
                            Active (Show on website)
                          </label>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowSlideModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-primary" disabled={savingSlide}>
                      {savingSlide ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className={`bi ${editingSlide ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingSlide ? 'Update Slide' : 'Create Slide'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showUserModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-danger text-white">
                  <h5 className="modal-title">
                    <i className={`bi ${editingUser ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingUser ? 'Edit User' : 'Add New User'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowUserModal(false)}></button>
                </div>
                <form onSubmit={saveUser}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Username *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={userFormData.username}
                          onChange={(e) => setUserFormData({...userFormData, username: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email *</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={userFormData.email}
                          onChange={(e) => setUserFormData({...userFormData, email: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Password {editingUser ? '' : '*'}</label>
                        <input 
                          type="password" 
                          className="form-control" 
                          value={userFormData.password}
                          onChange={(e) => setUserFormData({...userFormData, password: e.target.value})}
                          required={!editingUser}
                          placeholder={editingUser ? 'Leave blank to keep current password' : ''}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Role *</label>
                        <select 
                          className="form-select" 
                          value={userFormData.role}
                          onChange={(e) => {
                            const role = e.target.value;
                            let privileges = {...userFormData.privileges};
                            if (role === 'admin') {
                              privileges = {
                                products: true,
                                categories: true,
                                orders: true,
                                customers: true,
                                users: true,
                                analytics: true
                              };
                            } else if (role === 'manager') {
                              privileges = {
                                products: true,
                                categories: true,
                                orders: true,
                                customers: true,
                                users: false,
                                analytics: true
                              };
                            } else {
                              privileges = {
                                products: false,
                                categories: false,
                                orders: false,
                                customers: false,
                                users: false,
                                analytics: false
                              };
                            }
                            setUserFormData({...userFormData, role, privileges});
                          }}
                        >
                          <option value="staff">Staff</option>
                          <option value="manager">Manager</option>
                          <option value="admin">Admin</option>
                        </select>
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Status</label>
                        <select 
                          className="form-select" 
                          value={userFormData.status}
                          onChange={(e) => setUserFormData({...userFormData, status: e.target.value})}
                        >
                          <option value="active">Active</option>
                          <option value="inactive">Inactive</option>
                        </select>
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Privileges</label>
                        <div className="row g-2">
                          {Object.entries(userFormData.privileges).map(([key, value]) => (
                            <div key={key} className="col-md-4">
                              <div className="form-check">
                                <input 
                                  className="form-check-input" 
                                  type="checkbox" 
                                  checked={value}
                                  onChange={(e) => setUserFormData({
                                    ...userFormData, 
                                    privileges: {
                                      ...userFormData.privileges,
                                      [key]: e.target.checked
                                    }
                                  })}
                                />
                                <label className="form-check-label text-capitalize">
                                  {key}
                                </label>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowUserModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-danger" disabled={savingUser}>
                      {savingUser ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className={`bi ${editingUser ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingUser ? 'Update User' : 'Create User'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)', zIndex: 1050}}>
            <div className="modal-dialog modal-xl">
              <div className="modal-content">
                <div className="modal-header bg-primary text-white">
                  <h5 className="modal-title">
                    <i className={`bi ${editingProduct ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingProduct ? 'Edit Product' : 'Add New Product'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={closeModal}></button>
                </div>
                <form onSubmit={handleSubmit}>
                  <div className="modal-body" style={{maxHeight: '70vh', overflowY: 'auto'}}>
                    <div className="row">
                      <div className="col-md-8">
                        <div className="card border-0 shadow-sm mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0"><i className="bi bi-info-circle me-2"></i>Basic Information</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-bold"><i className="bi bi-tag me-1"></i>Product Name *</label>
                                <input type="text" className="form-control" value={formData.name} onChange={(e) => setFormData({...formData, name: e.target.value})} required placeholder="Enter product name" />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold"><i className="bi bi-upc me-1"></i>Product Code *</label>
                                <div className="input-group">
                                  <input type="text" className="form-control" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} required placeholder="e.g., FB001" />
                                  <button type="button" className="btn btn-outline-secondary" onClick={() => setFormData({...formData, code: generateProductCode()})} title="Generate new code">
                                    <i className="bi bi-arrow-clockwise"></i>
                                  </button>
                                </div>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label fw-bold"><i className="bi bi-tags me-1"></i>Category *</label>
                                <select className="form-select" value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value, subcategory: ''})} required>
                                  <option value="">Select Category</option>
                                  {categories.map(category => (
                                    <option key={category.id || category._id} value={category.name}>
                                      {category.name}
                                    </option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-4">
                                <label className="form-label fw-bold"><i className="bi bi-tag me-1"></i>Subcategory</label>
                                <select className="form-select" value={formData.subcategory || ''} onChange={(e) => setFormData({...formData, subcategory: e.target.value})} disabled={!formData.category}>
                                  <option value="">Select Subcategory</option>
                                  {getSubcategories(formData.category).map(sub => (
                                    <option key={sub.slug} value={sub.name}>{sub.name}</option>
                                  ))}
                                </select>
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold"><i className="bi bi-award me-1"></i>Brand</label>
                                <input type="text" className="form-control" value={(formData as any).brand || ''} onChange={(e) => setFormData({...formData, brand: e.target.value})} placeholder="e.g., Nike, Adidas" />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold"><i className="bi bi-check-circle me-1"></i>Status</label>
                                <select className="form-select" value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value as 'instock' | 'outofstock'})}>
                                  <option value="instock">In Stock</option>
                                  <option value="outofstock">Out of Stock</option>
                                </select>
                              </div>
                              <div className="col-12">
                                <label className="form-label fw-bold"><i className="bi bi-file-text me-1"></i>Product Description</label>
                                <textarea 
                                  className="form-control" 
                                  rows={4}
                                  value={formData.description}
                                  onChange={(e) => setFormData({...formData, description: e.target.value})}
                                  placeholder="Enter detailed product description..."
                                />
                              </div>
                              <div className="col-12">
                                <label className="form-label fw-bold"><i className="bi bi-image me-1"></i>Main Product Image *</label>
                                <input type="file" className="form-control" accept="image/*" required={!formData.image} onChange={async (e) => {
                                  const file = e.target.files?.[0];
                                  if (file) {
                                    try {
                                      const uploadData = new FormData();
                                      uploadData.append('file', file);
                                      const response = await fetch('/api/upload', { method: 'POST', body: uploadData });
                                      if (!response.ok) {
                                        throw new Error(`Upload failed: ${response.status}`);
                                      }
                                      const result = await response.json();
                                      if (result.url) {
                                        setFormData(prev => ({...prev, image: result.url}));
                                      } else if (result.error) {
                                        setToast({message: result.error, type: 'error'});
                                        setTimeout(() => setToast(null), 3000);
                                      }
                                    } catch (error) {
                                      console.error('Upload error:', error);
                                      setToast({message: 'Failed to upload image', type: 'error'});
                                      setTimeout(() => setToast(null), 3000);
                                    }
                                  }
                                }} />
                                {formData.image && <small className="text-success">✓ Image uploaded successfully</small>}
                              </div>
                              <div className="col-12">
                                <label className="form-label fw-bold"><i className="bi bi-images me-1"></i>Additional Images (Optional)</label>
                                <div className="row g-2">
                                  {formData.images.map((img, index) => (
                                    <div key={index} className="col-md-6">
                                      <div className="mb-2">
                                        <label className="form-label small">Image {index + 1}</label>
                                        <input 
                                          type="file" 
                                          className="form-control" 
                                          accept="image/*" 
                                          onChange={async (e) => {
                                            const file = e.target.files?.[0];
                                            if (file) {
                                              try {
                                                const uploadData = new FormData();
                                                uploadData.append('file', file);
                                                const response = await fetch('/api/upload', { method: 'POST', body: uploadData });
                                                if (!response.ok) {
                                                  throw new Error(`Upload failed: ${response.status}`);
                                                }
                                                const result = await response.json();
                                                if (result.url) {
                                                  const newImages = [...formData.images];
                                                  newImages[index] = result.url;
                                                  setFormData({...formData, images: newImages});
                                                } else if (result.error) {
                                                  setToast({message: result.error, type: 'error'});
                                                  setTimeout(() => setToast(null), 3000);
                                                }
                                              } catch (error) {
                                                console.error('Upload error:', error);
                                                setToast({message: 'Failed to upload image', type: 'error'});
                                                setTimeout(() => setToast(null), 3000);
                                              }
                                            }
                                          }} 
                                        />
                                        {img && (
                                          <div className="mt-1">
                                            <small className="text-success">✓ Image uploaded</small>
                                            <button 
                                              type="button" 
                                              className="btn btn-sm btn-outline-danger ms-2"
                                              onClick={() => {
                                                const newImages = [...formData.images];
                                                newImages[index] = '';
                                                setFormData({...formData, images: newImages});
                                              }}
                                            >
                                              Remove
                                            </button>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="card border-0 shadow-sm mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0"><i className="bi bi-currency-dollar me-2"></i>Pricing Information</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-4">
                                <label className="form-label fw-bold text-danger">Cost Price (LKR) *</label>
                                <input type="number" className="form-control" value={formData.cost} onChange={(e) => setFormData({...formData, cost: +e.target.value})} required min="0" step="0.01" />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label fw-bold text-warning">VAT Amount (LKR)</label>
                                <input type="number" className="form-control" value={formData.vat} onChange={(e) => setFormData({...formData, vat: +e.target.value})} min="0" step="0.01" />
                              </div>
                              <div className="col-md-4">
                                <label className="form-label fw-bold text-success">Selling Price (LKR) *</label>
                                <input type="number" className="form-control" value={formData.price} onChange={(e) => setFormData({...formData, price: +e.target.value})} required min="0" step="0.01" />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card border-0 shadow-sm mb-4">
                          <div className="card-header bg-light">
                            <h6 className="mb-0"><i className="bi bi-list-ul me-2"></i>Product Specifications</h6>
                          </div>
                          <div className="card-body">
                            <div className="row g-3">
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Material</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formData.specifications.material}
                                  onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, material: e.target.value}})}
                                  placeholder="e.g., Premium Cotton"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Care Instructions</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formData.specifications.careInstructions}
                                  onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, careInstructions: e.target.value}})}
                                  placeholder="e.g., Machine Wash"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Weight/Fit</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formData.specifications.weight}
                                  onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, weight: e.target.value}})}
                                  placeholder="e.g., Regular Fit"
                                />
                              </div>
                              <div className="col-md-6">
                                <label className="form-label fw-bold">Origin</label>
                                <input 
                                  type="text" 
                                  className="form-control" 
                                  value={formData.specifications.origin}
                                  onChange={(e) => setFormData({...formData, specifications: {...formData.specifications, origin: e.target.value}})}
                                  placeholder="e.g., Sri Lanka"
                                />
                              </div>
                            </div>
                          </div>
                        </div>
                        <div className="card border-0 shadow-sm">
                          <div className="card-header bg-light d-flex justify-content-between align-items-center">
                            <h6 className="mb-0"><i className="bi bi-grid-3x3-gap me-2"></i>Size & Color Combinations</h6>
                            <button 
                              type="button" 
                              className="btn btn-primary btn-sm" 
                              onClick={() => {
                                setFormData({...formData, sizes: [...formData.sizes, {size: '', colors: [], stock: 0, price: formData.price}]});
                              }}
                            >
                              <i className="bi bi-plus"></i> Add Size
                            </button>
                          </div>
                          <div className="card-body">
                            {formData.sizes.length === 0 ? (
                              <div className="text-center py-5 text-muted">
                                <i className="bi bi-grid-3x3-gap display-4 mb-3"></i>
                                <p className="mb-0">No size variants added yet. Click "Add Size" to get started.</p>
                              </div>
                            ) : (
                              <div className="accordion" id="sizeAccordion">
                                {formData.sizes.map((sizeItem, sizeIndex) => (
                                  <div key={sizeIndex} className="accordion-item border rounded mb-3">
                                    <h2 className="accordion-header">
                                      <button 
                                        className="accordion-button collapsed" 
                                        type="button" 
                                        data-bs-toggle="collapse" 
                                        data-bs-target={`#size${sizeIndex}`}
                                      >
                                        <div className="d-flex align-items-center w-100">
                                          <div className="me-3">
                                            <input 
                                              type="text" 
                                              className="form-control form-control-sm" 
                                              placeholder="Size (S, M, L, XL)" 
                                              value={sizeItem.size}
                                              onClick={(e) => e.stopPropagation()}
                                              onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[sizeIndex].size = e.target.value;
                                                setFormData({...formData, sizes: newSizes});
                                              }}
                                              style={{width: '120px'}}
                                            />
                                          </div>
                                          <div className="me-3">
                                            <span className="badge bg-info">
                                              {(sizeItem as any).colors?.length || 0} Colors
                                            </span>
                                          </div>
                                          <div className="me-auto">
                                            <small className="text-muted">Base: LKR {sizeItem.price}</small>
                                          </div>
                                          <button 
                                            type="button" 
                                            className="btn btn-outline-danger btn-sm" 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              const newSizes = formData.sizes.filter((_, i) => i !== sizeIndex);
                                              setFormData({...formData, sizes: newSizes});
                                            }}
                                          >
                                            <i className="bi bi-trash"></i>
                                          </button>
                                        </div>
                                      </button>
                                    </h2>
                                    <div id={`size${sizeIndex}`} className="accordion-collapse collapse">
                                      <div className="accordion-body">
                                        <div className="row mb-3">
                                          <div className="col-md-6">
                                            <label className="form-label small fw-bold">Base Stock</label>
                                            <input 
                                              type="number" 
                                              className="form-control" 
                                              placeholder="0" 
                                              min="0"
                                              value={sizeItem.stock}
                                              onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[sizeIndex].stock = +e.target.value;
                                                setFormData({...formData, sizes: newSizes});
                                              }}
                                            />
                                          </div>
                                          <div className="col-md-6">
                                            <label className="form-label small fw-bold">Base Price (LKR)</label>
                                            <input 
                                              type="number" 
                                              className="form-control" 
                                              placeholder="0.00" 
                                              min="0"
                                              step="0.01"
                                              value={sizeItem.price}
                                              onChange={(e) => {
                                                const newSizes = [...formData.sizes];
                                                newSizes[sizeIndex].price = +e.target.value;
                                                setFormData({...formData, sizes: newSizes});
                                              }}
                                            />
                                          </div>
                                        </div>
                                        
                                        <div className="d-flex justify-content-between align-items-center mb-3">
                                          <h6 className="mb-0">Available Colors</h6>
                                          <button 
                                            type="button" 
                                            className="btn btn-success btn-sm" 
                                            onClick={() => {
                                              const newSizes = [...formData.sizes];
                                              if (!(newSizes[sizeIndex] as any).colors) (newSizes[sizeIndex] as any).colors = [];
                                              (newSizes[sizeIndex] as any).colors.push({name: '', code: '', stock: 0, price: sizeItem.price});
                                              setFormData({...formData, sizes: newSizes});
                                            }}
                                          >
                                            <i className="bi bi-plus"></i> Add Color
                                          </button>
                                        </div>
                                        
                                        <div className="row g-3">
                                          {(sizeItem as any).colors?.map((color: any, colorIndex: number) => (
                                            <div key={colorIndex} className="col-md-6">
                                              <div className="card border">
                                                <div className="card-body p-3">
                                                  <div className="d-flex justify-content-between align-items-center mb-2">
                                                    <div 
                                                      className="rounded" 
                                                      style={{
                                                        width: '24px', 
                                                        height: '24px', 
                                                        backgroundColor: color.code || '#ccc',
                                                        border: '1px solid #ddd'
                                                      }}
                                                    ></div>
                                                    <button 
                                                      type="button" 
                                                      className="btn btn-outline-danger btn-sm" 
                                                      onClick={() => {
                                                        const newSizes = [...formData.sizes];
                                                        (newSizes[sizeIndex] as any).colors = (newSizes[sizeIndex] as any).colors.filter((_: any, i: number) => i !== colorIndex);
                                                        setFormData({...formData, sizes: newSizes});
                                                      }}
                                                    >
                                                      <i className="bi bi-x"></i>
                                                    </button>
                                                  </div>
                                                  <div className="mb-2">
                                                    <select 
                                                      className="form-select form-select-sm" 
                                                      value={`${color.name}|${color.code}`}
                                                      onChange={(e) => {
                                                        const [name, code] = e.target.value.split('|');
                                                        const newSizes = [...formData.sizes];
                                                        (newSizes[sizeIndex] as any).colors[colorIndex].name = name;
                                                        (newSizes[sizeIndex] as any).colors[colorIndex].code = code;
                                                        setFormData({...formData, sizes: newSizes});
                                                      }}
                                                    >
                                                      <option value="|">Select Color</option>
                                                      <option value="Black|#000000">Black</option>
                                                      <option value="White|#FFFFFF">White</option>
                                                      <option value="Red|#FF0000">Red</option>
                                                      <option value="Blue|#0000FF">Blue</option>
                                                      <option value="Navy Blue|#001f3f">Navy Blue</option>
                                                      <option value="Green|#008000">Green</option>
                                                      <option value="Yellow|#FFFF00">Yellow</option>
                                                      <option value="Orange|#FFA500">Orange</option>
                                                      <option value="Purple|#800080">Purple</option>
                                                      <option value="Pink|#FFC0CB">Pink</option>
                                                      <option value="Brown|#A52A2A">Brown</option>
                                                      <option value="Gray|#808080">Gray</option>
                                                      <option value="Maroon|#800000">Maroon</option>
                                                      <option value="Olive|#808000">Olive</option>
                                                      <option value="Teal|#008080">Teal</option>
                                                      <option value="Silver|#C0C0C0">Silver</option>
                                                      <option value="Gold|#FFD700">Gold</option>
                                                      <option value="Beige|#F5F5DC">Beige</option>
                                                      <option value="Cream|#FFFDD0">Cream</option>
                                                      <option value="Khaki|#F0E68C">Khaki</option>
                                                    </select>
                                                  </div>
                                                  <div className="row g-2">
                                                    <div className="col-6">
                                                      <input 
                                                        type="number" 
                                                        className="form-control form-control-sm" 
                                                        placeholder="Stock" 
                                                        min="0"
                                                        value={color.stock}
                                                        onChange={(e) => {
                                                          const newSizes = [...formData.sizes];
                                                          (newSizes[sizeIndex] as any).colors[colorIndex].stock = +e.target.value;
                                                          setFormData({...formData, sizes: newSizes});
                                                        }}
                                                      />
                                                    </div>
                                                    <div className="col-6">
                                                      <input 
                                                        type="number" 
                                                        className="form-control form-control-sm" 
                                                        placeholder="Price" 
                                                        min="0"
                                                        step="0.01"
                                                        value={color.price}
                                                        onChange={(e) => {
                                                          const newSizes = [...formData.sizes];
                                                          (newSizes[sizeIndex] as any).colors[colorIndex].price = +e.target.value;
                                                          setFormData({...formData, sizes: newSizes});
                                                        }}
                                                      />
                                                    </div>
                                                  </div>
                                                </div>
                                              </div>
                                            </div>
                                          )) || []}
                                        </div>
                                        
                                        {!(sizeItem as any).colors?.length && (
                                          <div className="text-center py-3 text-muted">
                                            <i className="bi bi-palette2 mb-2" style={{fontSize: '2rem'}}></i>
                                            <p className="mb-0">No colors added for this size yet.</p>
                                          </div>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                      
                      <div className="col-md-4">
                        <div className="card border-0 shadow-sm sticky-top" style={{top: '20px'}}>
                          <div className="card-header bg-success text-white">
                            <h6 className="mb-0"><i className="bi bi-calculator me-2"></i>Profit Calculator</h6>
                          </div>
                          <div className="card-body">
                            <div className="mb-3">
                              <div className="d-flex justify-content-between">
                                <span>Cost Price:</span>
                                <span className="text-danger fw-bold">LKR {formData.cost.toFixed(2)}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>VAT Amount:</span>
                                <span className="text-warning fw-bold">LKR {formData.vat.toFixed(2)}</span>
                              </div>
                              <div className="d-flex justify-content-between">
                                <span>Selling Price:</span>
                                <span className="text-success fw-bold">LKR {formData.price.toFixed(2)}</span>
                              </div>
                              <hr />
                              <div className="d-flex justify-content-between">
                                <span className="fw-bold">Net Profit:</span>
                                <span className={`fw-bold ${(formData.price - formData.cost - formData.vat) >= 0 ? 'text-success' : 'text-danger'}`}>
                                  LKR {(formData.price - formData.cost - formData.vat).toFixed(2)}
                                </span>
                              </div>
                              <div className="d-flex justify-content-between small">
                                <span>Profit Margin:</span>
                                <span className={`fw-bold ${(formData.price - formData.cost - formData.vat) >= 0 ? 'text-success' : 'text-danger'}`}>
                                  {formData.price > 0 ? (((formData.price - formData.cost - formData.vat) / formData.price) * 100).toFixed(1) : 0}%
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="card border-0 shadow-sm sticky-top mt-3" style={{top: '20px'}}>
                          <div className="card-header bg-info text-white">
                            <h6 className="mb-0"><i className="bi bi-images me-2"></i>Image Previews</h6>
                          </div>
                          <div className="card-body p-2">
                            {formData.image && (
                              <div className="mb-2">
                                <small className="text-muted">Main Image:</small>
                                <img src={formData.image} alt="Main" className="img-fluid rounded" style={{width: '100%', objectFit: 'cover', maxHeight: '120px'}} onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />
                              </div>
                            )}
                            <div className="row g-1">
                              {formData.images.map((img, index) => img && (
                                <div key={index} className="col-6">
                                  <small className="text-muted">Image {index + 1}:</small>
                                  <img src={img} alt={`Preview ${index + 1}`} className="img-fluid rounded" style={{width: '100%', objectFit: 'cover', maxHeight: '60px'}} onError={(e) => {(e.target as HTMLImageElement).style.display = 'none'}} />
                                </div>
                              ))}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer bg-light">
                    <button type="button" className="btn btn-outline-secondary" onClick={closeModal}>
                      <i className="bi bi-x-circle me-2"></i>Cancel
                    </button>
                    <button type="submit" className="btn btn-primary" disabled={saving}>
                      {saving ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className={`bi ${editingProduct ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingProduct ? 'Update Product' : 'Create Product'}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showCategoryModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{editingCategory ? 'Edit Category' : 'Add Category'}</h5>
                  <button type="button" className="btn-close" onClick={() => setShowCategoryModal(false)}></button>
                </div>
                <form onSubmit={saveCategoryHandler}>
                  <div className="modal-body">
                    <div className="mb-3">
                      <label className="form-label">Category Name</label>
                      <input 
                        type="text" 
                        className="form-control" 
                        value={categoryName}
                        onChange={(e) => setCategoryName(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label">Delivery Cost (LKR)</label>
                      <input 
                        type="number" 
                        className="form-control" 
                        value={categoryDeliveryCost}
                        onChange={(e) => setCategoryDeliveryCost(+e.target.value)}
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                      />
                      <small className="text-muted">Set delivery cost for products in this category</small>
                    </div>
                    {editingCategory && (
                      <div className="mb-3">
                        <label className="form-label">Subcategories</label>
                        <div className="border rounded p-3">
                          {editingCategory.subcategories?.length > 0 ? (
                            <div className="d-flex flex-wrap gap-2">
                              {editingCategory.subcategories.map((sub: any) => (
                                <span key={sub.slug} className="badge bg-secondary d-flex align-items-center">
                                  {sub.name}
                                  <button 
                                    type="button"
                                    className="btn btn-sm ms-1 p-0" 
                                    style={{fontSize: '0.7rem', color: 'white'}} 
                                    onClick={() => {
                                      setShowCategoryModal(false);
                                      openSubcategoryModal(sub, editingCategory);
                                    }}
                                    title="Edit subcategory"
                                  >
                                    <i className="bi bi-pencil"></i>
                                  </button>
                                  <button 
                                    type="button"
                                    className="btn btn-sm ms-1 p-0" 
                                    style={{fontSize: '0.7rem', color: 'white'}} 
                                    onClick={() => {
                                      deleteSubcategory(editingCategory._id, sub.slug);
                                      setShowCategoryModal(false);
                                    }}
                                    title="Delete subcategory"
                                  >
                                    <i className="bi bi-x"></i>
                                  </button>
                                </span>
                              ))}
                            </div>
                          ) : (
                            <p className="text-muted mb-0">No subcategories yet</p>
                          )}
                          <button 
                            type="button" 
                            className="btn btn-sm btn-outline-primary mt-2"
                            onClick={() => {
                              setShowCategoryModal(false);
                              setSubcategoryFormData({name: '', categoryId: editingCategory._id, description: ''});
                              setShowSubcategoryModal(true);
                            }}
                          >
                            <i className="bi bi-plus me-1"></i>Add Subcategory
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCategoryModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-success" disabled={savingCategory}>
                      {savingCategory ? (
                        <><i className="bi bi-hourglass-split me-1"></i>Saving...</>
                      ) : (
                        editingCategory ? 'Update' : 'Create'
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showOrderModal && selectedOrder && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2"></i>Order Details - {selectedOrder.orderNumber || selectedOrder._id?.slice(-8)}
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowOrderModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row mb-4">
                    <div className="col-md-6">
                      <h6 className="fw-bold">Order Information</h6>
                      <p><strong>Order Number:</strong> {selectedOrder.orderNumber || 'N/A'}</p>
                      <p><strong>Date:</strong> {new Date(selectedOrder.createdAt || Date.now()).toLocaleDateString()}</p>
                      <p><strong>Status:</strong> 
                        <span className={`badge ms-2 ${
                          selectedOrder.status === 'confirmed' ? 'bg-success' :
                          selectedOrder.status === 'pending' ? 'bg-warning' :
                          selectedOrder.status === 'shipped' ? 'bg-info' :
                          selectedOrder.status === 'delivered' ? 'bg-primary' : 'bg-secondary'
                        }`}>
                          {selectedOrder.status || 'pending'}
                        </span>
                      </p>
                      <p><strong>Payment Method:</strong> {(selectedOrder.paymentMethod || 'cash_on_delivery').replace('_', ' ')}</p>
                      <p><strong>Payment Status:</strong> 
                        <span className={`badge ms-2 ${
                          selectedOrder.paymentStatus === 'paid' ? 'bg-success' :
                          selectedOrder.paymentStatus === 'failed' ? 'bg-danger' : 'bg-warning'
                        }`}>
                          {selectedOrder.paymentStatus || 'pending'}
                        </span>
                      </p>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold">Customer Information</h6>
                      <p><strong>Name:</strong> {selectedOrder.customerInfo?.name || 'N/A'}</p>
                      <p><strong>Email:</strong> {selectedOrder.customerInfo?.email || 'N/A'}</p>
                      <p><strong>Phone:</strong> {selectedOrder.customerInfo?.phone || 'N/A'}</p>
                    </div>
                  </div>
                  
                  <h6 className="fw-bold mb-3">Order Items</h6>
                  <div className="table-responsive">
                    <table className="table table-bordered">
                      <thead className="table-light">
                        <tr>
                          <th>Product</th>
                          <th>Size</th>
                          <th>Quantity</th>
                          <th>Price</th>
                          <th>Total</th>
                        </tr>
                      </thead>
                      <tbody>
                        {selectedOrder.items?.map((item: any, index: number) => (
                          <tr key={index}>
                            <td>
                              <div className="d-flex align-items-center">
                                {item.image && (
                                  <img src={item.image} alt={item.name} className="me-2 rounded" style={{width: '40px', height: '40px', objectFit: 'cover'}} />
                                )}
                                <div>
                                  <strong>{item.name || 'N/A'}</strong><br />
                                  <small className="text-muted">{item.code || 'N/A'}</small>
                                </div>
                              </div>
                            </td>
                            <td>{item.size || 'N/A'}</td>
                            <td>{item.quantity || 0}</td>
                            <td>LKR {item.price?.toFixed(2) || '0.00'}</td>
                            <td className="fw-bold">LKR {((item.price || 0) * (item.quantity || 0)).toFixed(2)}</td>
                          </tr>
                        )) || (
                          <tr>
                            <td colSpan={5} className="text-center text-muted">No items found</td>
                          </tr>
                        )}
                      </tbody>
                      <tfoot className="table-light">
                        <tr>
                          <th colSpan={4} className="text-end">Total Amount:</th>
                          <th className="text-success">LKR {selectedOrder.total?.toFixed(2) || '0.00'}</th>
                        </tr>
                      </tfoot>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowOrderModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showHistoryModal && selectedOrderForHistory && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-secondary text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-clock-history me-2"></i>Order Status History - {selectedOrderForHistory.orderNumber || selectedOrderForHistory._id?.slice(-8)}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowHistoryModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="table-responsive">
                    <table className="table table-hover">
                      <thead>
                        <tr>
                          <th>Previous Status</th>
                          <th>New Status</th>
                          <th>Changed By</th>
                          <th>Date & Time</th>
                        </tr>
                      </thead>
                      <tbody>
                        {orderHistory.length === 0 ? (
                          <tr>
                            <td colSpan={4} className="text-center text-muted py-4">
                              No status changes recorded
                            </td>
                          </tr>
                        ) : (
                          orderHistory.map((history, index) => (
                            <tr key={index}>
                              <td>
                                <span className={`badge ${
                                  history.previousStatus === 'pending' ? 'bg-warning text-dark' :
                                  history.previousStatus === 'confirmed' ? 'bg-success' :
                                  history.previousStatus === 'shipped' ? 'bg-info' :
                                  history.previousStatus === 'delivered' ? 'bg-primary' : 'bg-secondary'
                                }`}>
                                  {history.previousStatus}
                                </span>
                              </td>
                              <td>
                                <span className={`badge ${
                                  history.newStatus === 'pending' ? 'bg-warning text-dark' :
                                  history.newStatus === 'confirmed' ? 'bg-success' :
                                  history.newStatus === 'shipped' ? 'bg-info' :
                                  history.newStatus === 'delivered' ? 'bg-primary' : 'bg-secondary'
                                }`}>
                                  {history.newStatus}
                                </span>
                              </td>
                              <td>{history.changedBy?.username || 'System'}</td>
                              <td>{new Date(history.timestamp).toLocaleString()}</td>
                            </tr>
                          ))
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowHistoryModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showReturnDetailsModal && selectedReturn && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-warning text-dark">
                  <h5 className="modal-title">
                    <i className={`bi ${selectedReturn.type === 'damage' ? 'bi-exclamation-triangle' : 'bi-arrow-return-left'} me-2`}></i>
                    {selectedReturn.type === 'damage' ? 'Damage Claim' : 'Return Request'} Details
                  </h5>
                  <button type="button" className="btn-close" onClick={() => setShowReturnDetailsModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-4">
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Return Information</h6>
                      <div className="mb-2"><strong>Return ID:</strong> {selectedReturn.returnId}</div>
                      <div className="mb-2"><strong>Type:</strong> 
                        <span className={`badge ms-2 ${selectedReturn.type === 'damage' ? 'bg-danger' : 'bg-info'}`}>
                          {selectedReturn.type === 'damage' ? 'Damage Claim' : 'Return Request'}
                        </span>
                      </div>
                      <div className="mb-2"><strong>Reason:</strong> {selectedReturn.reason}</div>
                      <div className="mb-2"><strong>Status:</strong> 
                        <span className={`badge ms-2 ${
                          selectedReturn.status === 'approved' ? 'bg-success' :
                          selectedReturn.status === 'rejected' ? 'bg-danger' :
                          selectedReturn.status === 'processing' ? 'bg-info' : 'bg-warning'
                        }`}>
                          {selectedReturn.status}
                        </span>
                      </div>
                      <div className="mb-2"><strong>Date:</strong> {new Date(selectedReturn.createdAt).toLocaleDateString()}</div>
                      <div className="mb-3"><strong>Description:</strong></div>
                      <div className="bg-light p-3 rounded">{selectedReturn.description || 'No description provided'}</div>
                    </div>
                    <div className="col-md-6">
                      <h6 className="fw-bold mb-3">Customer Information</h6>
                      <div className="mb-2"><strong>Name:</strong> {selectedReturn.customerInfo?.name || 'N/A'}</div>
                      <div className="mb-2"><strong>Email:</strong> {selectedReturn.customerInfo?.email || 'N/A'}</div>
                      <div className="mb-2"><strong>Phone:</strong> {selectedReturn.customerInfo?.phone || 'N/A'}</div>
                    </div>
                  </div>
                  
                  {selectedReturn.orderDetails && (
                    <>
                      <hr className="my-4" />
                      <h6 className="fw-bold mb-3">Order Details</h6>
                      <div className="row g-3 mb-3">
                        <div className="col-md-4">
                          <strong>Order ID:</strong> {selectedReturn.orderDetails.orderNumber || selectedReturn.orderId?.slice(-8)}
                        </div>
                        <div className="col-md-4">
                          <strong>Order Total:</strong> LKR {selectedReturn.orderDetails.total?.toFixed(2) || '0.00'}
                        </div>
                        <div className="col-md-4">
                          <strong>Payment Method:</strong> {selectedReturn.orderDetails.paymentMethod?.replace('_', ' ').toUpperCase() || 'COD'}
                        </div>
                      </div>
                      
                      <h6 className="fw-bold mb-3">Order Items</h6>
                      <div className="table-responsive">
                        <table className="table table-sm">
                          <thead>
                            <tr>
                              <th>Product</th>
                              <th>Size</th>
                              <th>Color</th>
                              <th>Quantity</th>
                              <th>Price</th>
                            </tr>
                          </thead>
                          <tbody>
                            {selectedReturn.orderDetails.items?.map((item: any, index: number) => (
                              <tr key={index}>
                                <td>
                                  <div className="d-flex align-items-center">
                                    {item.image && (
                                      <img src={item.image} alt={item.name} className="me-2 rounded" style={{width: '30px', height: '30px', objectFit: 'cover'}} />
                                    )}
                                    <div>
                                      <div className="fw-medium">{item.name}</div>
                                      <small className="text-muted">{item.code}</small>
                                    </div>
                                  </div>
                                </td>
                                <td>{item.size}</td>
                                <td>{item.color}</td>
                                <td>{item.quantity}</td>
                                <td>LKR {item.price?.toFixed(2)}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </>
                  )}
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowReturnDetailsModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showCustomerModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-pencil-square me-2"></i>Edit Customer
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowCustomerModal(false)}></button>
                </div>
                <form onSubmit={saveCustomer}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Full Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={customerFormData.name}
                          onChange={(e) => setCustomerFormData({...customerFormData, name: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Email *</label>
                        <input 
                          type="email" 
                          className="form-control" 
                          value={customerFormData.email}
                          onChange={(e) => setCustomerFormData({...customerFormData, email: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Phone</label>
                        <input 
                          type="tel" 
                          className="form-control" 
                          value={customerFormData.phone}
                          onChange={(e) => setCustomerFormData({...customerFormData, phone: e.target.value})}
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Country</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={customerFormData.country}
                          onChange={(e) => setCustomerFormData({...customerFormData, country: e.target.value})}
                        />
                      </div>
                      <div className="col-12">
                        <label className="form-label fw-bold">Address</label>
                        <div className="row g-2">
                          <div className="col-12">
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Address Line 1"
                              value={customerFormData.address.line1}
                              onChange={(e) => setCustomerFormData({...customerFormData, address: {...customerFormData.address, line1: e.target.value}})}
                            />
                          </div>
                          <div className="col-md-6">
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Address Line 2 (Optional)"
                              value={customerFormData.address.line2}
                              onChange={(e) => setCustomerFormData({...customerFormData, address: {...customerFormData.address, line2: e.target.value}})}
                            />
                          </div>
                          <div className="col-md-6">
                            <input 
                              type="text" 
                              className="form-control" 
                              placeholder="Address Line 3 (Optional)"
                              value={customerFormData.address.line3}
                              onChange={(e) => setCustomerFormData({...customerFormData, address: {...customerFormData.address, line3: e.target.value}})}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowCustomerModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-info" disabled={savingCustomer}>
                      {savingCustomer ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className="bi bi-check-circle me-2"></i>Update Customer</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showAddressModal && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-info text-white">
                  <h5 className="modal-title">
                    <i className={`bi ${editingAddress ? 'bi-pencil-square' : 'bi-plus-circle'} me-2`}></i>
                    {editingAddress ? 'Edit Address' : 'Add New Address'}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowAddressModal(false)}></button>
                </div>
                <form onSubmit={saveAddress}>
                  <div className="modal-body">
                    <div className="row g-3">
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Name *</label>
                        <input 
                          type="text" 
                          className="form-control" 
                          value={addressFormData.name}
                          onChange={(e) => setAddressFormData({...addressFormData, name: e.target.value})}
                          required 
                        />
                      </div>
                      <div className="col-md-6">
                        <label className="form-label fw-bold">Type *</label>
                        <select 
                          className="form-select" 
                          value={addressFormData.type}
                          onChange={(e) => handleTypeChange(e.target.value)}
                          disabled={editingAddress}
                        >
                          <option value="country">Country</option>
                          <option value="region">Region</option>
                          <option value="district">District</option>
                          <option value="city">City</option>
                        </select>
                      </div>
                      {addressFormData.type !== 'country' && (
                        <div className="col-12">
                          <label className="form-label fw-bold">Parent {addressFormData.type === 'region' ? 'Country' : addressFormData.type === 'district' ? 'Region' : 'District'} *</label>
                          <select 
                            className="form-select" 
                            value={addressFormData.parentId || ''}
                            onChange={(e) => setAddressFormData({...addressFormData, parentId: e.target.value ? parseInt(e.target.value) : null})}
                            required
                          >
                            <option value="">Select Parent</option>
                            {parentAddresses.map(parent => (
                              <option key={parent.id} value={parent.id}>{parent.name}</option>
                            ))}
                          </select>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-secondary" onClick={() => setShowAddressModal(false)}>Cancel</button>
                    <button type="submit" className="btn btn-info" disabled={savingAddress}>
                      {savingAddress ? (
                        <><i className="bi bi-hourglass-split me-2"></i>Saving...</>
                      ) : (
                        <><i className={`bi ${editingAddress ? 'bi-check-circle' : 'bi-plus-circle'} me-2`}></i>{editingAddress ? 'Update' : 'Create'} {addressFormData.type}</>
                      )}
                    </button>
                  </div>
                </form>
              </div>
            </div>
          </div>
        )}

        {showSlipModal && selectedSlip && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.8)'}}>
            <div className="modal-dialog modal-lg">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-receipt me-2"></i>Payment Slip - Order {selectedSlip.orderNumber || selectedSlip._id?.slice(-8)}
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
                    {selectedSlip.paymentSlip?.imageData ? (
                      <img 
                        src={selectedSlip.paymentSlip.imageData} 
                        alt="Payment Slip" 
                        className="img-fluid rounded shadow"
                        style={{maxHeight: '500px', maxWidth: '100%'}}
                      />
                    ) : (
                      <div className="text-center py-5">
                        <i className="bi bi-file-image display-4 text-muted"></i>
                        <p className="text-muted mt-2">No payment slip available</p>
                      </div>
                    )}
                  </div>
                  <div className="d-flex justify-content-center gap-2">
                    <button 
                      className="btn btn-success" 
                      onClick={() => {
                        updateSlipStatus(selectedSlip._id, 'verified');
                        setShowSlipModal(false);
                      }}
                      disabled={selectedSlip.paymentSlip?.status === 'verified'}
                    >
                      <i className="bi bi-check-circle me-2"></i>Verify
                    </button>
                    <button 
                      className="btn btn-danger" 
                      onClick={() => {
                        updateSlipStatus(selectedSlip._id, 'rejected');
                        setShowSlipModal(false);
                      }}
                      disabled={selectedSlip.paymentSlip?.status === 'rejected'}
                    >
                      <i className="bi bi-x-circle me-2"></i>Reject
                    </button>
                    <button 
                      className="btn btn-warning" 
                      onClick={() => updateSlipStatus(selectedSlip._id, 'pending')}
                      disabled={selectedSlip.paymentSlip?.status === 'pending'}
                    >
                      <i className="bi bi-clock me-2"></i>Mark Pending
                    </button>
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowSlipModal(false)}>Close</button>
                </div>
              </div>
            </div>
          </div>
        )}

        {showRestockModal && restockingProduct && (
          <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
            <div className="modal-dialog">
              <div className="modal-content">
                <div className="modal-header bg-success text-white">
                  <h5 className="modal-title">
                    <i className="bi bi-plus-square me-2"></i>Restock Product - {restockingProduct.name}
                  </h5>
                  <button type="button" className="btn-close btn-close-white" onClick={() => setShowRestockModal(false)}></button>
                </div>
                <div className="modal-body">
                  <div className="row g-3">
                    {Array.isArray(restockingProduct.sizes) ? (
                      restockingProduct.sizes.map(size => (
                        size.colors && size.colors.length > 0 ? (
                          size.colors.map((color: any) => (
                            <div key={`${size.size}-${color.name}`} className="col-md-6">
                              <label className="form-label fw-bold">{size.size} - {color.name}</label>
                              <div className="input-group">
                                <span className="input-group-text">Current: {color.stock}</span>
                                <input 
                                  type="number" 
                                  className="form-control" 
                                  placeholder="Add stock"
                                  min="0"
                                  value={restockData[`${size.size}-${color.name}`] || 0}
                                  onChange={(e) => setRestockData({...restockData, [`${size.size}-${color.name}`]: +e.target.value})}
                                />
                              </div>
                            </div>
                          ))
                        ) : (
                          <div key={size.size} className="col-md-6">
                            <label className="form-label fw-bold">Size {size.size}</label>
                            <div className="input-group">
                              <span className="input-group-text">Current: {size.stock}</span>
                              <input 
                                type="number" 
                                className="form-control" 
                                placeholder="Add stock"
                                min="0"
                                value={restockData[size.size] || 0}
                                onChange={(e) => setRestockData({...restockData, [size.size]: +e.target.value})}
                              />
                            </div>
                          </div>
                        )
                      ))
                    ) : (
                      <div className="col-12">
                        <p className="text-muted">No size variants configured for this product.</p>
                      </div>
                    )}
                  </div>
                </div>
                <div className="modal-footer">
                  <button type="button" className="btn btn-secondary" onClick={() => setShowRestockModal(false)}>Cancel</button>
                  <button type="button" className="btn btn-success" onClick={handleRestock}>
                    <i className="bi bi-check-circle me-2"></i>Update Stock
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {toast && (
          <div className={`position-fixed top-0 end-0 m-3`} style={{zIndex: 9999}}>
            <div className={`alert alert-${toast.type === 'success' ? 'success' : 'danger'} alert-dismissible fade show`} role="alert">
              <i className={`bi ${toast.type === 'success' ? 'bi-check-circle-fill' : 'bi-exclamation-triangle-fill'} me-2`}></i>
              {toast.message}
              <button type="button" className="btn-close" onClick={() => setToast(null)}></button>
            </div>
          </div>
        )}

        {activeTab === 'tailors' && hasPrivilege('users') && (
          <TailorsSection 
            tailors={tailors}
            loadingTailors={loadingTailors}
            updateTailorStatus={updateTailorStatus}
          />
        )}
      </div>
    </div>
  );
}