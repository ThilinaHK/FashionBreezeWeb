export interface Product {
  _id?: string;
  id?: number;
  name: string;
  slug?: string;
  code: string;
  description?: string;
  price: number;
  cost?: number;
  vat?: number;
  originalPrice?: number;
  discount?: number;
  promoCode?: string;
  category: string | { _id: string; name: string; slug: string };
  subcategory?: string;
  brand?: string;
  image: string;
  images?: Array<{
    url: string;
    alt: string;
    isPrimary: boolean;
  }> | string[];
  sizes?: Array<{
    size: string;
    colors?: Array<{
      name: string;
      code: string;
      stock: number;
      price: number;
    }>;
    stock: number;
    price: number;
  }> | { [key: string]: number };
  colors?: Array<{
    name: string;
    code: string;
    image: string;
  }>;
  status: 'active' | 'inactive' | 'draft' | 'outofstock' | 'instock';
  featured?: boolean;
  rating?: {
    average: number;
    count: number;
  } | number;
  reviewCount?: number;
  reviews?: Array<{
    user: string;
    rating: number;
    comment: string;
    date: Date;
    verified: boolean;
  }>;
  specifications?: {
    material?: string;
    careInstructions?: string;
    origin?: string;
    weight?: string;
  };
  inventory?: {
    totalStock: number;
    lowStockThreshold: number;
    trackInventory: boolean;
  };
  visibility?: 'public' | 'private' | 'hidden';
  createdAt?: Date;
  updatedAt?: Date;
}

export interface CartItem extends Product {
  size?: string;
  quantity: number;
}

export interface Customer {
  name: string;
  email: string;
  phone: string;
  country: string;
  address?: {
    line1: string;
    line2?: string;
    line3?: string;
  };
}

export interface ChatMessage {
  text: string;
  isBot: boolean;
}

export interface Comment {
  customer: string;
  rating: number;
  date: string;
  comment: string;
}

export interface Category {
  _id: string;
  name: string;
  slug: string;
  description?: string;
  image?: string;
  icon?: string;
  subcategories: Array<{
    name: string;
    slug: string;
    description?: string;
    image?: string;
    isActive: boolean;
  }>;
  isActive: boolean;
  sortOrder: number;
  createdAt: Date;
  updatedAt: Date;
}