import { Request, Response } from 'express';
import { FinancialDataService } from '../services/financialData.service';

// Create a single instance of FinancialDataService
const financialDataService = new FinancialDataService();

/**
 * Controller for financial data endpoints
 * Handles HTTP request/response only, delegates business logic to service
 */
export const getFinancialData = async (req: Request, res: Response) => {
  const { symbol } = req.params;

  if (!symbol || typeof symbol !== 'string') {
    res.status(400).json({ error: 'Symbol parameter is required' });
    return;
  }

  try {
    console.log(`Controller: Fetching financial data for ${symbol}`);
    const result = await financialDataService.getFinancialData(symbol);
    
    console.log(`Controller: Result for ${symbol}:`, result ? 'Data received' : 'NULL');
    if (result) {
      console.log(`Controller: Result details:`, JSON.stringify(result, null, 2));
    }

    if (!result) {
      console.log(`Controller: Returning 404 for ${symbol}`);
      res.status(404).json({ error: `Financial data for symbol '${symbol}' not found` });
      return;
    }

    console.log(`Controller: Returning 200 OK for ${symbol}`);
    res.json(result);
  } catch (error) {
    console.error('Error fetching financial data:', error);
    res.status(500).json({
      error: 'Failed to fetch financial data',
      message: error instanceof Error ? error.message : 'Unknown error',
    });
  }
};
