import { render, screen, fireEvent, waitFor } from '@testing-library/react';
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
  recommendation: {
    title: 'Recomendación',
    subtitle: 'Configura y calcula niveles',
    financialAsset: 'Activo',
    searchPlaceholder: 'Buscar símbolo…',
    popular: 'Popular',

    tradeDirection: 'Dirección',
    long: 'LONG',
    short: 'SHORT',

    timeframe: 'Timeframe',

    slMethod: 'Método SL',
    fixedPct: 'Porcentaje fijo',
    closestSupport: 'Soporte más cercano',
    closestResistance: 'Resistencia más cercana',
    dynamicATR: 'ATR dinámico',
    recommended: 'Recomendado',

    tpMethods: 'Métodos TP',
    riskRewardRatio: 'Ratio R/B',
    bollingerBands: 'Bandas de Bollinger',

    riskManagement: 'Gestión del riesgo',
    totalCapital: 'Capital total',
    riskPerTrade: 'Riesgo por trade',

    calculateLevels: 'Calcular niveles',
    recalculateLevels: 'Recalcular niveles',

    configureOperation: 'Configura la operación',
    configureDesc: 'Selecciona un activo y parámetros para calcular',

    entryPriceLabel: 'Precio de entrada',
    signalContradictory: 'Señal contradictoria',
    signalAligned: 'Señal alineada',
    signalNeutral: 'Señal neutral',

    confidence: 'Confianza',
    noJustification: 'Sin justificación',
    techSignal: 'Señal técnica',

    potential: 'Potencial',
    noneValidTP: 'No hay take profits válidos',

    riskPerCurrency: 'Riesgo en {currency}',
    positionSize: 'Tamaño de posición',
    units: 'unidades',
    totalValue: 'Valor total',

    disclaimer: 'No es asesoramiento financiero',

    iaSummary: 'Resumen IA',
    iaGenerated: 'Generado por IA',
    detailedJustification: 'Justificación detallada',

    chatWithIA: 'Chat con IA',
    contextual: 'Contextual',
    clearChat: 'Limpiar',
    askWhatever: 'Pregunta lo que quieras sobre {symbol}',
    typeYourQuestion: 'Escribe tu pregunta…',
    calculateFirst: 'Calcula primero',

    sma50: 'SMA50',
    sma200: 'SMA200',
    bollinger: 'Bollinger',

    insufficientCapital: 'Capital insuficiente',
    iaUnavailable: 'IA no disponible',
    calculationError: 'Error al calcular',

    chatSuggestions: ['¿Cuál es el riesgo?', '¿Qué significa la señal?'],
  },
} as any;

vi.mock('@/context/LanguageContext', () => ({
  useLanguage: () => ({
    t,
    language: 'es',
    setLanguage: vi.fn(),
  }),
}));

vi.mock('@/context/ThemeContext', () => ({
  useTheme: () => ({
    darkMode: false,
  }),
}));

const mocks = vi.hoisted(() => ({
  recommendationService: {
    calculate: vi.fn(),
  },
  iaService: {
    analyze: vi.fn(),
    chat: vi.fn(),
  },
}));

vi.mock('@services/index', () => ({
  recommendationService: mocks.recommendationService,
  iaService: mocks.iaService,
}));

vi.mock('../components/SymbolAutocomplete', () => ({
  default: () => <div data-testid="symbol-autocomplete" />,
}));

async function renderPage() {
  const { default: RecommendationPage } = await import('./RecommendationPage');
  return render(<RecommendationPage />);
}

const baseResult = {
  symbol: 'AAPL',
  direction: 'LONG',
  interval: '1d',
  currency: 'USD',

  entryPrice: 100,
  sl: 95,
  slDistancePct: 5,
  slDistanceAbs: 5,
  slMethodLabel: 'FIXED_PCT',

  tps: [
    {
      price: 110,
      distancePct: 10,
      distanceAbs: 10,
      label: 'RR',
      realRatio: 2,
      potentialProfit: 123.45,
    },
  ],

  riskManagement: {
    moneyAtRisk: 100,
    positionSize: 2,
    positionValue: 200,
    riskPctUsed: 1,
  },

  warnings: [],
} as any;

describe('RecommendationPage', () => {
  beforeEach(() => {
    mocks.recommendationService.calculate.mockReset();
    mocks.iaService.analyze.mockReset();
    mocks.iaService.chat.mockReset();

    mocks.iaService.analyze.mockResolvedValue({
      resumen: 'Resumen IA OK',
      justificacion: 'Justificación IA OK',
    });

    mocks.iaService.chat.mockResolvedValue({
      respuesta: 'Respuesta IA',
    });
  });

  it('renders header and initial empty state; calculate disabled; chat disabled', async () => {
    await renderPage();

    expect(screen.getByText(t.recommendation.title)).toBeInTheDocument();
    expect(screen.getByText(t.recommendation.configureOperation)).toBeInTheDocument();

    const calcBtn = screen.getByRole('button', { name: t.recommendation.calculateLevels });
    expect(calcBtn).toBeDisabled();

    // Chat module is only rendered after having a calculation result.
    expect(screen.queryByText(t.recommendation.chatWithIA)).not.toBeInTheDocument();
  });

  it('clicking a popular symbol enables calculate and triggers recommendationService.calculate', async () => {
    const calcDef = deferred<any>();
    mocks.recommendationService.calculate.mockReturnValue(calcDef.promise);

    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'AAPL' }));

    const calcBtn = screen.getByRole('button', { name: t.recommendation.calculateLevels });
    expect(calcBtn).not.toBeDisabled();

    fireEvent.click(calcBtn);

    await waitFor(() => {
      expect(mocks.recommendationService.calculate).toHaveBeenCalledTimes(1);
    });

    expect(mocks.recommendationService.calculate).toHaveBeenCalledWith(
      expect.objectContaining({
        symbol: 'AAPL',
        direction: 'LONG',
        interval: '1d',
        slMethod: 'FIXED_PCT',
        slPct: 2,
        tpMethods: ['RISK_REWARD'],
        rrRatio: 2,
        capital: 10000,
        riskPct: 1,
        currency: 'USD',
      })
    );

    // Resolve to avoid dangling promises / state updates.
    calcDef.resolve(baseResult);

    expect(await screen.findByText('Stop Loss')).toBeInTheDocument();
  });

  it('shows an error banner when calculation fails', async () => {
    mocks.recommendationService.calculate.mockRejectedValue(new Error('Boom'));

    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'AAPL' }));
    fireEvent.click(screen.getByRole('button', { name: t.recommendation.calculateLevels }));

    expect(await screen.findByText('Boom')).toBeInTheDocument();
  });

  it('fires IA summary after calculation and renders the IA summary text', async () => {
    mocks.recommendationService.calculate.mockResolvedValue(baseResult);

    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'AAPL' }));
    fireEvent.click(screen.getByRole('button', { name: t.recommendation.calculateLevels }));

    // Wait for result to appear
    expect(await screen.findByText('Stop Loss')).toBeInTheDocument();

    await waitFor(() => {
      expect(mocks.iaService.analyze).toHaveBeenCalledTimes(1);
    });

    expect(mocks.iaService.analyze).toHaveBeenCalledWith(
      expect.objectContaining({
        ticker: 'AAPL',
        lang: 'es',
      })
    );

    // And the summary should show up.
    expect(await screen.findByText('Resumen IA OK')).toBeInTheDocument();
  });

  it('chat sends a message after calculation and appends assistant response', async () => {
    mocks.recommendationService.calculate.mockResolvedValue(baseResult);

    await renderPage();

    fireEvent.click(screen.getByRole('button', { name: 'AAPL' }));
    fireEvent.click(screen.getByRole('button', { name: t.recommendation.calculateLevels }));

    // Result renders chat module
    expect(await screen.findByText(t.recommendation.chatWithIA)).toBeInTheDocument();

    const chatInput = screen.getByPlaceholderText(t.recommendation.typeYourQuestion) as HTMLInputElement;
    expect(chatInput).not.toBeDisabled();

    fireEvent.change(chatInput, { target: { value: '¿Qué opinas?' } });

    const sendBtn = screen.getAllByRole('button').find((b) => b.className.includes('bg-cyan-600')) as HTMLButtonElement;
    fireEvent.click(sendBtn);

    await waitFor(() => {
      expect(mocks.iaService.chat).toHaveBeenCalledTimes(1);
    });

    expect(mocks.iaService.chat).toHaveBeenCalledWith(
      expect.objectContaining({
        mensaje: '¿Qué opinas?',
        lang: 'es',
      })
    );

    expect(await screen.findByText('Respuesta IA')).toBeInTheDocument();
  });
});
