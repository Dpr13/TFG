import yahooFinanceDefault from 'yahoo-finance2';
const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

async function test() {
  try {
    const data = await yahooFinance.chart('GOOGL', { period1: '1y', interval: '1d' });
    console.log("Quotes count:", data?.quotes?.length);
    console.log("First quote:", data?.quotes?.[0]);
  } catch (e) {
    console.error("Error charting:", e);
  }
}
test();
