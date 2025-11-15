const { MongoClient } = require('mongodb');

require('dotenv').config({ path: '.env.local' });
const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/fashionBreeze';

const sampleProducts = [
  {
    id: 101,
    name: "Premium Cotton T-Shirt",
    code: "PCT001",
    price: 2999,
    category: "For Men",
    brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    additionalImages: [
      "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop"
    ],
    description: "Premium quality cotton t-shirt with multiple color options and comfortable fit.",
    sizes: [
      { size: "S", stock: 10, price: 2999 },
      { size: "M", stock: 15, price: 2999 },
      { size: "L", stock: 12, price: 2999 },
      { size: "XL", stock: 8, price: 2999 }
    ],
    status: "active",
    specifications: {
      material: "100% Cotton",
      careInstructions: "Machine wash cold",
      weight: "Regular fit",
      origin: "Sri Lanka"
    }
  },
  {
    id: 102,
    name: "Designer Denim Jacket",
    code: "DDJ002",
    price: 8999,
    category: "For Women",
    brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1544966503-7cc5ac882d5f?w=400&h=400&fit=crop",
    additionalImages: [
      "https://images.unsplash.com/photo-1551698618-1dfe5d97d256?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1506629905607-d405b7a30db9?w=400&h=400&fit=crop",
      "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop"
    ],
    description: "Stylish denim jacket perfect for casual and semi-formal occasions.",
    sizes: [
      { size: "XS", stock: 5, price: 8999 },
      { size: "S", stock: 8, price: 8999 },
      { size: "M", stock: 10, price: 8999 },
      { size: "L", stock: 6, price: 8999 }
    ],
    status: "active",
    specifications: {
      material: "Premium Denim",
      careInstructions: "Machine wash cold, hang dry",
      weight: "Medium weight",
      origin: "Sri Lanka"
    }
  }
];

async function addSampleProducts() {
  const client = new MongoClient(uri);
  
  try {
    await client.connect();
    console.log('Connected to MongoDB');
    
    const db = client.db();
    const collection = db.collection('products');
    
    // Remove existing sample products
    await collection.deleteMany({ id: { $in: [101, 102] } });
    console.log('Removed existing sample products');
    
    // Insert new sample products
    const result = await collection.insertMany(sampleProducts);
    console.log(`Inserted ${result.insertedCount} sample products with multiple images`);
    
    // Verify the products were inserted
    const products = await collection.find({ id: { $in: [101, 102] } }).toArray();
    products.forEach(product => {
      console.log(`Product: ${product.name}`);
      console.log(`Main image: ${product.image}`);
      console.log(`Additional images: ${product.additionalImages?.length || 0}`);
      console.log('---');
    });
    
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

addSampleProducts();