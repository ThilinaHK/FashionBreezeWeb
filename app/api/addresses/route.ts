import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Address from '../../lib/models/Address';

// Initialize default data if needed
async function initializeDefaultData() {
  const existingData = await Address.findOne();
  if (!existingData) {
    const defaultData = [
      { id: 1, name: 'Sri Lanka', type: 'country', parentId: null },
      { id: 1, name: 'Western Province', type: 'region', parentId: 1 },
      { id: 2, name: 'Central Province', type: 'region', parentId: 1 },
      { id: 3, name: 'Southern Province', type: 'region', parentId: 1 },
      { id: 1, name: 'Colombo', type: 'district', parentId: 1 },
      { id: 2, name: 'Gampaha', type: 'district', parentId: 1 },
      { id: 3, name: 'Kalutara', type: 'district', parentId: 1 },
      { id: 4, name: 'Kandy', type: 'district', parentId: 2 },
      { id: 1, name: 'Colombo City', type: 'city', parentId: 1 },
      { id: 2, name: 'Gampaha City', type: 'city', parentId: 2 },
      { id: 3, name: 'Kalutara City', type: 'city', parentId: 3 },
      { id: 4, name: 'Kandy City', type: 'city', parentId: 4 }
    ];
    await Address.insertMany(defaultData);
  }
}

export async function GET(request: Request) {
  try {
    await dbConnect();
    await initializeDefaultData();
    
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentId = searchParams.get('parentId');
    
    let query: any = { isActive: true };
    
    if (type) {
      query.type = type;
    }
    
    if (parentId) {
      query.parentId = parseInt(parentId);
    }
    
    const addresses = await Address.find(query).sort({ name: 1 });
    
    if (type) {
      return NextResponse.json(addresses);
    }
    
    // Group by type for backward compatibility
    const grouped = {
      countries: addresses.filter(a => a.type === 'country'),
      regions: addresses.filter(a => a.type === 'region'),
      districts: addresses.filter(a => a.type === 'district'),
      cities: addresses.filter(a => a.type === 'city')
    };
    
    return NextResponse.json(grouped);
  } catch (error) {
    console.error('Address fetch error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await dbConnect();
    const { type, name, parentId } = await request.json();
    
    if (!type || !name) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }
    
    // Normalize type (handle 'countrie' -> 'country')
    const normalizedType = type === 'countrie' ? 'country' : type;
    
    if (!['country', 'region', 'district', 'city'].includes(normalizedType)) {
      return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
    }
    
    // Get next ID for this type
    const lastAddress = await Address.findOne({ type: normalizedType }).sort({ id: -1 });
    const nextId = lastAddress ? lastAddress.id + 1 : 1;
    
    const newAddress = new Address({
      id: nextId,
      name: name.trim(),
      type: normalizedType,
      parentId: parentId ? parseInt(parentId) : null,
      isActive: true
    });
    
    await newAddress.save();
    
    return NextResponse.json({ success: true, location: newAddress });
  } catch (error) {
    console.error('Address creation error:', error);
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await dbConnect();
    const { type, id, name, parentId } = await request.json();
    
    if (!type || !id || !name) {
      return NextResponse.json({ error: 'Type, id, and name are required' }, { status: 400 });
    }
    
    const updateData: any = {
      name: name.trim()
    };
    
    if (parentId !== undefined) {
      updateData.parentId = parentId ? parseInt(parentId) : null;
    }
    
    const updatedAddress = await Address.findOneAndUpdate(
      { type, id: parseInt(id) },
      updateData,
      { new: true }
    );
    
    if (!updatedAddress) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true, location: updatedAddress });
  } catch (error) {
    console.error('Address update error:', error);
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json({ error: 'Type and id are required' }, { status: 400 });
    }
    
    const locationId = parseInt(id);
    
    // Soft delete by setting isActive to false
    const deletedAddress = await Address.findOneAndUpdate(
      { type, id: locationId },
      { isActive: false },
      { new: true }
    );
    
    if (!deletedAddress) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Also soft delete child locations
    await Address.updateMany(
      { parentId: locationId, isActive: true },
      { isActive: false }
    );
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address deletion error:', error);
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}