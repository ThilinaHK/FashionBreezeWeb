import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    
    // Auto-create admin if doesn't exist
    let user = await User.findOne({ email });
    
    if (!user && email === 'admin@fashionbreeze.com') {
      const hashedPassword = await bcrypt.hash('123', 12);
      user = new User({
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
      await user.save();
    }
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }
    
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      isAdmin: ['admin', 'manager'].includes(user.role)
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed' }, { status: 500 });
  }
}