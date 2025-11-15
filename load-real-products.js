const mongoose = require('mongoose');
const fs = require('fs');
const path = require('path');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String, default: 'Fashion Breeze' },
  image: { type: String, required: true },
  additionalImages: [String],
  status: { 
    type: String, 
    enum: ['active', 'inactive', 'outofstock', 'instock'], 
    default: 'active' 
  },
  sizes: [{
    size: String,
    stock: { type: Number, default: 0 },
    price: { type: Number }
  }],
  description: String,
  specifications: {
    material: String,
    careInstructions: String,
    weight: String,
    origin: String
  },
  rating: { type: Number, default: 0 },
  reviewCount: { type: Number, default: 0 },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

async function loadRealProducts() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const Product = mongoose.model('Product', productSchema);
    
    // Read products from JSON file
    const productsPath = path.join(__dirname, 'public', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    // Transform and insert products
    const transformedProducts = productsData.map(product => {
      // Convert sizes object to array format
      const sizesArray = Object.entries(product.sizes || {}).map(([size, stock]) => ({
        size,
        stock: typeof stock === 'number' ? stock : 0,
        price: product.price
      }));
      
      return {
        id: product.id,
        name: product.name,
        code: product.code,
        price: product.price,
        category: product.category,
        brand: 'Fashion Breeze',
        image: product.image,
        additionalImages: [],
        status: product.status === 'instock' ? 'active' : product.status,
        sizes: sizesArray,
        description: `Premium quality ${product.name.toLowerCase()} from Fashion Breeze collection`,
        specifications: {
          material: product.category.includes('Men') ? '100% Cotton' : 
                   product.category.includes('Women') ? 'Premium Blend' : 
                   'Soft Cotton',
          careInstructions: 'Machine wash cold',
          weight: 'Regular Fit',
          origin: 'Sri Lanka'
        },
        rating: product.rating || 0,
        reviewCount: product.reviewCount || 0
      };
    });
    
    await Product.insertMany(transformedProducts);
    console.log(`✅ Successfully loaded ${transformedProducts.length} real products from products.json`);
    
    // Display loaded products
    transformedProducts.forEach(product => {
      console.log(`- ${product.name} (${product.code}) - LKR ${product.price} - ${product.category}`);
    });
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

loadRealProducts();