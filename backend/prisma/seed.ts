import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Starting seed...')

  // Limpiar base de datos existente
  await prisma.orderItem.deleteMany()
  await prisma.order.deleteMany()
  await prisma.cartItem.deleteMany()
  await prisma.cart.deleteMany()
  await prisma.address.deleteMany()
  await prisma.user.deleteMany()
  await prisma.product.deleteMany()

  console.log('🗑️ Database cleaned')

  // 1. CREAR USUARIOS
  const hashedPassword = await bcrypt.hash('password123', 12)

  const users = await prisma.user.createMany({
    data: [
      {
        email: 'cliente@nexusshop.com',
        name: 'Juan Pérez',
        password: hashedPassword,
        image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face',
        provider: 'credentials'
      },
      {
        email: 'admin@nexusshop.com',
        name: 'María García',
        password: hashedPassword,
        image: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face',
        provider: 'credentials'
      },
      {
        email: 'comprador@nexusshop.com',
        name: 'Carlos López',
        password: hashedPassword,
        image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        provider: 'credentials'
      }
    ]
  })

  console.log('👥 Users created')

  // Obtener IDs de usuarios
  const user1 = await prisma.user.findUnique({ where: { email: 'cliente@nexusshop.com' } })
  const user2 = await prisma.user.findUnique({ where: { email: 'admin@nexusshop.com' } })
  const user3 = await prisma.user.findUnique({ where: { email: 'comprador@nexusshop.com' } })

  // 2. CREAR DIRECCIONES
  await prisma.address.createMany({
    data: [
      {
        userId: user1!.id,
        fullName: 'Juan Pérez',
        street: 'Av. Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '12345',
        country: 'México',
        phone: '+52 55 1234 5678',
        isDefault: true
      },
      {
        userId: user2!.id,
        fullName: 'María García',
        street: 'Calle Secundaria 456',
        city: 'Guadalajara',
        state: 'Jalisco',
        postalCode: '44100',
        country: 'México',
        phone: '+52 33 9876 5432',
        isDefault: true
      }
    ]
  })

  console.log('🏠 Addresses created')

  // 3. CREAR PRODUCTOS (Electrónicos, Ropa, Hogar)
  await prisma.product.createMany({
    data: [
      // Electrónicos
      { name: 'iPhone 15 Pro', slug: 'iphone-15-pro', description: 'El último iPhone con chip A17 Pro y cámara de 48MP', price: 24999.00, image: 'https://images.unsplash.com/photo-1592750475338-74b7b21085ab?w=500&h=500&fit=crop', stock: 25, category: 'electronics' },
      { name: 'MacBook Air M2', slug: 'macbook-air-m2', description: 'Laptop ultradelgada con chip M2 y pantalla Retina', price: 32999.00, image: 'https://images.unsplash.com/photo-1541807084-5c52b6b3adef?w=500&h=500&fit=crop', stock: 15, category: 'electronics' },
      { name: 'Samsung Galaxy S24', slug: 'samsung-galaxy-s24', description: 'Smartphone Android con inteligencia artificial', price: 18999.00, image: 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&h=500&fit=crop', stock: 30, category: 'electronics' },
      { name: 'AirPods Pro', slug: 'airpods-pro', description: 'Audífonos inalámbricos con cancelación activa de ruido', price: 5999.00, image: 'https://images.unsplash.com/photo-1606220588913-b3aacb4d2f46?w=500&h=500&fit=crop', stock: 50, category: 'electronics' },

      // Ropa
      { name: 'Camisa Casual Azul', slug: 'camisa-casual-azul', description: 'Camisa de algodón 100% para uso casual', price: 899.00, image: 'https://images.unsplash.com/photo-1621072156002-e2fccdc0b176?w=500&h=500&fit=crop', stock: 100, category: 'clothing' },
      { name: 'Jeans Slim Fit', slug: 'jeans-slim-fit', description: 'Jeans ajustados de mezclilla premium', price: 1299.00, image: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=500&h=500&fit=crop', stock: 75, category: 'clothing' },
      { name: 'Sudadera con Capucha', slug: 'sudadera-con-capucha', description: 'Sudadera cómoda para clima frío', price: 799.00, image: 'https://images.unsplash.com/photo-1556821840-3a63f95609a7?w=500&h=500&fit=crop', stock: 60, category: 'clothing' },

      // Hogar
      { name: 'Juego de Sábanas Queen', slug: 'juego-sabanas-queen', description: 'Juego de sábanas de algodón egipcio 600 hilos', price: 1599.00, image: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=500&h=500&fit=crop', stock: 40, category: 'home' },
      { name: 'Lámpara de Mesa LED', slug: 'lampara-mesa-led', description: 'Lámpara moderna con luz regulable y USB', price: 699.00, image: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?w=500&h=500&fit=crop', stock: 35, category: 'home' },
      { name: 'Set de Utensilios de Cocina', slug: 'set-utensilios-cocina', description: '15 piezas de acero inoxidable', price: 2299.00, image: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=500&h=500&fit=crop', stock: 20, category: 'home' }
    ]
  })

  console.log('📦 Products created')

  // 4. CREAR CARRITOS DE COMPRA
  const productsList = await prisma.product.findMany()

  await prisma.cart.create({
    data: {
      userId: user1!.id,
      items: {
        create: [
          { productId: productsList[0].id, quantity: 1 }, // iPhone
          { productId: productsList[3].id, quantity: 2 }  // AirPods
        ]
      }
    }
  })

  await prisma.cart.create({
    data: {
      userId: user3!.id,
      items: {
        create: [
          { productId: productsList[1].id, quantity: 1 }, // MacBook
          { productId: productsList[5].id, quantity: 3 }  // Jeans
        ]
      }
    }
  })

  console.log('🛒 Shopping carts created')

  // 5. CREAR ÓRDENES DE EJEMPLO
  await prisma.order.create({
    data: {
      userId: user1!.id,
      status: 'DELIVERED',
      total: 30997.00, // iPhone + 2x AirPods
      shippingAddress: {
        fullName: 'Juan Pérez',
        street: 'Av. Principal 123',
        city: 'Ciudad de México',
        state: 'CDMX',
        postalCode: '12345',
        country: 'México'
      },
      items: {
        create: [
          { productId: productsList[0].id, quantity: 1, price: 24999.00 },
          { productId: productsList[3].id, quantity: 2, price: 5999.00 }
        ]
      }
    }
  })

  await prisma.order.create({
    data: {
      userId: user3!.id,
      status: 'PROCESSING',
      total: 18999.00, // Samsung Galaxy
      shippingAddress: {
        fullName: 'Carlos López',
        street: 'Calle Ejemplo 789',
        city: 'Monterrey',
        state: 'Nuevo León',
        postalCode: '64000',
        country: 'México'
      },
      items: {
        create: [
          { productId: productsList[2].id, quantity: 1, price: 18999.00 }
        ]
      }
    }
  })

  console.log('📋 Orders created')
  console.log('✅ Seed completed successfully!')
}

main()
  .catch((e) => {
    console.error('❌ Seed error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
