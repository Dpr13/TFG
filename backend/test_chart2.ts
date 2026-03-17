import yahooFinanceDefault from 'yahoo-finance2';
const yahooFinance: any = new (yahooFinanceDefault as any)({ suppressNotices: ['yahooSurvey'] });

async function test() {
  try {
    const data1 = await yahooFinance.chart('GOOGL', { range: '1y', interval: '1d' });
    console.log("Quotes with range=1y:", data1?.quotes?.length);
  } catch (e: any) {
    console.error("Error charting with range:", e.message);
  }
}
test();
