import axios from 'axios';

const API_BASE_URL = 'http://localhost:3001/api';

interface Asset {
  symbol: string;
  name: string;
  type: string;
}

interface PriceData {
  date: string;
  close: number;
}

interface AssetPerformance {
  symbol: string;
  name: string;
  firstPrice: number;
  lastPrice: number;
  returnPercent: number;
  priceChange: number;
  dataPoints: number;
} 

/**
 * Demo script that makes interesting API requests
 * Fetches all assets and calculates performance metrics
 */
async function demoApiRequests() {
  console.log('🚀 Demo: Análisis de rendimiento de activos\n');
  console.log('='.repeat(60));

  try {
    // 1. Fetch all available assets
    console.log('\n📊 Obteniendo lista de activos...');
    const assetsResponse = await axios.get<Asset[]>(`${API_BASE_URL}/assets`);
    const assets = assetsResponse.data;
    
    console.log(`✓ Encontrados ${assets.length} activos:\n`);
    assets.forEach(asset => {
      console.log(`  • ${asset.symbol} - ${asset.name} (${asset.type})`);
    });

    // 2. Fetch price history for each asset and calculate performance
    console.log('\n📈 Calculando rendimiento histórico...\n');
    const performances: AssetPerformance[] = [];

    for (const asset of assets) {
      try {
        const historyResponse = await axios.get<{
          symbol: string;
          name: string;
          prices: PriceData[];
        }>(`${API_BASE_URL}/assets/${asset.symbol}/history`);

        const { prices } = historyResponse.data;
        
        if (prices.length < 2) {
          console.log(`⚠️  ${asset.symbol}: Datos insuficientes`);
          continue;
        }

        // Sort by date (oldest first)
        const sortedPrices = [...prices].sort((a, b) => 
          new Date(a.date).getTime() - new Date(b.date).getTime()
        );

        const firstPrice = sortedPrices[0].close;
        const lastPrice = sortedPrices[sortedPrices.length - 1].close;
        const priceChange = lastPrice - firstPrice;
        const returnPercent = (priceChange / firstPrice) * 100;

        performances.push({
          symbol: asset.symbol,
          name: asset.name,
          firstPrice,
          lastPrice,
          returnPercent,
          priceChange,
          dataPoints: prices.length,
        });

        const arrow = returnPercent >= 0 ? '📈' : '📉';
        const color = returnPercent >= 0 ? '+' : '';
        console.log(
          `${arrow} ${asset.symbol.padEnd(6)} | ` +
          `${color}${returnPercent.toFixed(2)}% | ` +
          `$${firstPrice.toFixed(2)} → $${lastPrice.toFixed(2)} | ` +
          `${sortedPrices[0].date} a ${sortedPrices[sortedPrices.length - 1].date}`
        );
      } catch (error) {
        console.log(`❌ ${asset.symbol}: Error al obtener datos`);
      }
    }

    // 3. Show summary statistics
    if (performances.length > 0) {
      console.log('\n' + '='.repeat(60));
      console.log('📊 RESUMEN DE RENDIMIENTOS\n');

      const sorted = [...performances].sort((a, b) => b.returnPercent - a.returnPercent);
      
      const best = sorted[0];
      const worst = sorted[sorted.length - 1];
      const avgReturn = sorted.reduce((sum, p) => sum + p.returnPercent, 0) / sorted.length;

      console.log('🏆 Mejor rendimiento:');
      console.log(`   ${best.symbol} (${best.name})`);
      console.log(`   Retorno: +${best.returnPercent.toFixed(2)}%`);
      console.log(`   Precio: $${best.firstPrice.toFixed(2)} → $${best.lastPrice.toFixed(2)}\n`);

      console.log('📉 Peor rendimiento:');
      console.log(`   ${worst.symbol} (${worst.name})`);
      console.log(`   Retorno: ${worst.returnPercent.toFixed(2)}%`);
      console.log(`   Precio: $${worst.firstPrice.toFixed(2)} → $${worst.lastPrice.toFixed(2)}\n`);

      console.log(`📊 Retorno promedio: ${avgReturn >= 0 ? '+' : ''}${avgReturn.toFixed(2)}%`);
      console.log('='.repeat(60));
    }

  } catch (error) {
    if (axios.isAxiosError(error)) {
      console.error('\n❌ Error en petición API:');
      console.error(`   ${error.message}`);
      if (error.response) {
        console.error(`   Status: ${error.response.status}`);
        console.error(`   Data:`, error.response.data);
      } else {
        console.error('   Tip: ¿Está corriendo el servidor? npm run dev');
      }
    } else {
      console.error('\n❌ Error inesperado:', error);
    }
    process.exit(1);
  }
}

// Run the demo
demoApiRequests()
  .then(() => {
    console.log('\n✅ Demo completado!\n');
  })
  .catch((error) => {
    console.error('Error fatal:', error);
    process.exit(1);
  });
