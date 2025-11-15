import { NextRequest, NextResponse } from 'next/server';
import { connectToDatabase } from '@/app/lib/mongodb';
import { Product } from '@/app/lib/models/Product';
import { Order } from '@/app/lib/models/Order';
import { Customer } from '@/app/lib/models/Customer';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();
    
    const { searchParams } = new URL(request.url);
    const reportType = searchParams.get('type');
    const startDate = searchParams.get('startDate');
    const endDate = searchParams.get('endDate');

    let dateFilter = {};
    if (startDate && endDate) {
      dateFilter = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate)
        }
      };
    }

    switch (reportType) {
      case 'sales':
        const orders = await Order.find(dateFilter).populate('customerId', 'name email phone');
        return NextResponse.json({ success: true, data: orders });

      case 'products':
        const products = await Product.find({});
        return NextResponse.json({ success: true, data: products });

      case 'customers':
        const customers = await Customer.find(dateFilter);
        return NextResponse.json({ success: true, data: customers });

      case 'inventory':
        const inventory = await Product.find({}).select('name productCode category subcategory sizes totalStock status');
        return NextResponse.json({ success: true, data: inventory });

      case 'summary':
        const totalOrders = await Order.countDocuments(dateFilter);
        const totalRevenue = await Order.aggregate([
          { $match: dateFilter },
          { $group: { _id: null, total: { $sum: '$totalAmount' } } }
        ]);
        const totalProducts = await Product.countDocuments();
        const totalCustomers = await Customer.countDocuments(dateFilter);
        const lowStockProducts = await Product.countDocuments({ totalStock: { $lt: 10 } });

        return NextResponse.json({
          success: true,
          data: {
            totalOrders,
            totalRevenue: totalRevenue[0]?.total || 0,
            totalProducts,
            totalCustomers,
            lowStockProducts
          }
        });

      default:
        return NextResponse.json({ success: false, message: 'Invalid report type' }, { status: 400 });
    }
  } catch (error) {
    console.error('Reports API error:', error);
    return NextResponse.json({ success: false, message: 'Failed to generate report' }, { status: 500 });
  }
}