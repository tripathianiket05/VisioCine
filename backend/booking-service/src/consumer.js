import { PrismaClient } from '@prisma/client';
import amqplib from 'amqplib';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function startConsumer() {
  console.log('[Booking Consumer] Connecting to RabbitMQ...');
  let conn;
  try {
    conn = await amqplib.connect(RABBITMQ_URL);
  } catch (err) {
    console.error('[Booking Consumer] Failed to connect, retrying in 5s...', err.message);
    setTimeout(startConsumer, 5000);
    return;
  }
  
  const channel = await conn.createChannel();
  await channel.assertQueue('payments_queue', { durable: true });
  console.log('[Booking Consumer] Connected and waiting for PAYMENT_COMPLETED events.');

  channel.consume('payments_queue', async (msg) => {
    if (msg !== null) {
      try {
        const payload = JSON.parse(msg.content.toString());
        console.log(`[Booking Consumer] Received PAYMENT_COMPLETED for booking ${payload.bookingId}`);
        
        // Update booking status
        await prisma.booking.update({
          where: { id: payload.bookingId },
          data: { status: payload.status === 'SUCCESS' ? 'CONFIRMED' : 'FAILED' }
        });
        
        channel.ack(msg);
      } catch (err) {
        console.error('[Booking Consumer] Error processing message:', err);
        channel.nack(msg);
      }
    }
  });
}

startConsumer();
