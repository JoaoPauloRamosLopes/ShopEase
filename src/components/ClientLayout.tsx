'use client';

import { useEffect, useState } from 'react';
import { usePathname, useRouter } from 'next/navigation';
import { Toaster } from '@/components/ui/toaster';
import { MainNav } from '@/components/layout/MainNav';
import { useAuth } from '@/contexts/AuthContext';

export function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { isAuthenticated, loading } = useAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  const isAuthPage = pathname.startsWith('/auth');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    
    console.log('ClientLayout: Montando componente');
    setIsMounted(true);
    
    const timer = setTimeout(() => {
      console.log('ClientLayout: Inicialização concluída');
      setIsInitialized(true);
    }, 100);
    
    return () => {
      console.log('ClientLayout: Desmontando componente');
      clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined' || !isMounted || loading) return;
    
    console.log('ClientLayout: Verificando rota', { 
      isAuthPage, 
      pathname, 
      isAuthenticated,
      isMounted,
      loading
    });
    
    if (isAuthenticated && isAuthPage) {
      console.log('ClientLayout: Usuário autenticado, redirecionando para /products');
      router.replace('/products');
    }
  }, [isAuthenticated, isAuthPage, pathname, isMounted, loading, router]);
  
  if (loading || !isMounted || !isInitialized) {
    console.log('ClientLayout: Mostrando spinner de carregamento', { 
      loading, 
      isMounted, 
      isInitialized 
    });
    
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
      </div>
    );
  }
  
  return (
    <div className="flex min-h-screen flex-col">
      <MainNav />
      <main className="flex-1">
        {children}
      </main>
      <footer className="border-t py-6">
        <div className="container flex flex-col items-center justify-between gap-4 md:h-16 md:flex-row">
          <p className="text-center ml-[50%] text-sm leading-loose text-muted-foreground md:text-center">
            &copy; {new Date().getFullYear()} ShopEase. Todos os direitos reservados.
          </p>
        </div>
      </footer>
      <Toaster />
    </div>
  );
}
