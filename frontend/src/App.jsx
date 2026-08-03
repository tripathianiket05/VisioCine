import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Showtimes from './pages/Showtimes';
import Checkout from './pages/Checkout';
import TicketConfirmation from './pages/TicketConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Cinemas from './pages/Cinemas';
import Theatre from './pages/Theatre';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import { initAuth } from './apiClient';

import FAQ from './pages/FAQ';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';
import Cookies from './pages/Cookies';

function App() {
  useEffect(() => {
    initAuth();
  }, []);

  return (
    <Router>
      <ScrollToTop />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/cinemas" element={<Cinemas />} />
        <Route path="/theatre/:id" element={<Theatre />} />
        <Route path="/offers" element={<Offers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id/showtimes" element={<Showtimes />} />
        <Route path="/checkout/:showtimeId" element={<Checkout />} />
        <Route path="/ticket/:bookingId" element={<TicketConfirmation />} />
        <Route path="/faq" element={<FAQ />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        <Route path="/cookies" element={<Cookies />} />
      </Routes>
    </Router>
  );
}

export default App;
