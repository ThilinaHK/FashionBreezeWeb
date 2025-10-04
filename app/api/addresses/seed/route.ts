import { NextResponse } from 'next/server';
import { connectDB } from '../../../lib/mongodb';
import Address from '../../../lib/models/Address';

export async function POST() {
  try {
    await connectDB();
    
    const hierarchicalAddresses = [
      // Countries
      { id: 1, name: 'Sri Lanka', type: 'country', parentId: null },
      
      // Regions
      { id: 2, name: 'Western Province', type: 'region', parentId: 1 },
      { id: 3, name: 'Central Province', type: 'region', parentId: 1 },
      { id: 4, name: 'Southern Province', type: 'region', parentId: 1 },
      
      // Districts
      { id: 5, name: 'Colombo', type: 'district', parentId: 2 },
      { id: 6, name: 'Gampaha', type: 'district', parentId: 2 },
      { id: 7, name: 'Kalutara', type: 'district', parentId: 2 },
      { id: 8, name: 'Kandy', type: 'district', parentId: 3 },
      { id: 9, name: 'Matale', type: 'district', parentId: 3 },
      { id: 10, name: 'Galle', type: 'district', parentId: 4 },
      { id: 11, name: 'Matara', type: 'district', parentId: 4 },
      
      // Cities
      { id: 12, name: 'Colombo 01', type: 'city', parentId: 5 },
      { id: 13, name: 'Colombo 02', type: 'city', parentId: 5 },
      { id: 14, name: 'Colombo 03', type: 'city', parentId: 5 },
      { id: 15, name: 'Negombo', type: 'city', parentId: 6 },
      { id: 16, name: 'Gampaha', type: 'city', parentId: 6 },
      { id: 17, name: 'Kalutara', type: 'city', parentId: 7 },
      { id: 18, name: 'Kandy', type: 'city', parentId: 8 },
      { id: 19, name: 'Matale', type: 'city', parentId: 9 },
      { id: 20, name: 'Galle', type: 'city', parentId: 10 },
      { id: 21, name: 'Matara', type: 'city', parentId: 11 }
    ];

    // Clear existing addresses
    await Address.deleteMany({});
    
    // Insert new addresses
    const result = await Address.insertMany(hierarchicalAddresses);
    
    console.log(`Successfully seeded ${result.length} addresses`);
    return NextResponse.json({ 
      success: true, 
      message: `Hierarchical addresses created successfully (${result.length} items)`,
      count: result.length
    });
  } catch (error) {
    console.error('Address seed error:', error);
    return NextResponse.json({ 
      error: 'Failed to seed addresses', 
      details: (error as Error).message 
    }, { status: 500 });
  }
}