/**
 * Shared currency formatting utility.
 * Safely formats a value as AUD currency.
 * Handles null, undefined, and non-numeric values.
 * 
 * @param {any} value - The value to format.
 * @returns {string} Formatted currency string (e.g., "$1.25M", "$50K", "$100").
 */
export const formatCurrency = (value) => {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return '$0';
    }
    if (Math.abs(num) >= 1000000) {
        return `$${(num / 1000000).toFixed(2)}M`;
    }
    if (Math.abs(num) >= 1000) {
        return `$${(num / 1000).toFixed(1)}K`;
    }
    return `$${num.toFixed(0)}`;
};

/**
 * Formats a value in millions with lowercase 'm' suffix.
 * Used for forecast tables.
 * @param {any} value - The value to format.
 * @returns {string} Formatted currency string (e.g., "$1.25m").
 */
export const formatCurrencyMillions = (value) => {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return '$0.00m';
    }
    return `$${num.toFixed(2)}m`;
};

/**
 * Formats a value as full currency with Intl.NumberFormat.
 * @param {any} value - The value to format.
 * @returns {string} Formatted currency string (e.g., "$1,250,000").
 */
export const formatCurrencyFull = (value) => {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return '$0';
    }
    return new Intl.NumberFormat('en-AU', {
        style: 'currency',
        currency: 'AUD',
        minimumFractionDigits: 0,
        maximumFractionDigits: 0,
    }).format(num);
};

/**
 * Formats a value as a percentage.
 * @param {any} value - The value to format.
 * @param {number} decimals - Number of decimal places (default 1).
 * @returns {string} Formatted percentage string (e.g., "5.5%").
 */
export const formatPercentage = (value, decimals = 1) => {
    const num = Number(value);
    if (value === null || value === undefined || isNaN(num)) {
        return '0%';
    }
    return `${num.toFixed(decimals)}%`;
};
