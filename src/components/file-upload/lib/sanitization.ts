/**
 * Input sanitization utilities to prevent XSS and injection attacks
 */

import type { Metric } from '@/lib/mockData';

/**
 * Sanitize string input to prevent XSS attacks
 */
export function sanitizeString(input: unknown): string {
  if (typeof input !== 'string') {
    return '';
  }

  return (
    input
      // Remove HTML tags
      .replace(/<[^>]*>/g, '')
      // Remove javascript: protocol
      .replace(/javascript:/gi, '')
      // Remove event handlers
      .replace(/on\w+\s*=/gi, '')
      // Remove data: URLs (can contain malicious code)
      .replace(/data:text\/html/gi, '')
      // Remove script tags explicitly
      .replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim()
      // Limit length for safety
      .slice(0, 1000)
  );
}

/**
 * Sanitize numeric input
 */
export function sanitizeNumber(input: unknown): number | null {
  // Already a number
  if (typeof input === 'number' && isFinite(input)) {
    return input;
  }

  // Try to parse string
  if (typeof input === 'string') {
    // Remove common formatting
    const cleaned = input
      .replace(/[$,\s]/g, '') // Remove $, commas, spaces
      .replace(/[^\d.-]/g, ''); // Keep only digits, dots, minus

    const num = parseFloat(cleaned);

    if (isFinite(num)) {
      return num;
    }
  }

  return null;
}

/**
 * Sanitize enum value (unit or type)
 */
export function sanitizeEnum<T extends string>(
  value: unknown,
  allowedValues: readonly T[],
  defaultValue: T
): T {
  const normalized = String(value).toLowerCase().trim();

  const match = allowedValues.find((allowed) => allowed.toLowerCase() === normalized);

  return match ?? defaultValue;
}

/**
 * Sanitize unit value with smart aliases
 */
export function sanitizeUnit(value: unknown): Metric['unit'] {
  const normalized = String(value).toLowerCase().trim();

  // Direct matches
  if (normalized === '$') return '$';
  if (normalized === '%') return '%';
  if (normalized === '#') return '#';
  if (normalized === 'people') return 'People';

  // Aliases for dollar
  if (normalized === 'dollar' || normalized === 'dollars' || normalized === 'currency' || normalized === 'usd') {
    return '$';
  }

  // Aliases for percent
  if (normalized === 'percent' || normalized === 'percentage' || normalized === 'pct') {
    return '%';
  }

  // Aliases for people
  if (normalized === 'person' || normalized === 'persons' || normalized === 'individuals') {
    return 'People';
  }

  // Aliases for number
  if (normalized === 'number' || normalized === 'count' || normalized === 'num' || normalized === 'quantity') {
    return '#';
  }

  // Default to number
  return '#';
}

/**
 * Sanitize type value
 */
export function sanitizeType(value: unknown): Metric['type'] {
  const normalized = String(value).toLowerCase().trim();

  // Direct match
  if (normalized === 'outcome') return 'outcome';
  if (normalized === 'output') return 'output';

  // Aliases for outcome
  if (normalized === 'impact' || normalized === 'result' || normalized === 'effect') {
    return 'outcome';
  }

  // Aliases for output
  if (normalized === 'activity' || normalized === 'service' || normalized === 'deliverable') {
    return 'output';
  }

  // Default to output
  return 'output';
}

/**
 * Sanitize an entire metric object
 */
export function sanitizeMetric(metric: Record<string, unknown>): Partial<Metric> {
  return {
    label: sanitizeString(metric.label),
    value: sanitizeNumber(metric.value) ?? 0,
    unit: sanitizeUnit(metric.unit),
    type: sanitizeType(metric.type),
    comparison: metric.comparison ? sanitizeString(metric.comparison) : undefined,
    previousValue: metric.previousValue
      ? sanitizeNumber(metric.previousValue) ?? undefined
      : undefined,
  };
}

/**
 * Sanitize array of metrics
 */
export function sanitizeMetrics(metrics: Record<string, unknown>[]): Partial<Metric>[] {
  return metrics.map(sanitizeMetric);
}

/**
 * Remove null bytes (can cause issues in databases)
 */
export function removeNullBytes(str: string): string {
  return str.replace(/\0/g, '');
}

/**
 * Escape special CSV characters
 */
export function escapeCsvValue(value: string): string {
  // If value contains comma, quote, or newline, wrap in quotes
  if (/[,"\n\r]/.test(value)) {
    // Escape existing quotes by doubling them
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

/**
 * Validate that string doesn't contain malicious patterns
 */
export function containsMaliciousPatterns(str: string): boolean {
  const maliciousPatterns = [
    /<script/i,
    /javascript:/i,
    /on\w+\s*=/i,
    /<iframe/i,
    /<object/i,
    /<embed/i,
    /eval\s*\(/i,
    /expression\s*\(/i,
  ];

  return maliciousPatterns.some((pattern) => pattern.test(str));
}

/**
 * Sanitize file name to prevent path traversal
 */
export function sanitizeFileName(fileName: string): string {
  return (
    fileName
      // Remove path separators
      .replace(/[/\\]/g, '')
      // Remove null bytes
      .replace(/\0/g, '')
      // Remove control characters
      .replace(/[\x00-\x1f\x7f]/g, '')
      // Remove special characters that could cause issues
      .replace(/[<>:"|?*]/g, '')
      .trim()
      .slice(0, 255) // Max filename length
  );
}

/**
 * Check if value is safe for database insertion
 */
export function isSafeDatabaseValue(value: unknown): boolean {
  if (value === null || value === undefined) {
    return true;
  }

  if (typeof value === 'number') {
    return isFinite(value);
  }

  if (typeof value === 'string') {
    // Check length
    if (value.length > 10000) {
      return false;
    }

    // Check for malicious patterns
    if (containsMaliciousPatterns(value)) {
      return false;
    }

    return true;
  }

  if (typeof value === 'boolean') {
    return true;
  }

  // Reject complex objects
  return false;
}

/**
 * Sanitize entire row for safe processing
 */
export function sanitizeRow(row: Record<string, unknown>): Record<string, unknown> {
  const sanitized: Record<string, unknown> = {};

  for (const [key, value] of Object.entries(row)) {
    const cleanKey = sanitizeString(key);

    if (typeof value === 'string') {
      sanitized[cleanKey] = sanitizeString(value);
    } else if (typeof value === 'number') {
      sanitized[cleanKey] = sanitizeNumber(value);
    } else if (value === null || value === undefined) {
      sanitized[cleanKey] = null;
    } else {
      // Convert to string and sanitize
      sanitized[cleanKey] = sanitizeString(String(value));
    }
  }

  return sanitized;
}

/**
 * Remove duplicate metrics based on label (case-insensitive)
 */
export function removeDuplicates(metrics: Partial<Metric>[]): {
  unique: Partial<Metric>[];
  duplicates: string[];
} {
  const seen = new Map<string, number>();
  const unique: Partial<Metric>[] = [];
  const duplicates: string[] = [];

  metrics.forEach((metric, index) => {
    if (!metric.label) return;

    const key = metric.label.toLowerCase().trim();

    if (seen.has(key)) {
      duplicates.push(metric.label);
    } else {
      seen.set(key, index);
      unique.push(metric);
    }
  });

  return { unique, duplicates };
}

/**
 * Limit array size to prevent DoS attacks
 */
export function limitArraySize<T>(array: T[], maxSize: number): T[] {
  if (array.length > maxSize) {
    console.warn(`Array truncated from ${array.length} to ${maxSize} items`);
    return array.slice(0, maxSize);
  }
  return array;
}
