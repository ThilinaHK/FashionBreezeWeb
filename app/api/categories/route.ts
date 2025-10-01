import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  const categories = [
    { id: 1, name: 'For Men', productCount: 3 },
    { id: 2, name: 'For Women', productCount: 2 },
    { id: 3, name: 'Kids', productCount: 1 },
    { id: 4, name: 'Hair', productCount: 1 },
    { id: 5, name: 'Fragrances', productCount: 1 },
    { id: 6, name: 'Skin', productCount: 1 },
    { id: 7, name: 'Home', productCount: 1 }
  ];
  return NextResponse.json(categories);
}

export async function POST(request: NextRequest) {
  const { name } = await request.json();
  const newCategory = { id: Date.now(), name, productCount: 0 };
  return NextResponse.json(newCategory, { status: 201 });
}

export async function PUT(request: NextRequest) {
  const { id, name } = await request.json();
  return NextResponse.json({ id, name, productCount: 0 });
}

export async function DELETE(request: NextRequest) {
  const { id } = await request.json();
  return NextResponse.json({ success: true });
}