import { describe, it, expect, vi } from 'vitest';
import { AssetService } from '../asset.service';
import { MarketDataRepository } from '../../repositories/marketData.repository';

vi.mock('../../repositories/marketData.repository', () => ({
  MarketDataRepository: {
    getAllAssets: vi.fn(),
    searchAssetBySymbol: vi.fn(),
  },
}));

describe('AssetService', () => {
  it('returns mock assets', async () => {
    const mockAssets = [
      { symbol: 'AAPL', name: 'Apple Inc.' },
      { symbol: 'GOOG', name: 'Alphabet Inc.' },
    ];
    vi.mocked(MarketDataRepository.getAllAssets).mockResolvedValue(mockAssets as any);

    const assets = await AssetService.getAllAssets();

    expect(Array.isArray(assets)).toBe(true);
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0]).toHaveProperty('symbol');
    expect(assets[0]).toHaveProperty('name');
  });
});