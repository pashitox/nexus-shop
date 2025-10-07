import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css'; // Cambié la ruta
import { Header } from '@/components/layout/Header';
import { Footer } from '@/components/layout/Footer';
import { ToastProvider } from '@/components/ui/Toast';

const inter = Inter({ subsets: ['latin'] });




export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: {
    default: 'NexusShop - Tu tienda online de confianza',
    template: '%s | NexusShop'
  },
  description: 'Descubre los mejores productos al mejor precio en NexusShop',
  keywords: 'tienda, ecommerce, productos, compras online',
  authors: [{ name: 'NexusShop' }],
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <ToastProvider>
          <div className="min-h-screen flex flex-col">
            <Header />
            <main className="flex-1">
              {children}
            </main>
            <Footer />
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}