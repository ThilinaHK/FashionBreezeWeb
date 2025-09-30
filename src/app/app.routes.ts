import { Routes } from '@angular/router';
import { Login } from './login/login';
import { Dashboard } from './dashboard/dashboard';
import { Client } from './client/client';
import { Register } from './register/register';

export const routes: Routes = [
  { path: '', redirectTo: '/client', pathMatch: 'full' },
  { path: 'login', component: Login },
  { path: 'dashboard', component: Dashboard },
  { path: 'client', component: Client },
  { path: 'register', component: Register }
];
