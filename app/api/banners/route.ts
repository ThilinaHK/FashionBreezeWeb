import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Banner from '../../lib/models/Banner';

export async function GET() {
  try {
    await dbConnect();
    const banners = await Banner.find({}).sort({ order: 1, createdAt: -1 });
    return NextResponse.json(banners);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch banners' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { title, image, isActive, order } = await request.json();
    
    console.log('Creating banner:', { title, image: image?.substring(0, 50), isActive, order });
    
    const banner = await Banner.create({
      title,
      image,
      isActive: isActive ?? true,
      order: order ?? 0
    });
    
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    console.error('Banner creation error:', error);
    return NextResponse.json({ error: 'Failed to create banner: ' + error.message }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const { id, title, image, isActive, order } = await request.json();
    
    const banner = await Banner.findByIdAndUpdate(id, {
      title,
      image,
      isActive,
      order
    }, { new: true });
    
    return NextResponse.json({ success: true, banner });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update banner' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    await Banner.findByIdAndDelete(id);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete banner' }, { status: 500 });
  }
}