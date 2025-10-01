import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-profile',
  imports: [CommonModule],
  templateUrl: './profile.html',
  styleUrl: './profile.scss'
})
export class Profile implements OnInit {
  customerData = signal<any>({});
  isRegistered = signal(false);

  constructor(private router: Router) {}

  ngOnInit() {
    this.loadCustomerData();
  }

  loadCustomerData() {
    const isUserRegistered = localStorage.getItem('userRegistered') === 'true';
    if (!isUserRegistered) {
      this.router.navigate(['/register']);
      return;
    }

    this.isRegistered.set(true);
    const customers = JSON.parse(localStorage.getItem('customers') || '[]');
    const currentCustomer = customers[customers.length - 1] || {};
    this.customerData.set(currentCustomer);
  }

  logout() {
    localStorage.removeItem('userRegistered');
    localStorage.removeItem('userName');
    localStorage.removeItem('customers');
    localStorage.removeItem('cart');
    this.router.navigate(['/client']);
  }

  getCountryName() {
    const countries = [
      { code: 'US', name: 'United States' },
      { code: 'UK', name: 'United Kingdom' },
      { code: 'CA', name: 'Canada' },
      { code: 'AU', name: 'Australia' },
      { code: 'IN', name: 'India' },
      { code: 'LK', name: 'Sri Lanka' },
      { code: 'DE', name: 'Germany' },
      { code: 'FR', name: 'France' },
      { code: 'JP', name: 'Japan' }
    ];
    const country = countries.find(c => c.code === this.customerData().country);
    return country ? country.name : this.customerData().country;
  }
}