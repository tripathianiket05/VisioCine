import { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Showtimes from './pages/Showtimes';
import Checkout from './pages/Checkout';
import TicketConfirmation from './pages/TicketConfirmation';
import Login from './pages/Login';
import Register from './pages/Register';
import Cinemas from './pages/Cinemas';
import Offers from './pages/Offers';
import Profile from './pages/Profile';
import ScrollToTop from './components/ScrollToTop';
import { initAuth } from './apiClient';

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
        <Route path="/offers" element={<Offers />} />
        <Route path="/profile" element={<Profile />} />
        <Route path="/movie/:id/showtimes" element={<Showtimes />} />
        <Route path="/checkout/:showtimeId" element={<Checkout />} />
        <Route path="/ticket/:bookingId" element={<TicketConfirmation />} />
      </Routes>
    </Router>
  );
}

export default App;
