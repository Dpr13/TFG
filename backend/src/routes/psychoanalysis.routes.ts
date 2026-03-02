import { Router } from 'express';
import { psychoanalysisController } from '../controllers/psychoanalysis.controller';

/**
 * PSICOANÁLISIS ROUTES
 * 
 * EXPANSIÓN: Rutas adicionales a considerar:
 * - GET /psychoanalysis/discipline - Scoring de disciplina del trader (0-100)
 * - GET /psychoanalysis/emotion-cycle - Ciclos emocionales detectados
 * - GET /psychoanalysis/anomalies - Detección de comportamientos anómalos
 * - GET /psychoanalysis/alert - Alertas automáticas basadas en comportamiento
 * - GET /psychoanalysis/hourly - Análisis por horas del día
 * - GET /psychoanalysis/prediction - Predicción de comportamiento futuro
 * - GET /psychoanalysis/comparison - Comparar períodos (mes1 vs mes2)
 * - POST /psychoanalysis/feedback - Log de retroalimentación del usuario
 * - GET /psychoanalysis/report/pdf - Generar reporte en PDF
 * - GET /psychoanalysis/benchmark - Compararse con benchmarks de otros traders
 */

const router = Router();

router.get('/psychoanalysis', psychoanalysisController.analyze);
router.get('/psychoanalysis/range', psychoanalysisController.analyzeByDateRange);

export default router;
