const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://fashionbreeze:fashionbreeze123@cluster0.mongodb.net/fashionBreeze?retryWrites=true&w=majority';

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  image: { type: String, required: true },
  sizes: { type: Object, required: true },
  status: { type: String, default: 'instock' },
  rating: { type: Number, default: 4.0 },
  reviewCount: { type: Number, default: 0 }
});

const Product = mongoose.model('Product', productSchema);

async function checkProducts() {
  try {
    console.log('Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');
    
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);
    
    const products = await Product.find().sort({ id: 1 });
    console.log('\nProducts by category:');
    const categories = {};
    products.forEach(p => {
      if (!categories[p.category]) categories[p.category] = 0;
      categories[p.category]++;
    });
    
    Object.entries(categories).forEach(([cat, count]) => {
      console.log(`${cat}: ${count} products`);
    });
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

checkProducts();