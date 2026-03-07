import { Response } from 'express';
import { operationService } from '../services/operation.service';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * OPERACIÓN CONTROLLER
 * 
 * EXPANSIÓN: Validaciones y mejoras a considerar:
 * - Validación de entrada con zod/joi schemas
 * - Rate limiting para prevenir abuse
 * - Autenticación y autorización multi-usuario
 * - Logging detallado de cada acción (audit trail)
 * - Pagination en getAll() con limit/offset
 * - Caching de operaciones frecuentes
 * - Compresión de respuestas grandes (gzip)
 * - Manejo de transacciones para operaciones multi-paso
 */

export const operationController = {
  async create(req: AuthRequest, res: Response) {
    try {
      const operation = await operationService.createOperation({ ...req.body, userId: req.userId! });
      res.status(201).json(operation);
    } catch (error) {
      res.status(400).json({ error: 'Failed to create operation', details: error });
    }
  },

  async getById(req: AuthRequest, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const operation = await operationService.getOperationById(id, req.userId!);
      if (!operation) return res.status(404).json({ error: 'Operation not found' });
      res.json(operation);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get operation', details: error });
    }
  },

  async getByDate(req: AuthRequest, res: Response) {
    try {
      const date = typeof req.params.date === 'string' ? req.params.date : req.params.date[0];
      const operations = await operationService.getOperationsByDate(date, req.userId!);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get operations', details: error });
    }
  },

  async getByDateRange(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ error: 'Missing startDate or endDate' });
      const operations = await operationService.getOperationsByDateRange(startDate as string, endDate as string, req.userId!);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get operations', details: error });
    }
  },

  async getAll(req: AuthRequest, res: Response) {
    try {
      const operations = await operationService.getAllOperations(req.userId!);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get operations', details: error });
    }
  },

  async update(req: AuthRequest, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const operation = await operationService.updateOperation(id, req.userId!, req.body);
      if (!operation) return res.status(404).json({ error: 'Operation not found' });
      res.json(operation);
    } catch (error) {
      res.status(400).json({ error: 'Failed to update operation', details: error });
    }
  },

  async delete(req: AuthRequest, res: Response) {
    try {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const success = await operationService.deleteOperation(id, req.userId!);
      if (!success) return res.status(404).json({ error: 'Operation not found' });
      res.json({ message: 'Operation deleted successfully' });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete operation', details: error });
    }
  },

  async deleteByDate(req: AuthRequest, res: Response) {
    try {
      const date = typeof req.params.date === 'string' ? req.params.date : req.params.date[0];
      const count = await operationService.deleteOperationsByDate(date, req.userId!);
      res.json({ message: `${count} operations deleted`, count });
    } catch (error) {
      res.status(500).json({ error: 'Failed to delete operations', details: error });
    }
  },

  async getDailyStats(req: AuthRequest, res: Response) {
    try {
      const date = typeof req.params.date === 'string' ? req.params.date : req.params.date[0];
      const stats = await operationService.getDailyStats(date, req.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get daily stats', details: error });
    }
  },

  async getMonthlyStats(req: AuthRequest, res: Response) {
    try {
      const { year, month } = req.query;
      if (!year || !month) return res.status(400).json({ error: 'Missing year or month' });
      const stats = await operationService.getMonthlyStats(parseInt(year as string), parseInt(month as string), req.userId!);
      res.json(stats);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get monthly stats', details: error });
    }
  },

  async getByStrategyId(req: AuthRequest, res: Response) {
    try {
      const strategyId = typeof req.params.strategyId === 'string' ? req.params.strategyId : req.params.strategyId[0];
      const operations = await operationService.getOperationsByStrategyId(strategyId, req.userId!);
      res.json(operations);
    } catch (error) {
      res.status(500).json({ error: 'Failed to get operations by strategy', details: error });
    }
  },
};
