import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';
import { SearchedAssetsService } from '../services/searchedAssets.service';

export const getAssets = async (req: Request, res: Response) => {
  try {
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
    const message = error instanceof Error ? error.message : String(error);
    console.error('Error searching asset:', error);

    if (message === 'PROVIDER_UNAVAILABLE') {
      res.status(503).json({
        error: 'Proveedor de mercado no disponible (Yahoo Finance). Revisa tu conexión/VPN y vuelve a intentarlo.',
      });
      return;
    }

    res.status(404).json({ error: `No se encontró ningún activo con el símbolo '${symbol}'` });
  }
};

export const autocompleteAssets = async (req: Request, res: Response) => {
  const q = req.query.q as string;
  try {
    const results = await AssetService.autocomplete(q);
    res.json(results);
  } catch {
    res.json([]);
  }
};

export const getUserSearchedAssets = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    
    // Si no está autenticado, devolver array vacío
    if (!userId) {
      res.json([]);
      return;
    }

    const searchedAssets = await SearchedAssetsService.getUserSearchedAssets(userId);
    res.json(searchedAssets);
  } catch (error) {
    console.error('Error fetching user searched assets:', error);
    res.status(500).json({ error: 'Failed to fetch searched assets' });
  }
};

export const saveSearchedAsset = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).userId;
    const { assetSymbol, assetName, assetType } = req.body;

    if (!userId) {
      res.status(401).json({ error: 'User not authenticated' });
      return;
    }

    if (!assetSymbol || !assetName || !assetType) {
      res.status(400).json({ error: 'assetSymbol, assetName, and assetType are required' });
      return;
    }

    const asset = await SearchedAssetsService.addSearchedAsset(userId, {
      assetSymbol,
      assetName,
      assetType,
    });

    res.json(asset);
  } catch (error) {
    console.error('Error saving searched asset:', error);
    res.status(500).json({ error: 'Failed to save searched asset' });
  }
};
