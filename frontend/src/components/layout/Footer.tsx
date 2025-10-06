import Link from 'next/link';
import { Facebook, Twitter, Instagram, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Logo & Company Info */}
          <div className="col-span-1 md:col-span-1">
            <Link href="/" className="flex items-center space-x-2 mb-4">
              <div className="w-10 h-10 bg-primary-600 rounded-lg flex items-center justify-center shadow-md">
                <span className="text-white font-bold text-lg">N</span>
              </div>
              <span className="text-2xl font-bold tracking-wide">NexusShop</span>
            </Link>
            <p className="text-gray-300 mb-4 max-w-xs leading-relaxed">
              Tu tienda online de confianza. Productos de calidad al mejor precio, con envío rápido y seguro.
            </p>
            <div className="flex space-x-4 mt-2">
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Facebook className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Twitter className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Instagram className="w-5 h-5" />
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors">
                <Mail className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Quick Links - SOLO PÁGINAS QUE EXISTEN */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Enlaces Rápidos</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/products" className="text-gray-300 hover:text-white transition-colors">
                  Productos
                </Link>
              </li>
              <li>
                <Link href="/cart" className="text-gray-300 hover:text-white transition-colors">
                  Carrito
                </Link>
              </li>
              <li>
                <Link href="/profile" className="text-gray-300 hover:text-white transition-colors">
                  Mi Cuenta
                </Link>
              </li>
            </ul>
          </div>

          {/* Información Útil */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-100">Información</h3>
            <ul className="space-y-2">
              <li>
                <span className="text-gray-300">Email: info@nexusshop.com</span>
              </li>
              <li>
                <span className="text-gray-300">Soporte 24/7</span>
              </li>
              <li>
                <span className="text-gray-300">Envíos a todo el país</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-gray-800 mt-8 pt-6 flex flex-col md:flex-row justify-between items-center">
          <p className="text-gray-400 text-sm">&copy; 2024 NexusShop. Todos los derechos reservados.</p>
          <div className="flex space-x-6 mt-4 md:mt-0">
            <span className="text-gray-400 text-sm">Desarrollado con ❤️</span>
          </div>
        </div>
      </div>
    </footer>
  );
};