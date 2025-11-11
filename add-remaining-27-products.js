require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: Number, name: String, code: String, price: Number, category: String, status: String,
  image: String, sizes: [{ size: String, stock: Number, price: Number, colors: [{ name: String, code: String, stock: Number, price: Number }] }],
  brand: String, rating: { average: Number, count: Number },
  specifications: { material: String, careInstructions: String, weight: String, origin: String },
  description: String, additionalImages: [String]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const remainingProducts = [
  // Women's Fashion (15 products)
  { id: 16, name: "Floral Summer Dress", code: "FB016", price: 3500, category: "Women's Fashion", brand: "Zara", image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400", sizes: [{ size: "M", stock: 18, price: 3500, colors: [{ name: "Pink", code: "#FFC0CB", stock: 18, price: 3500 }] }], status: "active", rating: { average: 4.6, count: 89 }, specifications: { material: "Cotton", careInstructions: "Hand Wash", weight: "Light", origin: "India" }, description: "Beautiful floral dress" },
  { id: 17, name: "Black Skinny Jeans", code: "FB017", price: 4200, category: "Women's Fashion", brand: "H&M", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", sizes: [{ size: "M", stock: 22, price: 4200, colors: [{ name: "Black", code: "#000000", stock: 22, price: 4200 }] }], status: "active", rating: { average: 4.3, count: 76 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Slim", origin: "Bangladesh" }, description: "Trendy skinny jeans" },
  { id: 18, name: "White Blouse", code: "FB018", price: 2800, category: "Women's Fashion", brand: "Mango", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400", sizes: [{ size: "S", stock: 16, price: 2800, colors: [{ name: "White", code: "#FFFFFF", stock: 16, price: 2800 }] }], status: "active", rating: { average: 4.4, count: 54 }, specifications: { material: "Silk", careInstructions: "Dry Clean", weight: "Light", origin: "Turkey" }, description: "Elegant white blouse" },
  { id: 19, name: "Red High Heels", code: "FB019", price: 6500, category: "Women's Fashion", brand: "Aldo", image: "https://images.unsplash.com/photo-1543163521-1bf539c55dd2?w=400", sizes: [{ size: "38", stock: 8, price: 6500, colors: [{ name: "Red", code: "#FF0000", stock: 8, price: 6500 }] }], status: "active", rating: { average: 4.2, count: 32 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Regular", origin: "Italy" }, description: "Stylish red heels" },
  { id: 20, name: "Blue Maxi Dress", code: "FB020", price: 4800, category: "Women's Fashion", brand: "Forever21", image: "https://images.unsplash.com/photo-1566479179817-c0b5b4b8b1cc?w=400", sizes: [{ size: "L", stock: 12, price: 4800, colors: [{ name: "Blue", code: "#0000FF", stock: 12, price: 4800 }] }], status: "active", rating: { average: 4.5, count: 67 }, specifications: { material: "Polyester", careInstructions: "Machine Wash", weight: "Light", origin: "Vietnam" }, description: "Elegant maxi dress" },
  { id: 21, name: "Pink Cardigan", code: "FB021", price: 3200, category: "Women's Fashion", brand: "Gap", image: "https://images.unsplash.com/photo-1434389677669-e08b4cac3105?w=400", sizes: [{ size: "M", stock: 14, price: 3200, colors: [{ name: "Pink", code: "#FFC0CB", stock: 14, price: 3200 }] }], status: "active", rating: { average: 4.1, count: 43 }, specifications: { material: "Wool", careInstructions: "Hand Wash", weight: "Regular", origin: "China" }, description: "Cozy pink cardigan" },
  { id: 22, name: "Black Leggings", code: "FB022", price: 1800, category: "Women's Fashion", brand: "Nike", image: "https://images.unsplash.com/photo-1506629905607-d405d7d3b0d2?w=400", sizes: [{ size: "M", stock: 25, price: 1800, colors: [{ name: "Black", code: "#000000", stock: 25, price: 1800 }] }], status: "active", rating: { average: 4.7, count: 98 }, specifications: { material: "Spandex", careInstructions: "Machine Wash", weight: "Light", origin: "Thailand" }, description: "Comfortable leggings" },
  { id: 23, name: "Yellow Sundress", code: "FB023", price: 2900, category: "Women's Fashion", brand: "Zara", image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400", sizes: [{ size: "S", stock: 11, price: 2900, colors: [{ name: "Yellow", code: "#FFFF00", stock: 11, price: 2900 }] }], status: "active", rating: { average: 4.3, count: 56 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "Spain" }, description: "Bright sundress" },
  { id: 24, name: "Grey Sweater", code: "FB024", price: 3800, category: "Women's Fashion", brand: "Uniqlo", image: "https://images.unsplash.com/photo-1544441893-675973e31985?w=400", sizes: [{ size: "L", stock: 13, price: 3800, colors: [{ name: "Grey", code: "#808080", stock: 13, price: 3800 }] }], status: "active", rating: { average: 4.4, count: 71 }, specifications: { material: "Cashmere", careInstructions: "Dry Clean", weight: "Regular", origin: "Japan" }, description: "Luxurious sweater" },
  { id: 25, name: "White Sneakers", code: "FB025", price: 4500, category: "Women's Fashion", brand: "Adidas", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400", sizes: [{ size: "37", stock: 15, price: 4500, colors: [{ name: "White", code: "#FFFFFF", stock: 15, price: 4500 }] }], status: "active", rating: { average: 4.6, count: 84 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Regular", origin: "Germany" }, description: "Classic white sneakers" },
  { id: 26, name: "Green Scarf", code: "FB026", price: 1200, category: "Women's Fashion", brand: "H&M", image: "https://images.unsplash.com/photo-1601924994987-69e26d50dc26?w=400", sizes: [{ size: "One Size", stock: 30, price: 1200, colors: [{ name: "Green", code: "#008000", stock: 30, price: 1200 }] }], status: "active", rating: { average: 4.0, count: 28 }, specifications: { material: "Silk", careInstructions: "Hand Wash", weight: "Light", origin: "India" }, description: "Elegant silk scarf" },
  { id: 27, name: "Purple Top", code: "FB027", price: 2400, category: "Women's Fashion", brand: "Forever21", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", sizes: [{ size: "M", stock: 17, price: 2400, colors: [{ name: "Purple", code: "#800080", stock: 17, price: 2400 }] }], status: "active", rating: { average: 4.2, count: 39 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "Bangladesh" }, description: "Trendy purple top" },
  { id: 28, name: "Brown Handbag", code: "FB028", price: 5500, category: "Women's Fashion", brand: "Coach", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", sizes: [{ size: "Medium", stock: 7, price: 5500, colors: [{ name: "Brown", code: "#A52A2A", stock: 7, price: 5500 }] }], status: "active", rating: { average: 4.8, count: 45 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Regular", origin: "USA" }, description: "Premium leather handbag" },
  { id: 29, name: "Black Skirt", code: "FB029", price: 2600, category: "Women's Fashion", brand: "Zara", image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=400", sizes: [{ size: "S", stock: 19, price: 2600, colors: [{ name: "Black", code: "#000000", stock: 19, price: 2600 }] }], status: "active", rating: { average: 4.3, count: 52 }, specifications: { material: "Polyester", careInstructions: "Dry Clean", weight: "Light", origin: "Turkey" }, description: "Elegant black skirt" },
  { id: 30, name: "Denim Jacket", code: "FB030", price: 4800, category: "Women's Fashion", brand: "Levi's", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", sizes: [{ size: "M", stock: 10, price: 4800, colors: [{ name: "Blue", code: "#0000FF", stock: 10, price: 4800 }] }], status: "active", rating: { average: 4.5, count: 63 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Regular", origin: "USA" }, description: "Classic denim jacket" }
];

async function addRemainingProducts() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    console.log('Adding 15 Women\'s Fashion products...');
    await Product.insertMany(remainingProducts);

    const count = await Product.countDocuments();
    console.log(`✅ Successfully added 15 more products. Total: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addRemainingProducts();