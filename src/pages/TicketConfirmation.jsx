import { Link, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { QRCodeSVG } from 'qrcode.react';

export default function TicketConfirmation() {
  const { bookingId } = useParams();
  const [ticketDetails, setTicketDetails] = useState(null);
  const [showtime, setShowtime] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchTicketData = async () => {
      try {
        setLoading(true);
        // 1. Fetch booking details
        const bookingRes = await apiClient.get(`/api/bookings/status/${bookingId}`);
        const bookingData = bookingRes.data;
        
        if (bookingData.status !== 'CONFIRMED') {
          setError('Booking is not confirmed yet. Status: ' + bookingData.status);
          setLoading(false);
          return;
        }
        
        setTicketDetails(bookingData);

        // 2. Fetch showtime details
        if (bookingData.showtimeId) {
          const showtimeRes = await apiClient.get(`/api/catalog/showtimes/${bookingData.showtimeId}`);
          setShowtime(showtimeRes.data);
        }
        
        setLoading(false);
      } catch (err) {
        console.error('Failed to fetch ticket data', err);
        setError('Failed to load ticket details.');
        setLoading(false);
      }
    };
    if (bookingId) fetchTicketData();
  }, [bookingId]);

  if (loading) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center">
        <span className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></span>
        <h2 className="text-xl font-headline-md text-on-surface animate-pulse">Loading Ticket...</h2>
      </div>
    );
  }

  if (error || !ticketDetails) {
    return (
      <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-4">
        <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-6 rounded-xl flex flex-col items-center gap-3 text-center">
          <span className="material-symbols-outlined text-[48px]">error</span>
          <h2 className="text-xl font-headline-md">Unable to Load Ticket</h2>
          <p className="text-sm font-label-md mt-2 max-w-sm">{error || "Ticket not found."}</p>
          <Link to="/" className="mt-4 px-6 py-2 bg-surface-container-high rounded-lg hover:bg-surface-container-highest transition-colors">Go Home</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col justify-center items-center px-4 pt-12 pb-24">
      <div className="w-full max-w-md flex flex-col relative animate-fade-in">
        {/* Ticket Top */}
        <div className="bg-surface-container-low rounded-t-3xl p-8 border border-b-0 border-white/10 relative overflow-hidden shadow-2xl flex flex-col items-center">
          {/* Background blur/gradient */}
          <div className="absolute top-0 inset-x-0 h-1/2 bg-gradient-to-b from-primary/20 to-transparent"></div>
          
          <h1 className="font-display text-3xl text-primary relative z-10 mb-1 text-center">{showtime?.movie?.title || 'Movie Ticket'}</h1>
          <p className="text-on-surface-variant font-label-md relative z-10 text-center">{showtime?.theatre?.name || 'Cineplex Theatre'}</p>
          
          <div className="mt-8 flex justify-center w-full relative z-10 bg-white p-4 rounded-xl">
            <QRCodeSVG 
              value={`CINEPLEX_TICKET:${ticketDetails.id}`} 
              size={160} 
              level={"H"}
              bgColor={"#ffffff"}
              fgColor={"#000000"}
            />
          </div>
          <p className="font-mono text-xs text-on-surface-variant mt-3 tracking-widest relative z-10">{ticketDetails.id}</p>
        </div>

        {/* Ticket Divider (Perforated) */}
        <div className="flex items-center w-full relative -my-3 z-20">
          <div className="w-6 h-6 rounded-full bg-surface absolute -left-3 border border-white/10 border-l-0 border-t-transparent border-b-transparent"></div>
          <div className="flex-1 border-b-2 border-dashed border-white/20 mx-4"></div>
          <div className="w-6 h-6 rounded-full bg-surface absolute -right-3 border border-white/10 border-r-0 border-t-transparent border-b-transparent"></div>
        </div>

        {/* Ticket Bottom */}
        <div className="bg-surface-container-low rounded-b-3xl p-8 border border-t-0 border-white/10 shadow-2xl z-10 relative">
          <div className="grid grid-cols-2 gap-y-6 gap-x-4 font-body-md text-sm">
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Date</p>
              <p className="text-on-surface font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString() : 'N/A'}</p>
            </div>
            <div>
              <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Time</p>
              <p className="text-on-surface font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</p>
            </div>
            <div className="col-span-2">
              <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Seats</p>
              <p className="text-on-surface font-label-md text-lg">
                {ticketDetails.seats ? JSON.parse(ticketDetails.seats).join(', ') : 'N/A'}
              </p>
            </div>
            <div className="col-span-2 border-t border-white/10 pt-4 flex justify-between items-end">
               <div>
                 <p className="text-on-surface-variant text-xs uppercase tracking-wider mb-1">Total Amount</p>
                 <p className="text-primary font-display text-2xl">₹{ticketDetails.totalAmount}</p>
               </div>
               <div className="bg-green-500/10 text-green-400 px-3 py-1 rounded-full text-xs font-label-md border border-green-500/20">PAID</div>
            </div>
          </div>
          
          <Link to="/" className="mt-8 block text-center w-full bg-primary hover:bg-inverse-primary text-white font-label-md py-4 rounded-xl transition-all duration-300 shadow-[0_0_15px_rgba(225,29,72,0.4)] hover:shadow-[0_0_25px_rgba(225,29,72,0.6)]">
            Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
}
