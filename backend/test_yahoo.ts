import yahooFinance from 'yahoo-finance2';

async function test() {
  console.log("yahooFinance is:", typeof yahooFinance);
  
  try {
    const yf: any = new (yahooFinance as any)();
    const data = await yf.quoteSummary('AAPL', { modules: ['price', 'summaryDetail'] });
    console.log("Success! Data:", data?.price?.symbol);
  } catch (e) {
    console.error("Error with new:", e);
  }
}

test();
