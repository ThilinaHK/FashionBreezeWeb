import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import Customer from '../../lib/models/Customer';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find customer by email
    const customer = await Customer.findOne({ email });
    console.log('Looking for customer with email:', email);
    console.log('Found customer:', customer ? 'Yes' : 'No');

    if (!customer) {
      return NextResponse.json({ error: 'Customer not found with this email address' }, { status: 404 });
    }

    // Verify customer is active
    if (customer.status !== 'active') {
      return NextResponse.json({ error: 'Account is inactive. Please contact support.' }, { status: 403 });
    }

    // Create email transporter
    const transporter = nodemailer.createTransporter({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER || 'fashionbreezesrilanka@gmail.com',
        pass: process.env.EMAIL_PASS || 'fashionbreeze$$$123'
      }
    });

    // Email template
    const mailOptions = {
      from: process.env.EMAIL_USER || 'fashionbreezesrilanka@gmail.com',
      to: email,
      subject: 'Fashion Breeze - Password Recovery',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Fashion Breeze</h1>
            <p style="color: white; margin: 5px 0;">Password Recovery</p>
          </div>
          <div style="padding: 30px; background: #f8f9fa;">
            <h2 style="color: #333;">Your Password Details</h2>
            <p>Hello,</p>
            <p>You requested to recover your password for Fashion Breeze. Here are your login details:</p>
            <div style="background: white; padding: 20px; border-radius: 8px; border-left: 4px solid #667eea;">
              <p><strong>Email:</strong> ${email}</p>
              <p><strong>Password:</strong> ${customer.password}</p>
              <p><strong>Name:</strong> ${customer.name}</p>
            </div>
            <p style="margin-top: 20px;">For security reasons, please consider changing your password after logging in.</p>
            <div style="text-align: center; margin-top: 30px;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/login" 
                 style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 12px 30px; text-decoration: none; border-radius: 25px; display: inline-block;">
                Login Now
              </a>
            </div>
          </div>
          <div style="background: #333; color: white; padding: 15px; text-align: center; font-size: 12px;">
            <p>© 2024 Fashion Breeze. All rights reserved.</p>
            <p>Contact: +94 70 700 3722 | info@fashionbreeze.lk</p>
          </div>
        </div>
      `
    };

    // Send email
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ 
      success: true, 
      message: 'Password sent to your email successfully!' 
    });

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Failed to send password. Please try again.' 
    }, { status: 500 });
  }
}