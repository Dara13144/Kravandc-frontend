import React from 'react';

/**
 * AntiScreenRecordShield Component
 * Subtle, non-intrusive watermark badge that never obscures or blacks out the video stream
 */
const AntiScreenRecordShield = ({ isBlocked = false, movieTitle = 'Protected Video' }) => {
  // Never black out the video player
  return (
    <div className="absolute top-3 right-3 z-10 pointer-events-none opacity-40 select-none">
      <span className="text-[9px] font-mono font-bold text-gray-400 bg-black/40 px-2 py-0.5 rounded-full border border-gray-700/40">
        KravanDC 4K • Encrypted
      </span>
    </div>
  );
};

export default AntiScreenRecordShield;
