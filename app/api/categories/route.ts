import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Category from '../../lib/models/Category';

export async function GET() {
  try {
    await dbConnect();
    const Product = require('../../lib/models/Product').default;
    
    const categories = await Category.find({}, 'name deliveryCost').lean();
    
    // Get product counts for each category
    const categoriesWithCounts = await Promise.all(
      categories.map(async (category) => {
        const productCount = await Product.countDocuments({ category: category.name });
        return { ...category, productCount };
      })
    );
    
    return NextResponse.json(categoriesWithCounts, {
      headers: { 'Cache-Control': 'no-cache' }
    });
  } catch (error) {
    return NextResponse.json([]);
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    console.log('POST request body:', body);
    
    // Auto-generate ID
    if (!body.id) {
      const lastCategory = await Category.findOne().sort({ id: -1 }).select('id');
      body.id = lastCategory ? lastCategory.id + 1 : 1;
    }
    
    if (!body.slug) {
      body.slug = body.name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + body.id;
    }
    
    // Ensure deliveryCost is properly handled
    if (body.deliveryCost !== undefined) {
      body.deliveryCost = Number(body.deliveryCost);
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
    console.log('PUT request body:', body);
    const { id, ...updateData } = body;
    console.log('Update data:', updateData);
    console.log('Category ID received:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    // Ensure deliveryCost is properly handled
    if (updateData.deliveryCost !== undefined) {
      updateData.deliveryCost = Number(updateData.deliveryCost);
    }
    
    let category = null;
    
    // Try MongoDB ObjectId format first
    if (id.match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to update by MongoDB _id:', id);
      category = await Category.findByIdAndUpdate(id, updateData, { new: true, runValidators: true });
    }
    
    // If not found by _id, try by custom id field
    if (!category) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        console.log('Trying to update by custom id field:', numericId);
        category = await Category.findOneAndUpdate({ id: numericId }, updateData, { new: true, runValidators: true });
      }
    }
    
    // If still not found, try by name (fallback)
    if (!category) {
      console.log('Trying to find by name for update');
      const existingCategory = await Category.findOne({ name: updateData.name });
      if (existingCategory && (existingCategory._id.toString() === id || existingCategory.id === parseInt(id))) {
        category = await Category.findByIdAndUpdate(existingCategory._id, updateData, { new: true, runValidators: true });
      }
    }
    
    if (!category) {
      console.log('Category not found with ID:', id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    console.log('Category updated successfully:', category);
    return NextResponse.json(category);
  } catch (error: any) {
    console.error('Category update error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Category name already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: 'Failed to update category: ' + error.message }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id } = body;
    
    console.log('DELETE request for category ID:', id);
    
    if (!id) {
      return NextResponse.json({ error: 'Category ID is required' }, { status: 400 });
    }
    
    let result = null;
    
    // Try MongoDB ObjectId format first
    if (id.toString().match(/^[0-9a-fA-F]{24}$/)) {
      console.log('Trying to delete by MongoDB _id:', id);
      result = await Category.findByIdAndDelete(id);
    }
    
    // If not found by _id, try by custom id field
    if (!result) {
      const numericId = parseInt(id);
      if (!isNaN(numericId)) {
        console.log('Trying to delete by custom id field:', numericId);
        result = await Category.findOneAndDelete({ id: numericId });
      }
    }
    
    if (!result) {
      console.log('Category not found for deletion with ID:', id);
      return NextResponse.json({ error: 'Category not found' }, { status: 404 });
    }
    
    console.log('Category deleted successfully:', result.name);
    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error('Category delete error:', error);
    return NextResponse.json({ error: 'Failed to delete category: ' + error.message }, { status: 500 });
  }
}