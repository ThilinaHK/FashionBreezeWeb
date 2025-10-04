import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';

export async function GET() {
  try {
    await dbConnect();
    const users = await User.find({}, '-password').sort({ createdAt: -1 });
    return NextResponse.json(users);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    
    // Auto-generate ID
    const lastUser = await User.findOne().sort({ id: -1 }).select('id');
    body.id = lastUser && lastUser.id ? lastUser.id + 1 : 1;
    
    // Set default privileges based on role
    if (body.role === 'admin') {
      body.privileges = {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: true,
        analytics: true
      };
    } else if (body.role === 'manager') {
      body.privileges = {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: false,
        analytics: true
      };
    }
    
    const user = await User.create(body);
    const { password, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json(userWithoutPassword, { status: 201 });
  } catch (error: any) {
    console.error('User creation error:', error);
    if (error.code === 11000) {
      return NextResponse.json({ error: 'Username or email already exists' }, { status: 400 });
    }
    return NextResponse.json({ error: error.message || 'Failed to create user' }, { status: 500 });
  }
}

export async function PUT(request: NextRequest) {
  try {
    await dbConnect();
    const body = await request.json();
    const { id, ...updateData } = body;
    
    updateData.updatedAt = new Date();
    
    const user = await User.findOneAndUpdate(
      { id },
      updateData,
      { new: true, select: '-password' }
    );
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json(user);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(request: NextRequest) {
  try {
    await dbConnect();
    const { searchParams } = new URL(request.url);
    const id = searchParams.get('id');
    
    const user = await User.findOneAndDelete({ id: parseInt(id!) });
    
    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}