import { Request, Response } from 'express';
import { strategyService } from '../services/strategy.service';

/**
 * ESTRATEGIA CONTROLLER
 * 
 * EXPANSIÓN: Funcionalidades a implementar:
 * - Validación de campos requeridos
 * - Deduplicación de nombres de estrategias
 * - Soft delete de estrategias (archivado)
 * - Versioning de cambios
 * - Asociación automática con operaciones nuevas
 * - Cálculo de métricas en tiempo real (PnL, win rate por estrategia)
 * - Endpoint de performance detallado
 * - Endpoint de comparación entre estrategias
 */

export const strategyController = {
  async create(req: Request, res: Response) {
    try {
      const strategy = await strategyService.createStrategy(req.body);
      res.status(201).json(strategy);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create strategy', details: error });
    }
  },

  async getById(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const strategy = await strategyService.getStrategyById(id);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json(strategy);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get strategy', details: error });
    }
  },

  async getAll(req: Request, res: Response) {
    try {
      const strategies = await strategyService.getAllStrategies();
      res.json(strategies);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get strategies', details: error });
    }
  },

  async update(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const strategy = await strategyService.updateStrategy(id, req.body);
      if (!strategy) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json(strategy);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update strategy', details: error });
    }
  },

  async delete(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const success = await strategyService.deleteStrategy(id);
      if (!success) {
        return res.status(404).json({ error: 'Strategy not found' });
      }
      res.json({ message: 'Strategy deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete strategy', details: error });
    }
  },

  async getOperations(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const operations = await strategyService.getStrategyOperations(id);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get strategy operations', details: error });
    }
  },

  async getPerformance(req: Request, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const performance = await strategyService.getStrategyPerformance(id);
      res.json(performance);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get strategy performance', details: error });
    }
  },
};
