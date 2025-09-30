import { Component, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  imports: [FormsModule, CommonModule],
  templateUrl: './login.html',
  styleUrl: './login.scss'
})
export class Login {
  username = signal('');
  password = signal('');
  errorMessage = signal('');

  constructor(private router: Router) {}

  onLogin() {
    if (this.username() === 'admin' && this.password() === 'test123') {
      localStorage.setItem('isLoggedIn', 'true');
      localStorage.setItem('userRole', 'admin');
      localStorage.setItem('adminUser', 'admin');
      this.router.navigate(['/dashboard']);
    } else {
      this.errorMessage.set('Invalid admin credentials');
    }
  }
}
