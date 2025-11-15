const mongoose = require('mongoose');

const MONGODB_URI = 'mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  icon: String,
  subcategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.model('Category', categorySchema);

const categories = [
  {
    name: 'For Men',
    slug: 'for-men',
    description: 'Men\'s fashion and accessories',
    icon: 'bi-person',
    subcategories: [
      { name: 'T-Shirts', slug: 't-shirts', description: 'Casual and formal t-shirts' },
      { name: 'Jeans', slug: 'jeans', description: 'Denim jeans and pants' },
      { name: 'Polo Shirts', slug: 'polo-shirts', description: 'Polo and collar shirts' },
      { name: 'Hoodies', slug: 'hoodies', description: 'Hoodies and sweatshirts' },
      { name: 'Chinos', slug: 'chinos', description: 'Chino pants and trousers' },
      { name: 'Blazers', slug: 'blazers', description: 'Formal blazers and jackets' },
      { name: 'Sneakers', slug: 'sneakers', description: 'Casual and sports sneakers' }
    ],
    sortOrder: 1
  },
  {
    name: 'For Women',
    slug: 'for-women',
    description: 'Women\'s fashion and accessories',
    icon: 'bi-person-dress',
    subcategories: [
      { name: 'Dresses', slug: 'dresses', description: 'Casual and formal dresses' },
      { name: 'Jeans', slug: 'jeans', description: 'Women\'s denim jeans' },
      { name: 'Blouses', slug: 'blouses', description: 'Blouses and tops' },
      { name: 'Heels', slug: 'heels', description: 'High heels and formal shoes' },
      { name: 'Cardigans', slug: 'cardigans', description: 'Cardigans and sweaters' },
      { name: 'Leggings', slug: 'leggings', description: 'Leggings and tights' },
      { name: 'Handbags', slug: 'handbags', description: 'Handbags and purses' },
      { name: 'Skirts', slug: 'skirts', description: 'Mini and maxi skirts' }
    ],
    sortOrder: 2
  },
  {
    name: 'Kids',
    slug: 'kids',
    description: 'Kids fashion and accessories',
    icon: 'bi-person-hearts',
    subcategories: [
      { name: 'Hoodies', slug: 'hoodies', description: 'Kids hoodies and sweatshirts' },
      { name: 'Dresses', slug: 'dresses', description: 'Girls dresses' },
      { name: 'Shorts', slug: 'shorts', description: 'Kids shorts and pants' },
      { name: 'Sneakers', slug: 'sneakers', description: 'Kids sneakers and shoes' },
      { name: 'T-Shirts', slug: 't-shirts', description: 'Kids t-shirts and tops' },
      { name: 'Polo Shirts', slug: 'polo-shirts', description: 'Kids polo shirts' },
      { name: 'Jeans', slug: 'jeans', description: 'Kids denim jeans' },
      { name: 'Skirts', slug: 'skirts', description: 'Girls skirts' }
    ],
    sortOrder: 3
  },
  {
    name: 'Accessories',
    slug: 'accessories',
    description: 'Fashion accessories',
    icon: 'bi-bag',
    subcategories: [
      { name: 'Wallets', slug: 'wallets', description: 'Wallets and purses' },
      { name: 'Sunglasses', slug: 'sunglasses', description: 'Sunglasses and eyewear' },
      { name: 'Watches', slug: 'watches', description: 'Watches and timepieces' },
      { name: 'Caps', slug: 'caps', description: 'Caps and hats' }
    ],
    sortOrder: 4
  }
];

async function setupCategories() {
  try {
    console.log('Connecting to MongoDB...\n');
    await mongoose.connect(MONGODB_URI);
    console.log('Connected successfully');
    
    await Category.deleteMany({});
    console.log('Cleared existing categories');
    
    await Category.insertMany(categories);
    console.log('Added categories with subcategories');
    
    const count = await Category.countDocuments();
    console.log(`Total categories: ${count}`);
    
    await mongoose.disconnect();
    console.log('\nDisconnected from MongoDB');
  } catch (error) {
    console.error('Error:', error);
  }
}

setupCategories();