import { Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import MovieCard from '../components/MovieCard';
import apiClient, { getAccessToken, getWatchlist, addToWatchlist, removeFromWatchlist } from '../apiClient';

export default function Home() {
  const [movies, setMovies] = useState([]);
  const [theatres, setTheatres] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [watchlistIds, setWatchlistIds] = useState(new Set());
  const isAuthenticated = !!getAccessToken();

  // Fetch movies on mount
  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await apiClient.get('/api/catalog/movies');
        setMovies(response.data);
        
        if (isAuthenticated) {
          const watchlist = await getWatchlist();
          setWatchlistIds(new Set(watchlist.map(m => m.id)));
        }
      } catch (err) {
        console.error('Failed to fetch movies or watchlist', err);
      } finally {
        setLoading(false);
      }
    };
    fetchMovies();
  }, []);

  // Debounced theatre search
  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        // Using Lucknow coordinates
        let url = '/api/search/theatres?lat=26.8467&lon=80.9462';
        if (searchQuery) url += `&query=${searchQuery}`;
        const response = await apiClient.get(url);
        // Ensure response is an array (handle different ES response shapes)
        setTheatres(Array.isArray(response.data) ? response.data : (response.data.hits || []));
      } catch (err) {
        console.error('Failed to fetch theatres', err);
      }
    };

    const delayDebounceFn = setTimeout(() => {
      fetchTheatres();
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  const featuredMovie = movies.length > 0 ? movies[0] : null;

  const handleToggleWatchlist = async (movieId, isWatchlisted) => {
    if (!isAuthenticated) return;
    try {
      if (isWatchlisted) {
        await removeFromWatchlist(movieId);
        setWatchlistIds(prev => {
          const newSet = new Set(prev);
          newSet.delete(movieId);
          return newSet;
        });
      } else {
        await addToWatchlist(movieId);
        setWatchlistIds(prev => new Set(prev).add(movieId));
      }
    } catch (err) {
      console.error('Failed to toggle watchlist', err);
    }
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative">
      <Header />
      
      <main className="flex-grow pb-24 md:pb-12">
        {/* Hero Section */}
        {featuredMovie ? (
          <section className="relative w-full h-[70vh] md:h-[85vh] flex items-end">
            {/* Background Image */}
            <div className="absolute inset-0 w-full h-full">
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat z-0 w-full h-full" 
                style={{ backgroundImage: `url('${featuredMovie.backdropUrl}')` }}
              ></div>
              {/* Gradient Overlay */}
              <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-surface/90 via-transparent to-transparent z-10"></div>
            </div>
            
            {/* Hero Content */}
            <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-12 md:pb-24 flex flex-col items-start gap-6">
              <div className="inline-flex items-center gap-2 bg-primary-container/20 border border-primary-container/50 px-3 py-1 rounded-full text-primary font-label-md text-label-md">
                <span className="w-2 h-2 rounded-full bg-primary animate-pulse"></span>
                <span>Now Premiering</span>
              </div>
              <h1 className="font-display text-4xl md:text-6xl lg:text-7xl text-on-surface uppercase tracking-tight max-w-2xl leading-none">
                {featuredMovie.title}
              </h1>
              <div className="flex items-center gap-4 text-on-surface-variant font-body-md text-body-md">
                <span>{featuredMovie.releaseYear}</span>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50"></span>
                <span>{featuredMovie.genre}</span>
                <span className="w-1 h-1 rounded-full bg-on-surface-variant/50"></span>
                <span>{Math.floor(featuredMovie.duration / 60)}h {featuredMovie.duration % 60}m</span>
              </div>
              <p className="max-w-xl text-on-surface/80 font-body-lg text-body-lg hidden md:block line-clamp-3">
                Experience this epic masterpiece on the big screen.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 mt-4 w-full sm:w-auto">
                <Link 
                  to={isAuthenticated ? `/movie/${featuredMovie.id}/showtimes` : '/login'} 
                  className="bg-primary text-white font-label-md text-label-md py-4 px-8 rounded-full shadow-lg shadow-primary/30 flex items-center justify-center gap-2 hover:bg-inverse-primary hover:shadow-primary/50 hover:-translate-y-1 transition-all duration-300"
                >
                  <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>confirmation_number</span>
                  Book Tickets
                </Link>
                {featuredMovie?.trailerUrl && (
                  <button 
                    onClick={() => setIsTrailerOpen(true)}
                    className="glass-panel text-on-surface font-label-md text-label-md py-4 px-8 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                    Watch Trailer
                  </button>
                )}
              </div>
            </div>
          </section>
        ) : (
          <section className="relative w-full h-[70vh] md:h-[85vh] flex items-end bg-surface-container">
            <div className="relative z-20 w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pb-12 md:pb-24">
              <div className="w-32 h-8 bg-white/10 rounded mb-6 animate-pulse"></div>
              <div className="w-96 h-16 bg-white/10 rounded mb-4 animate-pulse"></div>
              <div className="w-64 h-6 bg-white/10 rounded mb-4 animate-pulse"></div>
            </div>
          </section>
        )}

        {/* Theatre Search */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-12 border-b border-white/5">
           <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-8">
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Theatres Near You</h2>
              <div className="w-full md:w-auto relative">
                <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
                <input 
                  type="text" 
                  placeholder="Search theatres..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full md:w-80 bg-surface-container-low border border-white/10 rounded-full pl-12 pr-4 py-3 text-on-surface focus:outline-none focus:border-primary transition-all text-sm shadow-inner shadow-white/5"
                />
              </div>
           </div>
           
           <div className="flex gap-6 overflow-x-auto pb-6 custom-scrollbar snap-x snap-mandatory">
             {theatres.map(theatre => (
               <div key={theatre.id || theatre._id} className="min-w-[300px] md:min-w-[380px] snap-start glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer border border-white/10 hover:border-primary/50 relative overflow-hidden shrink-0">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                  <div className="flex justify-between items-start mb-4 relative z-10">
                    <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-lg">
                      <span className="material-symbols-outlined text-[24px]">location_on</span>
                    </div>
                    <span className="text-xs font-label-md px-2 py-1 bg-white/5 rounded text-white/60">OPEN</span>
                  </div>
                  <h3 className="font-headline-md text-2xl text-white mb-2 relative z-10">{theatre.name || theatre._source?.name}</h3>
                  <p className="text-on-surface-variant font-body-md text-sm mb-6 line-clamp-2 relative z-10">{theatre.address || theatre._source?.address}</p>
                  <div className="flex items-center gap-4 border-t border-white/10 pt-4 relative z-10">
                    <div className="flex items-center gap-1 text-white/60 text-xs font-label-md" title="IMAX Available">
                      <span className="material-symbols-outlined text-[16px]">movie</span> IMAX
                    </div>
                    <div className="flex items-center gap-1 text-white/60 text-xs font-label-md" title="Dolby Atmos Available">
                      <span className="material-symbols-outlined text-[16px]">surround_sound</span> ATMOS
                    </div>
                    <div className="flex items-center gap-1 text-white/60 text-xs font-label-md" title="Dine-in Available">
                      <span className="material-symbols-outlined text-[16px]">restaurant</span> DINE-IN
                    </div>
                  </div>
               </div>
             ))}
             {theatres.length === 0 && <p className="text-on-surface-variant text-sm">No theatres found nearby.</p>}
           </div>
        </section>

        {/* Now Showing Grid */}
        <section className="max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-16">
          <div className="flex justify-between items-end mb-8">
            <div>
              <h2 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface">Now Showing</h2>
              <p className="text-on-surface-variant font-body-md text-body-md mt-2">Experience the magic of cinema.</p>
            </div>
            <div className="hidden md:flex gap-2">
              <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_left</span>
              </button>
              <button className="w-10 h-10 rounded-full glass-panel flex items-center justify-center text-on-surface hover:text-primary transition-colors">
                <span className="material-symbols-outlined">chevron_right</span>
              </button>
            </div>
          </div>
          
          {loading ? (
             <div className="flex justify-center py-12"><span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span></div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-gutter">
              {movies.map(movie => (
                <MovieCard 
                  key={movie.id} 
                  {...movie} 
                  image={movie.posterUrl} 
                  isWatchlisted={watchlistIds.has(movie.id)}
                  onToggleWatchlist={() => handleToggleWatchlist(movie.id, watchlistIds.has(movie.id))}
                />
              ))}
            </div>
          )}
        </section>
      </main>

      <BottomNav />
      <Footer />

      {/* Trailer Modal */}
      {isTrailerOpen && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-4">
          <button 
            onClick={() => setIsTrailerOpen(false)}
            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors glass-panel p-2 rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          
          <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            {featuredMovie?.trailerUrl && (
              <iframe 
                width="100%" 
                height="100%" 
                src={featuredMovie.trailerUrl} 
                title="YouTube video player" 
                frameBorder="0" 
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                referrerPolicy="strict-origin-when-cross-origin" 
                allowFullScreen
              ></iframe>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
