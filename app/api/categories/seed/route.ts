import { NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Category from '../../../lib/models/Category';

export async function POST() {
  try {
    await dbConnect();
    
    await Category.deleteMany({});
    
    const categories = [
      {
        name: 'Men\'s Fashion',
        slug: 'mens-fashion',
        description: 'Trendy and comfortable clothing for men',
        icon: 'bi-person',
        subcategories: [
          { name: 'T-Shirts', slug: 't-shirts', description: 'Casual and formal t-shirts' },
          { name: 'Shirts', slug: 'shirts', description: 'Formal and casual shirts' },
          { name: 'Jeans', slug: 'jeans', description: 'Denim jeans and pants' },
          { name: 'Trousers', slug: 'trousers', description: 'Formal and casual trousers' },
          { name: 'Jackets', slug: 'jackets', description: 'Blazers, coats and jackets' },
          { name: 'Shoes', slug: 'shoes', description: 'Formal and casual footwear' },
        ],
        sortOrder: 1,
      },
      {
        name: 'Women\'s Fashion',
        slug: 'womens-fashion',
        description: 'Elegant and stylish clothing for women',
        icon: 'bi-person-dress',
        subcategories: [
          { name: 'Dresses', slug: 'dresses', description: 'Casual and formal dresses' },
          { name: 'Tops', slug: 'tops', description: 'Blouses, t-shirts and tops' },
          { name: 'Bottoms', slug: 'bottoms', description: 'Jeans, skirts and pants' },
          { name: 'Outerwear', slug: 'outerwear', description: 'Jackets, coats and cardigans' },
          { name: 'Shoes', slug: 'shoes', description: 'Heels, flats and sneakers' },
        ],
        sortOrder: 2,
      },
      {
        name: 'Kids Fashion',
        slug: 'kids-fashion',
        description: 'Comfortable and fun clothing for children',
        icon: 'bi-people',
        subcategories: [
          { name: 'Boys Clothing', slug: 'boys-clothing', description: 'Clothing for boys' },
          { name: 'Girls Clothing', slug: 'girls-clothing', description: 'Clothing for girls' },
          { name: 'Baby Clothing', slug: 'baby-clothing', description: 'Clothing for babies' },
        ],
        sortOrder: 3,
      },
    ];
    
    const createdCategories = await Category.insertMany(categories);
    
    return NextResponse.json({ 
      message: 'Categories seeded successfully', 
      count: createdCategories.length,
      categories: createdCategories 
    });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to seed categories' }, { status: 500 });
  }
}