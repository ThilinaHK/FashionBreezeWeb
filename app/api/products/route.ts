import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Product from '../../lib/models/Product';

export async function GET() {
  try {
    await dbConnect();
    
    // Use lean() for faster queries and select only needed fields
    const products = await Product.find(
      {},
      'name code price image category subcategory status featured rating discount originalPrice sizes cost vat'
    )
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
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-generate ID
    if (!body.id) {
      const lastProduct = await Product.findOne().sort({ id: -1 }).select('id');
      body.id = lastProduct ? lastProduct.id + 1 : 1;
    }
    
    // Auto-generate missing required fields
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + body.id;
    }
    if (!body.description) {
      body.description = `High-quality ${body.name} - ${body.category}`;
    }
    if (!body.subcategory) {
      body.subcategory = 'General';
    }
    
    // Handle category - for now, store as string since dashboard sends string
    // In a full implementation, you'd look up the category ObjectId
    
    // Map dashboard status to model status
    if (body.status === 'instock') {
      body.status = 'active';
    } else if (body.status === 'outofstock') {
      body.status = 'outofstock';
    }
    
    // Validate sizes if provided
    if (body.sizes && Array.isArray(body.sizes)) {
      body.sizes = body.sizes.filter((size: any) => size.size && size.size.trim());
    }
    
    // Validate colors if provided
    if (body.colors && Array.isArray(body.colors)) {
      body.colors = body.colors.filter((color: any) => color.name && color.name.trim());
    }
    
    const product = await Product.create(body);
    
    return NextResponse.json(product, { 
      status: 201,
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (error: any) {
    console.error('Product creation error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Product code or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create product' }, { status: 500 });
  }
}