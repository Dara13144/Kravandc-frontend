import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authAPI } from '../api/endpoints';
import { toast } from 'react-toastify';
import supabase from '../api/supabase';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login'); // 'login' | 'register' | 'forgot'

  const loginWithGoogle = useCallback(async (googleData) => {
    try {
      const res = await authAPI.googleLogin(googleData);
      const { user: userData, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      toast.success(`Google authentication successful! Welcome ${userData.name}.`);
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Google Login failed');
      return false;
    }
  }, []);

  const signInWithGoogleOAuth = useCallback(async () => {
    try {
      if (supabase) {
        const { data, error } = await supabase.auth.signInWithOAuth({
          provider: 'google',
          options: {
            redirectTo: window.location.origin,
            queryParams: {
              access_type: 'offline',
              prompt: 'select_account'
            }
          }
        });
        if (error) {
          console.warn('Supabase OAuth Error:', error.message);
          return false;
        }
        return true;
      }
    } catch (err) {
      console.warn('Supabase OAuth exception:', err.message);
    }
    return false;
  }, []);

  useEffect(() => {
    const fetchUser = async () => {
      const token = localStorage.getItem('accessToken');
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const res = await authAPI.getProfile();
        setUser(res.data.data);
      } catch (err) {
        console.error('Failed to load user session', err);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      } finally {
        setLoading(false);
      }
    };
    fetchUser();

    // Supabase OAuth State Change Listener (e.g. Google Sign-In redirect / popup)
    if (supabase) {
      const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
        if (session?.user && !localStorage.getItem('accessToken')) {
          const googleUser = {
            googleId: session.user.id,
            email: session.user.email,
            name: session.user.user_metadata?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0],
            avatar: session.user.user_metadata?.avatar_url || session.user.user_metadata?.picture
          };
          await loginWithGoogle(googleUser);
        }
      });
      return () => {
        subscription?.unsubscribe();
      };
    }
  }, [loginWithGoogle]);

  const login = async (email, password) => {
    try {
      const res = await authAPI.login({ email, password });
      const { user: userData, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      toast.success(`Welcome back, ${userData.name}!`);
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
      return false;
    }
  };

  const register = async (name, email, password) => {
    try {
      const res = await authAPI.register({ name, email, password });
      const { user: userData, accessToken, refreshToken } = res.data.data;
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      setUser(userData);
      toast.success('Registration successful! Welcome to KravanDC.com.');
      setIsAuthModalOpen(false);
      return true;
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
      return false;
    }
  };

  const logout = async () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    if (supabase) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        // ignore
      }
    }
    setUser(null);
    toast.info('Logged out');
  };

  const openAuthModal = (mode = 'login') => {
    setAuthModalMode(mode);
    setIsAuthModalOpen(true);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        setUser,
        loading,
        login,
        register,
        loginWithGoogle,
        signInWithGoogleOAuth,
        logout,
        isAuthModalOpen,
        setIsAuthModalOpen,
        authModalMode,
        setAuthModalMode,
        openAuthModal
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
