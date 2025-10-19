const https = require('https');

function makeRequest(path, method = 'GET', data = null) {
  return new Promise((resolve, reject) => {
    const options = {
      hostname: 'fashion-breeze-web.vercel.app',
      port: 443,
      path,
      method,
      headers: { 'Content-Type': 'application/json' }
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

async function testUserManagement() {
  console.log('🧪 Testing User Management System...\n');

  // 1. Test creating a new user
  console.log('👤 Creating new user:');
  const newUser = {
    username: 'testmanager',
    email: 'manager@test.com',
    password: 'password123',
    role: 'manager',
    status: 'active'
  };

  try {
    const createResult = await makeRequest('/api/users', 'POST', newUser);
    console.log(`Status: ${createResult.status}`);
    if (createResult.data.success) {
      console.log('✅ User created successfully');
      console.log(`User ID: ${createResult.data.user.id}`);
      console.log(`Role: ${createResult.data.user.role}`);
    } else {
      console.log('❌ User creation failed:', createResult.data.error);
    }
  } catch (e) {
    console.log('❌ Error creating user:', e.message);
  }

  // 2. Test admin login with new user
  console.log('\n🔐 Testing admin login with new user:');
  try {
    const loginResult = await makeRequest('/api/auth/admin-login', 'POST', {
      email: 'manager@test.com',
      password: 'password123'
    });
    
    console.log(`Status: ${loginResult.status}`);
    if (loginResult.data.success) {
      console.log('✅ Login successful');
      console.log(`User: ${loginResult.data.user.username}`);
      console.log(`Role: ${loginResult.data.user.role}`);
      console.log(`Is Admin: ${loginResult.data.isAdmin}`);
    } else {
      console.log('❌ Login failed:', loginResult.data.error);
    }
  } catch (e) {
    console.log('❌ Error during login:', e.message);
  }

  // 3. Test fetching all users
  console.log('\n📋 Fetching all users:');
  try {
    const usersResult = await makeRequest('/api/users');
    console.log(`Status: ${usersResult.status}`);
    if (Array.isArray(usersResult.data)) {
      console.log(`✅ Found ${usersResult.data.length} users`);
      usersResult.data.forEach(user => {
        console.log(`- ${user.username} (${user.email}) - ${user.role}`);
      });
    } else {
      console.log('❌ Failed to fetch users');
    }
  } catch (e) {
    console.log('❌ Error fetching users:', e.message);
  }

  console.log('\n🏁 User Management Test Complete!');
}

testUserManagement();