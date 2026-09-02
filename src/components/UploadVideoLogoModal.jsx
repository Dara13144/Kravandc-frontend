import React, { useState } from 'react';
import { 
  Upload, Image, Sparkles, X, CheckCircle2, Loader2, 
  Trash2, RefreshCw, Film, ShieldCheck 
} from 'lucide-react';
import { api } from '../api/endpoints';
import { toast } from 'react-toastify';

const PRESET_LOGOS = [
  { name: 'Kravan DC Gold Crest', url: '/logo.png' },
  { name: 'Royal Khmer Flower', url: '/kbach-bg.png' },
  { name: '4K Ultra HD Golden Badge', url: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=200' },
];

const UploadVideoLogoModal = ({ isOpen, onClose, movieId, currentLogo, onLogoUpdated }) => {
  const [logoUrl, setLogoUrl] = useState(currentLogo || '/logo.png');
  const [applyToAll, setApplyToAll] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  // Handle local image file upload
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file (PNG, SVG, JPG, WebP).');
      return;
    }

    setUploading(true);
    const reader = new FileReader();
    reader.onload = (event) => {
      setLogoUrl(event.target.result);
      setUploading(false);
      toast.info('Logo loaded into preview!');
    };
    reader.readAsDataURL(file);
  };

  // Save Video Logo directly to backend database
  const handleSaveLogo = async () => {
    if (!logoUrl) {
      toast.error('Please select or upload a logo first.');
      return;
    }

    try {
      setSaving(true);
      const endpoint = (movieId && movieId !== 'undefined') ? `/movies/${movieId}/video-logo` : '/movies/video-logo';
      const res = await api.patch(endpoint, {
        videoLogo: logoUrl,
        updateAll: applyToAll || !movieId || movieId === 'undefined'
      });

      if (res.data.success) {
        toast.success('🎬 Video logo watermark applied successfully!');
        if (onLogoUpdated) onLogoUpdated(logoUrl);
        onClose();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to update video logo.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in-up">
      <div className="relative w-full max-w-lg bg-theme-card border border-amber-500/40 rounded-3xl p-6 sm:p-8 shadow-gold-glow space-y-6">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div>
          <span className="text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full bg-amber-500/20 text-theme-gold border border-amber-500/30">
            VIDEO WATERMARK STUDIO
          </span>
          <h3 className="text-2xl font-black text-white mt-1.5 flex items-center gap-2">
            <Film className="w-6 h-6 text-theme-gold" /> Upload Video Logo
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Custom channel watermark overlay on the video stream with golden animation.
          </p>
        </div>

        {/* Live Video Player Preview HUD */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-gray-300 flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-theme-gold" /> Live Video Overlay Preview
          </label>
          <div className="relative aspect-video w-full rounded-2xl bg-slate-950 border border-gray-800 overflow-hidden shadow-inner flex items-center justify-center">
            {/* Simulated Video Scene Background */}
            <div className="absolute inset-0 bg-gradient-to-tr from-slate-900 via-gray-950 to-slate-900 opacity-90" />
            <span className="text-[11px] font-mono text-gray-500 z-0">4K Ultra HD Video Stream Preview</span>

            {/* 🌟 Live Animated Watermark */}
            <div className="absolute top-4 right-4 z-10 flex items-center gap-2 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-2xl border border-amber-500/40 shadow-gold-sm">
              <img
                src={logoUrl || '/logo.png'}
                alt="Video Logo Watermark"
                className="h-8 w-auto object-contain animate-gold-logo drop-shadow-[0_0_15px_rgba(245,158,11,0.6)]"
              />
              <span className="text-xs font-black tracking-wider text-white">
                <span className="text-amber-400">Kravan</span> DC
              </span>
            </div>
          </div>
        </div>

        {/* File Picker & URL Inputs */}
        <div className="space-y-3">
          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1.5">
              Choose Logo File (PNG / SVG / Transparent):
            </label>
            <label className="flex items-center justify-center gap-2 w-full p-4 rounded-2xl border border-dashed border-gray-700 hover:border-amber-400 bg-slate-900/60 cursor-pointer transition-colors group">
              <Upload className="w-5 h-5 text-amber-400 group-hover:scale-110 transition-transform" />
              <span className="text-xs font-bold text-gray-300 group-hover:text-white">
                {uploading ? 'Reading image...' : 'Click to Browse & Upload Logo'}
              </span>
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </label>
          </div>

          <div>
            <label className="block text-xs font-bold text-gray-300 mb-1">
              Or Paste Image URL:
            </label>
            <input
              type="text"
              value={logoUrl}
              onChange={(e) => setLogoUrl(e.target.value)}
              placeholder="https://your-domain.com/logo.png"
              className="w-full bg-slate-950 border border-gray-800 rounded-xl px-3.5 py-2.5 text-xs text-white placeholder-gray-500 focus:border-amber-400 focus:outline-none font-mono"
            />
          </div>

          {/* Presets */}
          <div>
            <label className="block text-[11px] font-bold text-gray-400 mb-1.5">
              Quick Presets:
            </label>
            <div className="flex flex-wrap gap-2">
              {PRESET_LOGOS.map((p) => (
                <button
                  key={p.name}
                  type="button"
                  onClick={() => setLogoUrl(p.url)}
                  className="px-2.5 py-1 rounded-xl bg-slate-900 hover:bg-amber-500/20 text-[11px] font-bold text-gray-300 hover:text-amber-300 border border-gray-800 transition-all flex items-center gap-1.5"
                >
                  <img src={p.url} alt={p.name} className="w-4 h-4 object-contain rounded" />
                  <span>{p.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Apply to all checkbox */}
          <div className="pt-1">
            <label className="flex items-center gap-2 cursor-pointer select-none">
              <input
                type="checkbox"
                checked={applyToAll}
                onChange={(e) => setApplyToAll(e.target.checked)}
                className="w-4 h-4 accent-amber-500 rounded cursor-pointer"
              />
              <span className="text-xs text-gray-300 font-semibold">
                Apply this watermark logo across all movies & video streams
              </span>
            </label>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 pt-2 border-t border-gray-800">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2.5 rounded-xl border border-gray-700 text-xs font-bold text-gray-300 hover:text-white"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleSaveLogo}
            disabled={saving || !logoUrl}
            className="px-6 py-2.5 rounded-xl gold-glow-button text-black font-extrabold text-xs flex items-center gap-2 shadow-gold-sm hover:scale-105 transition-all cursor-pointer"
          >
            {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
            <span>{saving ? 'Applying...' : 'Apply Logo to Video'}</span>
          </button>
        </div>

      </div>
    </div>
  );
};

export default UploadVideoLogoModal;
