import { Request, Response } from 'express';
import { construirContexto, generarAnalisisIA, chatIA, generarResumenTecnico } from '../services/ia.service';
import { getLanguage } from '../utils/i18n';

/**
 * POST /api/ia/analyze
 * Generates AI narrative summary + signal justification in parallel
 */
export const analyzeIA = async (req: Request, res: Response): Promise<void> => {
  try {
    const {
      ticker, direccion, intervalo, horizonte, precio_entrada, sl, metodo_sl,
      tps, tps_detalle, risk_management,
      datos_tecnicos, datos_fundamentales,
    } = req.body;

    if (!ticker || !precio_entrada) {
      res.status(400).json({ error: 'Faltan datos obligatorios (ticker, precio_entrada).' });
      return;
    }

    const lang = getLanguage(req.headers['accept-language'] as string);

    const ctx = construirContexto({
      ticker,
      direccion: direccion || 'LONG',
      intervalo: intervalo || '1d',
      horizonte: horizonte || intervalo || '1d',
      precio_entrada,
      sl: sl || precio_entrada,
      metodo_sl: metodo_sl || '% Fijo',
      tps: tps || [],
      tps_detalle: tps_detalle || undefined,
      risk_management: risk_management || undefined,
      datos_tecnicos: datos_tecnicos || {},
      datos_fundamentales: datos_fundamentales || {},
      lang,
    });

    const resultado = await generarAnalisisIA(ctx);
    res.json(resultado);
  } catch (error) {
    console.error('Error in analyzeIA:', error);
    res.status(500).json({
      resumen: null,
      justificacion: null,
      resumenError: 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.',
      justificacionError: 'El servicio de IA no está disponible en este momento. Inténtalo de nuevo.',
    });
  }
};

/**
 * POST /api/ia/chat
 * Contextual chat with conversation history
 */
export const chatIAEndpoint = async (req: Request, res: Response): Promise<void> => {
  try {
    const { contexto, historial, mensaje } = req.body;

    if (!mensaje || !contexto) {
      res.status(400).json({ respuesta: 'Faltan datos obligatorios.', ok: false });
      return;
    }

    const lang = getLanguage(req.headers['accept-language'] as string);

    const ctx = construirContexto({
      ticker: contexto.ticker,
      direccion: contexto.direccion || 'LONG',
      intervalo: contexto.intervalo || '1d',
      precio_entrada: contexto.precio_entrada,
      sl: contexto.sl || contexto.precio_entrada,
      tps: contexto.tps || [],
      datos_tecnicos: contexto.datos_tecnicos || {},
      datos_fundamentales: contexto.datos_fundamentales || {},
      lang,
    });

    const resultado = await chatIA(ctx, historial || [], mensaje);
    res.json(resultado);
  } catch (error) {
    console.error('Error in chatIA:', error);
    res.status(500).json({
      respuesta: 'Error al conectar con el servicio de IA.',
      ok: false,
    });
  }
};

/**
 * POST /api/ia/resumen-tecnico
 * Generates a purely technical narrative summary based on chart data
 */
export const resumenTecnicoIA = async (req: Request, res: Response): Promise<void> => {
  try {
    const data = req.body;
    
    if (!data.ticker) {
      res.status(400).json({ error: 'Falta el ticker del activo.', ok: false, resumen: null });
      return;
    }

    const lang = getLanguage(req.headers['accept-language'] as string);

    const resultado = await generarResumenTecnico({
      ticker: data.ticker,
      intervalo: data.intervalo || '1d',
      horizonte: data.horizonte || '1y',
      datos_tecnicos: data.datos_tecnicos || {},
      lang,
    });
    
    if (resultado.ok) {
      res.json(resultado);
    } else {
      res.status(500).json(resultado);
    }
  } catch (error) {
    console.error('Error in resumenTecnicoIA:', error);
    res.status(500).json({
      resumen: null,
      ok: false,
      error: 'El servicio de IA no está disponible en este momento.',
    });
  }
};
