import { describe, it, expect, vi, beforeEach } from 'vitest';
import bcrypt from 'bcrypt';

// Mocks deben declararse antes del import del módulo a testear
vi.mock('../../repositories/user.repository', () => ({
  userRepository: {
    findByEmail: vi.fn(),
    findById: vi.fn(),
    create: vi.fn(),
    update: vi.fn(),
    updatePassword: vi.fn(),
  },
}));

vi.mock('bcrypt');

import { userService } from '../user.service';
import { userRepository } from '../../repositories/user.repository';

const mockUser = {
  id: 'uuid-1',
  name: 'Test User',
  email: 'test@ejemplo.com',
  passwordHash: '$2b$10$hashedpassword',
  notificationsEnabled: false,
  darkMode: false,
  createdAt: '2024-01-01T00:00:00.000Z',
  updatedAt: '2024-01-01T00:00:00.000Z',
};

describe('userService', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ── loginUser ────────────────────────────────────────────────────────────────

  describe('loginUser', () => {
    it('devuelve null cuando el usuario no existe', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(undefined);

      const result = await userService.loginUser({
        email: 'noexiste@ejemplo.com',
        password: 'cualquiera',
      });

      expect(result).toBeNull();
      expect(userRepository.findByEmail).toHaveBeenCalledWith('noexiste@ejemplo.com');
    });

    it('devuelve null cuando la contraseña es incorrecta', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(false as never);

      const result = await userService.loginUser({
        email: 'test@ejemplo.com',
        password: 'wrongpassword',
      });

      expect(result).toBeNull();
    });

    it('devuelve el usuario cuando las credenciales son correctas', async () => {
      vi.mocked(userRepository.findByEmail).mockResolvedValue(mockUser);
      vi.mocked(bcrypt.compare).mockResolvedValue(true as never);

      const result = await userService.loginUser({
        email: 'test@ejemplo.com',
        password: 'correctpassword',
      });

      expect(result).toEqual(mockUser);
    });
  });

  // ── getUserById ──────────────────────────────────────────────────────────────

  describe('getUserById', () => {
    it('devuelve undefined cuando el usuario no existe', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(undefined);

      const result = await userService.getUserById('id-inexistente');

      expect(result).toBeUndefined();
    });

    it('devuelve el usuario sin passwordHash', async () => {
      vi.mocked(userRepository.findById).mockResolvedValue(mockUser);

      const result = await userService.getUserById('uuid-1');

      expect(result).toBeDefined();
      expect(result).not.toHaveProperty('passwordHash');
      expect(result?.email).toBe('test@ejemplo.com');
      expect(result?.name).toBe('Test User');
    });
  });

  // ── updateUser ───────────────────────────────────────────────────────────────

  describe('updateUser', () => {
    it('lanza error si el email ya está en uso por otra cuenta', async () => {
      const otherUser = { ...mockUser, id: 'otro-uuid', email: 'ocupado@ejemplo.com' };
      vi.mocked(userRepository.findByEmail).mockResolvedValue(otherUser);

      await expect(
        userService.updateUser('uuid-1', { email: 'ocupado@ejemplo.com' })
      ).rejects.toThrow('El email ya está en uso por otra cuenta');
    });
  });
});
