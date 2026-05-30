import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi, afterEach } from 'vitest';

const t = {
  nav: {
    compareAssets: 'Comparar Activos',
    recommendation: 'Recomendación',
    riskAnalysis: 'Análisis de Riesgo',
  },
  compare: {
    subtitle: 'Compara activos',
  },
  recommendation: {
    subtitle: 'Calcula niveles de TP/SL',
  },
  home: {
    goodMorning: 'Buenos días',
    goodAfternoon: 'Buenas tardes',
    goodEvening: 'Buenas noches',
    marketSummary: 'Resumen de mercado',

    registeredOps: 'Operaciones registradas',
    strategies: 'Estrategias',
    tracking: 'Seguimiento',

    analyzeRisk: 'Analizar riesgo',
    analyzeRiskDesc: 'Descripción riesgo',
    viewAssets: 'Ver activos',

    others: 'Otros',
    weeklyActivity: 'Actividad semanal',

    followUp: 'Seguimiento',
    manage: 'Gestionar',

    marketNews: 'Noticias de mercado',
    viewMore: 'Ver más',

    agoMin: 'hace {n} min',
    agoHours: 'hace {n} h',
    agoDays: 'hace {n} días',

    days: ['L', 'M', 'X', 'J', 'V', 'S', 'D'],
  },
} as any;

const state = vi.hoisted(() => ({
  user: { name: 'Daniel Pérez' } as any,
  watchlist: [] as any[],
}));

const useFetchMock = vi.hoisted(() => ({
  useFetch: vi.fn(),
}));

vi.mock('../context/AuthContext', () => ({
  useAuth: () => ({ user: state.user }),
}));

vi.mock('../context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@hooks/useWatchlist', () => ({
  useWatchlist: () => ({ watchlist: state.watchlist }),
}));

vi.mock('@hooks/useFetch', () => ({
  useFetch: useFetchMock.useFetch,
}));

async function renderPage() {
  const { default: HomePage } = await import('./HomePage');
  return render(
    <MemoryRouter>
      <HomePage />
    </MemoryRouter>
  );
}

describe('HomePage', () => {
  beforeEach(() => {
    state.user = { name: 'Daniel Pérez' };
    state.watchlist = [];
    useFetchMock.useFetch.mockReset();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  it('renders greeting with first name and morning message', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(9);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: [], loading: false }) // operations
      .mockReturnValueOnce({ data: [], loading: false }) // strategies
      .mockReturnValueOnce({ data: { articles: [], count: 0 }, loading: false }); // news

    await renderPage();

    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Buenos días Daniel');
    expect(screen.getByText(t.home.marketSummary)).toBeInTheDocument();
  });

  it('shows operation and strategy counts from useFetch', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }], loading: false }) // operations
      .mockReturnValueOnce({ data: [{ id: 1 }, { id: 2 }, { id: 3 }], loading: false }) // strategies
      .mockReturnValueOnce({ data: { articles: [], count: 0 }, loading: false }); // news

    await renderPage();

    const opsLabel = screen.getByText(t.home.registeredOps);
    expect(within(opsLabel.closest('div') as HTMLElement).getByText('2')).toBeInTheDocument();

    const stratLabel = screen.getByText(t.home.strategies);
    expect(within(stratLabel.closest('div') as HTMLElement).getByText('3')).toBeInTheDocument();
  });

  it('shows loading placeholder (...) for operations/strategies when loading', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: undefined, loading: true }) // operations
      .mockReturnValueOnce({ data: undefined, loading: true }) // strategies
      .mockReturnValueOnce({ data: { articles: [], count: 0 }, loading: false }); // news

    await renderPage();

    const opsLabel = screen.getByText(t.home.registeredOps);
    expect(within(opsLabel.closest('div') as HTMLElement).getByText('...')).toBeInTheDocument();

    const stratLabel = screen.getByText(t.home.strategies);
    expect(within(stratLabel.closest('div') as HTMLElement).getByText('...')).toBeInTheDocument();
  });

  it('renders follow-up section when watchlist has assets', async () => {
    state.watchlist = [
      { symbol: 'AAPL', name: 'Apple', type: 'stock' },
      { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' },
    ];

    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: [], loading: false }) // operations
      .mockReturnValueOnce({ data: [], loading: false }) // strategies
      .mockReturnValueOnce({ data: { articles: [], count: 0 }, loading: false }); // news

    await renderPage();

    expect(screen.getByRole('heading', { level: 3, name: t.home.followUp })).toBeInTheDocument();
    expect(screen.getByText(t.home.manage)).toBeInTheDocument();

    // Watchlist chips
    expect(screen.getByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
  });

  it('shows news skeletons when loadingNews is true', async () => {
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: [], loading: false }) // operations
      .mockReturnValueOnce({ data: [], loading: false }) // strategies
      .mockReturnValueOnce({ data: undefined, loading: true }); // news

    const { container } = await renderPage();

    expect(container.querySelectorAll('div.animate-pulse').length).toBe(3);
  });

  it('renders news articles with ticker badges and relative time', async () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2026-05-22T12:00:00.000Z'));
    vi.spyOn(Date.prototype, 'getHours').mockReturnValue(14);

    useFetchMock.useFetch
      .mockReturnValueOnce({ data: [], loading: false }) // operations
      .mockReturnValueOnce({ data: [], loading: false }) // strategies
      .mockReturnValueOnce({
        data: {
          articles: [
            {
              id: '1',
              url: 'https://example.com/1',
              title: 'Titular 1',
              publisher: 'Publisher 1',
              publishedAt: '2026-05-22T11:50:00.000Z',
              relatedTickers: ['AAPL', 'MSFT'],
            },
            {
              id: '2',
              url: 'https://example.com/2',
              title: 'Titular 2',
              publisher: 'Publisher 2',
              publishedAt: '2026-05-22T09:00:00.000Z',
              relatedTickers: [],
            },
          ],
          count: 2,
        },
        loading: false,
      });

    await renderPage();

    expect(screen.getByText(t.home.marketNews)).toBeInTheDocument();

    expect(screen.getByText('Titular 1')).toBeInTheDocument();
    expect(screen.getByText('Publisher 1')).toBeInTheDocument();

    // ticker badge
    expect(screen.getByText('AAPL')).toBeInTheDocument();

    // 10 minutes ago
    expect(screen.getByText('hace 10 min')).toBeInTheDocument();
  });
});
