import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const app = express();
const PORT = 3002;

// CORS handled by API Gateway
app.use(express.json());

// Get all movies
app.get('/movies', async (req, res) => {
  try {
    const movies = await prisma.movie.findMany();
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch movies' });
  }
});

// Get all theatres
app.get('/theatres', async (req, res) => {
  try {
    const theatres = await prisma.theatre.findMany();
    res.json(theatres);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch theatres' });
  }
});

// Get showtimes for a specific movie
app.get('/movies/:id/showtimes', async (req, res) => {
  const { id } = req.params;
  try {
    const showtimes = await prisma.showtime.findMany({
      where: { movieId: id },
      include: { theatre: true }
    });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch showtimes' });
  }
});

// Get specific showtime by id
app.get('/showtimes/:id', async (req, res) => {
  try {
    const showtime = await prisma.showtime.findUnique({
      where: { id: req.params.id },
      include: { movie: true, theatre: true }
    });
    if (!showtime) return res.status(404).json({ error: 'Showtime not found' });
    res.json(showtime);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch showtime' });
  }
});

app.listen(PORT, () => {
  console.log(`[Catalog Service] Running on port ${PORT}`);
});
