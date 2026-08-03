import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import apiClient from '../apiClient';

export default function Cinemas() {
  const [theatres, setTheatres] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const fetchTheatres = async () => {
      try {
        let url = '/api/search/theatres?lat=26.8467&lon=80.9462';
        if (searchQuery) url += `&query=${searchQuery}`;
        const response = await apiClient.get(url);
        setTheatres(Array.isArray(response.data) ? response.data : (response.data.hits || []));
      } catch (err) {
        console.error('Failed to fetch theatres', err);
      } finally {
        setLoading(false);
      }
    };
    
    const delayDebounceFn = setTimeout(() => {
      fetchTheatres();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery]);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative pt-24">
      <Header />
      
      <main className="flex-grow pb-24 md:pb-12 max-w-container-max mx-auto px-6 md:px-12 w-full">
        <div className="mb-12 border-b border-white/10 pb-8 mt-8 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-tight">Our Cinemas</h1>
            <p className="text-on-surface-variant font-body-md mt-2">Experience movies in the highest quality across our nationwide locations.</p>
          </div>
          <div className="w-full md:w-auto relative">
            <span className="material-symbols-outlined absolute left-4 top-1/2 -translate-y-1/2 text-white/40">search</span>
            <input 
              type="text" 
              placeholder="Search by city or zip..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full md:w-80 bg-surface-container border border-white/10 rounded-full pl-12 pr-4 py-3 text-white focus:outline-none focus:border-primary transition-all shadow-inner shadow-white/5"
            />
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-20"><span className="w-10 h-10 border-4 border-primary/30 border-t-primary rounded-full animate-spin"></span></div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {theatres.map(theatre => (
              <Link to={`/theatre/${theatre.id || theatre._id}`} key={theatre.id || theatre._id} className="block glass-panel p-6 rounded-2xl hover:-translate-y-2 transition-transform duration-300 group cursor-pointer border border-white/10 hover:border-primary/50 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-3xl -mr-16 -mt-16 group-hover:bg-primary/20 transition-colors"></div>
                <div className="flex justify-between items-start mb-4 relative z-10">
                  <div className="w-12 h-12 rounded-xl bg-surface-container flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-white transition-colors duration-300 shadow-lg">
                    <span className="material-symbols-outlined text-[24px]">location_on</span>
                  </div>
                  <span className="text-xs font-label-md px-2 py-1 bg-white/5 rounded text-white/60">OPEN</span>
                </div>
                <h2 className="font-headline-md text-2xl text-white mb-2 relative z-10">{theatre.name || theatre._source?.name}</h2>
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
              </Link>
            ))}
          </div>
        )}
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
