import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
import { generarCodigoVerificacion, enviarEmailVerificacion, enmascararEmail } from '../services/email.service';
import jwt from 'jsonwebtoken';

function generateToken(userId: string): string {
  const secret = process.env.JWT_SECRET || 'tfg_jwt_secret_2026_secure_key';
  return jwt.sign({ userId }, secret, { expiresIn: '7d' });
}

export const userController = {
  async register(req: Request, res: Response) {
    try {
      const { name, email, password } = req.body;
      if (!name || !email || !password) {
        return res.status(400).json({ error: 'Todos los campos son obligatorios.' });
      }
      // Comprobar si el usuario ya existe
      const existing = await userService.getUserByEmail(email);
      if (existing) {
        return res.status(409).json({ error: 'El email ya está registrado. Por favor, intente con otro o inicie sesión.' });
      }

      // Validar contraseña
      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          error: 'La contraseña no cumple con los requisitos de seguridad: mínimo 8 caracteres, una mayúscula, un número y un símbolo.' 
        });
      }

      // Generar código de verificación
      const codigo = generarCodigoVerificacion();
      const expiracion = new Date(Date.now() + 15 * 60 * 1000).toISOString();

      const user = await userService.registerUser({
        name, email, password,
        verificationCode: codigo,
        codeExpiration: expiracion,
      });

      // Enviar email de verificación
      const enviado = await enviarEmailVerificacion(email, name, codigo);

      if (!enviado) {
        // Si falla el envío, eliminar el usuario creado
        await userService.deleteUser(user.id);
        return res.status(500).json({ error: 'No se pudo enviar el email de verificación. Comprueba que la dirección es correcta.' });
      }

      res.status(201).json({
        ok: true,
        mensaje: 'Código enviado. Revisa tu bandeja de entrada.',
        email_enmascarado: enmascararEmail(email),
        email: email,
      });
    } catch (error) {
      console.error('Error en registro:', error);
      res.status(500).json({ error: 'Error al registrar usuario', details: error });
    }
  },

  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;
      if (!email || !password) {
        return res.status(400).json({ error: 'Email y contraseña son obligatorios.' });
      }
      const user = await userService.loginUser({ email, password });

      // Comprobar si el email está verificado
      if (!user.emailVerified) {
        return res.status(200).json({
          ok: false,
          requiere_verificacion: true,
          mensaje: 'Debes verificar tu email antes de acceder.',
          email_enmascarado: enmascararEmail(email),
          email: email,
        });
      }

      const token = generateToken(user.id);
      const { passwordHash, verificationCode, codeExpiration, ...userResponse } = user;
      res.status(200).json({ user: userResponse, token });
    } catch (error) {
      console.error('Error en login:', error);
      const message = error instanceof Error ? error.message : '';
      
      if (message === 'user_not_found') {
        return res.status(404).json({ error: 'El correo proporcionado no coincide con ninguna cuenta existente. Por favor, pruebe con otro correo' });
      }
      if (message === 'invalid_password') {
        return res.status(401).json({ error: 'Contraseña incorrecta. Por favor, inténtelo de nuevo.' });
      }
      
      res.status(500).json({ error: 'Error al iniciar sesión', details: error });
    }
  },

  async verificarEmail(req: Request, res: Response) {
    try {
      const { email, codigo } = req.body;
      if (!email || !codigo) {
        return res.status(400).json({ error: 'Email y código son obligatorios.' });
      }

      const code = String(codigo).trim();
      const user = await userService.verifyEmail(email, code);

      res.status(200).json({ ok: true, mensaje: 'Email verificado correctamente.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message === 'user_not_found') {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      if (message === 'already_verified') {
        return res.status(400).json({ error: 'El email ya ha sido verificado.' });
      }
      if (message === 'code_expired') {
        return res.status(400).json({ error: 'El código ha expirado. Solicita uno nuevo.' });
      }
      if (message === 'invalid_code') {
        return res.status(400).json({ error: 'Código incorrecto. Inténtalo de nuevo.' });
      }

      console.error('Error verificando email:', error);
      res.status(500).json({ error: 'Error al verificar el email.' });
    }
  },

  async reenviarCodigo(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email es obligatorio.' });
      }

      const result = await userService.resendCode(email);
      res.status(200).json({ ok: true, mensaje: 'Código reenviado.', email_enmascarado: result.emailEnmascarado });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';

      if (message === 'user_not_found') {
        return res.status(404).json({ error: 'Usuario no encontrado.' });
      }
      if (message === 'already_verified') {
        return res.status(400).json({ error: 'No hay verificación pendiente para este email.' });
      }
      if (message === 'email_send_failed') {
        return res.status(500).json({ error: 'No se pudo reenviar el email.' });
      }

      console.error('Error reenviando código:', error);
      res.status(500).json({ error: 'Error al reenviar el código.' });
    }
  },

  async getProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const user = await userService.getUserById(userId);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error obteniendo perfil:', error);
      res.status(500).json({ error: 'Error al obtener el perfil', details: error });
    }
  },

  async updateProfile(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { name, email, notificationsEnabled, darkMode, language } = req.body;
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
      if (darkMode !== undefined) updateData.darkMode = darkMode;
      if (language !== undefined) updateData.language = language;

      const user = await userService.updateUser(userId, updateData);
      if (!user) {
        return res.status(404).json({ error: 'Usuario no encontrado' });
      }

      res.status(200).json(user);
    } catch (error) {
      console.error('Error actualizando perfil:', error);
      const message = error instanceof Error ? error.message : 'Error al actualizar el perfil';
      
      if (message.includes('email ya está en uso')) {
        return res.status(409).json({ error: message });
      }
      
      res.status(500).json({ error: message });
    }
  },

  async changePassword(req: AuthRequest, res: Response) {
    try {
      const userId = req.userId;
      if (!userId) {
        return res.status(401).json({ error: 'Usuario no autenticado' });
      }

      const { currentPassword, newPassword } = req.body;
      
      if (!currentPassword || !newPassword) {
        return res.status(400).json({ error: 'Se requieren la contraseña actual y la nueva' });
      }

      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'La nueva contraseña debe tener al menos 6 caracteres' });
      }

      const success = await userService.changePassword(userId, { currentPassword, newPassword });
      
      if (!success) {
        return res.status(500).json({ error: 'Error al cambiar la contraseña' });
      }

      res.status(200).json({ message: 'Contraseña actualizada correctamente' });
    } catch (error) {
      console.error('Error cambiando contraseña:', error);
      const message = error instanceof Error ? error.message : 'Error al cambiar la contraseña';
      
      if (message.includes('contraseña actual es incorrecta')) {
        return res.status(401).json({ error: message });
      }
      
      res.status(500).json({ error: message });
    }
  },

  async forgotPassword(req: Request, res: Response) {
    try {
      const { email } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'Email es obligatorio.' });
      }

      // Intentar obtener la URL base del frontend dinámicamente
      const origin = req.get('origin');
      const referer = req.get('referer');
      let frontendUrl = origin;
      
      if (!frontendUrl && referer) {
        const url = new URL(referer);
        frontendUrl = `${url.protocol}//${url.host}`;
      }

      await userService.requestPasswordReset(email, frontendUrl);
      res.status(200).json({ ok: true, mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'user_not_found') {
        // Por seguridad, no revelamos si el usuario existe
        return res.status(200).json({ ok: true, mensaje: 'Si el correo está registrado, recibirás un enlace de recuperación.' });
      }
      console.error('Error en forgotPassword:', error);
      res.status(500).json({ error: 'Error al procesar la solicitud de recuperación.' });
    }
  },

  async resetPassword(req: Request, res: Response) {
    try {
      const { token, password } = req.body;
      if (!token || !password) {
        return res.status(400).json({ error: 'Token y nueva contraseña son obligatorios.' });
      }

      const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
      if (!passwordRegex.test(password)) {
        return res.status(400).json({ 
          error: 'La contraseña no cumple con los requisitos de seguridad: mínimo 8 caracteres, una mayúscula, un número y un símbolo.' 
        });
      }

      await userService.resetPassword(token, password);
      res.status(200).json({ ok: true, mensaje: 'Contraseña restablecida correctamente.' });
    } catch (error) {
      const message = error instanceof Error ? error.message : '';
      if (message === 'invalid_token') {
        return res.status(400).json({ error: 'El enlace de recuperación es inválido.' });
      }
      if (message === 'token_expired') {
        return res.status(400).json({ error: 'El enlace de recuperación ha expirado.' });
      }
      console.error('Error en resetPassword:', error);
      res.status(500).json({ error: 'Error al restablecer la contraseña.' });
    }
  }
};
