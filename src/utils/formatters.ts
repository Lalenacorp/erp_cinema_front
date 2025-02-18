export const formatCurrency = (amount: number | string, currency: string = 'EUR', exchangeRate?: string): string => {
  const numericAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  const rate = exchangeRate ? parseFloat(exchangeRate) : 1;
  const convertedAmount = numericAmount * rate;
  
  // Mapper les codes de devise
  const currencyCode = getCurrencyCode(currency);
  
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: currencyCode,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(convertedAmount);
};

export const getCurrencyIcon = (currency: string = 'EUR'): string => {
  switch (currency?.toLowerCase()) {
    case 'dollar':
      return '$';
    case 'fcfa':
      return 'FCFA';
    case 'euro':
    default:
      return '€';
  }
};

// Fonction utilitaire pour convertir les noms de devise en codes ISO
export const getCurrencyCode = (currency: string = 'EUR'): string => {
  switch (currency?.toLowerCase()) {
    case 'dollar':
      return 'USD';
    case 'fcfa':
      return 'XAF';
    case 'euro':
    default:
      return 'EUR';
  }
};

export const formatDate = (dateString: string): string => {
  return new Intl.DateTimeFormat('fr-FR', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  }).format(new Date(dateString));
};

export const formatPercentage = (value: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'percent',
    minimumFractionDigits: 1,
    maximumFractionDigits: 1
  }).format(value / 100);
};

export const formatNumber = (value: number): string => {
  return new Intl.NumberFormat('fr-FR').format(value);
};