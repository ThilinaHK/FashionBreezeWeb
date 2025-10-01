export interface Product {
  id: number;
  name: string;
  code: string;
  price: number;
  originalPrice?: number;
  discount?: number;
  promoCode?: string;
  category: string;
  image: string;
  images?: string[];
  sizes?: { [key: string]: number };
  status: 'instock' | 'outofstock';
  rating?: number;
  reviewCount?: number;
}

export interface CartItem extends Product {
  size?: string;
  quantity: number;
  selectedSizeData?: {
    size: string;
    stock: number;
    price: number;
  };
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