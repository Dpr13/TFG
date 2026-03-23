import { Response } from 'express';
import { psychoanalysisService } from '../services/psychoanalysis.service';
import { operationRepository } from '../repositories/operation.repository';
import { AuthRequest } from '../middleware/auth.middleware';
import { strategyRepository } from '../repositories/strategy.repository';

/**
 * PSICOANÁLISIS CONTROLLER
 * 
 * EXPANSIÓN: Endpoints y funcionalidades a desarrollar:
 * - Cálculo de índice de disciplina (0-100)
 * - Detección de ciclos emocionales
 * - [HECHO] Alertas automáticas por comportamiento (over-trading, revenge trading, espiral de pérdidas)
 * - Análisis horario (mejor hora para operar)
 * - Predicción de próximo movimiento
 * - Comparación período a período
 * - Exportación a PDF con gráficos
 * - Scoring de overtrading (frecuencia excesiva)
 * - Análisis de correlación con mercado
 * - Machine Learning para predicciones futuras
 */

export const psychoanalysisController = {
  async analyze(req: AuthRequest, res: Response) {
    try {
      const operations = await operationRepository.findAll(req.userId!);
      const analysis = await psychoanalysisService.analyzeOperations(operations);
      res.json(analysis);
    } catch (error) {
      console.error('Error in psychoanalysis analyze:', error);
      res.status(500).json({ error: 'Failed to analyze operations', details: error instanceof Error ? error.message : error });
    }
  },

  async analyzeByDateRange(req: AuthRequest, res: Response) {
    try {
      const { startDate, endDate } = req.query;
      if (!startDate || !endDate) return res.status(400).json({ error: 'Missing startDate or endDate' });
      const operations = await operationRepository.findByDateRange(startDate as string, endDate as string, req.userId!);
      const analysis = await psychoanalysisService.analyzeOperations(operations);
      res.json(analysis);
    } catch (error) {
      console.error('Error in psychoanalysis analyzeByDateRange:', error);
      res.status(500).json({ error: 'Failed to analyze operations', details: error instanceof Error ? error.message : error });
    }
  },

  async analyzeByStrategy(req: AuthRequest, res: Response) {
    try {
      const { strategyId } = req.params;
      const strategy = await strategyRepository.findById(strategyId as string, req.userId!);
      if (!strategy) return res.status(404).json({ error: 'Strategy not found' });
      const operations = await operationRepository.findByStrategyId(strategyId as string, req.userId!);
      const analysis = await psychoanalysisService.analyzeOperations(operations);
      res.json(analysis);
    } catch (error) {
      console.error('Error in psychoanalysis analyzeByStrategy:', error);
      res.status(500).json({ error: 'Failed to analyze operations', details: error instanceof Error ? error.message : error });
    }
  },
};
