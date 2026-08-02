import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';
import axios from 'axios';
import https from 'https';
dotenv.config();

const prisma = new PrismaClient();

// Force IPv4 to prevent ECONNRESET issues on some Windows setups
const axiosInstance = axios.create({
  httpsAgent: new https.Agent({ family: 4 })
});

async function sync() {
  const apiKey = process.env.TMDB_API_KEY;
  if (!apiKey || apiKey === "PASTE_YOUR_TMDB_API_KEY_HERE") {
    console.error("❌ TMDB_API_KEY is missing or invalid in .env file.");
    process.exit(1);
  }

  console.log('[TMDB Sync] Fetching "Now Playing" movies from TMDB...');

  let topMovies = [];
  let usingFallback = false;
  try {
    const response = await axiosInstance.get(`https://api.themoviedb.org/3/movie/now_playing?api_key=${apiKey}&language=en-US&page=1`, { timeout: 10000 });
    if (response.status === 200) {
      topMovies = response.data.results.slice(0, 10);
    } else {
      throw new Error("Invalid response");
    }
  } catch (error) {
    console.warn("⚠️ TMDB API unreachable. Using realistic fallback data...", error.message);
    usingFallback = true;
    topMovies = [
      { id: 27205, title: "Inception", poster_path: "/oYuLEt3zVCKq57qu2F8dT7NIa6f.jpg", backdrop_path: "/8ZTVqvKDQ8emSGUEMjsS4yHAwrp.jpg", vote_average: 8.8, release_date: "2010-07-15", trailer_url: "https://www.youtube.com/embed/YoHD9XEInc0?autoplay=1", overview: "A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.", runtime: 148, genres: [{name: "Action"}, {name: "Sci-Fi"}], topCast: [{name: "Leonardo DiCaprio", role: "Cobb", img: null}, {name: "Joseph Gordon-Levitt", role: "Arthur", img: null}] },
      { id: 157336, title: "Interstellar", poster_path: "/gEU2QlsUUQtcTaC4PvaTEYSd0zJ.jpg", backdrop_path: "/pbrkL804c8yAv3zBZR4QPEafpAR.jpg", vote_average: 8.4, release_date: "2014-11-05", trailer_url: "https://www.youtube.com/embed/zSWdZVtXT7E?autoplay=1", overview: "A team of explorers travel through a wormhole in space in an attempt to ensure humanity's survival.", runtime: 169, genres: [{name: "Adventure"}, {name: "Drama"}], topCast: [{name: "Matthew McConaughey", role: "Cooper", img: null}, {name: "Anne Hathaway", role: "Brand", img: null}] },
      { id: 155, title: "The Dark Knight", poster_path: "/qJ2tW6WMUDux911r6m7haRef0WH.jpg", backdrop_path: "/nMKdUUepR0i5zn0y1T4CsSB5chy.jpg", vote_average: 9.0, release_date: "2008-07-16", trailer_url: "https://www.youtube.com/embed/EXeTwQWrcwY?autoplay=1", overview: "When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.", runtime: 152, genres: [{name: "Action"}, {name: "Crime"}], topCast: [{name: "Christian Bale", role: "Bruce Wayne", img: null}, {name: "Heath Ledger", role: "Joker", img: null}] },
      { id: 24428, title: "The Avengers", poster_path: "/RYMX2wcKCBAr24UyPD7xwmja8y.jpg", backdrop_path: "/9BBTo63ANSmhC4e6r62OJFuK2GL.jpg", vote_average: 7.7, release_date: "2012-04-25", trailer_url: "https://www.youtube.com/embed/eOrNdBpGMv8?autoplay=1", overview: "Earth's mightiest heroes must come together and learn to fight as a team if they are going to stop the mischievous Loki and his alien army from enslaving humanity.", runtime: 143, genres: [{name: "Action"}, {name: "Sci-Fi"}], topCast: [{name: "Robert Downey Jr.", role: "Tony Stark", img: null}, {name: "Chris Evans", role: "Steve Rogers", img: null}] }
    ];
  }

  try {
    console.log(`[TMDB Sync] Processing ${topMovies.length} movies...`);

    // Clean up existing data
    await prisma.showtime.deleteMany();
    await prisma.movie.deleteMany();

    for (const m of topMovies) {
      let details = { overview: m.overview || "An amazing cinematic experience.", runtime: m.runtime || 120, genres: m.genres || [{name: "Action"}] };
      let topCast = m.topCast || [{ name: "Actor 1", role: "Lead", img: null }];
      let trailerUrl = m.trailer_url || "https://www.youtube.com/embed/8Qn_spdM5Zg?autoplay=1";

      if (!usingFallback) {
        try {
          // Add a small delay to avoid TMDB rate limits
          await new Promise(resolve => setTimeout(resolve, 300));
          
          const detailsRes = await axiosInstance.get(`https://api.themoviedb.org/3/movie/${m.id}?api_key=${apiKey}&language=en-US&append_to_response=credits,videos`, { timeout: 10000 });
          details = detailsRes.data;
          
          const credits = details.credits || {};
          topCast = (credits.cast || []).slice(0, 5).map(c => ({
            name: c.name, role: c.character, img: c.profile_path ? `https://image.tmdb.org/t/p/w200${c.profile_path}` : null
          }));

          const videosData = details.videos || {};
          const trailer = (videosData.results || []).find(v => (v.type === "Trailer" || v.type === "Teaser") && v.site === "YouTube");
          if (trailer) trailerUrl = `https://www.youtube.com/embed/${trailer.key}?autoplay=1`;
        } catch (err) {
          console.warn(`⚠️ Failed to fetch details for ${m.title}, using defaults. Error: ${err.message}`);
        }
      }

      const genres = details.genres ? details.genres.map(g => g.name).join(', ') : 'Action';
      
      await prisma.movie.create({
        data: {
          id: m.id.toString(),
          title: m.title,
          genre: genres,
          posterUrl: m.poster_path ? `https://image.tmdb.org/t/p/w500${m.poster_path}` : null,
          backdropUrl: m.backdrop_path ? `https://image.tmdb.org/t/p/original${m.backdrop_path}` : null,
          overview: details.overview,
          trailerUrl: trailerUrl,
          cast: topCast,
          rating: m.vote_average,
          duration: details.runtime || 120,
          releaseYear: m.release_date ? parseInt(m.release_date.split('-')[0]) : null
        }
      });
      console.log(`✅ Added: ${m.title}`);
    }

    console.log('[TMDB Sync] Creating theatres and showtimes...');
    // Create Lucknow theatres
    const theatres = [
      { id: 'theatre-1', name: 'PVR Phoenix Palassio', lat: 26.8123, lon: 81.0116 },
      { id: 'theatre-2', name: 'INOX Riverside Mall', lat: 26.8550, lon: 80.9780 },
      { id: 'theatre-3', name: 'Cinepolis One Awadh Center', lat: 26.8582, lon: 81.0069 },
      { id: 'theatre-4', name: 'Wave Cinemas', lat: 26.8617, lon: 81.0028 },
      { id: 'theatre-5', name: 'PVR Saharaganj', lat: 26.8533, lon: 80.9430 },
      { id: 'theatre-6', name: 'INOX Umrao Mall', lat: 26.8679, lon: 80.9926 }
    ];

    for (const t of theatres) {
      await prisma.theatre.upsert({
        where: { id: t.id },
        update: { name: t.name, lat: t.lat, lon: t.lon },
        create: t,
      });
    }

    // Assign showtimes for the next 3 days, with 4 timeslots per day
    const showtimesData = [];
    const moviesInDb = await prisma.movie.findMany();
    
    const timeslots = [
      { h: 10, m: 0 },
      { h: 13, m: 30 },
      { h: 17, m: 0 },
      { h: 20, m: 30 }
    ];

    for (let dayOffset = 0; dayOffset < 3; dayOffset++) {
      for (const movie of moviesInDb) {
        for (const theatre of theatres) {
          for (const time of timeslots) {
            const date = new Date();
            date.setDate(date.getDate() + dayOffset);
            date.setHours(time.h, time.m, 0, 0);
            
            showtimesData.push({
              movieId: movie.id,
              theatreId: theatre.id,
              startTime: date
            });
          }
        }
      }
    }

    await prisma.showtime.createMany({ data: showtimesData });

    console.log('[TMDB Sync] Sync completed successfully!');
  } catch (error) {
    console.error("❌ Sync Error:", error);
  }
}

sync()
  .catch(e => console.error(e))
  .finally(async () => {
    await prisma.$disconnect();
  });
