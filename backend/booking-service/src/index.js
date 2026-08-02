import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import Redis from 'ioredis';

const prisma = new PrismaClient();
const redis = process.env.REDIS_URL 
  ? new Redis(process.env.REDIS_URL) 
  : new Redis({
      host: process.env.REDIS_HOST || '127.0.0.1',
      port: parseInt(process.env.REDIS_PORT || '6379'),
    });

const app = express();
const PORT = 3004;

// Scheduled cleanup for stale PENDING bookings (runs every 1 minute)
setInterval(async () => {
  try {
    const tenMinutesAgo = new Date(Date.now() - 10 * 60 * 1000);
    const staleBookings = await prisma.booking.updateMany({
      where: {
        status: 'PENDING',
        createdAt: { lt: tenMinutesAgo }
      },
      data: { status: 'FAILED' }
    });
    if (staleBookings.count > 0) {
      console.log(`[Booking Service] Cleaned up ${staleBookings.count} stale PENDING bookings.`);
    }
  } catch (err) {
    console.error('[Booking Service] Error cleaning up stale bookings:', err.message);
  }
}, 60 * 1000);

// CORS handled by API Gateway
app.use(express.json());

// Require userId header from API Gateway
app.use((req, res, next) => {
  const userId = req.headers['x-user-id'];
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized: No user ID in context' });
  }
  req.userId = userId;
  next();
});

app.post('/lock-seats', async (req, res) => {
  const { showtimeId, seatIds, totalAmount } = req.body;
  const userId = req.userId;

  if (!showtimeId || !seatIds || !Array.isArray(seatIds) || seatIds.length === 0) {
    return res.status(400).json({ error: 'Invalid payload' });
  }

  const lockedSeats = [];

  try {
    // 1. Attempt to acquire locks for all requested seats using Redis SETNX
    for (const seatId of seatIds) {
      const lockKey = `seat_lock:${showtimeId}:${seatId}`;
      const locked = await redis.set(lockKey, userId, 'EX', 300, 'NX'); // Lock for 5 mins
      
      if (locked === 'OK') {
        lockedSeats.push(lockKey);
      } else {
        // Seat is already locked
        throw new Error(`Seat ${seatId} is no longer available.`);
      }
    }

    // 2. All locks acquired successfully, proceed with MySQL Transaction
    const result = await prisma.$transaction(async (tx) => {
      // Insert Booking
      const booking = await tx.booking.create({
        data: {
          userId,
          showtimeId,
          seatIds: seatIds,
          status: 'PENDING',
          totalAmount: totalAmount || 0
        }
      });

      // Insert Outbox Event
      const outboxEvent = await tx.outboxEvent.create({
        data: {
          eventType: 'ORDER_CREATED',
          payload: { bookingId: booking.id, userId, showtimeId, seatIds }
        }
      });

      return booking;
    });

    res.json({ message: 'Seats locked successfully, order created.', booking: result });
  } catch (error) {
    // Rollback Redis locks if anything failed
    if (lockedSeats.length > 0) {
      await redis.del(...lockedSeats);
    }
    console.error('[Booking Service] Lock error:', error.message);
    res.status(409).json({ error: error.message });
  }
});

app.get('/', async (req, res) => {
  try {
    const bookings = await prisma.booking.findMany({
      where: { userId: req.userId },
      orderBy: { createdAt: 'desc' }
    });
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.get('/status/:id', async (req, res) => {
  try {
    const booking = await prisma.booking.findUnique({
      where: { id: req.params.id }
    });
    if (!booking) {
      return res.status(404).json({ error: 'Booking not found' });
    }
    // Also attach mock seats for frontend display
    res.json({
      ...booking,
      id: booking.id,
      status: booking.status,
      seats: JSON.stringify(booking.seatIds), // Mock format expected by frontend
      totalAmount: booking.totalAmount.toFixed(2)
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.listen(PORT, () => {
  console.log(`[Booking Service] Running on port ${PORT}`);
});
