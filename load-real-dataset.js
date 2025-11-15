const mongoose = require('mongoose');

const realProducts = [
  {
    id: 1, name: "Premium Cotton T-Shirt", code: "FB001", price: 2500, category: "For Men", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", status: "active",
    sizes: [{size: "S", stock: 25}, {size: "M", stock: 30}, {size: "L", stock: 20}, {size: "XL", stock: 15}],
    description: "Premium quality cotton t-shirt for everyday comfort", rating: 4.5, reviewCount: 128
  },
  {
    id: 2, name: "Slim Fit Jeans", code: "FB002", price: 4500, category: "For Men", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", status: "active",
    sizes: [{size: "30", stock: 12}, {size: "32", stock: 18}, {size: "34", stock: 15}, {size: "36", stock: 10}],
    description: "Modern slim fit jeans with stretch comfort", rating: 4.3, reviewCount: 89
  },
  {
    id: 3, name: "Floral Summer Dress", code: "FB003", price: 3500, category: "For Women", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", status: "active",
    sizes: [{size: "XS", stock: 8}, {size: "S", stock: 15}, {size: "M", stock: 20}, {size: "L", stock: 12}],
    description: "Beautiful floral dress perfect for summer", rating: 4.7, reviewCount: 156
  },
  {
    id: 4, name: "Casual Polo Shirt", code: "FB004", price: 2800, category: "For Men", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400", status: "active",
    sizes: [{size: "S", stock: 20}, {size: "M", stock: 25}, {size: "L", stock: 18}, {size: "XL", stock: 12}],
    description: "Comfortable polo shirt for casual wear", rating: 4.2, reviewCount: 67
  },
  {
    id: 5, name: "Kids Colorful Hoodie", code: "FB005", price: 2200, category: "Kids Fashion", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400", status: "active",
    sizes: [{size: "2-3Y", stock: 15}, {size: "4-5Y", stock: 20}, {size: "6-7Y", stock: 18}, {size: "8-9Y", stock: 10}],
    description: "Soft and colorful hoodie for kids", rating: 4.8, reviewCount: 234
  },
  {
    id: 6, name: "Elegant Black Dress", code: "FB006", price: 5500, category: "For Women", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400", status: "active",
    sizes: [{size: "XS", stock: 5}, {size: "S", stock: 12}, {size: "M", stock: 15}, {size: "L", stock: 8}],
    description: "Sophisticated black dress for formal occasions", rating: 4.6, reviewCount: 98
  },
  {
    id: 7, name: "Sports Track Pants", code: "FB007", price: 3200, category: "For Men", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400", status: "active",
    sizes: [{size: "S", stock: 18}, {size: "M", stock: 22}, {size: "L", stock: 16}, {size: "XL", stock: 14}],
    description: "Comfortable track pants for sports and leisure", rating: 4.4, reviewCount: 145
  },
  {
    id: 8, name: "Casual Blouse", code: "FB008", price: 2900, category: "For Women", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400", status: "active",
    sizes: [{size: "XS", stock: 10}, {size: "S", stock: 16}, {size: "M", stock: 20}, {size: "L", stock: 12}],
    description: "Stylish casual blouse for everyday wear", rating: 4.3, reviewCount: 76
  },
  {
    id: 9, name: "Denim Jacket", code: "FB009", price: 6500, category: "For Men", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", status: "active",
    sizes: [{size: "S", stock: 8}, {size: "M", stock: 12}, {size: "L", stock: 10}, {size: "XL", stock: 6}],
    description: "Classic denim jacket with modern fit", rating: 4.5, reviewCount: 112
  },
  {
    id: 10, name: "Kids Cartoon T-Shirt", code: "FB010", price: 1800, category: "Kids Fashion", brand: "Fashion Breeze",
    image: "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400", status: "active",
    sizes: [{size: "2-3Y", stock: 20}, {size: "4-5Y", stock: 25}, {size: "6-7Y", stock: 22}, {size: "8-9Y", stock: 15}],
    description: "Fun cartoon print t-shirt for kids", rating: 4.9, reviewCount: 189
  }
];

async function loadRealDataset() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    await mongoose.connection.db.collection('products').deleteMany({});
    
    const productsWithSpecs = realProducts.map(p => ({
      ...p,
      specifications: {
        material: p.category.includes('Men') ? '100% Cotton' : p.category.includes('Women') ? 'Premium Blend' : 'Soft Cotton',
        careInstructions: 'Machine wash cold',
        weight: 'Regular Fit',
        origin: 'Sri Lanka'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    }));
    
    await mongoose.connection.db.collection('products').insertMany(productsWithSpecs);
    console.log(`✅ Loaded ${realProducts.length} real products`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

loadRealDataset();