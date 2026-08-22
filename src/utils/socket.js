import { io } from 'socket.io-client';

/**
 * Resolves the Socket.io server connection URL.
 * Automatically respects VITE_SOCKET_URL, strips API path from VITE_API_URL, or defaults to window origin.
 */
export const getSocketUrl = () => {
  if (import.meta.env.VITE_SOCKET_URL) {
    return import.meta.env.VITE_SOCKET_URL;
  }
  if (import.meta.env.VITE_API_URL) {
    try {
      const url = new URL(import.meta.env.VITE_API_URL, window.location.origin);
      return url.origin;
    } catch {
      return import.meta.env.VITE_API_URL.replace(/\/api(\/v1)?\/?$/, '');
    }
  }
  return window.location.origin;
};

/**
 * Creates and returns a configured Socket.io instance.
 */
export const createSocket = (options = {}) => {
  const targetUrl = getSocketUrl();
  return io(targetUrl, {
    transports: ['websocket', 'polling'],
    ...options
  });
};
