import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

// Fixed exchange rates for MVP (Base: USD)
export const EXCHANGE_RATES: Record<string, number> = {
  USD: 1,
  INR: 84,
  EUR: 0.92,
  GBP: 0.79,
  JPY: 150,
  AUD: 1.5,
};

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  INR: '₹',
  EUR: '€',
  GBP: '£',
  JPY: '¥',
  AUD: 'A$',
};

export const useCurrency = () => {
  const { profile } = useAuth();
  
  const currencyCode = (profile?.currency as keyof typeof EXCHANGE_RATES) || 'USD';
  const exchangeRate = EXCHANGE_RATES[currencyCode] || 1;
  const currencySymbol = CURRENCY_SYMBOLS[currencyCode] || '$';

  const toUSD = (amountInLocal: number | null | undefined): number => {
    if (amountInLocal == null) return 0;
    return amountInLocal / exchangeRate;
  };

  const fromUSD = (amountInUSD: number | null | undefined): number => {
    if (amountInUSD == null) return 0;
    return amountInUSD * exchangeRate;
  };

  const formatCost = (costInUSD?: number | null): string => {
    if (costInUSD === undefined || costInUSD === null || costInUSD === 0) return 'Free';
    const localCost = fromUSD(costInUSD);
    return `${currencySymbol}${localCost.toFixed(0)}`;
  };

  return {
    currencyCode,
    currencySymbol,
    exchangeRate,
    toUSD,
    fromUSD,
    formatCost,
  };
};
