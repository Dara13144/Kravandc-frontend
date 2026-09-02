import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { walletAPI } from '../api/endpoints';
import { useAuth } from './AuthContext';
import { createSocket } from '../utils/socket';
import { toast } from 'react-toastify';

const WalletContext = createContext();

export const WalletProvider = ({ children }) => {
  const { user, setUser } = useAuth();
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  const userId = user?.id;

  const fetchWallet = useCallback(async () => {
    if (!userId) {
      setBalance(0);
      return;
    }
    try {
      setLoading(true);
      const res = await walletAPI.getWallet();
      let newBalance = Number(res.data?.data?.balance) || 0;
      if (newBalance === 50 && !['ADMIN', 'SUPER_ADMIN'].includes(user?.role)) {
        newBalance = 0;
      }
      const txList = res.data?.data?.transactions || [];
      setBalance(newBalance);
      setTransactions(txList);
      setUser(prev => {
        if (!prev) return prev;
        if (prev.balance === newBalance) return prev;
        return { ...prev, balance: newBalance };
      });
    } catch (err) {
      console.error('Error fetching wallet:', err);
      setBalance(0);
    } finally {
      setLoading(false);
    }
  }, [userId, user?.role, setUser]);

  useEffect(() => {
    fetchWallet();
  }, [fetchWallet]);

  // Setup Socket listener for instant payment updates
  useEffect(() => {
    if (!user?.id) return;

    const socket = createSocket();

    socket.emit('join_user_room', user.id);

    socket.on('payment_success', () => {
      fetchWallet();
    });

    socket.on('wallet_updated', () => {
      fetchWallet();
    });

    socket.on('balance_adjusted', () => {
      fetchWallet();
    });

    return () => {
      socket.disconnect();
    };
  }, [user?.id, fetchWallet]);

  return (
    <WalletContext.Provider
      value={{
        balance,
        transactions,
        loading,
        fetchWallet
      }}
    >
      {children}
    </WalletContext.Provider>
  );
};

export const useWallet = () => useContext(WalletContext);
