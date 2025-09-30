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
  }

  getFilteredProducts() {
    let filtered = this.products();
    
    if (this.selectedCategory() !== 'All') {
      filtered = filtered.filter(product => product.category === this.selectedCategory());
    }
    
    filtered = filtered.filter(product => 
      product.price >= this.priceRange().min && product.price <= this.priceRange().max
    );
    
    return filtered;
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
      `${item.code} - ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
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

TOTAL: $${this.getTotal().toFixed(2)}

${customerInfo}`;
    
    const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
  }

  loadProducts() {
    this.http.get('assets/products.txt', { responseType: 'text' }).subscribe({
      next: (data) => {
        try {
          const products = JSON.parse(data);
          this.products.set(products);
          this.updateCategories();
        } catch (error) {
          console.error('Error parsing products:', error);
          this.loadFallbackProducts();
        }
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
        "price": 19.99,
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
        "price": 49.99,
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
        "price": 24.99,
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
  availableSizes = signal(['XS', 'S', 'M', 'L', 'XL', 'XXL']);
  currentSlide = signal(0);

  getSizeStock(size: string) {
    const product = this.selectedProduct();
    return product?.sizes?.[size] || 0;
  }

  isSizeInStock(size: string) {
    return this.getSizeStock(size) > 0;
  }

  addToCart(product: any) {
    const existing = this.cart().find(item => item.id === product.id);
    if (existing) {
      existing.quantity++;
    } else {
      this.cart.update(cart => [...cart, { ...product, quantity: 1 }]);
    }
  }

  removeFromCart(productId: number) {
    this.cart.update(cart => cart.filter(item => item.id !== productId));
  }

  getTotal() {
    return this.cart().reduce((total, item) => total + (item.price * item.quantity), 0);
  }

  placeOrder() {
    const isRegistered = localStorage.getItem('userRegistered');
    if (!isRegistered) {
      window.location.href = '/register';
      return;
    }
    this.sendToWhatsApp();
    this.orderPlaced.set(true);
    this.cart.set([]);
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

  addToCartFromModal() {
    const product = this.selectedProduct();
    if (!product) return;
    
    const cartItem = {
      ...product,
      size: this.selectedSize,
      quantity: this.modalQuantity()
    };
    
    const existing = this.cart().find(item => item.id === product.id && item.size === this.selectedSize);
    if (existing) {
      existing.quantity += this.modalQuantity();
    } else {
      this.cart.update(cart => [...cart, cartItem]);
    }
    
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
}
