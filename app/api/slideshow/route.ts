import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import mongoose from 'mongoose';

const slideSchema = new mongoose.Schema({
  title: String,
  subtitle: String,
  image: String,
  saleType: String,
  discount: Number,
  validUntil: Date,
  isActive: Boolean,
  order: Number,
  createdAt: Date,
  updatedAt: Date
});

const Slide = mongoose.models.Slide || mongoose.model('Slide', slideSchema);

export async function GET() {
  try {
    await dbConnect();
    const slides = await Slide.find({}).sort({ order: 1 });
    return NextResponse.json(slides);
  } catch (error) {
    console.error('Error fetching slides:', error);
    return NextResponse.json({ error: 'Failed to fetch slides' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const slideData = await request.json();
    
    if (!slideData.title || !slideData.image) {
      return NextResponse.json({ error: 'Title and image are required' }, { status: 400 });
    }
    
    const slide = new Slide({
      title: slideData.title,
      subtitle: slideData.subtitle || '',
      image: slideData.image,
      saleType: slideData.saleType || 'featured',
      discount: slideData.discount || 0,
      validUntil: slideData.validUntil ? new Date(slideData.validUntil) : null,
      isActive: slideData.isActive !== false,
      order: slideData.order || 1,
      createdAt: new Date(),
      updatedAt: new Date()
    });
    
    const result = await slide.save();
    return NextResponse.json({ success: true, id: result._id });
  } catch (error) {
    console.error('Error creating slide:', error);
    return NextResponse.json({ error: `Failed to create slide: ${error instanceof Error ? error.message : 'Unknown error'}` }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, ...updateData } = await request.json();
    
    const result = await Slide.findByIdAndUpdate(id, {
      ...updateData,
      updatedAt: new Date()
    });
    
    if (!result) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating slide:', error);
    return NextResponse.json({ error: 'Failed to update slide' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const url = new URL(request.url);
    const id = url.searchParams.get('id');
    
    if (!id) {
      return NextResponse.json({ error: 'Slide ID is required' }, { status: 400 });
    }
    
    const result = await Slide.findByIdAndDelete(id);
    
    if (!result) {
      return NextResponse.json({ error: 'Slide not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting slide:', error);
    return NextResponse.json({ error: 'Failed to delete slide' }, { status: 500 });
  }
}