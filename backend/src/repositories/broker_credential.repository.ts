import { pool } from '../config';
import { encrypt, decrypt } from '../utils/encryption';
import type { BrokerCredential, BrokerCredentialWithSecrets, BrokerName, CreateBrokerCredentialDTO } from '../models/broker_credential';

function mapCredential(row: any): BrokerCredential {
  return {
    id: row.id,
    userId: row.user_id,
    broker: row.broker,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export class BrokerCredentialRepository {
  async upsert(userId: string, dto: CreateBrokerCredentialDTO): Promise<BrokerCredential> {
    const result = await pool.query(
      `INSERT INTO broker_credentials (user_id, broker, api_key_enc, api_secret_enc)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (user_id, broker) DO UPDATE
         SET api_key_enc = EXCLUDED.api_key_enc,
             api_secret_enc = EXCLUDED.api_secret_enc,
             updated_at = NOW()
       RETURNING *`,
      [userId, dto.broker, encrypt(dto.apiKey), encrypt(dto.apiSecret)]
    );
    return mapCredential(result.rows[0]);
  }

  async findByUser(userId: string): Promise<BrokerCredential[]> {
    const result = await pool.query(
      'SELECT * FROM broker_credentials WHERE user_id = $1 ORDER BY created_at ASC',
      [userId]
    );
    return result.rows.map(mapCredential);
  }

  async findWithSecrets(userId: string, broker: BrokerName): Promise<BrokerCredentialWithSecrets | null> {
    const result = await pool.query(
      'SELECT * FROM broker_credentials WHERE user_id = $1 AND broker = $2',
      [userId, broker]
    );
    if (!result.rows[0]) return null;
    const row = result.rows[0];
    return {
      ...mapCredential(row),
      apiKey: decrypt(row.api_key_enc),
      apiSecret: decrypt(row.api_secret_enc),
    };
  }

  async delete(userId: string, broker: BrokerName): Promise<void> {
    await pool.query(
      'DELETE FROM broker_credentials WHERE user_id = $1 AND broker = $2',
      [userId, broker]
    );
  }
}
