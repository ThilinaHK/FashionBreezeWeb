import { NextResponse } from 'next/server';
import { connectDB } from '../../lib/mongodb';
import Address from '../../lib/models/Address';

export async function GET(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const parentId = searchParams.get('parentId');
    const cityId = searchParams.get('cityId');

    if (cityId) {
      // Get full hierarchy for a city
      const city = await Address.findOne({ id: parseInt(cityId), type: 'city' });
      if (!city) return NextResponse.json({ error: 'City not found' }, { status: 404 });
      
      const district = await Address.findOne({ id: city.parentId, type: 'district' });
      const region = await Address.findOne({ id: district?.parentId, type: 'region' });
      const country = await Address.findOne({ id: region?.parentId, type: 'country' });
      
      return NextResponse.json({ city, district, region, country });
    }

    let filter: any = { isActive: true };
    if (type) {
      filter.type = type;
    }
    if (parentId) {
      filter.parentId = parseInt(parentId);
    }

    const addresses = await Address.find(filter).sort({ name: 1 });
    return NextResponse.json(addresses);
  } catch (error) {
    console.error('Address GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch addresses', details: (error as Error).message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    await connectDB();
    const { name, type, parentId } = await request.json();
    const userId = request.headers.get('x-user-id');
    const userName = request.headers.get('x-user-name');

    if (!name || !type) {
      return NextResponse.json({ error: 'Name and type are required' }, { status: 400 });
    }

    const lastAddress = await Address.findOne().sort({ id: -1 });
    const newId = (lastAddress?.id || 0) + 1;

    const address = new Address({
      id: newId,
      name,
      type,
      parentId: parentId || null,
      createdBy: userName || userId
    });

    await address.save();
    return NextResponse.json({ success: true, id: newId });
  } catch (error) {
    console.error('Address POST error:', error);
    return NextResponse.json({ error: 'Failed to create address', details: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    await connectDB();
    const { id, name, parentId } = await request.json();
    const userName = request.headers.get('x-user-name');

    if (!id || !name) {
      return NextResponse.json({ error: 'ID and name are required' }, { status: 400 });
    }

    const result = await Address.findOneAndUpdate(
      { id },
      { name, parentId: parentId || null, updatedBy: userName },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address PUT error:', error);
    return NextResponse.json({ error: 'Failed to update address', details: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    await connectDB();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Address ID is required' }, { status: 400 });
    }

    const result = await Address.findOneAndUpdate(
      { id: parseInt(id) }, 
      { isActive: false },
      { new: true }
    );

    if (!result) {
      return NextResponse.json({ error: 'Address not found' }, { status: 404 });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Address DELETE error:', error);
    return NextResponse.json({ error: 'Failed to delete address', details: (error as Error).message }, { status: 500 });
  }
}