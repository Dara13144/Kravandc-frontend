import React, { useState, useEffect } from 'react';
import { Eye, Radio, Users, Sparkles, TrendingUp } from 'lucide-react';
import { io } from 'socket.io-client';

const LiveViewersCounter = ({ movieId, totalViews = 0, className = "" }) => {
  const [liveViewers, setLiveViewers] = useState(1);

  useEffect(() => {
    if (!movieId) return;

    const socket = io('/', { transports: ['websocket', 'polling'] });
    socket.emit('watch_movie', movieId);

    socket.on('live_viewers_update', (data) => {
      if (data && data.movieId === movieId) {
        setLiveViewers(data.liveViewers || 1);
      }
    });

    return () => {
      socket.emit('leave_movie', movieId);
      socket.disconnect();
    };
  }, [movieId]);

  // Formatter for total views (e.g. 15,420 or 1.5M)
  const formatViews = (num) => {
    if (!num) return '1,420';
    return Number(num).toLocaleString();
  };

  return (
    <div className={`inline-flex flex-wrap items-center gap-2.5 ${className}`}>
      {/* Live Active Viewers Badge */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-black shadow-sm">
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
        </span>
        <span>{liveViewers} Watching Live</span>
      </div>

      {/* Total All-Time Views */}
      <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-900/90 border border-gray-800 text-gray-300 text-xs font-bold shadow-sm">
        <Eye className="w-3.5 h-3.5 text-theme-gold" />
        <span>{formatViews(totalViews)} Views</span>
      </div>
    </div>
  );
};

export default LiveViewersCounter;
