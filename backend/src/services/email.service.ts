import { BrevoClient } from '@getbrevo/brevo';
import dotenv from 'dotenv';

dotenv.config();

// Inicializar el cliente de Brevo (SDK v2+)
const apiKey = process.env.BREVO_API_KEY || '';
const client = new BrevoClient({ apiKey });

// Dirección de envío: DEBE ser un email verificado en tu panel de Brevo (ej: tu gmail)
const FROM_EMAIL = process.env.MAIL_FROM || process.env.MAIL_USERNAME || 'riskanalisis2026@gmail.com';
const FROM_NAME = 'Análisis de Riesgo Financiero';

export function generarCodigoVerificacion(): string {
  return Array.from({ length: 6 }, () => Math.floor(Math.random() * 10)).join('');
}

export function enmascararEmail(email: string): string {
  const [nombre, dominio] = email.split('@');
  if (nombre.length <= 2) {
    return `${'*'.repeat(nombre.length)}@${dominio}`;
  }
  return `${nombre[0]}${'*'.repeat(nombre.length - 2)}${nombre[nombre.length - 1]}@${dominio}`;
}

export async function enviarEmailVerificacion(
  email: string,
  nombre: string,
  codigo: string
): Promise<boolean> {
  if (!apiKey) {
    console.error('[ERROR email]: BREVO_API_KEY no configurada');
    return false;
  }

  try {
    await client.transactionalEmails.sendTransacEmail({
      subject: 'Tu código de verificación — Análisis de Riesgo Financiero',
      htmlContent: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #1e293b; margin: 0 0 8px;">Verifica tu cuenta</h2>
          <p style="color: #64748b; margin: 0 0 24px; font-size: 14px;">
            Hola <strong>${nombre}</strong>, usa el siguiente código para completar tu registro:
          </p>
          <div style="background: #1e40af; color: #ffffff; font-size: 32px; font-weight: 700; letter-spacing: 8px; text-align: center; padding: 16px 24px; border-radius: 8px; margin: 0 0 24px;">
            ${codigo}
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 4px;">Este código expira en 15 minutos.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Si no has creado una cuenta, ignora este mensaje.</p>
        </div>
      `,
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: nombre }],
    });
    return true;
  } catch (error: any) {
    const errorMessage = error.response?.body?.message || error.message || error;
    console.error('[ERROR email Brevo]:', errorMessage);
    
    if (errorMessage.toString().includes('unauthorized')) {
      console.warn('⚠️ TIP: Revisa que tu BREVO_API_KEY sea correcta.');
    }
    return false;
  }
}

export async function enviarEmailRecuperacion(
  email: string,
  nombre: string,
  token: string,
  frontendUrl?: string
): Promise<boolean> {
  if (!apiKey) {
    console.error('[ERROR email recuperacion]: BREVO_API_KEY no configurada');
    return false;
  }

  const resetLink = `${frontendUrl || process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password?token=${token}`;
  
  try {
    await client.transactionalEmails.sendTransacEmail({
      subject: 'Restablece tu contraseña — Análisis de Riesgo Financiero',
      htmlContent: `
        <div style="font-family: 'Segoe UI', Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #f9fafb; border-radius: 12px;">
          <h2 style="color: #1e293b; margin: 0 0 8px;">Restablece tu contraseña</h2>
          <p style="color: #64748b; margin: 0 0 24px; font-size: 14px;">
            Hola <strong>${nombre}</strong>, has solicitado restablecer tu contraseña. Haz clic en el siguiente botón para continuar:
          </p>
          <div style="text-align: center; margin: 32px 0;">
            <a href="${resetLink}" style="background: #1e40af; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 600; display: inline-block;">
              Restablecer contraseña
            </a>
          </div>
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 16px;">O copia y pega este enlace en tu navegador:</p>
          <p style="color: #1e40af; font-size: 11px; word-break: break-all; margin: 0 0 24px;">${resetLink}</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0 0 4px;">Este enlace expira en 1 hora.</p>
          <p style="color: #94a3b8; font-size: 13px; margin: 0;">Si no has solicitado este cambio, puedes ignorar este correo.</p>
        </div>
      `,
      sender: { name: FROM_NAME, email: FROM_EMAIL },
      to: [{ email, name: nombre }],
    });
    return true;
  } catch (error: any) {
    const errorMessage = error.response?.body?.message || error.message || error;
    console.error('[ERROR email recuperacion Brevo]:', errorMessage);
    return false;
  }
}
