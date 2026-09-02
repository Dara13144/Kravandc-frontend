import React, { useState, useEffect, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { movieAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import MovieCard from '../components/MovieCard';
import { ChevronLeft, ChevronRight, Search, Film, Loader2, Sparkles, Filter } from 'lucide-react';

const categoriesList = [
  { id: '', label: 'All' },
  { id: 'Asian', label: 'Asian Movies' },
  { id: 'Comedy Romance', label: 'Comedy Romance' },
  { id: 'Drama', label: 'Drama' },
  { id: 'Horror-Comedy', label: 'Horror-Comedy' },
  { id: 'Thriller-Horror', label: 'Thriller-Horror' },
  { id: 'Action', label: 'Action & Adventure' },
  { id: 'Classics', label: 'Khmer Classics' }
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const scrollRef = useRef(null);

  const [movies, setMovies] = useState([]);
  const [pagination, setPagination] = useState({ page: 1, totalPages: 1 });
  const [loading, setLoading] = useState(true);

  // Filters State
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [activeCategory, setActiveCategory] = useState(searchParams.get('category') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'newest');
  const [page, setPage] = useState(1);

  const scrollTabs = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -200 : 200;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  const fetchMovies = async () => {
    setLoading(true);
    try {
      const res = await movieAPI.getMovies({
        search,
        genre: activeCategory,
        category: activeCategory,
        sort,
        page,
        limit: 25
      });
      setMovies(res.data.data.movies || []);
      setPagination(res.data.data.pagination || { page: 1, totalPages: 1 });
    } catch (err) {
      console.error('Failed to load movies catalog', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMovies();
  }, [search, activeCategory, sort, page]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 min-h-screen">
      
      {/* Top Category Slider Bar (Angkor DC Style) */}
      <div className="relative border-b border-gray-800/80 pb-3 flex items-center">
        
        {/* Left Scroll Button */}
        <button
          onClick={() => scrollTabs('left')}
          className="p-1.5 text-gray-400 hover:text-white shrink-0 hover:bg-gray-800/50 rounded-full transition-colors mr-2"
          aria-label="Scroll left"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Categories Tab List */}
        <div
          ref={scrollRef}
          className="flex items-center gap-6 sm:gap-8 overflow-x-auto no-scrollbar scroll-smooth py-1 px-1 flex-grow"
        >
          {categoriesList.map((cat) => {
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.label}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setPage(1);
                }}
                className={`whitespace-nowrap text-xs sm:text-sm uppercase tracking-wider font-bold transition-all shrink-0 cursor-pointer ${
                  isActive
                    ? 'text-amber-400 font-extrabold border-b-2 border-amber-400 pb-1.5 shadow-gold-sm'
                    : 'text-gray-300 hover:text-white pb-1.5'
                }`}
              >
                {cat.label}
              </button>
            );
          })}
        </div>

        {/* Right Scroll Button */}
        <button
          onClick={() => scrollTabs('right')}
          className="p-1.5 text-gray-400 hover:text-white shrink-0 hover:bg-gray-800/50 rounded-full transition-colors ml-2"
          aria-label="Scroll right"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Movies Grid (Angkor DC Style 5 columns) */}
      {loading ? (
        <div className="py-32 text-center space-y-3">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
          <p className="text-xs text-gray-400">Loading Angkor DC cinema catalog...</p>
        </div>
      ) : movies.length === 0 ? (
        <div className="py-24 text-center space-y-3">
          <Film className="w-12 h-12 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No Movies Found</h3>
          <p className="text-xs text-gray-400">Try adjusting your selected category.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-5 sm:gap-6">
          {movies.map((movie) => (
            <MovieCard key={movie.id} movie={movie} />
          ))}
        </div>
      )}

      {/* Pagination Controls */}
      {pagination.totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <button
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="px-4 py-2 rounded-xl bg-theme-card border border-gray-800 text-xs font-bold text-gray-300 disabled:opacity-40"
          >
            &larr; Previous
          </button>
          <span className="text-xs font-bold text-theme-gold px-4">
            Page {page} of {pagination.totalPages}
          </span>
          <button
            onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
            disabled={page === pagination.totalPages}
            className="px-4 py-2 rounded-xl bg-theme-card border border-gray-800 text-xs font-bold text-gray-300 disabled:opacity-40"
          >
            Next &rarr;
          </button>
        </div>
      )}

    </div>
  );
};

export default Movies;
