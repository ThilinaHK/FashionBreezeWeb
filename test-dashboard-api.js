const https = require('https');

function makeRequest(hostname, path) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname,
      port: 443,
      path,
      method: 'GET',
      headers: { 'Content-Type': 'application/json' }
    };

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
    req.end();
  });
}

async function testAPIs() {
  console.log('🔍 Testing Product APIs...\n');

  // Test dashboard API
  console.log('📊 Dashboard API:');
  try {
    const dashboardProducts = await makeRequest('fashion-breeze-web.vercel.app', '/api/products');
    console.log(`Status: ${dashboardProducts.status}`);
    console.log(`Products found: ${Array.isArray(dashboardProducts.data) ? dashboardProducts.data.length : 0}`);
    if (Array.isArray(dashboardProducts.data) && dashboardProducts.data.length > 0) {
      console.log('First product:', dashboardProducts.data[0].name || 'No name');
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  console.log('\n🏪 Main Store API:');
  try {
    const storeProducts = await makeRequest('fashion-breeze.vercel.app', '/api/products');
    console.log(`Status: ${storeProducts.status}`);
    console.log(`Products found: ${Array.isArray(storeProducts.data) ? storeProducts.data.length : 0}`);
    if (Array.isArray(storeProducts.data) && storeProducts.data.length > 0) {
      console.log('First product:', storeProducts.data[0].name || 'No name');
    }
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }
}

testAPIs();