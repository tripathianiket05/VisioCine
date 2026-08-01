# Cineplex Distributed Backend Architecture

This backend implements a microservices architecture for a highly scalable Movie Ticket Booking system using Node.js, Express, JavaScript, MySQL (Prisma), Redis, Elasticsearch, and RabbitMQ.

## Services

1. **API Gateway (Port 3000):** Routes traffic, validates JWT access tokens.
2. **Auth Service (Port 3001):** Handles login and JWT token generation (Access Token + Refresh Token with rotation/reuse-detection).
3. **Catalog Service (Port 3002):** Manages Movies, Theatres, and Showtimes using MySQL.
4. **Search Service (Port 3003):** Provides fast geo-spatial search for theatres using Elasticsearch.
5. **Booking Service (Port 3004):** Handles concurrency using Redis SETNX to lock seats, commits to MySQL using Transactions, and employs the Transactional Outbox pattern to emit an `ORDER_CREATED` event to RabbitMQ. Listens for `PAYMENT_COMPLETED` events to update booking status.
6. **Payment Service (Internal):** Listens to `ORDER_CREATED` events from RabbitMQ, simulates payment processing (2s delay, 90% success rate), and emits a `PAYMENT_COMPLETED` event.

## Running the Architecture

### 1. Start Infrastructure
Run the following from `backend/infra`:
```bash
docker-compose up -d
```
This starts MySQL (3306), Redis (6379), Elasticsearch (9200), and RabbitMQ (5672).

### 2. Initialize Databases and Search Index
Open separate terminal tabs:

**Catalog Service:**
```bash
cd backend/catalog-service
npx prisma db push
npm run sync
```

**Booking Service:**
```bash
cd backend/booking-service
npx prisma db push
```

**Search Service:**
```bash
cd backend/search-service
npm run init
```

### 3. Start Services
In separate terminal tabs, start each service:
```bash
cd backend/api-gateway && npm run dev
cd backend/auth-service && npm run dev
cd backend/catalog-service && npm run dev
cd backend/search-service && npm run dev
cd backend/booking-service && npm run dev
cd backend/booking-service && npm run poller
cd backend/booking-service && npm run consumer
cd backend/payment-service && npm run dev
```

## Architecture Flow (Booking a ticket)
1. User authenticates via API Gateway to `POST /api/auth/login`. Gateway returns JWT.
2. User requests available theatres/movies from `GET /api/search/theatres` and `GET /api/catalog/movies`.
3. User selects seats and sends `POST /api/bookings/lock-seats`.
4. API Gateway verifies JWT and adds `x-user-id` header to context.
5. Booking Service attempts to acquire Redis locks (`SETNX`) for all requested seats. If any fail, it aborts.
6. Booking Service opens MySQL Transaction: inserts `Booking` (status: PENDING) and `OutboxEvent` (type: ORDER_CREATED).
7. Outbox Poller reads the event, publishes to RabbitMQ `orders_queue`, marks event as PROCESSED.
8. Payment Service consumes `ORDER_CREATED`, processes payment, publishes `PAYMENT_COMPLETED` to `payments_queue`.
9. Booking Service Consumer consumes `PAYMENT_COMPLETED` and updates the `Booking` status to CONFIRMED (or FAILED).
