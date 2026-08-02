import { Link } from 'react-router-dom';

export default function BottomNav() {
  return (
    <nav className="flex justify-around items-center h-16 w-full max-w-md mx-auto md:hidden bg-surface-container/60 backdrop-blur-lg dark:bg-surface-container/60 fixed bottom-0 z-50 rounded-t-xl border-t border-white/10 shadow-[0_-4px_20px_rgba(0,0,0,0.5)]">
      <Link to="/" className="flex flex-col items-center justify-center text-primary-container drop-shadow-[0_0_10px_rgba(225,29,72,0.5)] scale-90 duration-150">
        <span className="material-symbols-outlined" style={{ fontVariationSettings: "'FILL' 1" }}>home</span>
        <span className="font-label-md text-[10px] mt-1">Home</span>
      </Link>
      <Link to="/profile?tab=bookings" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-fixed-dim transition-all">
        <span className="material-symbols-outlined">confirmation_number</span>
        <span className="font-label-md text-[10px] mt-1">Bookings</span>
      </Link>
      <Link to="/profile?tab=watchlist" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-fixed-dim transition-all">
        <span className="material-symbols-outlined">favorite</span>
        <span className="font-label-md text-[10px] mt-1">Watchlist</span>
      </Link>
      <Link to="/profile?tab=profile" className="flex flex-col items-center justify-center text-on-surface-variant hover:text-primary-fixed-dim transition-all">
        <span className="material-symbols-outlined">person</span>
        <span className="font-label-md text-[10px] mt-1">Profile</span>
      </Link>
    </nav>
  );
}

