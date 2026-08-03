import { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import apiClient from '../apiClient';

export default function Theatre() {
  const { id } = useParams();
  const [theatre, setTheatre] = useState(null);
  const [showtimes, setShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchTheatreData = async () => {
      try {
        setLoading(true);
        // Fetch theatre details
        const tRes = await apiClient.get(`/api/catalog/theatres/${id}`);
        setTheatre(tRes.data);
        
        // Fetch showtimes for this theatre
        const sRes = await apiClient.get(`/api/catalog/theatres/${id}/showtimes`);
        setShowtimes(sRes.data || []);
      } catch (err) {
        console.error('Failed to fetch theatre data', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTheatreData();
  }, [id]);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col pt-24 items-center justify-center">
        <Header />
        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></div>
        <BottomNav />
      </div>
    );
  }

  if (!theatre) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col pt-24">
        <Header />
        <main className="flex-grow flex flex-col items-center justify-center max-w-container-max mx-auto px-6 w-full">
          <h2 className="text-3xl mb-4">Theatre not found</h2>
          <Link to="/cinemas" className="text-primary hover:underline">Back to Cinemas</Link>
        </main>
        <BottomNav />
        <Footer />
      </div>
    );
  }

  // Group showtimes by movie
  const moviesMap = new Map();
  showtimes.forEach(st => {
    if (!moviesMap.has(st.movie.id)) {
      moviesMap.set(st.movie.id, {
        movie: st.movie,
        showtimes: []
      });
    }
    moviesMap.get(st.movie.id).showtimes.push(st);
  });

  const moviesPlaying = Array.from(moviesMap.values());

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative pt-24">
      <Header />
      
      <main className="flex-grow pb-24 md:pb-12 max-w-container-max mx-auto px-6 md:px-12 w-full">
        {/* Theatre Header */}
        <div className="mb-12 border-b border-white/10 pb-8 mt-8">
          <div className="flex items-center gap-4 mb-4 text-primary">
            <span className="material-symbols-outlined text-[32px]">location_on</span>
            <span className="text-sm font-label-md px-2 py-1 bg-white/5 rounded text-white/60">OPEN</span>
          </div>
          <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-tight">{theatre.name}</h1>
          <p className="text-on-surface-variant font-body-md mt-2 text-lg">{theatre.address}, {theatre.city}</p>
        </div>

        {/* Movies Playing */}
        <h2 className="font-headline-lg text-2xl text-white mb-8">Now Playing Here</h2>
        
        {moviesPlaying.length === 0 ? (
          <div className="text-center py-16 bg-surface-container rounded-2xl border border-white/5">
            <span className="material-symbols-outlined text-6xl text-white/20 mb-4 block">theaters</span>
            <p className="text-on-surface-variant">No movies are currently playing at this theatre.</p>
          </div>
        ) : (
          <div className="space-y-8">
            {moviesPlaying.map(({ movie, showtimes }) => (
              <div key={movie.id} className="glass-panel p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6">
                <img src={movie.posterUrl} alt={movie.title} className="w-32 rounded-lg object-cover shadow-lg" />
                <div className="flex-grow">
                  <h3 className="text-2xl font-bold text-white mb-2">{movie.title}</h3>
                  <div className="flex gap-2 text-sm text-white/60 mb-6">
                    <span className="px-2 py-1 bg-white/5 rounded">{movie.genre}</span>
                    <span className="px-2 py-1 bg-white/5 rounded">{movie.duration}m</span>
                  </div>
                  
                  <div className="flex flex-wrap gap-3">
                    {showtimes
                      .sort((a, b) => new Date(a.startTime) - new Date(b.startTime))
                      .map(st => {
                        const date = new Date(st.startTime);
                        const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                        const isPast = date < new Date();
                        
                        return (
                          <Link 
                            key={st.id} 
                            to={isPast ? '#' : `/checkout/${st.id}`}
                            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                              isPast 
                                ? 'bg-white/5 text-white/30 cursor-not-allowed' 
                                : 'bg-primary/20 text-primary border border-primary/30 hover:bg-primary hover:text-white'
                            }`}
                          >
                            {timeStr}
                          </Link>
                        );
                      })
                    }
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
