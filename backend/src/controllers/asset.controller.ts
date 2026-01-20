import { Request, Response } from 'express';
import { AssetService } from '../services/asset.service';

export const getAssets = (req: Request, res: Response) => {
  const assets = AssetService.getAllAssets();
  res.json(assets);
};
