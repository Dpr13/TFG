import { describe, it, expect } from 'vitest';
import { AssetService } from '../asset.service';

describe('AssetService', () => {
  it('returns mock assets', () => {
    const assets = AssetService.getAllAssets();
    expect(Array.isArray(assets)).toBe(true);
    expect(assets.length).toBeGreaterThan(0);
    expect(assets[0]).toHaveProperty('symbol');
    expect(assets[0]).toHaveProperty('name');
  });
});