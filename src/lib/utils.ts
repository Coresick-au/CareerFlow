import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// =============================================================================
// CURRENCY FORMATTING (Australian)
// =============================================================================

/**
 * Format as AUD currency without cents (e.g., "$85,000")
 */
export function formatCurrency(amount: number | null | undefined): string {
  if (amount === null || amount === undefined || isNaN(amount)) return '$0';
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * Format as AUD currency with cents (e.g., "$48.52")
 */
export function formatCurrencyPrecise(amount: number): string {
  return new Intl.NumberFormat('en-AU', {
    style: 'currency',
    currency: 'AUD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Calculate take-home pay (gross minus tax)
 */
export function calculateTakeHomePay(gross: number, taxWithheld: number): number {
  return Math.max(0, gross - taxWithheld);
}

// =============================================================================
// DATE FORMATTING (Australian DD/MM/YYYY)
// =============================================================================

/**
 * Format date as Australian format: "27/12/2025"
 */
export function formatDateAU(date: Date | string | undefined | null): string {
  if (!date) return 'Unknown Date';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-AU', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/**
 * Format date with month name: "27 Dec 2025"
 */
export function formatDate(date: Date | string | undefined | null): string {
  if (!date) return 'Unknown Date';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  return d.toLocaleDateString('en-AU', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date range: "27/12/2024 - 15/06/2025" or "27/12/2024 - Present"
 */
export function formatDateRangeAU(start: Date | string, end?: Date | string | null): string {
  const startDate = typeof start === 'string' ? new Date(start) : start;
  const startStr = formatDateAU(startDate);

  if (!end) {
    return `${startStr} - Present`;
  }

  const endDate = typeof end === 'string' ? new Date(end) : end;
  const endStr = formatDateAU(endDate);
  return `${startStr} - ${endStr}`;
}

// =============================================================================
// FINANCIAL YEAR HELPERS (Australian: 1 July - 30 June)
// =============================================================================

/**
 * Get the financial year for a given date.
 * Returns format: "FY2024-25" (for dates between 1 July 2024 and 30 June 2025)
 */
export function getFinancialYear(date: Date | string | undefined | null): string {
  if (!date) return 'Unknown FY';
  const d = typeof date === 'string' ? new Date(date) : date;
  if (!(d instanceof Date) || isNaN(d.getTime())) return 'Invalid date';

  const year = d.getFullYear();
  const month = d.getMonth(); // 0-indexed (0 = January, 6 = July)

  // If July (6) or later, FY starts this year. Otherwise FY started last year.
  const fyStartYear = month >= 6 ? year : year - 1;
  const fyEndYear = fyStartYear + 1;

  // Format as FY2024-25
  return `FY${fyStartYear}-${fyEndYear.toString().slice(-2)}`;
}

/**
 * Get the current financial year
 */
export function getCurrentFinancialYear(): string {
  return getFinancialYear(new Date());
}

/**
 * Get the start and end dates for a financial year string (e.g., "FY2024-25")
 */
export function getFinancialYearBounds(fy: string): { start: Date; end: Date } | null {
  // Extract years from format like "FY2024-25" or "2024-25" or "FY2024"
  const match = fy.match(/(?:FY)?(\d{4})(?:-(\d{2}))?/);
  if (!match) return null;

  const startYear = parseInt(match[1], 10);

  return {
    start: new Date(startYear, 6, 1), // 1 July
    end: new Date(startYear + 1, 5, 30), // 30 June next year
  };
}

/**
 * Get list of financial years between two dates
 */
export function getFinancialYearRange(start: Date | undefined | null, end?: Date | undefined | null): string[] {
  if (!start) return [];
  const endDate = end || new Date();
  const years: string[] = [];

  const startDate = typeof start === 'string' ? new Date(start) : start;
  if (isNaN(startDate.getTime())) return [];

  let current = new Date(startDate);
  while (current <= endDate) {
    const fy = getFinancialYear(current);
    if (!years.includes(fy)) {
      years.push(fy);
    }
    // Move to next July
    current = new Date(current.getFullYear() + 1, 6, 1);
  }

  return years;
}

// =============================================================================
// AGE & DURATION CALCULATIONS
// =============================================================================

export function calculateAge(dateOfBirth: Date | string | undefined | null): number {
  if (!dateOfBirth) return 0;
  const dob = typeof dateOfBirth === 'string' ? new Date(dateOfBirth) : dateOfBirth;
  if (!(dob instanceof Date) || isNaN(dob.getTime())) return 0;

  const today = new Date();
  let age = today.getFullYear() - dob.getFullYear();
  const monthDiff = today.getMonth() - dob.getMonth();
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--;
  }
  return age;
}

/**
 * Format duration in years and months: "2y 6m" or "8m"
 */
export function formatDuration(start: Date | string | undefined | null, end?: Date | string | undefined | null): string {
  if (!start) return '';
  const startDate = typeof start === 'string' ? new Date(start) : start;
  if (!(startDate instanceof Date) || isNaN(startDate.getTime())) return '';

  const endDate = end ? (typeof end === 'string' ? new Date(end) : end) : new Date();
  if (!(endDate instanceof Date) || isNaN(endDate.getTime())) return '';

  let months = (endDate.getFullYear() - startDate.getFullYear()) * 12;
  months += endDate.getMonth() - startDate.getMonth();

  // Adjust for partial months
  if (endDate.getDate() < startDate.getDate()) {
    months--;
  }

  const years = Math.floor(months / 12);
  const remainingMonths = months % 12;

  if (years > 0) {
    return remainingMonths > 0 ? `${years}y ${remainingMonths}m` : `${years}y`;
  }
  return `${Math.max(1, remainingMonths)}m`; // At least 1 month
}

// =============================================================================
// STATISTICS HELPERS
// =============================================================================

/**
 * Calculate median of an array of numbers
 */
export function calculateMedian(values: number[]): number {
  if (values.length === 0) return 0;

  const sorted = [...values].sort((a, b) => a - b);
  const middle = Math.floor(sorted.length / 2);

  if (sorted.length % 2 === 0) {
    return (sorted[middle - 1] + sorted[middle]) / 2;
  }
  return sorted[middle];
}

/**
 * Calculate average of an array of numbers
 */
export function calculateAverage(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, val) => sum + val, 0) / values.length;
}

/**
 * Project annual income from weekly entries
 */
export function projectAnnualIncome(weeklyAmounts: number[], weeksInYear: number = 52): number {
  if (weeklyAmounts.length === 0) return 0;
  const average = calculateAverage(weeklyAmounts);
  return average * weeksInYear;
}

// =============================================================================
// SUPER CONSTANTS (Australian)
// =============================================================================

/**
 * Get the super guarantee rate for a given financial year
 * https://www.ato.gov.au/rates/key-superannuation-rates-and-thresholds/
 */
export function getSuperGuaranteeRate(fy?: string): number {
  const year = fy ? parseInt(fy.match(/\d{4}/)?.[0] || '2024', 10) : new Date().getFullYear();

  // Super guarantee rates by financial year start
  if (year >= 2025) return 12.0;   // FY2025-26 onwards
  if (year >= 2024) return 11.5;   // FY2024-25
  if (year >= 2023) return 11.0;   // FY2023-24
  if (year >= 2022) return 10.5;   // FY2022-23
  if (year >= 2021) return 10.0;   // FY2021-22
  return 9.5; // Earlier years
}

// =============================================================================
// INPUT HELPERS
// =============================================================================

/**
 * Format a Date object (or string) to YYYY-MM-DD string for input[type="date"]
 * Safely handles invalid dates by returning empty string
 */
export function formatDateForInput(date: Date | string | undefined | null): string {
  if (!date) return '';
  try {
    const d = typeof date === 'string' ? new Date(date) : date;
    if (!(d instanceof Date) || isNaN(d.getTime())) return '';
    return d.toISOString().split('T')[0];
  } catch (e) {
    return '';
  }
}

/**
 * Parse YYYY-MM-DD string from input[type="date"] to Date object
 * Returns null if input is empty or invalid
 */
export function parseDateFromInput(value: string): Date | null {
  if (!value) return null;
  const d = new Date(value);
  return isNaN(d.getTime()) ? null : d;
}
