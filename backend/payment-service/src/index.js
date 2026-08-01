import express from 'express';
import cors from 'cors';
import amqplib from 'amqplib';
import 'dotenv/config';

const app = express();
const PORT = process.env.PORT || 3005;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

// CORS is handled by API Gateway
app.use(express.json());

let channel;

async function connectRabbitMQ() {
  console.log('[Payment Service] Connecting to RabbitMQ...');
  try {
    const conn = await amqplib.connect(RABBITMQ_URL);
    channel = await conn.createChannel();
    await channel.assertQueue('payments_queue', { durable: true });
    console.log('[Payment Service] Connected to RabbitMQ');
  } catch (err) {
    console.error('[Payment Service] Failed to connect, retrying in 5s...', err.message);
    setTimeout(connectRabbitMQ, 5000);
  }
}

connectRabbitMQ();

// IMPORTANT: PCI COMPLIANCE DISCLAIMER
// This endpoint accepts raw credit card details (cardNumber, expiry, cvv).
// This is strictly for local development and mock environment purposes.
// In a real-world production system, passing raw credit card details to your own API
// is a major PCI-DSS violation. These fields should be tokenized on the client-side
// using a secure Payment Provider (e.g., Stripe Elements, Braintree) and only the
// token should be sent to the backend.
app.post('/process', async (req, res) => {
  const { bookingId, cardNumber, expiry, cvv, upiId, method } = req.body;

  if (!bookingId) {
    return res.status(400).json({ error: 'Missing bookingId' });
  }

  // We are skipping strict validation for all fields to allow testing UPI, Wallets, etc.
  // In a real app, you'd switch on payment method and validate accordingly.

  console.log(`[Payment Service] Processing manual payment for booking ${bookingId}...`);

  // Simulate payment processing (2 second delay)
  await new Promise(resolve => setTimeout(resolve, 2000));

  // Very basic mock validation
  // E.g., if card ends in '0000' or upi is 'fail@upi', simulate a failure
  const isSuccess = !(cardNumber && cardNumber.endsWith('0000')) && upiId !== 'fail@upi';

  const paymentEvent = {
    bookingId,
    status: isSuccess ? 'SUCCESS' : 'FAILED',
    transactionId: isSuccess ? `txn-${Date.now()}` : null
  };

  if (channel) {
    channel.sendToQueue('payments_queue', Buffer.from(JSON.stringify(paymentEvent)), { persistent: true });
    console.log(`[Payment Service] Payment ${paymentEvent.status} for booking ${bookingId}. Event published.`);
  } else {
    console.error('[Payment Service] RabbitMQ channel not available.');
    return res.status(500).json({ error: 'Payment queue unavailable' });
  }

  res.json({ message: 'Payment processed successfully', result: paymentEvent.status });
});

app.listen(PORT, () => {
  console.log(`[Payment Service] Running on port ${PORT}`);
});
