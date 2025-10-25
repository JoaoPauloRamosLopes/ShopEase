'use client';

import { Button } from '@/components/ui/button';
import { Minus, Plus, Trash2 } from 'lucide-react';
import Image from 'next/image';
import { CartItem as CartItemType } from '@/types/product';

export type CartItemProps = {
  item: CartItemType;
  onIncrement: (productId: string) => void;
  onDecrement: (productId: string) => void;
  onRemove: (productId: string) => void;
};

export function CartItem({ item, onIncrement, onDecrement, onRemove }: CartItemProps) {
  return (
    <div className="flex flex-col gap-4 rounded-lg border p-4 sm:flex-row sm:items-center">
      <div className="relative h-32 w-full overflow-hidden rounded-md bg-muted sm:h-24 sm:w-24">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="(max-width: 640px) 100vw, 96px"
        />
      </div>

      <div className="flex-1 space-y-2 sm:ml-4">
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">R$ {item.product.price.toFixed(2)}</p>

        <div className="mt-3 flex flex-wrap items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onDecrement(item.product.id)}
            className="h-8 w-8 p-0"
          >
            <Minus className="h-4 w-4" />
          </Button>
          <span className="mx-4 min-w-8 text-center">{item.quantity}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onIncrement(item.product.id)}
            className="h-8 w-8 p-0"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="flex flex-col items-start gap-2 sm:ml-4 sm:items-end">
        <p className="text-base font-semibold sm:text-lg">
          R$ {(item.product.price * item.quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="text-destructive hover:text-destructive/90"
          onClick={() => onRemove(item.product.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Remover
        </Button>
      </div>
    </div>
  );
}
