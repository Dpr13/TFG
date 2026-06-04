import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';

const t = {
  common: {
    error: 'Error con {symbol}',
  },
  ia: {
    disclaimer: 'Disclaimer IA',
  },
  compare: {
    searchPlaceholder: 'Buscar {symbol}…',
  },
  riskAnalysis: {
    fundamental: {
      ranges: {
        '6mo': '6 meses',
        '1y': '1 año',
        '3y': '3 años',
        '5y': '5 años',
      },
    },
  },
  comparison: {
    title: 'Comparación de activos',
    subtitle: 'Compara métricas clave',
    horizon: 'Horizonte',
    assetSlot: 'Activo {n}',
    addAsset: 'Añadir activo',
    compareButton: 'Comparar',
    comparingButton: 'Comparando…',
    popular: 'Populares:',
    watchlist: 'Watchlist',
    history: 'Historial',
    mixedTypeWarning: 'Tipos mezclados',

    assetTypes: {
      EQUITY: 'Acción',
      CRYPTOCURRENCY: 'Cripto',
      ETF: 'ETF',
    },

    trends: {
      alcista: 'Alcista',
      bajista: 'Bajista',
      'N/D': 'N/D',
    },

    metricsFavorable: 'métricas favorables',

    errors: {
      minTwo: 'Necesitas 2 activos válidos',
      verifyTickers: 'Verifica los tickers',
    },

    verdictTitle: 'Veredicto IA',
    generateVerdict: 'Generar veredicto',
    generateVerdictDesc: 'Genera un veredicto contextual',

    tables: {
      metricHeader: 'Métrica',
      fundamental: {
        title: 'Fundamental',
        desc: 'Métricas fundamentales',
        marketCap: 'Market Cap',
        peRatio: 'P/E',
        roe: 'ROE',
        netMargin: 'Margen neto',
        dividend: 'Dividendo',
        eps: 'EPS',
        priceBook: 'P/B',
        debtEquity: 'Deuda/Equity',
      },
      technical: {
        title: 'Técnico',
        desc: 'Métricas técnicas',
        periodChange: 'Cambio periodo',
        rsi: 'RSI',
        trend: 'Tendencia',
        overSMA50: 'Sobre SMA50',
        overSMA200: 'Sobre SMA200',
        macd: 'MACD',
        technicalScore: 'Score técnico',
        yes: 'Sí',
        no: 'No',
        bullish: 'Alcista',
        bearish: 'Bajista',
      },
      risk: {
        title: 'Riesgo',
        desc: 'Métricas de riesgo',
        volatilityAnnual: 'Volatilidad anual',
        annualizedReturn: 'Retorno anualizado',
        sharpeRatio: 'Sharpe',
        var95: 'VaR 95',
        maxDrawdown: 'Max drawdown',
        beta: 'Beta',
      },
    },
  },
} as any;

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@hooks/useWatchlist', () => ({
  useWatchlist: () => ({
    watchlist: [],
  }),
}));

vi.mock('../components/SymbolAutocomplete', () => ({
  default: () => <div data-testid="symbol-autocomplete" />,
}));

function mockFetchOk(payload: any) {
  return vi.fn().mockResolvedValue({
    ok: true,
    json: vi.fn().mockResolvedValue(payload),
  } as any);
}

function mockFetchNotOk(payload: any) {
  return vi.fn().mockResolvedValue({
    ok: false,
    json: vi.fn().mockResolvedValue(payload),
  } as any);
}

async function renderPageAsync(route = '/compare') {
  const { default: ComparePage } = await import('./ComparePage');
  return render(
    <MemoryRouter initialEntries={[route]}>
      <Routes>
        <Route path="/compare" element={<ComparePage />} />
      </Routes>
    </MemoryRouter>
  );
}

const aapl = {
  ticker: 'AAPL',
  nombre: 'Apple',
  tipo: 'EQUITY',
  fundamental: {
    market_cap: 1_000_000_000,
    pe_ratio: 20,
    roe: 10,
    margen_neto: 5,
    dividendo: 1,
    eps: 2,
    precio_book: 3,
    deuda_equity: 0.5,
    tipo: 'EQUITY',
    nombre: 'Apple',
  },
  tecnico: {
    precio_actual: 100,
    cambio_periodo_pct: 10,
    rsi: 50,
    macd_alcista: true,
    sobre_sma50: true,
    sobre_sma200: true,
    tendencia: 'alcista',
    puntuacion_tecnica: 80,
  },
  riesgo: {
    volatilidad_anual: 20,
    retorno_anualizado: 15,
    sharpe_ratio: 1.1,
    var_95: -5,
    max_drawdown: -20,
    beta: 1,
  },
  error: null,
} as any;

const msft = {
  ...aapl,
  ticker: 'MSFT',
  nombre: 'Microsoft',
  tecnico: {
    ...aapl.tecnico,
    rsi: 75,
    macd_alcista: false,
    tendencia: 'bajista',
    puntuacion_tecnica: 40,
  },
} as any;

describe('ComparePage', () => {
  beforeEach(() => {
    localStorage.clear();
    sessionStorage.clear();
    vi.unstubAllGlobals();
  });

  it('renders header and compare button disabled initially', async () => {
    vi.stubGlobal('fetch', mockFetchOk({ resultados: [] }));

    await renderPageAsync();

    expect(screen.getByText(t.comparison.title)).toBeInTheDocument();
    expect(screen.getByText(t.comparison.subtitle)).toBeInTheDocument();

    const compareBtn = screen.getByRole('button', { name: t.comparison.compareButton });
    expect(compareBtn).toBeDisabled();
  });

  it('quick badges fill slots and clicking compare calls POST /comparar with tickers and horizon', async () => {
    const fetchMock = mockFetchOk({ resultados: [aapl, msft] });
    vi.stubGlobal('fetch', fetchMock);

    await renderPageAsync('/compare?ticker=AAPL');

    // slot1 starts as AAPL; activeSlot starts at 2, so this fills slot2
    fireEvent.click(screen.getByRole('button', { name: 'MSFT' }));

    const compareBtn = screen.getByRole('button', { name: t.comparison.compareButton });
    expect(compareBtn).not.toBeDisabled();

    fireEvent.click(compareBtn);

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(1);
    });

    const [url, init] = fetchMock.mock.calls[0];
    expect(String(url)).toContain('/comparar');
    expect(init.method).toBe('POST');

    const body = JSON.parse(init.body);
    expect(body).toEqual({ tickers: ['AAPL', 'MSFT'], horizonte: '1y' });

    // Tables render (metric header appears once per table)
    expect((await screen.findAllByText(t.comparison.tables.metricHeader)).length).toBeGreaterThan(0);
    expect(screen.getAllByText('AAPL').length).toBeGreaterThan(0);
    expect(screen.getAllByText('MSFT').length).toBeGreaterThan(0);
  });

  it('shows an error banner when comparison API fails', async () => {
    const fetchMock = mockFetchNotOk({ error: 'Bad request' });
    vi.stubGlobal('fetch', fetchMock);

    await renderPageAsync('/compare?ticker=AAPL');

    fireEvent.click(screen.getByRole('button', { name: 'MSFT' }));
    fireEvent.click(screen.getByRole('button', { name: t.comparison.compareButton }));

    expect(await screen.findByText('Bad request')).toBeInTheDocument();
  });

  it('shows mixed type warning when assets have different types', async () => {
    const btc = { ...aapl, ticker: 'BTC-USD', tipo: 'CRYPTOCURRENCY', nombre: 'Bitcoin' };

    const fetchMock = mockFetchOk({ resultados: [aapl, btc] });
    vi.stubGlobal('fetch', fetchMock);

    await renderPageAsync('/compare?ticker=AAPL');

    fireEvent.click(screen.getByRole('button', { name: 'BTC-USD' }));
    fireEvent.click(screen.getByRole('button', { name: t.comparison.compareButton }));

    expect(await screen.findByText(t.comparison.mixedTypeWarning)).toBeInTheDocument();
  });

  it('generates IA verdict and renders it', async () => {
    const fetchMock = vi
      .fn()
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ resultados: [aapl, msft] }) })
      .mockResolvedValueOnce({ ok: true, json: vi.fn().mockResolvedValue({ ok: true, veredicto: '**Ganador** AAPL\n\nTexto normal' }) });

    vi.stubGlobal('fetch', fetchMock as any);

    await renderPageAsync('/compare?ticker=AAPL');

    fireEvent.click(screen.getByRole('button', { name: 'MSFT' }));
    fireEvent.click(screen.getByRole('button', { name: t.comparison.compareButton }));

    expect(await screen.findByText(t.comparison.verdictTitle)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: t.comparison.generateVerdict }));

    await waitFor(() => {
      expect(fetchMock).toHaveBeenCalledTimes(2);
    });

    const [, verdictInit] = fetchMock.mock.calls[1];
    expect(String(fetchMock.mock.calls[1][0])).toContain('/comparar/veredicto');
    expect(verdictInit.headers['Accept-Language']).toBe('es');

    expect(await screen.findByText('Ganador')).toBeInTheDocument();
    expect(await screen.findByText('Texto normal')).toBeInTheDocument();
    expect(screen.getByText(t.ia.disclaimer)).toBeInTheDocument();
  });
});
