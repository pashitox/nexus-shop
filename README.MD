# 🚀 NexusShop - Modern E-commerce Platform with AI Integration

## ✨ Features

### 🛍️ E-commerce Core
- **📦 Product Catalog** with advanced filtering and search
- **🛒 Smart Cart System** for both guests and registered users
- **💳 Stripe Integration** for secure payment processing
- **🔐 Multi-auth System** (Email/Password + Google OAuth)
- **📱 Responsive Design** with modern UI/UX

### 🤖 AI-Powered Shopping Assistant
- **💬 Real-time Chat** with virtual shopping assistant
- **🎯 Personalized Recommendations** based on preferences
- **🔍 Intelligent Search** with natural language processing
- **🛍️ AI-Driven Product Discovery**

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
🌐 Client Layer (Frontend + AI Chat Widget)
    ↓
🤖 AI Assistant Layer (Chat + Recommendations)
    ↓
🛡️ API Gateway (Backend API)
    ↓
🔧 Business Logic (Controllers + AI Service)
    ↓
🗄️ Data Layer (PostgreSQL + Prisma)
    ↓
🧠 External AI (OpenAI GPT)
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
| 🤖 **AI Assistant** | http://localhost:5001/api/ai | 5001 | ✅ Operational | AI Chat & Recommendations |
| 🗄️ **PostgreSQL** | localhost:5433 | 5433 | ✅ Operational | Primary Database |
| 🐘 **PgAdmin** | http://localhost:5050 | 5050 | ✅ Operational | Database Management |
| 📧 **Resend** | External | - | ✅ Operational | Email Service |
| 💳 **Stripe** | External | - | ✅ Operational | Payment Processing |
| 🔐 **Google OAuth** | External | - | ✅ Operational | Social Authentication |

![Docker](https://img.shields.io/badge/DOCKER-RUNNING-blue?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-OPERATIONAL-green?style=for-the-badge&logo=postgresql)
![AI](https://img.shields.io/badge/AI%20ASSISTANT-ACTIVE-orange?style=for-the-badge&logo=openai)
![Stripe](https://img.shields.io/badge/STRIPE-INTEGRATED-blueviolet?style=for-the-badge&logo=stripe)
![Security](https://img.shields.io/badge/SECURITY-AUDITED-yellow?style=for-the-badge&logo=security)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-FULL-blue?style=for-the-badge&logo=typescript)

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose
- Node.js 18+ (for development)
- Stripe Account
- Google Cloud Project
- OpenAI API Key

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
# Database
DATABASE_URL="postgresql://user:password@db:5432/nexusshop"
JWT_SECRET="your-super-secure-jwt-secret"

# Payments
STRIPE_SECRET_KEY="sk_test_..."
STRIPE_WEBHOOK_SECRET="whsec_..."

# Authentication
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"

# Email
RESEND_API_KEY="re_..."

# AI Assistant
OPENAI_API_KEY="sk-your-openai-api-key"
AI_MODEL="gpt-3.5-turbo"
AI_MAX_TOKENS=1000
AI_TEMPERATURE=0.7

# Frontend
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
echo "🎉 NexusShop with AI Assistant is running!"
echo "Frontend: http://localhost:3000"
echo "Backend API: http://localhost:5001/api"
echo "AI Health: http://localhost:5001/api/ai/health"
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
│   │   ├── checkout/          # Checkout Components
│   │   └── ai-assistant/      # 🤖 AI Assistant Components
│   ├── src/lib/               # Utilities & Config
│   └── src/types/             # TypeScript Definitions
│
├── 🔧 backend/                 # Express.js API
│   ├── src/
│   │   ├── controllers/       # Business Logic
│   │   ├── routes/            # API Routes
│   │   ├── middleware/        # Custom Middleware
│   │   ├── services/          # 🤖 AI Services
│   │   ├── utils/             # Utilities
│   │   └── types/             # Type Definitions
│   ├── prisma/                # Database Schema
│   └── docker-compose.yml     # Backend Services
│
├── 📊 scripts/                # Utility Scripts
│   ├── security-audit.sh      # Security Testing
│   ├── system-test.sh         # System Validation
│   ├── test-ai-assistant.sh   # 🤖 AI Testing
│   └── deployment/            # Deployment Scripts
│
├── 🐳 docker-compose.yml      # Main Docker Compose
└── 📚 README.md              # Project Documentation
```

---

## 🤖 AI Assistant Features

### 🧠 Core Capabilities
- **Natural Language Product Search** - "Find elegant smartphones under $1000"
- **Personalized Recommendations** - Based on user preferences and context
- **Conversational Commerce** - Chat-based shopping experience
- **Multi-language Support** - Spanish/English conversations
- **Session Memory** - Maintains conversation context

### 💬 Example Interactions
```
User: "I need casual clothing for summer"
AI: "Perfect! I recommend:
     - Blue Casual Shirt ($899)
     - Slim Fit Jeans ($1299)
     - Summer Hoodie ($799)
     
     Which style are you interested in?"

User: "Just show me shirts under $1000"
AI: "Great choice! Here are affordable shirts..."
```

### 🔧 Technical Implementation
```typescript
// AI Service Integration
interface AIService {
  chat(message: string, sessionId: string): Promise<AIResponse>;
  recommendProducts(context: ProductContext): Promise<Product[]>;
  analyzeUserIntent(message: string): UserIntent;
}

// AI Response Structure
interface AIResponse {
  success: boolean;
  message: string;
  recommendedProducts: Product[];
  context: any;
  nextQuestions: string[];
}
```

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

### 🤖 AI Assistant
```http
POST /api/ai/chat           # 🤖 Chat with AI assistant
GET  /api/ai/health         # 🤖 AI service health check
POST /api/ai/recommend      # 🤖 Product recommendations
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

---

## 🛡️ Security Features

### 🔒 Implemented Security
- **JWT Token Validation** with expiration
- **Password Hashing** using bcrypt
- **SQL Injection Protection** with Prisma
- **XSS Prevention** with input sanitization
- **CSRF Protection** for state-changing operations
- **CORS Configuration** with allowed origins
- **Rate Limiting** on authentication and AI endpoints
- **Security Headers** (Helmet.js)

### 🤖 AI Security
- **Authentication Required** for AI chat access
- **Input Validation** and sanitization for AI messages
- **Rate Limiting** on AI endpoints (10 requests/minute)
- **Content Moderation** for AI responses
- **Usage Logging** for audit purposes

### 🧪 Security Testing
```bash
# Run security audit
chmod +x scripts/security-audit.sh
./scripts/security-audit.sh

# Run AI-specific security tests
chmod +x scripts/test-ai-security.sh
./scripts/test-ai-security.sh

# Run system tests
chmod +x scripts/system-test.sh
./scripts/system-test.sh
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

# Run AI assistant tests
./scripts/test-ai-assistant.sh

# Run system integration tests
./scripts/system-test.sh

# Check TypeScript types
docker compose exec backend npx tsc --noEmit

# Run linter
docker compose exec backend npm run lint
```

### Test Coverage
- **✅ Authentication Flow** (Register → Login → Profile)
- **✅ AI Assistant** (Chat → Recommendations → Products)
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

### AI-Specific Commands
```bash
# Test AI service
docker compose exec backend curl http://localhost:5001/api/ai/health

# View AI logs
docker compose logs backend | grep -i "ai\|chat"

# Clear AI sessions
docker compose exec backend npm run ai:clear-sessions
```

---

## 🚨 Troubleshooting

### Common Issues & Solutions

| Issue | Symptoms | Solution |
|-------|----------|----------|
| **AI Chat not visible** | Chat button missing | Verify user authentication |
| **AI responses timeout** | No response from assistant | Check OPENAI_API_KEY configuration |
| **Products not showing** | Empty recommendations | Verify product data structure |
| **Authentication errors** | 401 errors in chat | Check authChange events |
| **Backend won't start** | Connection refused on port 5001 | Check database connection and environment variables |
| **Database connection failed** | Prisma migration errors | Verify DATABASE_URL in backend/.env |

### Diagnostic Commands
```bash
# Check AI service health
curl http://localhost:5001/api/ai/health

# Verify AI environment variables
docker compose exec backend printenv | grep AI
docker compose exec backend printenv | grep OPENAI

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

# AI Health
curl http://localhost:5001/api/ai/health

# Database Health
docker compose exec postgres pg_isready

# Service Status
docker compose ps
```

### AI Performance Metrics
- **Response Time Tracking** for AI endpoints
- **Token Usage Monitoring** for cost optimization
- **User Engagement Metrics** with AI assistant
- **Recommendation Effectiveness** tracking
- **Error Rate Monitoring** for AI services

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
- **AI feature testing** required for AI-related changes

---

## 📞 Support

### Getting Help
1. **Check the troubleshooting section** above
2. **Review service logs** with `docker compose logs`
3. **Run diagnostic scripts** in the scripts/ directory
4. **Test AI functionality** with provided test scripts
5. **Open an issue** with:
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

![Docker](https://img.shields.io/badge/DOCKER-RUNNING-blue?style=for-the-badge&logo=docker)
![PostgreSQL](https://img.shields.io/badge/POSTGRESQL-OPERATIONAL-green?style=for-the-badge&logo=postgresql)
![AI Assistant](https://img.shields.io/badge/AI%20ASSISTANT-ACTIVE-orange?style=for-the-badge&logo=openai)
![Stripe](https://img.shields.io/badge/STRIPE-INTEGRATED-blueviolet?style=for-the-badge&logo=stripe)
![Security](https://img.shields.io/badge/SECURITY-AUDITED-yellow?style=for-the-badge&logo=security)
![TypeScript](https://img.shields.io/badge/TYPESCRIPT-FULL-blue?style=for-the-badge&logo=typescript)

---

**⭐ If you find NexusShop useful, please give it a star on GitHub!**

---
*Built with ❤️ using Next.js, Express, PostgreSQL, OpenAI, and modern web technologies.*