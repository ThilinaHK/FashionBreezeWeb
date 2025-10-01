const { MongoClient } = require('mongodb');
const fs = require('fs');
const path = require('path');

// Load environment variables
require('dotenv').config({ path: path.join(__dirname, '..', '.env.local') });

const MONGODB_URI = process.env.MONGODB_URI;

async function seedDatabase() {
  if (!MONGODB_URI) {
    console.error('MONGODB_URI not found in environment variables');
    process.exit(1);
  }

  const client = new MongoClient(MONGODB_URI);

  try {
    await client.connect();
    console.log('Connected to MongoDB');

    const db = client.db('fashionBreeze');
    const productsCollection = db.collection('products');

    // Load products data
    const productsPath = path.join(__dirname, '..', 'public', 'products.json');
    const productsData = JSON.parse(fs.readFileSync(productsPath, 'utf8'));

    // Clear existing products
    await productsCollection.deleteMany({});
    console.log('Cleared existing products');

    // Insert new products
    const result = await productsCollection.insertMany(productsData);
    console.log(`Inserted ${result.insertedCount} products`);

    // Create indexes for better performance
    await productsCollection.createIndex({ category: 1 });
    await productsCollection.createIndex({ name: 'text', code: 'text' });
    await productsCollection.createIndex({ price: 1 });
    await productsCollection.createIndex({ status: 1 });
    console.log('Created database indexes');

    // Seed categories
    const categoriesCollection = db.collection('categories');
    const categories = [
      { id: 1, name: "For Men", slug: "for-men", description: "Men's clothing and accessories", active: true },
      { id: 2, name: "For Women", slug: "for-women", description: "Women's fashion and accessories", active: true },
      { id: 3, name: "Kids", slug: "kids", description: "Children's clothing and accessories", active: true },
      { id: 4, name: "Hair", slug: "hair", description: "Hair care products", active: true },
      { id: 5, name: "Fragrances", slug: "fragrances", description: "Perfumes and body sprays", active: true },
      { id: 6, name: "Skin", slug: "skin", description: "Skincare products", active: true },
      { id: 7, name: "Home", slug: "home", description: "Home decor and accessories", active: true },
      { id: 8, name: "Gifting", slug: "gifting", description: "Gift items and services", active: true },
      { id: 9, name: "Mind & Body", slug: "mind-body", description: "Wellness and fitness products", active: true }
    ];
    
    await categoriesCollection.deleteMany({});
    const categoryResult = await categoriesCollection.insertMany(categories);
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    console.log(`Inserted ${categoryResult.insertedCount} categories`);

    console.log('Database seeding completed successfully!');
  } catch (error) {
    console.error('Error seeding database:', error);
  } finally {
    await client.close();
  }
}

seedDatabase();