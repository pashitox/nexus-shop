import express from 'express';
import cors from 'cors';
import { authRoutes } from './routes/auth.routes';
import { productsRoutes } from './routes/products.routes';
import { cartRoutes } from './routes/cart.routes';
import { ordersRoutes } from './routes/orders.routes';
import { addressesRoutes } from './routes/addresses.routes';
import { paymentsRoutes } from './routes/payments.routes';
import { debugEmailRoute } from './utils/email-debug';
import assistantRoutes from './routes/assistant.routes';

import { errorHandler, notFoundHandler } from './middleware/error.middleware';

const app = express();

// Middlewares
app.use(cors());
app.use((req, res, next) => {
  console.log("🌐 REQUEST:", req.method, req.url, new Date().toISOString());
  next();
});





// Webhook necesita raw body - debe estar antes de express.json()
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));

app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productsRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/addresses', addressesRoutes);
app.use('/api/payments', paymentsRoutes);
app.post('/api/debug-email', debugEmailRoute);
app.use('/api/ai', assistantRoutes);





// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'NexusShop Backend is running!' });
});

// Error handling
app.use(notFoundHandler);
app.use(errorHandler);

const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📊 Health check: http://localhost:${PORT}/api/health`);
});
