import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';
import Category from '../../../lib/models/Category';

export async function POST() {
  try {
    await dbConnect();
    
    await Product.deleteMany({});
    
    const categories = await Category.find({});
    const mensCategory = categories.find(c => c.slug === 'mens-fashion');
    const womensCategory = categories.find(c => c.slug === 'womens-fashion');
    
    if (!mensCategory || !womensCategory) {
      return NextResponse.json({ error: 'Categories not found. Please seed categories first.' }, { status: 400 });
    }

    const products = [
      {
        name: 'Classic White T-Shirt',
        slug: 'classic-white-t-shirt',
        code: 'CWT001',
        description: 'Premium quality cotton t-shirt with comfortable fit. Perfect for casual wear.',
        price: 2500,
        category: mensCategory._id,
        subcategory: 't-shirts',
        image: 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop',
        sizes: [
          { size: 'S', stock: 12, price: 2500 },
          { size: 'M', stock: 8, price: 2500 },
          { size: 'L', stock: 15, price: 2500 }
        ],
        status: 'active',
        rating: { average: 4.5, count: 128 }
      },
      {
        name: 'Blue Denim Jeans',
        slug: 'blue-denim-jeans',
        code: 'BDJ002',
        description: 'Classic denim jeans with modern cut. Durable and stylish.',
        price: 4500,
        category: mensCategory._id,
        subcategory: 'jeans',
        image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop',
        sizes: [
          { size: '30', stock: 7, price: 4500 },
          { size: '32', stock: 10, price: 4500 },
          { size: '34', stock: 6, price: 4500 }
        ],
        status: 'active',
        rating: { average: 4.2, count: 89 }
      }
    ];
    
    const createdProducts = await Product.insertMany(products);
    
    return NextResponse.json({ 
      message: 'Products seeded successfully', 
      count: createdProducts.length
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed products' }, { status: 500 });
  }
}