export interface User {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateUserDTO {
  name: string;
  email: string;
  password: string;
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

export interface UserResponse {
  id: string;
  name: string;
  email: string;
  notificationsEnabled: boolean;
  darkMode: boolean;
  createdAt: string;
  updatedAt: string;
}
