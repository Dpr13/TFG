import { Response } from 'express';
import { positionService } from '../services/position.service';
import type { AuthRequest } from '../middleware/auth.middleware';

const param = (p: string | string[]) => (Array.isArray(p) ? p[0] : p);

export const openPosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { symbol, direction, quantity, price, openedAt, strategyId, notes } = req.body;
    if (!symbol || !direction || !quantity || !price || !openedAt) {
      res.status(400).json({ error: 'symbol, direction, quantity, price y openedAt son obligatorios' });
      return;
    }
    if (!['long', 'short'].includes(direction)) {
      res.status(400).json({ error: 'direction debe ser long o short' });
      return;
    }
    if (quantity <= 0 || price <= 0) {
      res.status(400).json({ error: 'quantity y price deben ser positivos' });
      return;
    }
    const result = await positionService.openPosition(req.userId!, { symbol, direction, quantity: Number(quantity), price: Number(price), openedAt, strategyId, notes });
    res.status(201).json(result);
  } catch (error) {
    res.status(500).json({ error: 'Error al abrir la posición' });
  }
};

export const closePosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { quantity, price, executedAt } = req.body;
    if (!quantity || !price || !executedAt) {
      res.status(400).json({ error: 'quantity, price y executedAt son obligatorios' });
      return;
    }
    if (quantity <= 0 || price <= 0) {
      res.status(400).json({ error: 'quantity y price deben ser positivos' });
      return;
    }
    const result = await positionService.closePosition(param(req.params.id), req.userId!, { quantity: Number(quantity), price: Number(price), executedAt });
    res.json(result);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al cerrar la posición';
    res.status(400).json({ error: msg });
  }
};

export const getOpenPositions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const positions = await positionService.getOpenPositions(req.userId!);
    res.json(positions);
  } catch {
    res.status(500).json({ error: 'Error al obtener posiciones abiertas' });
  }
};

export const getAllPositions = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const positions = await positionService.getAllPositions(req.userId!);
    res.json(positions);
  } catch {
    res.status(500).json({ error: 'Error al obtener posiciones' });
  }
};

export const getPositionTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trades = await positionService.getPositionTrades(param(req.params.id), req.userId!);
    res.json(trades);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al obtener trades';
    res.status(404).json({ error: msg });
  }
};

export const getDailyTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { date } = req.query;
    if (!date) { res.status(400).json({ error: 'date es obligatorio' }); return; }
    const trades = await positionService.getDailyTrades(req.userId!, date as string);
    res.json(trades);
  } catch {
    res.status(500).json({ error: 'Error al obtener trades del día' });
  }
};

export const getMonthlyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { year, month } = req.query;
    if (!year || !month) { res.status(400).json({ error: 'year y month son obligatorios' }); return; }
    const stats = await positionService.getMonthlyStats(req.userId!, parseInt(year as string), parseInt(month as string));
    res.json(stats);
  } catch {
    res.status(500).json({ error: 'Error al obtener estadísticas mensuales' });
  }
};

export const deletePosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await positionService.deletePosition(param(req.params.id), req.userId!);
    res.status(204).send();
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al eliminar la posición';
    res.status(400).json({ error: msg });
  }
};
