import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/mongodb';
import Product from '../../../lib/models/Product';
import Category from '../../../lib/models/Category';
import User from '../../../lib/models/User';

export async function GET(request: NextRequest) {
  try {
    await dbConnect();

    const users = await User.find({}, 'id username role privileges');
    const userReports = [];

    for (const user of users) {
      // Count products created/updated by user
      const productsCreated = await Product.countDocuments({ createdBy: user.id });
      const productsUpdated = await Product.countDocuments({ 
        updatedBy: user.id,
        createdBy: { $ne: user.id }
      });

      // Count categories created/updated by user
      const categoriesCreated = await Category.countDocuments({ createdBy: user.id });
      const categoriesUpdated = await Category.countDocuments({ 
        updatedBy: user.id,
        createdBy: { $ne: user.id }
      });

      // Get recent activities
      const recentProducts = await Product.find({
        $or: [{ createdBy: user.id }, { updatedBy: user.id }]
      }).select('name createdAt updatedAt createdBy updatedBy').limit(5).sort({ updatedAt: -1 });

      const recentCategories = await Category.find({
        $or: [{ createdBy: user.id }, { updatedBy: user.id }]
      }).select('name createdAt updatedAt createdBy updatedBy').limit(5).sort({ updatedAt: -1 });

      userReports.push({
        user: {
          id: user.id,
          username: user.username,
          role: user.role,
          privileges: user.privileges
        },
        stats: {
          productsCreated,
          productsUpdated,
          categoriesCreated,
          categoriesUpdated,
          totalActivities: productsCreated + productsUpdated + categoriesCreated + categoriesUpdated
        },
        recentActivities: [
          ...recentProducts.map(p => ({
            type: 'product',
            name: p.name,
            action: p.createdBy === user.id ? 'created' : 'updated',
            date: p.createdBy === user.id ? p.createdAt : p.updatedAt
          })),
          ...recentCategories.map(c => ({
            type: 'category',
            name: c.name,
            action: c.createdBy === user.id ? 'created' : 'updated',
            date: c.createdBy === user.id ? c.createdAt : c.updatedAt
          }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 10)
      });
    }

    return NextResponse.json(userReports.sort((a, b) => b.stats.totalActivities - a.stats.totalActivities));
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch user reports' }, { status: 500 });
  }
}