/**
 * Smart column mapping with fuzzy matching
 * Auto-detects which file columns map to Metric fields
 */

import type { Metric } from '@/lib/mockData';
import type { ColumnMapping, ColumnMappingResult } from './fileUploadTypes';

// Confidence threshold for automatic mapping
const AUTO_MAP_CONFIDENCE_THRESHOLD = 0.8;

// Field aliases for fuzzy matching
const FIELD_ALIASES: Record<keyof Metric | 'unmapped', string[]> = {
  label: [
    'label',
    'name',
    'metric',
    'metric name',
    'metric_name',
    'title',
    'description',
    'indicator',
  ],
  value: [
    'value',
    'amount',
    'number',
    'count',
    'quantity',
    'total',
    'sum',
    'figure',
    'metric value',
    'metric_value',
  ],
  unit: ['unit', 'units', 'measurement', 'uom', 'unit of measurement'],
  type: [
    'type',
    'metric type',
    'metric_type',
    'category',
    'kind',
    'classification',
  ],
  comparison: [
    'comparison',
    'compare',
    'vs',
    'versus',
    'change',
    'difference',
    'delta',
    'trend',
    'context',
  ],
  previousValue: [
    'previous value',
    'previous_value',
    'previousvalue',
    'last value',
    'last_value',
    'prior value',
    'prior_value',
    'baseline',
    'previous',
    'last year',
    'lastyear',
  ],
  id: [],
  unmapped: [],
};

/**
 * Calculate similarity between two strings (0-1)
 * Uses Levenshtein distance
 */
function calculateSimilarity(str1: string, str2: string): number {
  const s1 = str1.toLowerCase().trim();
  const s2 = str2.toLowerCase().trim();

  // Exact match
  if (s1 === s2) return 1.0;

  // One contains the other
  if (s1.includes(s2) || s2.includes(s1)) {
    return 0.9;
  }

  // Levenshtein distance
  const distance = levenshteinDistance(s1, s2);
  const maxLength = Math.max(s1.length, s2.length);
  const similarity = 1 - distance / maxLength;

  return Math.max(0, similarity);
}

/**
 * Calculate Levenshtein distance between two strings
 */
function levenshteinDistance(str1: string, str2: string): number {
  const matrix: number[][] = [];

  for (let i = 0; i <= str2.length; i++) {
    matrix[i] = [i];
  }

  for (let j = 0; j <= str1.length; j++) {
    matrix[0][j] = j;
  }

  for (let i = 1; i <= str2.length; i++) {
    for (let j = 1; j <= str1.length; j++) {
      if (str2.charAt(i - 1) === str1.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1];
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1, // substitution
          matrix[i][j - 1] + 1, // insertion
          matrix[i - 1][j] + 1 // deletion
        );
      }
    }
  }

  return matrix[str2.length][str1.length];
}

/**
 * Find best match for a column header
 */
function findBestMatch(
  header: string,
  targetField: keyof Metric
): { confidence: number; matched: boolean } {
  const normalizedHeader = header.toLowerCase().trim();
  const aliases = FIELD_ALIASES[targetField] || [];

  let bestConfidence = 0;

  for (const alias of aliases) {
    const similarity = calculateSimilarity(normalizedHeader, alias);
    if (similarity > bestConfidence) {
      bestConfidence = similarity;
    }
  }

  return {
    confidence: bestConfidence,
    matched: bestConfidence >= 0.6, // Lower threshold for matching
  };
}

/**
 * Auto-map columns to Metric fields
 */
export function autoMapColumns(headers: string[]): ColumnMappingResult {
  const mappings: ColumnMapping[] = [];
  const usedTargets = new Set<string>();

  // Required fields
  const requiredFields: (keyof Metric)[] = ['label', 'value'];

  // All possible target fields
  const targetFields: (keyof Metric)[] = [
    'label',
    'value',
    'unit',
    'type',
    'comparison',
    'previousValue',
  ];

  // First pass: Find best matches for each header
  for (const header of headers) {
    let bestTarget: keyof Metric | 'unmapped' = 'unmapped';
    let bestConfidence = 0;

    // Try to match with each target field
    for (const targetField of targetFields) {
      // Skip if already mapped
      if (usedTargets.has(targetField)) {
        continue;
      }

      const match = findBestMatch(header, targetField);

      if (match.confidence > bestConfidence) {
        bestConfidence = match.confidence;
        bestTarget = targetField;
      }
    }

    // Only use mapping if confidence is high enough
    if (bestConfidence >= 0.6 && bestTarget !== 'unmapped') {
      usedTargets.add(bestTarget);

      mappings.push({
        source: header,
        target: bestTarget,
        confidence: bestConfidence,
        isRequired: requiredFields.includes(bestTarget as keyof Metric),
      });
    } else {
      // Unmapped column
      mappings.push({
        source: header,
        target: 'unmapped',
        confidence: 0,
        isRequired: false,
      });
    }
  }

  // Check if all required fields are mapped
  const mappedTargets = new Set(mappings.map((m) => m.target));
  const allRequiredMapped = requiredFields.every((field) => mappedTargets.has(field));

  // Check if any mapping has low confidence
  const hasLowConfidence = mappings.some(
    (m) => m.target !== 'unmapped' && m.confidence < AUTO_MAP_CONFIDENCE_THRESHOLD
  );

  return {
    mappings,
    isValid: allRequiredMapped,
    needsManualMapping: !allRequiredMapped || hasLowConfidence,
  };
}

/**
 * Apply column mappings to transform raw data
 */
export function applyColumnMapping(
  row: Record<string, unknown>,
  mappings: ColumnMapping[]
): Record<string, unknown> {
  const mapped: Record<string, unknown> = {};

  for (const mapping of mappings) {
    if (mapping.target === 'unmapped') {
      continue;
    }

    // Map source column to target field
    const value = row[mapping.source];
    if (value !== undefined && value !== null && value !== '') {
      mapped[mapping.target] = value;
    }
  }

  return mapped;
}

/**
 * Validate that required fields are present in mappings
 */
export function validateMappings(mappings: ColumnMapping[]): {
  isValid: boolean;
  missingFields: string[];
} {
  const requiredFields = ['label', 'value'];
  const mappedFields = mappings
    .filter((m) => m.target !== 'unmapped')
    .map((m) => m.target);

  const missingFields = requiredFields.filter((field) => !mappedFields.includes(field));

  return {
    isValid: missingFields.length === 0,
    missingFields,
  };
}

/**
 * Get suggested target for unmapped column
 */
export function getSuggestedTarget(header: string): {
  target: keyof Metric | 'unmapped';
  confidence: number;
} {
  const targetFields: (keyof Metric)[] = [
    'label',
    'value',
    'unit',
    'type',
    'comparison',
    'previousValue',
  ];

  let bestTarget: keyof Metric | 'unmapped' = 'unmapped';
  let bestConfidence = 0;

  for (const targetField of targetFields) {
    const match = findBestMatch(header, targetField);

    if (match.confidence > bestConfidence) {
      bestConfidence = match.confidence;
      bestTarget = targetField;
    }
  }

  return {
    target: bestTarget,
    confidence: bestConfidence,
  };
}

/**
 * Get human-readable field names
 */
export function getFieldLabel(field: keyof Metric | 'unmapped'): string {
  const labels: Record<keyof Metric | 'unmapped', string> = {
    label: 'Metric Name',
    value: 'Value',
    unit: 'Unit',
    type: 'Type',
    comparison: 'Comparison',
    previousValue: 'Previous Value',
    id: 'ID',
    unmapped: 'Skip Column',
  };

  return labels[field] || field;
}

/**
 * Get field description for help text
 */
export function getFieldDescription(field: keyof Metric | 'unmapped'): string {
  const descriptions: Record<keyof Metric | 'unmapped', string> = {
    label: 'The name or description of the metric',
    value: 'The numeric value of the metric',
    unit: 'Unit of measurement ($, %, People, or #)',
    type: 'Either "output" (activities) or "outcome" (impact)',
    comparison: 'Optional context or comparison text',
    previousValue: 'Optional previous value for trend analysis',
    id: 'Unique identifier (auto-generated)',
    unmapped: 'This column will not be imported',
  };

  return descriptions[field] || '';
}

/**
 * Get available target fields (excluding already mapped)
 */
export function getAvailableTargets(
  currentMappings: ColumnMapping[],
  currentSource?: string
): (keyof Metric | 'unmapped')[] {
  const allTargets: (keyof Metric | 'unmapped')[] = [
    'label',
    'value',
    'unit',
    'type',
    'comparison',
    'previousValue',
    'unmapped',
  ];

  // Get targets that are already mapped (excluding current source)
  const usedTargets = new Set(
    currentMappings
      .filter((m) => m.source !== currentSource && m.target !== 'unmapped')
      .map((m) => m.target)
  );

  // Return available targets
  return allTargets.filter((target) => target === 'unmapped' || !usedTargets.has(target));
}
