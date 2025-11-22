import { NextResponse } from 'next/server';

// In-memory storage for geographical hierarchy
let locations = {
  countries: [
    { id: 1, name: 'Sri Lanka' }
  ],
  regions: [
    { id: 1, name: 'Western Province', countryId: 1 },
    { id: 2, name: 'Central Province', countryId: 1 },
    { id: 3, name: 'Southern Province', countryId: 1 }
  ],
  provinces: [
    { id: 1, name: 'Colombo', regionId: 1 },
    { id: 2, name: 'Gampaha', regionId: 1 },
    { id: 3, name: 'Kalutara', regionId: 1 },
    { id: 4, name: 'Kandy', regionId: 2 },
    { id: 5, name: 'Matale', regionId: 2 }
  ],
  districts: [
    { id: 1, name: 'Colombo District', provinceId: 1 },
    { id: 2, name: 'Gampaha District', provinceId: 2 },
    { id: 3, name: 'Kalutara District', provinceId: 3 },
    { id: 4, name: 'Kandy District', provinceId: 4 }
  ],
  cities: [
    { id: 1, name: 'Colombo', districtId: 1 },
    { id: 2, name: 'Gampaha', districtId: 2 },
    { id: 3, name: 'Kalutara', districtId: 3 },
    { id: 4, name: 'Avissawella', districtId: 1 },
    { id: 5, name: 'Kandy', districtId: 4 }
  ]
};

let nextId = {
  countries: 2,
  regions: 4,
  provinces: 6,
  districts: 5,
  cities: 6
};

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const cityId = searchParams.get('cityId');
    
    if (cityId) {
      // Get hierarchy for a specific city
      const city = locations.cities.find(c => c.id === parseInt(cityId));
      if (!city) {
        return NextResponse.json({ error: 'City not found' }, { status: 404 });
      }
      
      const district = locations.districts.find(d => d.id === city.districtId);
      const province = locations.provinces.find(p => p.id === district?.provinceId);
      const region = locations.regions.find(r => r.id === province?.regionId);
      const country = locations.countries.find(c => c.id === region?.countryId);
      
      return NextResponse.json({
        city,
        district,
        province,
        region,
        country
      });
    }
    
    if (type && locations[type as keyof typeof locations]) {
      return NextResponse.json(locations[type as keyof typeof locations]);
    }
    
    return NextResponse.json(locations);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to fetch addresses' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const { type, name, parentId } = await request.json();
    
    if (!type || !name) {
      return NextResponse.json({ error: 'Type and name are required' }, { status: 400 });
    }
    
    const locationArray = locations[type + 's' as keyof typeof locations] as any[];
    if (!locationArray) {
      return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
    }
    
    const newLocation: any = {
      id: nextId[type + 's' as keyof typeof nextId]++,
      name
    };
    
    // Add parent relationship
    if (parentId) {
      switch (type) {
        case 'region':
          newLocation.countryId = parseInt(parentId);
          break;
        case 'province':
          newLocation.regionId = parseInt(parentId);
          break;
        case 'district':
          newLocation.provinceId = parseInt(parentId);
          break;
        case 'city':
          newLocation.districtId = parseInt(parentId);
          break;
      }
    }
    
    locationArray.push(newLocation);
    
    return NextResponse.json({ success: true, location: newLocation });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create location' }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  try {
    const { type, id, name, parentId } = await request.json();
    
    if (!type || !id || !name) {
      return NextResponse.json({ error: 'Type, id, and name are required' }, { status: 400 });
    }
    
    const locationArray = locations[type + 's' as keyof typeof locations] as any[];
    if (!locationArray) {
      return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
    }
    
    const locationIndex = locationArray.findIndex(l => l.id === parseInt(id));
    if (locationIndex === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    locationArray[locationIndex].name = name;
    
    // Update parent relationship
    if (parentId) {
      switch (type) {
        case 'region':
          locationArray[locationIndex].countryId = parseInt(parentId);
          break;
        case 'province':
          locationArray[locationIndex].regionId = parseInt(parentId);
          break;
        case 'district':
          locationArray[locationIndex].provinceId = parseInt(parentId);
          break;
        case 'city':
          locationArray[locationIndex].districtId = parseInt(parentId);
          break;
      }
    }
    
    return NextResponse.json({ success: true, location: locationArray[locationIndex] });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update location' }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type');
    const id = searchParams.get('id');
    
    if (!type || !id) {
      return NextResponse.json({ error: 'Type and id are required' }, { status: 400 });
    }
    
    const locationArray = locations[type + 's' as keyof typeof locations] as any[];
    if (!locationArray) {
      return NextResponse.json({ error: 'Invalid location type' }, { status: 400 });
    }
    
    const locationIndex = locationArray.findIndex(l => l.id === parseInt(id));
    if (locationIndex === -1) {
      return NextResponse.json({ error: 'Location not found' }, { status: 404 });
    }
    
    // Remove the location
    locationArray.splice(locationIndex, 1);
    
    // Remove child locations
    const locationId = parseInt(id);
    switch (type) {
      case 'country':
        locations.regions = locations.regions.filter(r => r.countryId !== locationId);
        locations.provinces = locations.provinces.filter(p => {
          const region = locations.regions.find(r => r.id === p.regionId);
          return region?.countryId !== locationId;
        });
        locations.districts = locations.districts.filter(d => {
          const province = locations.provinces.find(p => p.id === d.provinceId);
          const region = locations.regions.find(r => r.id === province?.regionId);
          return region?.countryId !== locationId;
        });
        locations.cities = locations.cities.filter(c => {
          const district = locations.districts.find(d => d.id === c.districtId);
          const province = locations.provinces.find(p => p.id === district?.provinceId);
          const region = locations.regions.find(r => r.id === province?.regionId);
          return region?.countryId !== locationId;
        });
        break;
      case 'region':
        locations.provinces = locations.provinces.filter(p => p.regionId !== locationId);
        locations.districts = locations.districts.filter(d => {
          const province = locations.provinces.find(p => p.id === d.provinceId);
          return province?.regionId !== locationId;
        });
        locations.cities = locations.cities.filter(c => {
          const district = locations.districts.find(d => d.id === c.districtId);
          const province = locations.provinces.find(p => p.id === district?.provinceId);
          return province?.regionId !== locationId;
        });
        break;
      case 'province':
        locations.districts = locations.districts.filter(d => d.provinceId !== locationId);
        locations.cities = locations.cities.filter(c => {
          const district = locations.districts.find(d => d.id === c.districtId);
          return district?.provinceId !== locationId;
        });
        break;
      case 'district':
        locations.cities = locations.cities.filter(c => c.districtId !== locationId);
        break;
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to delete location' }, { status: 500 });
  }
}