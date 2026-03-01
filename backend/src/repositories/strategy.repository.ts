import fs from 'fs/promises';
import path from 'path';
import { Strategy, CreateStrategyDTO, UpdateStrategyDTO } from '../models/strategy';
import crypto from 'crypto';

/**
 * ESTRATEGIA REPOSITORY
 * 
 * EXPANSIÓN: Actualmente usa almacenamiento en JSON (development).
 * Para producción, considerar:
 * - Base de datos MongoDB con relaciones a Operations
 * - Versionado de estrategias (v1.0, v2.0, etc.)
 * - Soporte para estrategias compartidas entre usuarios
 * - Template system para crear nuevas estrategias desde templates
 * - Estrategias predefinidas del sistema (templates default)
 * - Scoring/ranking de estrategias más rentables
 * - Archive de estrategias inactivas
 * - Benchmark comparativo entre estrategias
 */

const STRATEGIES_FILE = path.join(__dirname, '../data/strategies.json');

async function ensureFile() {
  try {
    await fs.access(STRATEGIES_FILE);
  } catch {
    await fs.writeFile(STRATEGIES_FILE, JSON.stringify([]));
  }
}

async function readStrategies(): Promise<Strategy[]> {
  await ensureFile();
  const data = await fs.readFile(STRATEGIES_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeStrategies(strategies: Strategy[]): Promise<void> {
  await fs.writeFile(STRATEGIES_FILE, JSON.stringify(strategies, null, 2));
}

export const strategyRepository = {
  async create(dto: CreateStrategyDTO): Promise<Strategy> {
    const strategies = await readStrategies();
    const now = new Date().toISOString();

    const strategy: Strategy = {
      id: crypto.randomUUID(),
      name: dto.name,
      description: dto.description,
      color: dto.color || '#3b82f6',
      createdAt: now,
      updatedAt: now,
    };

    strategies.push(strategy);
    await writeStrategies(strategies);
    return strategy;
  },

  async findById(id: string): Promise<Strategy | undefined> {
    const strategies = await readStrategies();
    return strategies.find(s => s.id === id);
  },

  async findAll(): Promise<Strategy[]> {
    return readStrategies();
  },

  async update(id: string, dto: UpdateStrategyDTO): Promise<Strategy | undefined> {
    const strategies = await readStrategies();
    const index = strategies.findIndex(s => s.id === id);
    
    if (index === -1) {
      return undefined;
    }

    const updated: Strategy = {
      ...strategies[index],
      ...dto,
      updatedAt: new Date().toISOString(),
    };

    strategies[index] = updated;
    await writeStrategies(strategies);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const strategies = await readStrategies();
    const filteredStrategies = strategies.filter(s => s.id !== id);
    
    if (filteredStrategies.length === strategies.length) {
      return false;
    }

    await writeStrategies(filteredStrategies);
    return true;
  },
};
