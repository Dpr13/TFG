import { userRepository } from '../repositories/user.repository';
import { CreateUserDTO, User, LoginDTO, UpdateUserDTO, ChangePasswordDTO, UserResponse } from '../models/user';
import { generarCodigoVerificacion, enviarEmailVerificacion, enmascararEmail } from './email.service';
import bcrypt from 'bcrypt';

function toUserResponse(user: User): UserResponse {
  const { passwordHash, verificationCode, codeExpiration, ...userResponse } = user;
  return userResponse;
}

export const userService = {
  async registerUser(dto: CreateUserDTO): Promise<User> {
    return userRepository.create(dto);
  },

  async getUserByEmail(email: string): Promise<User | undefined> {
    return userRepository.findByEmail(email);
  },

  async getUserById(id: string): Promise<UserResponse | undefined> {
    const user = await userRepository.findById(id);
    return user ? toUserResponse(user) : undefined;
  },

  async loginUser(dto: LoginDTO): Promise<User> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      throw new Error('user_not_found');
    }
    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      throw new Error('invalid_password');
    }
    return user;
  },

  async verifyEmail(email: string, code: string): Promise<UserResponse> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('user_not_found');
    }

    if (user.emailVerified) {
      throw new Error('already_verified');
    }

    if (!user.codeExpiration || new Date() > new Date(user.codeExpiration)) {
      throw new Error('code_expired');
    }

    if (user.verificationCode !== code) {
      throw new Error('invalid_code');
    }

    const updated = await userRepository.updateVerification(user.id, {
      emailVerified: true,
      verificationCode: null,
      codeExpiration: null,
    });

    return toUserResponse(updated!);
  },

  async resendCode(email: string): Promise<{ ok: boolean; emailEnmascarado: string }> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('user_not_found');
    }

    if (user.emailVerified) {
      throw new Error('already_verified');
    }

    const codigo = generarCodigoVerificacion();
    const expiracion = new Date(Date.now() + 15 * 60 * 1000).toISOString();

    await userRepository.updateVerification(user.id, {
      verificationCode: codigo,
      codeExpiration: expiracion,
    });

    const enviado = await enviarEmailVerificacion(email, user.name, codigo);
    if (!enviado) {
      throw new Error('email_send_failed');
    }

    return { ok: true, emailEnmascarado: enmascararEmail(email) };
  },

  async deleteUser(id: string): Promise<boolean> {
    return userRepository.deleteById(id);
  },

  async updateUser(id: string, dto: UpdateUserDTO): Promise<UserResponse | undefined> {
    // Si se intenta cambiar el email, verificar que no exista
    if (dto.email) {
      const existing = await userRepository.findByEmail(dto.email);
      if (existing && existing.id !== id) {
        throw new Error('El email ya está en uso por otra cuenta');
      }
    }

    const user = await userRepository.update(id, dto);
    return user ? toUserResponse(user) : undefined;
  },

  async changePassword(id: string, dto: ChangePasswordDTO): Promise<boolean> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('Usuario no encontrado');
    }

    // Verificar la contraseña actual
    const validPassword = await bcrypt.compare(dto.currentPassword, user.passwordHash);
    if (!validPassword) {
      throw new Error('La contraseña actual es incorrecta');
    }

    // Hashear la nueva contraseña
    const newPasswordHash = await bcrypt.hash(dto.newPassword, 10);
    return userRepository.updatePassword(id, newPasswordHash);
  },

  async requestPasswordReset(email: string, frontendUrl?: string): Promise<boolean> {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      throw new Error('user_not_found');
    }

    const token = require('crypto').randomBytes(32).toString('hex');
    const expires = new Date(Date.now() + 3600000).toISOString(); // 1 hora

    await userRepository.updateVerification(user.id, {
      resetToken: token,
      resetExpires: expires,
    });

    const { enviarEmailRecuperacion } = require('./email.service');
    return enviarEmailRecuperacion(email, user.name, token, frontendUrl);
  },

  async resetPassword(token: string, newPassword: string): Promise<boolean> {
    const user = await userRepository.findByResetToken(token);
    if (!user) {
      throw new Error('invalid_token');
    }

    if (!user.resetExpires || new Date() > new Date(user.resetExpires)) {
      throw new Error('token_expired');
    }

    // Hashear la nueva contraseña
    const newPasswordHash = await bcrypt.hash(newPassword, 10);
    
    // Actualizar contraseña y limpiar token
    const success = await userRepository.updatePassword(user.id, newPasswordHash);
    if (success) {
      await userRepository.updateVerification(user.id, {
        resetToken: null,
        resetExpires: null,
      });
    }

    return success;
  }
};
