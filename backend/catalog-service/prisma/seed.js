import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  // 1. Clear existing data
  await prisma.showtime.deleteMany();
  await prisma.movie.deleteMany();
  await prisma.theatre.deleteMany();

  // 2. Create Theatres
  const amcEmpire = await prisma.theatre.create({
    data: {
      name: "AMC Empire 25",
      lat: 40.7569,
      lon: -73.9889
    }
  });

  const regalUnion = await prisma.theatre.create({
    data: {
      name: "Regal Union Square",
      lat: 40.7334,
      lon: -73.9908
    }
  });

  // 3. Create Movies
  const ramayan = await prisma.movie.create({
    data: {
      title: "Ramayan",
      genre: "Epic / Mythology",
      posterUrl: "/ramayan_poster.png",
      backdropUrl: "/ramayan_hero_bg.png",
      rating: 8.8,
      duration: 166,
      releaseYear: 2024
    }
  });

  const dune2 = await prisma.movie.create({
    data: {
      title: "Dune: Part Two",
      genre: "Sci-Fi / Adventure",
      posterUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFo8G6U4qXQ53h7Q05R8eTzT7_n3X5yX5O_x506509Y7e2h7n1P7d4m09X5e2s9i1J6M7K6r60124J06K2H5R2n1U1s0L4l6G0h7W9k1k9w0S6k6Q8l3D9l1t9p0i9A2L5w6S3p0C4x9P0b4A1Z7j3n1b2N7T7n1C6H3E5A4Q5O4t0M3w6U9T2M1D1",
      backdropUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFo8G6U4qXQ53h7Q05R8eTzT7_n3X5yX5O_x506509Y7e2h7n1P7d4m09X5e2s9i1J6M7K6r60124J06K2H5R2n1U1s0L4l6G0h7W9k1k9w0S6k6Q8l3D9l1t9p0i9A2L5w6S3p0C4x9P0b4A1Z7j3n1b2N7T7n1C6H3E5A4Q5O4t0M3w6U9T2M1D1",
      rating: 9.0,
      duration: 166,
      releaseYear: 2024
    }
  });

  const deadpool = await prisma.movie.create({
    data: {
      title: "Deadpool & Wolverine",
      genre: "Action / Comedy",
      posterUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFo8G6U4qXQ53h7Q05R8eTzT7_n3X5yX5O_x506509Y7e2h7n1P7d4m09X5e2s9i1J6M7K6r60124J06K2H5R2n1U1s0L4l6G0h7W9k1k9w0S6k6Q8l3D9l1t9p0i9A2L5w6S3p0C4x9P0b4A1Z7j3n1b2N7T7n1C6H3E5A4Q5O4t0M3w6U9T2M1D1",
      backdropUrl: "https://lh3.googleusercontent.com/aida-public/AB6AXuDFo8G6U4qXQ53h7Q05R8eTzT7_n3X5yX5O_x506509Y7e2h7n1P7d4m09X5e2s9i1J6M7K6r60124J06K2H5R2n1U1s0L4l6G0h7W9k1k9w0S6k6Q8l3D9l1t9p0i9A2L5w6S3p0C4x9P0b4A1Z7j3n1b2N7T7n1C6H3E5A4Q5O4t0M3w6U9T2M1D1",
      rating: 8.5,
      duration: 127,
      releaseYear: 2024
    }
  });

  // 4. Create Showtimes
  // Today's Date base
  const today = new Date();
  today.setHours(18, 0, 0, 0); // 6:00 PM
  
  const tomorrow = new Date(today);
  tomorrow.setDate(today.getDate() + 1);
  tomorrow.setHours(20, 0, 0, 0); // 8:00 PM tomorrow

  await prisma.showtime.createMany({
    data: [
      { movieId: ramayan.id, theatreId: amcEmpire.id, startTime: today },
      { movieId: ramayan.id, theatreId: amcEmpire.id, startTime: tomorrow },
      { movieId: ramayan.id, theatreId: regalUnion.id, startTime: today },
      
      { movieId: dune2.id, theatreId: amcEmpire.id, startTime: today },
      { movieId: dune2.id, theatreId: regalUnion.id, startTime: tomorrow },

      { movieId: deadpool.id, theatreId: amcEmpire.id, startTime: tomorrow },
    ]
  });

  console.log("Database seeded successfully!");
}

main()
  .catch(e => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
