/**
 * Decimal.js utility functions for financial calculations
 * Provides precise arithmetic to avoid floating-point errors
 */

import { Decimal } from 'decimal.js';

// Configure Decimal.js for financial calculations
Decimal.set({
  precision: 20,
  rounding: Decimal.ROUND_HALF_UP,
  toExpNeg: -9e15,
  toExpPos: 9e15,
});

/**
 * Convert basis points to decimal rate
 * Example: 625 basis points = 6.25% = 0.0625
 */
export function basisPointsToRate(basisPoints) {
  return new Decimal(basisPoints).div(10000);
}

/**
 * Convert decimal rate to basis points
 * Example: 0.0625 = 6.25% = 625 basis points
 */
export function rateToBasisPoints(rate) {
  return new Decimal(rate).times(10000).round().toNumber();
}

/**
 * Convert cents to Decimal (for calculations)
 */
export function centsToDecimal(cents) {
  return new Decimal(cents);
}

/**
 * Convert dollars to cents
 */
export function dollarsToCents(dollars) {
  return new Decimal(dollars).times(100).round().toNumber();
}

/**
 * Convert cents to dollars
 */
export function centsToDollars(cents) {
  return new Decimal(cents).div(100).toNumber();
}

/**
 * Format cents as currency string
 * Example: 45000000 cents → "$450,000.00"
 */
export function formatCurrency(cents) {
  const dollars = centsToDollars(cents);
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(dollars);
}

/**
 * Format cents as abbreviated currency (e.g., "$450K")
 */
export function formatCurrencyAbbreviated(cents) {
  const dollars = centsToDollars(cents);

  if (dollars >= 1_000_000) {
    return `$${(dollars / 1_000_000).toFixed(2)}M`;
  } else if (dollars >= 1_000) {
    return `$${(dollars / 1_000).toFixed(0)}K`;
  }

  return formatCurrency(cents);
}

/**
 * Format basis points as percentage
 * Example: 625 basis points → "6.25%"
 */
export function formatPercentage(basisPoints, decimals = 2) {
  const rate = basisPointsToRate(basisPoints);
  return `${rate.times(100).toFixed(decimals)}%`;
}

/**
 * Parse user input (dollar string) to cents
 * Handles: "$450,000", "450000", "450,000.50"
 */
export function parseCurrencyInput(input) {
  const cleaned = input.replace(/[$,\s]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  return dollarsToCents(parsed);
}

/**
 * Parse percentage input to basis points
 * Handles: "6.25%", "6.25", "0.0625"
 */
export function parsePercentageInput(input) {
  const cleaned = input.replace(/[%\s]/g, '');
  const parsed = parseFloat(cleaned);

  if (isNaN(parsed)) return null;

  // If value is < 1, assume it's decimal (0.0625)
  // If value is >= 1, assume it's percentage (6.25)
  const rate = parsed < 1 ? parsed : parsed / 100;

  return rateToBasisPoints(rate);
}

/**
 * Format number with thousands separator
 * Example: 450000 → "450,000"
 */
export function formatNumber(value, decimals = 0) {
  return new Intl.NumberFormat('en-AU', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value);
}
