import express from 'express';
import cors from 'cors';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

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

// Get showtimes for a specific theatre
app.get('/theatres/:id/showtimes', async (req, res) => {
  const { id } = req.params;
  try {
    const showtimes = await prisma.showtime.findMany({
      where: { theatreId: id },
      include: { movie: true }
    });
    res.json(showtimes);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch showtimes for theatre' });
  }
});

// Get a specific theatre by id
app.get('/theatres/:id', async (req, res) => {
  const { id } = req.params;
  try {
    const theatre = await prisma.theatre.findUnique({
      where: { id }
    });
    if (!theatre) return res.status(404).json({ error: 'Theatre not found' });
    res.json(theatre);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch theatre' });
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

import { exec } from 'child_process';

// Middleware to authenticate JWT
const authenticateToken = (req, res, next) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  
  if (!token) return res.status(401).json({ error: 'Access token required' });
  
  jwt.verify(token, process.env.ACCESS_SECRET || 'supersecret_access_key', (err, user) => {
    if (err) return res.status(403).json({ error: 'Invalid or expired token' });
    req.userId = user.userId || user.id; // Support different JWT payloads if necessary
    next();
  });
};

// Get user watchlist
app.get('/watchlist', authenticateToken, async (req, res) => {
  try {
    const watchlists = await prisma.watchlist.findMany({
      where: { userId: req.userId },
      include: { movie: true }
    });
    // Extract just the movies and add the watchlist id
    const movies = watchlists.map(w => ({ ...w.movie, watchlistId: w.id }));
    res.json(movies);
  } catch (err) {
    res.status(500).json({ error: 'Failed to fetch watchlist' });
  }
});

// Add movie to watchlist
app.post('/watchlist', authenticateToken, async (req, res) => {
  const { movieId } = req.body;
  try {
    const existing = await prisma.watchlist.findUnique({
      where: { userId_movieId: { userId: req.userId, movieId } }
    });
    if (existing) return res.status(400).json({ error: 'Movie already in watchlist' });
    
    const watchlist = await prisma.watchlist.create({
      data: {
        userId: req.userId,
        movieId
      },
      include: { movie: true }
    });
    res.status(201).json(watchlist.movie);
  } catch (err) {
    console.error('Failed to add to watchlist', err);
    res.status(500).json({ error: 'Failed to add to watchlist' });
  }
});

// Remove movie from watchlist
app.delete('/watchlist/:movieId', authenticateToken, async (req, res) => {
  const { movieId } = req.params;
  try {
    await prisma.watchlist.delete({
      where: { userId_movieId: { userId: req.userId, movieId } }
    });
    res.json({ message: 'Removed from watchlist' });
  } catch (err) {
    // If record doesn't exist, ignore and return 200
    if (err.code === 'P2025') {
      return res.json({ message: 'Removed from watchlist' });
    }
    console.error('Failed to remove from watchlist', err);
    res.status(500).json({ error: 'Failed to remove from watchlist' });
  }
});

app.post('/sync', (req, res) => {
  exec('node src/tmdb-sync.js', (error, stdout, stderr) => {
    if (error) {
      console.error(`Sync error: ${error.message}`);
      return res.status(500).json({ error: 'Sync failed', details: error.message });
    }
    res.json({ message: 'Sync completed', stdout });
  });
});

app.listen(PORT, () => {
  console.log(`[Catalog Service] Running on port ${PORT}`);
});
