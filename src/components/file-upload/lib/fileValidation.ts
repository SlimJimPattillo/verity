/**
 * Zod validation schemas for file upload data
 */

import { z } from 'zod';
import { MAX_FILE_SIZE } from './fileUploadTypes';

// ============================================================================
// Metric Validation Schema
// ============================================================================

export const MetricSchema = z.object({
  label: z
    .string()
    .min(1, 'Label is required')
    .max(100, 'Label must be 100 characters or less')
    .transform((val) => val.trim()),

  value: z
    .number({
      required_error: 'Value is required',
      invalid_type_error: 'Value must be a number',
    })
    .finite('Value must be a valid number')
    .refine((val) => !isNaN(val), 'Invalid numeric value'),

  unit: z.enum(['$', '%', 'People', '#'], {
    errorMap: () => ({ message: 'Unit must be $, %, People, or #' }),
  }),

  type: z.enum(['output', 'outcome'], {
    errorMap: () => ({ message: 'Type must be output or outcome' }),
  }),

  comparison: z
    .string()
    .max(200, 'Comparison must be 200 characters or less')
    .transform((val) => val.trim())
    .optional(),

  previousValue: z
    .number()
    .finite('Previous value must be a valid number')
    .optional()
    .nullable(),
});

export type ValidatedMetric = z.infer<typeof MetricSchema>;

// ============================================================================
// File Metadata Schema
// ============================================================================

export const FileMetadataSchema = z.object({
  name: z.string().min(1, 'File name is required'),
  size: z
    .number()
    .min(1, 'File cannot be empty')
    .max(MAX_FILE_SIZE, `File must be under ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`),
  type: z.string(),
  lastModified: z.number(),
  detectedMime: z.string().nullable().optional(),
  detectedExtension: z.string().nullable().optional(),
  encoding: z.string().optional(),
});

export type ValidatedFileMetadata = z.infer<typeof FileMetadataSchema>;

// ============================================================================
// Parsed Data Schema
// ============================================================================

export const ValidationErrorSchema = z.object({
  code: z.string(),
  message: z.string(),
  field: z.string().optional(),
  row: z.number().optional(),
  severity: z.enum(['error', 'warning']),
  suggestion: z.string().optional(),
  rawData: z.unknown().optional(),
});

export const ParsedRowSchema = z.object({
  label: z.string(),
  value: z.number(),
  unit: z.enum(['$', '%', 'People', '#']),
  type: z.enum(['output', 'outcome']),
  comparison: z.string().optional(),
  previousValue: z.number().optional().nullable(),
  isValid: z.boolean(),
  error: z.string().optional(),
  rowIndex: z.number().optional(),
});

export const ParsedDataSchema = z.object({
  rows: z.array(ParsedRowSchema),
  totalRows: z.number().min(0),
  validRows: z.number().min(0),
  invalidRows: z.number().min(0),
  errors: z.array(ValidationErrorSchema),
  headers: z.array(z.string()),
});

export type ValidatedParsedData = z.infer<typeof ParsedDataSchema>;

// ============================================================================
// Server Validation Request Schema
// ============================================================================

export const ServerValidationRequestSchema = z.object({
  organizationId: z.string().uuid('Invalid organization ID'),
  metrics: z
    .array(MetricSchema)
    .min(1, 'At least one metric is required')
    .max(10000, 'Maximum 10,000 metrics per upload'),
  fileName: z.string().min(1, 'File name is required'),
  userId: z.string().uuid('Invalid user ID'),
});

export type ValidatedServerRequest = z.infer<typeof ServerValidationRequestSchema>;

// ============================================================================
// Server Validation Response Schema
// ============================================================================

export const ServerValidationResponseSchema = z.object({
  success: z.boolean(),
  validatedMetrics: z.array(MetricSchema).optional(),
  count: z.number().optional(),
  error: z.string().optional(),
  validationErrors: z
    .array(
      z.object({
        row: z.number(),
        errors: z.array(z.string()),
      })
    )
    .optional(),
});

export type ValidatedServerResponse = z.infer<typeof ServerValidationResponseSchema>;

// ============================================================================
// Column Mapping Schema
// ============================================================================

export const ColumnMappingSchema = z.object({
  source: z.string(),
  target: z.union([
    z.enum(['label', 'value', 'unit', 'type', 'comparison', 'previousValue']),
    z.literal('unmapped'),
  ]),
  confidence: z.number().min(0).max(1),
  isRequired: z.boolean(),
});

export const ColumnMappingResultSchema = z.object({
  mappings: z.array(ColumnMappingSchema),
  isValid: z.boolean(),
  needsManualMapping: z.boolean(),
});

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Validate a single row of data and return detailed errors
 */
export function validateRow(
  row: Record<string, unknown>,
  rowIndex: number
): { isValid: boolean; data: ValidatedMetric | null; errors: ValidationError[] } {
  try {
    const validated = MetricSchema.parse(row);
    return {
      isValid: true,
      data: validated,
      errors: [],
    };
  } catch (error) {
    if (error instanceof z.ZodError) {
      const errors = error.errors.map((e) => ({
        code: 'VALIDATION_ERROR' as const,
        message: e.message,
        field: e.path.join('.'),
        row: rowIndex,
        severity: 'error' as const,
        suggestion: getSuggestionForError(e),
      }));

      return {
        isValid: false,
        data: null,
        errors,
      };
    }

    return {
      isValid: false,
      data: null,
      errors: [
        {
          code: 'UNKNOWN_ERROR',
          message: 'Validation failed',
          row: rowIndex,
          severity: 'error',
        },
      ],
    };
  }
}

/**
 * Get helpful suggestion based on validation error
 */
function getSuggestionForError(error: z.ZodIssue): string | undefined {
  const field = error.path[0]?.toString();

  switch (field) {
    case 'label':
      if (error.code === 'too_small') {
        return 'Provide a descriptive name for this metric';
      }
      if (error.code === 'too_big') {
        return 'Use a shorter, more concise label';
      }
      break;

    case 'value':
      if (error.code === 'invalid_type') {
        return 'Ensure the value is a number without special characters';
      }
      break;

    case 'unit':
      return 'Choose one of: $ (dollar), % (percent), People, or # (number)';

    case 'type':
      return 'Choose either "output" (activities) or "outcome" (impact)';

    case 'comparison':
      if (error.code === 'too_big') {
        return 'Keep comparison text brief and descriptive';
      }
      break;

    case 'previousValue':
      if (error.code === 'invalid_type') {
        return 'Previous value must be a number, or leave blank';
      }
      break;
  }

  return undefined;
}

/**
 * Validate an array of metrics and return summary
 */
export function validateMetrics(
  metrics: Record<string, unknown>[]
): {
  validMetrics: ValidatedMetric[];
  invalidCount: number;
  errors: ValidationError[];
} {
  const validMetrics: ValidatedMetric[] = [];
  const errors: ValidationError[] = [];
  let invalidCount = 0;

  metrics.forEach((metric, index) => {
    const result = validateRow(metric, index);

    if (result.isValid && result.data) {
      validMetrics.push(result.data);
    } else {
      invalidCount++;
      errors.push(...result.errors);
    }
  });

  return {
    validMetrics,
    invalidCount,
    errors,
  };
}

/**
 * Check if required columns are present in headers
 */
export function validateHeaders(headers: string[]): {
  isValid: boolean;
  missingRequired: string[];
  errors: ValidationError[];
} {
  const normalizedHeaders = headers.map((h) => h.toLowerCase().trim());
  const requiredFields = ['label', 'value'];
  const missingRequired = requiredFields.filter((field) => !normalizedHeaders.includes(field));

  const errors: ValidationError[] = missingRequired.map((field) => ({
    code: 'MISSING_HEADERS',
    message: `Missing required column: ${field}`,
    field,
    severity: 'error',
    suggestion: `Add a column named "${field}" to your file`,
  }));

  return {
    isValid: missingRequired.length === 0,
    missingRequired,
    errors,
  };
}

type ValidationError = z.infer<typeof ValidationErrorSchema>;
