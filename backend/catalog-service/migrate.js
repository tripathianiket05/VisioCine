import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  await prisma.$executeRawUnsafe(`
    CREATE TABLE IF NOT EXISTS "Watchlist" (
        "id" TEXT NOT NULL,
        "userId" TEXT NOT NULL,
        "movieId" TEXT NOT NULL,
        "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
        CONSTRAINT "Watchlist_pkey" PRIMARY KEY ("id")
    );
  `);
  
  try {
    await prisma.$executeRawUnsafe(`
        CREATE UNIQUE INDEX "Watchlist_userId_movieId_key" ON "Watchlist"("userId", "movieId");
    `);
  } catch(e) {}
  
  try {
    await prisma.$executeRawUnsafe(`
      ALTER TABLE "Watchlist" ADD CONSTRAINT "Watchlist_movieId_fkey" FOREIGN KEY ("movieId") REFERENCES "Movie"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
    `);
  } catch(e) {
    console.log('FK already exists or error:', e.message);
  }
  console.log('Done');
}
main().catch(console.error).finally(() => prisma.$disconnect());
