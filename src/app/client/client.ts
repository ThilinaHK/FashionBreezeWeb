import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-client',
  imports: [CommonModule, FormsModule],
  templateUrl: './client.html',
  styleUrl: './client.scss'
})
export class Client implements OnInit {
  products = signal<any[]>([]);
  selectedCategory = signal('All');
  categories = signal<string[]>([]);
  priceRange = signal({ min: 0, max: 100 });
  maxPrice = signal(100);

  constructor(private http: HttpClient) {}

  ngOnInit() {
    this.loadProducts();
    this.loadCartFromStorage();
    this.startProductUpdateListener();
  }

  startProductUpdateListener() {
    // Listen for storage changes from admin
    window.addEventListener('storage', (e) => {
      if (e.key === 'products_updated') {
        this.loadProducts();
      }
    });
    
    // Also check periodically for same-tab updates
    setInterval(() => {
      const timestamp = localStorage.getItem('products_timestamp');
      if (timestamp && parseInt(timestamp) > this.lastUpdateCheck) {
        this.loadProducts();
        this.lastUpdateCheck = parseInt(timestamp);
      }
    }, 2000);
  }

  private lastUpdateCheck = 0;

  loadCartFromStorage() {
    const savedCart = localStorage.getItem('cart');
    if (savedCart) {
      try {
        const cartData = JSON.parse(savedCart);
        this.cart.set(cartData);
      } catch (error) {
        console.error('Error loading cart from storage:', error);
      }
    }
  }

  getFilteredProducts() {
    return this.applyFilters();
  }

  setCategory(category: string) {
    this.selectedCategory.set(category);
  }

  updateCategories() {
    const uniqueCategories = [...new Set(this.products().map(p => p.category))];
    this.categories.set(['All', ...uniqueCategories]);
    const maxProductPrice = Math.max(...this.products().map(p => p.price));
    this.maxPrice.set(Math.ceil(maxProductPrice));
    this.priceRange.set({ min: 0, max: Math.ceil(maxProductPrice) });
  }

  setPriceRange(min: number, max: number) {
    this.priceRange.set({ min, max });
  }

  scrollToProducts() {
    document.getElementById('products-section')?.scrollIntoView({ behavior: 'smooth' });
  }

  sendToWhatsApp() {
    const orderDetails = this.cart().map(item => 
      `${item.code || 'N/A'} - ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - LKR ${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    const customerData = JSON.parse(localStorage.getItem('customers') || '[]');
    const currentCustomer = customerData[customerData.length - 1] || {};
    
    const addressLines = [
      currentCustomer.address?.line1,
      currentCustomer.address?.line2,
      currentCustomer.address?.line3
    ].filter(line => line && line.trim()).join('\n');
    
    const customerInfo = `CUSTOMER DETAILS:
Name: ${currentCustomer.name || this.getUserName()}
Email: ${currentCustomer.email || 'N/A'}
Phone: ${currentCustomer.phone || 'N/A'}
Country: ${currentCustomer.country || 'N/A'}

DELIVERY ADDRESS:
${addressLines || 'N/A'}`;
    
    const message = `🛍️ NEW ORDER - Fashion Breeze

ORDER ITEMS:
${orderDetails}

TOTAL: LKR ${this.getTotal().toFixed(2)}

${customerInfo}`;
    
    const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  loadProducts() {
    // Check for real-time updates first
    const updatedProducts = localStorage.getItem('products_updated');
    if (updatedProducts) {
      try {
        const products = JSON.parse(updatedProducts);
        this.products.set(products);
        this.updateCategories();
        return;
      } catch (error) {
        console.error('Error parsing updated products:', error);
      }
    }
    
    // Fallback to JSON file
    this.http.get<any[]>('assets/products.json').subscribe({
      next: (products) => {
        this.products.set(products);
        this.updateCategories();
      },
      error: (error) => {
        console.error('Error loading products:', error);
        this.loadFallbackProducts();
      }
    });
  }

  loadFallbackProducts() {
    this.products.set([
      {
        "id": 1,
        "name": "Classic White T-Shirt",
        "code": "CL001",
        "price": 5997,
        "category": "For Men",
        "image": "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        "images": [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1576566588028-4147f3842f27?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop"
        ],
        "sizes": { "XS": 5, "S": 12, "M": 8, "L": 15, "XL": 3, "XXL": 0 },
        "status": "instock"
      },
      {
        "id": 2,
        "name": "Blue Denim Jeans",
        "code": "CL002",
        "price": 14997,
        "category": "For Men",
        "image": "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        "images": [
          "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1582552938357-32b906df40cb?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1565084888279-aca607ecce0c?w=400&h=400&fit=crop"
        ],
        "sizes": { "XS": 0, "S": 7, "M": 10, "L": 6, "XL": 4, "XXL": 2 },
        "status": "instock"
      },
      {
        "id": 3,
        "name": "Scented Candle Set",
        "code": "HM001",
        "price": 7497,
        "category": "Home",
        "image": "https://images.unsplash.com/photo-1602874801006-e26d3d17d0a5?w=400&h=400&fit=crop",
        "images": [
          "https://images.unsplash.com/photo-1602874801006-e26d3d17d0a5?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1578662996442-48f60103fc96?w=400&h=400&fit=crop"
        ],
        "sizes": { "Small": 15, "Medium": 12, "Large": 8 },
        "status": "instock"
      }
    ]);
    this.updateCategories();
  }
  
  cart = signal<any[]>([]);
  showCart = signal(false);
  orderPlaced = signal(false);
  showProductModal = signal(false);
  selectedProduct = signal<any>(null);
  zoomLevel = signal(1);
  selectedSize = 'M';
  modalQuantity = signal(1);
  previousSelectedSize = '';
  availableSizes = signal(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  currentSlide = signal(0);

  getSizeStock(size: string) {
    const product = this.selectedProduct();
    return product?.sizes?.[size]?.stock || 0;
  }

  isSizeInStock(size: string) {
    return this.getSizeStock(size) > 0;
  }

  getSizePrice(size: string) {
    const product = this.selectedProduct();
    return product?.sizes?.[size]?.price || product?.price || 0;
  }

  addToCart(product: any) {
    const cartItem = { ...product, size: 'M', quantity: 1, price: product.price };
    this.cart.update(cart => [...cart, cartItem]);
  }

  removeFromCart(productId: number, size?: string) {
    this.cart.update(cart => cart.filter(item => !(item.id === productId && (!size || item.size === size))));
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(this.cart()));
  }

  getTotal() {
    return this.cart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder() {
    const isRegistered = localStorage.getItem('userRegistered');
    if (!isRegistered) {
      // Save cart before redirecting to register
      localStorage.setItem('cart', JSON.stringify(this.cart()));
      window.location.href = '/register';
      return;
    }
    this.sendToWhatsApp();
    this.orderPlaced.set(true);
    this.cart.set([]);
    localStorage.removeItem('cart');
    this.showCart.set(false);
    setTimeout(() => this.orderPlaced.set(false), 3000);
  }

  getUserName() {
    return localStorage.getItem('userName') || 'Guest';
  }

  isUserRegistered() {
    return localStorage.getItem('userRegistered') === 'true';
  }

  openProductModal(product: any) {
    this.selectedProduct.set(product);
    this.showProductModal.set(true);
    this.zoomLevel.set(1);
    this.modalQuantity.set(1);
    this.selectedSize = 'M';
    this.previousSelectedSize = '';
    this.currentSlide.set(0);
  }

  closeProductModal() {
    this.showProductModal.set(false);
    this.selectedProduct.set(null);
  }

  toggleZoom() {
    this.zoomLevel.set(this.zoomLevel() === 1 ? 2 : 1);
  }

  zoomIn() {
    this.zoomLevel.set(Math.min(this.zoomLevel() + 0.5, 3));
  }

  zoomOut() {
    this.zoomLevel.set(Math.max(this.zoomLevel() - 0.5, 1));
  }

  getProductImages() {
    const product = this.selectedProduct();
    if (!product) return [];
    return product.images || [product.image];
  }

  changeMainImage(imageUrl: string) {
    if (this.selectedProduct()) {
      this.selectedProduct.update(product => ({ ...product, image: imageUrl }));
    }
  }

  getProductDescription() {
    const descriptions: { [key: number]: string } = {
      1: 'Premium quality cotton t-shirt with comfortable fit. Perfect for casual wear.',
      2: 'Classic denim jeans with modern cut. Durable and stylish for everyday use.',
      3: 'Beautiful floral dress perfect for summer occasions. Lightweight and breathable.',
      4: 'Genuine leather jacket with premium finish. A timeless piece for your wardrobe.',
      5: 'Comfortable white sneakers suitable for sports and casual wear.',
      6: 'Cozy hoodie made from soft cotton blend. Perfect for cooler weather.',
      7: 'Professional formal shirt ideal for office and business meetings.',
      8: 'Comfortable khaki shorts perfect for summer activities and casual outings.'
    };
    const productId = this.selectedProduct()?.id;
    return productId ? descriptions[productId] || 'High-quality fashion item.' : 'High-quality fashion item.';
  }

  increaseQuantity() {
    this.modalQuantity.set(this.modalQuantity() + 1);
  }

  decreaseQuantity() {
    if (this.modalQuantity() > 1) {
      this.modalQuantity.set(this.modalQuantity() - 1);
    }
  }

  onSizeSelect(size: string) {
    if (!this.isSizeInStock(size)) return;
    
    this.selectedSize = size;
    
    // Auto add to cart when size is selected (only if it's a new selection)
    if (this.previousSelectedSize !== size) {
      this.previousSelectedSize = size;
      this.addToCartFromModal();
    }
  }

  addToCartFromModal() {
    const product = this.selectedProduct();
    if (!product || !this.isSizeInStock(this.selectedSize)) return;
    
    const sizePrice = this.getSizePrice(this.selectedSize);
    const cartItem = {
      ...product,
      size: this.selectedSize,
      quantity: this.modalQuantity(),
      price: sizePrice
    };
    
    const existing = this.cart().find(item => item.id === product.id && item.size === this.selectedSize);
    if (existing) {
      existing.quantity += this.modalQuantity();
    } else {
      this.cart.update(cart => [...cart, cartItem]);
    }
    
    // Save cart to localStorage
    localStorage.setItem('cart', JSON.stringify(this.cart()));
    
    this.closeProductModal();
  }

  getStars(rating: number): string[] {
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
  }

  getSimilarProducts() {
    const currentProduct = this.selectedProduct();
    if (!currentProduct) return [];
    
    return this.products()
      .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
      .slice(0, 6);
  }

  nextSlide() {
    if (this.currentSlide() < this.getMaxSlides()) {
      this.currentSlide.set(this.currentSlide() + 1);
    }
  }

  previousSlide() {
    if (this.currentSlide() > 0) {
      this.currentSlide.set(this.currentSlide() - 1);
    }
  }

  getMaxSlides() {
    const totalProducts = this.getSimilarProducts().length;
    return Math.max(0, totalProducts - 2);
  }

  getCustomerComments() {
    const productId = this.selectedProduct()?.id;
    const comments = [
      { customer: 'Sarah M.', rating: 5, date: '2 days ago', comment: 'Excellent quality and fast shipping! Highly recommend.' },
      { customer: 'John D.', rating: 4, date: '1 week ago', comment: 'Good product, fits perfectly. Great value for money.' },
      { customer: 'Emma L.', rating: 5, date: '2 weeks ago', comment: 'Love it! Exactly as described. Will buy again.' },
      { customer: 'Mike R.', rating: 4, date: '3 weeks ago', comment: 'Nice quality, arrived quickly. Very satisfied.' },
      { customer: 'Lisa K.', rating: 5, date: '1 month ago', comment: 'Perfect! Great material and comfortable fit.' }
    ];
    return comments;
  }

  getDiscountedProducts() {
    return this.products().filter(p => p.discount && p.status === 'instock');
  }

  getBannerPromotion() {
    const discountedProducts = this.getDiscountedProducts();
    if (discountedProducts.length === 0) return null;
    
    const maxDiscount = Math.max(...discountedProducts.map(p => p.discount));
    const promoProduct = discountedProducts.find(p => p.discount === maxDiscount);
    
    return {
      discount: maxDiscount,
      promoCode: promoProduct?.promoCode || 'SALE',
      productCount: discountedProducts.length,
      savings: discountedProducts.reduce((total, p) => total + (p.originalPrice - p.price), 0)
    };
  }

  showChatbot = signal(false);
  chatMessages = signal<any[]>([{ text: 'Hi! How can I help you today?', isBot: true }]);
  chatInput = '';

  toggleChatbot() {
    this.showChatbot.set(!this.showChatbot());
  }

  sendMessage() {
    if (!this.chatInput.trim()) return;
    
    this.chatMessages.update(messages => [...messages, { text: this.chatInput, isBot: false }]);
    const userMessage = this.chatInput.toLowerCase();
    this.chatInput = '';
    
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
      
      this.chatMessages.update(messages => [...messages, { text: botResponse, isBot: true }]);
    }, 1000);
  }

  searchTerm = '';

  applyFilters() {
    let filtered = [...this.products()];

    if (this.searchTerm && this.searchTerm.trim()) {
      const term = this.searchTerm.toLowerCase().trim();
      filtered = filtered.filter(p => 
        (p.name && p.name.toLowerCase().includes(term)) ||
        (p.code && p.code.toLowerCase().includes(term)) ||
        (p.category && p.category.toLowerCase().includes(term))
      );
    }

    if (this.selectedCategory() !== 'All') {
      filtered = filtered.filter(product => product.category === this.selectedCategory());
    }
    
    filtered = filtered.filter(product => 
      product.price >= this.priceRange().min && product.price <= this.priceRange().max
    );
    
    return filtered;
  }

  clearFilters() {
    this.selectedCategory.set('All');
    this.searchTerm = '';
    this.priceRange.set({ min: 0, max: this.maxPrice() });
  }

  showAboutModal() {
    alert('About Us: Fashion Breeze is your premier destination for trendy and affordable fashion. We bring you the latest styles with quality you can trust.');
  }

  showContactModal() {
    alert('Contact Us:\nPhone: +94 70 700 3722\nEmail: info@fashionbreeze.lk\nAddress: Colombo, Sri Lanka');
  }

  showProfileModal() {
    const customerData = JSON.parse(localStorage.getItem('customers') || '[]');
    const currentCustomer = customerData[customerData.length - 1] || {};
    const profile = `Profile Information:\nName: ${currentCustomer.name || 'N/A'}\nEmail: ${currentCustomer.email || 'N/A'}\nPhone: ${currentCustomer.phone || 'N/A'}\nCountry: ${currentCustomer.country || 'N/A'}`;
    alert(profile);
  }

  logout() {
    localStorage.removeItem('userRegistered');
    localStorage.removeItem('userName');
    localStorage.removeItem('customers');
    localStorage.removeItem('cart');
    window.location.reload();
  }
}
