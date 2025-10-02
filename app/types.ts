export interface Product {
  id: number;
  name: string;
  code: string;
  cost?: number;
  vat?: number;
  price: number;
  category: string;
  image: string;
  sizes?: { [key: string]: number };
  status: 'instock' | 'outofstock';
  rating?: number;
  reviewCount?: number;
}