import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Product from '../../lib/models/Product';

export async function POST() {
  try {
    await dbConnect();
    
    // Clear existing products
    await Product.deleteMany({});
    
    // Sample products
    const sampleProducts = [
      {
        id: 1,
        name: "Classic White T-Shirt",
        code: "FB001",
        price: 2500,
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        category: "For Men",
        status: "active",
        featured: true,
        rating: { average: 4.5, count: 128 },
        sizes: [
          { size: "S", stock: 10, price: 2500 },
          { size: "M", stock: 15, price: 2500 },
          { size: "L", stock: 12, price: 2500 },
          { size: "XL", stock: 8, price: 2500 }
        ]
      },
      {
        id: 2,
        name: "Blue Denim Jeans",
        code: "FB002", 
        price: 4500,
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        category: "For Men",
        status: "active",
        featured: true,
        rating: { average: 4.2, count: 89 },
        sizes: [
          { size: "S", stock: 5, price: 4500 },
          { size: "M", stock: 8, price: 4500 },
          { size: "L", stock: 6, price: 4500 },
          { size: "XL", stock: 4, price: 4500 }
        ]
      },
      {
        id: 3,
        name: "Summer Dress",
        code: "FB003",
        price: 3500,
        image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=400&h=400&fit=crop",
        category: "For Women",
        status: "active",
        featured: true,
        rating: { average: 4.8, count: 156 },
        sizes: [
          { size: "S", stock: 12, price: 3500 },
          { size: "M", stock: 18, price: 3500 },
          { size: "L", stock: 10, price: 3500 }
        ]
      },
      {
        id: 4,
        name: "Kids T-Shirt",
        code: "FB004",
        price: 1800,
        image: "https://images.unsplash.com/photo-1503944583220-79d8926ad5e2?w=400&h=400&fit=crop",
        category: "Kids Fashion",
        status: "active",
        featured: false,
        rating: { average: 4.3, count: 67 },
        sizes: [
          { size: "XS", stock: 15, price: 1800 },
          { size: "S", stock: 20, price: 1800 },
          { size: "M", stock: 12, price: 1800 }
        ]
      }
    ];
    
    // Add required fields for each product
    const productsToInsert = sampleProducts.map(product => ({
      ...product,
      slug: product.name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + product.id,
      description: `High-quality ${product.name} - ${product.category}`,
      subcategory: 'General',
      cost: Math.round(product.price * 0.6),
      vat: Math.round(product.price * 0.1)
    }));
    
    await Product.insertMany(productsToInsert);
    
    return NextResponse.json({ 
      success: true, 
      message: `${sampleProducts.length} sample products added successfully!`,
      products: productsToInsert.length
    });
  } catch (error) {
    console.error('Seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: 'Failed to seed products' 
    }, { status: 500 });
  }
}