import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

function deferred<T>() {
  let resolve!: (value: T) => void;
  let reject!: (reason?: any) => void;
  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
}

const t = {
  common: {
    basedOn: 'Basado en',
    and: 'y',
    analyzedOn: 'Analizado:',
    or: 'o',
    of: 'de',
    unlimited: 'Ilimitado',
    yearlyChange: 'Cambio anual',
    detailedAnalysis: 'Análisis detallado',
    shortTermFactor: 'Factor de corto plazo',
    midTermFactor: 'Factor de medio plazo',
    longTermFactor: 'Factor de largo plazo',
  },
  sidebar: {
    news: 'Noticias',
  },
  assets: {
    watchlist: 'Watchlist',
  },
  riskAnalysis: {
    detailedTitleTechnical: 'Análisis técnico',
    detailedTitleFundamental: 'Análisis fundamental',
    detailedTitleQuantitative: 'Análisis cuantitativo',
    description: 'Descripción',

    period: 'Periodo',
    sixMonths: '6M',
    oneYear: '1Y',
    threeYears: '3Y',
    fiveYears: '5Y',
    tenYears: '10Y',

    interval: 'Intervalo',

    searchPlaceholder: 'Buscar símbolo…',
    analyzing: 'Analizando…',
    analyze: 'Analizar',

    popular: 'Populares',
    tracking: 'Siguiendo',
    recent: 'Recientes',

    tabTechnical: 'Técnico',
    tabFundamental: 'Fundamental',
    tabQuantitative: 'Cuantitativo',

    noDataAll: 'Sin datos',
    tryWith: 'Prueba con',

    noData: 'Sin datos',
    currentDataOnly: 'Solo datos actuales',
    missingMetrics: 'Métricas no disponibles',

    riskTitle: 'Riesgo {label}',
    riskLow: 'Bajo',
    riskMedium: 'Medio',
    riskHigh: 'Alto',

    volatility: {
      high: 'alta volatilidad',
      moderate: 'volatilidad moderada',
      low: 'baja volatilidad',
    },
    drawdown: {
      high: 'alto drawdown',
      moderate: 'drawdown moderado',
      low: 'bajo drawdown',
    },

    quantitative: {
      volatility: {
        label: 'Volatilidad',
        tooltip: 'tooltip',
        sub: {
          veryHigh: 'Muy alta',
          high: 'Alta',
          moderate: 'Moderada',
          low: 'Baja',
        },
      },
      drawdown: {
        label: 'Drawdown',
        tooltip: 'tooltip',
        sub: 'Sub',
      },
      sharpe: {
        label: 'Sharpe',
        tooltip: 'tooltip',
        sub: {
          excellent: 'Excelente',
          good: 'Bueno',
          acceptable: 'Aceptable',
          negative: 'Negativo',
        },
      },
      var: {
        label: 'VaR',
        tooltip: 'tooltip',
        sub: 'Sub',
      },
      sortino: {
        label: 'Sortino',
        tooltip: 'tooltip',
      },
      calmar: {
        label: 'Calmar',
        tooltip: 'tooltip',
      },
      guideTitle: 'Guía',
      guide: {
        volatility: 'Desc',
        sharpe: 'Desc',
        drawdown: 'Desc',
        var: 'Desc',
        sortino: 'Desc',
        calmar: 'Desc',
      },
    },

    fundamental: {
      generating: 'Generando análisis fundamental…',
      perspectiva: 'Perspectiva {range} {outlook}',
      ranges: { '1y': '1Y' },
      outlooks: { STRONG: 'Fuerte', MODERATE: 'Moderado', WEAK: 'Débil' },
    },

    sections: {
      helpWhat: 'Qué es',
      helpImportance: 'Importancia',
    },

    metrics: {},
    missingNotes: { GENERIC: { default: 'N/A' } },
  },
} as any;

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

const mocks = vi.hoisted(() => ({
  useWatchlist: vi.fn(),
  riskService: {
    calculateRisk: vi.fn(),
  },
  assetService: {
    getFinancialData: vi.fn(),
    getFundamentalAnalysis: vi.fn(),
  },
  marketService: {
    getBuffettIndicator: vi.fn(),
  },
}));

vi.mock('@hooks/useWatchlist', () => ({
  useWatchlist: mocks.useWatchlist,
}));

vi.mock('@services/index', () => ({
  riskService: mocks.riskService,
  assetService: mocks.assetService,
  marketService: mocks.marketService,
}));

vi.mock('@components/AnalysisSummaryCard', () => ({
  default: ({ classification, explanation, children }: any) => (
    <div>
      <div>SUMMARY</div>
      <div data-testid="summary-classification">{classification}</div>
      <div data-testid="summary-explanation">{typeof explanation === 'string' ? explanation : 'NODE'}</div>
      {children}
    </div>
  ),
}));

vi.mock('../components/TechnicalAnalysisPanel', () => ({
  default: ({ symbol, selectedRange, interval }: any) => (
    <div data-testid="technical-panel">
      TECH PANEL {symbol} {selectedRange} {interval}
    </div>
  ),
}));

vi.mock('../components/SymbolAutocomplete', () => ({
  default: () => <div data-testid="symbol-autocomplete" />,
}));

async function renderRiskAnalysisPage(initialUrl = '/analisis') {
  const { default: RiskAnalysisPage } = await import('./RiskAnalysisPage');
  return render(
    <MemoryRouter initialEntries={[initialUrl]}>
      <Routes>
        <Route path="/analisis" element={<RiskAnalysisPage />} />
      </Routes>
    </MemoryRouter>
  );
}

describe('RiskAnalysisPage (technical/fundamental/quantitative tabs)', () => {
  beforeEach(() => {
    localStorage.clear();

    mocks.useWatchlist.mockReset();
    mocks.riskService.calculateRisk.mockReset();
    mocks.assetService.getFinancialData.mockReset();
    mocks.assetService.getFundamentalAnalysis.mockReset();
    mocks.marketService.getBuffettIndicator.mockReset();

    mocks.useWatchlist.mockReturnValue({ watchlist: [] });

    // Keep financial data rejected to avoid the large FUNDS metrics glossary surface in unit tests.
    mocks.assetService.getFinancialData.mockRejectedValue(new Error('no fin data'));
  });

  it('defaults to TECH tab and shows interval selector', async () => {
    await renderRiskAnalysisPage('/analisis');

    expect(screen.getByText(t.riskAnalysis.detailedTitleTechnical)).toBeInTheDocument();
    expect(screen.getByText(t.riskAnalysis.interval)).toBeInTheDocument();
    // One interval button should exist
    expect(screen.getByRole('button', { name: '1m' })).toBeInTheDocument();
  });

  it('supports tab=fundamental (header changes, no interval selector)', async () => {
    await renderRiskAnalysisPage('/analisis?tab=fundamental');

    expect(screen.getByText(t.riskAnalysis.detailedTitleFundamental)).toBeInTheDocument();
    expect(screen.queryByText(t.riskAnalysis.interval)).not.toBeInTheDocument();
  });

  it('supports tab=cuantitativo (header changes, no interval selector)', async () => {
    await renderRiskAnalysisPage('/analisis?tab=cuantitativo');

    expect(screen.getByText(t.riskAnalysis.detailedTitleQuantitative)).toBeInTheDocument();
    expect(screen.queryByText(t.riskAnalysis.interval)).not.toBeInTheDocument();
  });

  it('TECH tab renders TechnicalAnalysisPanel after analysis', async () => {
    mocks.riskService.calculateRisk.mockResolvedValue({
      symbol: 'AAPL',
      volatility: 0.12,
      maxDrawdown: 0.08,
      riskLevel: 'LOW',
      dataPoints: 200,
    });

    const fundamentalDef = deferred<any>();
    mocks.assetService.getFundamentalAnalysis.mockReturnValue(fundamentalDef.promise);

    await renderRiskAnalysisPage('/analisis');

    fireEvent.click(screen.getByRole('button', { name: 'AAPL' }));

    expect(mocks.riskService.calculateRisk).toHaveBeenCalledWith('AAPL', '1y');

    // Results appear after risk is set.
    expect(await screen.findByText(t.riskAnalysis.tabTechnical)).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.assetService.getFundamentalAnalysis).toHaveBeenCalledWith('AAPL', '1y');
    });

    expect(screen.getByTestId('technical-panel')).toHaveTextContent('AAPL');
    expect(screen.getByTestId('technical-panel')).toHaveTextContent('1y');
    expect(screen.getByTestId('technical-panel')).toHaveTextContent('1d');

    // Settle background promise to avoid unhandled rejections.
    fundamentalDef.resolve({
      symbol: 'AAPL',
      assetType: 'stock',
      outlook: 'MODERATE',
      outlookScore: 60,
      analyzedAt: new Date().toISOString(),
      sections: {
        summary: { title: 'Resumen', content: '...' },
        horizon: { title: 'Horizonte', content: '...' },
      },
    });

    await waitFor(() => {
      expect(mocks.assetService.getFundamentalAnalysis).toHaveBeenCalledTimes(1);
    });
  });

  it('FUNDS tab shows loading and then renders fundamental horizon card', async () => {
    mocks.riskService.calculateRisk.mockResolvedValue({
      symbol: 'AAPL',
      volatility: 0.22,
      maxDrawdown: 0.11,
      riskLevel: 'MEDIUM',
      dataPoints: 200,
    });

    const fundamentalDef = deferred<any>();
    mocks.assetService.getFundamentalAnalysis.mockReturnValue(fundamentalDef.promise);

    await renderRiskAnalysisPage('/analisis?tab=fundamental');

    // After a successful analyze, AAPL also appears in the "recent" row.
    fireEvent.click(screen.getAllByRole('button', { name: 'AAPL' })[0]);

    await waitFor(() => {
      expect(mocks.assetService.getFundamentalAnalysis).toHaveBeenCalledWith('AAPL', '1y');
    });

    // After risk resolves, results + FUNDS tab content is visible.
    expect(await screen.findByText(t.riskAnalysis.tabFundamental)).toBeInTheDocument();

    // While fundamental promise is pending, spinner copy should be visible.
    expect(await screen.findByText(t.riskAnalysis.fundamental.generating)).toBeInTheDocument();

    fundamentalDef.resolve({
      symbol: 'AAPL',
      assetType: 'stock',
      outlook: 'STRONG',
      outlookScore: 80,
      analyzedAt: new Date().toISOString(),
      sections: {
        summary: { title: 'Resumen', content: '...' },
        horizon: { title: 'Horizonte temporal', content: 'Largo plazo' },
      },
    });

    expect(await screen.findByText('Horizonte temporal')).toBeInTheDocument();
    expect(screen.getByText('Largo plazo')).toBeInTheDocument();
  });

  it('QUANTS tab renders quantitative metrics after analysis', async () => {
    mocks.riskService.calculateRisk.mockResolvedValue({
      symbol: 'AAPL',
      volatility: 0.18,
      maxDrawdown: 0.07,
      riskLevel: 'LOW',
      dataPoints: 200,
      sharpeRatio: 1.2,
    });

    mocks.assetService.getFundamentalAnalysis.mockResolvedValue({
      symbol: 'AAPL',
      assetType: 'stock',
      outlook: 'MODERATE',
      outlookScore: 60,
      analyzedAt: new Date().toISOString(),
      sections: {
        summary: { title: 'Resumen', content: '...' },
        horizon: { title: 'Horizonte', content: '...' },
      },
    });

    await renderRiskAnalysisPage('/analisis?tab=cuantitativo');

    fireEvent.click(screen.getAllByRole('button', { name: 'AAPL' })[0]);

    expect(await screen.findByText(t.riskAnalysis.tabQuantitative)).toBeInTheDocument();

    // Metric labels should render.
    expect(screen.getByText(t.riskAnalysis.quantitative.volatility.label)).toBeInTheDocument();
    expect(screen.getByText(t.riskAnalysis.quantitative.drawdown.label)).toBeInTheDocument();
    expect(screen.getByText(t.riskAnalysis.quantitative.sharpe.label)).toBeInTheDocument();
  });
});
