'use client';

import { useEffect, useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useCart } from '@/contexts/CartContext';
import { MOCK_PRODUCTS } from '@/constants/products';
import { ProductCard } from '@/components/products/ProductCard';
import { Button } from '@/components/ui/button';
import { ShoppingCart } from 'lucide-react';
import type { Product } from '@/types/product';

export default function ProductsPage() {
  const router = useRouter();
  const { totalItems } = useCart();
  const [isLoading, setIsLoading] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setProducts(MOCK_PRODUCTS);
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timeout);
  }, []);

  const skeletonItems = useMemo(() => Array.from({ length: 8 }), []);

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between mb-8">
        <h1 className="text-3xl font-bold">Nossos Produtos</h1>
        <Button
          variant="outline"
          className="relative"
          onClick={() => router.push('/cart')}
        >
          <ShoppingCart className="mr-2 h-4 w-4" />
          Carrinho
          {totalItems > 0 && (
            <span className="absolute -top-2 -right-2 bg-primary text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {skeletonItems.map((_, index) => (
            <div
              key={index}
              className="flex h-full flex-col gap-4 rounded-lg border p-4 animate-pulse"
            >
              <div className="h-40 w-full rounded-md bg-muted" />
              <div className="flex flex-col gap-2">
                <div className="h-5 w-3/4 rounded bg-muted" />
                <div className="h-4 w-full rounded bg-muted/80" />
                <div className="h-4 w-2/3 rounded bg-muted/60" />
              </div>
              <div className="mt-auto flex items-center justify-between">
                <div className="h-6 w-16 rounded bg-muted" />
                <div className="h-10 w-24 rounded bg-muted" />
              </div>
            </div>
          ))}
        </div>
      ) : products.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed py-16 text-center">
          <p className="text-lg font-semibold">Nenhum produto disponível no momento</p>
          <p className="text-sm text-muted-foreground">Volte mais tarde para conferir novos itens.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </div>
      )}
    </div>
  );
}
