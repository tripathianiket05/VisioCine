import { Link } from 'react-router-dom';

export default function MovieCard({ id, title, genre, rating, image }) {
  return (
    <div className="group relative rounded-xl overflow-hidden glass-panel border border-white/5 hover:border-primary/30 transition-all duration-500 cursor-pointer">
      <div className="aspect-[2/3] w-full relative overflow-hidden">
        <img 
          alt={`${title} Poster`} 
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
          src={image} 
        />
        {/* Rating Badge */}
        <div className="absolute top-3 right-3 bg-surface-container-high/80 backdrop-blur-md px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
          <span className="material-symbols-outlined text-[14px] text-tertiary-fixed-dim" style={{ fontVariationSettings: "'FILL' 1" }}>star</span>
          <span className="font-label-md text-label-md text-white">{rating}</span>
        </div>
        {/* Hover Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent opacity-80 group-hover:opacity-100 transition-opacity duration-300"></div>
      </div>
      <div className="p-4 absolute bottom-0 w-full translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
        <h3 className="font-headline-md text-headline-md text-on-surface truncate">{title}</h3>
        <p className="text-on-surface-variant font-body-sm text-sm truncate mb-3">{genre}</p>
        <Link 
          to={`/movie/${id}/showtimes`} 
          className="w-full bg-primary-container/90 hover:bg-primary-container text-white font-label-md text-label-md py-2.5 rounded-lg flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 glow-crimson-hover"
        >
          Book Now
        </Link>
      </div>
    </div>
  );
}
