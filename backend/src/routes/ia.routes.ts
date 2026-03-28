import { Router } from 'express';
import { analyzeIA, chatIAEndpoint, resumenTecnicoIA } from '../controllers/ia.controller';
import { optionalAuth } from '../middleware/auth.middleware';

const router = Router();

// POST /api/ia/analyze — Generate AI summary + justification
router.post('/ia/analyze', optionalAuth, analyzeIA);

// POST /api/ia/chat — Contextual chat
router.post('/ia/chat', optionalAuth, chatIAEndpoint);

// POST /api/ia/resumen-tecnico — Resumen narrativo puramente técnico
router.post('/ia/resumen-tecnico', optionalAuth, resumenTecnicoIA);

export default router;
