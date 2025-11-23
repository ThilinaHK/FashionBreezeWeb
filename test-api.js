const http = require('http');

// Test the products API endpoint
const options = {
  hostname: 'localhost',
  port: 3000,
  path: '/api/products',
  method: 'GET',
  headers: {
    'Content-Type': 'application/json'
  }
};

const req = http.request(options, (res) => {
  let data = '';
  
  res.on('data', (chunk) => {
    data += chunk;
  });
  
  res.on('end', () => {
    try {
      const products = JSON.parse(data);
      console.log(`API returned ${products.length} products`);
      if (products.length > 0) {
        console.log('First product:', products[0].name);
      }
    } catch (error) {
      console.log('Response:', data);
    }
  });
});

req.on('error', (error) => {
  console.error('API test failed:', error.message);
});

req.end();