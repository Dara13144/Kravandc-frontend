import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Star, Heart, Tag, Eye } from 'lucide-react';
import { movieAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { toast } from 'react-toastify';

const MovieCard = ({ movie, isFavorite = false, onToggleFav }) => {
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();

  const handleFavoriteClick = async (e) => {
    e.stopPropagation();
    if (!user) return openAuthModal('login');
    try {
      await movieAPI.toggleFavorite(movie.id);
      if (onToggleFav) onToggleFav(movie.id);
      toast.success('Favorites updated!');
    } catch (err) {
      toast.error('Failed to update favorite');
    }
  };

  const isPremium = Boolean(movie.isPremium && movie.price > 0);
  const displayPrice = movie.price ? Number(movie.price).toFixed(2) : '0.00';
  const displayRentalPrice = movie.rentalPrice ? Number(movie.rentalPrice).toFixed(2) : null;

  return (
    <div
      onClick={() => navigate(`/movie/${movie.slug || movie.id}`)}
      className="group relative rounded-2xl bg-theme-card border border-gray-800/80 overflow-hidden cursor-pointer shadow-lg hover:border-theme-gold/80 transition-all duration-300 transform hover:-translate-y-1.5 hover:shadow-gold-glow flex flex-col h-full card-ambient-hover"
    >
      {/* Poster Container */}
      <div className="relative aspect-[2/3] w-full overflow-hidden bg-gray-950">
        <img
          src={movie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600'}
          alt={movie.title}
          onError={(e) => {
            e.currentTarget.onerror = null;
            e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=600';
          }}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Top-Left Price Badge */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 items-start pointer-events-none z-10">
          {isPremium ? (
            <span className="px-2.5 py-1 rounded-lg text-xs font-black bg-gradient-to-r from-amber-400 via-amber-500 to-yellow-500 text-black shadow-gold-sm flex items-center gap-1">
              <Tag className="w-3 h-3 fill-black text-black" />
              ${displayPrice}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-lg text-[10px] font-black uppercase bg-emerald-500 text-black shadow-md">
              FREE
            </span>
          )}
        </div>

        {/* Top-Right Favorite Toggle Button */}
        <div className="absolute top-3 right-3 flex items-center pointer-events-none z-10">
          <button
            onClick={handleFavoriteClick}
            className="pointer-events-auto p-1.5 rounded-full bg-black/60 hover:bg-black/90 text-rose-400 backdrop-blur-md transition-colors shadow-md hover:scale-110"
          >
            <Heart className={`w-4 h-4 ${isFavorite ? 'fill-rose-500 text-rose-500' : ''}`} />
          </button>
        </div>

        {/* Hover Action Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center gap-3">
          <button
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/watch/${movie.slug || movie.id}`);
            }}
            className="w-12 h-12 rounded-full gold-glow-button flex items-center justify-center text-black shadow-gold-glow hover:scale-110 transition-transform"
          >
            <Play className="w-6 h-6 fill-black ml-0.5" />
          </button>
        </div>
      </div>

      {/* Card Information (Angkor DC Style) */}
      <div className="p-3 text-center flex flex-col justify-between space-y-1">
        <h3 className="text-xs sm:text-sm font-bold text-gray-100 group-hover:text-amber-400 transition-colors line-clamp-2 leading-snug">
          {movie.titleKh ? `${movie.titleKh} | ${movie.title}` : movie.title}
        </h3>
        {movie.titleKh && (
          <p className="text-[10px] text-amber-400/90 font-bold uppercase tracking-wider line-clamp-1">
            {movie.title}
          </p>
        )}
        <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400 pt-1">
          <span>{movie.releaseYear || '2026'}</span>
          <span>•</span>
          <div className="flex items-center gap-0.5 text-amber-400 font-bold">
            <Star className="w-2.5 h-2.5 fill-amber-400" />
            <span>{movie.rating || '9.0'}</span>
          </div>
          <span>•</span>
          <div className="flex items-center gap-0.5 text-cyan-300 font-semibold" title="Total Views">
            <Eye className="w-2.5 h-2.5 text-cyan-400" />
            <span>{movie.viewCount ? Number(movie.viewCount).toLocaleString() : '1,420'}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
