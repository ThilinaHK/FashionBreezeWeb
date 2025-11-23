const mongoose = require('mongoose');

async function checkDatabase() {
  try {
    // Read the .env.local file to get the MongoDB URI
    const fs = require('fs');
    const path = require('path');
    
    let MONGODB_URI = 'mongodb://localhost:27017/fashionbreeze';
    
    try {
      const envPath = path.join(__dirname, '.env.local');
      const envContent = fs.readFileSync(envPath, 'utf8');
      const mongoLine = envContent.split('\n').find(line => line.startsWith('MONGODB_URI='));
      if (mongoLine) {
        MONGODB_URI = mongoLine.split('=')[1].trim();
        console.log('Using MongoDB URI from .env.local');
      }
    } catch (e) {
      console.log('Using default MongoDB URI');
    }
    
    console.log('Connecting to:', MONGODB_URI.replace(/\/\/.*@/, '//***:***@'));
    
    // Fix the tls parameter if needed
    if (MONGODB_URI.includes('tls=true')) {
      // The URI is already correct
    } else if (MONGODB_URI.includes('tls&')) {
      MONGODB_URI = MONGODB_URI.replace('tls&', 'tls=true&');
    }
    
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      ssl: true,
      sslValidate: false
    });
    console.log('Connected to MongoDB successfully');

    // List all collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));

    // Check products collection
    const Product = mongoose.connection.db.collection('products');
    const productCount = await Product.countDocuments();
    console.log('Total products in database:', productCount);

    if (productCount > 0) {
      const sampleProduct = await Product.findOne();
      console.log('Sample product structure:');
      console.log('- ID:', sampleProduct._id);
      console.log('- Name:', sampleProduct.name);
      console.log('- Description:', sampleProduct.description || 'NOT SET');
      console.log('- Specifications:', sampleProduct.specifications || 'NOT SET');
      console.log('- Status:', sampleProduct.status);
    }

    // Check if there are any products with different status
    const allStatuses = await Product.distinct('status');
    console.log('Product statuses in database:', allStatuses);

  } catch (error) {
    console.error('Database check failed:', error.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

checkDatabase();