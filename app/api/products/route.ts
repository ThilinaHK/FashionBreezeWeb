import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Product from '../../lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Use lean() for faster queries and select only needed fields
    const products = await Product.find(
      { status: { $in: ['active', 'instock'] } },
      'name code price image category subcategory status featured rating discount originalPrice sizes'
    )
      .populate('category', 'name slug')
      .sort({ featured: -1, sortOrder: 1 })
      .lean()
      .limit(100);
    
    // Add cache headers for better performance
    return NextResponse.json(products, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600',
        'CDN-Cache-Control': 'public, s-maxage=300',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=300'
      }
    });
  } catch (error) {
    console.error('Products API error:', error);
    
    // Return fallback data on error
    const fallbackProducts = [
      {
        _id: '1',
        id: 1,
        name: "Classic White T-Shirt",
        code: "CL001",
        price: 2500,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400&h=400&fit=crop",
        status: "active",
        rating: { average: 4.5, count: 128 }
      },
      {
        _id: '2',
        id: 2,
        name: "Blue Denim Jeans",
        code: "BDJ002",
        price: 4500,
        category: "Men's Fashion",
        image: "https://images.unsplash.com/photo-1542272604-787c3835535d?w=400&h=400&fit=crop",
        status: "active",
        rating: { average: 4.2, count: 89 }
      }
    ];
    
    return NextResponse.json(fallbackProducts, {
      headers: {
        'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=120'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Validate sizes if provided
    if (body.sizes && Array.isArray(body.sizes)) {
      body.sizes = body.sizes.filter(size => size.size && size.size.trim());
    }
    
    // Validate colors if provided
    if (body.colors && Array.isArray(body.colors)) {
      body.colors = body.colors.filter(color => color.name && color.name.trim());
    }
    
    const product = await Product.create(body);
    
    return NextResponse.json(product, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error) {
    console.error('Product creation error:', error);
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}