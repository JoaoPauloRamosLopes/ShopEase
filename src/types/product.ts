import type { StaticImageData } from 'next/image';

export type Product = {
  id: string;
  name: string;
  description: string;
  price: number;
  image: StaticImageData;
  category: string;
};

export type CartItem = {
  product: Product;
  quantity: number;
};

export type PaymentMethod = 'pix' | 'credit_card' | 'boleto';

export type OrderStatus = 'pending' | 'processing' | 'paid' | 'failed' | 'expired';

export type Order = {
  id: string;
  items: CartItem[];
  total: number;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  createdAt: Date;
  updatedAt: Date;
};
