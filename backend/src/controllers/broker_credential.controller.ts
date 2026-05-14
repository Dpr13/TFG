import { Response } from 'express';
import { brokerCredentialService } from '../services/broker_credential.service';
import type { AuthRequest } from '../middleware/auth.middleware';
import type { BrokerName } from '../models/broker_credential';

const VALID_BROKERS: BrokerName[] = ['alpaca'];

export const saveBrokerCredential = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const { broker, apiKey, apiSecret } = req.body;
    if (!broker || !apiKey || !apiSecret) {
      res.status(400).json({ error: 'broker, apiKey y apiSecret son obligatorios' });
      return;
    }
    if (!VALID_BROKERS.includes(broker)) {
      res.status(400).json({ error: `Broker no válido. Opciones: ${VALID_BROKERS.join(', ')}` });
      return;
    }
    const credential = await brokerCredentialService.save(req.userId!, { broker, apiKey, apiSecret });
    res.status(201).json(credential);
  } catch (error) {
    res.status(500).json({ error: 'Error al guardar las credenciales' });
  }
};

export const listBrokerCredentials = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const credentials = await brokerCredentialService.list(req.userId!);
    res.json(credentials);
  } catch (error) {
    res.status(500).json({ error: 'Error al obtener las credenciales' });
  }
};

export const deleteBrokerCredential = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const broker = req.params.broker as BrokerName;
    if (!VALID_BROKERS.includes(broker)) {
      res.status(400).json({ error: 'Broker no válido' });
      return;
    }
    await brokerCredentialService.remove(req.userId!, broker);
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Error al eliminar las credenciales' });
  }
};

export const getBrokerBalance = async (req: AuthRequest, res: Response): Promise<void> => {
  try {
    const broker = req.params.broker as BrokerName;
    // isPaper query param: true by default (safer)
    const isPaper = req.query.isPaper !== 'false';
    if (!VALID_BROKERS.includes(broker)) {
      res.status(400).json({ error: 'Broker no válido' });
      return;
    }
    const balance = await brokerCredentialService.getBalance(req.userId!, broker, isPaper);
    res.json(balance);
  } catch (error) {
    const msg = error instanceof Error ? error.message : 'Error al consultar el balance';
    res.status(400).json({ error: msg });
  }
};
