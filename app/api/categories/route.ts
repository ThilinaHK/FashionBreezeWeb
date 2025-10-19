import { NextRequest, NextResponse } from 'next/server';
import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://fashionbreeze:fashionbreeze123@cluster0.mongodb.net/fashionBreeze?retryWrites=true&w=majority';

const categorySchema = new mongoose.Schema({
  name: { type: String, required: true },
  slug: { type: String, required: true, unique: true },
  description: String,
  image: String,
  icon: String,
  subcategories: [{
    name: { type: String, required: true },
    slug: { type: String, required: true },
    description: String,
    image: String,
    isActive: { type: Boolean, default: true }
  }],
  isActive: { type: Boolean, default: true },
  sortOrder: { type: Number, default: 0 }
}, { timestamps: true });

const Category = mongoose.models.Category || mongoose.model('Category', categorySchema);

export async function GET() {
  try {
    await mongoose.connect(MONGODB_URI);
    const categories = await Category.find({ isActive: true }).sort({ sortOrder: 1 });
    return NextResponse.json(categories);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch categories' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    await mongoose.connect(MONGODB_URI);
    const data = await request.json();
    
    const category = new Category({
      ...data,
      slug: data.name.toLowerCase().replace(/\s+/g, '-')
    });
    
    await category.save();
    return NextResponse.json(category);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create category' }, { status: 500 });
  }
}