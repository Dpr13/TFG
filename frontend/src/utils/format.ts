export const formatCurrency = (value: number, currency = 'USD', decimals?: number): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  
  // Heurística para decimales si no se proporcionan:
  // - Si el valor es >= 100: 2 decimales
  // - Si el valor es < 100 y >= 1: 2-4 decimales
  // - Si el valor es < 1: hasta 6 decimales
  let minDecimals = decimals ?? 2;
  let maxDecimals = decimals ?? 2;
  
  if (decimals === undefined) {
    if (value < 1) {
      minDecimals = 2;
      maxDecimals = 6;
    } else if (value < 100) {
      minDecimals = 2;
      maxDecimals = 4;
    } else {
      minDecimals = 2;
      maxDecimals = 2;
    }
  }

  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(value);
};

export const formatPercentage = (value: number, decimals = 2): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return `${(value * 100).toFixed(decimals)}%`;
};

export const formatCompactNumber = (value: number): string => {
  if (value === null || value === undefined || isNaN(value)) return 'N/A';
  return new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    compactDisplay: 'short',
    maximumFractionDigits: 2,
  }).format(value);
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
};

export const formatDateTime = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return new Intl.DateTimeFormat('es-ES', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(d);
};

export const formatDateSimple = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!d || isNaN(d.getTime())) return 'N/A';
  return d.toISOString().split('T')[0];
};
