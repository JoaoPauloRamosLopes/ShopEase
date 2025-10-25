import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers';
import { ClientLayout } from '@/components/ClientLayout';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: 'ShopEase - Seu E-commerce Favorito',
  description: 'Uma experiência de compra simples e segura',
  icons: {
    icon: [{ url: 'https://firebasestorage.googleapis.com/v0/b/pessoal-8849f.appspot.com/o/ShopEase%2Fimage.webp?alt=media&token=89cd28c9-02c7-4443-9839-5b7293113a9a', type: 'image/webp' }],
    shortcut: [{ url: 'https://firebasestorage.googleapis.com/v0/b/pessoal-8849f.appspot.com/o/ShopEase%2Fimage.webp?alt=media&token=89cd28c9-02c7-4443-9839-5b7293113a9a', type: 'image/webp' }],
    apple: [{ url: 'https://firebasestorage.googleapis.com/v0/b/pessoal-8849f.appspot.com/o/ShopEase%2Fimage.webp?alt=media&token=89cd28c9-02c7-4443-9839-5b7293113a9a', type: 'image/webp' }],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pt-BR" suppressHydrationWarning>
      <body 
        className={`${geistSans.variable} ${geistMono.variable} min-h-screen bg-background font-sans antialiased`}
        suppressHydrationWarning
      >
        <Providers>
          <ClientLayout>
            {children}
          </ClientLayout>
        </Providers>
      </body>
    </html>
  );
}
