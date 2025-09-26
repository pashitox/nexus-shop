'use client'

import { useEffect, useState } from 'react'

export default function Home() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Simular carga de productos
    setTimeout(() => {
      setProducts([
        { id: 1, name: 'Laptop Gaming Pro', price: 999.99, image: '💻' },
        { id: 2, name: 'Smartphone Elite', price: 699.99, image: '📱' },
        { id: 3, name: 'Auriculares Premium', price: 199.99, image: '🎧' },
        { id: 4, name: 'Smart Watch', price: 299.99, image: '⌚' }
      ])
      setLoading(false)
    }, 1000)
  }, [])

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-blue-900 via-purple-900 to-blue-800 text-white py-20">
        <div className="absolute inset-0 bg-black/20"></div>
        <div className="relative max-w-7xl mx-auto px-4 text-center">
          <h1 className="text-5xl md:text-7xl font-bold mb-6 animate-fade-in">
            <span className="gradient-text">Nexus</span>Shop
          </h1>
          <p className="text-xl md:text-2xl mb-8 text-blue-100 max-w-3xl mx-auto">
            Descubre la próxima generación de comercio electrónico. 
            Experiencia premium, calidad excepcional.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="btn-primary text-lg">
              🛍️ Comprar Ahora
            </button>
            <button className="btn-secondary text-lg text-white border-white hover:bg-white/10">
              🔍 Explorar Productos
            </button>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">¿Por Qué NexusShop?</h2>
            <p className="text-gray-600 text-lg">La excelencia redefine tu experiencia de compra</p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            {[
              { icon: '🚀', title: 'Envío Express', desc: 'Entrega en 24h' },
              { icon: '🛡️', title: 'Garantía Premium', desc: '2 años de cobertura' },
              { icon: '⭐', title: 'Calidad Certificada', desc: 'Productos verificados' }
            ].map((feature, index) => (
              <div key={index} className="text-center p-6 card-hover bg-gray-50 rounded-xl">
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Products Preview */}
      <section className="py-16 bg-gradient-to-br from-slate-50 to-blue-50">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold gradient-text mb-4">Productos Destacados</h2>
            <p className="text-gray-600 text-lg">Lo más vendido esta semana</p>
          </div>

          {loading ? (
            <div className="flex justify-center items-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            </div>
          ) : (
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
              {products.map((product) => (
                <div key={product.id} className="bg-white rounded-2xl shadow-lg card-hover p-6">
                  <div className="text-5xl text-center mb-4">{product.image}</div>
                  <h3 className="font-semibold text-lg mb-2">{product.name}</h3>
                  <p className="text-2xl font-bold text-blue-600 mb-4">${product.price}</p>
                  <button className="btn-primary w-full text-sm py-2">
                    Añadir al Carrito
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-gradient-to-r from-green-600 to-emerald-600 text-white">
        <div className="max-w-4xl mx-auto text-center px-4">
          <h2 className="text-4xl font-bold mb-4">¿Listo para la Experiencia Premium?</h2>
          <p className="text-xl mb-8 text-green-100">
            Únete a miles de clientes satisfechos. Calidad garantizada.
          </p>
          <div className="flex gap-4 justify-center flex-wrap">
            <button className="bg-white text-green-600 font-semibold py-3 px-8 rounded-lg hover:bg-gray-100 transition-colors">
              Crear Cuenta Gratis
            </button>
            <button className="border-2 border-white text-white font-semibold py-3 px-8 rounded-lg hover:bg-white/10 transition-colors">
              Ver Catálogo
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="max-w-7xl mx-auto px-4 text-center">
          <h3 className="text-2xl font-bold gradient-text mb-4">NexusShop</h3>
          <p className="text-gray-400 mb-6">© 2024 Todos los derechos reservados. E-commerce de próxima generación.</p>
          <div className="flex justify-center gap-6 text-gray-400">
            <span>Términos</span>
            <span>Privacidad</span>
            <span>Soporte</span>
          </div>
        </div>
      </footer>
    </div>
  )
}
