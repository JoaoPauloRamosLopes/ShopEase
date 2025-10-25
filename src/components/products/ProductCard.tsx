'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import Image from 'next/image';
import { useToast } from '@/components/ui/use-toast';
import { useCart } from '@/contexts/CartContext';
import { Product } from '@/types/product';
import { useState } from 'react';

const priceFormatter = new Intl.NumberFormat('pt-BR', {
  style: 'currency',
  currency: 'BRL',
});

type ProductCardProps = {
  product: Product;
};

export function ProductCard({ product }: ProductCardProps) {
  const { addToCart } = useCart();
  const [isAdding, setIsAdding] = useState(false);
  const { toast } = useToast();

  const handleAddToCart = async () => {
    setIsAdding(true);
    try {
      await new Promise(resolve => setTimeout(resolve, 500));
      addToCart(product);
      toast({
        title: 'Produto adicionado',
        description: `${product.name} foi adicionado ao carrinho.`,
        variant: 'success',
      });
    } catch (error) {
      console.error('ProductCard: erro ao adicionar ao carrinho', error);
      toast({
        title: 'Erro ao adicionar',
        description: 'Não foi possível adicionar o produto. Tente novamente.',
        variant: 'destructive',
      });
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <Card className="group flex h-full flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative aspect-video w-full overflow-hidden bg-muted">
        <Image
          src={product.image}
          alt={product.name}
          fill
          className="object-cover transition-transform duration-500 group-hover:scale-105"
          sizes="(min-width: 1280px) 280px, (min-width: 1024px) 240px, (min-width: 640px) calc(50vw - 48px), 100vw"
          placeholder="blur"
          quality={90}
        />
      </div>
      <CardHeader className="flex-1">
        <CardTitle className="text-lg">{product.name}</CardTitle>
        <CardDescription className="line-clamp-2">{product.description}</CardDescription>
      </CardHeader>
      <CardContent className="pb-2">
        <div className="flex items-center justify-between gap-3">
          <span className="text-2xl font-bold">
            {priceFormatter.format(product.price)}
          </span>
          <span className="rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
            {product.category}
          </span>
        </div>
      </CardContent>
      <CardFooter className="pt-2">
        <Button 
          onClick={handleAddToCart} 
          className="w-full"
          disabled={isAdding}
        >
          {isAdding ? 'Adicionando...' : 'Adicionar ao Carrinho'}
        </Button>
      </CardFooter>
    </Card>
  );
}
