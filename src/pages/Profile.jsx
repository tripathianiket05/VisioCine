import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';
import apiClient, { getCurrentUser } from '../apiClient';

export default function Profile() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const user = getCurrentUser();

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }

    const fetchBookings = async () => {
      try {
        setLoading(true);
        // Fetch all bookings for the user
        const response = await apiClient.get('/api/bookings');
        
        // Enhance bookings with movie and theatre details
        const enhancedBookings = await Promise.all(
          response.data.map(async (booking) => {
            try {
              const stRes = await apiClient.get(`/api/catalog/showtimes/${booking.showtimeId}`);
              return { ...booking, showtime: stRes.data };
            } catch (err) {
              return { ...booking, showtime: null };
            }
          })
        );
        
        setBookings(enhancedBookings);
      } catch (err) {
        console.error('Failed to fetch bookings', err);
        setError('Failed to load your booking history.');
      } finally {
        setLoading(false);
      }
    };

    fetchBookings();
  }, [user, navigate]);

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative">
      <Header />
      
      <main className="flex-grow max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-24 w-full">
        <h1 className="font-headline-lg-mobile md:font-headline-lg text-headline-lg-mobile md:text-headline-lg text-on-surface mb-8">My Profile</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Sidebar / User Info */}
          <div className="lg:col-span-1">
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center text-center">
              <div className="w-24 h-24 bg-primary/20 text-primary rounded-full flex items-center justify-center text-4xl font-display mb-4">
                {user?.name?.charAt(0).toUpperCase()}
              </div>
              <h2 className="font-headline-md text-xl text-white mb-1">{user?.name}</h2>
              <p className="text-on-surface-variant font-body-md text-sm">{user?.email}</p>
            </div>
          </div>
          
          {/* Main Content / Booking History */}
          <div className="lg:col-span-3">
            <h2 className="font-headline-md text-2xl text-white mb-6">Booking History</h2>
            
            {loading ? (
              <div className="flex justify-center py-12">
                <span className="w-8 h-8 border-2 border-primary/30 border-t-primary rounded-full animate-spin"></span>
              </div>
            ) : error ? (
              <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl">
                {error}
              </div>
            ) : bookings.length === 0 ? (
              <div className="glass-panel p-8 rounded-2xl text-center">
                <span className="material-symbols-outlined text-[48px] text-on-surface-variant mb-4">local_activity</span>
                <h3 className="font-headline-md text-xl text-white mb-2">No bookings yet</h3>
                <p className="text-on-surface-variant mb-6">You haven't booked any movies yet. Let's fix that!</p>
                <Link to="/" className="bg-primary hover:bg-inverse-primary text-white font-label-md py-3 px-6 rounded-lg transition-all">
                  Browse Movies
                </Link>
              </div>
            ) : (
              <div className="flex flex-col gap-4">
                {bookings.map((booking) => {
                  const { showtime } = booking;
                  const movie = showtime?.movie;
                  const theatre = showtime?.theatre;
                  const seats = booking.seatIds; // It's a JSON array in the DB now
                  const parsedSeats = typeof seats === 'string' ? JSON.parse(seats) : seats;
                  const amount = (parsedSeats.length * 250 + (parsedSeats.length > 0 ? 40 : 0)).toFixed(2);
                  
                  return (
                    <div key={booking.id} className="glass-panel p-4 md:p-6 rounded-2xl border border-white/5 flex flex-col md:flex-row gap-6 hover:border-white/10 transition-colors">
                      {/* Movie Poster */}
                      <div className="w-full md:w-32 h-48 md:h-auto shrink-0 rounded-lg overflow-hidden bg-surface-container-high relative">
                        {movie?.posterUrl ? (
                          <img src={movie.posterUrl} alt={movie.title} className="w-full h-full object-cover" />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center">
                            <span className="material-symbols-outlined text-white/20 text-4xl">movie</span>
                          </div>
                        )}
                      </div>
                      
                      {/* Booking Details */}
                      <div className="flex-grow flex flex-col">
                        <div className="flex justify-between items-start mb-2">
                          <h3 className="font-headline-md text-xl text-white">{movie?.title || 'Unknown Movie'}</h3>
                          <span className={`px-2 py-1 rounded text-xs font-label-md ${
                            booking.status === 'CONFIRMED' ? 'bg-green-500/20 text-green-400' :
                            booking.status === 'PENDING' ? 'bg-yellow-500/20 text-yellow-400' :
                            'bg-red-500/20 text-red-400'
                          }`}>
                            {booking.status}
                          </span>
                        </div>
                        
                        <p className="text-on-surface-variant font-body-md text-sm mb-4">
                          {theatre?.name || 'Unknown Theatre'}
                        </p>
                        
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <div>
                            <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Date</p>
                            <p className="font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString() : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Time</p>
                            <p className="font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Seats</p>
                            <p className="font-label-md">{parsedSeats.join(', ') || 'N/A'}</p>
                          </div>
                          <div>
                            <p className="text-on-surface-variant text-xs mb-1 uppercase tracking-wider">Amount</p>
                            <p className="font-label-md text-primary">₹{amount}</p>
                          </div>
                        </div>
                        
                        <div className="mt-auto pt-4 border-t border-white/10 flex justify-between items-center">
                          <span className="text-on-surface-variant text-xs font-mono">ID: {booking.id}</span>
                          <span className="text-on-surface-variant text-xs">
                            Booked on {new Date(booking.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
