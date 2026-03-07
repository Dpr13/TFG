import { Response } from 'express';
import { psychoanalysisService } from '../services/psychoanalysis.service';
import { operationRepository } from '../repositories/operation.repository';
import { AuthRequest } from '../middleware/auth.middleware';

/**
 * PSICOANÁLISIS CONTROLLER
 * 
 * EXPANSIÓN: Endpoints y funcionalidades a desarrollar:
 * - Cálculo de índice de disciplina (0-100)
 * - Detección de ciclos emocionales
 * - Alertas automáticas por comportamiento
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
};
