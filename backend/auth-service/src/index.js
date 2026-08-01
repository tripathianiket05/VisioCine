import express from 'express';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import Redis from 'ioredis';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';
import { PrismaClient } from '@prisma/client';

const app = express();
const PORT = process.env.PORT || 3001;

const prisma = new PrismaClient();

app.use(express.json());
app.use(cookieParser());
// CORS handled by API Gateway

const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

const ACCESS_SECRET = process.env.ACCESS_SECRET || 'supersecret_access_key';
const ACCESS_TOKEN_EXPIRATION = '15m';
const REFRESH_TOKEN_TTL_SECONDS = 7 * 24 * 60 * 60; // 7 days

// REGISTER
app.post('/register', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    
    if (!name || !email || !password) {
      return res.status(400).json({ error: 'Name, email, and password are required' });
    }

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ error: 'Email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { name, email, password: hashedPassword },
    });

    return res.status(201).json({ message: 'User registered successfully', userId: user.id });
  } catch (error) {
    console.error('[Register Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGIN
app.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body;
    
    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const accessToken = jwt.sign({ userId: user.id }, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    const refreshToken = uuidv4();

    // Store refresh token in Redis mapped to userId
    await redis.set(`refresh_token:${refreshToken}`, user.id, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    // Set refresh token in HttpOnly cookie
    res.cookie('refreshToken', refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });

    return res.json({ accessToken });
  } catch (error) {
    console.error('[Login Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// GET CURRENT USER PROFILE
app.get('/me', async (req, res) => {
  try {
    // The API Gateway adds x-user-id header after verifying the JWT
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, name: true, email: true }
    });

    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }

    return res.json(user);
  } catch (error) {
    console.error('[Me Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// LOGOUT
app.post('/logout', async (req, res) => {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (refreshToken) {
      // Delete token from Redis session
      await redis.del(`refresh_token:${refreshToken}`);
    }
    
    // Clear cookie
    res.clearCookie('refreshToken');
    return res.json({ message: 'Logged out successfully' });
  } catch (error) {
    console.error('[Logout Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

// REFRESH TOKEN
app.post('/refresh', async (req, res) => {
  try {
    const oldRefreshToken = req.cookies?.refreshToken;
    
    if (!oldRefreshToken) {
      return res.status(401).json({ error: 'Refresh token missing' });
    }

    const userId = await redis.get(`refresh_token:${oldRefreshToken}`);
    
    if (!userId) {
      // Reuse Detection Kill-Switch logic
      res.clearCookie('refreshToken');
      return res.status(403).json({ error: 'Invalid or expired refresh token. Please login again.' });
    }

    // Delete the old token
    await redis.del(`refresh_token:${oldRefreshToken}`);

    // Generate new tokens
    const newAccessToken = jwt.sign({ userId }, ACCESS_SECRET, { expiresIn: ACCESS_TOKEN_EXPIRATION });
    const newRefreshToken = uuidv4();

    // Save new refresh token
    await redis.set(`refresh_token:${newRefreshToken}`, userId, 'EX', REFRESH_TOKEN_TTL_SECONDS);

    res.cookie('refreshToken', newRefreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: REFRESH_TOKEN_TTL_SECONDS * 1000,
    });

    return res.json({ accessToken: newAccessToken });
  } catch (error) {
    console.error('[Refresh Error]', error);
    return res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`[Auth Service] Running on port ${PORT}`);
});
