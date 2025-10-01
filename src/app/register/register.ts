import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-register',
  imports: [FormsModule, CommonModule],
  templateUrl: './register.html',
  styleUrl: './register.scss'
})
export class Register {
  name = signal('');
  email = signal('');
  phone = signal('');
  country = signal('US');
  address1 = signal('');
  address2 = signal('');
  address3 = signal('');
  password = signal('');
  errorMessage = signal('');
  
  countries = [
    { code: 'US', name: 'United States', phoneCode: '+1' },
    { code: 'UK', name: 'United Kingdom', phoneCode: '+44' },
    { code: 'CA', name: 'Canada', phoneCode: '+1' },
    { code: 'AU', name: 'Australia', phoneCode: '+61' },
    { code: 'IN', name: 'India', phoneCode: '+91' },
    { code: 'LK', name: 'Sri Lanka', phoneCode: '+94' },
    { code: 'DE', name: 'Germany', phoneCode: '+49' },
    { code: 'FR', name: 'France', phoneCode: '+33' },
    { code: 'JP', name: 'Japan', phoneCode: '+81' }
  ];

  constructor(private router: Router, private http: HttpClient) {}

  onRegister() {
    if (this.name() && this.email() && this.phone() && this.address1() && this.password()) {
      this.saveCustomerData();
      localStorage.setItem('userRegistered', 'true');
      localStorage.setItem('userName', this.name());
      
      // Small delay to ensure WhatsApp opens before navigation
      setTimeout(() => {
        this.router.navigate(['/client']);
      }, 1000);
    } else {
      this.errorMessage.set('Please fill all required fields');
    }
  }
  
  getSelectedCountry() {
    return this.countries.find(c => c.code === this.country());
  }

  saveCustomerData() {
    const customerData = {
      id: Date.now(),
      name: this.name(),
      email: this.email(),
      phone: this.phone(),
      country: this.country(),
      address: {
        line1: this.address1(),
        line2: this.address2(),
        line3: this.address3()
      },
      registeredAt: new Date().toISOString()
    };
    
    // Get existing customers from localStorage
    const existingCustomers = JSON.parse(localStorage.getItem('customers') || '[]');
    existingCustomers.push(customerData);
    
    // Save to localStorage
    localStorage.setItem('customers', JSON.stringify(existingCustomers));
    
    // Redirect to WhatsApp with cart and customer info
    this.redirectToWhatsApp(customerData);
    
    console.log('Customer registered:', customerData);
  }
  
  redirectToWhatsApp(customerData: any) {
    // Get cart data from localStorage
    const cartData = JSON.parse(localStorage.getItem('cart') || '[]');
    
    if (cartData.length === 0) {
      // If no cart items, just redirect to client
      return;
    }
    
    // Format order details
    const orderDetails = cartData.map((item: any) => 
      `${item.code || 'N/A'} - ${item.name}${item.size ? ` (Size: ${item.size})` : ''} - Qty: ${item.quantity} - $${(item.price * item.quantity).toFixed(2)}`
    ).join('\n');
    
    // Calculate total
    const total = cartData.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    // Format address
    const addressLines = [
      customerData.address?.line1,
      customerData.address?.line2,
      customerData.address?.line3
    ].filter(line => line && line.trim()).join('\n');
    
    // Format customer info
    const customerInfo = `CUSTOMER DETAILS:
Name: ${customerData.name}
Email: ${customerData.email}
Phone: ${customerData.phone}
Country: ${this.countries.find(c => c.code === customerData.country)?.name || customerData.country}

DELIVERY ADDRESS:
${addressLines || 'N/A'}`;
    
    // Create WhatsApp message
    const message = `🛍️ NEW ORDER - Fashion Breeze

ORDER ITEMS:
${orderDetails}

TOTAL: LKR ${total.toFixed(2)}

${customerInfo}`;
    
    // Redirect to WhatsApp
    const whatsappUrl = `https://wa.me/94707003722?text=${encodeURIComponent(message)}`;
    window.open(whatsappUrl, '_blank');
    
    // Clear cart after order
    localStorage.removeItem('cart');
  }
}
