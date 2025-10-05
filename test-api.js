// Simple API test script
const testAPI = async () => {
  const baseURL = 'http://localhost:3000';
  
  console.log('Testing API endpoints...\n');
  
  // Test products endpoint
  try {
    console.log('1. Testing /api/products...');
    const response = await fetch(`${baseURL}/api/products`);
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} characters`);
    
    try {
      const json = JSON.parse(text);
      console.log(`Products found: ${Array.isArray(json) ? json.length : 'Not an array'}`);
    } catch (e) {
      console.log('Response is not valid JSON');
      console.log('First 200 chars:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n2. Testing /api/categories...');
  try {
    const response = await fetch(`${baseURL}/api/categories`);
    console.log(`Status: ${response.status}`);
    const text = await response.text();
    console.log(`Response length: ${text.length} characters`);
    
    try {
      const json = JSON.parse(text);
      console.log(`Categories found: ${Array.isArray(json) ? json.length : 'Not an array'}`);
    } catch (e) {
      console.log('Response is not valid JSON');
      console.log('First 200 chars:', text.substring(0, 200));
    }
  } catch (error) {
    console.log('Error:', error.message);
  }
  
  console.log('\n3. Testing /api/upload (OPTIONS)...');
  try {
    const response = await fetch(`${baseURL}/api/upload`, { method: 'OPTIONS' });
    console.log(`Status: ${response.status}`);
    console.log('Headers:', Object.fromEntries(response.headers.entries()));
  } catch (error) {
    console.log('Error:', error.message);
  }
};

// Run if this is the main module
if (require.main === module) {
  testAPI().catch(console.error);
}

module.exports = testAPI;