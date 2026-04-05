export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  emailVerified: boolean;
  verificationCode: string | null;
  codeExpiration: string | null;
  resetToken: string | null;
  resetExpires: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
  verificationCode?: string;
  codeExpiration?: string;
}

export interface LoginDTO {
  email: string;
  password: string;
}

export interface UpdateUserDTO {
  name?: string;
  email?: string;
  notificationsEnabled?: boolean;
  darkMode?: boolean;
}

export interface ChangePasswordDTO {
  currentPassword: string;
  newPassword: string;
}

export interface UpdateVerificationDTO {
  emailVerified?: boolean;
  verificationCode?: string | null;
  codeExpiration?: string | null;
  resetToken?: string | null;
  resetExpires?: string | null;
}

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  emailVerified: boolean;
  createdAt: string;
  updatedAt: string;
}
