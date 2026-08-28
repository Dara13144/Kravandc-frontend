import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useCart } from '../contexts/CartContext';
import { useLanguage } from '../contexts/LanguageContext';
import {
  Home,
  Film,
  Radio,
  ShoppingBag,
  User,
  Wallet,
  ShieldCheck
} from 'lucide-react';

const MobileBottomNav = () => {
  const location = useLocation();
  const { user, openAuthModal } = useAuth();
  const { itemCount } = useCart();
  const { t } = useLanguage();

  const currentPath = location.pathname;

  const navItems = [
    {
      id: 'home',
      label: t('navHome') || 'Home',
      icon: Home,
      path: '/'
    },
    {
      id: 'movies',
      label: t('navMovies') || 'Movies',
      icon: Film,
      path: '/movies'
    },
    {
      id: 'podcasts',
      label: t('navPodcasts') || 'Podcasts',
      icon: Radio,
      path: '/podcasts'
    },
    {
      id: 'store',
      label: 'Store',
      icon: ShoppingBag,
      path: '/products',
      badge: itemCount > 0 ? itemCount : null
    },
    {
      id: 'profile',
      label: user ? (['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? 'Admin' : 'Account') : 'Sign In',
      icon: user ? (['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? ShieldCheck : User) : User,
      path: user ? (['ADMIN', 'SUPER_ADMIN'].includes(user.role) ? '/admin' : '/dashboard') : null,
      action: !user ? () => openAuthModal('login') : null
    }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-50 px-3 pb-safe pt-1 pointer-events-auto">
      {/* Floating Glassmorphic Container */}
      <nav className="bg-slate-950/90 backdrop-blur-2xl border border-amber-500/20 shadow-2xl rounded-2xl mb-2 px-2 py-1.5 flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.path ? (item.path === '/' ? currentPath === '/' : currentPath.startsWith(item.path)) : false;

          const content = (
            <div className={`relative flex flex-col items-center justify-center py-1 px-2.5 rounded-xl transition-all duration-300 ${
              isActive 
                ? 'text-amber-400 font-bold scale-105' 
                : 'text-gray-400 hover:text-gray-200 active:scale-95'
            }`}>
              {/* Active Glow Pill */}
              {isActive && (
                <span className="absolute -top-1 w-6 h-1 rounded-full bg-gradient-to-r from-amber-500 to-amber-300 shadow-gold-sm" />
              )}
              
              <div className="relative">
                <Icon className={`w-5 h-5 transition-transform duration-200 ${isActive ? 'stroke-[2.5px]' : 'stroke-2'}`} />
                {item.badge && (
                  <span className="absolute -top-1.5 -right-2 min-w-[16px] h-4 px-1 rounded-full bg-red-600 text-white text-[10px] font-black flex items-center justify-center shadow-md animate-pulse">
                    {item.badge}
                  </span>
                )}
              </div>
              <span className="text-[10px] mt-0.5 tracking-tight truncate max-w-[56px]">
                {item.label}
              </span>
            </div>
          );

          if (item.action) {
            return (
              <button
                key={item.id}
                onClick={item.action}
                className="focus:outline-none flex-1 flex justify-center"
              >
                {content}
              </button>
            );
          }

          return (
            <Link
              key={item.id}
              to={item.path}
              className="focus:outline-none flex-1 flex justify-center"
            >
              {content}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export default MobileBottomNav;
