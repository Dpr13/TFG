import { BotStrategyRepository } from '../repositories/bot_strategy.repository';
import type { BotStrategy, CreateBotStrategyDTO } from '../models/bot_strategy';

const repo = new BotStrategyRepository();

export class BotStrategyService {
  async create(userId: string, dto: CreateBotStrategyDTO): Promise<BotStrategy> {
    return repo.create(userId, dto);
  }

  async getAll(userId: string): Promise<BotStrategy[]> {
    return repo.findByUser(userId);
  }

  async getById(id: string, userId: string): Promise<BotStrategy> {
    const s = await repo.findById(id, userId);
    if (!s) throw new Error('Estrategia no encontrada');
    return s;
  }

  async update(id: string, userId: string, dto: Partial<CreateBotStrategyDTO>): Promise<BotStrategy> {
    const s = await repo.update(id, userId, dto);
    if (!s) throw new Error('Estrategia no encontrada');
    return s;
  }

  async delete(id: string, userId: string): Promise<void> {
    return repo.delete(id, userId);
  }
}
