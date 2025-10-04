const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function fixAdmin() {
  const client = new MongoClient('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    const users = db.collection('users');
    
    // Delete existing admin if any
    await users.deleteMany({ email: 'admin@fashionbreeze.com' });
    
    const hashedPassword = await bcrypt.hash('123', 10);
    
    // Get next ID
    const lastUser = await users.findOne({}, { sort: { id: -1 } });
    const nextId = lastUser ? lastUser.id + 1 : 1;
    
    await users.insertOne({
      id: nextId,
      username: 'admin',
      email: 'admin@fashionbreeze.com',
      password: hashedPassword,
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
      updatedAt: new Date(),
      lastLogin: null
    });
    
    console.log('Admin user created successfully with all required fields');
    
    // Verify
    const admin = await users.findOne({ email: 'admin@fashionbreeze.com' });
    console.log('Verification:', {
      email: admin.email,
      username: admin.username,
      role: admin.role,
      status: admin.status
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

fixAdmin();