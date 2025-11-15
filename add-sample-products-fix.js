const mongoose = require('mongoose');

const productSchema = new mongoose.Schema({
  id: { type: Number, required: true, unique: true },
  name: { type: String, required: true },
  code: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  brand: { type: String },
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

async function addSampleProducts() {
  try {
    await mongoose.connect('mongodb+srv://thilina2u_db_user:6v7m2Z0MnALRKFdS@cluster0.nbnxnst.mongodb.net/fashionBreeze?retryWrites=true&w=majority&appName=Cluster0');
    
    const Product = mongoose.model('Product', productSchema);
    
    // Clear existing products
    await Product.deleteMany({});
    console.log('Cleared existing products');
    
    const sampleProducts = [
      {
        id: 1,
        name: "Classic White T-Shirt",
        code: "CL001",
        price: 2500,
        category: "For Men",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1583743814966-8936f37f4678?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "S", stock: 10, price: 2500 },
          { size: "M", stock: 15, price: 2500 },
          { size: "L", stock: 12, price: 2500 },
          { size: "XL", stock: 8, price: 2500 }
        ],
        description: "Premium quality cotton t-shirt perfect for everyday wear",
        specifications: {
          material: "100% Cotton",
          careInstructions: "Machine wash cold",
          weight: "180 GSM",
          origin: "Sri Lanka"
        },
        rating: 4.5,
        reviewCount: 128
      },
      {
        id: 2,
        name: "Blue Denim Jeans",
        code: "CL002",
        price: 4500,
        category: "For Men",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1541099649105-f69ad21f3246?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "30", stock: 5, price: 4500 },
          { size: "32", stock: 8, price: 4500 },
          { size: "34", stock: 10, price: 4500 },
          { size: "36", stock: 6, price: 4500 }
        ],
        description: "Classic blue denim jeans with perfect fit and comfort",
        specifications: {
          material: "98% Cotton, 2% Elastane",
          careInstructions: "Machine wash warm",
          weight: "Regular Fit",
          origin: "Sri Lanka"
        },
        rating: 4.2,
        reviewCount: 89
      },
      {
        id: 3,
        name: "Floral Summer Dress",
        code: "CL003",
        price: 3500,
        category: "For Women",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=400&fit=crop",
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "XS", stock: 3, price: 3500 },
          { size: "S", stock: 8, price: 3500 },
          { size: "M", stock: 12, price: 3500 },
          { size: "L", stock: 7, price: 3500 }
        ],
        description: "Beautiful floral dress perfect for summer occasions",
        specifications: {
          material: "Polyester Blend",
          careInstructions: "Hand wash recommended",
          weight: "Light Weight",
          origin: "Sri Lanka"
        },
        rating: 4.7,
        reviewCount: 156
      },
      {
        id: 4,
        name: "Casual Polo Shirt",
        code: "CL004",
        price: 2800,
        category: "For Men",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1586790170083-2f9ceadc732d?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "S", stock: 6, price: 2800 },
          { size: "M", stock: 10, price: 2800 },
          { size: "L", stock: 8, price: 2800 },
          { size: "XL", stock: 4, price: 2800 }
        ],
        description: "Comfortable polo shirt for casual and semi-formal occasions",
        specifications: {
          material: "Cotton Pique",
          careInstructions: "Machine wash cold",
          weight: "200 GSM",
          origin: "Sri Lanka"
        },
        rating: 4.3,
        reviewCount: 67
      },
      {
        id: 5,
        name: "Kids Rainbow T-Shirt",
        code: "CL005",
        price: 1800,
        category: "Kids Fashion",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1519238263530-99bdd11df2ea?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "2-3Y", stock: 8, price: 1800 },
          { size: "4-5Y", stock: 12, price: 1800 },
          { size: "6-7Y", stock: 10, price: 1800 },
          { size: "8-9Y", stock: 6, price: 1800 }
        ],
        description: "Colorful and fun t-shirt perfect for kids",
        specifications: {
          material: "100% Cotton",
          careInstructions: "Machine wash cold",
          weight: "150 GSM",
          origin: "Sri Lanka"
        },
        rating: 4.8,
        reviewCount: 234
      },
      {
        id: 6,
        name: "Elegant Black Dress",
        code: "CL006",
        price: 5500,
        category: "For Women",
        brand: "Fashion Breeze",
        image: "https://images.unsplash.com/photo-1566479179817-c0b5b4b4b1e5?w=400&h=400&fit=crop",
        additionalImages: [
          "https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=400&h=400&fit=crop"
        ],
        status: "active",
        sizes: [
          { size: "XS", stock: 2, price: 5500 },
          { size: "S", stock: 5, price: 5500 },
          { size: "M", stock: 8, price: 5500 },
          { size: "L", stock: 4, price: 5500 }
        ],
        description: "Sophisticated black dress for formal occasions",
        specifications: {
          material: "Premium Polyester",
          careInstructions: "Dry clean only",
          weight: "Medium Weight",
          origin: "Sri Lanka"
        },
        rating: 4.6,
        reviewCount: 98
      }
    ];
    
    await Product.insertMany(sampleProducts);
    console.log(`✅ Successfully added ${sampleProducts.length} sample products`);
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await mongoose.disconnect();
  }
}

addSampleProducts();