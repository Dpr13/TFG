import fs from 'fs/promises';
import path from 'path';
import { Operation, CreateOperationDTO, UpdateOperationDTO } from '../models/operation';
import crypto from 'crypto';

/**
 * OPERACIÓN REPOSITORY
 * 
 * EXPANSIÓN: Actualmente usa almacenamiento en JSON (development).
 * Para producción, considerar:
 * - Base de datos MongoDB para escalabilidad
 * - Caché en Redis para operaciones frecuentes
 * - Indexación de búsquedas por fecha y símbolo
 * - Replicación de datos para backup automático
 * - Audit trail para cada cambio
 * - Pagination para grandes resultados
 * - Full-text search en notas y símbolos
 * - Compresión de datos históricos (>1 año)
 */

const OPERATIONS_FILE = path.join(__dirname, '../data/operations.json');

async function ensureFile() {
  try {
    await fs.access(OPERATIONS_FILE);
  } catch {
    await fs.writeFile(OPERATIONS_FILE, JSON.stringify([]));
  }
}

async function readOperations(): Promise<Operation[]> {
  await ensureFile();
  const data = await fs.readFile(OPERATIONS_FILE, 'utf-8');
  return JSON.parse(data);
}

async function writeOperations(operations: Operation[]): Promise<void> {
  await fs.writeFile(OPERATIONS_FILE, JSON.stringify(operations, null, 2));
}

export const operationRepository = {
  async create(dto: CreateOperationDTO): Promise<Operation> {
    const operations = await readOperations();
    const now = new Date().toISOString();
    
    // Calculate PnL
    const pnl = (dto.sellPrice - dto.buyPrice) * dto.quantity;
    const pnlPercentage = ((dto.sellPrice - dto.buyPrice) / dto.buyPrice) * 100;

    const operation: Operation = {
      id: crypto.randomUUID(),
      date: dto.date,
      symbol: dto.symbol,
      quantity: dto.quantity,
      buyPrice: dto.buyPrice,
      sellPrice: dto.sellPrice,
      pnl,
      pnlPercentage,
      strategyId: dto.strategyId,
      notes: dto.notes,
      createdAt: now,
      updatedAt: now,
    };

    operations.push(operation);
    await writeOperations(operations);
    return operation;
  },

  async findById(id: string): Promise<Operation | undefined> {
    const operations = await readOperations();
    return operations.find(op => op.id === id);
  },

  async findByDate(date: string): Promise<Operation[]> {
    const operations = await readOperations();
    return operations.filter(op => op.date === date).sort((a, b) => a.createdAt.localeCompare(b.createdAt));
  },

  async findByDateRange(startDate: string, endDate: string): Promise<Operation[]> {
    const operations = await readOperations();
    return operations.filter(op => op.date >= startDate && op.date <= endDate);
  },

  async findByStrategyId(strategyId: string): Promise<Operation[]> {
    const operations = await readOperations();
    return operations.filter(op => op.strategyId === strategyId).sort((a, b) => a.date.localeCompare(b.date));
  },

  async findAll(): Promise<Operation[]> {
    return readOperations();
  },

  async update(id: string, dto: UpdateOperationDTO): Promise<Operation | undefined> {
    const operations = await readOperations();
    const index = operations.findIndex(op => op.id === id);
    
    if (index === -1) {
      return undefined;
    }

    const operation = operations[index];
    const updated: Operation = {
      ...operation,
      ...dto,
      pnl: dto.sellPrice && dto.buyPrice && dto.quantity 
        ? (dto.sellPrice - dto.buyPrice) * dto.quantity 
        : operation.pnl,
      pnlPercentage: dto.sellPrice && dto.buyPrice 
        ? ((dto.sellPrice - dto.buyPrice) / dto.buyPrice) * 100 
        : operation.pnlPercentage,
      updatedAt: new Date().toISOString(),
    };

    operations[index] = updated;
    await writeOperations(operations);
    return updated;
  },

  async delete(id: string): Promise<boolean> {
    const operations = await readOperations();
    const filteredOperations = operations.filter(op => op.id !== id);
    
    if (filteredOperations.length === operations.length) {
      return false;
    }

    await writeOperations(filteredOperations);
    return true;
  },

  async deleteByDate(date: string): Promise<number> {
    const operations = await readOperations();
    const initialLength = operations.length;
    const filtered = operations.filter(op => op.date !== date);
    await writeOperations(filtered);
    return initialLength - filtered.length;
  },
};
