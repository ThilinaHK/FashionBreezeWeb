import { Component, signal, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  imports: [CommonModule, FormsModule],
  templateUrl: './dashboard.html',
  styleUrl: './dashboard.scss'
})
export class Dashboard implements OnInit {
  products = signal<any[]>([]);
  filteredProducts = signal<any[]>([]);
  editingProduct = signal<any>(null);
  showEditModal = signal(false);
  showFilters = signal(false);
  selectedCategory = '';
  selectedStatus = '';
  selectedPriceRange = '';
  activeTab = 'details';

  constructor(private router: Router, private http: HttpClient) {}

  ngOnInit() {
    this.checkLogin();
    this.loadProducts();
  }

  checkLogin() {
    const isLoggedIn = localStorage.getItem('isLoggedIn');
    const userRole = localStorage.getItem('userRole');
    
    if (!isLoggedIn || isLoggedIn !== 'true' || userRole !== 'admin') {
      this.router.navigate(['/login']);
    }
  }

  loadProducts() {
    this.http.get('assets/products.txt', { responseType: 'text' }).subscribe({
      next: (data) => {
        try {
          const products = JSON.parse(data);
          this.products.set(products);
          this.filteredProducts.set(products);
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
    const fallbackProducts = [
      { id: 1, name: 'Classic White T-Shirt', code: 'CL001', price: 19.99, category: 'Clothing', image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop', status: 'instock' },
      { id: 2, name: 'Blue Denim Jeans', code: 'CL002', price: 49.99, category: 'Clothing', image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop', status: 'instock' },
      { id: 3, name: 'Floral Summer Dress', code: 'DR001', price: 39.99, category: 'Dresses', image: 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop', status: 'instock' },
      { id: 4, name: 'Black Leather Jacket', code: 'JK001', price: 89.99, category: 'Jackets', image: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400&h=400&fit=crop', status: 'outofstock' },
      { id: 5, name: 'White Sneakers', code: 'FW001', price: 69.99, category: 'Footwear', image: 'https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400&h=400&fit=crop', status: 'instock' },
      { id: 6, name: 'Gray Hoodie', code: 'HD001', price: 34.99, category: 'Hoodies', image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop', status: 'instock' },
      { id: 7, name: 'Blue Formal Shirt', code: 'SH001', price: 29.99, category: 'Shirts', image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400&h=400&fit=crop', status: 'instock' },
      { id: 8, name: 'Khaki Shorts', code: 'ST001', price: 24.99, category: 'Shorts', image: 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400&h=400&fit=crop', status: 'instock' },
      { id: 9, name: 'Herbal Shampoo', code: 'BT001', price: 12.99, category: 'Beauty', image: 'https://images.unsplash.com/photo-1556228578-8c89e6adf883?w=400&h=400&fit=crop', status: 'instock' },
      { id: 10, name: 'Luxury Perfume', code: 'BT002', price: 89.99, category: 'Beauty', image: 'https://images.unsplash.com/photo-1541643600914-78b084683601?w=400&h=400&fit=crop', status: 'instock' },
      { id: 11, name: 'Kids Rainbow T-Shirt', code: 'KD001', price: 15.99, category: 'Kids', image: 'https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop', status: 'instock' },
      { id: 12, name: 'Kids Sneakers', code: 'KD002', price: 39.99, category: 'Kids', image: 'https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400&h=400&fit=crop', status: 'instock' }
    ];
    this.products.set(fallbackProducts);
    this.filteredProducts.set(fallbackProducts);
  }

  editProduct(product: any) {
    this.editingProduct.set({ ...product });
    this.activeTab = 'details';
    this.showEditModal.set(true);
  }

  saveProduct() {
    const updatedProducts = this.products().map(p => 
      p.id === this.editingProduct().id ? this.editingProduct() : p
    );
    this.products.set(updatedProducts);
    this.showEditModal.set(false);
    console.log('Product updated:', this.editingProduct());
  }

  closeEditModal() {
    this.showEditModal.set(false);
    this.editingProduct.set(null);
  }

  logout() {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('userRole');
    localStorage.removeItem('adminUser');
    this.router.navigate(['/login']);
  }

  getAdminUser() {
    return localStorage.getItem('adminUser') || 'Admin';
  }

  toggleFilters() {
    this.showFilters.set(!this.showFilters());
  }

  getUniqueCategories(): string[] {
    const categories = this.products().map(p => p.category);
    return [...new Set(categories)].sort();
  }

  applyFilters() {
    let filtered = this.products();

    if (this.selectedCategory) {
      filtered = filtered.filter(p => p.category === this.selectedCategory);
    }

    if (this.selectedStatus) {
      filtered = filtered.filter(p => p.status === this.selectedStatus);
    }

    if (this.selectedPriceRange) {
      filtered = filtered.filter(p => {
        const price = p.price;
        switch (this.selectedPriceRange) {
          case '0-25': return price <= 25;
          case '25-50': return price > 25 && price <= 50;
          case '50-100': return price > 50 && price <= 100;
          case '100+': return price > 100;
          default: return true;
        }
      });
    }

    this.filteredProducts.set(filtered);
  }

  getCategoryColor(category: string): string {
    const colors: { [key: string]: string } = {
      'For Men': '#007bff',
      'For Women': '#e83e8c', 
      'Hair': '#fd7e14',
      'Fragrances': '#6f42c1',
      'Kids': '#20c997',
      'Skin': '#ffc107',
      'Home': '#dc3545',
      'Gifting': '#198754',
      'Mind & Body': '#0dcaf0'
    };
    return colors[category] || '#6c757d';
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

  getRatingBreakdown(rating: number, totalReviews: number) {
    const breakdown = [
      { stars: 5, percentage: 45, count: Math.floor(totalReviews * 0.45) },
      { stars: 4, percentage: 30, count: Math.floor(totalReviews * 0.30) },
      { stars: 3, percentage: 15, count: Math.floor(totalReviews * 0.15) },
      { stars: 2, percentage: 7, count: Math.floor(totalReviews * 0.07) },
      { stars: 1, percentage: 3, count: Math.floor(totalReviews * 0.03) }
    ];
    return breakdown;
  }

  getRecentReviews() {
    return [
      { customer: 'Sarah M.', rating: 5, date: '2 days ago', comment: 'Excellent quality and fast shipping!' },
      { customer: 'John D.', rating: 4, date: '1 week ago', comment: 'Good product, fits perfectly.' },
      { customer: 'Emma L.', rating: 5, date: '2 weeks ago', comment: 'Love it! Exactly as described.' }
    ];
  }

  getSimilarProducts(currentProduct: any) {
    return this.products()
      .filter(p => p.id !== currentProduct.id && p.category === currentProduct.category)
      .slice(0, 4);
  }
}
