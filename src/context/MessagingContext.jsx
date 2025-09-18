import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { fetchConversations } from '../services/api';
import { connectSocket } from '../services/socket';

// MessagingContext centralizes polling of conversation metadata (last message, unread counts)
// and provides a single source of truth for unread totals across the app.
// It visibility-gates polling to reduce network chatter.

const MessagingContext = createContext(null);

// eslint-disable-next-line react-refresh/only-export-components
export const useMessaging = () => useContext(MessagingContext);

export const MessagingProvider = ({ children, pollInterval = 5000 }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
  const wsRef = useRef(null);
  const lastFetchRef = useRef(0);

  const pageVisible = () => typeof document !== 'undefined' && document.visibilityState === 'visible';

  const refresh = useCallback(async (silent = false) => {
    if (loading && silent) return; // avoid overlap
    try {
      if (!silent) setLoading(true);
      setError(null);
      const res = await fetchConversations();
      setConversations(res.data || []);
      lastFetchRef.current = Date.now();
    } catch (e) {
      if (!silent) setError(e);
    } finally {
      if (!silent) setLoading(false);
    }
  }, [loading]);

  // Visibility-aware polling (fallback if websocket not connected)
  useEffect(() => {
    refresh();
    const startPolling = () => {
      if (pollRef.current) clearInterval(pollRef.current);
      pollRef.current = setInterval(() => { if (pageVisible()) refresh(true); }, pollInterval);
    };
    startPolling();

    // Try to open a notifications websocket; if connected, pause polling and rely on server push
    const { socket, close } = connectSocket('/ws/notifications/', {
      onOpen: () => {
        if (pollRef.current) { clearInterval(pollRef.current); pollRef.current = null; }
      },
      onClose: () => {
        // Resume polling when socket closes
        startPolling();
      },
      onMessage: () => {
        // For now, any notification triggers a silent refresh
        if (pageVisible()) refresh(true);
      },
    });
    wsRef.current = socket;
    return () => {
      if (pollRef.current) clearInterval(pollRef.current);
      try { close(); } catch { /* ignore */ }
    };
  }, [refresh, pollInterval]);

  // Manual visibility change immediate refresh
  useEffect(() => {
    const handler = () => { if (pageVisible()) refresh(true); };
    document.addEventListener('visibilitychange', handler);
    return () => document.removeEventListener('visibilitychange', handler);
  }, [refresh]);

  const unreadTotal = conversations.reduce((sum, c) => sum + (c.unread_count || 0), 0);

  const value = {
    conversations,
    setConversations,
    loading,
    error,
    refresh,
    unreadTotal,
    lastFetchedAt: lastFetchRef.current,
  };

  return <MessagingContext.Provider value={value}>{children}</MessagingContext.Provider>;
};

export default MessagingContext;