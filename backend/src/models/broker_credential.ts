export type BrokerName = 'alpaca';
export type BrokerMode = 'simulated' | 'alpaca_paper' | 'alpaca_live';

export interface BrokerCredential {
  id: string;
  userId: string;
  broker: BrokerName;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerCredentialWithSecrets extends BrokerCredential {
  apiKey: string;
  apiSecret: string;
}

export interface CreateBrokerCredentialDTO {
  broker: BrokerName;
  apiKey: string;
  apiSecret: string;
}

export interface BrokerAccountBalance {
  broker: BrokerName;
  cash: number;
  buyingPower: number;
  portfolioValue: number;
}
