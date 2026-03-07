import { userRepository } from '../repositories/user.repository';
import { CreateUserDTO, User, LoginDTO, UpdateUserDTO, ChangePasswordDTO, UserResponse } from '../models/user';
import bcrypt from 'bcrypt';

function toUserResponse(user: User): UserResponse {
  const { passwordHash, ...userResponse } = user;
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

  async loginUser(dto: LoginDTO): Promise<User | null> {
    const user = await userRepository.findByEmail(dto.email);
    if (!user) {
      return null;
    }
    const validPassword = await bcrypt.compare(dto.password, user.passwordHash);
    if (!validPassword) {
      return null;
    }
    return user;
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
  }
};
