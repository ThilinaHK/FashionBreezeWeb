const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function debugLogin() {
  const client = new MongoClient('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    const users = db.collection('users');
    
    const admin = await users.findOne({ email: 'admin@fashionbreeze.com' });
    
    if (admin) {
      console.log('Full admin user data:');
      console.log(JSON.stringify(admin, null, 2));
      
      console.log('\nTesting password verification:');
      const isValid = await bcrypt.compare('123', admin.password);
      console.log('Password "123" is valid:', isValid);
      
      console.log('\nChecking required fields:');
      console.log('Has email:', !!admin.email);
      console.log('Has password:', !!admin.password);
      console.log('Has role:', !!admin.role);
      console.log('Status:', admin.status);
      
    } else {
      console.log('No admin user found!');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

debugLogin();