import axios from 'axios';

// Yahoo Finance no requiere API key
const API_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart';

async function getBitcoinIntraday() {
  try {
    console.log('🔍 Obteniendo datos de Bitcoin desde Yahoo Finance (intervalo: 1 hora)...\n');

    // BTC-USD es el símbolo de Bitcoin en Yahoo Finance
    const symbol = 'BTC-USD';
    const response = await axios.get(`${API_BASE_URL}/${symbol}`, {
      params: {
        interval: '1m',      // Intervalo de 15 minutos
        range: '2d',         // Últimas 24 horas
        includePrePost: false
      }
    });

    const result = response.data.chart.result[0];
    
    if (!result || !result.timestamp) {
      console.error('❌ No se recibieron datos');
      console.log(response.data);
      return;
    }

    const timestamps = result.timestamp;
    const closes = result.indicators.quote[0].close;
    const highs = result.indicators.quote[0].high;
    const lows = result.indicators.quote[0].low;
    const opens = result.indicators.quote[0].open;
    
    // Obtener el último dato (más reciente)
    const lastIndex = timestamps.length - 1;
    const latestTimestamp = timestamps[lastIndex];
    const latestDate = new Date(latestTimestamp * 1000);
    const latestClose = closes[lastIndex];
    const latestHigh = highs[lastIndex];
    const latestLow = lows[lastIndex];
    const latestOpen = opens[lastIndex];

    console.log('₿ BITCOIN - Datos en tiempo real (Yahoo Finance)');
    console.log('='.repeat(60));
    console.log(`Símbolo:           ${symbol}`);
    console.log(`Precio actual:     $${latestClose?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`);
    console.log(`Apertura:          $${latestOpen?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`);
    console.log(`Máximo:            $${latestHigh?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`);
    console.log(`Mínimo:            $${latestLow?.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) || 'N/A'}`);
    console.log(`Fecha:             ${latestDate.toLocaleString('es-ES')}`);
    console.log(`Total datos (24h): ${timestamps.length} registros por hora`);
    console.log('='.repeat(60));

    // Mostrar últimos 5 registros
    if (timestamps.length > 1) {
      console.log('\n📊 Últimos registros (cada hora):');
      const showCount = Math.min(10, timestamps.length);
      for (let i = lastIndex; i > lastIndex - showCount; i--) {
        const date = new Date(timestamps[i] * 1000);
        const close = closes[i];
        const hoursAgo = Math.round((Date.now() - date.getTime()) / (1000 * 60 * 60));
        console.log(`  ${lastIndex - i + 1}. $${close?.toLocaleString('en-US', { minimumFractionDigits: 2 }) || 'N/A'} - ${date.toLocaleString('es-ES')} (hace ${hoursAgo}h)`);
      }
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('❌ Error en petición a Yahoo Finance:', error.message);
      if (error.response) {
        console.error('   Status:', error.response.status);
        console.error('   Data:', JSON.stringify(error.response.data, null, 2));
      }
    } else {
      console.error('❌ Error inesperado:', error);
    }
    process.exit(1);
  }
}

getBitcoinIntraday();
