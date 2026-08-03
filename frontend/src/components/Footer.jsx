import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="bg-black/90 border-t border-white/10 pt-16 pb-8 hidden md:block relative overflow-hidden mt-12">
      {/* Decorative gradient blur */}
      <div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[800px] h-[300px] bg-primary/20 rounded-full blur-[120px] pointer-events-none opacity-50"></div>
      
      <div className="max-w-[1600px] mx-auto px-6 md:px-12 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <img src="/logo.svg" alt="VCine Logo" className="h-16 w-16" />
            </div>
            <p className="text-white/60 font-body-md max-w-md leading-relaxed mb-8">
              Experience the magic of cinema with cutting-edge technology, premium seating, and unparalleled service.
            </p>
            
            {/* Newsletter */}
            <div className="flex gap-2">
              <input 
                type="email" 
                placeholder="Subscribe to our newsletter..." 
                className="bg-white/5 border border-white/10 rounded-full px-5 py-3 text-white focus:outline-none focus:border-primary transition-colors w-full max-w-sm placeholder-white/30 text-sm"
              />
              <button className="bg-primary hover:bg-rose-600 text-white font-label-md px-6 py-3 rounded-full transition-colors flex items-center gap-2">
                <span>Join</span>
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
              </button>
            </div>
          </div>
          
          {/* Explore Links */}
          <div>
            <h4 className="text-white font-label-md uppercase tracking-wider mb-6">Explore</h4>
            <div className="flex flex-col gap-4 text-white/50 font-body-md">
              <Link to="/" className="hover:text-primary transition-colors">Movies</Link>
              <Link to="/cinemas" className="hover:text-primary transition-colors">Cinemas</Link>
              <Link to="/offers" className="hover:text-primary transition-colors">Offers</Link>
              <Link to="#" className="hover:text-primary transition-colors">Gift Cards</Link>
            </div>
          </div>

          {/* Legal & Social */}
          <div>
            <h4 className="text-white font-label-md uppercase tracking-wider mb-6">Connect</h4>
            <div className="flex flex-col gap-4 text-white/50 font-body-md mb-8">
              <Link to="#" className="hover:text-primary transition-colors">Contact Us</Link>
              <Link to="#" className="hover:text-primary transition-colors">FAQ</Link>
            </div>
            <div className="flex gap-4">
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 flex items-center justify-center text-white/70 transition-all">
                <span className="material-symbols-outlined text-[20px]">share</span>
              </button>
              <button className="w-10 h-10 rounded-full bg-white/5 hover:bg-primary/20 hover:text-primary border border-white/10 flex items-center justify-center text-white/70 transition-all">
                <span className="material-symbols-outlined text-[20px]">thumb_up</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-white/40 text-xs font-label-md">
          <p>&copy; {new Date().getFullYear()} Cineplex Entertainment. All rights reserved.</p>
          <div className="flex gap-6">
            <Link to="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link to="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link to="#" className="hover:text-white transition-colors">Cookie Preferences</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
