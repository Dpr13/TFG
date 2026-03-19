import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';

let failureCount = 0;

export const getAssets = async (req: Request, res: Response) => {
  try {
    if (failureCount < 2) {
      failureCount++;
      console.log(`[TEST] Simulating failure ${failureCount}/2 for getAssets`);
      res.status(500).json({ error: 'SIMULATED FAILURE' });
      return;
    }

    console.log(`[TEST] Succeeding getAssets after ${failureCount} failures`);
    // Reset for next test run if needed
    // failureCount = 0; 

    const assets = await AssetService.getAllAssets();
    res.json(assets);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch assets' });
  }
};

export const searchAsset = async (req: Request, res: Response) => {
  const { symbol } = req.params;
  try {
    if (!symbol || typeof symbol !== 'string') {
      res.status(400).json({ error: 'Symbol parameter is required' });
      return;
    }

    const asset = await AssetService.searchAsset(symbol);

    if (!asset) {
      res.status(404).json({ error: `No se encontró ningún activo con el símbolo '${symbol}'` });
      return;
    }

    res.json(asset);
  } catch (error) {
    console.error('Error searching asset:', error);
    res.status(404).json({
      error: `No se encontró ningún activo con el símbolo '${symbol}'`
    });
  }
};
