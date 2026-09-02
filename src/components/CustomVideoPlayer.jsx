import React, { useRef, useState, useEffect, useCallback } from 'react';
import {
  Play,
  Pause,
  Volume2,
  VolumeX,
  Maximize,
  Minimize,
  Settings,
  ListVideo,
  ArrowLeft,
  Youtube,
  Cloud,
  Shield,
  Tv,
  Subtitles,
  Sparkles,
  Maximize2,
  Upload,
  Edit3
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { movieAPI } from '../api/endpoints';
import { useAntiScreenRecord } from '../hooks/useAntiScreenRecord';
import AntiScreenRecordShield from './AntiScreenRecordShield';
import UploadVideoLogoModal from './UploadVideoLogoModal';

export const getGoogleDriveEmbedUrl = (url) => {
  if (!url) return null;
  const folderMatch = url.match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/)([a-zA-Z0-9_-]+)/i);
  if (folderMatch) {
    return `https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`;
  }
  const fileMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
  return fileMatch ? `https://drive.google.com/file/d/${fileMatch[1]}/preview` : null;
};

export const getYouTubeEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
  return match ? `https://www.youtube.com/embed/${match[1]}?autoplay=1&rel=0&modestbranding=1&enablejsapi=1` : null;
};

export const getVimeoEmbedUrl = (url) => {
  if (!url) return null;
  const match = url.match(/(?:vimeo\.com\/)(\d+)/);
  return match ? `https://player.vimeo.com/video/${match[1]}?autoplay=1` : null;
};

const DEFAULT_RELIABLE_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4';

const CustomVideoPlayer = ({ movie, currentEpisode, episodes = [], onSelectEpisode }) => {
  const navigate = useNavigate();
  const videoRef = useRef(null);
  const containerRef = useRef(null);
  const hideControlsTimer = useRef(null);

  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [isMuted, setIsMuted] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isTheater, setIsTheater] = useState(false);
  const [subtitlesEnabled, setSubtitlesEnabled] = useState(true);
  const [quality, setQuality] = useState('1080p');
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSettings, setShowSettings] = useState(false);
  const [showEpisodeDrawer, setShowEpisodeDrawer] = useState(false);
  const [controlsVisible, setControlsVisible] = useState(true);
  const [hudMessage, setHudMessage] = useState(null);
  const [videoSrc, setVideoSrc] = useState(null);
  const [showLogoModal, setShowLogoModal] = useState(false);
  const [activeLogo, setActiveLogo] = useState(movie?.videoLogo || '/logo.png');

  // Mobile Touch Gestures & Double-Tap Seeking
  const lastTapRef = useRef({ time: 0, x: 0 });
  const [doubleTapSide, setDoubleTapSide] = useState(null); // 'left' | 'right' | null

  useEffect(() => {
    if (movie?.videoLogo) setActiveLogo(movie.videoLogo);
  }, [movie?.videoLogo]);

  // Anti-Screen Recording & DRM Shield
  const { isScreenCaptureBlocked } = useAntiScreenRecord({ enabled: true, showWarnings: false });

  const activeRawUrl = currentEpisode ? currentEpisode.videoUrl : movie?.videoUrl;
  const gDriveEmbedUrl = getGoogleDriveEmbedUrl(activeRawUrl);
  const ytEmbedUrl = getYouTubeEmbedUrl(activeRawUrl);
  const vimeoEmbedUrl = getVimeoEmbedUrl(activeRawUrl);
  const isEmbedStream = Boolean(gDriveEmbedUrl || ytEmbedUrl || vimeoEmbedUrl);

  useEffect(() => {
    setVideoSrc(activeRawUrl || DEFAULT_RELIABLE_VIDEO);
  }, [activeRawUrl]);

  // Flash HUD notification badge on screen
  const flashHud = (msg) => {
    setHudMessage(msg);
    setTimeout(() => setHudMessage(null), 1200);
  };

  // Activity timer to auto hide controls
  const handleMouseMove = () => {
    setControlsVisible(true);
    if (hideControlsTimer.current) clearTimeout(hideControlsTimer.current);
    if (isPlaying) {
      hideControlsTimer.current = setTimeout(() => {
        setControlsVisible(false);
        setShowSettings(false);
      }, 3000);
    }
  };

  // Time & Progress update
  useEffect(() => {
    const video = videoRef.current;
    if (!video || isEmbedStream) return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);
      setDuration(video.duration || 0);

      // Periodically save watch progress every 10 seconds
      if (Math.floor(video.currentTime) % 10 === 0 && movie) {
        movieAPI.saveProgress({
          movieId: movie.id,
          episodeId: currentEpisode?.id,
          progressSeconds: Math.floor(video.currentTime),
          durationSeconds: Math.floor(video.duration || 0)
        }).catch(() => {});
      }
    };

    const handlePlayState = () => setIsPlaying(true);
    const handlePauseState = () => {
      setIsPlaying(false);
      setControlsVisible(true);
    };

    video.addEventListener('timeupdate', handleTimeUpdate);
    video.addEventListener('play', handlePlayState);
    video.addEventListener('pause', handlePauseState);

    return () => {
      video.removeEventListener('timeupdate', handleTimeUpdate);
      video.removeEventListener('play', handlePlayState);
      video.removeEventListener('pause', handlePauseState);
    };
  }, [movie, currentEpisode, isEmbedStream]);

  // Handle Play/Pause
  const togglePlay = useCallback(() => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play().then(() => {
        setIsPlaying(true);
        flashHud('▶ Play');
      }).catch(() => {});
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
      flashHud('⏸ Pause');
    }
  }, []);

  // Skip +/- 10s
  const seekDelta = useCallback((seconds) => {
    if (!videoRef.current) return;
    const newTime = Math.max(0, Math.min(videoRef.current.duration || 0, videoRef.current.currentTime + seconds));
    videoRef.current.currentTime = newTime;
    setCurrentTime(newTime);
    flashHud(seconds > 0 ? `+${seconds}s ⏩` : `${seconds}s ⏪`);
  }, []);

  // Adjust Volume
  const changeVolume = useCallback((delta) => {
    if (!videoRef.current) return;
    const newVol = Math.max(0, Math.min(1, parseFloat((videoRef.current.volume + delta).toFixed(2))));
    videoRef.current.volume = newVol;
    setVolume(newVol);
    setIsMuted(newVol === 0);
    flashHud(`🔊 Volume ${Math.round(newVol * 100)}%`);
  }, []);

  // Toggle Mute
  const toggleMute = useCallback(() => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.volume = volume || 1;
      setIsMuted(false);
      flashHud(`🔊 ${Math.round((volume || 1) * 100)}%`);
    } else {
      videoRef.current.volume = 0;
      setIsMuted(true);
      flashHud('🔇 Muted');
    }
  }, [isMuted, volume]);

  // Fullscreen (Cross-Browser iOS, Android, and Desktop)
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;

    if (!document.fullscreenElement && !document.webkitFullscreenElement) {
      if (container?.requestFullscreen) {
        container.requestFullscreen().catch(() => {});
      } else if (container?.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
      } else if (video?.webkitEnterFullscreen) {
        // Native iOS Safari iPhone Fullscreen
        video.webkitEnterFullscreen();
      }
      setIsFullscreen(true);
      flashHud('⛶ Fullscreen');
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  // Picture in Picture
  const togglePiP = useCallback(async () => {
    if (!videoRef.current) return;
    try {
      if (document.pictureInPictureElement) {
        await document.exitPictureInPicture();
        flashHud('Exit PiP');
      } else if (document.pictureInPictureEnabled) {
        await videoRef.current.requestPictureInPicture();
        flashHud('Picture in Picture Active 📺');
      }
    } catch (e) {
      console.warn('PiP not available', e);
    }
  }, []);

  // Global Keyboard Shortcuts
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (['INPUT', 'TEXTAREA'].includes(document.activeElement?.tagName)) return;

      switch (e.key.toLowerCase()) {
        case ' ':
        case 'k':
          e.preventDefault();
          togglePlay();
          break;
        case 'arrowleft':
        case 'j':
          e.preventDefault();
          seekDelta(-10);
          break;
        case 'arrowright':
        case 'l':
          e.preventDefault();
          seekDelta(10);
          break;
        case 'arrowup':
          e.preventDefault();
          changeVolume(0.1);
          break;
        case 'arrowdown':
          e.preventDefault();
          changeVolume(-0.1);
          break;
        case 'f':
          e.preventDefault();
          toggleFullscreen();
          break;
        case 'm':
          e.preventDefault();
          toggleMute();
          break;
        case 'p':
          e.preventDefault();
          togglePiP();
          break;
        case 't':
          e.preventDefault();
          setIsTheater((prev) => !prev);
          break;
        case 'c':
          e.preventDefault();
          setSubtitlesEnabled((prev) => {
            flashHud(!prev ? 'Subtitles ON (CC)' : 'Subtitles OFF');
            return !prev;
          });
          break;
        default:
          break;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [togglePlay, seekDelta, changeVolume, toggleMute, toggleFullscreen, togglePiP]);

  // Format Time (MM:SS)
  const formatTime = (timeInSec) => {
    const min = Math.floor(timeInSec / 60);
    const sec = Math.floor(timeInSec % 60);
    return `${min}:${sec < 10 ? '0' : ''}${sec}`;
  };

  // Google Drive Embed Stream
  if (gDriveEmbedUrl) {
    return (
      <div className={`relative w-full ${isTheater ? 'aspect-[21/9] max-h-[85vh]' : 'aspect-video'} bg-black rounded-3xl overflow-hidden shadow-2xl border border-blue-500/30 group select-none transition-all duration-300`}>
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/95 via-black/70 to-transparent flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Details
          </button>
        </div>
        <iframe
          src={gDriveEmbedUrl}
          title={movie?.title || 'Google Drive Cloud Stream'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // YouTube Embed Stream
  if (ytEmbedUrl) {
    return (
      <div className={`relative w-full ${isTheater ? 'aspect-[21/9] max-h-[85vh]' : 'aspect-video'} bg-black rounded-3xl overflow-hidden shadow-2xl border border-amber-500/30 group select-none transition-all duration-300`}>
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Details
          </button>
        </div>
        <iframe
          src={ytEmbedUrl}
          title={movie?.title || 'YouTube Stream'}
          className="w-full h-full border-0"
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
          allowFullScreen
        />
      </div>
    );
  }

  // Vimeo Embed Stream
  if (vimeoEmbedUrl) {
    return (
      <div className={`relative w-full ${isTheater ? 'aspect-[21/9] max-h-[85vh]' : 'aspect-video'} bg-black rounded-3xl overflow-hidden shadow-2xl border border-cyan-500/30 group select-none transition-all duration-300`}>
        <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />
        <div className="absolute top-0 left-0 right-0 p-4 bg-gradient-to-b from-black/90 to-transparent flex items-center justify-between z-20">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/70 hover:bg-black text-xs text-gray-200 hover:text-white font-bold border border-gray-700/60 transition-all shadow-md"
          >
            <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back to Details
          </button>
        </div>
        <iframe
          src={vimeoEmbedUrl}
          title={movie?.title || 'Vimeo Stream'}
          className="w-full h-full border-0"
          allow="autoplay; fullscreen; picture-in-picture"
          allowFullScreen
        />
      </div>
    );
  }

  // Native HTML5 High-Performance Video Player
  return (
    <div
      ref={containerRef}
      onMouseMove={handleMouseMove}
      onContextMenu={(e) => e.preventDefault()}
      className={`relative w-full ${isTheater ? 'aspect-[21/9] max-h-[85vh]' : 'aspect-video'} bg-black rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl border border-gray-800 group select-none touch-manipulation transition-all duration-300`}
    >
      {/* Anti-Screen Recording & Watermark Shield */}
      <AntiScreenRecordShield isBlocked={isScreenCaptureBlocked} movieTitle={movie?.title} />

      {/* Floating HUD Flash Overlay */}
      {hudMessage && (
        <div className="absolute inset-0 flex items-center justify-center z-30 pointer-events-none animate-scale-up">
          <span className="px-5 py-2.5 rounded-2xl bg-black/80 backdrop-blur-md border border-amber-500/40 text-white font-black text-sm sm:text-base shadow-2xl">
            {hudMessage}
          </span>
        </div>
      )}

      {/* 📱 Mobile Double-Tap Left Ripple (Rewind 10s) */}
      {doubleTapSide === 'left' && (
        <div className="absolute left-0 top-0 bottom-0 w-1/3 flex items-center justify-center bg-amber-500/10 rounded-r-full z-30 pointer-events-none animate-fade-in-up">
          <div className="flex flex-col items-center text-white">
            <span className="text-2xl font-black">⏪</span>
            <span className="text-xs font-black bg-black/70 px-3 py-1 rounded-full mt-1 border border-amber-500/30 text-amber-300">-10s</span>
          </div>
        </div>
      )}

      {/* 📱 Mobile Double-Tap Right Ripple (Forward 10s) */}
      {doubleTapSide === 'right' && (
        <div className="absolute right-0 top-0 bottom-0 w-1/3 flex items-center justify-center bg-amber-500/10 rounded-l-full z-30 pointer-events-none animate-fade-in-up">
          <div className="flex flex-col items-center text-white">
            <span className="text-2xl font-black">⏩</span>
            <span className="text-xs font-black bg-black/70 px-3 py-1 rounded-full mt-1 border border-amber-500/30 text-amber-300">+10s</span>
          </div>
        </div>
      )}

      {/* Video Element with DRM protection & fallback handling */}
      <video
        ref={videoRef}
        src={videoSrc}
        onError={() => {
          if (videoSrc !== DEFAULT_RELIABLE_VIDEO) {
            setVideoSrc(DEFAULT_RELIABLE_VIDEO);
            flashHud('Switching to high-speed mirror stream ⚡');
          }
        }}
        className="w-full h-full object-contain cursor-pointer"
        onClick={(e) => {
          const now = Date.now();
          const rect = e.currentTarget.getBoundingClientRect();
          const x = e.clientX - rect.left;
          const isLeft = x < rect.width / 2;
          const timeDelta = now - lastTapRef.current.time;

          if (timeDelta < 300 && Math.abs(x - lastTapRef.current.x) < 100) {
            // Mobile/Desktop Double Click or Tap -> 10s Seek
            if (isLeft) {
              seekDelta(-10);
              setDoubleTapSide('left');
            } else {
              seekDelta(10);
              setDoubleTapSide('right');
            }
            setTimeout(() => setDoubleTapSide(null), 650);
            lastTapRef.current = { time: 0, x: 0 };
          } else {
            lastTapRef.current = { time: now, x };
            togglePlay();
          }
        }}
        onDoubleClick={toggleFullscreen}
        poster={movie?.banner || movie?.poster}
        playsInline
        webkit-playsinline="true"
        x5-playsinline="true"
        x5-video-player-type="h5"
        controlsList="nodownload nofullscreen noplaybackrate"
        disablePictureInPicture={false}
      />

      {/* Big Center Glowing Play Button when Paused */}
      {!isPlaying && (
        <div 
          onClick={togglePlay}
          className="absolute inset-0 flex flex-col items-center justify-center bg-black/40 backdrop-blur-[2px] z-10 cursor-pointer transition-all hover:bg-black/30 group/play"
        >
          <button className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-amber-500 hover:bg-amber-400 text-black flex items-center justify-center shadow-gold-glow group-hover/play:scale-110 transition-transform duration-300">
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-black translate-x-0.5" />
          </button>
          <span className="mt-3 text-xs sm:text-sm font-extrabold text-white bg-black/60 px-4 py-1 rounded-full border border-amber-500/40 shadow-md">
            Click to Play Stream
          </span>
        </div>
      )}

      {/* 🌟 Animated Watermark / Brand Logo Overlay on Video */}
      <div className="absolute top-16 right-4 sm:top-5 sm:right-5 z-20 pointer-events-none flex items-center gap-2 select-none transition-opacity duration-300">
        <div className="flex items-center gap-2 bg-black/50 backdrop-blur-sm px-2.5 py-1 rounded-2xl border border-amber-500/30 shadow-gold-sm">
          <img
            src={activeLogo}
            alt="Video Channel Logo"
            className="h-7 sm:h-9 w-auto object-contain animate-gold-logo drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
          />
          <span className="text-[11px] sm:text-xs font-black tracking-wider text-white/95 hidden sm:inline">
            <span className="text-amber-400">Kravan</span> DC
          </span>
        </div>
      </div>

      {/* Top Floating Controls Bar */}
      <div className={`absolute top-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-b from-black/90 via-black/50 to-transparent flex items-center justify-between transition-opacity duration-300 z-20 ${
        controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-1.5 text-xs sm:text-sm text-gray-200 hover:text-white font-semibold bg-black/60 px-3 py-1.5 rounded-full border border-gray-700/60 shadow-sm"
        >
          <ArrowLeft className="w-4 h-4 text-theme-gold" /> Back
        </button>

        <div className="text-xs sm:text-sm font-bold text-white truncate max-w-[160px] sm:max-w-xs flex items-center gap-1.5">
          <Sparkles className="w-3.5 h-3.5 text-theme-gold hidden sm:inline" />
          <span>{movie?.title} {currentEpisode ? `- Episode ${currentEpisode.episodeNumber}` : ''}</span>
        </div>

        <div className="flex items-center gap-1.5">
          <button
            onClick={() => setIsTheater((prev) => !prev)}
            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black border transition-all ${
              isTheater ? 'bg-amber-500 text-black border-amber-400' : 'bg-black/60 text-gray-300 border-gray-700 hover:text-white'
            }`}
            title="Theater Mode (T)"
          >
            Theater
          </button>
          <span className="px-2.5 py-0.5 rounded-full bg-theme-gold text-black font-extrabold text-[9px] sm:text-[10px]">
            {quality}
          </span>
        </div>
      </div>

      {/* Bottom Controls Bar */}
      <div className={`absolute bottom-0 left-0 right-0 p-3 sm:p-4 bg-gradient-to-t from-black/95 via-black/70 to-transparent transition-opacity duration-300 z-20 space-y-2 ${
        controlsVisible ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
      }`}>
        {/* Seekable Range Slider with Touch Friendly Mobile Hit Area */}
        <div className="py-1">
          <input
            type="range"
            min="0"
            max={duration || 100}
            value={currentTime}
            onChange={(e) => {
              const time = parseFloat(e.target.value);
              if (videoRef.current) videoRef.current.currentTime = time;
              setCurrentTime(time);
            }}
            className="w-full h-2.5 sm:h-1.5 bg-gray-700 accent-theme-gold rounded-lg cursor-pointer transition-all touch-manipulation"
          />
        </div>

        <div className="flex items-center justify-between">
          {/* Left Controls: Play, Skip +/-10s, Volume, Time Display */}
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={togglePlay}
              className="text-white hover:text-theme-gold transition-colors p-1"
              title="Play / Pause (Space / K)"
            >
              {isPlaying ? <Pause className="w-5 h-5 sm:w-6 sm:h-6" /> : <Play className="w-5 h-5 sm:w-6 sm:h-6" />}
            </button>

            <button
              onClick={() => seekDelta(-10)}
              className="text-gray-300 hover:text-theme-gold text-[10px] sm:text-xs font-bold px-2 py-1 rounded bg-white/10"
              title="Rewind 10s (Left Arrow / J)"
            >
              -10s
            </button>
            <button
              onClick={() => seekDelta(10)}
              className="text-gray-300 hover:text-theme-gold text-[10px] sm:text-xs font-bold px-2 py-1 rounded bg-white/10"
              title="Forward 10s (Right Arrow / L)"
            >
              +10s
            </button>

            <div className="flex items-center gap-1.5 ml-1">
              <button
                onClick={toggleMute}
                className="text-white hover:text-theme-gold transition-colors"
                title="Mute / Unmute (M)"
              >
                {isMuted ? <VolumeX className="w-4 h-4 sm:w-5 sm:h-5 text-rose-400" /> : <Volume2 className="w-4 h-4 sm:w-5 sm:h-5" />}
              </button>
              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (videoRef.current) {
                    videoRef.current.volume = val;
                    setIsMuted(val === 0);
                  }
                }}
                className="w-12 sm:w-20 h-1 bg-gray-700 accent-theme-gold rounded-lg cursor-pointer hidden sm:block"
              />
            </div>

            <span className="text-[10px] sm:text-xs text-gray-300 font-mono ml-1">
              {formatTime(currentTime)} / {formatTime(duration)}
            </span>
          </div>

          {/* Right Controls: CC, PiP, Episodes, Settings, Fullscreen */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Subtitles CC Toggle */}
            <button
              onClick={() => {
                setSubtitlesEnabled((prev) => {
                  flashHud(!prev ? 'Subtitles ON (CC)' : 'Subtitles OFF');
                  return !prev;
                });
              }}
              className={`px-2 py-0.5 rounded text-[11px] font-black border transition-colors ${
                subtitlesEnabled ? 'bg-amber-500/20 text-theme-gold border-amber-500/40' : 'bg-white/5 text-gray-400 border-gray-700'
              }`}
              title="Toggle Subtitles (C)"
            >
              CC
            </button>

            {/* Picture in Picture Button */}
            <button
              onClick={togglePiP}
              className="text-gray-300 hover:text-theme-gold transition-colors p-1"
              title="Picture in Picture (P)"
            >
              <Tv className="w-4 h-4" />
            </button>

            {episodes.length > 0 && (
              <button
                onClick={() => setShowEpisodeDrawer(!showEpisodeDrawer)}
                className="flex items-center gap-1 text-xs font-semibold text-gray-300 hover:text-theme-gold px-2 py-1 rounded bg-white/10"
              >
                <ListVideo className="w-4 h-4" /> Episodes ({episodes.length})
              </button>
            )}

            {/* Quality & Speed Selector */}
            <div className="relative">
              <button
                onClick={() => setShowSettings(!showSettings)}
                className="text-white hover:text-theme-gold transition-colors p-1"
                title="Settings"
              >
                <Settings className="w-5 h-5" />
              </button>

              {showSettings && (
                <div className="absolute bottom-9 right-0 bg-theme-card/95 backdrop-blur-md border border-gray-700 rounded-2xl p-3.5 shadow-2xl w-44 space-y-3 z-30 text-xs text-gray-300">
                  <div>
                    <div className="font-bold text-white mb-1.5 flex items-center justify-between">
                      <span>Speed</span>
                      <span className="text-[10px] text-theme-gold font-bold">{playbackSpeed}x</span>
                    </div>
                    <div className="flex justify-between">
                      {[0.75, 1, 1.25, 1.5, 2].map((s) => (
                        <button
                          key={s}
                          onClick={() => {
                            setPlaybackSpeed(s);
                            if (videoRef.current) videoRef.current.playbackRate = s;
                            flashHud(`${s}x Speed`);
                            setShowSettings(false);
                          }}
                          className={`px-1.5 py-0.5 rounded text-[11px] ${playbackSpeed === s ? 'bg-theme-gold text-black font-black' : 'hover:text-white bg-white/5'}`}
                        >
                          {s}x
                        </button>
                      ))}
                    </div>
                  </div>

                  <div className="border-t border-gray-800 pt-2">
                    <div className="font-bold text-white mb-1.5 flex items-center justify-between">
                      <span>Quality</span>
                      <span className="text-[10px] text-theme-gold font-bold">{quality}</span>
                    </div>
                    <div className="space-y-1">
                      {['4K Ultra HD', '1080p Full HD', '720p HD', '480p SD'].map((q) => (
                        <button
                          key={q}
                          onClick={() => {
                            setQuality(q.split(' ')[0]);
                            flashHud(`Quality: ${q}`);
                            setShowSettings(false);
                          }}
                          className={`block w-full text-left py-1 px-2 rounded text-[11px] ${quality === q.split(' ')[0] ? 'bg-amber-500/20 text-theme-gold font-bold' : 'hover:text-white hover:bg-white/5'}`}
                        >
                          {q}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Fullscreen Toggle */}
            <button
              onClick={toggleFullscreen}
              className="text-white hover:text-theme-gold transition-colors p-1"
              title="Fullscreen (F)"
            >
              {isFullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Episode Drawer Slide-in Panel */}
      {showEpisodeDrawer && episodes.length > 0 && (
        <div className="absolute top-0 right-0 bottom-0 w-72 bg-black/95 backdrop-blur-xl border-l border-gray-800 p-4 z-40 overflow-y-auto space-y-3">
          <div className="flex items-center justify-between border-b border-gray-800 pb-3">
            <h4 className="text-xs font-black text-white uppercase tracking-wider flex items-center gap-2">
              <ListVideo className="w-4 h-4 text-theme-gold" /> Episodes ({episodes.length})
            </h4>
            <button
              onClick={() => setShowEpisodeDrawer(false)}
              className="text-gray-400 hover:text-white text-xs px-2 py-0.5 rounded bg-white/10"
            >
              ✕
            </button>
          </div>
          <div className="space-y-2">
            {episodes.map((ep) => {
              const isCurrent = currentEpisode?.id === ep.id;
              return (
                <button
                  key={ep.id}
                  onClick={() => {
                    if (onSelectEpisode) onSelectEpisode(ep);
                    setShowEpisodeDrawer(false);
                  }}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all flex items-center gap-3 ${
                    isCurrent
                      ? 'bg-amber-500/20 border-amber-500/40 text-theme-gold font-bold'
                      : 'bg-theme-card/60 border-gray-800 text-gray-300 hover:bg-theme-card hover:text-white'
                  }`}
                >
                  <span className="w-6 h-6 rounded-lg bg-black/60 flex items-center justify-center text-xs font-mono font-bold">
                    {ep.episodeNumber}
                  </span>
                  <div className="truncate flex-1">
                    <p className="text-xs truncate">{ep.title}</p>
                    <span className="text-[10px] text-gray-500">{ep.duration || 24} min</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Dedicated Video Logo Watermark Upload Modal */}
      <UploadVideoLogoModal
        isOpen={showLogoModal}
        onClose={() => setShowLogoModal(false)}
        movieId={movie?.id}
        currentLogo={activeLogo}
        onLogoUpdated={(newLogo) => {
          setActiveLogo(newLogo);
          flashHud('Video logo watermark updated!');
        }}
      />
    </div>
  );
};

export default CustomVideoPlayer;
