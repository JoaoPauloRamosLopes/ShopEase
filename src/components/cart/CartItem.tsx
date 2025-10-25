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
    <div className="flex items-center p-4 border rounded-lg">
      <div className="relative h-24 w-24 shrink-0 overflow-hidden rounded-md bg-gray-100">
        <Image
          src={item.product.image}
          alt={item.product.name}
          fill
          className="object-cover"
          sizes="96px"
        />
      </div>

      <div className="ml-4 flex-1">
        <h3 className="font-medium">{item.product.name}</h3>
        <p className="text-sm text-muted-foreground">R$ {item.product.price.toFixed(2)}</p>

        <div className="mt-2 flex items-center">
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

      <div className="ml-4 flex flex-col items-end">
        <p className="font-medium">
          R$ {(item.product.price * item.quantity).toFixed(2)}
        </p>
        <Button
          variant="ghost"
          size="sm"
          className="mt-2 text-destructive hover:text-destructive/90"
          onClick={() => onRemove(item.product.id)}
        >
          <Trash2 className="mr-1 h-4 w-4" />
          Remover
        </Button>
      </div>
    </div>
  );
}
