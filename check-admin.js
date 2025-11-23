const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function checkAdmin() {
  const client = new MongoClient('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    const users = db.collection('users');
    
    // Check if admin user exists
    const admin = await users.findOne({ email: 'admin@fashionbreeze.com' });
    
    if (admin) {
      console.log('Admin user found:', {
        email: admin.email,
        role: admin.role,
        status: admin.status,
        hasPassword: !!admin.password
      });
      
      // Test password
      const isValid = await bcrypt.compare('123', admin.password);
      console.log('Password "123" is valid:', isValid);
    } else {
      console.log('Admin user not found. Creating...');
      
      const hashedPassword = await bcrypt.hash('123', 10);
      
      await users.insertOne({
        email: 'admin@fashionbreeze.com',
        password: hashedPassword,
        name: 'Admin User',
        role: 'admin',
        status: 'active',
        privileges: {
          products: true,
          categories: true,
          orders: true,
          customers: true,
          users: true,
          analytics: true
        },
        createdAt: new Date(),
        lastLogin: null
      });
      
      console.log('Admin user created successfully');
    }
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

checkAdmin();