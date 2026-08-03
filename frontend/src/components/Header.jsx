import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient, { getAccessToken, logout } from '../apiClient';

function levenshteinDistance(s1, s2) {
  if (s1.length < s2.length) return levenshteinDistance(s2, s1);
  if (s2.length === 0) return s1.length;
  
  let previousRow = Array.from({ length: s2.length + 1 }, (_, i) => i);
  for (let i = 0; i < s1.length; i++) {
    const currentRow = [i + 1];
    for (let j = 0; j < s2.length; j++) {
      const insertions = previousRow[j + 1] + 1;
      const deletions = currentRow[j] + 1;
      const substitutions = previousRow[j] + (s1[i] === s2[j] ? 0 : 1);
      currentRow.push(Math.min(insertions, deletions, substitutions));
    }
    previousRow = currentRow;
  }
  return previousRow[s2.length];
}

function fuzzyMatch(query, text) {
  const q = query.toLowerCase().replace(/[^a-z0-9]/g, '');
  const t = text.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (!q) return false;
  if (t.includes(q)) return true;
  if (q.length <= 3) return false;
  
  const maxTypos = q.length > 5 ? 2 : 1;
  for (let i = 0; i <= t.length - q.length; i++) {
    // Check substrings of lengths close to query length (q.length, q.length + 1)
    for (let lenOffset = 0; lenOffset <= 1; lenOffset++) {
      if (i + q.length + lenOffset <= t.length) {
        const substr = t.substring(i, i + q.length + lenOffset);
        if (levenshteinDistance(q, substr) <= maxTypos) return true;
      }
    }
  }
  return false;
}

export default function Header() {
  const [locationName, setLocationName] = useState('Detecting...');
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [movieResults, setMovieResults] = useState([]);
  const [cinemaResults, setCinemaResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [allMovies, setAllMovies] = useState([]);
  const { pathname } = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleAuthChange = (e) => {
      setIsAuthenticated(e.detail.isAuthenticated);
      setUser(e.detail.user || null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

  useEffect(() => {
    if (isSearchOpen && allMovies.length === 0) {
      apiClient.get('/api/catalog/movies').then(res => setAllMovies(res.data)).catch(console.error);
    }
  }, [isSearchOpen]);

  useEffect(() => {
    if (!searchQuery) {
      setMovieResults([]);
      setCinemaResults([]);
      return;
    }
    
    setIsSearching(true);
    
    const delayDebounceFn = setTimeout(async () => {
      const q = searchQuery.toLowerCase();
      const filteredMovies = allMovies.filter(m => fuzzyMatch(q, m.title));
      setMovieResults(filteredMovies.slice(0, 4));
      
      try {
        const res = await apiClient.get(`/api/search/theatres?lat=26.8467&lon=80.9462&query=${searchQuery}`);
        setCinemaResults(Array.isArray(res.data) ? res.data.slice(0, 4) : (res.data.hits || []).slice(0, 4));
      } catch (e) {
        console.error(e);
      }
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, allMovies]);

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const { latitude, longitude } = position.coords;
            const response = await fetch(`https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`);
            const data = await response.json();
            const city = data.city || data.locality || 'Unknown City';
            const state = data.principalSubdivision || '';
            setLocationName(state ? `${city}, ${state}` : city);
          } catch (error) {
            setLocationName('New York, NY');
          }
        },
        () => setLocationName('New York, NY')
      );
    } else {
      setLocationName('New York, NY');
    }
  }, []);

  const navLinks = [
    { name: 'Movies', path: '/' },
    { name: 'Cinemas', path: '/cinemas' },
    { name: 'Offers', path: '/offers' }
  ];

  return (
    <>
      <header className={`fixed top-0 w-full z-50 transition-all duration-500 ${scrolled ? 'bg-black/70 backdrop-blur-2xl border-b border-white/10 shadow-2xl py-3' : 'bg-gradient-to-b from-black/80 via-black/40 to-transparent py-5'}`}>
        <div className="flex justify-between items-center px-6 md:px-12 max-w-[1600px] mx-auto">
          
          <div className="flex items-center gap-10">
            <Link to="/" className="flex items-center gap-3 group">
              <img 
                src="/logo.svg" 
                alt="VisioCine Logo" 
                className="h-12 w-auto object-contain drop-shadow-2xl group-hover:scale-105 transition-transform duration-300"
              />
              <span className="font-display text-2xl md:text-3xl text-white tracking-widest uppercase bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                VISIOCINE
              </span>
            </Link>

            <nav className="hidden md:flex items-center gap-2">
              {navLinks.map((link) => {
                const isActive = pathname === link.path;
                return (
                  <Link 
                    key={link.name} 
                    to={link.path} 
                    className={`relative px-4 py-2 font-label-md text-sm uppercase tracking-wider transition-all duration-300 rounded-full hover:bg-white/10 ${isActive ? 'text-white' : 'text-white/60 hover:text-white'}`}
                  >
                    {link.name}
                    {isActive && <span className="absolute bottom-1 left-1/2 -translate-x-1/2 w-1.5 h-1.5 bg-primary rounded-full shadow-[0_0_8px_rgba(225,29,72,0.8)]"></span>}
                  </Link>
                );
              })}
            </nav>
          </div>

          <div className="flex items-center gap-5">
            <div 
              onClick={() => navigate('/cinemas')}
              className="hidden lg:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full cursor-pointer transition-all duration-300 group shadow-inner shadow-white/5"
            >
              <span className="material-symbols-outlined text-[18px] text-primary group-hover:animate-bounce">location_on</span>
              <span className="text-white/90 font-label-md text-sm max-w-[120px] truncate">{locationName}</span>
              <span className="material-symbols-outlined text-[18px] text-white/40 group-hover:text-white/80 transition-colors">expand_more</span>
            </div>

            <button 
              onClick={() => setIsSearchOpen(true)}
              aria-label="Search" 
              className="w-10 h-10 rounded-full flex items-center justify-center text-white/80 hover:text-primary hover:bg-primary/10 transition-all duration-300"
            >
              <span className="material-symbols-outlined text-[22px]">search</span>
            </button>
            
            <div 
              className="relative group cursor-pointer block"
              onMouseEnter={() => isAuthenticated && setIsProfileMenuOpen(true)}
              onMouseLeave={() => isAuthenticated && setIsProfileMenuOpen(false)}
            >
              {isAuthenticated ? (
                <>
                  <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-white/20 group-hover:border-primary bg-primary/20 transition-colors duration-300 shadow-lg relative z-10 flex items-center justify-center">
                    <span className="font-display text-white text-xl uppercase">{user?.name ? user.name[0] : 'U'}</span>
                  </div>
                  <div className="absolute inset-0 rounded-full shadow-[0_0_15px_rgba(225,29,72,0)] group-hover:shadow-[0_0_20px_rgba(225,29,72,0.6)] transition-shadow duration-300 pointer-events-none z-0"></div>
                  
                  {isProfileMenuOpen && (
                    <div className="absolute top-full right-0 mt-2 w-48 bg-surface-container-low border border-white/10 rounded-xl shadow-2xl py-2 z-50 glass-panel">
                      <div className="px-4 py-2 border-b border-white/10 mb-1">
                        <p className="text-white font-label-md truncate">{user?.name || 'User'}</p>
                        <p className="text-white/50 text-xs truncate">{user?.email || ''}</p>
                      </div>
                      <Link 
                        to="/profile?tab=bookings"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-white/80 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">confirmation_number</span>
                        My Bookings
                      </Link>
                      <Link 
                        to="/profile?tab=watchlist"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-white/80 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">favorite</span>
                        Watchlist
                      </Link>
                      <Link 
                        to="/profile?tab=profile"
                        onClick={() => setIsProfileMenuOpen(false)}
                        className="w-full text-left px-4 py-2 text-white/80 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">account_circle</span>
                        My Profile
                      </Link>
                      <button 
                        onClick={() => {
                          setIsProfileMenuOpen(false);
                          logout();
                        }}
                        className="w-full text-left px-4 py-2 text-white/80 hover:text-primary hover:bg-white/5 transition-colors font-body-md flex items-center gap-2"
                      >
                        <span className="material-symbols-outlined text-[18px]">logout</span>
                        Sign Out
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <Link to="/login">
                  <div className="w-10 h-10 rounded-full bg-black/60 border-2 border-white/10 group-hover:border-primary transition-colors duration-300 flex items-center justify-center shadow-lg">
                    <span className="material-symbols-outlined text-white/40 group-hover:text-primary transition-colors">person</span>
                  </div>
                </Link>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Fullscreen Search Modal */}
      {isSearchOpen && (
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center pt-32 px-4 transition-all duration-300 animate-in fade-in zoom-in-95 overflow-y-auto">
          <button 
            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); }}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[36px]">close</span>
          </button>
          
          <div className="w-full max-w-4xl flex items-center border-b-2 border-primary/50 pb-4 shrink-0">
            <span className="material-symbols-outlined text-[36px] text-primary mr-4">search</span>
            <input 
              type="text" 
              placeholder="SEARCH MOVIES, CINEMAS..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="bg-transparent text-3xl md:text-5xl lg:text-6xl text-white placeholder-white/20 outline-none w-full font-display uppercase tracking-wider"
              autoFocus
            />
          </div>
          
          {searchQuery ? (
            <div className="w-full max-w-4xl mt-8 flex flex-col gap-8 text-left pb-12 shrink-0">
              {isSearching ? (
                <div className="flex items-center gap-3 text-white/40 font-label-md">
                  <span className="w-5 h-5 border-2 border-white/20 border-t-white/60 rounded-full animate-spin"></span>
                  Searching...
                </div>
              ) : (
                <>
                  {movieResults.length > 0 && (
                    <div>
                      <h3 className="text-white/60 font-label-md uppercase tracking-widest text-sm mb-4">Movies</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                        {movieResults.map(m => (
                          <div 
                            key={m.id} 
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); navigate(`/movie/${m.id}`); }}
                            className="flex items-center gap-4 bg-surface-container-low/50 hover:bg-surface-container border border-white/5 hover:border-primary/50 p-3 rounded-lg cursor-pointer transition-all"
                          >
                            <img src={m.posterUrl} alt={m.title} className="w-12 h-16 object-cover rounded" />
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-label-md truncate">{m.title}</h4>
                              <p className="text-white/40 text-xs truncate">{m.genre}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {cinemaResults.length > 0 && (
                    <div>
                      <h3 className="text-white/60 font-label-md uppercase tracking-widest text-sm mb-4 mt-2">Cinemas</h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        {cinemaResults.map(c => (
                          <div 
                            key={c.id || c._id} 
                            onClick={() => { setIsSearchOpen(false); setSearchQuery(''); navigate(`/cinemas`); }}
                            className="flex items-center gap-4 bg-surface-container-low/50 hover:bg-surface-container border border-white/5 hover:border-primary/50 p-4 rounded-lg cursor-pointer transition-all"
                          >
                            <div className="w-10 h-10 rounded bg-primary/20 flex items-center justify-center text-primary shrink-0">
                              <span className="material-symbols-outlined">location_on</span>
                            </div>
                            <div className="flex-1 min-w-0">
                              <h4 className="text-white font-label-md truncate">{c.name || c._source?.name}</h4>
                              <p className="text-white/40 text-xs truncate">{c.address || c._source?.address}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {movieResults.length === 0 && cinemaResults.length === 0 && (
                     <div className="text-white/40 font-label-md">No results found for "{searchQuery}"</div>
                  )}
                </>
              )}
            </div>
          ) : (
            <div className="w-full max-w-4xl mt-12 flex flex-wrap gap-4 text-white/40 font-label-md uppercase tracking-widest text-sm shrink-0">
              <span>Trending:</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => setSearchQuery('Dune')}>Dune: Part Two</span>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => setSearchQuery('IMAX')}>IMAX</span>
              <span>&bull;</span>
              <span className="hover:text-white transition-colors cursor-pointer" onClick={() => setSearchQuery('Oppenheimer')}>Oppenheimer</span>
            </div>
          )}
        </div>
      )}
    </>
  );
}
