import express from 'express';
import { createProxyMiddleware } from 'http-proxy-middleware';
import jwt from 'jsonwebtoken';
import cors from 'cors';
import cookieParser from 'cookie-parser';

const app = express();
const PORT = process.env.PORT || 3000;
const ACCESS_SECRET = process.env.ACCESS_SECRET || 'supersecret_access_key';

app.use(cors({ 
  origin: ['http://localhost:5173', 'http://localhost:3000', 'https://visio-cine.vercel.app'], 
  credentials: true,
  allowedHeaders: ['Content-Type', 'Authorization', 'x-user-id']
}));
app.use(cookieParser());

// Global JWT Verification Middleware
const verifyToken = (req, res, next) => {
  // Allow unauthenticated routes
  const openRoutes = ['/api/auth/login', '/api/auth/register', '/api/auth/refresh', '/api/catalog', '/api/search'];
  const isOpenRoute = openRoutes.some(route => req.path.startsWith(route));

  if (isOpenRoute && !req.path.startsWith('/api/bookings')) {
    return next();
  }

  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: Missing or invalid token' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const decoded = jwt.verify(token, ACCESS_SECRET);
    // Append userId to headers for downstream services
    req.headers['x-user-id'] = decoded.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Unauthorized: Token expired or invalid' });
  }
};

app.use(verifyToken);

// Proxy Routes
app.use('/api/auth', createProxyMiddleware({ target: 'http://localhost:3001', changeOrigin: true }));
app.use('/api/catalog', createProxyMiddleware({ target: 'http://localhost:3002', changeOrigin: true }));
app.use('/api/search', createProxyMiddleware({ target: 'http://localhost:3003', changeOrigin: true }));
app.use('/api/bookings', createProxyMiddleware({ target: 'http://localhost:3004', changeOrigin: true }));
app.use('/api/payments', createProxyMiddleware({ target: 'http://localhost:3005', changeOrigin: true }));

app.listen(PORT, () => {
  console.log(`[API Gateway] Running on port ${PORT}`);
});
