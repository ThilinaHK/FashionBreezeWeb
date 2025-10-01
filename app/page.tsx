'use client';

import { useState, useEffect } from 'react';
import { Product, CartItem, ChatMessage, Comment } from './types';
import BootstrapClient from './components/BootstrapClient';

export default function ClientPage() {
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

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL'];

  useEffect(() => {
    setMounted(true);
    loadProducts();
    loadCartFromStorage();
    loadCategoriesFromAPI();
    startProductUpdateListener();
  }, []);

  const startProductUpdateListener = () => {
    if (typeof window !== 'undefined') {
      window.addEventListener('storage', (e) => {
        if (e.key === 'products_updated') {
          loadProducts();
        }
      });
      
      const interval = setInterval(() => {
        const timestamp = localStorage.getItem('products_timestamp');
        if (timestamp && parseInt(timestamp) > lastUpdateCheck) {
          loadProducts();
          setLastUpdateCheck(parseInt(timestamp));
        }
      }, 2000);

      return () => clearInterval(interval);
    }
  };

  const loadCartFromStorage = async () => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        const response = await fetch(`/api/cart?userId=${userId}`);
        const cartData = await response.json();
        console.log('Loaded cart data:', cartData);
        setCart(cartData.items || []);
      } catch (error) {
        console.error('Error loading cart from MongoDB:', error);
        setCart([]);
      }
    } else {
      setCart([]);
    }
  };

  const saveCartToMongoDB = async (cartItems: CartItem[]) => {
    const userId = localStorage.getItem('userId');
    if (userId) {
      try {
        console.log('Saving cart for userId:', userId, 'Items:', cartItems.length);
        const response = await fetch('/api/cart', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId,
            items: cartItems,
            total: cartItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
          })
        });
        const result = await response.json();
        console.log('Cart save result:', result);
      } catch (error) {
        console.error('Error saving cart to MongoDB:', error);
      }
    }
  };

  const loadProducts = async () => {
    try {
      setLoading(true);
      console.log('=== MAIN PAGE LOADING PRODUCTS ===');
      const response = await fetch('/api/products');
      console.log('Products API response status:', response.status);
      const products = await response.json();
      console.log('Products received in main page:', products.length);
      console.log('Products data:', products);
      setProducts(Array.isArray(products) ? products : []);
      updateCategories(Array.isArray(products) ? products : []);
    } catch (error) {
      console.error('Error loading products:', error);
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
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop"
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
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        images: [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop"
        ],
        sizes: { "XS": 0, "S": 7, "M": 10, "L": 6, "XL": 4, "XXL": 2 },
        status: "instock" as const,
        rating: 4.2,
        reviewCount: 89
      }
    ];
    setProducts(fallbackProducts);
    updateCategories(fallbackProducts);
  };

  const updateCategories = (productList: Product[]) => {
    const uniqueCategories = [...new Set(productList.map(p => p.category))];
    setCategories(['All', ...uniqueCategories]);
    const maxProductPrice = Math.max(...productList.map(p => p.price));
    setMaxPrice(Math.ceil(maxProductPrice));
    setPriceRange({ min: 0, max: Math.ceil(maxProductPrice) });
  };

  const loadCategoriesFromAPI = async () => {
    try {
      const response = await fetch('/api/categories');
      const apiCategories = await response.json();
      const categoryNames = apiCategories.map((cat: any) => cat.name);
      setCategories(['All', ...categoryNames]);
    } catch (error) {
      console.error('Error loading categories:', error);
    }
  };

  const getFilteredProducts = () => {
    let filtered = [...products];

    if (searchTerm && searchTerm.trim()) {
      const term = searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.code && p.code.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }
    
    filtered = filtered.filter(product => 
      product.price >= priceRange.min && product.price <= priceRange.max
    );
    
    return filtered;
  };

  const addToCart = async (product: Product) => {
    setCartLoading(product.id);
    const cartItem: CartItem = { ...product, size: 'M', quantity: 1 };
    const newCart = [...cart, cartItem];
    setCart(newCart);
    await saveCartToMongoDB(newCart);
    setCartLoading(null);
  };

  const removeFromCart = (productId: number, size?: string) => {
    const newCart = cart.filter(item => !(item.id === productId && (!size || item.size === size)));
    setCart(newCart);
    saveCartToMongoDB(newCart);
  };

  const getTotal = () => {
    return cart.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const placeOrder = async () => {
    const isRegistered = localStorage.getItem('userRegistered');
    const userId = localStorage.getItem('userId');
    
    if (!isRegistered || !userId) {
      window.location.href = '/register';
      return;
    }

    setOrderLoading(true);
    try {
      console.log('Placing order for userId:', userId);
      console.log('Current cart:', cart);
      
      // Ensure cart is saved to MongoDB first
      if (cart.length > 0) {
        console.log('Saving cart before order:', cart);
        await saveCartToMongoDB(cart);
        // Wait a moment for save to complete
        await new Promise(resolve => setTimeout(resolve, 500));
      } else {
        console.log('No items in cart');
        setError('Cart is empty');
        return;
      }
      
      // Create order in MongoDB
      const orderResponse = await fetch('/api/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId,
          customerInfo: {
            name: getUserName(),
            email: localStorage.getItem('userEmail') || '',
            phone: localStorage.getItem('userPhone') || '',
            address: localStorage.getItem('userAddress') || ''
          }
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
      `${item.code || 'N/A'} - ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}`
    ).join('\\n');
    
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
    ].filter((line: any) => line && line.trim()).join('\\n');
    
    const customerInfo = `CUSTOMER DETAILS:\r\nName: ${currentCustomer.name || getUserName()}\r\nEmail: ${currentCustomer.email || 'N/A'}\r\nPhone: ${currentCustomer.phone || 'N/A'}\r\nCountry: ${currentCustomer.country || 'N/A'}\r\n\r\nDELIVERY ADDRESS:\r\n${addressLines || 'N/A'}`;
    
    const message = `🛍️ NEW ORDER - Fashion Breeze\r\n\r\nORDER ITEMS:\r\n${orderDetails}\r\n\r\nTOTAL: LKR ${getTotal().toFixed(2)}\r\n\r\n${customerInfo}`;
    
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

  const openProductModal = (product: Product) => {
    setSelectedProduct(product);
    setShowProductModal(true);
    setZoomLevel(1);
    setModalQuantity(1);
    setSelectedSize('M');
    setCurrentSlide(0);
  };

  const closeProductModal = () => {
    setShowProductModal(false);
    setSelectedProduct(null);
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
      let botResponse = 'I\'m here to help! You can ask about products, sizes, or orders.';
      
      if (userMessage.includes('discount') || userMessage.includes('sale')) {
        botResponse = 'We have amazing discounts! Use code SUMMER20 for 20% off on selected items.';
      } else if (userMessage.includes('size') || userMessage.includes('sizing')) {
        botResponse = 'Our sizes range from XS to XXL. Each product shows available sizes and stock levels.';
      } else if (userMessage.includes('order') || userMessage.includes('delivery')) {
        botResponse = 'Orders are processed via WhatsApp. Add items to cart and click "Place Order via WhatsApp".';
      } else if (userMessage.includes('price') || userMessage.includes('cost')) {
        botResponse = 'All prices are in LKR. Check our promotional sidebar for current deals!';
      }
      
      setChatMessages(prev => [...prev, { text: botResponse, isBot: true }]);
    }, 1000);
  };

  const getStars = (rating: number): string[] => {
    const stars = [];
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
      1: 'Premium quality cotton t-shirt with comfortable fit. Perfect for casual wear.',
      2: 'Classic denim jeans with modern cut. Durable and stylish for everyday use.',
    };
    const productId = selectedProduct?.id;
    return productId ? descriptions[productId] || 'High-quality fashion item.' : 'High-quality fashion item.';
  };

  const getCustomerComments = (): Comment[] => {
    return [
      { customer: 'Sarah M.', rating: 5, date: '2 days ago', comment: 'Excellent quality and fast shipping! Highly recommend.' },
      { customer: 'John D.', rating: 4, date: '1 week ago', comment: 'Good product, fits perfectly. Great value for money.' },
      { customer: 'Emma L.', rating: 5, date: '2 weeks ago', comment: 'Love it! Exactly as described. Will buy again.' },
      { customer: 'Mike R.', rating: 4, date: '3 weeks ago', comment: 'Nice quality, arrived quickly. Very satisfied.' },
      { customer: 'Lisa K.', rating: 5, date: '1 month ago', comment: 'Perfect! Great material and comfortable fit.' }
    ];
  };

  const getSimilarProducts = () => {
    const currentProduct = selectedProduct;
    if (!currentProduct) return [];
    
    return products
      .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
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

  const getProductImages = () => {
    const product = selectedProduct;
    if (!product) return [];
    return product.images || [product.image];
  };

  const changeMainImage = (imageUrl: string) => {
    if (selectedProduct) {
      setSelectedProduct({ ...selectedProduct, image: imageUrl });
    }
  };

  const getSizeStock = (size: string) => {
    const product = selectedProduct;
    if (!product?.sizes) return 0;
    const sizeData = (product.sizes as any)[size];
    return typeof sizeData === 'object' ? sizeData.stock : sizeData || 0;
  };

  const isSizeInStock = (size: string) => {
    return getSizeStock(size) > 0;
  };

  const getSizePrice = (size: string) => {
    const product = selectedProduct;
    if (!product?.sizes) return product?.price || 0;
    const sizeData = (product.sizes as any)[size];
    return typeof sizeData === 'object' ? sizeData.price : product?.price || 0;
  };

  const increaseQuantity = () => {
    setModalQuantity(modalQuantity + 1);
  };

  const decreaseQuantity = () => {
    if (modalQuantity > 1) {
      setModalQuantity(modalQuantity - 1);
    }
  };

  const onSizeSelect = (size: string) => {
    if (!isSizeInStock(size)) return;
    setSelectedSize(size);
  };

  const addToCartFromModal = async () => {
    const product = selectedProduct;
    if (!product || !isSizeInStock(selectedSize)) return;
    
    setCartLoading(product.id);
    const sizePrice = getSizePrice(selectedSize);
    const cartItem: CartItem = {
      ...product,
      size: selectedSize,
      quantity: modalQuantity,
      price: sizePrice,
      category: product.category,
      selectedSizeData: {
        size: selectedSize,
        stock: getSizeStock(selectedSize),
        price: sizePrice
      }
    };
    
    const existing = cart.find(item => item.id === product.id && item.size === selectedSize);
    let newCart;
    if (existing) {
      existing.quantity += modalQuantity;
      newCart = [...cart];
      setCart(newCart);
    } else {
      newCart = [...cart, cartItem];
      setCart(newCart);
    }
    
    // Save cart to MongoDB with size info
    await saveCartToMongoDB(newCart);
    setCartLoading(null);
    closeProductModal();
  };

  return (
    <div className="client-app">
      <BootstrapClient />
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
              {mounted && isUserRegistered() ? (
                <div className="dropdown">
                  <button className="btn btn-outline-dark dropdown-toggle" type="button" data-bs-toggle="dropdown">
                    <i className="bi bi-person-circle me-2"></i>{getUserName()}
                  </button>
                  <ul className="dropdown-menu" style={{zIndex: 1060}}>
                    <li><a className="dropdown-item" href="/profile">
                      <i className="bi bi-person me-2"></i>My Profile
                    </a></li>
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
              <button className="btn position-relative btn-outline-dark" onClick={() => setShowCart(!showCart)}>
                <i className="bi bi-cart3"></i> Cart
                <span className="position-absolute top-0 start-100 translate-middle badge rounded-pill" style={{background: 'var(--accent-color)'}}>
                  {cart.length}
                </span>
              </button>
            </div>
          </div>
        </div>
      </nav>

      {/* Promotion Banner */}
      <div className="py-2" style={{background: 'linear-gradient(90deg, #dc2626, #ef4444, #f97316)', color: 'white'}}>
        <div className="container">
          <div className="row align-items-center">
            <div className="col-md-8">
              <div className="d-flex align-items-center">
                <i className="bi bi-megaphone-fill me-2 fs-4"></i>
                <span className="fw-bold me-3">🎉 MEGA SALE:</span>
                <span>Up to 70% OFF + FREE Shipping on orders over LKR 3000!</span>
                <span className="badge bg-warning text-dark ms-2">LIMITED TIME</span>
              </div>
            </div>
            <div className="col-md-4 text-md-end">
              <span className="small">Use code: <strong>MEGA70</strong></span>
            </div>
          </div>
        </div>
      </div>

      {/* Success Alert */}
      {orderPlaced && (
        <div className="container mt-3">
          <div className="alert alert-success alert-dismissible fade show" role="alert">
            <i className="bi bi-check-circle-fill me-2"></i>
            <strong>Success!</strong> Your order has been placed successfully!
          </div>
        </div>
      )}

      {/* Hero Carousel */}
      <div id="heroCarousel" className="carousel slide" data-bs-ride="carousel" data-bs-interval="5000">
        <div className="carousel-indicators">
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="0" className="active"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="1"></button>
          <button type="button" data-bs-target="#heroCarousel" data-bs-slide-to="2"></button>
        </div>
        <div className="carousel-inner">
          <div className="carousel-item active">
            <div className="hero-slide bg-gradient-1">
              <div className="container">
                <div className="row align-items-center min-vh-50">
                  <div className="col-lg-6 text-white">
                    <h1 className="display-3 fw-bold mb-4">Fashion Breeze</h1>
                    <p className="lead mb-4">Discover the latest trends in fashion. Premium quality clothing delivered to your door.</p>
                    <button className="btn btn-primary btn-lg px-4" onClick={scrollToProducts}>Shop Now</button>
                  </div>
                  <div className="col-lg-6">
                    <img src="https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=600&h=400&fit=crop" className="img-fluid rounded shadow" alt="Fashion Collection" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="hero-slide bg-gradient-2">
              <div className="container">
                <div className="row align-items-center min-vh-50">
                  <div className="col-lg-6 text-white">
                    <h1 className="display-3 fw-bold mb-4">Summer Collection</h1>
                    <p className="lead mb-4">Beat the heat with our stylish summer wear. Comfortable and trendy designs.</p>
                    <button className="btn btn-primary btn-lg px-4">Explore</button>
                  </div>
                  <div className="col-lg-6">
                    <img src="https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=600&h=400&fit=crop" className="img-fluid rounded shadow" alt="Summer Collection" />
                  </div>
                </div>
              </div>
            </div>
          </div>
          <div className="carousel-item">
            <div className="hero-slide bg-gradient-3">
              <div className="container">
                <div className="row align-items-center min-vh-50">
                  <div className="col-lg-6 text-white">
                    <h1 className="display-3 fw-bold mb-4">Free Delivery</h1>
                    <p className="lead mb-4">Free shipping on orders over $50. Fast and reliable delivery service.</p>
                    <button className="btn btn-primary btn-lg px-4">Order Now</button>
                  </div>
                  <div className="col-lg-6">
                    <img src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=600&h=400&fit=crop" className="img-fluid rounded shadow" alt="Free Delivery" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <button className="carousel-control-prev" type="button" data-bs-target="#heroCarousel" data-bs-slide="prev">
          <span className="carousel-control-prev-icon"></span>
        </button>
        <button className="carousel-control-next" type="button" data-bs-target="#heroCarousel" data-bs-slide="next">
          <span className="carousel-control-next-icon"></span>
        </button>
      </div>

      {/* Category Navigation */}
      <div className="py-4" style={{background: 'var(--gradient-primary)', boxShadow: 'var(--shadow-lg)'}}>
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-12">
              <div className="d-flex flex-wrap justify-content-center gap-2">
                {categories.map(category => (
                  <button 
                    key={category}
                    className={`btn btn-sm text-white fw-bold ${selectedCategory === category ? 'btn-light text-dark' : 'btn-outline-light'}`}
                    onClick={() => setSelectedCategory(category)}
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
        <div className="container" style={{position: 'relative', zIndex: 2}}>
          <div className="row">
            <div className="col-lg-3 mb-4">
              {/* Hot Deals Sidebar */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{background: 'linear-gradient(135deg, #dc2626, #ef4444)', color: 'white'}}>
                  <h5 className="mb-0"><i className="bi bi-fire me-2"></i>🔥 Hot Deals</h5>
                </div>
                <div className="card-body p-3">
                  <div className="mb-3 p-3 rounded" style={{background: 'linear-gradient(135deg, #fef3c7, #fbbf24)', border: '2px dashed #f59e0b'}}>
                    <div className="text-center">
                      <h6 className="fw-bold text-dark mb-2">🎉 FLASH SALE</h6>
                      <p className="small mb-2 text-dark">Up to <span className="fw-bold fs-5">50% OFF</span></p>
                      <p className="small text-muted mb-0">Limited time offer!</p>
                    </div>
                  </div>
                  <div className="mb-3 p-3 rounded" style={{background: 'linear-gradient(135deg, #dbeafe, #3b82f6)', color: 'white'}}>
                    <div className="text-center">
                      <h6 className="fw-bold mb-2">💳 FREE SHIPPING</h6>
                      <p className="small mb-2">On orders over <span className="fw-bold">LKR 5000</span></p>
                      <p className="small mb-0 opacity-75">No minimum quantity</p>
                    </div>
                  </div>
                  <div className="p-3 rounded" style={{background: 'linear-gradient(135deg, #dcfce7, #10b981)', color: 'white'}}>
                    <div className="text-center">
                      <h6 className="fw-bold mb-2">🎁 BUY 2 GET 1</h6>
                      <p className="small mb-2">On selected items</p>
                      <p className="small mb-0 opacity-75">Mix & match available</p>
                    </div>
                  </div>
                </div>
              </div>
              
              {/* Filters Sidebar */}
              <div className="card border-0 shadow-sm mb-4">
                <div className="card-header" style={{background: 'var(--gradient-primary)', color: 'white'}}>
                  <h5 className="mb-0"><i className="bi bi-funnel me-2"></i>Advanced Filters</h5>
                </div>
                <div className="card-body">
                  {/* Search */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3"><i className="bi bi-search me-2"></i>Search Products</h6>
                    <div className="input-group">
                      <input 
                        type="text" 
                        className="form-control" 
                        placeholder="Search by name or code..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                      />
                      <button className="btn btn-outline-secondary" type="button">
                        <i className="bi bi-search"></i>
                      </button>
                    </div>
                  </div>

                  {/* Price Range */}
                  <div className="mb-4">
                    <h6 className="fw-bold mb-3"><i className="bi bi-currency-dollar me-2"></i>Price Range</h6>
                    <div className="text-center mb-3">
                      <span className="badge bg-primary px-3 py-2">LKR {priceRange.min} - LKR {priceRange.max}</span>
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Min: LKR {priceRange.min}</label>
                      <input 
                        type="range" 
                        className="form-range"
                        min="0" 
                        max={maxPrice}
                        value={priceRange.min}
                        onChange={(e) => setPriceRange({...priceRange, min: +e.target.value})}
                      />
                    </div>
                    <div className="mb-3">
                      <label className="form-label small">Max: LKR {priceRange.max}</label>
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
            </div>
            
            <div className="col-lg-9">
              <div className="text-center mb-5">
                <h2 className="fw-bold mb-3" style={{color: 'var(--dark-color)', fontSize: '3rem'}}>Our Collection</h2>
                <div style={{width: '100px', height: '4px', background: 'var(--gradient-primary)', margin: '0 auto', borderRadius: '2px'}}></div>
                <p className="mt-3 fs-5" style={{color: 'var(--gray-600)'}}>Discover our premium selection of fashion items</p>
              </div>

              <div className="text-center mb-3">
                <small style={{color: 'var(--gray-600)'}}>Showing {getFilteredProducts().length} of {products.length} products</small>
              </div>

              {loading ? (
                <div className="text-center py-5">
                  <div className="spinner-border text-primary" role="status" style={{width: '3rem', height: '3rem'}}>
                    <span className="visually-hidden">Loading...</span>
                  </div>
                  <p className="mt-3 text-muted">Loading products...</p>
                </div>
              ) : (
                <div className="row g-4">
                  {getFilteredProducts().map(product => (
                  <div key={product.id} className="col-lg-3 col-md-6">
                    <div className={`card h-100 shadow-sm border-0 product-card ${product.status === 'outofstock' ? 'out-of-stock' : ''}`}>
                      <div className="position-relative">
                        <img src={product.image} alt={product.name} className="card-img-top" />
                        {product.discount && (
                          <span className="position-absolute top-0 end-0 m-2 badge bg-danger fs-6">-{product.discount}%</span>
                        )}
                      </div>
                      <div className="card-body d-flex flex-column">
                        <h5 className="card-title fw-bold">{product.name}</h5>
                        <div className="d-flex gap-2 mb-2">
                          <span className="badge bg-secondary">{product.category}</span>
                          <span className="badge bg-primary">{product.code}</span>
                        </div>
                        <p className="card-text text-success fs-4 fw-bold mb-3">LKR {product.price}</p>
                        {product.status === 'outofstock' ? (
                          <>
                            <span className="badge bg-danger mb-2">Out of Stock</span>
                            <button className="btn btn-secondary mt-auto" disabled>
                              <i className="bi bi-x-circle me-2"></i>Out of Stock
                            </button>
                          </>
                        ) : (
                          <div className="d-flex gap-2 mt-auto">
                            <button onClick={() => openProductModal(product)} className="btn btn-outline-primary flex-fill">
                              <i className="bi bi-eye me-1"></i>Details
                            </button>
                            <button onClick={() => addToCart(product)} className="btn btn-primary flex-fill" disabled={cartLoading === product.id}>
                              {cartLoading === product.id ? <i className="bi bi-hourglass-split me-1"></i> : <i className="bi bi-cart-plus me-1"></i>}Add
                            </button>
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
      </div>

      {/* Cart Modal */}
      {showCart && (
        <div className="modal d-block" tabIndex={-1} style={{background: 'rgba(0,0,0,0.5)'}}>
          <div className="modal-dialog modal-lg">
            <div className="modal-content">
              <div className="modal-header bg-primary text-white">
                <h5 className="modal-title"><i className="bi bi-cart3 me-2"></i>Your Cart</h5>
                <button type="button" className="btn" onClick={() => setShowCart(false)} style={{background: '#ffffff', color: 'black', border: '1px solid #000000', width: '35px', height: '35px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1rem', transition: 'all 0.3s ease'}}>
                  <i className="bi bi-x"></i>
                </button>
              </div>
              <div className="modal-body">
                {cart.length === 0 ? (
                  <div className="text-center py-4">
                    <i className="bi bi-cart-x display-1 text-muted"></i>
                    <p className="mt-3 text-muted">Your cart is empty</p>
                  </div>
                ) : (
                  <>
                    {cart.map((item, index) => (
                      <div key={`${item.id}-${item.size}-${index}`} className="d-flex align-items-center border-bottom py-3">
                        <img src={item.image} alt={item.name} className="rounded me-3" style={{width: '60px', height: '60px', objectFit: 'cover'}} />
                        <div className="flex-grow-1">
                          <h6 className="mb-1">{item.name}</h6>
                          <small className="text-muted">Quantity: {item.quantity}</small>
                          {item.size && (
                            <><br /><small className="text-muted">Size: {item.size}</small></>
                          )}
                        </div>
                        <div className="d-flex align-items-center gap-3">
                          <span className="fw-bold text-success">LKR {(item.price * item.quantity).toFixed(2)}</span>
                          <button onClick={() => removeFromCart(item.id, item.size)} className="btn btn-outline-danger btn-sm">
                            <i className="bi bi-trash"></i>
                          </button>
                        </div>
                      </div>
                    ))}
                    <div className="text-end mt-4">
                      <h4 className="fw-bold">Total: <span className="text-success">LKR {getTotal().toFixed(2)}</span></h4>
                    </div>
                  </>
                )}
              </div>
              {cart.length > 0 && (
                <div className="modal-footer">
                  <button onClick={placeOrder} className="btn btn-success btn-lg w-100" disabled={orderLoading}>
                    {orderLoading ? (
                      <><i className="bi bi-hourglass-split me-2"></i>Processing Order...</>
                    ) : (
                      <><i className="bi bi-check-circle me-2"></i>Place Order</>
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
                        <img 
                          src={selectedProduct.image} 
                          alt={selectedProduct.name}
                          className="img-fluid product-zoom"
                          style={{
                            transform: `scale(${zoomLevel})`,
                            transition: 'all 0.4s cubic-bezier(0.4, 0, 0.2, 1)',
                            cursor: 'zoom-in',
                            maxHeight: '65vh',
                            objectFit: 'contain',
                            borderRadius: '8px'
                          }}
                          onClick={toggleZoom}
                        />
                        <div className="zoom-controls position-absolute" style={{top: '1rem', right: '1rem'}}>
                          <div className="btn-group" style={{background: 'rgba(0,0,0,0.7)', borderRadius: '8px', backdropFilter: 'blur(10px)'}}>
                            <button className="btn btn-sm" onClick={zoomOut} style={{background: 'transparent', color: 'white', border: 'none', padding: '0.5rem'}}>
                              <i className="bi bi-zoom-out"></i>
                            </button>
                            <button className="btn btn-sm" onClick={zoomIn} style={{background: 'transparent', color: 'white', border: 'none', padding: '0.5rem'}}>
                              <i className="bi bi-zoom-in"></i>
                            </button>
                          </div>
                        </div>
                      </div>
                      <div className="d-flex justify-content-center gap-2 mt-4">
                        {getProductImages().map((img, index) => (
                          <div key={index} className="position-relative">
                            <img 
                              src={img} 
                              className="rounded"
                              style={{
                                cursor: 'pointer',
                                width: '70px',
                                height: '70px',
                                objectFit: 'cover',
                                border: '2px solid',
                                transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                opacity: img === selectedProduct.image ? '1' : '0.7',
                                borderColor: img === selectedProduct.image ? '#000000' : 'rgba(255,255,255,0.2)'
                              }}
                              onClick={() => changeMainImage(img)}
                            />
                            {img === selectedProduct.image && (
                              <div className="position-absolute top-0 start-0 w-100 h-100 rounded" style={{border: '2px solid #000000', background: 'rgba(0,0,0,0.1)'}}></div>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="col-lg-5">
                    <div className="sticky-top" style={{top: '20px'}}>
                      <div className="mb-4">
                        <h1 className="fw-light mb-2" style={{color: '#ffffff', fontSize: '2rem', letterSpacing: '0.5px'}}>{selectedProduct.name}</h1>
                        <p className="text-muted mb-0" style={{fontSize: '0.9rem', letterSpacing: '0.3px'}}>{selectedProduct.code}</p>
                      </div>
                      <div className="d-flex justify-content-between align-items-center mb-4 p-3 rounded" style={{background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.1)'}}>
                        <div>
                          <h2 className="mb-1" style={{color: '#ffffff', fontWeight: 600, fontSize: '2.2rem'}}>LKR {selectedProduct.price}</h2>
                          <small className="text-muted">Inclusive of all taxes</small>
                        </div>
                        <div className="text-end">
                          <div className="d-flex align-items-center mb-1">
                            <div className="text-warning me-2">
                              {getStars(selectedProduct.rating || 0).map((star, index) => (
                                <i key={index} className={`bi ${star}`} style={{fontSize: '0.9rem'}}></i>
                              ))}
                            </div>
                            <span className="fw-semibold" style={{color: '#ffffff'}}>{selectedProduct.rating}</span>
                          </div>
                          <small className="text-muted">({selectedProduct.reviewCount} reviews)</small>
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Product Details</h6>
                        <p style={{color: '#b0b0b0', lineHeight: 1.7, fontSize: '0.95rem'}}>{getProductDescription()}</p>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Select Size</h6>
                        <div className="d-flex flex-wrap gap-2">
                          {availableSizes.map(size => (
                            <div key={size} className="text-center">
                              <button 
                                className="btn d-flex flex-column"
                                style={{
                                  minWidth: '60px',
                                  height: '60px',
                                  border: '1px solid',
                                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                                  fontWeight: 500,
                                  padding: '0.25rem',
                                  background: selectedSize === size ? 'rgba(0,0,0,0.8)' : (isSizeInStock(size) ? 'rgba(255,255,255,0.05)' : 'rgba(128,128,128,0.1)'),
                                  borderColor: selectedSize === size ? '#000000' : (isSizeInStock(size) ? 'rgba(255,255,255,0.2)' : 'rgba(128,128,128,0.3)'),
                                  color: isSizeInStock(size) ? '#ffffff' : '#666'
                                }}
                                disabled={!isSizeInStock(size)}
                                onClick={() => onSizeSelect(size)}
                              >
                                <span style={{fontSize: '0.9rem'}}>{size}</span>
                                <small style={{fontSize: '0.7rem', opacity: 0.8}}>LKR {getSizePrice(size)}</small>
                              </button>
                            </div>
                          ))}
                        </div>
                      </div>

                      <div className="mb-4">
                        <h6 className="fw-semibold mb-3" style={{color: '#ffffff', fontSize: '1rem', letterSpacing: '0.3px'}}>Quantity</h6>
                        <div className="d-flex align-items-center gap-3">
                          <button className="btn btn-outline-light" onClick={decreaseQuantity} disabled={modalQuantity <= 1}>
                            <i className="bi bi-dash"></i>
                          </button>
                          <span className="fw-bold" style={{fontSize: '1.2rem', minWidth: '40px', textAlign: 'center'}}>{modalQuantity}</span>
                          <button className="btn btn-outline-light" onClick={increaseQuantity}>
                            <i className="bi bi-plus"></i>
                          </button>
                        </div>
                      </div>

                      {selectedProduct.status === 'outofstock' ? (
                        <button className="btn btn-secondary btn-lg w-100" disabled>
                          <i className="bi bi-x-circle me-2"></i>Out of Stock
                        </button>
                      ) : (
                        <button className="btn btn-primary btn-lg w-100 mb-4" onClick={addToCartFromModal} disabled={!isSizeInStock(selectedSize) || cartLoading === selectedProduct?.id}>
                          {cartLoading === selectedProduct?.id ? (
                            <><i className="bi bi-hourglass-split me-2"></i>Adding to Cart...</>
                          ) : (
                            <><i className="bi bi-cart-plus me-2"></i>Add to Cart - LKR {(getSizePrice(selectedSize) * modalQuantity).toFixed(2)}</>
                          )}
                        </button>
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
                                        {getStars(product.rating || 0).map((star, index) => (
                                          <i key={index} className={`bi ${star}`} style={{fontSize: '8px'}}></i>
                                        ))}
                                      </div>
                                      <small className="text-muted">{product.rating}</small>
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
                        <h6 className="fw-semibold mb-4" style={{color: '#ffffff', fontSize: '1.1rem', letterSpacing: '0.3px'}}>Customer Reviews</h6>
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