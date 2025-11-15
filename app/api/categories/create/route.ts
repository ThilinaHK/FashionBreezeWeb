import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../lib/models/Category';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, description, image } = await request.json();
    
    if (!name) {
      return NextResponse.json({ error: 'Category name is required' }, { status: 400 });
    }

    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    const category = new Category({
      name,
      slug,
      description: description || '',
      image: image || '',
      subcategories: [],
      isActive: true,
      sortOrder: 0
    });
    
    await category.save();
    return NextResponse.json(category);
  } catch (error) {
    console.error('Error creating category:', error);
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}