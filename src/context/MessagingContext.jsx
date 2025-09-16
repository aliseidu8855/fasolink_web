import React, { createContext, useContext, useEffect, useRef, useState, useCallback } from 'react';
import { fetchConversations } from '../services/api';

// MessagingContext centralizes polling of conversation metadata (last message, unread counts)
// and provides a single source of truth for unread totals across the app.
// It visibility-gates polling to reduce network chatter.

const MessagingContext = createContext(null);

export const useMessaging = () => useContext(MessagingContext);

export const MessagingProvider = ({ children, pollInterval = 5000 }) => {
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const pollRef = useRef(null);
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

  // Visibility-aware polling
  useEffect(() => {
    refresh();
    pollRef.current = setInterval(() => { if (pageVisible()) refresh(true); }, pollInterval);
    return () => { if (pollRef.current) clearInterval(pollRef.current); };
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