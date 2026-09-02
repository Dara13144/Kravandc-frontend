import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Play, Pause, Volume2, VolumeX, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

const DEFAULT_RELIABLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const HeroSlider = ({ movies = [], onOpenTrailer }) => {
  const navigate = useNavigate();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isMuted, setIsMuted] = useState(true);
  const [isPlaying, setIsPlaying] = useState(true);
  const [videoLoaded, setVideoLoaded] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    if (!movies || movies.length === 0) return;
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % movies.length);
      setVideoLoaded(false);
    }, 12000);
    return () => clearInterval(interval);
  }, [movies]);

  if (!movies || movies.length === 0) return null;

  const currentMovie = movies[currentIndex];
  const videoSrc = currentMovie.videoUrl || DEFAULT_RELIABLE_VIDEO;

  const togglePlay = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  const toggleMute = (e) => {
    e.stopPropagation();
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  return (
    <div
      onClick={() => navigate(`/watch/${currentMovie.slug || currentMovie.id}`)}
      className="relative w-full h-[65vh] lg:h-[80vh] overflow-hidden bg-black cursor-pointer group select-none shadow-2xl"
    >
      <AnimatePresence mode="wait">
        <motion.div
          key={currentMovie.id}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7 }}
          className="absolute inset-0 w-full h-full"
        >
          {/* Fallback Cinematic Poster while video buffers */}
          <img
            src={currentMovie.banner || currentMovie.poster || 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=1600'}
            alt={currentMovie.title}
            className={`absolute inset-0 w-full h-full object-cover object-center transition-opacity duration-700 ${
              videoLoaded ? 'opacity-0' : 'opacity-100'
            }`}
          />

          {/* 🌟 Full Background 4K Video Player */}
          <video
            ref={videoRef}
            key={videoSrc}
            src={videoSrc}
            autoPlay
            loop
            muted={isMuted}
            playsInline
            webkit-playsinline="true"
            x5-playsinline="true"
            onLoadedData={() => setVideoLoaded(true)}
            onError={(e) => {
              // Graceful fallback to reliable stream if provider URL fails
              if (e.target.src !== DEFAULT_RELIABLE_VIDEO) {
                e.target.src = DEFAULT_RELIABLE_VIDEO;
              }
            }}
            className="w-full h-full object-cover object-center"
          />

          {/* Cinematic Vignette Overlays for clean aesthetics */}
          <div className="absolute inset-0 bg-gradient-to-t from-theme-bg via-transparent to-black/60 pointer-events-none" />
          <div className="absolute inset-0 bg-gradient-to-r from-theme-bg/60 via-transparent to-theme-bg/40 pointer-events-none" />

          {/* Glowing Brand Watermark in Top Right */}
          <div className="absolute top-6 right-6 z-20 pointer-events-none flex items-center gap-2 bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-amber-500/30 shadow-gold-sm">
            <img
              src="/logo.png"
              alt="Kravan DC Logo"
              className="h-7 w-auto object-contain animate-gold-logo drop-shadow-[0_0_12px_rgba(245,158,11,0.6)]"
            />
            <span className="text-xs font-black tracking-wider text-white">
              <span className="text-amber-400">Kravan</span> DC
            </span>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Floating Bottom Media Controls: Audio Toggle, Play/Pause, Next/Prev */}
      <div className="absolute right-6 bottom-6 z-30 flex items-center gap-3">
        {/* Audio Mute / Unmute Toggle */}
        <button
          onClick={toggleMute}
          className="p-3 rounded-full bg-black/75 hover:bg-black text-amber-400 border border-amber-500/40 hover:scale-110 transition-all shadow-gold-sm cursor-pointer"
          title={isMuted ? 'Click to Unmute Audio (M)' : 'Mute Audio'}
        >
          {isMuted ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5 text-emerald-400" />}
        </button>

        {/* Play / Pause Toggle */}
        <button
          onClick={togglePlay}
          className="p-3 rounded-full bg-black/75 hover:bg-black text-white hover:text-amber-400 border border-gray-700 hover:border-amber-500/40 hover:scale-110 transition-all shadow-md cursor-pointer"
          title={isPlaying ? 'Pause Video' : 'Play Video'}
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5 fill-white" />}
        </button>

        {/* Previous Slide */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + movies.length) % movies.length);
            setVideoLoaded(false);
          }}
          className="p-3 rounded-full bg-black/75 hover:bg-amber-500 hover:text-black text-white border border-gray-700 transition-all shadow-md cursor-pointer"
          title="Previous Movie"
        >
          <ChevronLeft className="w-5 h-5" />
        </button>

        {/* Next Slide */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % movies.length);
            setVideoLoaded(false);
          }}
          className="p-3 rounded-full bg-black/75 hover:bg-amber-500 hover:text-black text-white border border-gray-700 transition-all shadow-md cursor-pointer"
          title="Next Movie"
        >
          <ChevronRight className="w-5 h-5" />
        </button>
      </div>

      {/* Progress Dots Indicator */}
      <div className="absolute bottom-6 left-6 z-30 flex items-center gap-2">
        {movies.map((m, idx) => (
          <button
            key={m.id || idx}
            onClick={(e) => {
              e.stopPropagation();
              setCurrentIndex(idx);
              setVideoLoaded(false);
            }}
            className={`h-2 rounded-full transition-all duration-300 ${
              idx === currentIndex ? 'w-8 bg-amber-400 shadow-gold-sm' : 'w-2 bg-gray-600 hover:bg-gray-400'
            }`}
          />
        ))}
      </div>
    </div>
  );
};

export default HeroSlider;
