import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import User from '../../../lib/models/User';
import bcrypt from 'bcryptjs';

export async function POST(request: NextRequest) {
  try {
    console.log('Admin login attempt started');
    await dbConnect();
    console.log('Database connected');
    
    const { email, password } = await request.json();
    console.log('Login attempt for email:', email);
    
    // Find user by email
    const user = await User.findOne({ email });
    console.log('User found:', !!user);
    
    if (!user) {
      console.log('User not found for email:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    console.log('User details:', { email: user.email, role: user.role, status: user.status });
    
    // Verify password with bcrypt
    const isValidPassword = await bcrypt.compare(password, user.password);
    console.log('Password valid:', isValidPassword);
    
    if (!isValidPassword) {
      console.log('Invalid password for user:', email);
      return NextResponse.json({ error: 'Invalid credentials' }, { status: 401 });
    }
    
    // Check if user is active
    if (user.status !== 'active') {
      console.log('User account inactive:', email);
      return NextResponse.json({ error: 'Account is inactive' }, { status: 401 });
    }
    
    // Update last login
    await User.findByIdAndUpdate(user._id, { lastLogin: new Date() });
    
    const { password: _, ...userWithoutPassword } = user.toObject();
    
    console.log('Login successful for:', email);
    return NextResponse.json({ 
      success: true, 
      user: userWithoutPassword,
      isAdmin: ['admin', 'manager'].includes(user.role)
    });
  } catch (error) {
    console.error('Admin login error:', error);
    return NextResponse.json({ error: 'Login failed', details: error.message }, { status: 500 });
  }
}