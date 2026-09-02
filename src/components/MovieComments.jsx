import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { api } from '../api/endpoints';
import { 
  MessageSquare, Star, Send, Loader2, User, Sparkles, 
  ThumbsUp, ShieldCheck, Clock, Filter 
} from 'lucide-react';
import { toast } from 'react-toastify';
import { io } from 'socket.io-client';

const MovieComments = ({ movieId, initialReviews = [] }) => {
  const { user, openAuthModal } = useAuth();
  const [reviews, setReviews] = useState(initialReviews || []);
  const [commentText, setCommentText] = useState('');
  const [rating, setRating] = useState(9);
  const [hoverRating, setHoverRating] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sortBy, setSortBy] = useState('newest'); // 'newest' | 'highest'

  // Fetch reviews on mount or when movieId changes
  const fetchReviews = async () => {
    if (!movieId) return;
    try {
      const res = await api.get(`/movies/${movieId}/reviews`);
      if (res.data.success) {
        setReviews(res.data.data || []);
      }
    } catch (_) {}
  };

  useEffect(() => {
    if (initialReviews && initialReviews.length > 0) {
      setReviews(initialReviews);
    } else {
      fetchReviews();
    }
  }, [movieId]);

  // Real-time Socket.io Sync for instant comments
  useEffect(() => {
    if (!movieId) return;
    const socket = io('/', { transports: ['websocket', 'polling'] });

    socket.emit('watch_movie', movieId);

    socket.on('new_comment', (newRev) => {
      setReviews((prev) => {
        if (prev.some((r) => r.id === newRev.id)) return prev;
        return [newRev, ...prev];
      });
    });

    return () => {
      socket.emit('leave_movie', movieId);
      socket.disconnect();
    };
  }, [movieId]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    if (!commentText.trim()) {
      toast.warn('Please write a comment first.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.post('/movies/review', {
        movieId,
        rating: Number(rating),
        comment: commentText.trim()
      });

      if (res.data.success) {
        const added = res.data.data;
        setReviews((prev) => {
          if (prev.some((r) => r.id === added.id)) return prev;
          return [added, ...prev];
        });
        setCommentText('');
        toast.success('🎉 Your comment has been posted!');
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to post comment');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Sorted reviews
  const sortedReviews = [...reviews].sort((a, b) => {
    if (sortBy === 'highest') return (b.rating || 0) - (a.rating || 0);
    return new Date(b.createdAt) - new Date(a.createdAt);
  });

  const avgRating = reviews.length > 0
    ? (reviews.reduce((acc, r) => acc + (r.rating || 0), 0) / reviews.length).toFixed(1)
    : '9.0';

  return (
    <div className="bg-theme-card rounded-3xl border border-gray-800/90 p-6 sm:p-8 space-y-8 shadow-2xl">
      
      {/* Header & Stats Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/30 flex items-center justify-center text-theme-gold shadow-gold-sm">
            <MessageSquare className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-xl font-black text-white flex items-center gap-2">
              Viewer Discussions & Reviews
              <span className="text-xs px-2.5 py-0.5 rounded-full bg-slate-800 text-gray-300 font-bold border border-gray-700">
                {reviews.length} Comments
              </span>
            </h3>
            <p className="text-xs text-gray-400">Share your thoughts and review this 4K cinema experience.</p>
          </div>
        </div>

        {/* Rating Overview & Sort Filter */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-xs font-bold text-amber-300">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span>{avgRating} / 10 Average</span>
          </div>

          <div className="flex items-center gap-1 bg-slate-900 border border-gray-800 rounded-xl p-1 text-xs">
            <button
              onClick={() => setSortBy('newest')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'newest' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Latest
            </button>
            <button
              onClick={() => setSortBy('highest')}
              className={`px-3 py-1 rounded-lg font-bold transition-all ${
                sortBy === 'highest' ? 'bg-amber-500 text-black shadow-sm' : 'text-gray-400 hover:text-white'
              }`}
            >
              Top Rated
            </button>
          </div>
        </div>
      </div>

      {/* Post a Comment Form */}
      <form onSubmit={handleSubmit} className="space-y-4 bg-slate-900/80 p-5 rounded-2xl border border-gray-800">
        <div className="flex items-center justify-between">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-theme-gold" /> Write a Review
          </label>

          {/* 1-10 Star Rating Selector */}
          <div className="flex items-center gap-1">
            <span className="text-xs font-bold text-gray-400 mr-1.5">Your Rating:</span>
            {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((star) => (
              <button
                key={star}
                type="button"
                onClick={() => setRating(star)}
                onMouseEnter={() => setHoverRating(star)}
                onMouseLeave={() => setHoverRating(0)}
                className="p-0.5 text-gray-600 hover:scale-125 transition-transform"
                title={`${star} / 10 Stars`}
              >
                <Star
                  className={`w-3.5 sm:w-4 h-3.5 sm:h-4 transition-colors ${
                    (hoverRating || rating) >= star
                      ? 'fill-amber-400 text-amber-400'
                      : 'text-gray-600'
                  }`}
                />
              </button>
            ))}
            <span className="text-xs font-black text-theme-gold ml-1.5">
              {hoverRating || rating}/10
            </span>
          </div>
        </div>

        <div className="relative">
          <textarea
            value={commentText}
            onChange={(e) => setCommentText(e.target.value)}
            placeholder={
              user
                ? `Leave your review, ${user.name || 'Member'}... (What did you think of the cinematography, acting, or story?)`
                : 'Sign in to join the discussion and post your review...'
            }
            rows="3"
            maxLength={1000}
            className="w-full bg-slate-950 border border-gray-800 rounded-xl p-3.5 text-xs sm:text-sm text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none resize-none"
          />
          <div className="absolute right-3 bottom-3 text-[10px] text-gray-500 font-mono">
            {commentText.length}/1000
          </div>
        </div>

        <div className="flex items-center justify-between">
          <div className="text-[11px] text-gray-400">
            {user ? (
              <span className="flex items-center gap-1">
                Posting as <strong className="text-amber-400">{user.name || user.email}</strong>
              </span>
            ) : (
              <span className="text-amber-400/80">Guests will be prompted to sign in</span>
            )}
          </div>

          <button
            type="submit"
            disabled={isSubmitting}
            className="px-5 py-2.5 rounded-xl gold-glow-button text-black font-extrabold text-xs flex items-center gap-2 shadow-md hover:scale-105 transition-all cursor-pointer"
          >
            {isSubmitting ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin" />
            ) : (
              <Send className="w-3.5 h-3.5" />
            )}
            <span>{isSubmitting ? 'Posting...' : 'Post Comment'}</span>
          </button>
        </div>
      </form>

      {/* Comments List */}
      <div className="space-y-4">
        {sortedReviews.length === 0 ? (
          <div className="py-12 text-center space-y-2 border border-dashed border-gray-800 rounded-2xl">
            <MessageSquare className="w-8 h-8 text-gray-600 mx-auto" />
            <p className="text-sm font-bold text-gray-400">No reviews yet.</p>
            <p className="text-xs text-gray-500">Be the first to share your thoughts on this title!</p>
          </div>
        ) : (
          sortedReviews.map((rev) => (
            <div
              key={rev.id || Math.random()}
              className="p-4 sm:p-5 rounded-2xl bg-slate-900/70 border border-gray-800/80 space-y-3 hover:border-gray-700 transition-all shadow-md animate-fade-in-up"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500/20 to-yellow-500/10 border border-amber-500/30 flex items-center justify-center text-theme-gold font-black text-xs shrink-0 shadow-sm">
                    {rev.user?.avatar ? (
                      <img src={rev.user.avatar} alt={rev.user.name} className="w-full h-full object-cover rounded-xl" />
                    ) : (
                      <span>{(rev.user?.name || rev.user?.email || 'U')[0].toUpperCase()}</span>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs sm:text-sm font-black text-white">
                        {rev.user?.name || rev.user?.email?.split('@')[0] || 'Verified Viewer'}
                      </h4>
                      <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                        VERIFIED
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-400 flex items-center gap-1 mt-0.5">
                      <Clock className="w-3 h-3 text-gray-500" />
                      {new Date(rev.createdAt || Date.now()).toLocaleDateString('en-US', {
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                </div>

                {/* Rating Badge */}
                <div className="flex items-center gap-1 bg-amber-500/10 border border-amber-500/30 px-2.5 py-1 rounded-xl text-xs font-black text-amber-400 shrink-0">
                  <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  <span>{rev.rating || 9}/10</span>
                </div>
              </div>

              {/* Comment Body */}
              <p className="text-xs sm:text-sm text-gray-200 leading-relaxed pl-12">
                {rev.comment}
              </p>
            </div>
          ))
        )}
      </div>

    </div>
  );
};

export default MovieComments;
