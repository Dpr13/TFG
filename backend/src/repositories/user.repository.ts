import { pool } from '../config';
import { User, CreateUserDTO, UpdateUserDTO } from '../models/user';
import crypto from 'crypto';
import bcrypt from 'bcrypt';

function mapUserFromDb(row: any): User {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    passwordHash: row.password_hash,
    notificationsEnabled: row.notifications_enabled,
    darkMode: row.dark_mode,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}

export const userRepository = {
  async create(dto: CreateUserDTO): Promise<User> {
    const now = new Date().toISOString();
    const id = crypto.randomUUID();
    const passwordHash = await bcrypt.hash(dto.password, 10);
    const query = `INSERT INTO users (id, name, email, password_hash, created_at, updated_at)
      VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`;
    const values = [id, dto.name, dto.email, passwordHash, now, now];
    const result = await pool.query(query, values);
    return mapUserFromDb(result.rows[0]);
  },

  async findByEmail(email: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    return result.rows[0] ? mapUserFromDb(result.rows[0]) : undefined;
  },

  async findById(id: string): Promise<User | undefined> {
    const result = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
    return result.rows[0] ? mapUserFromDb(result.rows[0]) : undefined;
  },

  async update(id: string, dto: UpdateUserDTO): Promise<User | undefined> {
    const now = new Date().toISOString();
    const fields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (dto.name !== undefined) {
      fields.push(`name = $${paramCount++}`);
      values.push(dto.name);
    }
    if (dto.email !== undefined) {
      fields.push(`email = $${paramCount++}`);
      values.push(dto.email);
    }
    if (dto.notificationsEnabled !== undefined) {
      fields.push(`notifications_enabled = $${paramCount++}`);
      values.push(dto.notificationsEnabled);
    }
    if (dto.darkMode !== undefined) {
      fields.push(`dark_mode = $${paramCount++}`);
      values.push(dto.darkMode);
    }

    if (fields.length === 0) {
      return this.findById(id);
    }

    fields.push(`updated_at = $${paramCount++}`);
    values.push(now);
    values.push(id);

    const query = `UPDATE users SET ${fields.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    const result = await pool.query(query, values);
    return result.rows[0] ? mapUserFromDb(result.rows[0]) : undefined;
  },

  async updatePassword(id: string, newPasswordHash: string): Promise<boolean> {
    const now = new Date().toISOString();
    const query = `UPDATE users SET password_hash = $1, updated_at = $2 WHERE id = $3 RETURNING id`;
    const result = await pool.query(query, [newPasswordHash, now, id]);
    return (result.rowCount ?? 0) > 0;
  }
};
