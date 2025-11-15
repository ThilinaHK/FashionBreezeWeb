const { MongoClient } = require('mongodb');
const bcrypt = require('bcryptjs');

async function updateAdminPassword() {
  const client = new MongoClient('mongodb://localhost:27017');
  
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    const users = db.collection('users');
    
    const hashedPassword = await bcrypt.hash('123', 10);
    
    const result = await users.updateOne(
      { email: 'admin@fashionbreeze.com' },
      { $set: { password: hashedPassword } }
    );
    
    console.log('Password updated:', result.modifiedCount > 0 ? 'Success' : 'Failed');
    
    // Verify the update
    const admin = await users.findOne({ email: 'admin@fashionbreeze.com' });
    const isValid = await bcrypt.compare('123', admin.password);
    console.log('Password verification:', isValid ? 'Valid' : 'Invalid');
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

updateAdminPassword();