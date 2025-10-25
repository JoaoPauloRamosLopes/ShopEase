'use client';

import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { Button } from '@/components/ui/button';
import { ShoppingCart, ArrowLeft } from 'lucide-react';
import { CartItem } from '@/components/cart/CartItem';
import { CartSummary } from '@/components/cart/CartSummary';

export default function CartPage() {
  const { items, updateQuantity, removeFromCart, subtotal, totalItems } = useCart();
  const router = useRouter();

  if (items.length === 0) {
    return (
      <div className="container mx-auto py-12 px-4 text-center">
        <div className="flex flex-col items-center justify-center space-y-4">
          <ShoppingCart className="h-16 w-16 text-muted-foreground" />
          <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
          <p className="text-muted-foreground">Adicione itens ao carrinho para continuar</p>
          <Button onClick={() => router.push('/products')} className="mt-4">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Continuar Comprando
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold">Seu Carrinho</h1>
        <Button variant="outline" onClick={() => router.push('/products')}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Continuar Comprando
        </Button>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        <div className="md:col-span-2 space-y-4">
          {items.map((item) => (
            <CartItem
              key={item.product.id}
              item={item}
              onIncrement={(productId) => updateQuantity(productId, item.quantity + 1)}
              onDecrement={(productId) => updateQuantity(productId, Math.max(1, item.quantity - 1))}
              onRemove={removeFromCart}
            />
          ))}
        </div>

        <div className="md:col-span-1">
          <CartSummary
            totalItems={totalItems}
            subtotal={subtotal}
            onCheckout={() => router.push('/checkout')}
          />
        </div>
      </div>
    </div>
  );
}
