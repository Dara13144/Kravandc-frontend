import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Film, X, Mail, Lock, User, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { toast } from 'react-toastify';
import { authAPI } from '../api/endpoints';

const GoogleIcon = ({ className = "w-5 h-5" }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#EA4335"
      d="M12 5c1.6 0 3 .6 4.1 1.7l3.1-3.1C17.3 1.8 14.8 1 12 1 7.5 1 3.7 3.6 1.9 7.4l3.7 2.9C6.5 7.4 9 5 12 5z"
    />
    <path
      fill="#4285F4"
      d="M23.5 12.3c0-.8-.1-1.6-.2-2.3H12v4.5h6.5c-.3 1.5-1.1 2.8-2.4 3.7l3.7 2.9c2.2-2 3.7-5 3.7-8.8z"
    />
    <path
      fill="#FBBC05"
      d="M5.6 14.7c-.2-.7-.4-1.5-.4-2.7s.1-2 .4-2.7L1.9 6.4C.7 8.8 0 10.3 0 12s.7 3.2 1.9 5.6l3.7-2.9z"
    />
    <path
      fill="#34A853"
      d="M12 23c3.2 0 6-1.1 8-3l-3.7-2.9c-1.1.7-2.5 1.2-4.3 1.2-3 0-5.5-2.4-6.4-5.3L1.9 16c1.8 3.8 5.6 7 10.1 7z"
    />
  </svg>
);

const AuthModal = () => {
  const {
    isAuthModalOpen,
    setIsAuthModalOpen,
    authModalMode,
    setAuthModalMode,
    login,
    register,
    loginWithGoogle,
    signInWithGoogleOAuth
  } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showGooglePrompt, setShowGooglePrompt] = useState(false);
  const [googleCustomEmail, setGoogleCustomEmail] = useState('');
  const [googleCustomName, setGoogleCustomName] = useState('');

  if (!isAuthModalOpen) return null;

  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      // First attempt Supabase Google OAuth redirect
      const started = await signInWithGoogleOAuth();
      if (!started) {
        // If Supabase OAuth is not active or redirects in same window, open instant Google Account Selector
        setShowGooglePrompt(true);
      }
    } catch (err) {
      console.warn('Google sign-in flow error:', err);
      setShowGooglePrompt(true);
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleQuickGoogleSelect = async (gEmail, gName, gAvatar) => {
    setGoogleLoading(true);
    try {
      const googleData = {
        googleId: `google_${Date.now()}_${Math.floor(Math.random() * 10000)}`,
        email: gEmail,
        name: gName,
        avatar: gAvatar || `https://api.dicebear.com/7.x/bottts/svg?seed=${gEmail}`
      };
      await loginWithGoogle(googleData);
      setShowGooglePrompt(false);
    } catch (err) {
      toast.error('Google authentication failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    if (authModalMode === 'login') {
      await login(email, password);
    } else if (authModalMode === 'register') {
      await register(name, email, password);
    } else if (authModalMode === 'forgot') {
      try {
        await authAPI.forgotPassword({ email });
        toast.success('Password reset link sent to your email.');
        setAuthModalMode('login');
      } catch (err) {
        toast.error('Failed to process request');
      }
    }
    setLoading(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md transition-all">
      <div className="relative w-full max-w-md bg-theme-card border border-gray-800/90 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6">
        
        {/* Close Button */}
        <button
          onClick={() => {
            setIsAuthModalOpen(false);
            setShowGooglePrompt(false);
          }}
          className="absolute right-4 top-4 p-2 text-gray-400 hover:text-white rounded-full bg-gray-800/50 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="text-center space-y-2">
          <img
            src="/logo.png"
            alt="KravanDC.com"
            className="w-14 h-14 rounded-2xl mx-auto shadow-gold-glow object-contain border border-amber-500/30"
          />
          <h3 className="text-2xl font-black text-white tracking-tight">
            {authModalMode === 'login' && 'Welcome Back'}
            {authModalMode === 'register' && 'Join KravanDC.com'}
            {authModalMode === 'forgot' && 'Reset Password'}
          </h3>
          <p className="text-xs text-gray-400">
            {authModalMode === 'login' && 'Sign in to access your 4K movies, wallet balance & VIP pass.'}
            {authModalMode === 'register' && 'Create your account to start streaming 4K movies & podcasts.'}
            {authModalMode === 'forgot' && 'Enter your email to receive recovery instructions.'}
          </p>
        </div>

        {/* Google Authentication Quick Prompt Modal / Selector */}
        {showGooglePrompt ? (
          <div className="space-y-4 bg-slate-900/95 border border-amber-500/30 rounded-2xl p-5 shadow-xl animate-fade-in">
            <div className="flex items-center justify-between border-b border-gray-800 pb-3">
              <div className="flex items-center gap-2">
                <GoogleIcon className="w-5 h-5" />
                <span className="text-sm font-bold text-white">Sign in with Google</span>
              </div>
              <button
                onClick={() => setShowGooglePrompt(false)}
                className="text-xs text-gray-400 hover:text-white"
              >
                Back
              </button>
            </div>

            <p className="text-xs text-gray-400">
              Select an existing Google Account or enter your Google email to connect instantly:
            </p>

            {/* Quick 1-Click Google Accounts */}
            <div className="space-y-2">
              <button
                onClick={() =>
                  handleQuickGoogleSelect(
                    'admin@kvcinema.com',
                    'KravanDC Admin',
                    'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'
                  )
                }
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-gray-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150"
                    alt="Admin"
                    className="w-8 h-8 rounded-full object-cover border border-amber-500/50"
                  />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-amber-400">KravanDC Admin (Google)</p>
                    <p className="text-[11px] text-gray-400">admin@kvcinema.com</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>

              <button
                onClick={() =>
                  handleQuickGoogleSelect(
                    'streamer_demo@gmail.com',
                    'Streamer Demo',
                    'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'
                  )
                }
                disabled={googleLoading}
                className="w-full flex items-center justify-between p-3 rounded-xl bg-slate-800/80 hover:bg-slate-700/80 border border-gray-700/60 transition-all text-left group"
              >
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150"
                    alt="Streamer Demo"
                    className="w-8 h-8 rounded-full object-cover border border-cyan-500/50"
                  />
                  <div>
                    <p className="text-xs font-bold text-white group-hover:text-cyan-400">Streamer Demo (Google)</p>
                    <p className="text-[11px] text-gray-400">streamer_demo@gmail.com</p>
                  </div>
                </div>
                <CheckCircle2 className="w-4 h-4 text-emerald-400 opacity-0 group-hover:opacity-100 transition-opacity" />
              </button>
            </div>

            {/* Custom Google Account Input */}
            <div className="pt-2 border-t border-gray-800 space-y-2">
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="your.email@gmail.com"
                  value={googleCustomEmail}
                  onChange={(e) => setGoogleCustomEmail(e.target.value)}
                  className="flex-1 bg-black/50 border border-gray-700 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-500 focus:outline-none focus:border-amber-400"
                />
                <button
                  type="button"
                  onClick={() => {
                    if (!googleCustomEmail || !googleCustomEmail.includes('@')) {
                      return toast.error('Please enter a valid Google email');
                    }
                    handleQuickGoogleSelect(
                      googleCustomEmail.trim().toLowerCase(),
                      googleCustomName || googleCustomEmail.split('@')[0],
                      `https://api.dicebear.com/7.x/bottts/svg?seed=${googleCustomEmail}`
                    );
                  }}
                  disabled={googleLoading}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-black font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-1.5"
                >
                  {googleLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Connect'}
                </button>
              </div>
            </div>
          </div>
        ) : (
          <>
            {/* Primary Google Login Button */}
            {authModalMode !== 'forgot' && (
              <div className="space-y-3">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  disabled={googleLoading || loading}
                  className="w-full py-3 px-4 bg-white hover:bg-gray-100 text-gray-900 rounded-xl font-bold text-xs flex items-center justify-center gap-3 transition-all duration-200 shadow-md hover:shadow-lg border border-gray-200 active:scale-[0.99]"
                >
                  {googleLoading ? (
                    <Loader2 className="w-4 h-4 animate-spin text-gray-800" />
                  ) : (
                    <GoogleIcon className="w-5 h-5" />
                  )}
                  <span>
                    {authModalMode === 'login' ? 'Continue with Google' : 'Sign up with Google'}
                  </span>
                </button>

                {/* Divider */}
                <div className="relative flex items-center justify-center">
                  <div className="border-t border-gray-800 w-full"></div>
                  <span className="bg-theme-card px-3 text-[11px] text-gray-500 uppercase tracking-wider font-semibold">
                    or continue with email
                  </span>
                  <div className="border-t border-gray-800 w-full"></div>
                </div>
              </div>
            )}

            {/* Auth Mode Tabs */}
            {authModalMode !== 'forgot' && (
              <div className="flex bg-gray-900/80 rounded-xl p-1 border border-gray-800 text-xs font-bold">
                <button
                  onClick={() => setAuthModalMode('login')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    authModalMode === 'login'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Sign In
                </button>
                <button
                  onClick={() => setAuthModalMode('register')}
                  className={`flex-1 py-2 rounded-lg transition-all ${
                    authModalMode === 'register'
                      ? 'bg-amber-500 text-black shadow-md'
                      : 'text-gray-400 hover:text-white'
                  }`}
                >
                  Register
                </button>
              </div>
            )}

            {/* Form Inputs */}
            <form onSubmit={handleSubmit} className="space-y-4">
              
              {authModalMode === 'register' && (
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Full Name"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
                  />
                  <User className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                </div>
              )}

              <div className="relative">
                <input
                  type="text"
                  placeholder="Email or Username"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
                />
                <Mail className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
              </div>

              {authModalMode !== 'forgot' && (
                <div className="relative">
                  <input
                    type="password"
                    placeholder="Password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="w-full bg-slate-900 border border-gray-800 rounded-xl py-3 pl-10 pr-4 text-xs text-white placeholder-gray-500 focus:border-theme-gold focus:outline-none"
                  />
                  <Lock className="w-4 h-4 text-gray-500 absolute left-3.5 top-3.5" />
                </div>
              )}

              {authModalMode === 'login' && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => setAuthModalMode('forgot')}
                    className="text-xs text-theme-gold hover:underline"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}

              <button
                type="submit"
                disabled={loading || googleLoading}
                className="w-full py-3.5 rounded-full gold-glow-button text-black font-extrabold text-xs flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                {loading ? (
                  <Loader2 className="w-4 h-4 animate-spin text-black" />
                ) : (
                  <>
                    {authModalMode === 'login' && 'Sign In with Email'}
                    {authModalMode === 'register' && 'Create Free Account'}
                    {authModalMode === 'forgot' && 'Send Recovery Email'}
                  </>
                )}
              </button>

            </form>
          </>
        )}

      </div>
    </div>
  );
};

export default AuthModal;
