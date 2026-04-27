import { useState, useEffect, useRef } from 'react';
import { Search } from 'lucide-react';
import { autocompleteService } from '@services/index';

interface SymbolAutocompleteProps {
  value: string;
  onChange: (symbol: string) => void;
  onSubmit?: (symbol: string) => void;
  placeholder?: string;
  className?: string;
  inputClassName?: string;
  showSearchIcon?: boolean;
  onFocus?: () => void;
}

const TYPE_LABELS: Record<string, string> = {
  EQUITY: 'Acción',
  CRYPTOCURRENCY: 'Crypto',
  ETF: 'ETF',
  CURRENCY: 'Divisa',
  FUTURE: 'Futuro',
  INDEX: 'Índice',
};

export default function SymbolAutocomplete({
  value,
  onChange,
  onSubmit,
  placeholder = 'Busca AAPL, BTC-USD, EURUSD=X...',
  className = '',
  inputClassName = '',
  showSearchIcon = false,
  onFocus,
}: SymbolAutocompleteProps) {
  const [query, setQuery] = useState(value);
  const [suggestions, setSuggestions] = useState<{ symbol: string; name: string; type: string; exchange: string }[]>([]);
  const [open, setOpen] = useState(false);
  const [searching, setSearching] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Sync query when external value changes
  useEffect(() => {
    setQuery(value);
  }, [value]);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (query.trim().length < 1) { setSuggestions([]); return; }
    debounceRef.current = setTimeout(async () => {
      setSearching(true);
      try {
        const results = await autocompleteService.search(query);
        setSuggestions(results);
        setOpen(results.length > 0);
      } finally {
        setSearching(false);
      }
    }, 300);
  }, [query]);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const select = (symbol: string) => {
    onChange(symbol);
    setQuery(symbol);
    setOpen(false);
    setSuggestions([]);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setOpen(false);
      if (onSubmit) onSubmit(query.trim().toUpperCase());
    }
  };

  const defaultInputClass =
    'w-full px-3 py-2 rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-primary-500 outline-none text-sm';

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      <div className="relative">
        {showSearchIcon && (
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 sm:w-5 h-4 sm:h-5 text-gray-400 pointer-events-none" />
        )}
        <input
          type="text"
          value={query}
          onChange={e => { setQuery(e.target.value.toUpperCase()); onChange(''); }}
          onFocus={() => {
            if (suggestions.length > 0) setOpen(true);
            if (onFocus) onFocus();
          }}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className={inputClassName || `${defaultInputClass} ${showSearchIcon ? 'pl-9 sm:pl-10' : ''} pr-8 text-sm`}
        />
        {searching && (
          <div className="absolute right-2.5 top-1/2 -translate-y-1/2 w-4 h-4 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
        )}
      </div>
      {open && suggestions.length > 0 && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl shadow-xl overflow-hidden max-h-80 overflow-y-auto">
          {suggestions.map(s => (
            <button
              key={s.symbol}
              type="button"
              onClick={() => select(s.symbol)}
              className="w-full flex items-center justify-between px-3 py-2 sm:py-2.5 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-left"
            >
              <div className="min-w-0 flex-1">
                <span className="font-bold text-sm text-gray-900 dark:text-white block">{s.symbol}</span>
                <span className="text-xs text-gray-500 dark:text-gray-400 truncate block">{s.name}</span>
              </div>
              <div className="flex items-center gap-1.5 flex-shrink-0 ml-2">
                <span className="text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">{s.exchange}</span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-gray-100 dark:bg-gray-600 text-gray-600 dark:text-gray-300 whitespace-nowrap">
                  {TYPE_LABELS[s.type] ?? s.type}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
