import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
prisma.booking.findMany().then(b => { 
  console.log(JSON.stringify(b, null, 2)); 
  prisma.$disconnect(); 
}).catch(e => { 
  console.error(e); 
  prisma.$disconnect(); 
});
