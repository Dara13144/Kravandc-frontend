import React from 'react';

const AnimatedKhmerBackground = () => {
  return (
    <div className="fixed inset-0 pointer-events-none z-0 overflow-hidden select-none">
      
      {/* 🌟 1. Full-Screen Metallic Golden Wallpaper with Animated Subtle Breathing / Parallax */}
      <div 
        className="absolute inset-0 w-full h-full bg-cover bg-center bg-repeat animate-gold-wallpaper"
        style={{
          backgroundImage: "url('/golden-pattern-bg.jpg')",
          backgroundSize: '800px auto',
          filter: 'drop-shadow(0 0 40px rgba(245,158,11,0.25))'
        }}
      />

      {/* 🌟 2. Cinematic Dark Navy/Charcoal Vignette & Radial Contrast Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-[#05070C]/90 via-[#05070C]/80 to-[#05070C]/95 dark:from-[#05070C]/90 dark:via-[#05070C]/82 dark:to-[#05070C]/95" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,transparent_0%,rgba(5,7,12,0.85)_100%)]" />

      {/* 🌟 3. Ambient Gold & Amber Lighting Highlights */}
      <div className="absolute -top-24 right-1/4 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[160px] pointer-events-none animate-pulse-glow" />
      <div className="absolute -bottom-24 left-1/4 w-[550px] h-[550px] bg-yellow-500/10 rounded-full blur-[150px] pointer-events-none animate-pulse-glow" />

    </div>
  );
};

export default AnimatedKhmerBackground;
