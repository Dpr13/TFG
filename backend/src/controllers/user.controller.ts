import { Request, Response } from 'express';
import { userService } from '../services/user.service';
import { AuthRequest } from '../middleware/auth.middleware';
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

      const user = await userService.registerUser({ name, email, password });
      const token = generateToken(user.id);
      const { passwordHash, ...userResponse } = user;
      res.status(201).json({ user: userResponse, token });
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
      const token = generateToken(user.id);
      const { passwordHash, ...userResponse } = user;
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

      const { name, email, notificationsEnabled, darkMode } = req.body;
      const updateData: any = {};

      if (name !== undefined) updateData.name = name;
      if (email !== undefined) updateData.email = email;
      if (notificationsEnabled !== undefined) updateData.notificationsEnabled = notificationsEnabled;
      if (darkMode !== undefined) updateData.darkMode = darkMode;

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
  }
};
