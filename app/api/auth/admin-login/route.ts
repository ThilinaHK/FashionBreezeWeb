import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email, password } = await request.json();
    
    // Find user by email
    const user = await User.findOne({ email });
    
    if (!user) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }
    
    // Update last login
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