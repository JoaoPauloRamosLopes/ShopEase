'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { ShoppingCart, Package, CreditCard, LogOut } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useCart } from '@/contexts/CartContext';

export function MainNav() {
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading: authLoading } = useAuth();
  const { totalItems } = useCart();

  if (authLoading) {
    return (
      <header className="border-b">
        <div className="container flex h-16 items-center justify-between px-4 md:px-6">
          <div className="h-8 w-32 rounded bg-muted animate-pulse" />
          <div className="h-10 w-24 rounded bg-muted animate-pulse" />
        </div>
      </header>
    );
  }

  const routes = [
    {
      href: '/products',
      label: 'Produtos',
      icon: <Package className="h-4 w-4" />,
      active: pathname === '/products',
    },
    {
      href: '/cart',
      label: 'Carrinho',
      icon: <ShoppingCart className="h-4 w-4" />,
      active: pathname === '/cart',
      badge: totalItems > 0 ? totalItems : undefined,
    },
  ];

  return (
    <header className="border-b">
  <div className="flex h-16 items-center justify-between px-6 md:px-12 w-full max-w-[1600px] mx-auto">
    <Link href="/" className="flex items-center space-x-2">
      <span className="text-xl font-bold">ShopEase</span>
    </Link>

    <div className="ml-auto flex items-center gap-3 sm:gap-6">
      <nav className="flex items-center gap-x-3 sm:gap-x-6 text-xs sm:text-sm font-medium">
        {routes.map((route) => (
          <Link
            key={route.href}
            href={route.href}
            className={`flex items-center space-x-2 transition-colors hover:text-primary ${
              route.active ? 'text-primary' : 'text-muted-foreground'
            }`}
          >
            {route.icon}
            <span>{route.label}</span>
            {route.badge && (
              <span className="flex h-5 w-5 items-center justify-center rounded-full bg-primary text-xs text-primary-foreground">
                {route.badge}
              </span>
            )}
          </Link>
        ))}
      </nav>

      <div className="flex items-center gap-2 sm:gap-4">
        {isAuthenticated ? (
          <div className="flex items-center gap-2 sm:gap-3">
            <span className="hidden text-xs font-medium sm:inline sm:text-sm">
              Olá, {user?.name || 'Usuário'}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={logout}
              className="flex items-center space-x-2"
            >
              <LogOut className="h-4 w-4" />
              <span className="text-xs sm:text-sm">Sair</span>
            </Button>
          </div>
        ) : (
          <Button asChild size="sm">
            <Link href="/auth" className="text-xs sm:text-sm">
              Login
            </Link>
          </Button>
        )}
      </div>
    </div>
  </div>
</header>

  );
}
