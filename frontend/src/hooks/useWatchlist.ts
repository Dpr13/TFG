import { useState, useCallback, useEffect } from 'react';
import type { Asset } from '../types';
import { watchlistService, type WatchlistItem } from '../services';
import { useAuth } from '../context/AuthContext';

/**
 * Hook para manejar la lista de seguimiento del usuario
 * Ahora sincronizado con el backend en lugar de usar localStorage
 */
export function useWatchlist() {
  const { user, isAuthenticated } = useAuth();
  const [watchlist, setWatchlist] = useState<Asset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Convertir WatchlistItem a Asset
  const convertToAsset = (item: WatchlistItem): Asset => ({
    symbol: item.symbol,
    name: item.name,
    type: item.type,
  });

  // Cargar la watchlist del backend cuando el usuario esté autenticado
  const loadWatchlist = useCallback(async () => {
    if (!isAuthenticated || !user) {
      setWatchlist([]);
      return;
    }

    setIsLoading(true);
    setError(null);
    try {
      const items = await watchlistService.getWatchlist();
      setWatchlist(items.map(convertToAsset));
    } catch (err) {
      console.error('Error loading watchlist:', err);
      setError('Error al cargar la lista de seguimiento');
      setWatchlist([]);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated, user]);

  // Cargar al montar el componente o cuando cambie el usuario
  useEffect(() => {
    loadWatchlist();
  }, [loadWatchlist]);

  const isFavorite = useCallback(
    (symbol: string) => watchlist.some((a) => a.symbol === symbol),
    [watchlist]
  );

  const toggleFavorite = useCallback(async (asset: Asset) => {
    if (!isAuthenticated || !user) {
      setError('Debes iniciar sesión para usar la lista de seguimiento');
      return;
    }

    const exists = watchlist.some((a) => a.symbol === asset.symbol);
    
    try {
      if (exists) {
        // Remover de la watchlist
        await watchlistService.removeFromWatchlist(asset.symbol);
        setWatchlist((prev) => prev.filter((a) => a.symbol !== asset.symbol));
      } else {
        // Agregar a la watchlist
        await watchlistService.addToWatchlist({
          assetSymbol: asset.symbol,
          assetName: asset.name,
          assetType: asset.type,
        });
        setWatchlist((prev) => [...prev, asset]);
      }
      setError(null);
    } catch (err) {
      console.error('Error toggling favorite:', err);
      setError(exists ? 'Error al quitar de seguimiento' : 'Error al agregar a seguimiento');
      // Recargar para mantener sincronización
      loadWatchlist();
    }
  }, [watchlist, isAuthenticated, user, loadWatchlist]);

  const clearAll = useCallback(async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      await watchlistService.clearWatchlist();
      setWatchlist([]);
      setError(null);
    } catch (err) {
      console.error('Error clearing watchlist:', err);
      setError('Error al limpiar la lista de seguimiento');
    }
  }, [isAuthenticated, user]);

  return { 
    watchlist, 
    isFavorite, 
    toggleFavorite, 
    clearAll,
    isLoading,
    error,
    reload: loadWatchlist
  };
}

