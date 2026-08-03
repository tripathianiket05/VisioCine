import { Link, useNavigate, useParams } from 'react-router-dom';
import { useState, useEffect } from 'react';
import apiClient from '../apiClient';
import { QRCodeSVG } from 'qrcode.react';

export default function Checkout() {
  const navigate = useNavigate();
  const { showtimeId } = useParams();
  const [selectedSeats, setSelectedSeats] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [bookingStatus, setBookingStatus] = useState(null); // 'PENDING', 'CONFIRMED', 'FAILED'
  const [ticketDetails, setTicketDetails] = useState(null);

  const [showtime, setShowtime] = useState(null);

  const [bookedSeats, setBookedSeats] = useState([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await apiClient.get(`/api/catalog/showtimes/${showtimeId}`);
        setShowtime(response.data);
        
        const bookedResponse = await apiClient.get(`/api/bookings/showtimes/${showtimeId}/booked-seats`);
        setBookedSeats(bookedResponse.data.bookedSeats || []);
      } catch (err) {
        console.error('Failed to fetch showtime or booked seats', err);
      }
    };
    if (showtimeId) fetchData();
  }, [showtimeId]);

  // Mock seat layout
  const rows = ['A', 'B', 'C', 'D', 'E'];
  const cols = [1, 2, 3, 4, 5, 6, 7, 8];

  const toggleSeat = (seatId) => {
    if (selectedSeats.includes(seatId)) {
      setSelectedSeats(selectedSeats.filter(id => id !== seatId));
    } else {
      if (selectedSeats.length < 6) {
        setSelectedSeats([...selectedSeats, seatId]);
      }
    }
  };

  const [bookingId, setBookingId] = useState(null);
  const [paymentForm, setPaymentForm] = useState({ cardNumber: '', expiry: '', cvv: '', upiId: '' });
  const [paymentMethod, setPaymentMethod] = useState('credit_card');
  const [couponCode, setCouponCode] = useState('');
  const [discount, setDiscount] = useState(0);
  const [couponApplied, setCouponApplied] = useState(false);
  const [couponError, setCouponError] = useState('');

  const handleApplyCoupon = () => {
    if (couponCode.toUpperCase() === 'CINEPLEX50') {
      setDiscount(50);
      setCouponApplied(true);
      setCouponError('');
    } else if (couponCode.toUpperCase() === 'WELCOME10') {
      const subtotal = selectedSeats.length * 250 + (selectedSeats.length > 0 ? 40 : 0);
      setDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
      setCouponError('');
    } else {
      setCouponError('Invalid coupon code');
      setCouponApplied(false);
      setDiscount(0);
    }
  };

  const handleCheckout = async () => {
    setLoading(true);
    setError(null);
    try {
      // 1. Lock seats and initiate saga
      const subtotal = selectedSeats.length * 250;
      const convenienceFee = selectedSeats.length > 0 ? 40 : 0;
      const finalTotal = subtotal + convenienceFee - discount;
      
      const response = await apiClient.post('/api/bookings/lock-seats', {
        showtimeId: showtimeId,
        seatIds: selectedSeats,
        totalAmount: finalTotal
      });
      
      setBookingId(response.data.booking.id);
      setBookingStatus('PAYING');
      setLoading(false);
      
    } catch (err) {
      setLoading(false);
      if (err.response?.status === 409) {
        setError("One or more selected seats were just taken! Please select different seats.");
      } else {
        setError(err.response?.data?.error || "An error occurred during booking.");
      }
    }
  };

  const handlePayment = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      // Submit dummy payment form
      await apiClient.post('/api/payments/process', {
        bookingId,
        method: paymentMethod,
        ...paymentForm
      });

      // Poll for status
      const interval = setInterval(async () => {
        try {
          const statusRes = await apiClient.get(`/api/bookings/status/${bookingId}`);
          if (statusRes.data.status === 'CONFIRMED') {
            clearInterval(interval);
            navigate(`/ticket/${bookingId}`);
          } else if (statusRes.data.status === 'FAILED') {
            clearInterval(interval);
            setBookingStatus('FAILED');
            setError('Booking failed during payment processing.');
            setLoading(false);
          }
        } catch (pollErr) {
          console.error("Polling error", pollErr);
        }
      }, 2000);
      
    } catch (err) {
      setLoading(false);
      setError(err.response?.data?.error || "Payment initiation failed.");
    }
  };



  return (
    <div className="bg-surface text-on-surface min-h-screen pb-24 md:pb-12 relative">
      
      {/* Loading Overlay */}
      {loading && (
        <div className="fixed inset-0 bg-surface/90 backdrop-blur-sm z-[100] flex flex-col justify-center items-center">
          <span className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4"></span>
          <h2 className="text-xl font-headline-md text-on-surface animate-pulse">Processing Payment...</h2>
          <p className="text-on-surface-variant mt-2 text-sm">Please don't close this window.</p>
        </div>
      )}

      {/* Mini Nav */}
      <div className="fixed top-0 left-0 w-full z-50 bg-surface/80 backdrop-blur-md border-b border-white/5">
        <div className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop py-4 flex justify-between items-center">
          <button 
            onClick={() => navigate(-1)} 
            className="glass-panel rounded-full p-2 text-on-surface hover:text-primary transition-colors flex items-center justify-center"
          >
            <span className="material-symbols-outlined text-[24px]">arrow_back</span>
          </button>
          <h1 className="font-headline-md text-headline-md">Checkout</h1>
          <div className="w-10"></div> {/* Spacer for centering */}
        </div>
      </div>

      <main className="w-full max-w-container-max mx-auto px-margin-mobile md:px-margin-desktop pt-24 mt-8 grid grid-cols-1 lg:grid-cols-12 gap-gutter">
        
        {/* Left Column: Seat Selection & Details */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-4 rounded-xl flex items-start gap-3">
              <span className="material-symbols-outlined text-[20px]">error</span>
              <p className="text-sm font-label-md mt-0.5">{error}</p>
            </div>
          )}

          {bookingStatus === 'PAYING' ? (
            <section className="glass-panel p-6 rounded-xl border border-white/5 animate-fade-in">
              <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Payment Details</h2>
              <div className="bg-primary/10 border border-primary/30 p-4 rounded-lg mb-6 flex gap-3">
                <span className="material-symbols-outlined text-primary">info</span>
                <p className="text-sm text-on-surface-variant font-label-md">
                  This is a mock payment form. In a real application, raw credit card fields would be handled by a secure PCI-compliant provider (e.g., Stripe Elements).
                </p>
              </div>
              <form onSubmit={handlePayment} className="flex flex-col gap-4">
                {/* Dummy Payment Method Selector */}
                <div className="flex gap-2 mb-4">
                  {['credit_card', 'upi', 'neft', 'wallets'].map(method => (
                    <button
                      key={method}
                      type="button"
                      onClick={() => setPaymentMethod(method)}
                      className={`flex-1 py-2 rounded-lg font-label-md text-xs transition-colors border ${
                        paymentMethod === method 
                          ? 'bg-primary text-white border-primary' 
                          : 'bg-surface-container-low text-on-surface-variant border-white/10 hover:border-white/30'
                      }`}
                    >
                      {method.replace('_', ' ').toUpperCase()}
                    </button>
                  ))}
                </div>

                {paymentMethod === 'credit_card' && (
                  <>
                    <div>
                      <label className="block text-sm font-label-md text-on-surface-variant mb-2">Dummy Card Number</label>
                      <input
                        type="text"
                        required
                        placeholder="xxxx xxxx xxxx xxxx"
                        maxLength={16}
                        value={paymentForm.cardNumber}
                        onChange={(e) => setPaymentForm({...paymentForm, cardNumber: e.target.value})}
                        className="w-full bg-surface-container-low border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-label-md text-on-surface-variant mb-2">Expiry Date</label>
                        <input
                          type="text"
                          required
                          placeholder="MM/YY"
                          maxLength={5}
                          value={paymentForm.expiry}
                          onChange={(e) => setPaymentForm({...paymentForm, expiry: e.target.value})}
                          className="w-full bg-surface-container-low border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-label-md text-on-surface-variant mb-2">CVV</label>
                        <input
                          type="text"
                          required
                          placeholder="xxx"
                          maxLength={4}
                          value={paymentForm.cvv}
                          onChange={(e) => setPaymentForm({...paymentForm, cvv: e.target.value})}
                          className="w-full bg-surface-container-low border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
                        />
                      </div>
                    </div>
                  </>
                )}

                {paymentMethod === 'upi' && (
                  <div>
                    <label className="block text-sm font-label-md text-on-surface-variant mb-2">Dummy UPI ID</label>
                    <input
                      type="text"
                      required
                      placeholder="username@bank"
                      value={paymentForm.upiId || ''}
                      onChange={(e) => setPaymentForm({...paymentForm, upiId: e.target.value})}
                      className="w-full bg-surface-container-low border border-white/10 rounded-lg p-3 text-on-surface focus:border-primary focus:outline-none transition-colors"
                    />
                  </div>
                )}

                {paymentMethod === 'neft' && (
                  <div className="bg-surface-container-low border border-white/10 p-4 rounded-lg">
                    <p className="text-sm text-on-surface-variant mb-2">Please transfer the amount to the following account and proceed.</p>
                    <div className="font-mono text-sm text-on-surface">
                      <p>Account: 1234 5678 9012</p>
                      <p>IFSC: CINE0001234</p>
                      <p>Name: Cineplex Dummy Bookings</p>
                    </div>
                  </div>
                )}

                {paymentMethod === 'wallets' && (
                  <div className="bg-surface-container-low border border-white/10 p-4 rounded-lg flex items-center justify-center gap-4">
                    <button type="button" className="px-4 py-2 bg-[#002970] text-white rounded hover:opacity-90">Paytm Dummy</button>
                    <button type="button" className="px-4 py-2 bg-[#5f259f] text-white rounded hover:opacity-90">PhonePe Dummy</button>
                  </div>
                )}
                <button 
                  type="submit"
                  disabled={loading}
                  className="w-full mt-4 bg-primary text-white font-label-md py-4 rounded-lg flex items-center justify-center gap-2 hover:bg-inverse-primary transition-all glow-crimson glow-crimson-hover disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <span className="material-symbols-outlined text-[20px]">lock</span>
                  Pay Securely (Dummy)
                </button>
              </form>
            </section>
          ) : (
            <>
              <section className="glass-panel p-6 rounded-xl border border-white/5">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Select Seats</h2>
                
                {/* Screen */}
                <div className="w-full flex flex-col items-center mb-10">
                  <div className="w-3/4 h-2 bg-gradient-to-b from-primary/50 to-transparent rounded-t-full opacity-50 blur-[2px]"></div>
                  <div className="text-on-surface-variant font-label-md text-label-md mt-2 tracking-widest uppercase text-xs">Screen</div>
                </div>

                {/* Seat Grid */}
                <div className="flex flex-col gap-3 items-center">
                  {rows.map(row => (
                    <div key={row} className="flex gap-2 sm:gap-4 items-center">
                      <span className="w-6 text-center font-label-md text-on-surface-variant text-sm">{row}</span>
                      <div className="flex gap-2 sm:gap-3">
                        {cols.map(col => {
                          const seatId = `${row}${col}`;
                          const isSelected = selectedSeats.includes(seatId);
                          const isTaken = bookedSeats.includes(seatId);
                          
                          return (
                            <button 
                              key={seatId}
                              disabled={isTaken || loading}
                              onClick={() => toggleSeat(seatId)}
                              className={`w-8 h-8 sm:w-10 sm:h-10 rounded-t-lg rounded-b flex items-center justify-center transition-all ${
                                isTaken ? 'bg-surface-container-high border border-white/5 opacity-50 cursor-not-allowed' :
                                isSelected ? 'bg-primary text-on-primary shadow-[0_0_15px_rgba(225,29,72,0.6)] border-primary' : 
                                'glass-panel hover:border-primary/50 text-transparent'
                              }`}
                            >
                              {isSelected && <span className="material-symbols-outlined text-[16px]">check</span>}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Legend */}
                <div className="flex justify-center gap-6 mt-8">
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-sm glass-panel"></div>
                    <span className="font-label-md text-xs text-on-surface-variant uppercase">Available</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-sm bg-primary shadow-[0_0_10px_rgba(225,29,72,0.6)]"></div>
                    <span className="font-label-md text-xs text-on-surface-variant uppercase">Selected</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 rounded-t-sm bg-surface-container-high border border-white/5 opacity-50"></div>
                    <span className="font-label-md text-xs text-on-surface-variant uppercase">Taken</span>
                  </div>
                </div>
              </section>

              <section className="glass-panel p-6 rounded-xl border border-white/5">
                <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Payment Method</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    { id: 'credit_card', label: 'Card', icon: 'credit_card' },
                    { id: 'upi', label: 'UPI', icon: 'qr_code_scanner' },
                    { id: 'neft', label: 'NEFT', icon: 'account_balance' },
                    { id: 'wallets', label: 'Wallets', icon: 'account_balance_wallet' }
                  ].map(method => (
                    <div 
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      className={`border rounded-lg p-4 cursor-pointer flex flex-col items-center justify-center gap-3 transition-all ${
                        paymentMethod === method.id 
                          ? 'border-primary bg-primary/10 shadow-[0_0_15px_rgba(225,29,72,0.2)]' 
                          : 'border-white/10 bg-surface hover:border-primary/50'
                      }`}
                    >
                      <span className={`material-symbols-outlined text-[32px] ${paymentMethod === method.id ? 'text-primary' : 'text-on-surface-variant'}`}>{method.icon}</span>
                      <span className={`font-label-md ${paymentMethod === method.id ? 'text-primary' : 'text-on-surface-variant'}`}>{method.label}</span>
                    </div>
                  ))}
                </div>
              </section>
            </>
          )}

        </div>

        {/* Right Column: Order Summary */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <div className="glass-panel p-6 rounded-xl border border-white/5 sticky top-24">
            <h2 className="font-headline-md text-headline-md text-on-surface mb-6">Booking Summary</h2>
            
            <div className="flex gap-4 mb-6 border-b border-white/10 pb-6">
              <img 
                src={showtime?.movie?.posterUrl || undefined} 
                alt={showtime?.movie?.title || 'Movie Poster'} 
                className="w-20 rounded-md object-cover border border-white/10"
              />
              <div>
                <h3 className="font-headline-md text-lg text-on-surface">{showtime?.movie?.title || 'Loading...'}</h3>
                <p className="font-body-md text-sm text-on-surface-variant mt-1">{showtime?.theatre?.name || ''}</p>
                <div className="flex gap-3 mt-2 font-label-md text-xs text-on-surface-variant">
                  <span>{showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString() : ''}</span>
                  <span className="w-1 h-1 rounded-full bg-on-surface-variant/50 self-center"></span>
                  <span>{showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-6 font-body-md text-sm text-on-surface border-b border-white/10 pb-6">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Date</span>
                <span className="font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleDateString() : ''}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Time</span>
                <span className="font-label-md">{showtime?.startTime ? new Date(showtime.startTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''}</span>
              </div>
              <div className="flex justify-between items-start">
                <span className="text-on-surface-variant">Seats</span>
                <span className="font-label-md text-right max-w-[150px]">
                  {selectedSeats.length > 0 ? selectedSeats.join(', ') : 'None selected'}
                </span>
              </div>
            </div>

            <div className="flex flex-col gap-3 mb-8 font-body-md text-sm text-on-surface">
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Tickets ({selectedSeats.length})</span>
                <span>₹{(selectedSeats.length * 250).toFixed(2)}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-on-surface-variant">Convenience Fee</span>
                <span>₹{(selectedSeats.length > 0 ? 40 : 0).toFixed(2)}</span>
              </div>
              {discount > 0 && (
                <div className="flex justify-between items-center text-green-400">
                  <span className="text-on-surface-variant text-green-400">Discount</span>
                  <span>-₹{discount.toFixed(2)}</span>
                </div>
              )}
              <div className="flex justify-between items-center mt-2 pt-2 border-t border-white/10">
                <span className="font-headline-md text-lg">Total</span>
                <span className="font-display text-2xl text-primary">₹{Math.max(0, selectedSeats.length * 250 + (selectedSeats.length > 0 ? 40 : 0) - discount).toFixed(2)}</span>
              </div>
            </div>

            {bookingStatus !== 'PAYING' && (
              <div className="mb-6">
                <label className="font-label-md text-sm text-on-surface-variant block mb-2">Apply Coupon</label>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    disabled={couponApplied || loading}
                    className="flex-1 bg-surface-container-high border border-white/10 rounded-lg px-4 py-3 text-on-surface focus:outline-none focus:border-primary uppercase transition-colors disabled:opacity-50"
                    placeholder="Enter code (e.g. CINEPLEX50)"
                  />
                  <button
                    onClick={couponApplied ? () => { setCouponApplied(false); setDiscount(0); setCouponCode(''); } : handleApplyCoupon}
                    disabled={!couponCode || loading}
                    className={`px-4 py-3 rounded-lg font-label-md transition-all ${
                      couponApplied ? 'bg-surface-container-highest text-primary border border-primary/50 hover:bg-primary/10' : 'bg-primary/20 text-primary hover:bg-primary/30 border border-primary/20'
                    } disabled:opacity-50`}
                  >
                    {couponApplied ? 'Remove' : 'Apply'}
                  </button>
                </div>
                {couponError && <p className="text-primary text-xs mt-2">{couponError}</p>}
                {couponApplied && <p className="text-green-400 text-xs mt-2">Coupon applied successfully!</p>}
              </div>
            )}

            {bookingStatus !== 'PAYING' && (
              <button 
                onClick={handleCheckout}
                disabled={selectedSeats.length === 0 || loading}
                className={`w-full py-4 rounded-lg font-label-md text-label-md flex justify-center items-center gap-2 transition-all duration-300 ${
                  selectedSeats.length > 0 && !loading
                    ? 'bg-primary-container text-white glow-crimson glow-crimson-hover hover:bg-inverse-primary cursor-pointer' 
                    : 'bg-surface-container-high text-on-surface-variant cursor-not-allowed border border-white/5'
                }`}
              >
                <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>lock</span>
                {loading ? 'Processing...' : 'Proceed to Payment'}
              </button>
            )}
          </div>
        </div>

      </main>
    </div>
  );
}
