import { useState, useEffect, useMemo } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import apiClient, { getAccessToken } from '../apiClient';

export default function Showtimes() {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [movie, setMovie] = useState(null);
  const [allShowtimes, setAllShowtimes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isTrailerOpen, setIsTrailerOpen] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isWatchlisted, setIsWatchlisted] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());

  // Listen for auth changes
  useEffect(() => {
    const handleAuthChange = (e) => {
      setIsAuthenticated(e.detail.isAuthenticated);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  // Fetch watchlist when authentication status changes to true
  useEffect(() => {
    const fetchWatchlist = async () => {
      if (isAuthenticated) {
        try {
          const wlRes = await apiClient.get('/api/catalog/watchlist');
          setIsWatchlisted(wlRes.data.some(m => String(m.id) === String(id)));
        } catch (e) {
          console.error('Watchlist fetch error', e);
        }
      } else {
        setIsWatchlisted(false);
      }
    };
    fetchWatchlist();
  }, [id, isAuthenticated]);

  // Date selection
  const [dates, setDates] = useState([]);
  const [selectedDate, setSelectedDate] = useState(null);

  useEffect(() => {
    const next7Days = Array.from({length: 7}).map((_, i) => {
      const d = new Date();
      d.setDate(d.getDate() + i);
      return d;
    });
    setDates(next7Days);
    setSelectedDate(next7Days[0]);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Fetch movie details
        const moviesRes = await apiClient.get('/api/catalog/movies');
        const currentMovie = moviesRes.data.find(m => m.id === id);
        setMovie(currentMovie || { title: 'Unknown Movie', genre: 'Unknown' });

        // Fetch showtimes
        const showtimesRes = await apiClient.get(`/api/catalog/movies/${id}/showtimes`);
        setAllShowtimes(showtimesRes.data);
      } catch (err) {
        console.error('Failed to fetch data', err);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  const toggleWatchlist = async () => {
    if (!getAccessToken()) {
      navigate('/login');
      return;
    }
    try {
      if (isWatchlisted) {
        await apiClient.delete(`/api/catalog/watchlist/${id}`);
        setIsWatchlisted(false);
      } else {
        await apiClient.post('/api/catalog/watchlist', { movieId: id });
        setIsWatchlisted(true);
      }
    } catch (err) {
      console.error('Failed to toggle watchlist', err);
      alert('Could not update watchlist. Please try again.');
    }
    setIsMenuOpen(false);
  };

  const shareMovie = () => {
    if (navigator.share) {
      navigator.share({
        title: movie?.title || 'Cineplex Movie',
        url: window.location.href
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(window.location.href);
      alert('Link copied to clipboard!');
    }
    setIsMenuOpen(false);
  };

  const showtimesByTheatre = useMemo(() => {
    if (!selectedDate || allShowtimes.length === 0) return {};
    
    const filtered = allShowtimes.filter(st => {
      const stDate = new Date(st.startTime);
      return stDate.getDate() === selectedDate.getDate() && 
             stDate.getMonth() === selectedDate.getMonth() && 
             stDate.getFullYear() === selectedDate.getFullYear();
    });

    return filtered.reduce((acc, st) => {
      if (!acc[st.theatreId]) {
        acc[st.theatreId] = {
          theatre: st.theatre,
          showtimes: []
        };
      }
      acc[st.theatreId].showtimes.push(st);
      return acc;
    }, {});
  }, [allShowtimes, selectedDate]);

  const getDayName = (date, idx) => {
    if (idx === 0) return 'Today';
    if (idx === 1) return 'Tomorrow';
    return date.toLocaleDateString('en-US', { weekday: 'short' });
  };

  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-0">
      {/* Back Button / Mini Nav for Details */}
      <div className="fixed top-0 left-0 w-full z-50 p-margin-mobile md:p-margin-desktop flex justify-between items-center pointer-events-none">
        <button 
          onClick={() => navigate(-1)} 
          className="pointer-events-auto glass-panel rounded-full p-2 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
        >
          <span className="material-symbols-outlined text-[24px]">arrow_back</span>
        </button>
        <div className="relative pointer-events-auto">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="glass-panel rounded-full p-2 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">more_vert</span>
          </button>
          
          {isMenuOpen && (
            <>
              <div className="fixed inset-0 z-40" onClick={() => setIsMenuOpen(false)}></div>
              <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-high border border-white/10 rounded-xl shadow-2xl py-2 z-50 glass-panel">
                <button 
                  onClick={toggleWatchlist}
                  className="w-full text-left px-4 py-3 text-white/90 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-3"
                >
                  <span className={`material-symbols-outlined text-[20px] ${isWatchlisted ? 'text-primary' : ''}`} style={{ fontVariationSettings: isWatchlisted ? "'FILL' 1" : "'FILL' 0" }}>
                    favorite
                  </span>
                  {isWatchlisted ? 'Remove Watchlist' : 'Add to Watchlist'}
                </button>
                <button 
                  onClick={shareMovie}
                  className="w-full text-left px-4 py-3 text-white/90 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-3"
                >
                  <span className="material-symbols-outlined text-[20px]">share</span>
                  Share
                </button>
              </div>
            </>
          )}
        </div>
      </div>

      <main className="w-full">
        {/* Hero Section */}
        <section className="relative w-full h-[60vh] md:h-[70vh] flex flex-col justify-end">
          {/* Blurred Backdrop */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/80 to-transparent z-10"></div>
            <div 
              className="w-full h-full bg-cover bg-center bg-no-repeat blur-sm scale-105 transform origin-center" 
              style={{ backgroundImage: `url('${movie?.backdropUrl || ''}')` }}
            ></div>
          </div>
          
          {/* Foreground Content */}
          <div className="relative z-20 px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full flex flex-col md:flex-row items-end md:items-stretch gap-6 md:gap-12 pb-8">
            {/* Poster */}
            <div className="w-32 md:w-56 flex-shrink-0 self-start md:self-auto rounded-lg overflow-hidden shadow-2xl glass-panel relative group -mt-16 md:mt-0">
              <img 
                className="w-full h-auto object-cover aspect-[2/3] group-hover:scale-105 transition-transform duration-500" 
                src={movie?.posterUrl || undefined} 
                alt={`${movie?.title || ''} Poster`}
              />
            </div>
            
            {/* Info */}
            <div className="flex flex-col justify-end pb-2 md:pb-4">
              <h1 className="font-display text-display text-on-surface mb-2">{movie ? movie.title : 'Loading...'}</h1>
              <div className="flex flex-wrap items-center gap-3 mb-4 font-label-md text-label-md text-on-surface-variant">
                <span className="px-2 py-1 glass-panel rounded">{movie ? movie.genre : ''}</span>
                <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">schedule</span> {movie?.duration ? `${Math.floor(movie.duration / 60)}h ${movie.duration % 60}m` : ''}</span>
                <span className="flex items-center gap-1 text-tertiary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>star</span> {movie?.rating}</span>
              </div>
              <p className="font-body-md text-body-md text-on-surface/80 max-w-2xl line-clamp-3 md:line-clamp-none">
                {movie?.overview || 'Experience this epic masterpiece on the big screen.'}
              </p>
              
              {movie?.trailerUrl && (
                <div className="mt-6 flex">
                  <button 
                    onClick={() => setIsTrailerOpen(true)}
                    className="glass-panel text-on-surface font-label-md text-label-md py-3 px-6 rounded-full flex items-center justify-center gap-2 hover:bg-white/10 transition-all duration-300"
                  >
                    <span className="material-symbols-outlined">play_arrow</span>
                    Watch Trailer
                  </button>
                </div>
              )}
            </div>
          </div>
        </section>

        {/* Main Content Area */}
        <div className="px-margin-mobile md:px-margin-desktop max-w-container-max mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-gutter mt-8">
          {/* Left Column: Dates & Theaters */}
          <div className="lg:col-span-8 flex flex-col gap-12">
            
            {/* Date Selector */}
            <section>
              <h2 className="font-headline-md text-headline-md text-on-surface mb-4">Select Date</h2>
              <div className="flex gap-4 overflow-x-auto no-scrollbar pb-4 snap-x">
                {dates.map((date, idx) => {
                  const isSelected = selectedDate?.getDate() === date.getDate() && selectedDate?.getMonth() === date.getMonth();
                  return (
                    <button 
                      key={idx}
                      onClick={() => setSelectedDate(date)}
                      className={`snap-start shrink-0 flex flex-col items-center justify-center px-6 py-3 rounded-full transition-transform hover:scale-105 ${
                        isSelected 
                          ? 'bg-primary-container text-white crimson-glow' 
                          : 'glass-panel text-on-surface-variant hover:text-white border border-white/5'
                      }`}
                    >
                      <span className="font-label-md text-label-md uppercase tracking-wider opacity-80 mb-1">{getDayName(date, idx)}</span>
                      <span className={`font-headline-md text-headline-md ${isSelected ? '' : 'text-on-surface'}`}>{date.getDate()}</span>
                    </button>
                  );
                })}
              </div>
            </section>

            {/* Theater List */}
            <section className="flex flex-col gap-6">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-2">Theaters</h2>
              
              {loading ? (
                <div className="flex justify-center py-12">
                  <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
                </div>
              ) : Object.keys(showtimesByTheatre).length === 0 ? (
                <p className="text-on-surface-variant font-body-md glass-panel p-6 rounded-xl text-center">No showtimes available for this date.</p>
              ) : (
                Object.values(showtimesByTheatre).map(({ theatre, showtimes }) => (
                  <div key={theatre.id} className="glass-panel p-6 rounded-xl flex flex-col gap-4">
                    <div className="flex justify-between items-start">
                      <div>
                        <h3 className="font-headline-md text-headline-md text-on-surface">{theatre.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant flex items-center gap-1 mt-1">
                          <span className="material-symbols-outlined text-[16px]">location_on</span> {theatre.lat}, {theatre.lon}
                        </p>
                      </div>
                    </div>
                    
                    <div className="mt-2">
                      <h4 className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider mb-3">Standard</h4>
                      <div className="flex flex-wrap gap-3">
                        {showtimes.map(st => {
                          const time = new Date(st.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
                          return (
                            <Link 
                              key={st.id}
                              to={`/checkout/${st.id}`} 
                              className="px-4 py-2 glass-panel rounded-lg font-label-md text-label-md text-on-surface hover:border-primary hover:text-primary transition-colors focus:ring-2 focus:ring-primary"
                            >
                              {time}
                            </Link>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                ))
              )}
            </section>
          </div>
          
          {/* Right Column: Cast & Extras */}
          <div className="lg:col-span-4 flex flex-col gap-8 mt-8 lg:mt-0">
            {/* Cast Section */}
            <section className="glass-panel p-6 rounded-xl">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Top Cast</h2>
              <div className="flex flex-col gap-4">
                {(movie?.cast || []).length > 0 ? (
                  movie.cast.map((actor, idx) => (
                    <div key={idx} className="flex items-center gap-4">
                      {actor.img ? (
                        <img className="w-14 h-14 rounded-full object-cover border border-white/10" src={actor.img} alt={actor.name} />
                      ) : (
                        <div className="w-14 h-14 rounded-full border border-white/10 bg-white/5 flex items-center justify-center">
                          <span className="material-symbols-outlined text-white/50">person</span>
                        </div>
                      )}
                      <div>
                        <h3 className="font-body-lg text-body-lg text-on-surface">{actor.name}</h3>
                        <p className="font-body-md text-body-md text-on-surface-variant">{actor.role}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-on-surface-variant text-sm">Cast information unavailable.</p>
                )}
              </div>
            </section>
          </div>
        </div>
      </main>

      {/* Trailer Modal */}
      {isTrailerOpen && movie?.trailerUrl && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[100] flex flex-col justify-center items-center p-4">
          <button 
            onClick={() => setIsTrailerOpen(false)}
            className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors glass-panel p-2 rounded-full flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[32px]">close</span>
          </button>
          
          <div className="w-full max-w-5xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10">
            <iframe 
              width="100%" 
              height="100%" 
              src={movie.trailerUrl} 
              title="YouTube video player" 
              frameBorder="0" 
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
              referrerPolicy="strict-origin-when-cross-origin" 
              allowFullScreen
            ></iframe>
          </div>
        </div>
      )}
    </div>
  );
}
