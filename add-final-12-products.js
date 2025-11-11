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

const finalProducts = [
  // Kids Fashion (8 products)
  { id: 31, name: "Kids Colorful Hoodie", code: "FB031", price: 2200, category: "Kids Fashion", brand: "Disney", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400", sizes: [{ size: "8-10", stock: 20, price: 2200, colors: [{ name: "Rainbow", code: "#FF6B6B", stock: 20, price: 2200 }] }], status: "active", rating: { average: 4.7, count: 156 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Regular", origin: "Bangladesh" }, description: "Fun colorful hoodie for kids" },
  { id: 32, name: "Girls Pink Dress", code: "FB032", price: 2800, category: "Kids Fashion", brand: "Carter's", image: "https://images.unsplash.com/photo-1518831959646-742c3a14ebf7?w=400", sizes: [{ size: "6-8", stock: 15, price: 2800, colors: [{ name: "Pink", code: "#FFC0CB", stock: 15, price: 2800 }] }], status: "active", rating: { average: 4.5, count: 89 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "India" }, description: "Pretty pink dress for girls" },
  { id: 33, name: "Boys Blue Shorts", code: "FB033", price: 1800, category: "Kids Fashion", brand: "Nike Kids", image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400", sizes: [{ size: "10-12", stock: 25, price: 1800, colors: [{ name: "Blue", code: "#0000FF", stock: 25, price: 1800 }] }], status: "active", rating: { average: 4.3, count: 67 }, specifications: { material: "Polyester", careInstructions: "Machine Wash", weight: "Light", origin: "Vietnam" }, description: "Comfortable sports shorts" },
  { id: 34, name: "Kids Sneakers", code: "FB034", price: 3500, category: "Kids Fashion", brand: "Adidas Kids", image: "https://images.unsplash.com/photo-1560769629-975ec94e6a86?w=400", sizes: [{ size: "32", stock: 12, price: 3500, colors: [{ name: "White", code: "#FFFFFF", stock: 12, price: 3500 }] }], status: "active", rating: { average: 4.6, count: 94 }, specifications: { material: "Synthetic", careInstructions: "Wipe Clean", weight: "Regular", origin: "Germany" }, description: "Durable kids sneakers" },
  { id: 35, name: "Girls Yellow T-Shirt", code: "FB035", price: 1500, category: "Kids Fashion", brand: "H&M Kids", image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400", sizes: [{ size: "4-6", stock: 30, price: 1500, colors: [{ name: "Yellow", code: "#FFFF00", stock: 30, price: 1500 }] }], status: "active", rating: { average: 4.4, count: 78 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "Bangladesh" }, description: "Bright yellow t-shirt" },
  { id: 36, name: "Boys Green Polo", code: "FB036", price: 2000, category: "Kids Fashion", brand: "Ralph Lauren Kids", image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400", sizes: [{ size: "8-10", stock: 18, price: 2000, colors: [{ name: "Green", code: "#008000", stock: 18, price: 2000 }] }], status: "active", rating: { average: 4.5, count: 56 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Regular", origin: "USA" }, description: "Classic polo shirt" },
  { id: 37, name: "Kids Denim Jeans", code: "FB037", price: 2900, category: "Kids Fashion", brand: "Levi's Kids", image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400", sizes: [{ size: "10-12", stock: 14, price: 2900, colors: [{ name: "Blue", code: "#0000FF", stock: 14, price: 2900 }] }], status: "active", rating: { average: 4.2, count: 43 }, specifications: { material: "Denim", careInstructions: "Machine Wash", weight: "Regular", origin: "USA" }, description: "Durable denim jeans" },
  { id: 38, name: "Girls Purple Skirt", code: "FB038", price: 1900, category: "Kids Fashion", brand: "Gap Kids", image: "https://images.unsplash.com/photo-1583496661160-fb5886a13d44?w=400", sizes: [{ size: "6-8", stock: 22, price: 1900, colors: [{ name: "Purple", code: "#800080", stock: 22, price: 1900 }] }], status: "active", rating: { average: 4.3, count: 61 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "China" }, description: "Cute purple skirt" },
  
  // Accessories (4 products)
  { id: 39, name: "Leather Wallet", code: "FB039", price: 2500, category: "Accessories", brand: "Tommy Hilfiger", image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400", sizes: [{ size: "Standard", stock: 35, price: 2500, colors: [{ name: "Black", code: "#000000", stock: 35, price: 2500 }] }], status: "active", rating: { average: 4.4, count: 87 }, specifications: { material: "Leather", careInstructions: "Wipe Clean", weight: "Light", origin: "India" }, description: "Premium leather wallet" },
  { id: 40, name: "Sunglasses", code: "FB040", price: 3200, category: "Accessories", brand: "Ray-Ban", image: "https://images.unsplash.com/photo-1572635196237-14b3f281503f?w=400", sizes: [{ size: "One Size", stock: 20, price: 3200, colors: [{ name: "Black", code: "#000000", stock: 20, price: 3200 }] }], status: "active", rating: { average: 4.7, count: 112 }, specifications: { material: "Plastic", careInstructions: "Wipe Clean", weight: "Light", origin: "Italy" }, description: "Stylish sunglasses" },
  { id: 41, name: "Silver Watch", code: "FB041", price: 8500, category: "Accessories", brand: "Casio", image: "https://images.unsplash.com/photo-1524592094714-0f0654e20314?w=400", sizes: [{ size: "Adjustable", stock: 8, price: 8500, colors: [{ name: "Silver", code: "#C0C0C0", stock: 8, price: 8500 }] }], status: "active", rating: { average: 4.8, count: 156 }, specifications: { material: "Stainless Steel", careInstructions: "Wipe Clean", weight: "Regular", origin: "Japan" }, description: "Elegant silver watch" },
  { id: 42, name: "Baseball Cap", code: "FB042", price: 1800, category: "Accessories", brand: "Nike", image: "https://images.unsplash.com/photo-1588850561407-ed78c282e89b?w=400", sizes: [{ size: "Adjustable", stock: 40, price: 1800, colors: [{ name: "Navy", code: "#001f3f", stock: 40, price: 1800 }] }], status: "active", rating: { average: 4.3, count: 94 }, specifications: { material: "Cotton", careInstructions: "Machine Wash", weight: "Light", origin: "Vietnam" }, description: "Classic baseball cap" }
];

async function addFinal12Products() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    console.log('Adding final 12 products (8 Kids + 4 Accessories)...');
    await Product.insertMany(finalProducts);

    const count = await Product.countDocuments();
    console.log(`✅ Successfully added final 12 products. Total: ${count}`);
    console.log('🎉 Your 42-product inventory is now complete!');

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

addFinal12Products();