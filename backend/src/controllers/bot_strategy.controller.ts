import { Response } from 'express';
import { BotStrategyService } from '../services/bot_strategy.service';
import type { AuthRequest } from '../middleware/auth.middleware';

const service = new BotStrategyService();

export const createBotStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, algorithm, description, params } = req.body;
    if (!name || !algorithm) { res.status(400).json({ error: 'name y algorithm son obligatorios' }); return; }
    if (!['momentum', 'mean-reversion'].includes(algorithm)) {
      res.status(400).json({ error: 'algorithm debe ser momentum o mean-reversion' }); return;
    }
    const s = await service.create(req.userId!, { name, algorithm, description, params: params ?? {} });
    res.status(201).json(s);
  } catch { res.status(500).json({ error: 'Error al crear la estrategia' }); }
};

export const getBotStrategies = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    res.json(await service.getAll(req.userId!));
  } catch { res.status(500).json({ error: 'Error al obtener las estrategias' }); }
};

export const getBotStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    res.json(await service.getById(id, req.userId!));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    res.status(404).json({ error: msg });
  }
};

export const updateBotStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    res.json(await service.update(id, req.userId!, req.body));
  } catch (e) {
    const msg = e instanceof Error ? e.message : 'Error';
    res.status(404).json({ error: msg });
  }
};

export const deleteBotStrategy = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
    await service.delete(id, req.userId!);
    res.status(204).send();
  } catch { res.status(500).json({ error: 'Error al eliminar la estrategia' }); }
};
