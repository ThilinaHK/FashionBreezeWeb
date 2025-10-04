const { MongoClient } = require('mongodb');

async function verifyAdmin() {
  const client = new MongoClient('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0');
  
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    
    // Check users collection
    const users = db.collection('users');
    const adminInUsers = await users.findOne({ email: 'admin@fashionbreeze.com' });
    
    // Check customers collection
    const customers = db.collection('customers');
    const adminInCustomers = await customers.findOne({ email: 'admin@fashionbreeze.com' });
    
    console.log('Admin in USERS collection:', adminInUsers ? 'YES' : 'NO');
    console.log('Admin in CUSTOMERS collection:', adminInCustomers ? 'YES' : 'NO');
    
    if (adminInUsers) {
      console.log('✅ Admin user is correctly in users table');
    }
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

verifyAdmin();