import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import AssetsPage from './AssetsPage';

const t = {
  assets: {
    title: 'Assets',
    subtitle: 'Browse and search assets',
    tabs: {
      all: 'All',
      watchlist: 'Watchlist',
    },
    searchPlaceholder: 'Search symbol…',
    search: 'Search',
    filters: {
      allTypes: 'All types',
    },
    options: {
      stock: 'Stock',
      crypto: 'Crypto',
      forex: 'Forex',
    },
    noResults: 'No results',
    trySpecific: 'Try a more specific query',
  },
  common: {
    selectLanguage: 'Select language',
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
  useFetch: vi.fn(),
  useWatchlist: vi.fn(),
  assetService: {
    getAssets: vi.fn(),
    getUserSearchedAssets: vi.fn(),
    searchAssetBySymbol: vi.fn(),
    saveSearchedAsset: vi.fn(),
  },
}));

vi.mock('@hooks/useFetch', () => ({
  useFetch: mocks.useFetch,
}));

vi.mock('@hooks/useWatchlist', () => ({
  useWatchlist: mocks.useWatchlist,
}));

vi.mock('@services/index', () => ({
  assetService: mocks.assetService,
}));

vi.mock('../components/AssetDetailModal', () => ({
  default: ({ asset, onClose }: any) => (
    <div>
      <div>ASSET MODAL</div>
      <div data-testid="modal-symbol">{asset?.symbol}</div>
      <button onClick={onClose}>Close</button>
    </div>
  ),
}));

vi.mock('../components/SymbolAutocomplete', () => ({
  default: ({ onSubmit, placeholder }: any) => (
    <div>
      <input aria-label="symbol-search" placeholder={placeholder} />
      <button type="button" onClick={() => onSubmit?.('MSFT')}>submit-autocomplete</button>
      <button type="button" onClick={() => onSubmit?.('BAD')}>submit-bad</button>
    </div>
  ),
}));

function renderAssetsPage(initialState?: any) {
  return render(
    <MemoryRouter
      initialEntries={[
        initialState
          ? ({ pathname: '/assets', state: initialState } as any)
          : ({ pathname: '/assets' } as any),
      ]}
    >
      <Routes>
        <Route path="/assets" element={<AssetsPage />} />
      </Routes>
    </MemoryRouter>
  );
}

const AAPL = { symbol: 'AAPL', name: 'Apple', type: 'stock' };
const BTC = { symbol: 'BTC-USD', name: 'Bitcoin', type: 'crypto' };
const EUR = { symbol: 'EURUSD=X', name: 'EUR/USD', type: 'forex' };

describe('AssetsPage', () => {
  beforeEach(() => {
    mocks.useFetch.mockReset();
    mocks.useWatchlist.mockReset();

    mocks.assetService.getUserSearchedAssets.mockReset();
    mocks.assetService.searchAssetBySymbol.mockReset();
    mocks.assetService.saveSearchedAsset.mockReset();

    mocks.useWatchlist.mockReturnValue({
      watchlist: [],
      isFavorite: () => false,
      toggleFavorite: vi.fn(),
    });

    mocks.useFetch.mockReturnValue({
      data: [AAPL, BTC, EUR],
      loading: false,
      error: null,
      refetch: vi.fn(),
    });

    mocks.assetService.getUserSearchedAssets.mockResolvedValue([]);
    mocks.assetService.saveSearchedAsset.mockResolvedValue({});
  });

  it('shows loading spinner when assets are loading', async () => {
    mocks.useFetch.mockReturnValue({
      data: null,
      loading: true,
      error: null,
      refetch: vi.fn(),
    });

    renderAssetsPage();
    await act(async () => {
      await mocks.assetService.getUserSearchedAssets.mock.results[0]?.value;
    });

    // There are no ARIA labels; assert by presence of roleless spinner container
    expect(screen.getByRole('heading', { name: t.assets.title })).toBeInTheDocument();
    expect(screen.getByText(t.assets.subtitle)).toBeInTheDocument();
    expect(document.querySelector('.animate-spin')).toBeTruthy();
  });

  it('shows error state when useFetch returns an error', async () => {
    mocks.useFetch.mockReturnValue({
      data: null,
      loading: false,
      error: new Error('boom'),
      refetch: vi.fn(),
    });

    renderAssetsPage();
    await act(async () => {
      await mocks.assetService.getUserSearchedAssets.mock.results[0]?.value;
    });

    expect(screen.getByText(/Error al cargar activos:/)).toBeInTheDocument();
    expect(screen.getByText(/boom/)).toBeInTheDocument();
  });

  it('renders assets and filters by type', async () => {
    renderAssetsPage();

    expect(await screen.findByText('AAPL')).toBeInTheDocument();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.getByText('EURUSD=X')).toBeInTheDocument();

    const user = userEvent.setup();
    await user.selectOptions(screen.getByRole('combobox'), 'crypto');

    expect(screen.queryByText('AAPL')).not.toBeInTheDocument();
    expect(screen.getByText('BTC-USD')).toBeInTheDocument();
    expect(screen.queryByText('EURUSD=X')).not.toBeInTheDocument();
  });

  it('shows watchlist empty state when watchlist tab is active and empty', async () => {
    renderAssetsPage({ tab: 'watchlist' });

    expect(await screen.findByRole('button', { name: t.assets.tabs.watchlist })).toBeInTheDocument();
    expect(screen.getByText('Tu lista de seguimiento está vacía')).toBeInTheDocument();
  });

  it('searches an asset via SymbolAutocomplete submit and saves it', async () => {
    mocks.assetService.searchAssetBySymbol.mockResolvedValue({
      symbol: 'MSFT',
      name: 'Microsoft',
      type: 'stock',
    });

    renderAssetsPage();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'submit-autocomplete' }));

    expect(await screen.findByText('MSFT')).toBeInTheDocument();
    expect(mocks.assetService.searchAssetBySymbol).toHaveBeenCalledWith('MSFT');
    expect(mocks.assetService.saveSearchedAsset).toHaveBeenCalledWith('MSFT', 'Microsoft', 'stock');
  });

  it('shows search error when the backend does not find the symbol', async () => {
    mocks.assetService.searchAssetBySymbol.mockRejectedValue({
      response: {
        data: {
          error: 'Symbol not found',
        },
      },
    });

    renderAssetsPage();

    const user = userEvent.setup();
    await user.click(screen.getByRole('button', { name: 'submit-bad' }));

    expect(await screen.findByText('Symbol not found')).toBeInTheDocument();
  });

  it('toggles favorite without opening the asset modal; clicking card opens modal', async () => {
    const toggleFavorite = vi.fn();
    mocks.useWatchlist.mockReturnValue({
      watchlist: [],
      isFavorite: (symbol: string) => symbol === 'AAPL',
      toggleFavorite,
    });

    renderAssetsPage();

    const card = await screen.findByText('AAPL');

    // Favorite star button has a title; click it should not open modal
    const button = screen.getByTitle('Quitar de seguimiento');
    const user = userEvent.setup();
    await user.click(button);

    expect(toggleFavorite).toHaveBeenCalledWith(AAPL);
    expect(screen.queryByText('ASSET MODAL')).not.toBeInTheDocument();

    // Clicking card itself opens modal
    await user.click(card);
    expect(await screen.findByText('ASSET MODAL')).toBeInTheDocument();
    expect(screen.getByTestId('modal-symbol')).toHaveTextContent('AAPL');
  });

  it('deduplicates assets by symbol when merging searched + suggested', async () => {
    mocks.assetService.getUserSearchedAssets.mockResolvedValue([AAPL]);

    renderAssetsPage();

    expect(await screen.findByText('AAPL')).toBeInTheDocument();
    expect(screen.getAllByText('AAPL').length).toBe(1);
  });
});
