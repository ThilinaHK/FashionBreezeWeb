const mongoose = require('mongoose');

async function getRealProducts() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const products = await mongoose.connection.db.collection('products').find({}).toArray();
    
    console.log(`Found ${products.length} products in database:`);
    products.forEach(product => {
      console.log(`- ${product.name} (${product.code}) - LKR ${product.price} - Status: ${product.status}`);
    });
    
    return products;
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

getRealProducts();