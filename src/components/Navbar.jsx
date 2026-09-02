import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useWallet } from '../contexts/WalletContext';
import { useTheme } from '../contexts/ThemeContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Film,
  Tv,
  Radio,
  Search,
  Wallet,
  User,
  LogOut,
  ShieldAlert,
  ShoppingBag,
  Heart,
  PlusCircle,
  Menu,
  X,
  Sun,
  Moon,
  Globe
} from 'lucide-react';

const Navbar = () => {
  const { user, logout, openAuthModal } = useAuth();
  const { balance } = useWallet();
  const { theme, toggleTheme } = useTheme();
  const { lang, toggleLang, t } = useLanguage();
  const navigate = useNavigate();
  const location = useLocation();

  const [searchQuery, setSearchQuery] = useState('');
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
    }
  };

  const isSuperAdmin = user && ['ADMIN', 'SUPER_ADMIN'].includes(user?.role);

  const navLinks = [
    { name: 'HOME', path: '/' },
    { name: 'MOVIES', path: '/movies' },
    { name: 'PODCASTS', path: '/podcasts' }
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#0A0C10]/95 backdrop-blur-md border-b border-gray-800/80 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          
          {/* Official Brand Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            <img
              src="/logo.png"
              alt="Kravan DC"
              className="h-11 w-auto object-contain animate-gold-logo group-hover:scale-110 transition-all duration-300"
            />
            <span className="text-2xl font-black tracking-wider text-white flex items-center gap-1">
              <span className="text-amber-400">Kravan</span> DC
            </span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-7">
            {navLinks.map((link) => {
              if (link.protected && !user) return null;
              const isActive = location.pathname === link.path;
              return (
                <Link
                  key={link.name}
                  to={link.path}
                  className={`text-xs font-black tracking-widest uppercase transition-colors ${
                    isActive
                      ? 'text-amber-400 border-b-2 border-amber-400 pb-1 font-extrabold'
                      : 'text-gray-300 hover:text-amber-300'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>

          {/* Controls */}
          <div className="flex items-center gap-2.5">

            {/* Auth / Profile Dropdown */}
            {user ? (
              <div className="relative">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center gap-2 focus:outline-none"
                >
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-9 h-9 rounded-full object-cover border-2 border-theme-gold/60 shadow-md hover:border-theme-gold transition-all"
                  />
                </button>

                {/* Profile Dropdown Menu */}
                {isProfileOpen && (
                  <div
                    className="absolute right-0 mt-3 w-56 bg-theme-card/95 backdrop-blur-xl border border-gray-700/80 rounded-2xl shadow-2xl py-2 z-50"
                    onMouseLeave={() => setIsProfileOpen(false)}
                  >
                    <div className="px-4 py-3 border-b border-gray-800">
                      <p className="text-sm font-semibold text-white truncate">{user.name}</p>
                      <p className="text-xs text-gray-400 truncate">{user.email}</p>
                      <span className="inline-block mt-1 text-[10px] px-2 py-0.5 rounded bg-amber-500/20 text-theme-gold font-bold uppercase">
                        {user.role}
                      </span>
                    </div>

                    <Link
                      to="/topup"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center justify-between px-4 py-2.5 text-xs text-theme-gold font-bold hover:bg-amber-500/10"
                    >
                      <span className="flex items-center gap-2.5">
                        <Wallet className="w-4 h-4 text-theme-gold" /> Add Balance (Bakong KHQR)
                      </span>
                      <span>${balance.toFixed(2)}</span>
                    </Link>

                    <Link
                      to="/dashboard"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    >
                      <User className="w-4 h-4 text-theme-gold" /> User Dashboard
                    </Link>

                    <Link
                      to="/orders"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    >
                      <Film className="w-4 h-4 text-cyan-400" /> {t('navOrders')}
                    </Link>

                    <Link
                      to="/wishlist"
                      onClick={() => setIsProfileOpen(false)}
                      className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-gray-300 hover:bg-gray-800/60 hover:text-white"
                    >
                      <Heart className="w-4 h-4 text-rose-400" /> Favorites Wishlist
                    </Link>

                    {isSuperAdmin && (
                      <Link
                        to="/admin"
                        onClick={() => setIsProfileOpen(false)}
                        className="flex items-center gap-2.5 px-4 py-2.5 text-xs text-amber-400 hover:bg-amber-500/10 font-medium"
                      >
                        <ShieldAlert className="w-4 h-4" /> Admin Portal
                      </Link>
                    )}

                    <div className="border-t border-gray-800 mt-1 pt-1">
                      <button
                        onClick={() => {
                          setIsProfileOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center gap-2.5 px-4 py-2.5 text-xs text-rose-400 hover:bg-rose-500/10 text-left"
                      >
                        <LogOut className="w-4 h-4" /> {t('navSignOut')}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="px-4 py-2 text-xs font-bold text-gray-300 hover:text-white transition-colors"
                >
                  {t('signIn')}
                </button>
                <button
                  onClick={() => openAuthModal('register')}
                  className="px-4 py-2 text-xs font-black rounded-full gold-glow-button text-black"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Menu Toggle */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-2 text-gray-400 hover:text-white"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        {isMobileMenuOpen && (
          <div className="lg:hidden py-4 border-t border-gray-800 space-y-4 animate-fade-in">
            {/* Mobile User Profile Header */}
            {user ? (
              <div className="p-3.5 rounded-2xl bg-slate-900/90 border border-amber-500/20 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <img
                    src={user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150'}
                    alt={user.name}
                    className="w-10 h-10 rounded-full object-cover border border-theme-gold shadow-sm"
                  />
                  <div>
                    <p className="text-xs font-bold text-white truncate max-w-[150px]">{user.name}</p>
                    <span className="inline-block text-[9px] font-black uppercase text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded">
                      {user.role}
                    </span>
                  </div>
                </div>
                <Link
                  to="/topup"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500/20 hover:bg-amber-500/30 border border-amber-500/40 text-theme-gold text-xs font-black"
                >
                  <Wallet className="w-3.5 h-3.5" />
                  <span>${balance.toFixed(2)}</span>
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('login');
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-slate-900 border border-gray-700 text-xs font-bold text-white text-center"
                >
                  {t('signIn')}
                </button>
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    openAuthModal('register');
                  }}
                  className="flex-1 py-2.5 rounded-xl gold-glow-button text-black text-xs font-black text-center"
                >
                  {t('register')}
                </button>
              </div>
            )}

            {/* Mobile Search Bar */}
            <form onSubmit={handleSearchSubmit} className="relative">
              <input
                type="text"
                placeholder="Search movies, podcasts..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-theme-card/90 border border-gray-700 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-gray-400 focus:outline-none focus:border-amber-400"
              />
              <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-3" />
            </form>

            {/* Navigation Links */}
            <div className="space-y-1">
              {navLinks.map((link) => {
                if (link.protected && !user) return null;
                const isActive = location.pathname === link.path;
                return (
                  <Link
                    key={link.name}
                    to={link.path}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`block px-4 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? 'text-amber-400 bg-amber-500/10 font-bold border border-amber-500/20'
                        : 'text-gray-300 hover:text-white hover:bg-gray-800/50'
                    }`}
                  >
                    {link.name}
                  </Link>
                );
              })}

              {isSuperAdmin && (
                <Link
                  to="/admin"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block px-4 py-2.5 rounded-xl text-sm font-bold text-amber-400 bg-amber-500/10 hover:bg-amber-500/20 transition-all border border-amber-500/30"
                >
                  🛡️ Admin Portal
                </Link>
              )}

              {user && (
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    logout();
                  }}
                  className="w-full text-left px-4 py-2.5 rounded-xl text-sm font-bold text-rose-400 hover:bg-rose-500/10 transition-all flex items-center gap-2"
                >
                  <LogOut className="w-4 h-4" /> {t('navSignOut')}
                </button>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Navbar;
