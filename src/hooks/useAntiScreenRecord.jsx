import { useState, useEffect } from 'react';

/**
 * useAntiScreenRecord Hook
 * Lightweight DRM protection that ensures videos always remain 100% visible and playable
 */
export function useAntiScreenRecord(options = { enabled: true, showWarnings: false }) {
  const [isScreenCaptureBlocked, setIsScreenCaptureBlocked] = useState(false);

  useEffect(() => {
    // Disable right-click context menu on video elements only (anti-download)
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'VIDEO') {
        e.preventDefault();
        return false;
      }
    };

    window.addEventListener('contextmenu', handleContextMenu);
    return () => {
      window.removeEventListener('contextmenu', handleContextMenu);
    };
  }, []);

  return {
    isScreenCaptureBlocked: false,
    isTabHidden: false
  };
}

export default useAntiScreenRecord;
