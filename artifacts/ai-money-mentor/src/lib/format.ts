/**
 * Formats a number to Indian Rupee (₹) format using the Indian numbering system (Lakhs, Crores).
 */
export function formatINR(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "₹0";
  
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(value);
}

/**
 * Formats large numbers compactly (e.g., 1.5L, 2.5Cr)
 */
export function formatCompactINR(value: number | undefined | null): string {
  if (value === undefined || value === null || isNaN(value)) return "₹0";
  
  if (value >= 10000000) {
    return `₹${(value / 10000000).toFixed(2)}Cr`;
  } else if (value >= 100000) {
    return `₹${(value / 100000).toFixed(2)}L`;
  } else if (value >= 1000) {
    return `₹${(value / 1000).toFixed(0)}K`;
  }
  return formatINR(value);
}
