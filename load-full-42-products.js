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

const allProducts = [
  // Men's Fashion (15 products)
  { id: 1, name: "Classic White T-Shirt", code: "FB001", price: 2500, category: "Men's Fashion", brand: "Nike", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", sizes: [{ size: "M", stock: 20, price: 2500, colors: [{ name: "White", code: "#FFFFFF", stock: 20, price: 2500 }] }], status: "active", rating: { average: 4.5, count: 128 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Regular", origin: "Sri Lanka" }, description: "Premium white t-shirt" },
  { id: 2, name: "Blue Denim Jeans", code: "FB002", price: 4500, category: "Men's Fashion", brand: "Levi's", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", sizes: [{ size: "32", stock: 15, price: 4500, colors: [{ name: "Blue", code: "#0000FF", stock: 15, price: 4500 }] }], status: "active", rating: { average: 4.2, count: 89 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Regular", origin: "Bangladesh" }, description: "Classic blue jeans" },
  { id: 3, name: "Black Polo Shirt", code: "FB003", price: 2800, category: "Men's Fashion", brand: "Adidas", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400", sizes: [{ size: "L", stock: 12, price: 2800, colors: [{ name: "Black", code: "#000000", stock: 12, price: 2800 }] }], status: "active", rating: { average: 4.3, count: 67 }, specifications: { material: "Cotton Blend", careInstructions: "Machine Wash", weight: "Regular", origin: "India" }, description: "Comfortable polo shirt" },
  { id: 4, name: "Grey Hoodie", code: "FB004", price: 3200, category: "Men's Fashion", brand: "Puma", image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400", sizes: [{ size: "L", stock: 16, price: 3200, colors: [{ name: "Grey", code: "#808080", stock: 16, price: 3200 }] }], status: "active", rating: { average: 4.6, count: 94 }, specifications: { material: "Cotton Fleece", careInstructions: "Machine Wash", weight: "Regular", origin: "Vietnam" }, description: "Warm hoodie" },
  { id: 5, name: "Navy Chinos", code: "FB005", price: 3800, category: "Men's Fashion", brand: "Zara", image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400", sizes: [{ size: "32", stock: 11, price: 3800, colors: [{ name: "Navy", code: "#001f3f", stock: 11, price: 3800 }] }], status: "active", rating: { average: 4.1, count: 52 }, specifications: { material: "Cotton Twill", careInstructions: "Dry Clean", weight: "Slim", origin: "Turkey" }, description: "Stylish chinos" },
  { id: 6, name: "Red Casual Shirt", code: "FB006", price: 2900, category: "Men's Fashion", brand: "H&M", image: "https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400", sizes: [{ size: "M", stock: 14, price: 2900, colors: [{ name: "Red", code: "#FF0000", stock: 14, price: 2900 }] }], status: "active", rating: { average: 4.0, count: 43 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Regular", origin: "Bangladesh" }, description: "Casual red shirt" },
  { id: 7, name: "Black Jeans", code: "FB007", price: 4200, category: "Men's Fashion", brand: "Diesel", image: "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400", sizes: [{ size: "32", stock: 13, price: 4200, colors: [{ name: "Black", code: "#000000", stock: 13, price: 4200 }] }], status: "active", rating: { average: 4.4, count: 76 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Slim", origin: "Italy" }, description: "Stylish black jeans" },
  { id: 8, name: "White Sneakers", code: "FB008", price: 5500, category: "Men's Fashion", brand: "Adidas", image: "https://images.unsplash.com/photo-1549298916-b41d501d3772?w=400", sizes: [{ size: "42", stock: 8, price: 5500, colors: [{ name: "White", code: "#FFFFFF", stock: 8, price: 5500 }] }], status: "active", rating: { average: 4.7, count: 112 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Regular", origin: "Germany" }, description: "Premium sneakers" },
  { id: 9, name: "Green T-Shirt", code: "FB009", price: 2300, category: "Men's Fashion", brand: "Uniqlo", image: "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400", sizes: [{ size: "L", stock: 18, price: 2300, colors: [{ name: "Green", code: "#008000", stock: 18, price: 2300 }] }], status: "active", rating: { average: 4.2, count: 58 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Regular", origin: "Japan" }, description: "Fresh green t-shirt" },
  { id: 10, name: "Brown Leather Belt", code: "FB010", price: 1800, category: "Men's Fashion", brand: "Tommy", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", sizes: [{ size: "M", stock: 25, price: 1800, colors: [{ name: "Brown", code: "#A52A2A", stock: 25, price: 1800 }] }], status: "active", rating: { average: 4.3, count: 34 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Regular", origin: "India" }, description: "Genuine leather belt" },
  { id: 11, name: "Blue Formal Shirt", code: "FB011", price: 3500, category: "Men's Fashion", brand: "Arrow", image: "https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=400", sizes: [{ size: "M", stock: 12, price: 3500, colors: [{ name: "Blue", code: "#0000FF", stock: 12, price: 3500 }] }], status: "active", rating: { average: 4.5, count: 67 }, specifications: { material: "Cotton", careInstructions: "Dry Clean", weight: "Slim", origin: "India" }, description: "Professional shirt" },
  { id: 12, name: "Black Blazer", code: "FB012", price: 7500, category: "Men's Fashion", brand: "Zara", image: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=400", sizes: [{ size: "L", stock: 6, price: 7500, colors: [{ name: "Black", code: "#000000", stock: 6, price: 7500 }] }], status: "active", rating: { average: 4.8, count: 23 }, specifications: { material: "Wool Blend", careInstructions: "Dry Clean", weight: "Regular", origin: "Spain" }, description: "Elegant blazer" },
  { id: 13, name: "White Shorts", code: "FB013", price: 2200, category: "Men's Fashion", brand: "Nike", image: "https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400", sizes: [{ size: "M", stock: 20, price: 2200, colors: [{ name: "White", code: "#FFFFFF", stock: 20, price: 2200 }] }], status: "active", rating: { average: 4.1, count: 45 }, specifications: { material: "Polyester", careInstructions: "Machine Wash", weight: "Light", origin: "Vietnam" }, description: "Sports shorts" },
  { id: 14, name: "Grey Sweatshirt", code: "FB014", price: 2800, category: "Men's Fashion", brand: "Puma", image: "https://images.unsplash.com/photo-1571945153237-4929e783af4a?w=400", sizes: [{ size: "L", stock: 15, price: 2800, colors: [{ name: "Grey", code: "#808080", stock: 15, price: 2800 }] }], status: "active", rating: { average: 4.4, count: 62 }, specifications: { material: "Cotton Blend", careInstructions: "Machine Wash", weight: "Regular", origin: "Bangladesh" }, description: "Comfortable sweatshirt" },
  { id: 15, name: "Denim Jacket", code: "FB015", price: 5200, category: "Men's Fashion", brand: "Levi's", image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=400", sizes: [{ size: "L", stock: 9, price: 5200, colors: [{ name: "Blue", code: "#0000FF", stock: 9, price: 5200 }] }], status: "active", rating: { average: 4.6, count: 38 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Regular", origin: "USA" }, description: "Classic denim jacket" }
];

async function loadAll42Products() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Loading 15 Men\'s Fashion products...');
    await Product.insertMany(allProducts);

    const count = await Product.countDocuments();
    console.log(`✅ Successfully loaded ${count} products (Men's Fashion)`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

loadAll42Products();