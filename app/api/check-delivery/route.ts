import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fashionbreeze:fashionbreeze123@cluster0.mongodb.net/fashionBreeze?retryWrites=true&w=majority';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  icon: String,
  deliveryCost: { type: Number, default: 0 },
  subcategories: [mongoose.Schema.Types.Mixed],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Get the For Men category directly
    const forMenCategory = await Category.findOne({ name: 'For Men' }).lean();
    
    return NextResponse.json({
      forMenCategory,
      hasDeliveryCost: forMenCategory?.deliveryCost !== undefined,
      deliveryCostValue: forMenCategory?.deliveryCost
    });
  } catch (error) {
    console.error('Check error:', error);
    return NextResponse.json({ error: 'Check failed', details: error }, { status: 500 });
  }
}