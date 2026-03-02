import { Request, Response } from 'express';
import { psychoanalysisService } from '../services/psychoanalysis.service';
import { operationRepository } from '../repositories/operation.repository';

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
  async analyze(req: Request, res: Response) {
    try {
      const operations = await operationRepository.findAll();
      const analysis = await psychoanalysisService.analyzeOperations(operations);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze operations', details: error });
    }
  },

  async analyzeByDateRange(req: Request, res: Response) {
    try {
      const { startDate, endDate } = req.query;

      if (!startDate || !endDate) {
        return res.status(400).json({ error: 'Missing startDate or endDate' });
      }

      const operations = await operationRepository.findByDateRange(
        startDate as string,
        endDate as string
      );
      const analysis = await psychoanalysisService.analyzeOperations(operations);
      res.json(analysis);
    } catch (error) {
      res.status(500).json({ error: 'Failed to analyze operations', details: error });
    }
  },
};
