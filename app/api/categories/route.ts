import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Category from '../../lib/models/Category';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await Category.find(
      { isActive: true },
      'name slug description icon subcategories sortOrder'
    )
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .limit(20);
    
    return NextResponse.json(categories, {
      headers: {
        'Cache-Control': 'public, s-maxage=600, stale-while-revalidate=1200',
        'CDN-Cache-Control': 'public, s-maxage=600',
        'Vercel-CDN-Cache-Control': 'public, s-maxage=600'
      }
    });
  } catch (error) {
    console.error('Categories API error:', error);
    
    // Return fallback categories
    const fallbackCategories = [
      { _id: '1', name: "Men's Fashion", slug: 'mens-fashion', isActive: true, sortOrder: 1 },
      { _id: '2', name: "Women's Fashion", slug: 'womens-fashion', isActive: true, sortOrder: 2 },
      { _id: '3', name: "Kids Fashion", slug: 'kids-fashion', isActive: true, sortOrder: 3 }
    ];
    
    return NextResponse.json(fallbackCategories, {
      headers: {
        'Cache-Control': 'public, s-maxage=300, stale-while-revalidate=600'
      }
    });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    }
    
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}