import { NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST() {
  try {
    await dbConnect();
    
    // Check if admin already exists
    const existingAdmin = await User.findOne({ email: 'admin@fashionbreeze.com' });
    if (existingAdmin) {
      return NextResponse.json({ message: 'Admin already exists' });
    }
    
    // Hash password
    const hashedPassword = await bcrypt.hash('123', 12);
    
    // Create admin user
    const admin = new User({
      id: 1,
      username: 'admin',
      email: 'admin@fashionbreeze.com',
      password: hashedPassword,
      role: 'admin',
      status: 'active',
      privileges: {
        products: true,
        categories: true,
        orders: true,
        customers: true,
        users: true,
        analytics: true
      }
    });
    
    await admin.save();
    
    return NextResponse.json({ 
      success: true, 
      message: 'Admin user created successfully',
      email: 'admin@fashionbreeze.com',
      password: '123'
    });
  } catch (error) {
    console.error('Seed admin error:', error);
    return NextResponse.json({ error: 'Failed to create admin' }, { status: 500 });
  }
}