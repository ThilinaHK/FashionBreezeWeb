'use client';

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';
import DiscountCountdown from './components/DiscountCountdown';

interface Product {
  id?: number;
  _id?: string;
  name: string;
  code: string;
  description?: string;
  price: number;
  category: string | { _id: string; name: string; slug: string };
  brand?: string;
  image: string;
  images?: string[];
  sizes?: any;
  status: 'instock' | 'outofstock' | 'active';
  rating?: number | { average: number; count: number };
  reviewCount?: number;
}

interface CartItem extends Product {
  size: string;
  quantity: number;
  color?: string;
  selectedSizeData?: any;
}

interface ChatMessage {
  text: string;
  isBot: boolean;
}

interface Comment {
  customer: string;
  rating: number;
  date: string;
  comment: string;
}

const ImageWithFallback = ({ src, alt, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState(src);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    setImgSrc(src);
    setHasError(false);
  }, [src]);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc('https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop');
    }
  };

  return <img src={imgSrc} alt={alt} onError={handleError} {...props} />;
};

export default function HomePage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState({ min: 0, max: 100 });
  const [maxPrice, setMaxPrice] = useState(100);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [showCart, setShowCart] = useState(false);
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [zoomLevel, setZoomLevel] = useState(1);
  const [selectedSize, setSelectedSize] = useState('M');
  const [selectedColor, setSelectedColor] = useState('');
  const [modalQuantity, setModalQuantity] = useState(1);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [showChatbot, setShowChatbot] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    { text: 'Hi! How can I help you today?', isBot: true }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [lastUpdateCheck, setLastUpdateCheck] = useState(0);
  const [loading, setLoading] = useState(true);
  const [cartLoading, setCartLoading] = useState<number | null>(null);
  const [orderLoading, setOrderLoading] = useState(false);
  const [error, setError] = useState('');
  const [mounted, setMounted] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState('cash_on_delivery');
  const [showReviewForm, setShowReviewForm] = useState(false);
  const [newReview, setNewReview] = useState({ rating: 5, comment: '' });
  const [productReviews, setProductReviews] = useState<{[key: string]: Comment[]}>({});
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [backgroundAnimation, setBackgroundAnimation] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [slides, setSlides] = useState<any[]>([]);
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [deliveryCost, setDeliveryCost] = useState(0);
  const [deliveryMessage, setDeliveryMessage] = useState('FREE');
  const [remainingForFreeDelivery, setRemainingForFreeDelivery] = useState(0);

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  const getCategoryName = (category: string | { _id: string; name: string; slug: string } | undefined): string => {
    if (!category) return 'Uncategorized';
    if (typeof category === 'string') return category;
    if (typeof category === 'object' && 'name' in category) return category.name;
    return 'Uncategorized';
  };

  const getSpecification = (product: Product | null, key: string, fallback: string): string => {
    if (!(product as any)?.specifications) return fallback;
    const specs = (product as any).specifications as any;
    return specs[key] || fallback;
  };

  useEffect(() => {
    setMounted(true);
    
    // Load initial data
    const initializeApp = async () => {
      try {
        console.log('Initializing app...');
        await loadProducts();
        await loadCartFromStorage();
        await loadCategoriesFromAPI();
        await loadSlides();
        
        // Check admin status
        const adminStatus = localStorage.getItem('isAdmin') === 'true';
        setIsAdmin(adminStatus);
        
        // Load background animation preference
        const bgAnimation = localStorage.getItem('backgroundAnimation');
        setBackgroundAnimation(bgAnimation !== 'false');
        
        console.log('App initialization complete');
      } catch (error) {
        console.error('Error during app initialization:', error);
      }
    };
    
    initializeApp();
    
    // Start update listener after initial load
    const cleanup = startProductUpdateListener();
    
    return cleanup;
  }, []);

  const startProductUpdateListener = () => {
    if (typeof window !== 'undefined') {
      const handleStorageChange = (e: StorageEvent) => {
        if (e.key === 'products_updated') {
          console.log('Products updated via storage event');
          loadProducts();
        }
        if (e.key === 'categories_updated') {
          console.log('Categories updated via storage event');
          loadCategoriesFromAPI();
          // Recalculate delivery costs when categories change
          if (cart.length > 0) {
            setTimeout(() => calculateDelivery(), 500);
          }
        }
      };
      
      window.addEventListener('storage', handleStorageChange);
      
      // Reduce interval frequency to prevent excessive API calls
      const interval = setInterval(() => {
        const timestamp = localStorage.getItem('products_timestamp');
        const categoriesUpdated = localStorage.getItem('categories_updated');
        
        if (timestamp && parseInt(timestamp) > lastUpdateCheck) {
          console.log('Products updated via timestamp check');
          loadProducts();
          setLastUpdateCheck(parseInt(timestamp));
        }
        
        if (categoriesUpdated === 'true') {
          console.log('Categories updated via timestamp check');
          localStorage.removeItem('categories_updated');
          loadCategoriesFromAPI();
          // Recalculate delivery costs when categories change
          if (cart.length > 0) {
            setTimeout(() => calculateDelivery(), 500);
          }
        }
      }, 10000); // Increased from 2000ms to 10000ms

      return () => {
        clearInterval(interval);
        window.removeEventListener('storage', handleStorageChange);
      };
    }
    return undefined;
  };

  const loadCartFromStorage = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        const cartData = await response.json();
        console.log('Loaded cart data:', cartData);
        const loadedItems = cartData.items || [];
        setCart(loadedItems);
        
        // Load delivery cost if available
        if (cartData.deliveryCost !== undefined) {
          setDeliveryCost(cartData.deliveryCost);
        }
        
        return loadedItems;
      } catch (error) {
        console.error('Error loading cart from MongoDB:', error);
        setCart([]);
        return [];
      }
    } else {
      setCart([]);
      return [];
    }
  };

  const saveCartToMongoDB = async (cartItems: CartItem[]) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        console.log('Saving cart for userId:', userId, 'Items:', cartItems.length);
        const itemsWithProductId = cartItems.map(item => ({
          ...item,
          productId: item._id || item.id?.toString() || item.id
        }));
        console.log('Items with productId:', itemsWithProductId);
        
        const subtotal = cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0);
        
        // Recalculate delivery cost before saving
        await calculateDelivery();
        
        const total = subtotal + deliveryCost;
        
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            items: itemsWithProductId,
            subtotal,
            deliveryCost,
            total
          })
        });
        const result = await response.json();
        console.log('Cart save result:', result);
        if (!result.success) {
          console.error('Cart save failed:', result.error);
        }
      } catch (error) {
        console.error('Error saving cart to MongoDB:', error);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('Loading products from database...');
      
      const response = await fetch(`/api/products?t=${Date.now()}`, {
        cache: 'no-store',
        headers: {
          'Cache-Control': 'no-cache'
        }
      });
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const products = await response.json();
      console.log('Received products from API:', products.length);
      
      if (Array.isArray(products) && products.length > 0) {
        console.log('Setting products from database:', products);
        setProducts(products);
        updateCategories(products);
      } else {
        console.warn('No products received from database, loading fallback products');
        loadFallbackProducts();
      }
    } catch (error) {
      console.error('Error loading products from database:', error);
      console.log('Loading fallback products due to error');
      loadFallbackProducts();
    } finally {
      setLoading(false);
    }
  };

  const loadFallbackProducts = () => {
    const fallbackProducts = [
      {
        id: 1,
        name: "Classic White T-Shirt",
        code: "CL001",
        price: 5997,
        category: "For Men",
        brand: "Nike",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop"
        ],
        sizes: { "XS": 5, "S": 12, "M": 8, "L": 15, "XL": 3, "XXL": 0 },
        status: "instock" as const,
        rating: 4.5,
        reviewCount: 128
      },
      {
        id: 2,
        name: "Blue Denim Jeans",
        code: "CL002",
        price: 14997,
        category: "For Men",
        brand: "Levi's",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop"
        ],
        sizes: { "XS": 0, "S": 7, "M": 10, "L": 6, "XL": 4, "XXL": 2 },
        status: "instock" as const,
        rating: 4.2,
        reviewCount: 89
      },
      {
        id: 3,
        name: "T-Shirt",
        code: "FB01159664",
        price: 500019,
        category: "XXX CCCzzz",
        brand: "Adidas",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400&h=400&fit=crop"
        ],
        sizes: { "XS": 10, "S": 15, "M": 20, "L": 18, "XL": 12, "XXL": 8 },
        status: "instock" as const,
        rating: 4.8,
        reviewCount: 256
      }
    ];
    setProducts(fallbackProducts);
    updateCategories(fallbackProducts);
  };

  const updateCategories = (productList: Product[]) => {
    const uniqueCategories = [...new Set(productList.map(p => getCategoryName(p.category)))];
    // Only update categories if we don't have API categories loaded
    if (categories.length <= 1) {
      setCategories(['All', ...uniqueCategories]);
    }
    const maxProductPrice = Math.max(...productList.map(p => p.price));
    setMaxPrice(Math.ceil(maxProductPrice));
    setPriceRange({ min: 0, max: Math.ceil(maxProductPrice) });
  };

  const loadCategoriesFromAPI = async () => {
    try {
      const response = await fetch('/api/categories');
      if (response.ok) {
        const apiCategories = await response.json();
        const categoryNames = apiCategories.map((cat: any) => cat.name);
        setCategories(['All', ...categoryNames]);
      } else {
        setCategories(['All', "Men's Fashion", "Women's Fashion", 'Kids Fashion']);
      }
    } catch {
      setCategories(['All', "Men's Fashion", "Women's Fashion", 'Kids Fashion']);
    }
  };

  const getFilteredProducts = useMemo(() => {
    let filtered = [...products];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => {
        const categoryName = getCategoryName(p.category);
        return (
          (p.name && p.name.toLowerCase().includes(term)) ||
          (p.code && p.code.toLowerCase().includes(term)) ||
          (categoryName && categoryName.toLowerCase().includes(term))
        );
      });
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => getCategoryName(product.category) === selectedCategory);
    }
    
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    return filtered;
  }, [products, searchTerm, selectedCategory, priceRange]);

  const addToCart = useCallback(async (product: Product) => {
    const productId = product.id || product._id;
    setCartLoading(productId as number);
    const cartItem: CartItem = { ...product, size: 'M', quantity: 1 };
    const newCart = [...cart, cartItem];
    setCart(newCart);
    try {
      await saveCartToMongoDB(newCart);
    } catch (error) {
      console.error('Failed to save cart:', error);
    }
    setCartLoading(null);
  }, [cart]);

  const removeFromCart = async (productId: number | string, size?: string) => {
    const newCart = cart.filter(item => !((item.id || item._id) === productId && (!size || item.size === size)));
    setCart(newCart);
    await saveCartToMongoDB(newCart);
  };

  const getSubtotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };
  
  const getTotal = () => {
    return getSubtotal() + deliveryCost;
  };
  
  const calculateDelivery = async () => {
    const subtotal = getSubtotal();
    console.log('Calculating delivery for subtotal:', subtotal, 'Cart items:', cart.length);
    
    if (subtotal === 0) {
      setDeliveryCost(0);
      setDeliveryMessage('FREE');
      setRemainingForFreeDelivery(0);
      return;
    }
    
    try {
      const customerData = JSON.parse(localStorage.getItem('customers') || '[]');
      const currentCustomer = customerData[customerData.length - 1] || {};
      const location = currentCustomer.address?.line1 || localStorage.getItem('userAddress') || '';
      
      const response = await fetch('/api/delivery/calculate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subtotal,
          location,
          items: cart.map(item => ({
            ...item,
            category: getCategoryName(item.category)
          }))
        })
      });
      
      if (response.ok) {
        const data = await response.json();
        console.log('Delivery calculation result:', data);
        setDeliveryCost(data.deliveryCost || 0);
        setDeliveryMessage(data.deliveryMessage || 'FREE');
        setRemainingForFreeDelivery(data.remainingForFreeDelivery || 0);
      } else {
        // Fallback calculation
        const cost = subtotal >= 5000 ? 0 : 300;
        setDeliveryCost(cost);
        setDeliveryMessage(cost === 0 ? 'FREE' : `LKR ${cost}`);
        setRemainingForFreeDelivery(subtotal < 5000 ? 5000 - subtotal : 0);
      }
    } catch (error) {
      console.error('Delivery calculation error:', error);
      // Fallback calculation
      const cost = subtotal >= 5000 ? 0 : 300;
      setDeliveryCost(cost);
      setDeliveryMessage(cost === 0 ? 'FREE' : `LKR ${cost}`);
      setRemainingForFreeDelivery(subtotal < 5000 ? 5000 - subtotal : 0);
    }
  };

  const placeOrder = async () => {
    const isRegistered = localStorage.getItem('userRegistered');
    const userId = localStorage.getItem('userId');
    
    if (!isRegistered || !userId) {
      window.location.href = '/register';
      return;
    }

    setOrderLoading(true);
    setError('');
    
    try {
      console.log('Placing order for userId:', userId);
      console.log('Current cart state:', cart);
      
      // Check current cart first, then reload if needed
      console.log('Current cart state:', cart);
      
      let finalCart = cart;
      if (cart.length === 0) {
        // Try to reload cart from storage
        const freshCart = await loadCartFromStorage();
        console.log('Fresh cart from storage:', freshCart);
        
        if (!freshCart || freshCart.length === 0) {
          setError('Your cart is empty. Please add some items before placing an order.');
          return;
        }
        
        // Update local cart state with fresh data
        setCart(freshCart);
        finalCart = freshCart;
      }
      console.log('Proceeding with order:', finalCart.length, 'items');
      
      // Ensure cart is saved before placing order
      await saveCartToMongoDB(finalCart);
      
      // Create order in MongoDB - pass items as fallback
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          items: finalCart, // Pass items as fallback
          total: finalCart.reduce((sum, item) => sum + (item.price * item.quantity), 0),
          customerInfo: {
            name: getUserName(),
            email: localStorage.getItem('userEmail') || '',
            phone: localStorage.getItem('userPhone') || '',
            address: localStorage.getItem('userAddress') || ''
          },
          paymentMethod: paymentMethod,
          paymentStatus: 'pending'
        })
      });
      
      console.log('Order response status:', orderResponse.status);
      const orderResult = await orderResponse.json();
      console.log('Order result:', orderResult);
      
      if (orderResponse.ok && orderResult.success) {
        // Clear cart in state and localStorage
        setCart([]);
        localStorage.removeItem('cart');
        
        // Clear cart in MongoDB
        await fetch('/api/cart', {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId })
        });
        
        setOrderPlaced(true);
        setShowCart(false);
        setTimeout(() => setOrderPlaced(false), 3000);
      } else {
        setError(orderResult.error || 'Failed to place order. Please try again.');
        console.error('Order failed:', orderResult);
      }
    } catch (error) {
      console.error('Error placing order:', error);
      setError('Failed to place order. Please try again.');
    } finally {
      setOrderLoading(false);
    }
  };

  const sendToWhatsApp = () => {
    const orderDetails = cart.map(item => 
      `${item.code || 'N/A'} - ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - ₹${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    let customerData: any[] = [];
    let currentCustomer: any = {};
    
    if (typeof window !== 'undefined') {
      customerData = JSON.parse(localStorage.getItem('customers') || '[]');
      currentCustomer = customerData[customerData.length - 1] || {};
    }
    
    const addressLines = [
      currentCustomer.address?.line1,
      currentCustomer.address?.line2,
      currentCustomer.address?.line3
    ].filter((line: any) => line && line.trim()).join('\n');
    
    const deliveryAddress = addressLines || localStorage.getItem('userAddress') || 'Please provide delivery address';
    
    const customerInfo = `CUSTOMER DETAILS:\nName: ${currentCustomer.name || getUserName()}\nEmail: ${currentCustomer.email || localStorage.getItem('userEmail') || 'Not provided'}\nPhone: ${currentCustomer.phone || localStorage.getItem('userPhone') || 'Not provided'}\nCountry: ${currentCustomer.country || 'Sri Lanka'}\n\nDELIVERY ADDRESS:\n${deliveryAddress}`;
    
    const subtotal = getSubtotal();
    const total = getTotal();
    const deliveryInfo = deliveryCost > 0 ? `\nDelivery: LKR ${deliveryCost.toFixed(2)}` : '\nDelivery: FREE';
    
    const message = `🛍️ NEW ORDER - Fashion Breeze\n\nORDER ITEMS:\n${orderDetails}\n\nSUBTOTAL: LKR ${subtotal.toFixed(2)}${deliveryInfo}\nTOTAL: LKR ${total.toFixed(2)}\n\n${customerInfo}`;
    
    const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  };

  const getUserName = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userName') || 'Guest';
    }
    return 'Guest';
  };

  const isUserRegistered = () => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('userRegistered') === 'true';
    }
    return false;
  };

  const openProductModal = useCallback((product: Product) => {
    // Reset all states immediately
    setZoomLevel(1);
    setModalQuantity(1);
    setSelectedSize('M');
    setSelectedColor('');
    setCurrentSlide(0);
    setCurrentImageIndex(0);
    
    // Set product directly
    setSelectedProduct(product);
    setShowProductModal(true);
  }, []);

  const navigateImage = (direction: 'prev' | 'next') => {
    if (!selectedProduct) return;
    const images = getProductImages();
    console.log('Navigate:', direction, 'Current index:', currentImageIndex, 'Images:', images);
    if (images.length <= 1) return;
    
    let newIndex;
    
    if (direction === 'prev') {
      newIndex = currentImageIndex > 0 ? currentImageIndex - 1 : images.length - 1;
    } else {
      newIndex = currentImageIndex < images.length - 1 ? currentImageIndex + 1 : 0;
    }
    
    console.log('New index:', newIndex, 'New image:', images[newIndex]);
    setCurrentImageIndex(newIndex);
    setSelectedProduct(prev => prev ? {...prev, image: images[newIndex]} : prev);
  };

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (!showProductModal) return;
      
      switch (e.key) {
        case 'ArrowLeft':
          navigateImage('prev');
          break;
        case 'ArrowRight':
          navigateImage('next');
          break;
        case 'Escape':
          closeProductModal();
          break;
      }
    };

    if (showProductModal) {
      document.addEventListener('keydown', handleKeyPress);
      return () => document.removeEventListener('keydown', handleKeyPress);
    }
  }, [showProductModal, currentImageIndex, selectedProduct]); // eslint-disable-line react-hooks/exhaustive-deps

  const onSizeSelect = (size: string) => {
    if (!isSizeInStock(size)) return;
    setSelectedSize(size);
    setSelectedColor(''); // Reset color when size changes
    setModalQuantity(1); // Reset quantity when size changes
  };

  const onColorSelect = (colorName: string) => {
    setSelectedColor(colorName);
    setSelectedSize(''); // Reset size when color changes
    setModalQuantity(1); // Reset quantity when color changes
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
    setZoomLevel(1);
    setModalQuantity(1);
    setSelectedSize('M');
    setSelectedColor('');
    setCurrentSlide(0);
    setCurrentImageIndex(0);
  };

  const scrollToProducts = () => {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  };

  const toggleChatbot = () => {
    setShowChatbot(!showChatbot);
  };

  const sendMessage = () => {
    if (!chatInput.trim()) return;
    
    setChatMessages(prev => [...prev, { text: chatInput, isBot: false }]);
    const userMessage = chatInput.toLowerCase();
    setChatInput('');
    
    setTimeout(() => {
      let botResponse = "I'm here to help! You can ask about products, sizes, or orders.";
      
      if (userMessage.includes('discount') || userMessage.includes('sale')) {
        botResponse = 'We have amazing discounts! Use code SUMMER20 for 20% off on selected items.';
      } else if (userMessage.includes('size') || userMessage.includes('sizing')) {
        botResponse = 'Our sizes range from XS to XXL. Each product shows available sizes and stock levels.';
      } else if (userMessage.includes('order') || userMessage.includes('delivery')) {
        botResponse = 'Orders are processed via WhatsApp. Add items to cart and click "Place Order via WhatsApp".';
      } else if (userMessage.includes('price') || userMessage.includes('cost')) {
        botResponse = 'All prices are in Sri Lankan Rupees (LKR). Check our promotional sidebar for current deals!';
      }
      
      setChatMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  const getStars = (rating: number): string[] => {
    const stars: string[] = [];
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 !== 0;
    
    for (let i = 0; i < fullStars; i++) {
      stars.push('bi-star-fill');
    }
    
    if (hasHalfStar) {
      stars.push('bi-star-half');
    }
    
    while (stars.length < 5) {
      stars.push('bi-star');
    }
    
    return stars;
  };

  const getProductDescription = () => {
    const descriptions: { [key: number]: string } = {
      1: 'Crafted from premium 100% organic cotton, this classic white t-shirt offers unparalleled comfort and breathability. Features a modern slim-fit design with reinforced seams for durability. Perfect for layering or wearing solo, this versatile piece is a wardrobe essential that combines style with sustainability.',
      2: 'These premium blue denim jeans are expertly crafted from high-quality stretch denim fabric, offering the perfect balance of comfort and style. Featuring a contemporary slim-fit cut with classic five-pocket styling, these jeans are designed to move with you while maintaining their shape. The rich indigo wash and subtle fading details add authentic character to this timeless piece.',
      3: 'Experience luxury comfort with this premium fashion t-shirt, meticulously designed for the modern individual. Made from superior quality materials with attention to every detail, this piece represents the perfect fusion of contemporary style and classic elegance. The sophisticated cut and premium finish make it suitable for both casual and semi-formal occasions.'
    };
    const productId = selectedProduct?.id;
    const defaultDescription = 'Discover exceptional quality and style with this premium fashion piece. Carefully crafted using superior materials and modern techniques, this item represents the perfect blend of comfort, durability, and contemporary design. Each piece is thoughtfully designed to enhance your wardrobe with timeless elegance and versatile styling options.';
    return productId ? descriptions[productId] || defaultDescription : defaultDescription;
  };

  const getCustomerComments = (): Comment[] => {
    const productId = selectedProduct?.id?.toString() || selectedProduct?._id?.toString() || '';
    const defaultComments = [
      { customer: 'Sarah M.', rating: 5, date: '2 days ago', comment: 'Excellent quality and fast shipping! Highly recommend.' },
      { customer: 'John D.', rating: 4, date: '1 week ago', comment: 'Good product, fits perfectly. Great value for money.' },
      { customer: 'Emma L.', rating: 5, date: '2 weeks ago', comment: 'Love it! Exactly as described. Will buy again.' },
      { customer: 'Mike R.', rating: 4, date: '3 weeks ago', comment: 'Nice quality, arrived quickly. Very satisfied.' },
      { customer: 'Lisa K.', rating: 5, date: '1 month ago', comment: 'Perfect! Great material and comfortable fit.' }
    ];
    
    const userReviews = productReviews[productId] || [];
    return [...userReviews, ...defaultComments];
  };

  const submitReview = () => {
    if (!selectedProduct || !newReview.comment.trim()) return;
    
    const productId = selectedProduct.id?.toString() || selectedProduct._id?.toString() || '';
    const userName = getUserName();
    
    const review: Comment = {
      customer: userName,
      rating: newReview.rating,
      date: 'Just now',
      comment: newReview.comment.trim()
    };
    
    setProductReviews(prev => ({
      ...prev,
      [productId]: [review, ...(prev[productId] || [])]
    }));
    
    setNewReview({ rating: 5, comment: '' });
    setShowReviewForm(false);
  };

  const getSimilarProducts = () => {
    const currentProduct = selectedProduct;
    if (!currentProduct) return [];
    
    return products
      .filter(p => {
        const currentCategoryName = getCategoryName(currentProduct.category);
        const productCategoryName = getCategoryName(p.category);
        return (p.id || p._id) !== (currentProduct.id || currentProduct._id) && productCategoryName === currentCategoryName;
      })
      .slice(0, 6);
  };

  const nextSlide = () => {
    if (currentSlide < getMaxSlides()) {
      setCurrentSlide(currentSlide + 1);
    }
  };

  const previousSlide = () => {
    if (currentSlide > 0) {
      setCurrentSlide(currentSlide - 1);
    }
  };

  const getMaxSlides = () => {
    const totalProducts = getSimilarProducts().length;
    return Math.max(0, totalProducts - 2);
  };

  const toggleZoom = () => {
    setZoomLevel(zoomLevel === 1 ? 2 : 1);
  };

  const zoomIn = () => {
    setZoomLevel(Math.min(zoomLevel + 0.5, 3));
  };

  const zoomOut = () => {
    setZoomLevel(Math.max(zoomLevel - 0.5, 1));
  };

  const getProductImagesForProduct = (product: Product | null) => {
    if (!product) return ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'];
    
    const productAny = product as any;
    const allImages: string[] = [];
    
    // Add main image first
    if (product.image) {
      allImages.push(product.image);
    }
    
    // Add additional images from various possible fields
    const additionalSources = [
      productAny.additionalImages,
      productAny.images,
      productAny.gallery
    ];
    
    additionalSources.forEach(source => {
      if (Array.isArray(source)) {
        source.forEach(img => {
          if (img && typeof img === 'string' && img.trim() && !allImages.includes(img)) {
            allImages.push(img);
          }
        });
      }
    });
    
    // If we only have one image, add some sample additional images for demo
    if (allImages.length === 1 && product.image) {
      // Add some sample additional images based on the main image
      const baseUrl = product.image.split('?')[0];
      if (baseUrl.includes('unsplash.com')) {
        // Add variations of the same image with different parameters
        allImages.push(baseUrl + '?w=400&h=400&fit=crop&sat=-20');
        allImages.push(baseUrl + '?w=400&h=400&fit=crop&brightness=10');
        allImages.push(baseUrl + '?w=400&h=400&fit=crop&contrast=10');
      }
    }
    
    // Return at least one image
    return allImages.length > 0 ? allImages : ['https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'];
  };

  const getProductImages = () => {
    return getProductImagesForProduct(selectedProduct);
  };

  const changeMainImage = (imageUrl: string) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, image: imageUrl });
      const images = getProductImages();
      const newIndex = images.indexOf(imageUrl);
      if (newIndex !== -1) {
        setCurrentImageIndex(newIndex);
      }
    }
  };

  const getSizeStock = (size: string) => {
    const product = selectedProduct;
    if (!product?.sizes) return 0;
    
    // Handle new array structure with colors
    if (Array.isArray(product.sizes)) {
      const sizeData = product.sizes.find(s => s.size === size);
      if (!sizeData) return 0;
      
      // If size has colors, sum up all color stocks
      if (sizeData.colors && sizeData.colors.length > 0) {
        return sizeData.colors.reduce((total: number, color: any) => total + (color.stock || 0), 0);
      }
      
      // Otherwise use base stock
      return sizeData.stock || 0;
    }
    
    // Handle old object structure
    const sizeData = (product.sizes as any)[size];
    return typeof sizeData === 'object' ? sizeData.stock : sizeData || 0;
  };

  const getAvailableColors = (size: string) => {
    const product = selectedProduct;
    if (!product?.sizes || !Array.isArray(product.sizes)) return [];
    
    const sizeData = product.sizes.find(s => s.size === size);
    if (!sizeData || !sizeData.colors) return [];
    
    return sizeData.colors.filter((color: any) => color.stock > 0) || [];
  };

  const getColorStock = (size: string, colorName: string) => {
    const colors = getAvailableColors(size);
    const color = colors.find((c: any) => c.name === colorName);
    return color?.stock || 0;
  };

  const getColorPrice = (size: string, colorName: string) => {
    const colors = getAvailableColors(size);
    const color = colors.find((c: any) => c.name === colorName);
    return color?.price || getSizePrice(size);
  };

  const getAllAvailableColors = () => {
    const product = selectedProduct;
    if (!product?.sizes || !Array.isArray(product.sizes)) return [];
    
    const colorMap = new Map();
    product.sizes.forEach(size => {
      if (size.colors) {
        size.colors.forEach((color: any) => {
          if (color.stock > 0) {
            const key = color.name;
            if (!colorMap.has(key)) {
              colorMap.set(key, {
                name: color.name,
                code: color.code,
                sizes: [size.size]
              });
            } else {
              const existing = colorMap.get(key);
              if (!existing.sizes.includes(size.size)) {
                existing.sizes.push(size.size);
              }
            }
          }
        });
      }
    });
    
    return Array.from(colorMap.values());
  };

  const getSizesForColor = (colorName: string) => {
    const product = selectedProduct;
    if (!product?.sizes || !Array.isArray(product.sizes)) return [];
    
    const availableSizes: any[] = [];
    product.sizes.forEach(size => {
      if (size.colors) {
        const colorInSize = size.colors.find((c: any) => c.name === colorName && c.stock > 0);
        if (colorInSize) {
          availableSizes.push({
            size: size.size,
            stock: colorInSize.stock,
            price: colorInSize.price
          });
        }
      }
    });
    
    return availableSizes;
  };

  const isSizeInStock = (size: string) => {
    return getSizeStock(size) > 0;
  };

  const getSizePrice = (size: string) => {
    const product = selectedProduct;
    if (!product?.sizes) return product?.price || 0;
    
    // Handle new array structure
    if (Array.isArray(product.sizes)) {
      const sizeData = product.sizes.find(s => s.size === size);
      return sizeData?.price || product?.price || 0;
    }
    
    // Handle old object structure
    const sizeData = (product.sizes as any)[size];
    return typeof sizeData === 'object' ? sizeData.price : product?.price || 0;
  };

  const increaseQuantity = () => {
    const maxStock = selectedColor ? getColorStock(selectedSize, selectedColor) : getSizeStock(selectedSize);
    if (modalQuantity < maxStock) {
      setModalQuantity(modalQuantity + 1);
    }
  };

  const decreaseQuantity = () => {
    if (modalQuantity > 1) {
      setModalQuantity(modalQuantity - 1);
    }
  };

  const toggleBackgroundAnimation = () => {
    const newValue = !backgroundAnimation;
    setBackgroundAnimation(newValue);
    localStorage.setItem('backgroundAnimation', newValue.toString());
  };

  const loadSlides = async () => {
    try {
      const response = await fetch('/api/banners');
      if (response.ok) {
        const bannersData = await response.json();
        const activeBanners = bannersData.filter((banner: any) => banner.isActive);
        setSlides(activeBanners);
      }
    } catch (error) {
      console.error('Error loading banners:', error);
    }
  };

  const nextSlideshow = () => {
    setCurrentSlideIndex((prev) => (prev + 1) % slides.length);
  };

  const prevSlideshow = () => {
    setCurrentSlideIndex((prev) => (prev - 1 + slides.length) % slides.length);
  };

  // Auto-advance slideshow
  useEffect(() => {
    if (slides.length > 1) {
      const interval = setInterval(nextSlideshow, 5000);
      return () => clearInterval(interval);
    }
  }, [slides.length]);
  
  // Calculate delivery cost when cart changes
  useEffect(() => {
    if (mounted) {
      calculateDelivery();
    }
  }, [cart, mounted]);
  
  // Recalculate delivery when products are updated (in case cart items have outdated pricing)
  useEffect(() => {
    if (mounted && cart.length > 0) {
      // Delay to ensure products are loaded first
      const timer = setTimeout(() => {
        calculateDelivery();
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [products, mounted]);

  const getSaleTypeColor = (saleType: string) => {
    switch (saleType) {
      case 'flash_sale': return '#dc2626, #ef4444';
      case 'seasonal': return '#3b82f6, #1d4ed8';
      case 'clearance': return '#10b981, #059669';
      case 'new_arrival': return '#8b5cf6, #7c3aed';
      case 'featured': return '#f59e0b, #d97706';
      default: return '#6b7280, #4b5563';
    }
  };

  const getSaleTypeIcon = (saleType: string) => {
    switch (saleType) {
      case 'flash_sale': return '🔥';
      case 'seasonal': return '🌟';
      case 'clearance': return '💥';
      case 'new_arrival': return '✨';
      case 'featured': return '💎';
      default: return '🏷️';
    }
  };

  const addToCartFromModal = async () => {
    const product = selectedProduct;
    
    if (!product) return;
    
    // Check if we need color selection
    const allColors = getAllAvailableColors();
    if (allColors.length > 0 && !selectedColor) {
      toast.error('Please select a color before adding to cart', {
        icon: '🎨',
        duration: 3000
      });
      return;
    }
    
    // Check if we need size selection
    if (selectedColor && !selectedSize) {
      toast.error('Please select a size before adding to cart', {
        icon: '📏',
        duration: 3000
      });
      return;
    }
    
    // For products without colors, use default size if none selected
    if (allColors.length === 0 && !selectedSize) {
      setSelectedSize('M'); // Set default size
    }
    
    // For products with colors, check color-size combination stock
    if (selectedColor && selectedSize) {
      const colorStock = getColorStock(selectedSize, selectedColor);
      if (colorStock <= 0) {
        toast.error('Selected color and size combination is out of stock', {
          icon: '❌',
          duration: 3000
        });
        return;
      }
    }
    
    setCartLoading((product.id || product._id) as number);
    const finalPrice = selectedColor ? getColorPrice(selectedSize, selectedColor) : getSizePrice(selectedSize);
    const cartItem: CartItem = {
      ...product,
      size: selectedSize || 'M',
      color: selectedColor,
      quantity: modalQuantity,
      price: finalPrice,
      category: product.category,
      selectedSizeData: {
        size: selectedSize || 'M',
        stock: selectedColor ? getColorStock(selectedSize, selectedColor) : getSizeStock(selectedSize || 'M'),
        price: finalPrice
      }
    };
    
    const existing = cart.find(item => (item.id || item._id) === (product.id || product._id) && item.size === (selectedSize || 'M') && (item as any).color === selectedColor);
    let newCart;
    if (existing) {
      existing.quantity += modalQuantity;
      newCart = [...cart];
    } else {
      newCart = [...cart, cartItem];
    }
    
    console.log('Adding item to cart:', cartItem);
    console.log('New cart will have:', newCart.length, 'items');
    
    setCart(newCart);
    
    try {
      await saveCartToMongoDB(newCart);
      console.log('Cart saved successfully');
      toast.success(`${selectedProduct.name} added to cart!`, {
        icon: '🛍️',
        duration: 2000
      });
    } catch (error) {
      console.error('Failed to save cart:', error);
      toast.error('Failed to add item to cart. Please try again.', {
        icon: '⚠️',
        duration: 4000
      });
    }
    
    setCartLoading(null);
    closeProductModal();
  };

  return (
    <div className="client-app" style={{position: 'relative', overflow: 'hidden'}}>
      {/* Countdown Animations */}
      <style jsx>{`
        @keyframes pulse {
          0%, 100% { transform: scale(1); opacity: 1; }
          50% { transform: scale(1.05); opacity: 0.8; }
        }
        
        @keyframes glow {
          0%, 100% { box-shadow: 0 0 5px rgba(239, 68, 68, 0.5); }
          50% { box-shadow: 0 0 20px rgba(239, 68, 68, 0.8), 0 0 30px rgba(239, 68, 68, 0.6); }
        }
        
        .navbar-countdown {
          animation: glow 3s ease-in-out infinite;
        }
        
        .discount-countdown .time-unit {
          transition: all 0.3s ease;
        }
        
        .discount-countdown .time-unit:hover {
          transform: scale(1.1);
        }
      `}</style>
      
      {/* Background Animation */}
      {backgroundAnimation && (
        <div className="background-animation" style={{
          position: 'fixed',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          zIndex: -1,
          background: 'linear-gradient(45deg, #22c55e 0%, #16a34a 50%, #1a1a1a 100%)',
          opacity: 0.05
        }}>
          <div className="floating-elements">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="floating-element" style={{
                position: 'absolute',
                width: `${15 + i * 3}px`,
                height: `${15 + i * 3}px`,
                background: i % 2 === 0 ? '#22c55e' : '#1a1a1a',
                borderRadius: i % 3 === 0 ? '50%' : '20%',
                left: `${5 + i * 8}%`,
                top: `${10 + (i * 7) % 80}%`,
                animation: `float ${4 + i * 0.3}s ease-in-out infinite`,
                animationDelay: `${i * 0.15}s`,
                opacity: 0.4
              }} />
            ))}
          </div>
          <style jsx>{`
            @keyframes float {
              0%, 100% { transform: translateY(0px) rotate(0deg) scale(1); }
              33% { transform: translateY(-15px) rotate(120deg) scale(1.1); }
              66% { transform: translateY(-5px) rotate(240deg) scale(0.9); }
            }
          `}</style>
        </div>
      )}
      {/* Navigation */}
      <nav className="navbar navbar-expand-lg navbar-light bg-white shadow-lg" style={{zIndex: 1050, position: 'relative'}}>
        <div className="container">
          <a className="navbar-brand fw-bold fs-3 text-dark">
            <img src="/logo.png" alt="Fashion Breeze" style={{height: '45px', width: 'auto', objectFit: 'contain', background: 'rgba(255,255,255,0.9)', padding: '5px', borderRadius: '8px', marginRight: '10px'}} />
            Fashion Breeze
          </a>

          <button className="navbar-toggler" type="button" data-bs-toggle="collapse" data-bs-target="#navbarNav">
            <span className="navbar-toggler-icon"></span>
          </button>

          <div className="collapse navbar-collapse" id="navbarNav">
            <ul className="navbar-nav me-auto">
              <li className="nav-item">
                <a className="nav-link text-dark" href="#products-section" onClick={scrollToProducts}>
                  <i className="bi bi-bag me-1"></i>Products
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/about">
                  <i className="bi bi-info-circle me-1"></i>About Us
                </a>
              </li>
              <li className="nav-item">
                <a className="nav-link text-dark" href="/contact">
                  <i className="bi bi-telephone me-1"></i>Contact Us
                </a>
              </li>
            </ul>

            <div className="d-flex align-items-center gap-3">
              {/* Compact Countdown in Navbar */}
              <div className="d-none d-lg-block">
                <div className="navbar-countdown d-flex align-items-center px-3 py-1 rounded-pill" style={{
                  background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                  color: 'white',
                  fontSize: '0.8rem',
                  fontWeight: '600',
                  boxShadow: '0 2px 8px rgba(239, 68, 68, 0.3)',
                  animation: 'pulse 2s infinite'
                }}>
                  <i className="bi bi-clock me-2" style={{ fontSize: '0.9rem' }}></i>
                  <span>Sale ends in: </span>
                  <span className="ms-1 fw-bold">
                    {(() => {
                      const endTime = new Date(Date.now() + 2 * 60 * 60 * 1000); // 2 hours from now
                      const now = new Date();
                      const diff = endTime.getTime() - now.getTime();
                      const hours = Math.floor(diff / (1000 * 60 * 60));
                      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
                      return `${hours}h ${minutes}m`;
                    })()
                  }
                  </span>
                </div>
              </div>
              
              {mounted && isUserRegistered() ? (
                <div className="dropdown">
                  <button className="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-2"></i>{getUserName()}
                  </button>
                  <ul className="dropdown-menu" style={{zIndex: 1060}}>
                    <li><a className="dropdown-item" href="/profile">
                      <i className="bi bi-person me-2"></i>My Profile
                    </a></li>
                    {isAdmin && (
                      <>
                        <li><hr className="dropdown-divider" /></li>
                        <li><button className="dropdown-item" onClick={toggleBackgroundAnimation}>
                          <i className={`bi ${backgroundAnimation ? 'bi-eye-slash' : 'bi-eye'} me-2`}></i>
                          {backgroundAnimation ? 'Disable' : 'Enable'} Summer Animation
                        </button></li>
                      </>
                    )}
                    <li><hr className="dropdown-divider" /></li>
                    <li><a className="dropdown-item" href="#" onClick={() => {
                      localStorage.clear();
                      window.location.reload();
                    }}>
                      <i className="bi bi-box-arrow-right me-2"></i>Logout
                    </a></li>
                  </ul>
                </div>
              ) : (
                <div className="d-flex gap-2">
                  <a href="/login" className="btn btn-outline-dark">
                    <i className="bi bi-box-arrow-in-right me-2"></i>Login
                  </a>
                  <a href="/register" className="btn btn-outline-dark">
                    <i className="bi bi-person-plus me-2"></i>Register
                  </a>
                </div>
              )}
              <button className="btn position-relative" onClick={() => setShowCart(!showCart)} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '12px', color: 'white', fontWeight: '600', padding: '0.5rem 1.2rem', boxShadow: '0 4px 15px rgba(102, 126, 234, 0.3)'}}>
                <i className="bi bi-bag-check me-2"></i>Cart
                {cart.length > 0 && (
                  <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-warning text-dark" style={{fontSize: '0.7rem', fontWeight: '700'}}>
                    {cart.length}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Promotion Banner with Countdown */}
      <div className="promotion-banner py-4" style={{
        background: 'linear-gradient(135deg, #1a1a1a 0%, #22c55e 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="position-absolute w-100 h-100" style={{
          background: 'url("data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.05"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")',
          opacity: 0.1
        }}></div>
        <div className="container position-relative">
          <div className="row align-items-center g-4">
            <div className="col-lg-6">
              <div className="d-flex align-items-center">
                <div className="promotion-icon me-3 d-flex align-items-center justify-content-center" style={{
                  width: '50px',
                  height: '50px',
                  background: 'rgba(255,255,255,0.2)',
                  borderRadius: '50%',
                  backdropFilter: 'blur(10px)'
                }}>
                  <i className="bi bi-lightning-charge-fill" style={{fontSize: '1.5rem'}}></i>
                </div>
                <div>
                  <div className="d-flex align-items-center mb-1">
                    <span className="fw-bold me-3" style={{fontSize: '1.1rem'}}>🎉 SPECIAL OFFER:</span>
                    <span className="badge px-3 py-1" style={{
                      background: 'rgba(255,255,255,0.2)',
                      borderRadius: '15px',
                      fontSize: '0.8rem'
                    }}>LIMITED TIME</span>
                  </div>
                  <span style={{fontSize: '0.95rem', opacity: 0.9}}>Up to 70% OFF + FREE Shipping on orders over ₹5000!</span>
                </div>
              </div>
            </div>
            <div className="col-lg-3">
              <div className="promo-code p-2 rounded" style={{
                background: 'rgba(255,255,255,0.15)',
                backdropFilter: 'blur(10px)',
                border: '1px solid rgba(255,255,255,0.2)'
              }}>
                <small className="d-block mb-1">Use promo code:</small>
                <strong style={{fontSize: '1.1rem', letterSpacing: '1px'}}>FASHION70</strong>
              </div>
            </div>
            <div className="col-lg-3">
              <DiscountCountdown 
                endDate={new Date(Date.now() + 2 * 24 * 60 * 60 * 1000)} // 2 days from now
                discountPercentage={70}
                title="FLASH SALE"
                style={{ margin: 0, padding: '1rem' }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Mega Sale Countdown Banner */}
      <div className="mega-sale-banner py-4" style={{
        background: 'linear-gradient(135deg, #dc2626 0%, #ef4444 50%, #f97316 100%)',
        color: 'white',
        position: 'relative',
        overflow: 'hidden'
      }}>
        <div className="container">
          <div className="row align-items-center justify-content-center">
            <div className="col-lg-8 text-center">
              <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                <h2 className="fw-bold mb-3" style={{ fontSize: '2.5rem' }}>
                  🔥 MEGA SALE EVENT 🔥
                </h2>
                <p className="lead mb-4">Don't miss out on our biggest sale of the year!</p>
                <DiscountCountdown 
                  endDate={new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)} // 5 days from now
                  discountPercentage={80}
                  title="MEGA SALE"
                  style={{ 
                    maxWidth: '500px', 
                    margin: '0 auto',
                    background: 'linear-gradient(135deg, #1f2937 0%, #374151 100%)',
                    boxShadow: '0 20px 60px rgba(0,0,0,0.4)'
                  }}
                />
              </motion.div>
            </div>
          </div>
        </div>
      </div>

      {/* Hero Section */}
      <div className="hero-section" style={{
        background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
        minHeight: '70vh',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        overflow: 'hidden'
      }}>
        {/* Animated Background Elements */}
        <div className="position-absolute w-100 h-100" style={{opacity: 0.1}}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="position-absolute rounded-circle" style={{
              width: `${100 + i * 50}px`,
              height: `${100 + i * 50}px`,
              background: 'white',
              left: `${10 + i * 15}%`,
              top: `${20 + i * 10}%`,
              animation: `float ${3 + i * 0.5}s ease-in-out infinite`,
              animationDelay: `${i * 0.2}s`
            }} />
          ))}
        </div>
        
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6">
              <motion.div 
                className="hero-content text-white"
                initial={{ opacity: 0, x: -50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, ease: "easeOut" }}
              >
                <h1 className="display-3 fw-bold mb-4" style={{
                  background: 'linear-gradient(45deg, #ffffff, #f8f9fa)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  textShadow: 'none'
                }}>
                  Fashion Breeze
                </h1>
                <p className="lead mb-4" style={{fontSize: '1.3rem', opacity: 0.9}}>
                  Discover the latest trends in fashion with our premium collection of clothing and accessories.
                </p>
                <div className="d-flex flex-wrap gap-3 mb-4">
                  <div className="feature-badge d-flex align-items-center px-3 py-2 rounded-pill" style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="bi bi-truck me-2"></i>
                    <span>Free Shipping</span>
                  </div>
                  <div className="feature-badge d-flex align-items-center px-3 py-2 rounded-pill" style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="bi bi-shield-check me-2"></i>
                    <span>Quality Guaranteed</span>
                  </div>
                  <div className="feature-badge d-flex align-items-center px-3 py-2 rounded-pill" style={{
                    background: 'rgba(255,255,255,0.2)',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="bi bi-arrow-clockwise me-2"></i>
                    <span>Easy Returns</span>
                  </div>
                </div>
                <div className="d-flex gap-3">
                  <button 
                    className="btn btn-light btn-lg px-4 py-3"
                    onClick={scrollToProducts}
                    style={{
                      borderRadius: '15px',
                      fontWeight: '600',
                      boxShadow: '0 8px 25px rgba(0,0,0,0.2)',
                      transition: 'all 0.3s ease'
                    }}
                  >
                    <i className="bi bi-bag-check me-2"></i>Shop Now
                  </button>
                  <button 
                    className="btn btn-outline-light btn-lg px-4 py-3"
                    onClick={() => window.location.href = '/about'}
                    style={{
                      borderRadius: '15px',
                      fontWeight: '600',
                      borderWidth: '2px'
                    }}
                  >
                    <i className="bi bi-info-circle me-2"></i>Learn More
                  </button>
                </div>
              </motion.div>
            </div>
            <div className="col-lg-6">
              <motion.div
                className="hero-image position-relative"
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
              >
                {slides.length > 0 ? (
                  <div className="slideshow-container" style={{borderRadius: '20px', overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
                    {slides.map((slide, index) => (
                      <div 
                        key={slide._id}
                        className="slide"
                        style={{
                          display: index === currentSlideIndex ? 'block' : 'none',
                          position: 'relative'
                        }}
                      >
                        <img 
                          src={slide.image} 
                          alt={slide.title}
                          style={{
                            width: '100%',
                            height: '400px',
                            objectFit: 'cover'
                          }}
                        />
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="placeholder-image d-flex align-items-center justify-content-center" style={{
                    height: '400px',
                    background: 'rgba(255,255,255,0.1)',
                    borderRadius: '20px',
                    backdropFilter: 'blur(10px)'
                  }}>
                    <i className="bi bi-image" style={{fontSize: '4rem', opacity: 0.5}}></i>
                  </div>
                )}
              </motion.div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Promotional Slideshow */}
      {slides.length > 0 && (
        <div className="slideshow-container d-none" style={{position: 'relative', height: '400px', overflow: 'hidden'}}>
          <div className="slideshow-wrapper" style={{position: 'relative', width: '100%', height: '100%'}}>
          
            {/* Navigation Arrows */}
            {slides.length > 1 && (
              <>
                <button 
                  className="btn position-absolute start-0 top-50 translate-middle-y ms-3"
                  onClick={prevSlideshow}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className="bi bi-chevron-left" style={{fontSize: '1.5rem'}}></i>
                </button>
                <button 
                  className="btn position-absolute end-0 top-50 translate-middle-y me-3"
                  onClick={nextSlideshow}
                  style={{
                    background: 'rgba(255,255,255,0.2)',
                    border: '2px solid rgba(255,255,255,0.3)',
                    color: 'white',
                    width: '60px',
                    height: '60px',
                    borderRadius: '50%',
                    backdropFilter: 'blur(10px)',
                    zIndex: 10,
                    transition: 'all 0.3s ease'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.3)';
                    e.currentTarget.style.transform = 'scale(1.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                    e.currentTarget.style.transform = 'scale(1)';
                  }}
                >
                  <i className="bi bi-chevron-right" style={{fontSize: '1.5rem'}}></i>
                </button>
              </>
            )}
            
            {/* Slide Indicators */}
            {slides.length > 1 && (
              <div className="position-absolute bottom-0 start-50 translate-middle-x mb-4">
                <div className="d-flex gap-2">
                  {slides.map((_, index) => (
                    <button
                      key={index}
                      className="btn p-0"
                      onClick={() => setCurrentSlideIndex(index)}
                      style={{
                        width: '12px',
                        height: '12px',
                        borderRadius: '50%',
                        border: '2px solid white',
                        background: index === currentSlideIndex ? 'white' : 'transparent',
                        transition: 'all 0.3s ease'
                      }}
                    />
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Success Alert */}
      {orderPlaced && (
        <div className="container mt-3">
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Success!</strong> Your order has been placed successfully!
          </div>
        </div>
      )}

      {/* Error Alert */}
      {error && (
        <div className="container mt-3">
          <div className="alert alert-danger alert-dismissible fade show" role="alert">
            <i className="bi bi-exclamation-triangle-fill me-2"></i>
            <strong>Error!</strong> {error}
            <button type="button" className="btn-close" onClick={() => setError('')}></button>
          </div>
        </div>
      )}



      {/* Stats Section */}
      <div className="py-5" style={{background: '#f8f9fa'}}>
        <div className="container">
          <div className="row g-4 text-center">
            <div className="col-md-3 col-6">
              <div className="stat-card p-4 h-100" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div className="stat-icon mb-3">
                  <i className="bi bi-people-fill" style={{fontSize: '2.5rem', color: '#667eea'}}></i>
                </div>
                <h3 className="fw-bold mb-1" style={{color: '#2c3e50'}}>10K+</h3>
                <p className="text-muted mb-0">Happy Customers</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4 h-100" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div className="stat-icon mb-3">
                  <i className="bi bi-bag-check-fill" style={{fontSize: '2.5rem', color: '#22c55e'}}></i>
                </div>
                <h3 className="fw-bold mb-1" style={{color: '#2c3e50'}}>500+</h3>
                <p className="text-muted mb-0">Products</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4 h-100" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div className="stat-icon mb-3">
                  <i className="bi bi-truck" style={{fontSize: '2.5rem', color: '#f59e0b'}}></i>
                </div>
                <h3 className="fw-bold mb-1" style={{color: '#2c3e50'}}>24/7</h3>
                <p className="text-muted mb-0">Fast Delivery</p>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div className="stat-card p-4 h-100" style={{
                background: 'white',
                borderRadius: '15px',
                boxShadow: '0 5px 15px rgba(0,0,0,0.08)',
                border: '1px solid #e9ecef'
              }}>
                <div className="stat-icon mb-3">
                  <i className="bi bi-star-fill" style={{fontSize: '2.5rem', color: '#ef4444'}}></i>
                </div>
                <h3 className="fw-bold mb-1" style={{color: '#2c3e50'}}>4.9</h3>
                <p className="text-muted mb-0">Rating</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Category Navigation */}
      <div className="py-4" style={{background: 'linear-gradient(135deg, #22c55e 0%, #16a34a 100%)', boxShadow: '0 4px 20px rgba(34, 197, 94, 0.3)', position: 'sticky', top: 0, zIndex: 1040}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {categories.map(category => (
                  <button 
                    key={category}
                    className={`btn fw-bold ${selectedCategory === category ? 'btn-light' : 'btn-outline-light text-white'}`}
                    onClick={() => {
                      setSelectedCategory(category);
                      setTimeout(() => {
                        const productsSection = document.getElementById('products-section');
                        if (productsSection) {
                          productsSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
                        }
                      }, 100);
                    }}
                    style={{
                      transition: 'all 0.3s ease',
                      minWidth: '100px',
                      borderRadius: '25px',
                      padding: '10px 20px',
                      color: selectedCategory === category ? '#333' : 'white',
                      border: selectedCategory === category ? 'none' : '2px solid rgba(255,255,255,0.3)'
                    }}
                  >
                    {category}
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Products Section */}
      <div id="products-section" className="py-5" style={{background: 'var(--light-color)', position: 'relative', overflow: 'hidden'}}>
        <div className="container-fluid" style={{position: 'relative', zIndex: 2}}>
          <div className="row mb-4">
            <div className="col-12">
              {/* Enhanced Search and Filters Bar */}
              <div className="card border-0 shadow-lg mb-4" style={{ borderRadius: '20px', background: 'linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%)' }}>
                <div className="card-header bg-success text-white" style={{ borderRadius: '20px 20px 0 0' }}>
                  <h5 className="mb-0"><i className="bi bi-funnel me-2"></i>Search & Filter Products</h5>
                </div>
                <div className="card-body p-4">
                  <div className="row g-4">
                    {/* Search Section */}
                    <div className="col-lg-4">
                      <label className="form-label fw-bold mb-2">Search Products</label>
                      <div className="input-group">
                        <span className="input-group-text bg-success text-white">
                          <i className="bi bi-search"></i>
                        </span>
                        <input 
                          type="text" 
                          className="form-control" 
                          placeholder="Search by name, code, or category..."
                          value={searchTerm}
                          onChange={(e) => setSearchTerm(e.target.value)}
                          style={{ borderRadius: '0 10px 10px 0' }}
                        />
                      </div>
                    </div>
                    
                    {/* Category Filter */}
                    <div className="col-lg-3">
                      <label className="form-label fw-bold mb-2">Category</label>
                      <select 
                        className="form-select" 
                        value={selectedCategory} 
                        onChange={(e) => setSelectedCategory(e.target.value)}
                        style={{ borderRadius: '10px' }}
                      >
                        {categories.map(category => (
                          <option key={category} value={category}>{category}</option>
                        ))}
                      </select>
                    </div>
                    
                    {/* Price Range */}
                    <div className="col-lg-5">
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <label className="form-label fw-bold mb-0">Price Range</label>
                        <span className="badge bg-success px-3 py-2" style={{ borderRadius: '15px' }}>
                          LKR {priceRange.min.toLocaleString()} - LKR {priceRange.max.toLocaleString()}
                        </span>
                      </div>
                      <div className="row g-2">
                        <div className="col-6">
                          <label className="form-label small">Min: LKR {priceRange.min.toLocaleString()}</label>
                          <input 
                            type="range" 
                            className="form-range"
                            min="0" 
                            max={maxPrice}
                            value={priceRange.min}
                            onChange={(e) => setPriceRange({...priceRange, min: +e.target.value})}
                          />
                        </div>
                        <div className="col-6">
                          <label className="form-label small">Max: LKR {priceRange.max.toLocaleString()}</label>
                          <input 
                            type="range" 
                            className="form-range"
                            min="0" 
                            max={maxPrice}
                            value={priceRange.max}
                            onChange={(e) => setPriceRange({...priceRange, max: +e.target.value})}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Filter Actions */}
                  <div className="row mt-4">
                    <div className="col-md-6">
                      <div className="d-flex align-items-center gap-3">
                        <span className="text-muted fw-bold">Results:</span>
                        <span className="badge bg-primary px-3 py-2" style={{ fontSize: '0.9rem' }}>
                          {getFilteredProducts.length} of {products.length} products
                        </span>
                      </div>
                    </div>
                    <div className="col-md-6 text-end">
                      <button 
                        className="btn btn-outline-success"
                        onClick={() => {
                          setSearchTerm('');
                          setSelectedCategory('All');
                          setPriceRange({ min: 0, max: maxPrice });
                        }}
                        style={{ borderRadius: '10px' }}
                      >
                        <i className="bi bi-arrow-clockwise me-2"></i>Clear All Filters
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="row">
            {/* Left Sidebar - Featured Categories */}
            <div className="col-lg-2 d-none d-lg-block">
              <div className="position-sticky" style={{top: '20px'}}>
                <div className="sidebar-card mb-4" style={{
                  background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                  borderRadius: '15px',
                  padding: '20px',
                  color: 'white',
                  boxShadow: '0 10px 30px rgba(34, 197, 94, 0.3)'
                }}>
                  <h6 className="fw-bold mb-3 text-center">
                    <i className="bi bi-star-fill me-2"></i>Featured
                  </h6>
                  <div className="featured-categories">
                    {categories.slice(1, 4).map((category, index) => (
                      <button
                        key={category}
                        className="btn btn-outline-light btn-sm w-100 mb-2"
                        onClick={() => {
                          setSelectedCategory(category);
                          scrollToProducts();
                        }}
                        style={{
                          borderRadius: '10px',
                          fontSize: '0.8rem',
                          padding: '8px 12px',
                          border: '1px solid rgba(255,255,255,0.3)',
                          transition: 'all 0.3s ease'
                        }}
                      >
                        {category}
                      </button>
                    ))}
                  </div>
                  <div className="text-center mt-3 pt-3" style={{borderTop: '1px solid rgba(255,255,255,0.2)'}}>
                    <small className="d-block mb-2">Special Offer</small>
                    <div className="badge px-3 py-2" style={{
                      background: 'rgba(255,255,255,0.2)',
                      fontSize: '0.7rem',
                      borderRadius: '12px'
                    }}>
                      🎁 Free Shipping
                    </div>
                  </div>
                </div>
                
                {/* Sidebar Countdown */}
                <DiscountCountdown 
                  endDate={new Date(Date.now() + 6 * 60 * 60 * 1000)} // 6 hours from now
                  discountPercentage={50}
                  title="WEEKEND DEAL"
                  style={{ fontSize: '0.8rem' }}
                />
              </div>
            </div>
            
            <div className="col-lg-10">
              <div className="text-center mb-5">
                <div className="section-header mb-5">
                  <span className="badge px-4 py-2 mb-3" style={{
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    fontSize: '0.9rem',
                    borderRadius: '25px',
                    color: 'white'
                  }}>FEATURED COLLECTION</span>
                  <h2 className="display-4 fw-bold mb-4" style={{
                    background: 'linear-gradient(135deg, #1a1a1a, #333333)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent'
                  }}>Premium Fashion Collection</h2>
                  <div className="mx-auto mb-4" style={{
                    width: '100px',
                    height: '4px',
                    background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                    borderRadius: '2px'
                  }}></div>
                  <p className="lead text-muted mx-auto" style={{maxWidth: '600px'}}>
                    Discover our carefully curated selection of premium fashion items, 
                    designed to elevate your style with quality and sophistication.
                  </p>
                </div>
              </div>



              {loading && products.length === 0 ? (
                <div className="text-center py-5" style={{minHeight: '600px'}}>
                  <div className="d-flex justify-content-center align-items-center mb-4">
                    <div className="spinner-border text-primary me-3" role="status" style={{width: '3rem', height: '3rem'}}>
                      <span className="visually-hidden">Loading...</span>
                    </div>
                    <div>
                      <h5 className="mb-1">Loading Premium Collection</h5>
                      <p className="text-muted mb-0">Fetching the latest fashion trends...</p>
                    </div>
                  </div>
                  <div className="row g-3">
                    {[1,2,3,4,5,6].map(i => (
                      <div key={i} className="col-xl-3 col-lg-4 col-md-6">
                        <div className="card border-0" style={{borderRadius: '20px', overflow: 'hidden', height: '450px'}}>
                          <div className="placeholder-glow">
                            <div className="placeholder" style={{height: '300px', background: 'linear-gradient(45deg, #f8f9fa, #e9ecef)'}}></div>
                          </div>
                          <div className="card-body p-4">
                            <div className="placeholder-glow">
                              <div className="placeholder col-8 mb-2"></div>
                              <div className="placeholder col-6 mb-3"></div>
                              <div className="placeholder col-4"></div>
                            </div>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="premium-products-grid" style={{minHeight: '600px'}}>
                  <div className="row g-4" style={{minHeight: '500px'}}>
                    <AnimatePresence mode="wait">
                      {getFilteredProducts.map((product, index) => (
                        <motion.div 
                          key={product.id} 
                          className="col-xl-3 col-lg-4 col-md-6"
                          initial={{ opacity: 0, y: 20 }}
                          animate={{ opacity: 1, y: 0 }}
                          exit={{ opacity: 0, y: -20 }}
                          transition={{ 
                            duration: 0.4, 
                            delay: index * 0.1,
                            ease: "easeOut"
                          }}
                        >
                        <div className={`premium-product-card ${product.status === 'outofstock' ? 'out-of-stock' : ''}`}
                             onMouseEnter={(e) => {
                               e.currentTarget.style.transform = 'translateY(-8px)';
                               e.currentTarget.style.boxShadow = '0 20px 60px rgba(0,0,0,0.15)';
                             }}
                             onMouseLeave={(e) => {
                               e.currentTarget.style.transform = 'translateY(0)';
                               e.currentTarget.style.boxShadow = '0 10px 40px rgba(0,0,0,0.08)';
                             }}
                             onClick={() => openProductModal(product)}
                             style={{
                               background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)',
                               borderRadius: '24px',
                               overflow: 'hidden',
                               border: '1px solid rgba(0,0,0,0.08)',
                               boxShadow: '0 10px 40px rgba(0,0,0,0.08)',
                               transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                               position: 'relative',
                               height: '100%',
                               cursor: 'pointer',
                               opacity: (() => {
                                 const isOutOfStock = product.status === 'outofstock' || (
                                   product.status !== 'active' && product.status !== 'instock'
                                 ) || (
                                   product.sizes && (
                                     (typeof product.sizes === 'object' && 
                                      Object.keys(product.sizes).length > 0 &&
                                      !Object.values(product.sizes).some((stock: any) => 
                                        typeof stock === 'number' ? stock > 0 : 
                                        (stock?.stock || 0) > 0
                                      )) ||
                                     (Array.isArray(product.sizes) && 
                                      product.sizes.length > 0 &&
                                      !product.sizes.some(size => 
                                        size.stock > 0 || 
                                        (size.colors && size.colors.some((color: any) => color.stock > 0))
                                      ))
                                   )
                                 );
                                 return isOutOfStock ? 0.6 : 1;
                               })()
                             }}>
                          
                          {/* Product Image Section */}
                          <div className="position-relative" style={{overflow: 'hidden', borderRadius: '24px 24px 0 0'}}>
                            <div className="product-image-container" style={{position: 'relative', paddingBottom: '75%', background: 'linear-gradient(135deg, #f8f9fa, #e9ecef)'}}>
                              <ImageWithFallback 
                                src={product.image} 
                                alt={product.name} 
                                style={{
                                  position: 'absolute',
                                  top: 0,
                                  left: 0,
                                  width: '100%',
                                  height: '100%',
                                  objectFit: 'cover',
                                  transition: 'transform 0.6s cubic-bezier(0.4, 0, 0.2, 1)'
                                }}
                              />
                            </div>
                            
                            {/* Overlay Elements */}
                            <div className="position-absolute top-0 start-0 w-100 h-100" style={{background: 'linear-gradient(180deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0.1) 100%)'}}></div>
                            
                            {/* Discount Badge with Countdown */}
                            {(product as any).discount && (
                              <div className="position-absolute top-0 end-0 m-3">
                                {(product as any).saleEndDate ? (
                                  <div style={{ width: '120px' }}>
                                    <DiscountCountdown 
                                      endDate={new Date((product as any).saleEndDate)}
                                      discountPercentage={(product as any).discount}
                                      title="SALE"
                                      style={{ 
                                        padding: '0.5rem', 
                                        fontSize: '0.7rem',
                                        background: 'linear-gradient(135deg, #ef4444, #dc2626)'
                                      }}
                                    />
                                  </div>
                                ) : (
                                  <div className="discount-badge" style={{
                                    background: 'linear-gradient(135deg, #ef4444, #dc2626)',
                                    color: 'white',
                                    padding: '8px 16px',
                                    borderRadius: '20px',
                                    fontSize: '0.8rem',
                                    fontWeight: '700',
                                    boxShadow: '0 4px 15px rgba(239, 68, 68, 0.4)',
                                    animation: 'pulse 2s infinite'
                                  }}>
                                    -{(product as any).discount}% OFF
                                  </div>
                                )}
                              </div>
                            )}
                            
                            {/* Product Code */}
                            <div className="position-absolute top-0 start-0 m-3">
                              <span className="product-code" style={{
                                background: 'rgba(255,255,255,0.95)',
                                color: '#1f2937',
                                padding: '6px 12px',
                                borderRadius: '12px',
                                fontSize: '0.75rem',
                                fontWeight: '600',
                                backdropFilter: 'blur(10px)',
                                border: '1px solid rgba(255,255,255,0.2)'
                              }}>
                                #{product.code}
                              </span>
                            </div>
                            
                            {/* Flash Sale Badge */}
                            {(product as any).flashSale && (
                              <div className="position-absolute bottom-0 start-0 m-3">
                                <DiscountCountdown 
                                  endDate={new Date(Date.now() + 3 * 60 * 60 * 1000)} // 3 hours from now
                                  discountPercentage={30}
                                  title="FLASH"
                                  style={{ 
                                    padding: '0.5rem', 
                                    fontSize: '0.6rem',
                                    width: '100px',
                                    background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)'
                                  }}
                                />
                              </div>
                            )}
                            
                            {/* Brand Label */}
                            <div className="position-absolute top-50 start-0 translate-middle-y">
                              <div className="brand-label" style={{
                                background: 'linear-gradient(135deg, #1f2937, #374151)',
                                color: 'white',
                                padding: '8px 4px',
                                borderRadius: '0 8px 8px 0',
                                fontSize: '0.7rem',
                                fontWeight: '700',
                                letterSpacing: '0.5px',
                                writingMode: 'vertical-rl',
                                textOrientation: 'mixed',
                                boxShadow: '2px 0 8px rgba(0,0,0,0.2)',
                                minHeight: '60px',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                              }}>
                                {(product as any).brand || 'FASHION BREEZE'}
                              </div>
                            </div>
                            
                            {/* Action Buttons Overlay */}
                            <div className="position-absolute bottom-0 start-0 end-0 p-3 d-flex gap-2 opacity-0" 
                                 style={{
                                   background: 'linear-gradient(180deg, transparent 0%, rgba(0,0,0,0.7) 100%)',
                                   transition: 'opacity 0.3s ease'
                                 }}>
                              <button className="btn btn-sm flex-fill" 
                                      style={{
                                        background: 'linear-gradient(135deg, #10b981, #059669)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: 'white',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        padding: '8px 12px',
                                        boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                                      }}
                                      onClick={(e) => { e.stopPropagation(); openProductModal(product); }}>
                                <i className="bi bi-cart-plus me-1"></i>Add to Cart
                              </button>
                              <button className="btn btn-sm" 
                                      style={{
                                        background: 'rgba(255,255,255,0.9)',
                                        border: 'none',
                                        borderRadius: '8px',
                                        color: '#1f2937',
                                        fontWeight: '600',
                                        fontSize: '0.8rem',
                                        padding: '8px 12px',
                                        backdropFilter: 'blur(10px)',
                                        boxShadow: '0 4px 15px rgba(0,0,0,0.1)'
                                      }}
                                      onClick={(e) => { e.stopPropagation(); openProductModal(product); }}>
                                <i className="bi bi-eye me-1"></i>Details
                              </button>
                            </div>
                          </div>
                          
                          {/* Product Details Section */}
                          <div className="card-body p-4" style={{background: 'linear-gradient(145deg, #ffffff 0%, #f8f9fa 100%)'}}>
                            {/* Product Title & Category */}
                            <div className="mb-3">
                              <div className="d-flex align-items-start justify-content-between mb-2">
                                <h5 className="product-title mb-0" style={{
                                  fontSize: '1.1rem',
                                  fontWeight: '700',
                                  color: '#1f2937',
                                  lineHeight: 1.3,
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {product.name}
                                </h5>
                                <div className="ms-2">
                                  <span className="category-badge" style={{
                                    background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                    color: 'white',
                                    fontSize: '0.7rem',
                                    padding: '4px 10px',
                                    borderRadius: '12px',
                                    fontWeight: '600',
                                    whiteSpace: 'nowrap'
                                  }}>
                                    {getCategoryName(product.category)}
                                  </span>
                                </div>
                              </div>
                              
                              {/* Rating */}
                              <div className="d-flex align-items-center mb-2">
                                <div className="rating-stars me-2">
                                  {getStars(typeof product.rating === 'object' ? (product.rating as any).average : product.rating || 0).map((star, index) => (
                                    <i key={index} className={`bi ${star}`} style={{fontSize: '0.9rem', color: '#fbbf24'}}></i>
                                  ))}
                                </div>
                                <span className="rating-text" style={{fontSize: '0.85rem', color: '#6b7280', fontWeight: '500'}}>
                                  {typeof product.rating === 'object' ? (product.rating as any).average : product.rating || 0} ({product.reviewCount || 0} reviews)
                                </span>
                              </div>
                              
                              {/* Description Preview */}
                              {product.description && (
                                <p className="product-description" style={{
                                  fontSize: '0.85rem',
                                  color: '#6b7280',
                                  lineHeight: 1.5,
                                  margin: '0 0 12px 0',
                                  display: '-webkit-box',
                                  WebkitLineClamp: 2,
                                  WebkitBoxOrient: 'vertical',
                                  overflow: 'hidden'
                                }}>
                                  {product.description}
                                </p>
                              )}
                              
                              {/* Specifications Preview */}
                              {(product as any).specifications && (
                                <div className="specifications-preview mb-3">
                                  <div className="d-flex flex-wrap gap-1">
                                    {(product as any).specifications?.material && (
                                      <span className="spec-badge" style={{
                                        background: 'rgba(34, 197, 94, 0.1)',
                                        color: '#059669',
                                        fontSize: '0.7rem',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        border: '1px solid rgba(34, 197, 94, 0.2)'
                                      }}>
                                        <i className="bi bi-patch-check me-1"></i>{(product as any).specifications.material}
                                      </span>
                                    )}
                                    {(product as any).specifications?.origin && (
                                      <span className="spec-badge" style={{
                                        background: 'rgba(59, 130, 246, 0.1)',
                                        color: '#2563eb',
                                        fontSize: '0.7rem',
                                        padding: '4px 8px',
                                        borderRadius: '8px',
                                        fontWeight: '500',
                                        border: '1px solid rgba(59, 130, 246, 0.2)'
                                      }}>
                                        <i className="bi bi-geo me-1"></i>{(product as any).specifications.origin}
                                      </span>
                                    )}
                                  </div>
                                </div>
                              )}
                            </div>
                            
                            {/* Price Section */}
                            <div className="price-section mb-4">
                              <div className="d-flex align-items-center justify-content-between">
                                <div className="price-info">
                                  <div className="current-price" style={{
                                    fontSize: '1.5rem',
                                    fontWeight: '800',
                                    color: '#059669',
                                    lineHeight: 1
                                  }}>
                                    LKR {product.price.toLocaleString()}
                                  </div>
                                  <small className="price-note" style={{color: '#6b7280', fontSize: '0.75rem'}}>Inclusive of all taxes</small>
                                </div>
                                <div className="stock-info text-end">
                                  {(() => {
                                    // Check if product is in stock - accept both 'active' and 'instock' status
                                    const isInStock = (product.status === 'instock' || product.status === 'active') && (
                                      !product.sizes || // No size restrictions
                                      (product.sizes && typeof product.sizes === 'object' && 
                                       Object.values(product.sizes).some((stock: any) => 
                                         typeof stock === 'number' ? stock > 0 : 
                                         (stock?.stock || 0) > 0
                                       )) ||
                                      (Array.isArray(product.sizes) && 
                                       product.sizes.some(size => 
                                         size.stock > 0 || 
                                         (size.colors && size.colors.some((color: any) => color.stock > 0))
                                       ))
                                    );
                                    return (
                                      <>
                                        <div className="stock-badge d-flex align-items-center" style={{
                                          background: isInStock ? 
                                            'linear-gradient(135deg, #10b981, #059669)' : 
                                            'linear-gradient(135deg, #ef4444, #dc2626)',
                                          color: 'white',
                                          fontSize: '0.7rem',
                                          padding: '6px 12px',
                                          borderRadius: '12px',
                                          fontWeight: '600',
                                          boxShadow: isInStock ? 
                                            '0 2px 8px rgba(16, 185, 129, 0.3)' : 
                                            '0 2px 8px rgba(239, 68, 68, 0.3)',
                                          animation: isInStock ? 'none' : 'pulse 2s infinite'
                                        }}>
                                          <i className={`bi ${isInStock ? 'bi-check-circle-fill' : 'bi-x-circle-fill'} me-1`} style={{fontSize: '0.8rem'}}></i>
                                          {isInStock ? 'In Stock' : 'Out of Stock'}
                                        </div>
                                        <small className="stock-note d-block mt-1" style={{color: '#6b7280', fontSize: '0.7rem'}}>
                                          {isInStock ? 'Ready to ship' : 'Currently unavailable'}
                                        </small>
                                      </>
                                    );
                                  })()
                                  }
                                </div>
                              </div>
                            </div>
                            
                            {/* Out of Stock Indicator */}
                            {(() => {
                              const isOutOfStock = product.status === 'outofstock' || (
                                product.status !== 'active' && product.status !== 'instock'
                              ) || (
                                product.sizes && (
                                  (typeof product.sizes === 'object' && 
                                   Object.keys(product.sizes).length > 0 &&
                                   !Object.values(product.sizes).some((stock: any) => 
                                     typeof stock === 'number' ? stock > 0 : 
                                     (stock?.stock || 0) > 0
                                   )) ||
                                  (Array.isArray(product.sizes) && 
                                   product.sizes.length > 0 &&
                                   !product.sizes.some(size => 
                                     size.stock > 0 || 
                                     (size.colors && size.colors.some((color: any) => color.stock > 0))
                                   ))
                                )
                              );
                              return isOutOfStock ? (
                                <div className="text-center mt-3">
                                  <div className="alert alert-danger" style={{
                                    background: 'linear-gradient(135deg, rgba(239, 68, 68, 0.1), rgba(220, 38, 38, 0.05))',
                                    border: '1px solid rgba(239, 68, 68, 0.2)',
                                    borderRadius: '12px',
                                    padding: '0.75rem',
                                    margin: 0
                                  }}>
                                    <i className="bi bi-exclamation-triangle text-danger me-2"></i>
                                    <span className="text-danger fw-semibold">Out of Stock</span>
                                  </div>
                                </div>
                              ) : null;
                            })()
                            }
                          </div>
                        </div>
                        </motion.div>
                      ))}
                    </AnimatePresence>
                  </div>
                  
                  {/* No Products Found */}
                  {getFilteredProducts.length === 0 && !loading && products.length > 0 && (
                    <div className="col-12">
                      <div className="no-products-found text-center py-5" style={{minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="mb-4">
                          <i className="bi bi-search" style={{fontSize: '4rem', color: '#e5e7eb'}}></i>
                        </div>
                        <h4 className="mb-3" style={{color: '#6b7280'}}>No Products Found</h4>
                        <p className="text-muted mb-4">We couldn't find any products matching your criteria. Try adjusting your filters or search terms.</p>
                        <div className="d-flex justify-content-center gap-3">
                          <button className="btn btn-outline-primary" onClick={() => {
                            setSelectedCategory('All');
                            setSearchTerm('');
                            setPriceRange({ min: 0, max: maxPrice });
                          }}>
                            <i className="bi bi-arrow-clockwise me-2"></i>Reset Filters
                          </button>
                          <button className="btn btn-primary" onClick={() => window.location.href = '/contact'}>
                            <i className="bi bi-headset me-2"></i>Contact Support
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                  
                  {/* Show message when no products at all */}
                  {products.length === 0 && !loading && (
                    <div className="col-12">
                      <div className="no-products-found text-center py-5" style={{minHeight: '400px', display: 'flex', flexDirection: 'column', justifyContent: 'center'}}>
                        <div className="mb-4">
                          <i className="bi bi-exclamation-triangle" style={{fontSize: '4rem', color: '#f59e0b'}}></i>
                        </div>
                        <h4 className="mb-3" style={{color: '#6b7280'}}>No Products Available</h4>
                        <p className="text-muted mb-4">We're currently updating our inventory. Please check back soon or contact support.</p>
                        <div className="d-flex justify-content-center gap-3">
                          <button className="btn btn-outline-primary" onClick={() => loadProducts()}>
                            <i className="bi bi-arrow-clockwise me-2"></i>Refresh Products
                          </button>
                          <button className="btn btn-primary" onClick={() => window.location.href = '/contact'}>
                            <i className="bi bi-headset me-2"></i>Contact Support
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>


      {/* Cart Modal */}
      {showCart && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)'}}>
          <div className="modal-dialog modal-lg" style={{maxWidth: '600px'}}>
            <div className="modal-content" style={{borderRadius: '20px', border: 'none', boxShadow: '0 20px 60px rgba(0,0,0,0.3)'}}>
              <div className="modal-header" style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', color: 'white', borderRadius: '20px 20px 0 0', padding: '1.5rem 2rem', border: 'none'}}>
                <div className="d-flex align-items-center">
                  <div className="bg-white bg-opacity-20 rounded-circle p-2 me-3">
                    <i className="bi bi-bag-check" style={{fontSize: '1.2rem'}}></i>
                  </div>
                  <div>
                    <h4 className="modal-title mb-0 fw-bold">Shopping Cart</h4>
                    <small className="opacity-75">{cart.length} {cart.length === 1 ? 'item' : 'items'}</small>
                  </div>
                </div>
                <button type="button" className="btn btn-light rounded-circle" onClick={() => setShowCart(false)} style={{width: '40px', height: '40px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                  <i className="bi bi-x" style={{fontSize: '1.2rem'}}></i>
                </button>
              </div>
              <div className="modal-body" style={{padding: '2rem', maxHeight: '60vh', overflowY: 'auto'}}>
                {cart.length === 0 ? (
                  <div className="text-center py-5">
                    <div className="mb-4">
                      <i className="bi bi-cart-x" style={{fontSize: '4rem', color: '#e9ecef'}}></i>
                    </div>
                    <h5 className="text-muted mb-2">Your cart is empty</h5>
                    <p className="text-muted small">Add some items to get started</p>
                  </div>
                ) : (
                  <>
                    <div className="cart-items mb-4">
                      {cart.map((item, index) => (
                        <div key={`${item.id}-${item.size}-${index}`} className="cart-item d-flex align-items-center p-3 mb-3" style={{background: '#f8f9fa', borderRadius: '15px', border: '1px solid #e9ecef'}}>
                          <div className="position-relative me-3">
                            <img src={item.image} alt={item.name} className="rounded-3" style={{width: '70px', height: '70px', objectFit: 'cover'}} />
                            <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-primary" style={{fontSize: '0.7rem'}}>
                              {item.quantity}
                            </span>
                          </div>
                          <div className="flex-grow-1">
                            <h6 className="mb-1 fw-bold" style={{color: '#2c3e50'}}>{item.name}</h6>
                            <div className="d-flex flex-wrap gap-2 mb-2">
                              {item.size && (
                                <span className="badge bg-light text-dark" style={{fontSize: '0.7rem'}}>Size: {item.size}</span>
                              )}
                              {(item as any).color && (
                                <span className="badge bg-light text-dark" style={{fontSize: '0.7rem'}}>Color: {(item as any).color}</span>
                              )}
                            </div>
                            <div className="d-flex justify-content-between align-items-center">
                              <span className="fw-bold" style={{color: '#27ae60', fontSize: '1.1rem'}}>LKR {(item.price * item.quantity).toLocaleString()}</span>
                              <button onClick={() => removeFromCart(item.id || item._id || '', item.size)} className="btn btn-outline-danger btn-sm rounded-circle" style={{width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>
                                <i className="bi bi-trash" style={{fontSize: '0.8rem'}}></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    <div className="payment-section mb-4">
                      <h6 className="fw-bold mb-3" style={{color: '#2c3e50'}}>Payment Method</h6>
                      <div className="row g-3">
                        <div className="col-6">
                          <label className="payment-option w-100" style={{cursor: 'pointer'}}>
                            <input 
                              className="form-check-input d-none" 
                              type="radio" 
                              name="paymentMethod" 
                              value="cash_on_delivery"
                              checked={paymentMethod === 'cash_on_delivery'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className={`p-3 rounded-3 text-center border-2 ${paymentMethod === 'cash_on_delivery' ? 'border-primary bg-primary bg-opacity-10' : 'border-light bg-light'}`} style={{transition: 'all 0.3s ease'}}>
                              <i className="bi bi-cash" style={{fontSize: '1.5rem', color: paymentMethod === 'cash_on_delivery' ? '#0d6efd' : '#6c757d'}}></i>
                              <div className="mt-2">
                                <small className={`fw-bold ${paymentMethod === 'cash_on_delivery' ? 'text-primary' : 'text-muted'}`}>Cash on Delivery</small>
                              </div>
                            </div>
                          </label>
                        </div>
                        <div className="col-6">
                          <label className="payment-option w-100" style={{cursor: 'pointer'}}>
                            <input 
                              className="form-check-input d-none" 
                              type="radio" 
                              name="paymentMethod" 
                              value="bank_transfer"
                              checked={paymentMethod === 'bank_transfer'}
                              onChange={(e) => setPaymentMethod(e.target.value)}
                            />
                            <div className={`p-3 rounded-3 text-center border-2 ${paymentMethod === 'bank_transfer' ? 'border-success bg-success bg-opacity-10' : 'border-light bg-light'}`} style={{transition: 'all 0.3s ease'}}>
                              <i className="bi bi-bank" style={{fontSize: '1.5rem', color: paymentMethod === 'bank_transfer' ? '#198754' : '#6c757d'}}></i>
                              <div className="mt-2">
                                <small className={`fw-bold ${paymentMethod === 'bank_transfer' ? 'text-success' : 'text-muted'}`}>Bank Deposit</small>
                              </div>
                            </div>
                          </label>
                        </div>
                      </div>
                    </div>
                    
                    <div className="order-summary p-3 rounded-3" style={{background: 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)', border: '1px solid #dee2e6'}}>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Subtotal ({cart.length} items)</span>
                        <span className="fw-bold">LKR {getSubtotal().toLocaleString()}</span>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="text-muted">Delivery</span>
                        <span className={`fw-bold ${deliveryCost === 0 ? 'text-success' : 'text-primary'}`}>
                          {deliveryCost === 0 ? 'FREE' : `LKR ${deliveryCost.toLocaleString()}`}
                        </span>
                      </div>
                      {remainingForFreeDelivery > 0 && (
                        <div className="mb-2">
                          <small className="text-info">
                            <i className="bi bi-info-circle me-1"></i>
                            Add LKR {remainingForFreeDelivery.toLocaleString()} more for FREE delivery!
                          </small>
                        </div>
                      )}
                      <hr className="my-2" />
                      <div className="d-flex justify-content-between align-items-center mb-2">
                        <span className="fw-bold" style={{fontSize: '1.1rem'}}>Total</span>
                        <span className="fw-bold" style={{fontSize: '1.3rem', color: '#27ae60'}}>LKR {getTotal().toLocaleString()}</span>
                      </div>
                      <div className="text-center mt-2">
                        <div className="d-flex gap-2 justify-content-center flex-wrap">
                          <button 
                            className="btn btn-sm btn-outline-secondary" 
                            onClick={() => {
                              console.log('Manual cart refresh clicked');
                              loadCartFromStorage();
                            }}
                            title="Refresh cart from server"
                          >
                            <i className="bi bi-arrow-clockwise me-1"></i>Refresh Cart
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-primary" 
                            onClick={() => {
                              console.log('Manual products refresh clicked');
                              setLoading(true);
                              loadProducts();
                            }}
                            title="Refresh products from MongoDB"
                            disabled={loading}
                          >
                            {loading ? (
                              <><i className="bi bi-hourglass-split me-1"></i>Loading...</>
                            ) : (
                              <><i className="bi bi-database me-1"></i>Refresh Products</>
                            )}
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-success" 
                            onClick={() => {
                              console.log('Manual delivery recalculation clicked');
                              calculateDelivery();
                            }}
                            title="Recalculate delivery cost"
                          >
                            <i className="bi bi-truck me-1"></i>Recalc Delivery
                          </button>
                          <button 
                            className="btn btn-sm btn-outline-info" 
                            onClick={async () => {
                              try {
                                const categories = [...new Set(cart.map(item => getCategoryName(item.category)))];
                                console.log('Cart categories:', categories);
                                console.log('Current delivery cost:', deliveryCost);
                                console.log('Current delivery message:', deliveryMessage);
                                alert(`Categories: ${categories.join(', ')}\nDelivery: ₹${deliveryCost}\nMessage: ${deliveryMessage}`);
                              } catch (error) {
                                console.error('Debug error:', error);
                                alert('Debug failed - check console');
                              }
                            }}
                            title="Debug delivery calculation"
                          >
                            <i className="bi bi-bug me-1"></i>Debug Delivery
                          </button>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="modal-footer" style={{padding: '1.5rem 2rem', border: 'none', borderRadius: '0 0 20px 20px'}}>
                  <button onClick={placeOrder} className="btn btn-lg w-100" disabled={orderLoading} style={{background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', border: 'none', borderRadius: '15px', padding: '1rem', fontWeight: '600', fontSize: '1.1rem', color: 'white', boxShadow: '0 8px 25px rgba(102, 126, 234, 0.3)'}}>
                    {orderLoading ? (
                      <>
                        <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                        Processing Order...
                      </>
                    ) : (
                      <>
                        <i className="bi bi-check-circle me-2"></i>
                        Place Order • LKR {getTotal().toLocaleString()}
                      </>
                    )}
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Product Modal */}
      {showProductModal && selectedProduct && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.95)', zIndex: 9999, backdropFilter: 'blur(5px)'}}>
          <div className="modal-dialog" style={{maxWidth: '90vw', width: '90vw', height: '85vh', margin: '7.5vh auto'}}>
            <div className="modal-content" style={{height: '85vh', borderRadius: '12px', border: 'none', background: '#0f0f0f', color: 'white'}}>
              <div className="modal-header text-white" style={{borderBottom: '1px solid rgba(255,255,255,0.2)', background: 'rgba(0,0,0,0.9)', backdropFilter: 'blur(20px)', padding: '1.5rem 2rem'}}>
                <div className="d-flex align-items-center">
                  <div className="me-3" style={{width: '4px', height: '40px', background: 'linear-gradient(to bottom, #000000, #333333)', borderRadius: '2px'}}></div>
                  <h3 className="modal-title fw-light mb-0" style={{letterSpacing: '0.5px', fontWeight: 300}}>{selectedProduct.name}</h3>
                </div>
                <button type="button" className="btn" onClick={closeProductModal} style={{background: '#ffffff', color: 'black', border: '1px solid #000000', width: '40px', height: '40px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.2rem', transition: 'all 0.3s ease'}}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal-body" style={{overflowY: 'auto', height: 'calc(85vh - 120px)', background: '#0f0f0f', padding: '1.5rem'}}>
                <div className="row h-100 g-4">
                  <div className="col-lg-7">
                    <div className="d-flex flex-column h-100">
                      <div className="position-relative flex-grow-1 d-flex align-items-center justify-content-center" style={{minHeight: '500px', background: 'rgba(255,255,255,0.02)', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.1)'}}>
                        <div onClick={toggleZoom} style={{cursor: zoomLevel === 1 ? 'zoom-in' : 'zoom-out'}}>
                          <ImageWithFallback 
                            src={getProductImages()[currentImageIndex] || selectedProduct.image || 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop'} 
                            alt={selectedProduct.name}
                            className="img-fluid product-zoom"
                            key={`${selectedProduct.id}-${currentImageIndex}`}
                            style={{
                              transform: `scale(${zoomLevel})`,
                              transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                              maxHeight: '65vh',
                              objectFit: 'contain',
                              borderRadius: '8px'
                            }}
                          />
                        </div>
                        
                        {/* Image Navigation Arrows */}
                        {getProductImages().length > 1 && (
                          <>
                            <button 
                              className="btn position-absolute start-0 top-50 translate-middle-y ms-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('prev');
                              }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                                border: '2px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backdropFilter: 'blur(15px)',
                                zIndex: 10,
                                transition: 'all 0.3s ease',
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            <button 
                              className="btn position-absolute end-0 top-50 translate-middle-y me-3"
                              onClick={(e) => {
                                e.stopPropagation();
                                navigateImage('next');
                              }}
                              style={{
                                background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))',
                                border: '2px solid rgba(255,255,255,0.3)',
                                color: 'white',
                                width: '50px',
                                height: '50px',
                                borderRadius: '50%',
                                backdropFilter: 'blur(15px)',
                                zIndex: 10,
                                transition: 'all 0.3s ease',
                                fontSize: '1.2rem',
                                boxShadow: '0 4px 15px rgba(0,0,0,0.3)'
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(255,255,255,0.9), rgba(255,255,255,0.7))';
                                e.currentTarget.style.color = '#000';
                                e.currentTarget.style.transform = 'scale(1.1)';
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))';
                                e.currentTarget.style.color = 'white';
                                e.currentTarget.style.transform = 'scale(1)';
                              }}
                            >
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </>
                        )}
                        
                        {/* Image Counter */}
                        {getProductImages().length > 1 && (
                          <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3">
                            <span className="badge" style={{background: 'rgba(0,0,0,0.8)', color: 'white', padding: '10px 16px', borderRadius: '25px', backdropFilter: 'blur(15px)', fontSize: '0.9rem', fontWeight: '600'}}>
                              <i className="bi bi-images me-2"></i>
                              {currentImageIndex + 1} / {getProductImages().length}
                            </span>
                          </div>
                        )}
                        
                        {/* Enhanced Zoom Controls */}
                        <div className="zoom-controls position-absolute" style={{top: '1rem', right: '1rem'}}>
                          <div className="btn-group-vertical" style={{background: 'linear-gradient(135deg, rgba(0,0,0,0.8), rgba(0,0,0,0.6))', borderRadius: '12px', backdropFilter: 'blur(15px)', border: '1px solid rgba(255,255,255,0.2)', boxShadow: '0 4px 15px rgba(0,0,0,0.3)'}}>
                            <button 
                              className="btn btn-sm d-flex align-items-center justify-content-center" 
                              onClick={(e) => {
                                e.stopPropagation();
                                zoomIn();
                              }}
                              disabled={zoomLevel >= 3}
                              style={{
                                background: 'transparent', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.6rem', 
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                opacity: zoomLevel >= 3 ? 0.5 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (zoomLevel < 3) {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <i className="bi bi-zoom-in"></i>
                            </button>
                            <div style={{height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 8px'}}></div>
                            <div className="text-center px-2" style={{color: 'white', fontSize: '0.7rem', fontWeight: '600', padding: '4px 0'}}>
                              {Math.round(zoomLevel * 100)}%
                            </div>
                            <div style={{height: '1px', background: 'rgba(255,255,255,0.2)', margin: '0 8px'}}></div>
                            <button 
                              className="btn btn-sm d-flex align-items-center justify-content-center" 
                              onClick={(e) => {
                                e.stopPropagation();
                                zoomOut();
                              }}
                              disabled={zoomLevel <= 1}
                              style={{
                                background: 'transparent', 
                                color: 'white', 
                                border: 'none', 
                                padding: '0.6rem', 
                                fontSize: '1rem',
                                transition: 'all 0.3s ease',
                                opacity: zoomLevel <= 1 ? 0.5 : 1
                              }}
                              onMouseEnter={(e) => {
                                if (zoomLevel > 1) {
                                  e.currentTarget.style.background = 'rgba(255,255,255,0.2)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.background = 'transparent';
                              }}
                            >
                              <i className="bi bi-zoom-out"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      {/* Image Thumbnails */}
                      <div className="d-flex justify-content-center gap-3 mt-4 p-3 rounded-3" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>
                        {getProductImages().map((img, index) => (
                          <div key={index} className="position-relative">
                            <img 
                              src={img} 
                              className="rounded-3"
                              style={{
                                cursor: 'pointer',
                                width: '80px',
                                height: '80px',
                                objectFit: 'cover',
                                border: '3px solid',
                                transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: index === currentImageIndex ? '1' : '0.6',
                                borderColor: index === currentImageIndex ? '#ffffff' : 'rgba(255,255,255,0.3)',
                                transform: index === currentImageIndex ? 'scale(1.1)' : 'scale(1)',
                                boxShadow: index === currentImageIndex ? '0 8px 25px rgba(255,255,255,0.2)' : '0 2px 8px rgba(0,0,0,0.2)'
                              }}
                              onClick={() => {
                                setCurrentImageIndex(index);
                                changeMainImage(img);
                              }}
                              onMouseEnter={(e) => {
                                if (index !== currentImageIndex) {
                                  e.currentTarget.style.opacity = '0.8';
                                  e.currentTarget.style.transform = 'scale(1.05)';
                                }
                              }}
                              onMouseLeave={(e) => {
                                if (index !== currentImageIndex) {
                                  e.currentTarget.style.opacity = '0.6';
                                  e.currentTarget.style.transform = 'scale(1)';
                                }
                              }}
                            />
                            {index === currentImageIndex && (
                              <div className="position-absolute top-50 start-50 translate-middle">
                                <div className="bg-white rounded-circle d-flex align-items-center justify-content-center" style={{width: '24px', height: '24px', boxShadow: '0 2px 8px rgba(0,0,0,0.3)'}}>
                                  <i className="bi bi-check text-dark" style={{fontSize: '0.8rem', fontWeight: 'bold'}}></i>
                                </div>
                              </div>
                            )}
                            <div className="position-absolute bottom-0 end-0 translate-middle">
                              <span className="badge bg-dark text-white" style={{fontSize: '0.6rem', padding: '2px 6px'}}>{index + 1}</span>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="sticky-top" style={{top: '20px'}}>
                      <div className="mb-4">
                        <h1 className="fw-light mb-2" style={{color: '#ffffff', fontSize: '2rem', letterSpacing: '0.5px'}}>{selectedProduct.name}</h1>
                        <div className="d-flex gap-3 mb-2">
                          <span className="badge bg-primary px-3 py-2" style={{fontSize: '0.9rem'}}>
                            <i className="bi bi-upc-scan me-1"></i>Code: {selectedProduct.code}
                          </span>
                          <span className="badge bg-info px-3 py-2" style={{fontSize: '0.9rem'}}>
                            <i className="bi bi-tag me-1"></i>Category: {getCategoryName(selectedProduct.category)}
                          </span>
                        </div>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)'}}>
                        <div>
                          <h2 className="mb-1" style={{color: '#ffffff', fontWeight: 600, fontSize: '2.2rem'}}>LKR {selectedProduct.price}</h2>
                          <small className="text-muted">Inclusive of all taxes</small>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center mb-1">
                            <div className="text-warning me-2">
                              {getStars(typeof selectedProduct.rating === 'object' ? (selectedProduct.rating as any).average : selectedProduct.rating || 0).map((star, index) => (
                                <i key={index} className={`bi ${star}`} style={{fontSize: '0.9rem'}}></i>
                              ))}
                            </div>
                            <span className="fw-semibold" style={{color: '#ffffff'}}>{typeof selectedProduct.rating === 'object' ? (selectedProduct.rating as any).average : selectedProduct.rating || 0}</span>
                          </div>
                          <small className="text-muted">({typeof selectedProduct.rating === 'object' ? (selectedProduct.rating as any).count : selectedProduct.reviewCount || 0} reviews)</small>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="product-details-card p-4 rounded-3" style={{
                          background: 'linear-gradient(135deg, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0.04) 100%)',
                          border: '1px solid rgba(255,255,255,0.15)',
                          backdropFilter: 'blur(10px)',
                          boxShadow: '0 8px 32px rgba(0,0,0,0.3)'
                        }}>
                          <div className="d-flex align-items-center mb-4">
                            <div className="me-3" style={{
                              width: '4px',
                              height: '24px',
                              background: 'linear-gradient(to bottom, #667eea, #764ba2)',
                              borderRadius: '2px'
                            }}></div>
                            <h5 className="mb-0 fw-bold" style={{
                              color: '#ffffff',
                              fontSize: '1.2rem',
                              letterSpacing: '0.5px'
                            }}>Product Details</h5>
                          </div>
                          
                          <div className="product-description mb-4 p-3 rounded-2" style={{
                            background: 'rgba(255,255,255,0.05)',
                            border: '1px solid rgba(255,255,255,0.1)'
                          }}>
                            <div className="description-content">
                              <p className="mb-3" style={{
                                color: '#e0e0e0',
                                lineHeight: 1.8,
                                fontSize: '1rem',
                                fontWeight: '400',
                                textAlign: 'justify'
                              }}>{selectedProduct?.description || getProductDescription()}</p>
                              
                              <div className="product-specs mt-3 pt-3" style={{
                                borderTop: '1px solid rgba(255,255,255,0.1)'
                              }}>
                                <h6 className="mb-3" style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>Product Specifications</h6>
                                <div className="row g-2">
                                  <div className="col-6">
                                    <div className="spec-item d-flex justify-content-between align-items-center py-2 px-3 rounded" style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                      <span style={{color: '#b0b0b0', fontSize: '0.8rem'}}>Material:</span>
                                      <span style={{color: '#ffffff', fontSize: '0.8rem', fontWeight: '500'}}>{(selectedProduct as any)?.specifications?.material || 'Premium Cotton'}</span>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="spec-item d-flex justify-content-between align-items-center py-2 px-3 rounded" style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                      <span style={{color: '#b0b0b0', fontSize: '0.8rem'}}>Care:</span>
                                      <span style={{color: '#ffffff', fontSize: '0.8rem', fontWeight: '500'}}>{(selectedProduct as any)?.specifications?.careInstructions || 'Machine Wash'}</span>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="spec-item d-flex justify-content-between align-items-center py-2 px-3 rounded" style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                      <span style={{color: '#b0b0b0', fontSize: '0.8rem'}}>Weight:</span>
                                      <span style={{color: '#ffffff', fontSize: '0.8rem', fontWeight: '500'}}>{(selectedProduct as any)?.specifications?.weight || 'Regular Fit'}</span>
                                    </div>
                                  </div>
                                  <div className="col-6">
                                    <div className="spec-item d-flex justify-content-between align-items-center py-2 px-3 rounded" style={{
                                      background: 'rgba(255,255,255,0.03)',
                                      border: '1px solid rgba(255,255,255,0.08)'
                                    }}>
                                      <span style={{color: '#b0b0b0', fontSize: '0.8rem'}}>Origin:</span>
                                      <span style={{color: '#ffffff', fontSize: '0.8rem', fontWeight: '500'}}>{(selectedProduct as any)?.specifications?.origin || 'Sri Lanka'}</span>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Product Features */}
                          <div className="product-features mb-4">
                            <div className="row g-3">
                              <div className="col-6">
                                <div className="feature-item d-flex align-items-center p-3 rounded-2" style={{
                                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15) 0%, rgba(34, 197, 94, 0.05) 100%)',
                                  border: '1px solid rgba(34, 197, 94, 0.2)'
                                }}>
                                  <div className="feature-icon me-3 d-flex align-items-center justify-content-center" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(34, 197, 94, 0.2)',
                                    borderRadius: '50%'
                                  }}>
                                    <i className="bi bi-shield-check" style={{color: '#22c55e', fontSize: '1.2rem'}}></i>
                                  </div>
                                  <div>
                                    <h6 className="mb-1" style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>Quality Assured</h6>
                                    <small style={{color: '#b0b0b0', fontSize: '0.75rem'}}>Premium materials</small>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="feature-item d-flex align-items-center p-3 rounded-2" style={{
                                  background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.15) 0%, rgba(59, 130, 246, 0.05) 100%)',
                                  border: '1px solid rgba(59, 130, 246, 0.2)'
                                }}>
                                  <div className="feature-icon me-3 d-flex align-items-center justify-content-center" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(59, 130, 246, 0.2)',
                                    borderRadius: '50%'
                                  }}>
                                    <i className="bi bi-truck" style={{color: '#3b82f6', fontSize: '1.2rem'}}></i>
                                  </div>
                                  <div>
                                    <h6 className="mb-1" style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>Fast Delivery</h6>
                                    <small style={{color: '#b0b0b0', fontSize: '0.75rem'}}>2-3 business days</small>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="feature-item d-flex align-items-center p-3 rounded-2" style={{
                                  background: 'linear-gradient(135deg, rgba(168, 85, 247, 0.15) 0%, rgba(168, 85, 247, 0.05) 100%)',
                                  border: '1px solid rgba(168, 85, 247, 0.2)'
                                }}>
                                  <div className="feature-icon me-3 d-flex align-items-center justify-content-center" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(168, 85, 247, 0.2)',
                                    borderRadius: '50%'
                                  }}>
                                    <i className="bi bi-arrow-clockwise" style={{color: '#a855f7', fontSize: '1.2rem'}}></i>
                                  </div>
                                  <div>
                                    <h6 className="mb-1" style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>Easy Returns</h6>
                                    <small style={{color: '#b0b0b0', fontSize: '0.75rem'}}>30-day policy</small>
                                  </div>
                                </div>
                              </div>
                              <div className="col-6">
                                <div className="feature-item d-flex align-items-center p-3 rounded-2" style={{
                                  background: 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(245, 158, 11, 0.05) 100%)',
                                  border: '1px solid rgba(245, 158, 11, 0.2)'
                                }}>
                                  <div className="feature-icon me-3 d-flex align-items-center justify-content-center" style={{
                                    width: '40px',
                                    height: '40px',
                                    background: 'rgba(245, 158, 11, 0.2)',
                                    borderRadius: '50%'
                                  }}>
                                    <i className="bi bi-headset" style={{color: '#f59e0b', fontSize: '1.2rem'}}></i>
                                  </div>
                                  <div>
                                    <h6 className="mb-1" style={{color: '#ffffff', fontSize: '0.9rem', fontWeight: '600'}}>24/7 Support</h6>
                                    <small style={{color: '#b0b0b0', fontSize: '0.75rem'}}>Always available</small>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          
                          {/* Available Colors & Sizes Summary */}
                          <div className="availability-summary">
                            <div className="row g-3">
                              {getAllAvailableColors().length > 0 && (
                                <div className="col-md-6">
                                  <div className="availability-card p-3 rounded-2" style={{
                                    background: 'rgba(255,255,255,0.05)',
                                    border: '1px solid rgba(255,255,255,0.1)'
                                  }}>
                                    <div className="d-flex align-items-center mb-3">
                                      <i className="bi bi-palette me-2" style={{color: '#667eea', fontSize: '1.1rem'}}></i>
                                      <h6 className="mb-0 fw-bold" style={{color: '#ffffff', fontSize: '0.95rem'}}>Available Colors</h6>
                                      <span className="badge ms-auto" style={{
                                        background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                        fontSize: '0.7rem'
                                      }}>{getAllAvailableColors().length}</span>
                                    </div>
                                    <div className="d-flex flex-wrap gap-2">
                                      {getAllAvailableColors().map(color => (
                                        <div key={color.name} className="color-preview d-flex align-items-center gap-2 px-3 py-2 rounded-pill" style={{
                                          background: 'rgba(255,255,255,0.08)',
                                          border: '1px solid rgba(255,255,255,0.15)'
                                        }}>
                                          <div 
                                            className="color-dot"
                                            style={{
                                              width: '16px',
                                              height: '16px',
                                              backgroundColor: color.code,
                                              borderRadius: '50%',
                                              border: '2px solid rgba(255,255,255,0.3)',
                                              boxShadow: '0 2px 8px rgba(0,0,0,0.2)'
                                            }}
                                          ></div>
                                          <span style={{fontSize: '0.8rem', color: '#e0e0e0', fontWeight: '500'}}>{color.name}</span>
                                        </div>
                                      ))}
                                    </div>
                                  </div>
                                </div>
                              )}
                              <div className={getAllAvailableColors().length > 0 ? "col-md-6" : "col-12"}>
                                <div className="availability-card p-3 rounded-2" style={{
                                  background: 'rgba(255,255,255,0.05)',
                                  border: '1px solid rgba(255,255,255,0.1)'
                                }}>
                                  <div className="d-flex align-items-center mb-3">
                                    <i className="bi bi-rulers me-2" style={{color: '#22c55e', fontSize: '1.1rem'}}></i>
                                    <h6 className="mb-0 fw-bold" style={{color: '#ffffff', fontSize: '0.95rem'}}>Available Sizes</h6>
                                    <span className="badge ms-auto" style={{
                                      background: 'linear-gradient(135deg, #22c55e, #16a34a)',
                                      fontSize: '0.7rem'
                                    }}>{availableSizes.filter(size => isSizeInStock(size)).length}</span>
                                  </div>
                                  <div className="d-flex flex-wrap gap-2">
                                    {availableSizes.filter(size => isSizeInStock(size)).map(size => (
                                      <div key={size} className="size-preview px-3 py-2 rounded-2 text-center" style={{
                                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.15), rgba(34, 197, 94, 0.05))',
                                        border: '1px solid rgba(34, 197, 94, 0.2)',
                                        minWidth: '50px'
                                      }}>
                                        <div style={{fontSize: '0.9rem', color: '#ffffff', fontWeight: '600'}}>{size}</div>
                                        <small style={{fontSize: '0.7rem', color: '#22c55e'}}>{getSizeStock(size)} left</small>
                                      </div>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {getAllAvailableColors().length > 0 && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-semibold mb-0" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Select Color</h6>
                            <small className="text-muted">{getAllAvailableColors().length} colors available</small>
                          </div>
                          <div className="row g-2">
                            {getAllAvailableColors().map(color => (
                              <div key={color.name} className="col-6 col-sm-4">
                                <button 
                                  className="btn w-100 d-flex align-items-center justify-content-start p-3"
                                  style={{
                                    height: '60px',
                                    border: '2px solid',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: 500,
                                    borderRadius: '12px',
                                    background: selectedColor === color.name ? 'linear-gradient(135deg, #000000, #333333)' : 'rgba(255,255,255,0.05)',
                                    borderColor: selectedColor === color.name ? '#000000' : 'rgba(255,255,255,0.3)',
                                    color: '#ffffff',
                                    transform: selectedColor === color.name ? 'scale(1.02)' : 'scale(1)',
                                    boxShadow: selectedColor === color.name ? '0 4px 15px rgba(0,0,0,0.2)' : 'none'
                                  }}
                                  onClick={() => onColorSelect(color.name)}
                                >
                                  <div 
                                    className="rounded-circle me-2 flex-shrink-0"
                                    style={{
                                      width: '24px',
                                      height: '24px',
                                      backgroundColor: color.code,
                                      border: '2px solid rgba(255,255,255,0.3)'
                                    }}
                                  ></div>
                                  <div className="text-start flex-grow-1">
                                    <div style={{fontSize: '0.85rem', lineHeight: 1.2}}>{color.name}</div>
                                    <small style={{fontSize: '0.7rem', opacity: 0.8}}>Available in {color.sizes.join(', ')}</small>
                                  </div>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      {selectedColor && getSizesForColor(selectedColor).length > 0 && (
                        <div className="mb-4">
                          <div className="d-flex align-items-center justify-content-between mb-3">
                            <h6 className="fw-semibold mb-0" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Select Size for {selectedColor}</h6>
                            <small className="text-muted">{getSizesForColor(selectedColor).length} sizes available</small>
                          </div>
                          <div className="row g-2">
                            {getSizesForColor(selectedColor).map(sizeData => (
                              <div key={sizeData.size} className="col-4 col-sm-3">
                                <button 
                                  className="btn w-100 d-flex flex-column align-items-center justify-content-center"
                                  style={{
                                    height: '70px',
                                    border: '2px solid',
                                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                    fontWeight: 600,
                                    borderRadius: '12px',
                                    background: selectedSize === sizeData.size ? 'linear-gradient(135deg, #000000, #333333)' : 'rgba(255,255,255,0.05)',
                                    borderColor: selectedSize === sizeData.size ? '#000000' : 'rgba(255,255,255,0.3)',
                                    color: '#ffffff',
                                    transform: selectedSize === sizeData.size ? 'scale(1.05)' : 'scale(1)',
                                    boxShadow: selectedSize === sizeData.size ? '0 8px 25px rgba(0,0,0,0.3)' : 'none'
                                  }}
                                  onClick={() => setSelectedSize(sizeData.size)}
                                >
                                  <span style={{fontSize: '1.1rem', marginBottom: '2px'}}>{sizeData.size}</span>
                                  <small style={{fontSize: '0.7rem', opacity: 0.8}}>₹{sizeData.price}</small>
                                  <small style={{fontSize: '0.6rem', opacity: 0.6}}>Stock: {sizeData.stock}</small>
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className="mb-4">
                        <div className="d-flex align-items-center justify-content-between mb-3">
                          <h6 className="fw-semibold mb-0" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Quantity</h6>
                          <small className="text-muted">Available: {selectedColor ? getColorStock(selectedSize, selectedColor) : getSizeStock(selectedSize)}</small>
                        </div>
                        <div className="d-flex align-items-center justify-content-center gap-4 p-3 rounded" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>
                          <button 
                            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" 
                            onClick={decreaseQuantity} 
                            disabled={modalQuantity <= 1}
                            style={{width: '45px', height: '45px', fontSize: '1.2rem'}}
                          >
                            <i className="bi bi-dash"></i>
                          </button>
                          <div className="text-center">
                            <div className="fw-bold" style={{fontSize: '1.8rem', lineHeight: 1}}>{modalQuantity}</div>
                            <small className="text-muted">pieces</small>
                            {modalQuantity >= (selectedColor ? getColorStock(selectedSize, selectedColor) : getSizeStock(selectedSize)) && (
                              <div><small className="text-warning" style={{fontSize: '0.7rem'}}>Max stock reached</small></div>
                            )}
                          </div>
                          <button 
                            className="btn btn-outline-light rounded-circle d-flex align-items-center justify-content-center" 
                            onClick={increaseQuantity}
                            disabled={modalQuantity >= (selectedColor ? getColorStock(selectedSize, selectedColor) : getSizeStock(selectedSize))}
                            style={{width: '45px', height: '45px', fontSize: '1.2rem'}}
                          >
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      {selectedProduct.status === 'outofstock' ? (
                        <div className="text-center p-4 rounded" style={{background: 'rgba(255,0,0,0.1)', border: '1px solid rgba(255,0,0,0.3)'}}>
                          <i className="bi bi-x-circle display-6 text-danger mb-2"></i>
                          <h6 className="text-danger mb-0">Out of Stock</h6>
                        </div>
                      ) : (
                        <>
                          {getAllAvailableColors().length > 0 && !selectedColor && (
                            <div className="alert alert-warning mb-3 d-flex align-items-center" style={{background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', color: '#ffc107'}}>
                              <i className="bi bi-exclamation-triangle-fill me-2" style={{fontSize: '1.1rem'}}></i>
                              Please select a color to continue
                            </div>
                          )}
                          {selectedColor && !selectedSize && (
                            <div className="alert alert-warning mb-3 d-flex align-items-center" style={{background: 'rgba(255,193,7,0.1)', border: '1px solid rgba(255,193,7,0.3)', color: '#ffc107'}}>
                              <i className="bi bi-exclamation-triangle-fill me-2" style={{fontSize: '1.1rem'}}></i>
                              Please select a size to continue
                            </div>
                          )}
                          <button 
                            className="btn btn-lg w-100 mb-4 d-flex align-items-center justify-content-center" 
                            onClick={addToCartFromModal} 
                            disabled={Boolean(cartLoading === (selectedProduct?.id || selectedProduct?._id) || 
                              (getAllAvailableColors().length > 0 && !selectedColor) || 
                              (selectedColor && !selectedSize) ||
                              (selectedColor && selectedSize && getColorStock(selectedSize, selectedColor) <= 0))}
                            style={{
                              background: 'linear-gradient(135deg, #667eea, #764ba2)',
                              border: '2px solid #667eea',
                              color: 'white',
                              fontWeight: 600,
                              fontSize: '1.1rem',
                              padding: '1rem',
                              borderRadius: '12px',
                              transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                              boxShadow: '0 8px 25px rgba(102, 126, 234, 0.4)'
                            }}
                          >
                            {cartLoading === (selectedProduct?.id || selectedProduct?._id) ? (
                              <>
                                <div className="spinner-border spinner-border-sm me-2" role="status"></div>
                                Adding to Cart...
                              </>
                            ) : (
                              <>
                                <i className="bi bi-cart-plus me-2"></i>
                                Add to Cart - LKR {((selectedColor ? getColorPrice(selectedSize, selectedColor) : getSizePrice(selectedSize)) * modalQuantity).toFixed(2)}
                              </>
                            )}
                          </button>
                        </>
                      )}

                      {/* Similar Products Slideshow */}
                      <div className="border-top pt-4" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="fw-semibold mb-0" style={{color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.3px'}}>You might also like</h6>
                          <div className="btn-group">
                            <button className="btn btn-sm" onClick={previousSlide} disabled={currentSlide === 0} style={{background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', width: '35px', height: '35px'}}>
                              <i className="bi bi-chevron-left"></i>
                            </button>
                            <button className="btn btn-sm" onClick={nextSlide} disabled={currentSlide >= getMaxSlides()} style={{background: 'rgba(255,255,255,0.05)', color: 'white', border: '1px solid rgba(255,255,255,0.2)', width: '35px', height: '35px'}}>
                              <i className="bi bi-chevron-right"></i>
                            </button>
                          </div>
                        </div>
                        <div className="position-relative overflow-hidden">
                          <div className="d-flex transition-transform" style={{transform: `translateX(-${currentSlide * 100}%)`, transition: 'transform 0.3s ease'}}>
                            {getSimilarProducts().map(product => (
                              <div key={product.id} className="flex-shrink-0" style={{width: '50%'}}>
                                <div className="card h-100 me-2" style={{cursor: 'pointer', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)', transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)', borderRadius: '8px'}} onClick={() => openProductModal(product)}>
                                  <img src={product.image} alt={product.name} className="card-img-top" style={{height: '140px', objectFit: 'cover', borderRadius: '8px 8px 0 0'}} />
                                  <div className="card-body p-3">
                                    <h6 className="card-title mb-2" style={{fontSize: '0.85rem', color: 'white', fontWeight: 500, lineHeight: 1.3}}>{product.name}</h6>
                                    <p className="fw-semibold mb-2" style={{color: '#ffffff', fontSize: '1rem'}}>LKR {product.price}</p>
                                    <div className="d-flex align-items-center">
                                      <div className="text-warning me-1">
                                        {getStars(typeof product.rating === 'object' ? (product.rating as any).average : product.rating || 0).map((star, index) => (
                                          <i key={index} className={`bi ${star}`} style={{fontSize: '8px'}}></i>
                                        ))}
                                      </div>
                                      <small className="text-muted">{typeof product.rating === 'object' ? (product.rating as any).average : product.rating || 0}</small>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>

                      {/* Customer Comments */}
                      <div className="border-top pt-4 mt-4" style={{borderColor: 'rgba(255,255,255,0.1) !important'}}>
                        <div className="d-flex justify-content-between align-items-center mb-4">
                          <h6 className="fw-semibold mb-0" style={{color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.3px'}}>Customer Reviews ({getCustomerComments().length})</h6>
                          {isUserRegistered() && (
                            <button 
                              className="btn btn-sm" 
                              onClick={() => setShowReviewForm(!showReviewForm)}
                              style={{
                                background: 'linear-gradient(135deg, #667eea, #764ba2)',
                                border: 'none',
                                color: 'white',
                                borderRadius: '8px',
                                padding: '6px 12px'
                              }}
                            >
                              <i className="bi bi-plus me-1"></i>Add Review
                            </button>
                          )}
                        </div>
                        
                        {showReviewForm && (
                          <div className="mb-4 p-3 rounded" style={{background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)'}}>
                            <h6 className="mb-3" style={{color: '#ffffff'}}>Write a Review</h6>
                            <div className="mb-3">
                              <label className="form-label" style={{color: '#ffffff', fontSize: '0.9rem'}}>Rating</label>
                              <div className="d-flex gap-2">
                                {[1,2,3,4,5].map(star => (
                                  <button
                                    key={star}
                                    className="btn btn-sm"
                                    onClick={() => setNewReview({...newReview, rating: star})}
                                    style={{
                                      background: 'transparent',
                                      border: 'none',
                                      color: star <= newReview.rating ? '#fbbf24' : '#6b7280',
                                      fontSize: '1.2rem',
                                      padding: '2px'
                                    }}
                                  >
                                    <i className="bi bi-star-fill"></i>
                                  </button>
                                ))}
                              </div>
                            </div>
                            <div className="mb-3">
                              <label className="form-label" style={{color: '#ffffff', fontSize: '0.9rem'}}>Comment</label>
                              <textarea 
                                className="form-control" 
                                rows={3}
                                value={newReview.comment}
                                onChange={(e) => setNewReview({...newReview, comment: e.target.value})}
                                placeholder="Share your experience with this product..."
                                style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  color: 'white',
                                  borderRadius: '8px'
                                }}
                              />
                            </div>
                            <div className="d-flex gap-2">
                              <button 
                                className="btn btn-sm" 
                                onClick={submitReview}
                                disabled={!newReview.comment.trim()}
                                style={{
                                  background: 'linear-gradient(135deg, #10b981, #059669)',
                                  border: 'none',
                                  color: 'white',
                                  borderRadius: '8px',
                                  padding: '6px 16px'
                                }}
                              >
                                Submit Review
                              </button>
                              <button 
                                className="btn btn-sm" 
                                onClick={() => setShowReviewForm(false)}
                                style={{
                                  background: 'rgba(255,255,255,0.1)',
                                  border: '1px solid rgba(255,255,255,0.2)',
                                  color: 'white',
                                  borderRadius: '8px',
                                  padding: '6px 16px'
                                }}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        )}
                        
                        <div className="customer-comments" style={{maxHeight: '350px', overflowY: 'auto', background: 'rgba(255,255,255,0.02)', borderRadius: '8px', padding: '1.5rem', border: '1px solid rgba(255,255,255,0.1)'}}>
                          {getCustomerComments().map((comment, index) => (
                            <div key={index} className="pb-4 mb-4" style={{borderBottom: index < getCustomerComments().length - 1 ? '1px solid rgba(255,255,255,0.1)' : 'none'}}>
                              <div className="d-flex justify-content-between align-items-start mb-3">
                                <div>
                                  <strong style={{color: '#ffffff', fontWeight: 600}}>{comment.customer}</strong>
                                  <div className="text-warning mt-1">
                                    {getStars(comment.rating).map((star, starIndex) => (
                                      <i key={starIndex} className={`bi ${star}`} style={{fontSize: '0.8rem'}}></i>
                                    ))}
                                  </div>
                                </div>
                                <small style={{color: '#888', fontSize: '0.8rem'}}>{comment.date}</small>
                              </div>
                              <p className="mb-0" style={{fontSize: '0.9rem', color: '#b0b0b0', lineHeight: 1.6}}>{comment.comment}</p>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chatbot */}
      <div className="position-fixed" style={{bottom: '20px', right: '20px', zIndex: 1000}}>
        {showChatbot && (
          <div className="card shadow-lg" style={{width: '300px', height: '400px', marginBottom: '10px'}}>
            <div className="card-header bg-primary text-white d-flex justify-content-between align-items-center">
              <span><i className="bi bi-chat-dots me-2"></i>Chat Support</span>
              <button className="btn btn-sm text-white" onClick={toggleChatbot}>
                <i className="bi bi-x"></i>
              </button>
            </div>
            <div className="card-body p-0 d-flex flex-column" style={{height: '320px'}}>
              <div className="flex-grow-1 p-3" style={{overflowY: 'auto', maxHeight: '250px'}}>
                {chatMessages.map((message, index) => (
                  <div key={index} className={`mb-2 ${message.isBot ? 'text-start' : 'text-end'}`}>
                    <div 
                      className="d-inline-block px-3 py-2 rounded"
                      style={{
                        backgroundColor: message.isBot ? '#f8f9fa' : '#007bff',
                        color: message.isBot ? '#000' : '#fff',
                        maxWidth: '80%',
                        fontSize: '0.9rem'
                      }}
                    >
                      {message.text}
                    </div>
                  </div>
                ))}
              </div>
              <div className="p-3 border-top">
                <div className="input-group">
                  <input 
                    type="text" 
                    className="form-control" 
                    placeholder="Type a message..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyUp={(e) => e.key === 'Enter' && sendMessage()}
                  />
                  <button className="btn btn-primary" onClick={sendMessage}>
                    <i className="bi bi-send"></i>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
        <button 
          className="btn btn-primary rounded-circle" 
          onClick={toggleChatbot}
          style={{width: '60px', height: '60px', boxShadow: '0 4px 12px rgba(0,0,0,0.3)'}}
        >
          <i className="bi bi-chat-dots fs-4"></i>
        </button>
      </div>

      {/* Footer */}
      <footer className="py-5" style={{background: 'var(--gradient-primary)', color: 'white'}}>
        <div className="container">
          <div className="row">
            <div className="col-md-6">
              <div className="d-flex align-items-center mb-3">
                <img src="/logo.png" alt="Fashion Breeze" style={{height: '35px', width: 'auto', objectFit: 'contain', background: 'rgba(255,255,255,0.9)', padding: '3px', borderRadius: '5px', marginRight: '10px'}} />
                <h5 className="fw-bold mb-0">Fashion Breeze</h5>
              </div>
              <p className="mb-4">Your premier destination for trendy and affordable fashion. We bring you the latest styles in clothing, accessories, and lifestyle products with quality you can trust and prices you'll love.</p>
            </div>
            <div className="col-md-6 text-md-end">
              <p className="mb-2"><i className="bi bi-telephone me-2"></i>+94 70 700 3722</p>
              <p className="mb-2"><i className="bi bi-envelope me-2"></i>info@fashionbreeze.lk</p>
              <p className="mb-0"><small>&copy; 2024 Fashion Breeze. All rights reserved.</small></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}