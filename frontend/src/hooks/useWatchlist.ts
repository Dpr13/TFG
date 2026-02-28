import { useState, useCallback } from 'react';
import type { Asset } from '../types';

const STORAGE_KEY = 'tfg_watchlist';

function loadWatchlist(): Asset[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function useWatchlist() {
  const [watchlist, setWatchlist] = useState<Asset[]>(loadWatchlist);

  const isFavorite = useCallback(
    (symbol: string) => watchlist.some((a) => a.symbol === symbol),
    [watchlist]
  );

  const toggleFavorite = useCallback((asset: Asset) => {
    setWatchlist((prev) => {
      const exists = prev.some((a) => a.symbol === asset.symbol);
      const next = exists
        ? prev.filter((a) => a.symbol !== asset.symbol)
        : [...prev, asset];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  return { watchlist, isFavorite, toggleFavorite };
}
