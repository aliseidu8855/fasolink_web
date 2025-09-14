import { useEffect, useRef, useState, useCallback } from 'react';
import { fetchListingsPage } from '../services/api';

// useInfiniteListings: manages paginated listing fetching and infinite scroll sentinel
// options: baseParams (filters/order), pageSize (future), enabled
export function useInfiniteListings({ baseParams = {}, enabled = true } = {}) {
  const [pages, setPages] = useState([]); // each page: { results: [], next, previous, count }
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [hasMore, setHasMore] = useState(true);
  const prevParamsRef = useRef(JSON.stringify(baseParams));

  // Reset when params change
  useEffect(() => {
    const serialized = JSON.stringify(baseParams);
    if (serialized !== prevParamsRef.current) {
      prevParamsRef.current = serialized;
      setPages([]);
      setPage(1);
      setHasMore(true);
    }
  }, [baseParams]);

  useEffect(() => {
    if (!enabled || !hasMore) return;
    let cancelled = false;
    async function load() {
      setLoading(true);
      setError(null);
      try {
        const data = await fetchListingsPage(page, baseParams);
        if (cancelled) return;
        if (data.results) {
          setPages(prev => [...prev, data]);
          setHasMore(Boolean(data.next));
        } else if (Array.isArray(data)) { // fallback if pagination not yet activated
          // Simulate single page result
          setPages([{ results: data, next: null, previous: null, count: data.length }]);
          setHasMore(false);
        }
      } catch (e) {
        if (!cancelled) setError(e);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [page, baseParams, enabled, hasMore]);

  const listings = pages.flatMap(p => p.results || []);

  const loadMore = useCallback(() => {
    if (!loading && hasMore) {
      setPage(p => p + 1);
    }
  }, [loading, hasMore]);

  const reset = useCallback(() => {
    setPages([]);
    setPage(1);
    setHasMore(true);
  }, []);

  return { listings, pages, loading, error, hasMore, loadMore, reset };
}
