const fetch = require('node-fetch');

async function testLoginAPI() {
  try {
    const response = await fetch('http://localhost:3000/api/auth/admin-login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        email: 'admin@fashionbreeze.com', 
        password: '123' 
      })
    });
    
    const data = await response.json();
    
    console.log('Status:', response.status);
    console.log('Response:', data);
    
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testLoginAPI();