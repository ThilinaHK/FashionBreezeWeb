import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Category from '../../lib/models/Category';

export async function GET() {
  try {
    await dbConnect();
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    
    const category = new Category({
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-'),
      deliveryCost: data.deliveryCost || 300
    });
    
    await category.save();
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, id, ...updateData } = data;
    
    const categoryId = _id || id;
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    if (updateData.deliveryCost !== undefined) {
      updateData.deliveryCost = Number(updateData.deliveryCost);
    }
    
    const category = await Category.findByIdAndUpdate(
      categoryId, 
      updateData, 
      { new: true, runValidators: true }
    );
    
    if (!category) {
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    return NextResponse.json(category);
  } catch (error) {
    console.error('PUT error:', error);
    return NextResponse.json({ error: 'Failed to update category' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const data = await request.json();
    const { _id, id } = data;
    
    const categoryId = _id || id;
    if (!categoryId) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    await Category.findByIdAndDelete(categoryId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete category' }, { status: 500 });
  }
}