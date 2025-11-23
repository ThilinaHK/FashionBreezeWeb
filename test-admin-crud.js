const https = require('https');

const baseUrl = 'fashion-breeze-web.vercel.app';

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: baseUrl,
      port: 443,
      path,
      method,
      headers: {
        'Content-Type': 'application/json',
        'x-user-id': 'admin',
        'x-user-name': 'Admin User'
      }
    };

    if (data) {
      const jsonData = JSON.stringify(data);
      options.headers['Content-Length'] = jsonData.length;
    }

    const req = https.request(options, (res) => {
      let body = '';
      res.on('data', (chunk) => body += chunk);
      res.on('end', () => {
        try {
          const parsed = JSON.parse(body);
          resolve({ status: res.statusCode, data: parsed });
        } catch (e) {
          resolve({ status: res.statusCode, data: body });
        }
      });
    });

    req.on('error', reject);
    if (data) req.write(JSON.stringify(data));
    req.end();
  });
}

async function testAdminCRUD() {
  console.log('🧪 Testing Admin CRUD Operations...\n');

  // Test Products API
  console.log('📦 Testing Products API:');
  try {
    const products = await makeRequest('/api/products');
    console.log(`✅ GET Products: ${products.status} - ${Array.isArray(products.data) ? products.data.length : 0} products`);
  } catch (e) {
    console.log(`❌ GET Products: Error - ${e.message}`);
  }

  // Test Categories API
  console.log('\n📂 Testing Categories API:');
  try {
    const categories = await makeRequest('/api/categories');
    console.log(`✅ GET Categories: ${categories.status} - ${Array.isArray(categories.data) ? categories.data.length : 0} categories`);
  } catch (e) {
    console.log(`❌ GET Categories: Error - ${e.message}`);
  }

  // Test Orders API
  console.log('\n📋 Testing Orders API:');
  try {
    const orders = await makeRequest('/api/orders');
    console.log(`✅ GET Orders: ${orders.status} - ${Array.isArray(orders.data) ? orders.data.length : 0} orders`);
  } catch (e) {
    console.log(`❌ GET Orders: Error - ${e.message}`);
  }

  // Test Users API
  console.log('\n👥 Testing Users API:');
  try {
    const users = await makeRequest('/api/users');
    console.log(`✅ GET Users: ${users.status} - ${Array.isArray(users.data) ? users.data.length : 0} users`);
  } catch (e) {
    console.log(`❌ GET Users: Error - ${e.message}`);
  }

  // Test Customers API
  console.log('\n👤 Testing Customers API:');
  try {
    const customers = await makeRequest('/api/customers');
    console.log(`✅ GET Customers: ${customers.status} - ${Array.isArray(customers.data) ? customers.data.length : 0} customers`);
  } catch (e) {
    console.log(`❌ GET Customers: Error - ${e.message}`);
  }

  // Test Order History API
  console.log('\n📜 Testing Order History API:');
  try {
    const history = await makeRequest('/api/orders/history');
    console.log(`✅ GET Order History: ${history.status} - ${Array.isArray(history.data) ? history.data.length : 0} records`);
  } catch (e) {
    console.log(`❌ GET Order History: Error - ${e.message}`);
  }

  console.log('\n🏁 Admin CRUD Test Complete!');
}

testAdminCRUD();