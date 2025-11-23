import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../lib/models/Category';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { name, description, categoryId } = await request.json();
    
    if (!name || !categoryId) {
      return NextResponse.json({ error: 'Name and categoryId are required' }, { status: 400 });
    }
    
    // Create slug from name
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
    
    // Add subcategory to the category
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { 
        $push: { 
          subcategories: { 
            name, 
            slug, 
            description: description || '',
            isActive: true
          } 
        } 
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory added successfully', category });
  } catch (error) {
    console.error('Error adding subcategory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { categoryId, subcategorySlug } = await request.json();
    
    const category = await Category.findByIdAndUpdate(
      categoryId,
      { 
        $pull: { 
          subcategories: { slug: subcategorySlug }
        } 
      },
      { new: true }
    );

    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }

    return NextResponse.json({ message: 'Subcategory deleted successfully' });
  } catch (error) {
    console.error('Error deleting subcategory:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}