import { Translations } from '../i18n';

/**
 * Mapea un error proveniente del backend (en español) a su traducción correspondiente.
 * Si el mensaje no tiene traducción definida, se devuelve el mensaje original.
 * 
 * @param error - El objeto de error o el string del mensaje.
 * @param t - El objeto de traducciones actual.
 * @returns El mensaje de error traducido o el original.
 */
export function mapBackendError(error: any, t: Translations): string {
  // Extraer el mensaje de error del backend
  const message = typeof error === 'string' 
    ? error 
    : error?.response?.data?.error || error?.message || 'Error desconocido';

  // Buscar en el mapeo de errores de la API
  const translated = (t as any).apiErrors?.[message];

  return translated || message;
}
