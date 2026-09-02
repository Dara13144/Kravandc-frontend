import React from 'react';

/**
 * ABA PayWay Logo Component
 */
export const AbaPayWayBadge = ({ className = "h-8" }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#004A61] border border-[#007499]/60 shadow-md ${className}`}>
    <div className="flex items-center gap-1">
      <span className="text-white font-black tracking-tight text-xs font-sans">ABA</span>
      <span className="w-1.5 h-1.5 rounded-full bg-[#E11937]" />
    </div>
    <div className="h-3.5 w-px bg-cyan-300/30" />
    <span className="text-cyan-300 font-extrabold text-[11px] tracking-wider uppercase font-sans">
      PAYWAY
    </span>
  </div>
);

/**
 * Bakong KHQR Logo Component
 */
export const BakongKhqrBadge = ({ className = "h-8" }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-[#E11937] border border-red-400/50 shadow-md ${className}`}>
    <div className="w-4 h-4 rounded bg-white flex items-center justify-center p-0.5 shadow-xs">
      <span className="text-[#E11937] font-black text-[9px] leading-none">KH</span>
    </div>
    <span className="text-white font-black text-[11px] tracking-widest uppercase font-sans">
      KHQR
    </span>
  </div>
);

/**
 * Visa / Mastercard Logo Component
 */
export const VisaMasterBadge = ({ className = "h-8" }) => (
  <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-900 border border-gray-700/80 shadow-md ${className}`}>
    {/* Visa */}
    <span className="font-black text-xs text-blue-400 italic tracking-tight font-serif">
      VISA
    </span>
    <div className="h-3.5 w-px bg-gray-700" />
    {/* Mastercard Interlocking Circles */}
    <div className="flex items-center -space-x-1.5">
      <div className="w-3.5 h-3.5 rounded-full bg-[#EB001B] shadow-xs" />
      <div className="w-3.5 h-3.5 rounded-full bg-[#F79E1B] opacity-90 shadow-xs" />
    </div>
  </div>
);

/**
 * Full Payment Methods Row
 */
const PaymentMethodBadges = () => {
  return (
    <div className="flex flex-wrap items-center gap-2.5">
      <AbaPayWayBadge />
      <BakongKhqrBadge />
      <VisaMasterBadge />
    </div>
  );
};

export default PaymentMethodBadges;
