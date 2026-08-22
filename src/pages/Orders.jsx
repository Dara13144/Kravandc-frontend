import React, { useState, useEffect } from 'react';
import { orderAPI } from '../api/endpoints';
import { Package, Clock, CheckCircle2, XCircle, Loader2, Play, Film, X, ExternalLink, Sparkles, Tv } from 'lucide-react';
import { toast } from 'react-toastify';
import { useNavigate } from 'react-router-dom';

const Orders = () => {
  const navigate = useNavigate();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeVideoModal, setActiveVideoModal] = useState(null); // { title, videoUrl, poster, isMovie, id }

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getUserOrders();
      setOrders(res.data.data || []);
    } catch (err) {
      toast.error('Failed to load order history');
    } finally {
      setLoading(false);
    }
  };

  const sampleVideoUrl = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

  const handleOpenVideo = (item) => {
    const videoUrl = item.videoUrl || item.movie?.videoUrl || item.product?.videoUrl || sampleVideoUrl;
    const title = item.title || item.movie?.title || item.product?.name || 'KV 4K Cinema Stream';
    const poster = item.poster || item.movie?.poster || item.product?.image || '/logo.png';
    const movieId = item.movieId || item.movie?.id;

    setActiveVideoModal({
      title,
      videoUrl,
      poster,
      movieId
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'COMPLETED':
      case 'PAID':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1 shadow-sm">
            <CheckCircle2 className="w-3 h-3" /> COMPLETED
          </span>
        );
      case 'PENDING':
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1 shadow-sm">
            <Clock className="w-3 h-3 animate-spin" /> PENDING
          </span>
        );
      default:
        return (
          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase bg-rose-500/20 text-rose-400 border border-rose-500/30 flex items-center gap-1 shadow-sm">
            <XCircle className="w-3 h-3" /> {status}
          </span>
        );
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Page Header */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-theme-gold animate-pulse" />
            <h1 className="text-3xl font-black text-white">My Orders & Video Library</h1>
          </div>
          <p className="text-xs text-gray-400">Stream your purchased 4K movies, series, and order history instantly.</p>
        </div>
        <button
          onClick={() => navigate('/movies')}
          className="px-4 py-2.5 rounded-full bg-slate-900 hover:bg-gray-800 border border-gray-700 text-xs font-bold text-gray-200 flex items-center gap-2 transition-all"
        >
          <Film className="w-4 h-4 text-theme-gold" />
          <span>Browse 4K Movies</span>
        </button>
      </div>

      {loading ? (
        <div className="py-20 flex justify-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin" />
        </div>
      ) : orders.length === 0 ? (
        <div className="p-12 text-center bg-theme-card rounded-3xl border border-gray-800 space-y-4">
          <Package className="w-14 h-14 text-gray-600 mx-auto" />
          <h3 className="text-lg font-bold text-white">No orders found</h3>
          <p className="text-xs text-gray-400">You haven't placed any movie purchases or orders yet.</p>
          <button
            onClick={() => navigate('/movies')}
            className="px-6 py-3 rounded-full gold-glow-button text-black font-extrabold text-xs inline-flex items-center gap-2"
          >
            <Play className="w-4 h-4 fill-black" /> Stream Blockbuster Movies
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((o, idx) => (
            <div
              key={o.id}
              style={{ animationDelay: `${idx * 80}ms` }}
              className="p-6 bg-theme-card rounded-3xl border border-gray-800/80 space-y-5 shadow-2xl hover-glow-card animate-fade-in-up group"
            >
              {/* Order Top Bar */}
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-800/80 pb-4">
                <div>
                  <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">Order Reference</span>
                  <span className="font-mono font-black text-white text-sm">#{o.id}</span>
                  <span className="text-[11px] text-gray-500 block mt-0.5">
                    {new Date(o.createdAt).toLocaleString()}
                  </span>
                </div>
                <div className="flex items-center gap-3">
                  {getStatusBadge(o.status)}
                </div>
              </div>

              {/* Order Movie Access Banner */}
              {o.movie && (
                <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900 via-amber-950/20 to-slate-900 border border-amber-500/30 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-4">
                    <img
                      src={o.movie.poster || '/logo.png'}
                      alt={o.movie.title}
                      className="w-16 h-20 object-cover rounded-xl shadow-md border border-amber-500/20"
                    />
                    <div>
                      <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase bg-amber-500/20 text-theme-gold border border-amber-500/30">
                        4K ULTRA HD MOVIE
                      </span>
                      <h4 className="text-base font-black text-white mt-1">{o.movie.title}</h4>
                      <p className="text-xs text-gray-400 mt-0.5 line-clamp-1">{o.movie.description || 'Full Lifetime Movie Streaming Pass'}</p>
                    </div>
                  </div>

                  {(o.status === 'COMPLETED' || o.status === 'PAID') && (
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleOpenVideo({ movie: o.movie, title: o.movie.title })}
                        className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-black text-xs flex items-center gap-2 shadow-gold-glow transition-all transform hover:scale-[1.03]"
                      >
                        <Play className="w-4 h-4 fill-black" />
                        <span>Watch Movie Video</span>
                      </button>
                      <button
                        onClick={() => navigate(`/movies/${o.movie.slug}`)}
                        className="px-3.5 py-2.5 rounded-xl bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold text-xs flex items-center gap-1.5 transition-colors"
                      >
                        <ExternalLink className="w-4 h-4" />
                        <span>Page</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Order E-Commerce / Item List */}
              {o.orderItems && o.orderItems.length > 0 && (
                <div className="space-y-3">
                  <span className="text-[11px] font-bold text-gray-400 uppercase tracking-wider block">Purchased Items ({o.orderItems.length})</span>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {o.orderItems.map((item) => (
                      <div key={item.id} className="p-3 bg-slate-900/80 rounded-2xl border border-gray-800 flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 truncate">
                          <img
                            src={item.product?.image || '/logo.png'}
                            alt={item.product?.name}
                            className="w-12 h-12 object-cover rounded-xl bg-slate-800 shrink-0"
                          />
                          <div className="truncate">
                            <p className="font-bold text-white text-xs truncate">{item.product?.name}</p>
                            <p className="text-gray-400 text-[11px]">{item.quantity}x @ ${item.price.toFixed(2)} USD</p>
                          </div>
                        </div>

                        {(o.status === 'COMPLETED' || o.status === 'PAID') && (
                          <button
                            onClick={() => handleOpenVideo({ product: item.product, title: item.product?.name })}
                            className="px-3 py-2 rounded-xl bg-amber-500/20 text-theme-gold hover:bg-amber-500/30 border border-amber-500/40 text-xs font-bold flex items-center gap-1.5 shrink-0 transition-all"
                          >
                            <Play className="w-3.5 h-3.5 fill-theme-gold" />
                            <span>Play</span>
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Top-Up Order Notice */}
              {!o.movie && (!o.orderItems || o.orderItems.length === 0) && (
                <div className="p-3 bg-slate-900/60 rounded-xl border border-gray-800 text-xs text-gray-300 flex items-center justify-between">
                  <span>Wallet Balance Top-Up Deposit</span>
                  <span className="font-bold text-theme-gold">${o.totalAmount.toFixed(2)} USD</span>
                </div>
              )}

              {/* Footer Total */}
              <div className="flex justify-between items-center pt-3 border-t border-gray-800/60 text-xs">
                <span className="text-gray-400 font-bold">Total Amount Paid</span>
                <span className="text-lg font-black text-theme-gold">${o.totalAmount.toFixed(2)} USD</span>
              </div>

            </div>
          ))}
        </div>
      )}

      {/* Video Player Overlay Modal with Smooth Animation */}
      {activeVideoModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-md animate-in fade-in duration-300">
          <div className="relative w-full max-w-4xl bg-slate-950 border border-amber-500/40 rounded-3xl overflow-hidden shadow-2xl space-y-4 p-6 animate-in zoom-in-95 duration-300">
            
            {/* Modal Header Bar */}
            <div className="flex items-center justify-between border-b border-gray-800 pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
                  <Tv className="w-5 h-5 text-theme-gold" />
                </div>
                <div>
                  <h3 className="text-lg font-black text-white">{activeVideoModal.title}</h3>
                  <p className="text-[11px] text-gray-400">KV 4K Ultra HD Streaming Player</p>
                </div>
              </div>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/80 hover:bg-gray-700 transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Video Player Container */}
            <div className="relative aspect-video rounded-2xl overflow-hidden bg-black border border-gray-800 shadow-2xl">
              <video
                src={activeVideoModal.videoUrl}
                poster={activeVideoModal.poster}
                controls
                autoPlay
                className="w-full h-full object-contain"
              >
                Your browser does not support video playback.
              </video>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between pt-2 text-xs">
              <span className="text-gray-400 font-bold flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-theme-gold" /> High-Performance Stream Active
              </span>
              <button
                onClick={() => setActiveVideoModal(null)}
                className="px-5 py-2 rounded-full bg-gray-800 hover:bg-gray-700 text-gray-200 font-extrabold transition-colors"
              >
                Close Player
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

export default Orders;
