import type { BrokerMode } from '../models/broker_credential';

// Commission rate as a fraction of trade value (e.g. 0.0001 = 0.01%)
// Alpaca charges $0 for equities but regulatory fees (SEC + TAF) are ~0.01% on sells.
// We apply the same rate to both sides for simplicity.
export const COMMISSION_RATES: Record<BrokerMode, number> = {
  simulated: 0,
  alpaca_paper: 0,
  alpaca_live: 0.0001,
};

export function calcCommission(brokerMode: BrokerMode, tradeValue: number): number {
  return Number((tradeValue * COMMISSION_RATES[brokerMode]).toFixed(6));
}
