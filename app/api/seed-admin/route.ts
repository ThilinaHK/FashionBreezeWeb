import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ role: 'admin' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin user already exists' });
    }
    
    // Create default admin user
    const adminUser = await User.create({
      id: 1,
      username: 'admin',
      email: 'admin@fashionbreeze.com',
      password: 'admin123',
      role: 'admin',
      privileges: {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: true,
        analytics: true
      },
      status: 'active'
    });
    
    const { password, ...userWithoutPassword } = adminUser.toObject();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully!',
      user: userWithoutPassword
    });
  } catch (error: any) {
    console.error('Admin seed error:', error);
    return NextResponse.json({ 
      success: false, 
      error: error.message || 'Failed to create admin user' 
    }, { status: 500 });
  }
}