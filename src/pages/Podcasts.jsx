import React, { useState, useEffect } from 'react';
import { podcastAPI, walletAPI } from '../api/endpoints';
import { useWallet } from '../contexts/WalletContext';
import { useAuth } from '../contexts/AuthContext';
import { Radio, Play, Pause, Heart, Volume2, Sparkles, Loader2, Video, DollarSign, X, CheckCircle2, Lock, Tv } from 'lucide-react';
import { toast } from 'react-toastify';

const DEFAULT_FALLBACK_VIDEO = 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4';

const Podcasts = () => {
  const { wallet, fetchWallet } = useWallet();
  const { user, openAuthModal } = useAuth();

  const [podcasts, setPodcasts] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [currentPlaying, setCurrentPlaying] = useState(null);
  const [audioObj, setAudioObj] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [unlockedPodcasts, setUnlockedPodcasts] = useState({});

  // Video Streaming Modal
  const [activeVideoPodcast, setActiveVideoPodcast] = useState(null);

  useEffect(() => {
    const fetchPodcasts = async () => {
      try {
        const res = await podcastAPI.getPodcasts();
        setPodcasts(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch podcasts', err);
      } finally {
        setLoading(false);
      }
    };
    fetchPodcasts();

    return () => {
      if (audioObj) audioObj.pause();
    };
  }, []);

  const handlePlayPodcast = async (pod) => {
    // Check if premium and needs purchase
    if (pod.isPremium && pod.price > 0 && !unlockedPodcasts[pod.id]) {
      if (!user) {
        openAuthModal('login');
        return;
      }

      if ((wallet?.balance || 0) < pod.price) {
        toast.warning(`Insufficient wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}). Please top up.`);
        return;
      }

      if (!window.confirm(`Unlock "${pod.title}" for $${Number(pod.price).toFixed(2)} USD from your wallet?`)) return;

      try {
        await walletAPI.payWithWallet({
          amount: pod.price,
          description: `Unlock Podcast Episode: ${pod.title}`
        });
        setUnlockedPodcasts(prev => ({ ...prev, [pod.id]: true }));
        await fetchWallet();
        toast.success(`Unlocked "${pod.title}"! Enjoy streaming.`);
      } catch (e) {
        toast.error('Failed to unlock podcast: ' + (e.response?.data?.message || e.message));
        return;
      }
    }

    if (currentPlaying?.id === pod.id) {
      if (isPlaying) {
        audioObj?.pause();
        setIsPlaying(false);
      } else {
        audioObj?.play();
        setIsPlaying(true);
      }
      return;
    }

    if (audioObj) audioObj.pause();

    const newAudio = new Audio(pod.audioUrl);
    newAudio.play().catch(e => console.warn('Audio play error:', e.message));
    setAudioObj(newAudio);
    setCurrentPlaying(pod);
    setIsPlaying(true);

    newAudio.onended = () => setIsPlaying(false);
  };

  const handleWatchVideoPodcast = async (pod) => {
    if (pod.isPremium && pod.price > 0 && !unlockedPodcasts[pod.id]) {
      if (!user) {
        openAuthModal('login');
        return;
      }

      if ((wallet?.balance || 0) < pod.price) {
        toast.warning(`Insufficient wallet balance ($${wallet?.balance?.toFixed(2) || '0.00'}). Please top up.`);
        return;
      }

      if (!window.confirm(`Unlock "${pod.title}" for $${Number(pod.price).toFixed(2)} USD from your wallet?`)) return;

      try {
        await walletAPI.payWithWallet({
          amount: pod.price,
          description: `Unlock Video Podcast: ${pod.title}`
        });
        setUnlockedPodcasts(prev => ({ ...prev, [pod.id]: true }));
        await fetchWallet();
        toast.success(`Unlocked "${pod.title}"!`);
      } catch (e) {
        toast.error('Failed to unlock podcast: ' + (e.response?.data?.message || e.message));
        return;
      }
    }

    // Pause background audio when starting video
    if (audioObj) {
      audioObj.pause();
      setIsPlaying(false);
    }

    setActiveVideoPodcast({
      ...pod,
      videoUrl: pod.videoUrl || DEFAULT_FALLBACK_VIDEO
    });
  };

  const handleLike = async (id) => {
    try {
      await podcastAPI.likePodcast(id);
      setPodcasts(prev =>
        prev.map(p => p.id === id ? { ...p, likesCount: (p.likesCount || 0) + 1 } : p)
      );
      toast.success('Liked episode!');
    } catch (err) {
      toast.error('Failed to like podcast');
    }
  };

  const categories = ['ALL', ...new Set(podcasts.map(p => p.category).filter(Boolean))];
  const filteredPodcasts = selectedCategory === 'ALL'
    ? podcasts
    : podcasts.filter(p => p.category === selectedCategory);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8 min-h-screen">
      
      {/* Title */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-gray-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gold-gradient flex items-center justify-center shadow-gold-glow animate-float">
            <Radio className="w-6 h-6 text-black" />
          </div>
          <div>
            <h1 className="text-2xl sm:text-3xl font-black text-white">Kravan DC Podcasts</h1>
            <p className="text-xs text-gray-400">Stream exclusive 4K video podcasts, director interviews, and cinematic masterclasses.</p>
          </div>
        </div>

        {user && (
          <div className="px-4 py-2 rounded-2xl bg-theme-card border border-amber-500/30 text-xs font-bold flex items-center gap-2">
            <span className="text-gray-400">Wallet:</span>
            <span className="text-theme-gold font-black">${wallet?.balance?.toFixed(2) || '0.00'} USD</span>
          </div>
        )}
      </div>

      {/* Category Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-4 py-2 rounded-full text-xs font-extrabold uppercase transition-all whitespace-nowrap ${
              selectedCategory === cat
                ? 'bg-amber-500 text-black shadow-gold-sm scale-105'
                : 'bg-slate-900/90 text-gray-400 hover:text-white border border-gray-800'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="py-20 text-center">
          <Loader2 className="w-10 h-10 text-theme-gold animate-spin mx-auto" />
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredPodcasts.map((pod, idx) => {
            const isUnlocked = !pod.isPremium || pod.price <= 0 || unlockedPodcasts[pod.id];
            const isThisAudioPlaying = currentPlaying?.id === pod.id && isPlaying;

            return (
              <div
                key={pod.id}
                style={{ animationDelay: `${idx * 80}ms` }}
                className="group p-5 rounded-3xl bg-theme-card border border-gray-800 hover-glow-card animate-fade-in-up flex flex-col sm:flex-row gap-4 justify-between"
              >
                {/* Cover with Play Video Overlay */}
                <div
                  onClick={() => handleWatchVideoPodcast(pod)}
                  className="relative w-full sm:w-36 h-36 flex-shrink-0 rounded-2xl overflow-hidden cursor-pointer shadow-md border border-amber-500/20 group/img"
                >
                  <img
                    src={pod.coverImage || 'https://images.unsplash.com/photo-1478737270239-2f02b77fc618?w=500'}
                    alt={pod.title}
                    className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-500"
                  />
                  
                  <span className="absolute top-2 left-2 px-2 py-0.5 rounded-md bg-cyan-950/90 border border-cyan-500/40 text-cyan-300 font-mono text-[9px] font-bold flex items-center gap-1 shadow-sm">
                    <Video className="w-3 h-3" /> 4K VIDEO
                  </span>

                  {/* Play Video Hover Trigger */}
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover/img:opacity-100 transition-opacity flex items-center justify-center">
                    <div className="w-10 h-10 rounded-full bg-cyan-500 text-black flex items-center justify-center shadow-lg transform group-hover/img:scale-110 transition-transform">
                      <Play className="w-5 h-5 fill-black ml-0.5" />
                    </div>
                  </div>
                </div>

                <div className="flex-grow space-y-2 flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-[10px] font-black uppercase text-theme-gold bg-amber-500/10 border border-amber-500/30 px-2.5 py-0.5 rounded-full">
                        {pod.category}
                      </span>
                      
                      {pod.isPremium && pod.price > 0 ? (
                        <span className="text-xs font-black text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2 py-0.5 rounded-md">
                          ${Number(pod.price).toFixed(2)} USD
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold text-gray-400 bg-gray-800 px-2 py-0.5 rounded-md">
                          FREE
                        </span>
                      )}
                    </div>

                    <h3 className="text-sm font-extrabold text-white mt-1.5 line-clamp-1 group-hover:text-amber-400 transition-colors">{pod.title}</h3>
                    <p className="text-xs text-gray-400 line-clamp-2 mt-1 leading-relaxed">{pod.description}</p>
                  </div>

                  <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-gray-800/80">
                    <div className="flex items-center gap-2">
                      {/* Video Podcast Button */}
                      <button
                        onClick={() => handleWatchVideoPodcast(pod)}
                        className="flex items-center gap-1.5 px-4 py-2 rounded-full bg-cyan-500/20 hover:bg-cyan-500 hover:text-black text-cyan-400 font-extrabold text-xs border border-cyan-500/40 transition-all shadow-md active:scale-95"
                      >
                        <Video className="w-3.5 h-3.5" /> Watch 4K Video
                      </button>

                      {/* Audio Button */}
                      <button
                        onClick={() => handlePlayPodcast(pod)}
                        className={`flex items-center gap-1.5 px-3.5 py-2 rounded-full font-bold text-xs transition-all active:scale-95 ${
                          isThisAudioPlaying
                            ? 'bg-emerald-500 text-black shadow-lg animate-pulse font-extrabold'
                            : 'bg-slate-800 hover:bg-slate-700 text-gray-200 border border-gray-700'
                        }`}
                      >
                        {isThisAudioPlaying ? <Pause className="w-3.5 h-3.5 fill-black" /> : <Play className="w-3.5 h-3.5 fill-gray-200" />}
                        {isThisAudioPlaying ? 'Pause Audio' : 'Audio Stream'}
                      </button>
                    </div>

                    <button
                      onClick={() => handleLike(pod.id)}
                      className="flex items-center gap-1 text-xs text-rose-400 hover:text-rose-300 font-bold px-2 py-1 rounded-lg hover:bg-rose-500/10 transition-colors"
                    >
                      <Heart className="w-4 h-4 fill-rose-500/30" /> {pod.likesCount || 0}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Video Podcast Modal Player */}
      {activeVideoPodcast && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-fade-in-up">
          <div className="relative w-full max-w-4xl bg-theme-card border border-cyan-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-4">
            
            <button
              onClick={() => setActiveVideoPodcast(null)}
              className="absolute right-4 top-4 p-2.5 text-gray-400 hover:text-white rounded-full bg-gray-800/80 transition-colors z-10 hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-black uppercase text-cyan-400 tracking-widest block">🎬 4K CINEMA VIDEO PODCAST</span>
              <h3 className="text-2xl font-black text-white mt-0.5">{activeVideoPodcast.title}</h3>
              <p className="text-xs text-gray-400 mt-1">{activeVideoPodcast.description}</p>
            </div>

            <div className="rounded-2xl overflow-hidden bg-black border border-gray-800 aspect-video shadow-2xl">
              {(() => {
                const url = activeVideoPodcast.videoUrl;
                if (!url) return null;

                // 1. Google Drive Folder or File Embed
                const folderMatch = url.match(/drive\.google\.com\/(?:drive\/(?:u\/\d+\/)?folders\/)([a-zA-Z0-9_-]+)/i);
                if (folderMatch) {
                  return (
                    <iframe
                      src={`https://drive.google.com/embeddedfolderview?id=${folderMatch[1]}#grid`}
                      title={activeVideoPodcast.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }
                const gdriveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=|uc\?id=)|docs\.google\.com\/(?:file\/d\/|open\?id=))([a-zA-Z0-9_-]+)/i);
                if (gdriveMatch) {
                  return (
                    <iframe
                      src={`https://drive.google.com/file/d/${gdriveMatch[1]}/preview`}
                      title={activeVideoPodcast.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                // 2. YouTube Embed
                const ytMatch = url.match(/(?:youtu\.be\/|youtube\.com\/(?:embed\/|v\/|watch\?v=|watch\?.+&v=))([\w-]{11})/);
                if (ytMatch) {
                  return (
                    <iframe
                      src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&rel=0`}
                      title={activeVideoPodcast.title}
                      className="w-full h-full border-0"
                      allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                      allowFullScreen
                    />
                  );
                }

                // 3. Direct HTML5 Video Stream
                return (
                  <video
                    src={url}
                    controls
                    autoPlay
                    controlsList="nodownload nofullscreen"
                    disablePictureInPicture
                    onContextMenu={(e) => e.preventDefault()}
                    className="w-full h-full object-contain"
                  >
                    Your browser does not support the video tag.
                  </video>
                );
              })()}
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Podcasts;
