export interface Product {
  id: number;
  _id?: string;
  name: string;
  code: string;
  cost?: number;
  vat?: number;
  price: number;
  category: string;
  image: string;
  sizes?: { [key: string]: number };
  status: 'instock' | 'outofstock' | 'active';
  rating?: number;
  reviewCount?: number;
}