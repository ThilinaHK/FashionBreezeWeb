require('dotenv').config({ path: '.env.local' });
const mongoose = require('mongoose');

const ProductSchema = new mongoose.Schema({
  id: Number,
  name: String,
  code: String,
  price: Number,
  category: String,
  status: String,
  image: String,
  sizes: [{
    size: String,
    stock: Number,
    price: Number,
    colors: [{
      name: String,
      code: String,
      stock: Number,
      price: Number
    }]
  }],
  brand: String,
  rating: { average: Number, count: Number },
  specifications: {
    material: String,
    careInstructions: String,
    weight: String,
    origin: String
  },
  description: String,
  additionalImages: [String]
}, { timestamps: true });

const Product = mongoose.models.Product || mongoose.model('Product', ProductSchema);

const products42 = [
  // Men's Fashion (15 products)
  {
    id: 1, name: "Classic White T-Shirt", code: "FB001", price: 2500, category: "Men's Fashion", brand: "Nike",
    image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
    sizes: [
      { size: "S", stock: 15, price: 2500, colors: [{ name: "White", code: "#FFFFFF", stock: 15, price: 2500 }] },
      { size: "M", stock: 20, price: 2500, colors: [{ name: "White", code: "#FFFFFF", stock: 20, price: 2500 }] },
      { size: "L", stock: 18, price: 2500, colors: [{ name: "White", code: "#FFFFFF", stock: 18, price: 2500 }] }
    ],
    status: "active", rating: { average: 4.5, count: 128 },
    specifications: { material: "100% Cotton", careInstructions: "Machine Wash", weight: "Regular Fit", origin: "Sri Lanka" },
    description: "Premium quality white t-shirt made from 100% cotton"
  },
  {
    id: 2, name: "Blue Denim Jeans", code: "FB002", price: 4500, category: "Men's Fashion", brand: "Levi's",
    image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
    sizes: [
      { size: "30", stock: 12, price: 4500, colors: [{ name: "Blue", code: "#0000FF", stock: 12, price: 4500 }] },
      { size: "32", stock: 15, price: 4500, colors: [{ name: "Blue", code: "#0000FF", stock: 15, price: 4500 }] },
      { size: "34", stock: 10, price: 4500, colors: [{ name: "Blue", code: "#0000FF", stock: 10, price: 4500 }] }
    ],
    status: "active", rating: { average: 4.2, count: 89 },
    specifications: { material: "Denim", careInstructions: "Machine Wash Cold", weight: "Regular Fit", origin: "Bangladesh" },
    description: "Classic blue denim jeans with perfect fit"
  },
  {
    id: 3, name: "Black Polo Shirt", code: "FB003", price: 2800, category: "Men's Fashion", brand: "Adidas",
    image: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=400&h=400&fit=crop",
    sizes: [
      { size: "S", stock: 8, price: 2800, colors: [{ name: "Black", code: "#000000", stock: 8, price: 2800 }] },
      { size: "M", stock: 12, price: 2800, colors: [{ name: "Black", code: "#000000", stock: 12, price: 2800 }] },
      { size: "L", stock: 10, price: 2800, colors: [{ name: "Black", code: "#000000", stock: 10, price: 2800 }] }
    ],
    status: "active", rating: { average: 4.3, count: 67 },
    specifications: { material: "Cotton Blend", careInstructions: "Machine Wash", weight: "Regular Fit", origin: "India" },
    description: "Comfortable black polo shirt for casual wear"
  },
  {
    id: 4, name: "Grey Hoodie", code: "FB004", price: 3200, category: "Men's Fashion", brand: "Puma",
    image: "https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=400&h=400&fit=crop",
    sizes: [
      { size: "M", stock: 14, price: 3200, colors: [{ name: "Grey", code: "#808080", stock: 14, price: 3200 }] },
      { size: "L", stock: 16, price: 3200, colors: [{ name: "Grey", code: "#808080", stock: 16, price: 3200 }] },
      { size: "XL", stock: 12, price: 3200, colors: [{ name: "Grey", code: "#808080", stock: 12, price: 3200 }] }
    ],
    status: "active", rating: { average: 4.6, count: 94 },
    specifications: { material: "Cotton Fleece", careInstructions: "Machine Wash", weight: "Regular Fit", origin: "Vietnam" },
    description: "Warm and comfortable grey hoodie"
  },
  {
    id: 5, name: "Navy Blue Chinos", code: "FB005", price: 3800, category: "Men's Fashion", brand: "Zara",
    image: "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop",
    sizes: [
      { size: "30", stock: 9, price: 3800, colors: [{ name: "Navy Blue", code: "#001f3f", stock: 9, price: 3800 }] },
      { size: "32", stock: 11, price: 3800, colors: [{ name: "Navy Blue", code: "#001f3f", stock: 11, price: 3800 }] },
      { size: "34", stock: 8, price: 3800, colors: [{ name: "Navy Blue", code: "#001f3f", stock: 8, price: 3800 }] }
    ],
    status: "active", rating: { average: 4.1, count: 52 },
    specifications: { material: "Cotton Twill", careInstructions: "Dry Clean", weight: "Slim Fit", origin: "Turkey" },
    description: "Stylish navy blue chinos for formal occasions"
  }
];

async function restore42Products() {
  try {
    console.log('Connecting to MongoDB...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully');

    console.log('Clearing existing products...');
    await Product.deleteMany({});

    console.log('Loading first 5 products...');
    await Product.insertMany(products42);

    console.log(`✅ Successfully loaded ${products42.length} products`);
    
    const count = await Product.countDocuments();
    console.log(`Total products in database: ${count}`);

  } catch (error) {
    console.error('Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
  }
}

restore42Products();