import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Category from '../../lib/models/Category';

export async function GET() {
  try {
    await dbConnect();
    
    const categories = await Category.find(
      {},
      'id name slug description icon subcategories sortOrder isActive'
    )
      .sort({ sortOrder: 1, name: 1 })
      .lean()
      .limit(50);
    
    // Add product count for each category
    const Product = require('../../lib/models/Product').default;
    const categoriesWithCount = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return { ...category, productCount };
      })
    );
    
    return NextResponse.json(categoriesWithCount, {
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
      { _id: '1', id: 1, name: "Men's Fashion", slug: 'mens-fashion', isActive: true, sortOrder: 1, productCount: 0 },
      { _id: '2', id: 2, name: "Women's Fashion", slug: 'womens-fashion', isActive: true, sortOrder: 2, productCount: 0 },
      { _id: '3', id: 3, name: "Kids Fashion", slug: 'kids-fashion', isActive: true, sortOrder: 3, productCount: 0 }
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
    
    // Auto-generate ID
    if (!body.id) {
      const lastCategory = await Category.findOne().sort({ id: -1 }).select('id');
      body.id = lastCategory ? lastCategory.id + 1 : 1;
    }
    
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + body.id;
    }
    
    const category = await Category.create(body);
    return NextResponse.json(category, { status: 201 });
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name or slug already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    // Try to find by _id first, then by id field
    let category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    
    if (!category) {
      category = await Category.findOneAndUpdate({ id: parseInt(id) }, updateData, { new: true, runValidators: true });
    }
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error: any) {
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = body;
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    // Try to delete by _id first, then by id field
    let result = await Category.findByIdAndDelete(id);
    
    if (!result) {
      result = await Category.findOneAndDelete({ id: parseInt(id) });
    }
    
    if (!result) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}