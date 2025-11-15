import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../lib/mongodb';
import User from '../../lib/models/User';
import nodemailer from 'nodemailer';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({ error: 'Email is required' }, { status: 400 });
    }

    // Find customer by email
    const user = await User.findOne({ email });
    console.log('Looking for user with email:', email);
    console.log('Found user:', user ? 'Yes' : 'No');

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Create email transporter with better configuration
    const transporter = nodemailer.createTransport({
      host: 'smtp.gmail.com',
      port: 587,
      secure: false,
      auth: {
        user: 'fashionbreezesrilanka@gmail.com',
        pass: 'fashionbreeze$$$123'
      },
      tls: {
        rejectUnauthorized: false
      }
    });

    // Verify transporter
    try {
      await transporter.verify();
      console.log('Email transporter verified successfully');
    } catch (verifyError) {
      console.error('Email transporter verification failed:', verifyError);
      // Continue anyway, sometimes verify fails but sending works
    }

    // Email template
    const mailOptions = {
      from: 'fashionbreezesrilanka@gmail.com',
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
              <p><strong>Password:</strong> ${user.password}</p>
              <p><strong>Role:</strong> Customer</p>
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
    try {
      const info = await transporter.sendMail(mailOptions);
      console.log('Email sent successfully:', info.messageId);
      
      return NextResponse.json({ 
        success: true, 
        message: 'Password sent to your email successfully!' 
      });
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      
      // Return success anyway to avoid exposing email issues
      return NextResponse.json({ 
        success: true, 
        message: 'If the email exists, password has been sent to your email.' 
      });
    }

  } catch (error) {
    console.error('Forgot password error:', error);
    return NextResponse.json({ 
      error: 'Failed to send password. Please try again.' 
    }, { status: 500 });
  }
}