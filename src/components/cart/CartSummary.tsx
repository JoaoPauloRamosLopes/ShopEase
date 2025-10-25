'use client';

import { Button } from '@/components/ui/button';

export type CartSummaryProps = {
  totalItems: number;
  subtotal: number;
  onCheckout?: () => void;
};

export function CartSummary({ totalItems, subtotal, onCheckout }: CartSummaryProps) {
  return (
    <div className="rounded-lg border p-6">
      <h2 className="mb-4 text-lg font-semibold">Resumo do Pedido</h2>

      <div className="mb-6 space-y-2 text-sm">
        <div className="flex justify-between">
          <span>Subtotal ({totalItems} {totalItems === 1 ? 'item' : 'itens'})</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
        <div className="flex justify-between">
          <span>Frete</span>
          <span>Grátis</span>
        </div>
        <div className="mt-2 flex justify-between border-t pt-2 text-base font-semibold">
          <span>Total</span>
          <span>R$ {subtotal.toFixed(2)}</span>
        </div>
      </div>

      <Button className="w-full" size="lg" onClick={onCheckout}>
        Finalizar Compra
      </Button>
    </div>
  );
}
