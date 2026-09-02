import React from 'react';
import { Link } from 'react-router-dom';
import { Film, ShieldCheck, CreditCard, Sparkles } from 'lucide-react';
import PaymentMethodBadges from './PaymentMethodBadges';

const Footer = () => {
  return (
    <footer className="bg-black border-t border-gray-900/90 pt-16 pb-12 mt-20 text-gray-400 shadow-2xl relative z-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10">
          
          {/* Official Brand Col */}
          <div className="space-y-4 md:col-span-1">
            <Link to="/" className="flex items-center gap-3">
              <img
                src="/logo.png"
                alt="Kravan DC"
                className="h-10 w-auto object-contain animate-gold-logo"
              />
              <span className="text-xl font-black text-white tracking-wider">
                <span className="text-amber-400">Kravan</span> DC
              </span>
            </Link>
            <p className="text-xs leading-relaxed text-gray-400">
              The ultimate 4K movie streaming and podcast platform. Stream blockbuster movies, series, and exclusive content instantly with ABA PayWay and Bakong KHQR.
            </p>
          </div>

          {/* Quick Navigation */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Explore</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/movies" className="hover:text-theme-gold transition-colors">All Movies</Link></li>
              <li><Link to="/movies?category=tv-shows" className="hover:text-theme-gold transition-colors">TV Shows</Link></li>
              <li><Link to="/podcasts" className="hover:text-theme-gold transition-colors">Podcasts</Link></li>
              <li><Link to="/topup" className="hover:text-theme-gold transition-colors">Top Up Wallet</Link></li>
            </ul>
          </div>

          {/* Company & Support */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Support & Legal</h4>
            <ul className="space-y-2.5 text-xs">
              <li><Link to="/about" className="hover:text-theme-gold transition-colors">About Us</Link></li>
              <li><Link to="/contact" className="hover:text-theme-gold transition-colors">Contact Support</Link></li>
              <li><Link to="/terms" className="hover:text-theme-gold transition-colors">Terms of Service</Link></li>
              <li><Link to="/privacy" className="hover:text-theme-gold transition-colors">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* Supported Payments */}
          <div>
            <h4 className="text-xs font-bold text-white uppercase tracking-widest mb-4">Payment Methods</h4>
            <p className="text-xs text-gray-400 mb-3">Instant auto-verifying balance top up via:</p>
            <PaymentMethodBadges />
          </div>

        </div>

        <div className="border-t border-gray-800/80 mt-12 pt-8 text-center text-xs text-gray-500">
          <p>© {new Date().getFullYear()} KravanDC.com. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
