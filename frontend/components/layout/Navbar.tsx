'use client'

import { useState } from 'react'

export default function Navbar() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <nav className="bg-white/90 backdrop-blur-md border-b border-gray-200 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              NexusShop
            </span>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Inicio</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Productos</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Categorías</a>
            <a href="#" className="text-gray-700 hover:text-blue-600 font-medium transition-colors">Ofertas</a>
            
            <div className="flex items-center space-x-4">
              <button className="bg-white text-gray-800 border border-gray-300 hover:border-gray-400 font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-md text-sm">
                Ingresar
              </button>
              <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl text-sm">
                Registrarse
              </button>
            </div>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button 
              onClick={() => setIsOpen(!isOpen)}
              className="text-gray-700 hover:text-blue-600"
            >
              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                {isOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="md:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Inicio</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Productos</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Categorías</a>
              <a href="#" className="text-gray-700 hover:text-blue-600 font-medium">Ofertas</a>
              
              <div className="flex flex-col space-y-2 pt-4">
                <button className="bg-white text-gray-800 border border-gray-300 hover:border-gray-400 font-medium py-2 px-4 rounded-lg transition-all duration-300 hover:shadow-md w-full">
                  Ingresar
                </button>
                <button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold py-2 px-4 rounded-lg transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-xl w-full">
                  Registrarse
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  )
}
