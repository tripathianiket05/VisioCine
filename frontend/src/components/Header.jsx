import { Link, useLocation } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getAccessToken, logout } from '../apiClient';

export default function Header() {
  const [locationName, setLocationName] = useState('Detecting...');
  const [scrolled, setScrolled] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());
  const [user, setUser] = useState(null);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const { pathname } = useLocation();

  useEffect(() => {
    const handleAuthChange = (e) => {
      setIsAuthenticated(e.detail.isAuthenticated);
      setUser(e.detail.user || null);
    };
    window.addEventListener('auth-change', handleAuthChange);
    return () => window.removeEventListener('auth-change', handleAuthChange);
  }, []);

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
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-rose-600 flex items-center justify-center shadow-lg shadow-primary/30 group-hover:shadow-primary/50 transition-all duration-300 group-hover:scale-105">
                <span className="material-symbols-outlined text-white text-[24px]">movie</span>
              </div>
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
            <div className="hidden lg:flex items-center gap-2 bg-white/5 hover:bg-white/10 border border-white/10 backdrop-blur-md px-4 py-2 rounded-full cursor-pointer transition-all duration-300 group shadow-inner shadow-white/5">
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
                        to="/profile"
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
        <div className="fixed inset-0 bg-black/95 backdrop-blur-xl z-[100] flex flex-col items-center pt-32 px-4 transition-all duration-300 animate-in fade-in zoom-in-95">
          <button 
            onClick={() => setIsSearchOpen(false)}
            className="absolute top-8 right-8 text-white/40 hover:text-white transition-colors"
          >
            <span className="material-symbols-outlined text-[36px]">close</span>
          </button>
          
          <div className="w-full max-w-4xl flex items-center border-b-2 border-primary/50 pb-4">
            <span className="material-symbols-outlined text-[36px] text-primary mr-4">search</span>
            <input 
              type="text" 
              placeholder="SEARCH MOVIES, CINEMAS..." 
              className="bg-transparent text-3xl md:text-5xl lg:text-6xl text-white placeholder-white/20 outline-none w-full font-display uppercase tracking-wider"
              autoFocus
            />
          </div>
          
          <div className="w-full max-w-4xl mt-12 flex gap-4 text-white/40 font-label-md uppercase tracking-widest text-sm">
            <span>Trending:</span>
            <Link to="#" className="hover:text-white transition-colors">Dune: Part Two</Link>
            <span>&bull;</span>
            <Link to="#" className="hover:text-white transition-colors">IMAX</Link>
            <span>&bull;</span>
            <Link to="#" className="hover:text-white transition-colors">Oppenheimer</Link>
          </div>
        </div>
      )}
    </>
  );
}
