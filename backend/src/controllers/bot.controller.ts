import { Response } from 'express';
import { botService } from '../services/bot.service';
import type { AuthRequest } from '../middleware/auth.middleware';

export const getMarketStatus = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const status = await botService.getMarketStatus(req.params.id as string, req.userId!);
    res.json(status);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al consultar el estado del mercado';
    res.status(400).json({ error: msg });
  }
};

export const pauseBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bot = await botService.pauseBot(req.params.id as string, req.userId!);
    res.json(bot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al pausar el bot';
    res.status(400).json({ error: msg });
  }
};

export const closePosition = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const bot = await botService.closePosition(req.params.id as string, req.userId!);
    res.json(bot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al cerrar la posición';
    res.status(400).json({ error: msg });
  }
};

export const createBot = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { name, symbol, strategy, brokerMode, initialCapital, params } = req.body;
    if (!name || !symbol || !strategy) {
      res.status(400).json({ error: 'name, symbol y strategy son obligatorios' });
      return;
    }
    if (!['momentum', 'mean-reversion', 'rsi'].includes(strategy)) {
      res.status(400).json({ error: 'strategy debe ser momentum, mean-reversion o rsi' });
      return;
    }
    if (brokerMode && !['simulated', 'alpaca_paper', 'alpaca_live'].includes(brokerMode)) {
      res.status(400).json({ error: 'brokerMode debe ser simulated, alpaca_paper o alpaca_live' });
      return;
    }
    if (strategy === 'momentum' && params?.fastWindow != null && params?.slowWindow != null) {
      if (params.fastWindow >= params.slowWindow) {
        res.status(400).json({ error: 'fastWindow debe ser menor que slowWindow' });
        return;
      }
    }
    const bot = await botService.createBot(req.userId!, { name, symbol, strategy, brokerMode, initialCapital, params });
    res.status(201).json(bot);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al crear el bot';
    res.status(400).json({ error: msg });
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

export const getBotMonthlyStats = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const year = parseInt(req.query.year as string);
    const month = parseInt(req.query.month as string);
    if (isNaN(year) || isNaN(month)) {
      res.status(400).json({ error: 'year y month son obligatorios' });
      return;
    }
    const botId = req.query.botId as string | undefined;
    const stats = await botService.getMonthlyStats(req.userId!, year, month, botId);
    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener estadísticas mensuales de bots' });
  }
};

export const getBotDailyTrades = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const date = req.query.date as string;
    if (!date) {
      res.status(400).json({ error: 'date es obligatorio' });
      return;
    }
    const botId = req.query.botId as string | undefined;
    const trades = await botService.getDailyTrades(req.userId!, date, botId);
    res.json(trades);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener trades del día' });
  }
};
