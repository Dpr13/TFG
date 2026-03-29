import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 587,
  secure: false,
  auth: {
    user: process.env.MAIL_USERNAME,
    pass: process.env.MAIL_PASSWORD,
  },
});

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
  try {
    await transporter.sendMail({
      from: `"Análisis de Riesgo Financiero" <${process.env.MAIL_USERNAME}>`,
      to: email,
      subject: 'Tu código de verificación — Análisis de Riesgo Financiero',
      html: `
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
    });
    return true;
  } catch (error) {
    console.error('[ERROR email]:', error);
    return false;
  }
}
