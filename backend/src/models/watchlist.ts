export interface Watchlist {
  id: string;
  userId: string;
  assetSymbol: string;
  assetName: string;
  assetType: 'stock' | 'crypto' | 'forex';
  addedAt: string;
}

export interface CreateWatchlistDTO {
  assetSymbol: string;
  assetName: string;
  assetType: 'stock' | 'crypto' | 'forex';
}

export interface WatchlistItem {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto' | 'forex';
  addedAt: string;
}
