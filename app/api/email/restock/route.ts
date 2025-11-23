import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';

export async function POST(request: NextRequest) {
  try {
    await dbConnect();
    const { productId, productName, productImage, productPrice, restockQuantity } = await request.json();
    
    // Get customers who might be interested (in a real app, get from wishlist/notifications)
    const customerEmails = [
      'customer1@example.com',
      'customer2@example.com',
      'customer3@example.com'
    ];

    const emailContent = {
      subject: `🎉 ${productName} is Back in Stock!`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding: 20px; text-align: center;">
            <h1 style="color: white; margin: 0;">Fashion Breeze</h1>
            <p style="color: white; margin: 5px 0;">Back in Stock Alert!</p>
          </div>
          
          <div style="padding: 30px; background: #f9f9f9;">
            <h2 style="color: #333; text-align: center;">Great News! ${productName} is Available Again</h2>
            
            <div style="text-align: center; margin: 20px 0;">
              <img src="${productImage}" alt="${productName}" style="max-width: 200px; border-radius: 8px;">
            </div>
            
            <div style="background: white; padding: 20px; border-radius: 8px; margin: 20px 0;">
              <h3 style="color: #333; margin-top: 0;">${productName}</h3>
              <p style="font-size: 24px; color: #e74c3c; font-weight: bold;">₹${productPrice}</p>
              <p style="color: #27ae60; font-weight: bold;">✅ ${restockQuantity} items restocked</p>
              <p style="color: #666;">Don't miss out! This popular item is back in stock with limited quantity.</p>
            </div>
            
            <div style="text-align: center; margin: 30px 0;">
              <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}" 
                 style="background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 5px; font-weight: bold;">
                Shop Now
              </a>
            </div>
            
            <div style="border-top: 1px solid #ddd; padding-top: 20px; margin-top: 30px;">
              <p style="color: #666; font-size: 12px; text-align: center;">
                You received this email because you showed interest in this product.<br>
                Fashion Breeze - Your Fashion Destination
              </p>
            </div>
          </div>
        </div>
      `
    };

    // Simulate sending emails to customers
    console.log(`Sending restock notification for ${productName} to ${customerEmails.length} customers`);
    console.log('Email content:', emailContent);

    // In a real app, use nodemailer or email service
    const emailResults = customerEmails.map(email => ({
      email,
      status: 'sent',
      timestamp: new Date().toISOString()
    }));

    return NextResponse.json({ 
      success: true, 
      message: `Restock notifications sent to ${customerEmails.length} customers`,
      emailsSent: emailResults.length,
      details: emailResults
    });
  } catch (error) {
    console.error('Error sending restock emails:', error);
    return NextResponse.json({ error: 'Failed to send restock notifications' }, { status: 500 });
  }
}