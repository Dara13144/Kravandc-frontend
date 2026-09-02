import { useEffect } from 'react';
import { toast } from 'react-toastify';

/**
 * useDevToolsProtection Hook
 * Comprehensive DRM & Anti-Inspection system:
 * - Blocks F12 key
 * - Blocks Ctrl+Shift+I / Cmd+Option+I (Inspect)
 * - Blocks Ctrl+Shift+J / Cmd+Option+J (Console)
 * - Blocks Ctrl+Shift+C / Cmd+Option+C (Inspect Element)
 * - Blocks Ctrl+U / Cmd+Option+U (View Source)
 * - Blocks Ctrl+S / Cmd+S (Save Page)
 * - Restricts right-click inspect on media
 */
export function useDevToolsProtection(enabled = true) {
  useEffect(() => {
    if (!enabled) return;

    let lastWarningTime = 0;
    const notifyBlocked = (actionName = 'Developer Tools') => {
      const now = Date.now();
      if (now - lastWarningTime > 2500) {
        lastWarningTime = now;
        toast.warn(`🔒 ${actionName} is disabled to protect copyrighted 4K cinema streams.`, {
          toastId: 'anti-devtools-toast',
          position: 'bottom-right',
          autoClose: 2000
        });
      }
    };

    const handleKeyDown = (e) => {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      const cmdOrCtrl = isMac ? e.metaKey : e.ctrlKey;
      const altOrOption = e.altKey;

      // 1. Block F12 Key
      if (e.key === 'F12' || e.keyCode === 123) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('F12 Developer Tools');
        return false;
      }

      // 2. Block Ctrl + Shift + I (Inspect) or Cmd + Option + I
      if ((cmdOrCtrl && e.shiftKey && (e.key === 'I' || e.key === 'i' || e.keyCode === 73)) ||
          (isMac && cmdOrCtrl && altOrOption && (e.key === 'I' || e.key === 'i' || e.keyCode === 73))) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('Inspect Element');
        return false;
      }

      // 3. Block Ctrl + Shift + J (Console) or Cmd + Option + J
      if ((cmdOrCtrl && e.shiftKey && (e.key === 'J' || e.key === 'j' || e.keyCode === 74)) ||
          (isMac && cmdOrCtrl && altOrOption && (e.key === 'J' || e.key === 'j' || e.keyCode === 74))) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('Console Access');
        return false;
      }

      // 4. Block Ctrl + Shift + C (Element Picker) or Cmd + Option + C
      if ((cmdOrCtrl && e.shiftKey && (e.key === 'C' || e.key === 'c' || e.keyCode === 67)) ||
          (isMac && cmdOrCtrl && altOrOption && (e.key === 'C' || e.key === 'c' || e.keyCode === 67))) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('Element Inspector');
        return false;
      }

      // 5. Block Ctrl + U (View Page Source) or Cmd + Option + U
      if (cmdOrCtrl && (e.key === 'u' || e.key === 'U' || e.keyCode === 85)) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('View Page Source');
        return false;
      }

      // 6. Block Ctrl + S (Save Page)
      if (cmdOrCtrl && (e.key === 's' || e.key === 'S' || e.keyCode === 83)) {
        e.preventDefault();
        e.stopPropagation();
        notifyBlocked('Save Page');
        return false;
      }
    };

    // Prevent context menu inspection on video and sensitive players
    const handleContextMenu = (e) => {
      if (e.target.tagName === 'VIDEO' || e.target.closest('.video-container') || e.target.closest('iframe')) {
        e.preventDefault();
        notifyBlocked('Right-Click Context Menu');
        return false;
      }
    };

    window.addEventListener('keydown', handleKeyDown, true);
    document.addEventListener('contextmenu', handleContextMenu, true);

    return () => {
      window.removeEventListener('keydown', handleKeyDown, true);
      document.removeEventListener('contextmenu', handleContextMenu, true);
    };
  }, [enabled]);
}

export default useDevToolsProtection;
