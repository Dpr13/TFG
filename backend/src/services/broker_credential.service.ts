import { BrokerCredentialRepository } from '../repositories/broker_credential.repository';
import { AlpacaAdapter } from '../brokers/alpaca.adapter';
import type { BrokerAccountBalance, BrokerCredential, BrokerName, CreateBrokerCredentialDTO } from '../models/broker_credential';

const repo = new BrokerCredentialRepository();

export class BrokerCredentialService {
  async save(userId: string, dto: CreateBrokerCredentialDTO): Promise<BrokerCredential> {
    if (!dto.apiKey || !dto.apiSecret) throw new Error('apiKey y apiSecret son obligatorios');
    return repo.upsert(userId, dto);
  }

  async list(userId: string): Promise<BrokerCredential[]> {
    return repo.findByUser(userId);
  }

  async remove(userId: string, broker: BrokerName): Promise<void> {
    return repo.delete(userId, broker);
  }

  // isPaper: true → paper-api.alpaca.markets, false → api.alpaca.markets
  async getBalance(userId: string, broker: BrokerName, isPaper: boolean): Promise<BrokerAccountBalance> {
    if (broker === 'alpaca') return this._alpacaBalance(userId, isPaper);
    throw new Error(`Broker no soportado: ${broker}`);
  }

  async getAlpacaAdapter(userId: string, isPaper: boolean): Promise<AlpacaAdapter> {
    const creds = await repo.findWithSecrets(userId, 'alpaca');
    if (!creds) throw new Error('No tienes credenciales de Alpaca configuradas');
    return new AlpacaAdapter(creds.apiKey, creds.apiSecret, isPaper);
  }

  async hasCredentials(userId: string, broker: BrokerName): Promise<boolean> {
    const creds = await repo.findByUser(userId);
    return creds.some(c => c.broker === broker);
  }

  private async _alpacaBalance(userId: string, isPaper: boolean): Promise<BrokerAccountBalance> {
    const creds = await repo.findWithSecrets(userId, 'alpaca');
    if (!creds) throw new Error('No tienes credenciales de Alpaca configuradas');
    const adapter = new AlpacaAdapter(creds.apiKey, creds.apiSecret, isPaper);
    const account = await adapter.getAccount();
    return {
      broker: 'alpaca',
      cash: account.cash,
      buyingPower: account.buyingPower,
      portfolioValue: account.portfolioValue,
    };
  }
}

export const brokerCredentialService = new BrokerCredentialService();
