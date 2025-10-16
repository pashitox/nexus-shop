# 🚀 NexusShop - Modern E-commerce Platform

## 📋 Table of Contents
- [✨ Features](#-features)
- [🏗️ System Architecture](#️-system-architecture)
- [🌐 Services and Ports](#-services-and-ports)
- [🚀 Quick Start](#-quick-start)
- [📁 Project Structure](#-project-structure)
- [🛍️ Core Features](#️-core-features)
- [🔧 API Endpoints](#-api-endpoints)
- [🛡️ Security Features](#️-security-features)
- [💳 Payment Integration](#-payment-integration)
- [🧪 Testing & Quality](#-testing--quality)
- [🐳 Docker Commands](#-docker-commands)
- [🚨 Troubleshooting](#-troubleshooting)
- [📈 Monitoring](#-monitoring)
- [🤝 Contribution](#-contribution)

---

## ✨ Features

### 🛍️ E-commerce Core
- **📦 Product Catalog** with advanced filtering and search
- **🛒 Smart Cart System** for both guests and registered users
- **💳 Stripe Integration** for secure payment processing
- **🔐 Multi-auth System** (Email/Password + Google OAuth)
- **📱 Responsive Design** with modern UI/UX

### 🔧 Technical Excellence
- **⚡ Real-time Inventory Management**
- **📊 Order Tracking & History**
- **🏠 Address Management** with geolocation
- **🔔 Email Notifications** with Resend
- **📈 Analytics Ready** for business insights

### 🛡️ Enterprise Security
- **🔒 JWT Authentication** with secure token management
- **🛡️ OWASP Compliance** with security headers
- **📝 Input Validation** with Zod schemas
- **⚡ Rate Limiting** and DDoS protection
- **🔍 Security Auditing** with automated scripts

---

## 🏗️ System Architecture

```
🌐 Client Layer (Frontend)
    ↓
🛡️ API Gateway (Backend API)
    ↓
🔧 Business Logic (Controllers)
    ↓
🗄️ Data Layer (PostgreSQL + Prisma)
    ↓
💾 Storage (Images + Assets)
    ↓
🔗 External Services (Stripe, Google OAuth, Resend)
```

---

## 🌐 Services and Ports

| Service | URL | Port | Status | Purpose |
|---------|-----|------|---------|----------|
| 🎨 **Frontend** | http://localhost:3000 | 3000 | ✅ Operational | Next.js E-commerce UI |
| 🔧 **Backend API** | http://localhost:5001/api | 5001 | ✅ Operational | Express.js REST API |
| 🗄️ **PostgreSQL** | localhost:5433 | 5433 | ✅ Operational | Primary Database |
| 🐘 **PgAdmin** | http://localhost:5050 | 5050 | ✅ Operational | Database Management |
| 📧 **Resend** | External | - | ✅ Operational | Email Service |
| 💳 **Stripe** | External | - | ✅ Operational | Payment Processing |
| 🔐 **Google OAuth** | External | - | ✅ Operational | Social Authentication |

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Stripe Account
- Google Cloud Project

### 1. Clone & Setup
```bash
# Clone the repository
git clone <repository-url>
cd nexus-shop

# Copy environment files
cp backend/.env.example backend/.env
cp frontend/.env.example frontend/.env
```

### 2. Configure Environment
**Backend (.env):**
```env
DATABASE_URL="postgresql://user:password@db:5432/nexusshop"
JWT_SECRET="your-super-secure-jwt-secret"
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
RESEND_API_KEY="re_..."
FRONTEND_URL="http://localhost:3000"
```

**Frontend (.env):**
```env
NEXT_PUBLIC_API_URL="http://localhost:5001/api"
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY="pk_test_..."
NEXT_PUBLIC_GOOGLE_CLIENT_ID="your-google-client-id"
```

### 3. Start Services
```bash
# Start all services
docker compose up -d

# Run database migrations
docker compose exec backend npx prisma migrate dev

# Seed initial data
docker compose exec backend npx prisma db seed

# Check service status
docker compose ps
```

### 4. Access Applications
```bash
echo "🎉 NexusShop is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001/api"
echo "PgAdmin: http://localhost:5050"
```

---

## 📁 Project Structure

```
nexus-shop/
├── 🎨 frontend/                 # Next.js 15 Application
│   ├── src/app/                # App Router Pages
│   │   ├── (auth)/            # Authentication Routes
│   │   ├── (shop)/            # Shopping Routes
│   │   ├── account/           # User Dashboard
│   │   └── api/               # API Routes
│   ├── src/components/        # React Components
│   │   ├── ui/                # Base UI Components
│   │   ├── auth/              # Auth Components
│   │   ├── products/          # Product Components
│   │   ├── cart/              # Cart Components
│   │   └── checkout/          # Checkout Components
│   ├── src/lib/               # Utilities & Config
│   └── src/types/             # TypeScript Definitions
│
├── 🔧 backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/       # Business Logic
│   │   ├── routes/            # API Routes
│   │   ├── middleware/        # Custom Middleware
│   │   ├── utils/             # Utilities
│   │   └── types/             # Type Definitions
│   ├── prisma/                # Database Schema
│   └── docker-compose.yml     # Backend Services
│
├── 📊 scripts/                # Utility Scripts
│   ├── security-audit.sh      # Security Testing
│   ├── system-test.sh         # System Validation
│   └── deployment/            # Deployment Scripts
│
├── 🐳 docker-compose.yml      # Main Docker Compose
└── 📚 README.md              # Project Documentation
```

---

## 🛍️ Core Features

### 🔐 Authentication System
- **Email/Password Registration** with validation
- **Google OAuth 2.0 Integration** for social login
- **JWT Token Management** with secure storage
- **Session Management** for both users and guests
- **Password Recovery** with email verification

### 🛒 Shopping Experience
- **Product Catalog** with search and filters
- **Product Details** with images and descriptions
- **Shopping Cart** with persistent storage
- **Guest Checkout** without registration
- **Wishlist Functionality** (planned)

### 💳 Checkout & Payments
- **Multi-step Checkout Process**
- **Address Management** with validation
- **Stripe Payment Integration**
- **Order Confirmation** with email receipts
- **Order History & Tracking**

### 👤 User Management
- **Profile Management** with editable information
- **Address Book** with multiple shipping addresses
- **Order History** with detailed tracking
- **Account Settings** and preferences

---

## 🔧 API Endpoints

### 🔐 Authentication
```http
POST /api/auth/register     # User registration
POST /api/auth/login        # User login
POST /api/auth/google       # Google OAuth
GET  /api/auth/profile      # User profile
POST /api/auth/logout       # Logout
POST /api/auth/refresh      # Token refresh
```

### 📦 Products
```http
GET    /api/products        # List products (with filters)
GET    /api/products/:id    # Product details
POST   /api/products        # Create product (admin)
PUT    /api/products/:id    # Update product (admin)
DELETE /api/products/:id    # Delete product (admin)
```

### 🛒 Cart
```http
GET    /api/cart            # Get user cart
POST   /api/cart/add        # Add item to cart
PUT    /api/cart/:itemId    # Update cart item
DELETE /api/cart/:itemId    # Remove cart item
POST   /api/cart/merge      # Merge guest cart
```

### 💳 Orders & Payments
```http
POST   /api/orders          # Create order (checkout)
GET    /api/orders          # User order history
GET    /api/orders/:id      # Order details
POST   /api/payments/intent # Create payment intent
POST   /api/payments/webhook # Stripe webhook
```

### 🏠 Addresses
```http
GET    /api/addresses       # User addresses
POST   /api/addresses       # Create address
PUT    /api/addresses/:id   # Update address
DELETE /api/addresses/:id   # Delete address
PUT    /api/addresses/:id/default # Set default address
```

---

## 🛡️ Security Features

### 🔒 Implemented Security
- **JWT Token Validation** with expiration
- **Password Hashing** using bcrypt
- **SQL Injection Protection** with Prisma
- **XSS Prevention** with input sanitization
- **CSRF Protection** for state-changing operations
- **CORS Configuration** with allowed origins
- **Rate Limiting** on authentication endpoints
- **Security Headers** (Helmet.js)

### 🧪 Security Testing
```bash
# Run security audit
chmod +x scripts/security-audit.sh
./scripts/security-audit.sh

# Run system tests
chmod +x scripts/system-test.sh
./scripts/system-test.sh
```

### 📊 Security Headers
```typescript
// Security middleware configuration
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
  crossOriginEmbedderPolicy: false
}));
```

---

## 💳 Payment Integration

### Stripe Configuration
```typescript
// Payment service configuration
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2023-10-16',
});

// Create payment intent
const paymentIntent = await stripe.paymentIntents.create({
  amount: Math.round(total * 100), // Convert to cents
  currency: 'usd',
  metadata: { orderId: order.id }
});
```

### Test Cards
| Card Number | Behavior | Use Case |
|-------------|----------|----------|
| `4242 4242 4242 4242` | ✅ Successful Payment | Normal checkout |
| `4000 0025 0000 3155` | 🔐 Requires Authentication | 3D Secure testing |
| `4000 0000 0000 9995` | ❌ Payment Declined | Error handling |

---

## 🧪 Testing & Quality

### Automated Testing
```bash
# Run security audit
./scripts/security-audit.sh

# Run system integration tests
./scripts/system-test.sh

# Check TypeScript types
docker compose exec backend npx tsc --noEmit

# Run linter
docker compose exec backend npm run lint
```

### Test Coverage
- **✅ Authentication Flow** (Register → Login → Profile)
- **✅ Product Management** (List → Details → Cart)
- **✅ Cart Operations** (Add → Update → Remove)
- **✅ Checkout Process** (Cart → Address → Payment)
- **✅ Order Management** (Create → History → Details)
- **✅ Security Validation** (Headers → Injection → Rate Limiting)

---

## 🐳 Docker Commands

### Service Management
```bash
# Start all services
docker compose up -d

# Stop services
docker compose down

# View logs
docker compose logs -f
docker compose logs backend --tail=50

# Restart specific service
docker compose restart backend

# Check service status
docker compose ps
```

### Database Operations
```bash
# Run migrations
docker compose exec backend npx prisma migrate dev

# Seed database
docker compose exec backend npx prisma db seed

# Open database shell
docker compose exec postgres psql -U postgres -d nexusshop

# Reset database
docker compose exec backend npx prisma migrate reset
```

### Development Commands
```bash
# Install dependencies
docker compose exec backend npm install
docker compose exec frontend npm install

# Run in development mode
docker compose exec backend npm run dev
docker compose exec frontend npm run dev

# Build for production
docker compose exec backend npm run build
docker compose exec frontend npm run build
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **Backend won't start** | Connection refused on port 5001 | Check database connection and environment variables |
| **Database connection failed** | Prisma migration errors | Verify DATABASE_URL in backend/.env |
| **Stripe payments failing** | Payment intent creation errors | Check STRIPE_SECRET_KEY and webhook configuration |
| **Google OAuth not working** | Redirect URI mismatch | Update Google Cloud Console redirect URIs |
| **Frontend build errors** | TypeScript compilation fails | Run `npx tsc --noEmit` to identify issues |

### Diagnostic Commands
```bash
# Check service health
curl http://localhost:5001/api/health

# Verify environment variables
docker compose exec backend printenv | grep STRIPE
docker compose exec backend printenv | grep GOOGLE

# Check database connection
docker compose exec backend npx prisma db status

# View application logs
docker compose logs backend --tail=100
docker compose logs frontend --tail=100
```

### Complete Reset
```bash
# Stop and remove everything
docker compose down -v

# Rebuild from scratch
docker compose build --no-cache
docker compose up -d

# Reinitialize database
docker compose exec backend npx prisma migrate dev
docker compose exec backend npx prisma db seed
```

---

## 📈 Monitoring

### Health Checks
```bash
# API Health
curl http://localhost:5001/api/health

# Database Health
docker compose exec postgres pg_isready

# Service Status
docker compose ps
```

### Performance Monitoring
- **Response Time Tracking** for critical endpoints
- **Database Query Performance** with Prisma logging
- **Memory Usage Monitoring** in production
- **Error Rate Tracking** with structured logging

---

## 🤝 Contribution

### Development Workflow
1. **Fork the repository**
2. **Create a feature branch**
   ```bash
   git checkout -b feature/amazing-feature
   ```
3. **Commit your changes**
   ```bash
   git commit -m 'Add amazing feature'
   ```
4. **Push to the branch**
   ```bash
   git push origin feature/amazing-feature
   ```
5. **Open a Pull Request**

### Code Standards
- **TypeScript** for type safety
- **ESLint & Prettier** for code formatting
- **Conventional commits** for commit messages
- **PR templates** for pull requests
- **Code review** required for all changes

---

## 📞 Support

### Getting Help
1. **Check the troubleshooting section** above
2. **Review service logs** with `docker compose logs`
3. **Run diagnostic scripts** in the scripts/ directory
4. **Open an issue** with:
   - Detailed description of the problem
   - Steps to reproduce
   - Relevant logs and error messages
   - Environment information

### Community
- **GitHub Issues**: Bug reports and feature requests
- **Discussions**: Questions and community support
- **Documentation**: Comprehensive guides and tutorials

---

## 🎯 Status Badges

![Docker](https://img.shields.io/badge/Docker-Running-blue?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-Operational-green?style=for-the-badge&logo=postgresql)
![Stripe](https://img.shields.io/badge/Stripe-Integrated-blueviolet?style=for-the-badge&logo=stripe)
![Security](https://img.shields.io/badge/Security-Audited-yellow?style=for-the-badge&logo=security)
![TypeScript](https://img.shields.io/badge/TypeScript-Full%20Coverage-blue?style=for-the-badge&logo=typescript)

---

**⭐ If you find NexusShop useful, please give it a star on GitHub!**

---
*Built with ❤️ using Next.js, Express, PostgreSQL, and modern web technologies.*