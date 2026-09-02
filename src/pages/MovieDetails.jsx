import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { movieAPI, orderAPI, paymentAPI } from '../api/endpoints';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import MovieCard from '../components/MovieCard';
import ABAKHQRModal from '../components/ABAKHQRModal';
import LiveViewersCounter from '../components/LiveViewersCounter';
import MovieComments from '../components/MovieComments';
import { getYouTubeEmbedUrl, getGoogleDriveEmbedUrl, getVimeoEmbedUrl } from '../components/CustomVideoPlayer';
import {
  Play,
  Star,
  ShoppingBag,
  Heart,
  Calendar,
  Clock,
  Film,
  UserCheck,
  CheckCircle2,
  Lock,
  X,
  MessageSquare,
  Sparkles,
  Loader2,
  QrCode,
  ShieldCheck,
  Zap,
  ArrowRight,
  Tag,
  Wallet,
  AlertCircle,
  PlusCircle
} from 'lucide-react';
import { toast } from 'react-toastify';

const MovieDetails = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const { user, openAuthModal } = useAuth();
  const { balance, fetchWallet } = useWallet();

  const [movieData, setMovieData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBuyModal, setShowBuyModal] = useState(false);
  const [purchaseType, setPurchaseType] = useState('LIFETIME'); // 'LIFETIME' | 'RENTAL'
  const [couponCode, setCouponCode] = useState('');
  const [isPurchasing, setIsPurchasing] = useState(false);
  const [activeTrailer, setActiveTrailer] = useState(null);

  // Instant KHQR Modal
  const [showKhqrModal, setShowKhqrModal] = useState(false);
  const [khqrData, setKhqrData] = useState(null);

  // Review Form state
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState('');

  const isSuperAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  useEffect(() => {
    const fetchDetails = async () => {
      setLoading(true);
      try {
        const res = await movieAPI.getMovieBySlug(slug);
        setMovieData(res.data.data);
      } catch (err) {
        console.error('Failed to load movie details', err);
      } finally {
        setLoading(false);
      }
    };
    fetchDetails();
  }, [slug]);

  if (loading) {
    return (
      <div className="py-32 text-center space-y-3">
        <Loader2 className="w-12 h-12 text-theme-gold animate-spin mx-auto" />
        <p className="text-xs text-gray-400">Loading movie details...</p>
      </div>
    );
  }

  if (!movieData?.movie) return null;

  const { movie, related } = movieData;
  const currentPrice = purchaseType === 'LIFETIME' ? movie.price : movie.rentalPrice;

  // 1-Click Wallet Purchase
  const handleWalletPurchase = async () => {
    if (!user) return openAuthModal('login');
    try {
      setIsPurchasing(true);
      const res = await orderAPI.purchaseMovie({
        movieId: movie.id,
        purchaseType,
        couponCode
      });
      toast.success(res.data.message || 'Movie unlocked successfully!');
      setShowBuyModal(false);
      await fetchWallet();
      
      // Update local state access
      setMovieData(prev => ({
        ...prev,
        movie: { ...prev.movie, hasAccess: true }
      }));
    } catch (err) {
      if (err.response?.status === 402) {
        toast.warning('Insufficient wallet balance! Switching to instant KHQR scan...');
        handleKhqrDirectPay();
      } else {
        toast.error(err.response?.data?.message || 'Purchase failed');
      }
    } finally {
      setIsPurchasing(false);
    }
  };

  // Direct KHQR QR Code Payment
  const handleKhqrDirectPay = async () => {
    if (!user) return openAuthModal('login');
    try {
      setIsPurchasing(true);
      const res = await paymentAPI.createKhqrCcQR(
        currentPrice,
        null,
        `Unlock ${movie.title} (${purchaseType})`
      );
      setKhqrData(res.data.data);
      setShowBuyModal(false);
      setShowKhqrModal(true);
    } catch (e) {
      toast.error('Failed to initiate KHQR payment');
    } finally {
      setIsPurchasing(false);
    }
  };

  const handleAddReview = async (e) => {
    e.preventDefault();
    if (!user) return openAuthModal('login');
    try {
      await movieAPI.addReview({
        movieId: movie.id,
        rating: reviewRating,
        comment: reviewComment
      });
      toast.success('Review added successfully!');
      setReviewComment('');
      // Refresh movie details
      const res = await movieAPI.getMovieBySlug(slug);
      setMovieData(res.data.data);
    } catch (err) {
      toast.error('Failed to submit review');
    }
  };

  const getYoutubeEmbedUrl = (url) => {
    if (!url) return '';
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? `https://www.youtube.com/embed/${match[2]}?autoplay=1` : url;
  };

  const canWatch = Boolean(movie.hasAccess || (!movie.isPremium || Number(movie.price) <= 0));

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-12 min-h-screen">
      
      {/* Top Main Details Section (Angkor DC Style) */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-8 lg:gap-12 items-start">
        
        {/* Left Column: Movie Poster */}
        <div className="md:col-span-4 lg:col-span-4 flex justify-center md:justify-start">
          <div className="w-full max-w-[320px] aspect-[2/3] rounded-2xl overflow-hidden border border-gray-800 shadow-2xl bg-gray-950">
            <img
              src={movie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800'}
              alt={movie.title}
              onError={(e) => {
                e.currentTarget.onerror = null;
                e.currentTarget.src = 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=800';
              }}
              className="w-full h-full object-cover"
            />
          </div>
        </div>

        {/* Right Column: Title, Synopsis, Metadata, and Action Buttons */}
        <div className="md:col-span-8 lg:col-span-8 space-y-5">
          
          {/* Movie Title (Khmer & English) */}
          <div className="space-y-2">
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-tight">
              {movie.titleKh || movie.title}
            </h1>
            {movie.titleKh && (
              <p className="text-sm font-bold text-amber-400 uppercase tracking-wider">
                {movie.title}
              </p>
            )}

            {/* 🔴 Real-Time Live Viewers & Total Views Counter */}
            <div className="pt-1">
              <LiveViewersCounter movieId={movie.id} totalViews={movie.viewCount} />
            </div>
          </div>

          {/* Synopsis Description */}
          <p className="text-sm text-gray-300 leading-relaxed font-normal">
            {movie.description}
          </p>

          {/* Release Date & Duration */}
          <div className="flex flex-wrap items-center gap-x-8 gap-y-2 text-sm text-gray-400 pt-1">
            <div>
              <span className="font-bold text-white">Release Date:</span>{' '}
              <span className="text-gray-300">{movie.releaseYear || '2026'}</span>
            </div>
            <div>
              <span className="font-bold text-white">Duration:</span>{' '}
              <span className="text-gray-300">{movie.duration || '90'}mn</span>
            </div>
          </div>

          {/* Genres */}
          <div className="text-sm text-gray-400">
            <span className="font-bold text-white">Genre:</span>{' '}
            <span className="text-gray-300 font-medium">
              {Array.isArray(movie.genres) ? movie.genres.join('  ') : (movie.genre || 'Action  Horror-Comedy')}
            </span>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-wrap items-center gap-4 pt-4">
            {canWatch ? (
              <button
                onClick={() => navigate(`/watch/${movie.slug || movie.id}`)}
                className="px-8 py-3 rounded-md border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-all cursor-pointer shadow-md"
              >
                Watch Now
              </button>
            ) : (
              <button
                onClick={() => {
                  if (!user) return openAuthModal('login');
                  setPurchaseType('LIFETIME');
                  setShowBuyModal(true);
                }}
                className="px-8 py-3 rounded-md border border-amber-400 bg-amber-500/20 text-amber-300 font-bold text-sm hover:bg-amber-400 hover:text-black transition-all cursor-pointer shadow-gold-sm"
              >
                Watch Now (${Number(movie.price).toFixed(2)})
              </button>
            )}

            <button
              onClick={() => {
                const trailerSection = document.getElementById('trailer-section');
                if (trailerSection) {
                  trailerSection.scrollIntoView({ behavior: 'smooth' });
                } else if (movie.trailerUrl) {
                  setActiveTrailer(movie.trailerUrl);
                }
              }}
              className="px-8 py-3 rounded-md border border-white text-white font-bold text-sm hover:bg-white hover:text-black transition-all cursor-pointer shadow-md"
            >
              Watch Trailer
            </button>
          </div>

        </div>

      </div>

      {/* Embedded TRAILER Section */}
      <div id="trailer-section" className="space-y-4 pt-10 border-t border-gray-800/80">
        <h2 className="text-2xl sm:text-3xl font-black text-white tracking-wider uppercase">
          TRAILER
        </h2>
        <div className="relative w-full aspect-video bg-black rounded-2xl overflow-hidden border border-gray-800 shadow-2xl">
          <iframe
            src={getYoutubeEmbedUrl(movie.trailerUrl || 'https://www.youtube.com/watch?v=dQw4w9WgXcQ')}
            title={`${movie.title} Official Trailer`}
            className="w-full h-full border-0"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      </div>

      {/* 💬 Real-Time User Comments & Reviews System */}
      <MovieComments movieId={movie.id} initialReviews={movie.reviews} />

      {/* Related Movies Slider */}
      {related && related.length > 0 && (
        <div className="space-y-6 pt-6 border-t border-gray-800/80">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-black text-white uppercase tracking-wider">
              More Movies
            </h3>
            <button
              onClick={() => navigate('/movies')}
              className="text-xs font-bold text-amber-400 hover:underline"
            >
              View All &rarr;
            </button>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-5">
            {related.map((m) => (
              <MovieCard key={m.id} movie={m} />
            ))}
          </div>
        </div>
      )}

      {/* Buy Modal */}
      {showBuyModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
          <div className="relative w-full max-w-md bg-theme-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-glow text-center space-y-5">
            
            <button
              onClick={() => setShowBuyModal(false)}
              className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/30">
                INSTANT MOVIE ACCESS
              </span>
              <h3 className="text-2xl font-black text-white mt-1">Buy "{movie.title}"</h3>
              <p className="text-xs text-gray-400 mt-0.5">Stream in 4K Ultra HD on any device.</p>
            </div>

            {/* Movie Price Card */}
            <div className="p-4 rounded-2xl border border-theme-gold bg-amber-500/10 text-left space-y-1 shadow-md">
              <p className="font-black uppercase text-[10px] text-theme-gold tracking-wider">LIFETIME ACCESS • 4K ULTRA HD</p>
              <p className="text-2xl font-black text-white">${Number(movie.price).toFixed(2)} USD</p>
              <p className="text-[10px] text-gray-400">Unlimited streaming forever on all devices</p>
            </div>

            {/* Wallet Balance Display & Need Add Balance Warning */}
            <div className="space-y-2">
              <div className="p-3.5 bg-slate-900/90 rounded-2xl border border-gray-800 text-xs flex items-center justify-between">
                <span className="text-gray-400 font-bold flex items-center gap-1.5">
                  <Wallet className="w-3.5 h-3.5 text-theme-gold" /> Your Wallet Balance:
                </span>
                <span className="font-black text-theme-gold text-sm">${balance.toFixed(2)} USD</span>
              </div>

            </div>

            {/* Action Buttons */}
            <div className="space-y-3 pt-1">
              {balance >= Number(currentPrice) ? (
                /* Wallet Pay with Sufficient Balance */
                <button
                  onClick={handleWalletPurchase}
                  disabled={isPurchasing}
                  className="w-full py-4 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-xl hover:scale-105 transition-all cursor-pointer"
                >
                  {isPurchasing ? <Loader2 className="w-4 h-4 animate-spin" /> : `⚡ Confirm & Buy with Wallet ($${Number(currentPrice).toFixed(2)})`}
                </button>
              ) : (
                /* Add Balance Flow */
                <>
                  <button
                    onClick={() => navigate(`/topup?amount=${Math.ceil(Number(currentPrice) - balance)}`)}
                    className="w-full py-4 rounded-full gold-glow-button text-black font-black text-xs flex items-center justify-center gap-2.5 shadow-xl hover:scale-105 transition-all cursor-pointer"
                  >
                    <img src="/wallet-icon.png" alt="Wallet" className="w-5 h-5 object-contain" />
                    <span>Add Balance to Wallet (ABA KHQR)</span>
                  </button>

                  <button
                    onClick={handleKhqrDirectPay}
                    disabled={isPurchasing}
                    className="w-full py-3.5 rounded-full bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-500/40 text-cyan-300 font-bold text-xs flex items-center justify-center gap-2.5 transition-all shadow-md cursor-pointer"
                  >
                    <img src="/aba-khqr-icon.png" alt="ABA KHQR" className="h-5 w-auto object-contain rounded-sm" />
                    <span>ABA KHQR (${Number(currentPrice).toFixed(2)})</span>
                  </button>
                </>
              )}
            </div>

          </div>
        </div>
      )}

      {/* Instant KHQR QR Modal */}
      {showKhqrModal && khqrData && (
        <ABAKHQRModal
          isOpen={showKhqrModal}
          onClose={() => {
            setShowKhqrModal(false);
            // Refresh access
            movieAPI.getMovieBySlug(slug).then(res => setMovieData(res.data.data));
          }}
          khqrData={khqrData}
          orderId={null}
        />
      )}

      {/* Trailer Modal */}
      {activeTrailer && (() => {
        const ytEmbed = getYouTubeEmbedUrl(activeTrailer);
        const gDriveEmbed = getGoogleDriveEmbedUrl(activeTrailer);
        const vimeoEmbed = getVimeoEmbedUrl(activeTrailer);
        return (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-fade-in-up">
            <div className="relative w-full max-w-4xl bg-black rounded-3xl overflow-hidden aspect-video border border-amber-500/30 shadow-2xl">
              <button
                onClick={() => setActiveTrailer(null)}
                className="absolute right-4 top-4 p-2 text-white bg-black/70 hover:bg-theme-gold hover:text-black rounded-full z-10 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
              {ytEmbed ? (
                <iframe
                  src={ytEmbed}
                  title="Movie Trailer"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : gDriveEmbed ? (
                <iframe
                  src={gDriveEmbed}
                  title="Movie Trailer"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : vimeoEmbed ? (
                <iframe
                  src={vimeoEmbed}
                  title="Movie Trailer"
                  className="w-full h-full border-0"
                  allow="autoplay; encrypted-media"
                  allowFullScreen
                />
              ) : (
                <video
                  src={activeTrailer}
                  controls
                  autoPlay
                  className="w-full h-full object-contain"
                />
              )}
            </div>
          </div>
        );
      })()}

    </div>
  );
};

export default MovieDetails;
