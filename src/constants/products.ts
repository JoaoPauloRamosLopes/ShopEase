import { Product } from '@/types/product';
import earbuds from '../../public/imgs/earbuds.avif';
import smartwatch from '../../public/imgs/smartwatch.png';
import speaker from '../../public/imgs/speaker.jpg';
import backpack from '../../public/imgs/backpack.jpg';
import mouse from '../../public/imgs/mouse.jpg';
import keyboard from '../../public/imgs/keyboard.jpg';

export const MOCK_PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Wireless Earbuds',
    description: 'High-quality wireless earbuds with noise cancellation',
    price: 199.99,
    image: earbuds,
    category: 'Electronics',
  },
  {
    id: '2',
    name: 'Smart Watch',
    description: 'Feature-rich smartwatch with health tracking',
    price: 249.99,
    image: smartwatch,
    category: 'Electronics',
  },
  {
    id: '3',
    name: 'Bluetooth Speaker',
    description: 'Portable bluetooth speaker with 20h battery life',
    price: 129.99,
    image: speaker,
    category: 'Electronics',
  },
  {
    id: '4',
    name: 'Laptop Backpack',
    description: 'Durable backpack with laptop compartment',
    price: 59.99,
    image: backpack,
    category: 'Accessories',
  },
  {
    id: '5',
    name: 'Wireless Mouse',
    description: 'Ergonomic wireless mouse with silent click',
    price: 29.99,
    image: mouse,
    category: 'Electronics',
  },
  {
    id: '6',
    name: 'Mechanical Keyboard',
    description: 'RGB mechanical keyboard with blue switches',
    price: 89.99,
    image: keyboard,
    category: 'Electronics',
  },
];
