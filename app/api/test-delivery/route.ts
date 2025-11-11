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

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);
    
    // Add deliveryCost field to all categories that don't have it
    const result = await Category.updateMany(
      { deliveryCost: { $exists: false } },
      { $set: { deliveryCost: 0 } }
    );
    
    // Update For Men category with a test delivery cost
    const forMenUpdate = await Category.findOneAndUpdate(
      { name: 'For Men' },
      { $set: { deliveryCost: 199.99 } },
      { new: true }
    );
    
    return NextResponse.json({
      message: 'Migration completed',
      migrationResult: result,
      forMenCategory: forMenUpdate
    });
  } catch (error) {
    console.error('Migration error:', error);
    return NextResponse.json({ error: 'Migration failed', details: error }, { status: 500 });
  }
}