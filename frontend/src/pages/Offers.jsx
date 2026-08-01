import Header from '../components/Header';
import Footer from '../components/Footer';
import BottomNav from '../components/BottomNav';

export default function Offers() {
  const offers = [
    {
      id: 1,
      title: "Student Discount",
      desc: "Get 20% off all standard tickets with a valid student ID on Thursdays.",
      code: "STUDENT20",
      icon: "school",
      color: "from-blue-500/20 to-blue-900/20",
      border: "border-blue-500/30"
    },
    {
      id: 2,
      title: "Mega Combo",
      desc: "Large popcorn and 2 large drinks for only $15 when booked online.",
      code: "SNACK15",
      icon: "fastfood",
      color: "from-yellow-500/20 to-orange-900/20",
      border: "border-yellow-500/30"
    },
    {
      id: 3,
      title: "IMAX Upgrade",
      desc: "Free upgrade to IMAX for Cineplex Rewards members every Tuesday.",
      code: "IMAXTUES",
      icon: "movie",
      color: "from-purple-500/20 to-indigo-900/20",
      border: "border-purple-500/30"
    },
    {
      id: 4,
      title: "Date Night Special",
      desc: "2 premium tickets, 1 large popcorn, and 2 glasses of wine for $45.",
      code: "DATENIGHT",
      icon: "favorite",
      color: "from-rose-500/20 to-pink-900/20",
      border: "border-rose-500/30"
    }
  ];

  return (
    <div className="bg-surface text-on-surface min-h-screen flex flex-col relative pt-24">
      <Header />
      
      <main className="flex-grow pb-24 md:pb-12 max-w-container-max mx-auto px-6 md:px-12 w-full">
        <div className="mb-12 border-b border-white/10 pb-8 mt-8 text-center md:text-left">
          <h1 className="font-display text-4xl md:text-6xl text-white uppercase tracking-tight">Exclusive Offers</h1>
          <p className="text-on-surface-variant font-body-md mt-2 max-w-2xl">Unlock premium cinematic experiences for less with our latest deals, discounts, and rewards.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {offers.map(offer => (
            <div key={offer.id} className={`glass-panel rounded-3xl overflow-hidden border ${offer.border} relative group cursor-pointer`}>
              <div className={`absolute inset-0 bg-gradient-to-br ${offer.color} opacity-50 group-hover:opacity-100 transition-opacity duration-500`}></div>
              
              <div className="relative z-10 p-8 flex flex-col h-full justify-between">
                <div>
                  <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-md flex items-center justify-center mb-6 shadow-xl border border-white/20 group-hover:scale-110 transition-transform duration-500">
                    <span className="material-symbols-outlined text-white text-[28px]">{offer.icon}</span>
                  </div>
                  <h2 className="font-headline-md text-3xl text-white mb-3">{offer.title}</h2>
                  <p className="text-white/70 font-body-md leading-relaxed mb-8">{offer.desc}</p>
                </div>
                
                <div className="flex items-center justify-between border-t border-white/10 pt-6 mt-auto">
                  <div className="flex flex-col">
                    <span className="text-xs font-label-md text-white/40 uppercase tracking-widest mb-1">Promo Code</span>
                    <span className="font-display text-xl text-primary tracking-wider">{offer.code}</span>
                  </div>
                  <button className="bg-white/10 hover:bg-white/20 text-white font-label-md px-6 py-2 rounded-full transition-colors backdrop-blur-md border border-white/10">
                    Apply Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <BottomNav />
      <Footer />
    </div>
  );
}
