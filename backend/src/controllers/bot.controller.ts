import { Response } from 'express';
import { BotService } from '../services/bot.service';
import type { AuthRequest } from '../middleware/auth.middleware';

const botService = new BotService();

export const createBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, symbol, strategy, initialCapital, params } = req.body;
    if (!name || !symbol || !strategy) {
      res.status(400).json({ error: 'name, symbol y strategy son obligatorios' });
      return;
    }
    if (!['momentum', 'mean-reversion'].includes(strategy)) {
      res.status(400).json({ error: 'strategy debe ser momentum o mean-reversion' });
      return;
    }
    const bot = await botService.createBot(req.userId!, { name, symbol, strategy, initialCapital, params });
    res.status(201).json(bot);
  } catch (error) {
    res.status(500).json({ error: 'Error al crear el bot' });
  }
};

export const getUserBots = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bots = await botService.getUserBots(req.userId!);
    res.json(bots);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los bots' });
  }
};

export const startBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bot = await botService.startBot(req.params.id as string, req.userId!);
    res.json(bot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al iniciar el bot';
    res.status(400).json({ error: msg });
  }
};

export const stopBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bot = await botService.stopBot(req.params.id as string, req.userId!);
    res.json(bot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al detener el bot';
    res.status(400).json({ error: msg });
  }
};

export const getBotTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const trades = await botService.getTrades(req.params.id as string, req.userId!);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener los trades' });
  }
};

export const getBotMetrics = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const metrics = await botService.getMetrics(req.params.id as string, req.userId!);
    res.json(metrics);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las métricas' });
  }
};

export const deleteBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    await botService.deleteBot(req.params.id as string, req.userId!);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar el bot' });
  }
};
