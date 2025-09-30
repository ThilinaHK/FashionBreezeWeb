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
      this.router.navigate(['/client']);
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
    
    // Download as JSON file
    this.downloadCustomersFile(existingCustomers);
    
    console.log('Customer registered:', customerData);
  }
  
  downloadCustomersFile(customers: any[]) {
    const dataStr = JSON.stringify(customers, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    
    const link = document.createElement('a');
    link.href = url;
    link.download = 'customers.json';
    link.click();
    
    URL.revokeObjectURL(url);
  }
}
