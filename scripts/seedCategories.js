const { MongoClient } = require('mongodb');
require('dotenv').config({ path: require('path').join(__dirname, '..', '.env.local') });

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

async function seedCategories() {
  const client = new MongoClient(process.env.MONGODB_URI);
  try {
    await client.connect();
    const db = client.db('fashionBreeze');
    const categoriesCollection = db.collection('categories');
    
    await categoriesCollection.deleteMany({});
    const result = await categoriesCollection.insertMany(categories);
    await categoriesCollection.createIndex({ slug: 1 }, { unique: true });
    
    console.log(`Inserted ${result.insertedCount} categories`);
  } catch (error) {
    console.error('Error:', error);
  } finally {
    await client.close();
  }
}

seedCategories();