// Simple script to seed admin user
const fetch = require('node-fetch');

async function seedAdmin() {
  try {
    const response = await fetch('http://localhost:3000/api/seed-admin', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' }
    });
    
    const data = await response.json();
    console.log('Admin seeding result:', data);
  } catch (error) {
    console.error('Error seeding admin:', error);
  }
}

seedAdmin();