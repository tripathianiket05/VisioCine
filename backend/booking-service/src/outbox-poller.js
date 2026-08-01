import { PrismaClient } from '@prisma/client';
import amqplib from 'amqplib';

const prisma = new PrismaClient();
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

async function startPoller() {
  console.log('[Outbox Poller] Connecting to RabbitMQ...');
  let conn;
  try {
    conn = await amqplib.connect(RABBITMQ_URL);
  } catch (err) {
    console.error('[Outbox Poller] Failed to connect to RabbitMQ, retrying in 5s...', err.message);
    setTimeout(startPoller, 5000);
    return;
  }
  
  const channel = await conn.createChannel();
  await channel.assertQueue('orders_queue', { durable: true });
  console.log('[Outbox Poller] Connected and queue asserted.');

  // Poll every 5 seconds
  setInterval(async () => {
    try {
      // Find pending events
      const events = await prisma.outboxEvent.findMany({
        where: { status: 'PENDING' },
        take: 10
      });

      for (const event of events) {
        // Publish to RabbitMQ
        const message = JSON.stringify(event.payload);
        channel.sendToQueue('orders_queue', Buffer.from(message), { persistent: true });
        
        console.log(`[Outbox Poller] Published event ${event.id} to RabbitMQ.`);

        // Mark as PROCESSED
        await prisma.outboxEvent.update({
          where: { id: event.id },
          data: { status: 'PROCESSED' }
        });
      }
    } catch (err) {
      console.error('[Outbox Poller] Error polling/publishing:', err);
    }
  }, 5000);
}

startPoller();
