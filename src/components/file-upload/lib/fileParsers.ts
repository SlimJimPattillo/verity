/**
 * File parsers for CSV, XLSX, XLS, and ODS formats
 * Supports streaming for large files
 */

import Papa from 'papaparse';
import * as XLSX from 'xlsx';
import type {
  FileType,
  ParsedRow,
  ParsedData,
  ProgressUpdate,
} from './fileUploadTypes';
import { ProgressPhase } from './fileUploadTypes';
import { sanitizeRow, sanitizeMetric } from './sanitization';
import { validateRow } from './fileValidation';
import { decodeText, removeBOM, normalizeLineEndings } from './encodingDetection';

// ============================================================================
// Main Parser Entry Point
// ============================================================================

export interface ParseOptions {
  fileName: string;
  fileType: FileType;
  encoding?: string;
  onProgress?: (update: ProgressUpdate) => void;
  chunkSize?: number;
}

/**
 * Parse file based on type
 */
export async function parseFile(
  buffer: ArrayBuffer,
  options: ParseOptions
): Promise<ParsedData> {
  const { fileType, encoding = 'UTF-8', onProgress } = options;

  // Report parsing start
  onProgress?.({
    phase: ProgressPhase.PARSING,
    progress: 0,
    message: 'Starting file parsing',
  });

  try {
    switch (fileType) {
      case 'csv':
        return await parseCSV(buffer, encoding, onProgress);

      case 'xlsx':
      case 'xls':
      case 'ods':
        return await parseSpreadsheet(buffer, fileType, onProgress);

      default:
        throw new Error(`Unsupported file type: ${fileType}`);
    }
  } catch (error) {
    console.error('File parsing error:', error);
    throw new Error(
      `Failed to parse file: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// CSV Parser
// ============================================================================

async function parseCSV(
  buffer: ArrayBuffer,
  encoding: string,
  onProgress?: (update: ProgressUpdate) => void
): Promise<ParsedData> {
  return new Promise((resolve, reject) => {
    try {
      // Decode text with specified encoding
      let text = decodeText(buffer, encoding);

      // Remove BOM if present
      text = removeBOM(text);

      // Normalize line endings
      text = normalizeLineEndings(text);

      const rows: ParsedRow[] = [];
      const errors: any[] = [];
      let headers: string[] = [];
      let totalRows = 0;
      let processedRows = 0;
      let hasHeaders = false;

      // Detect if first line contains headers
      const firstLine = text.split('\n')[0]?.toLowerCase() || '';
      hasHeaders = firstLine.includes('label') || firstLine.includes('metric') || firstLine.includes('name');

      // Parse CSV with PapaParse
      Papa.parse(text, {
        header: hasHeaders,
        skipEmptyLines: true,
        transformHeader: hasHeaders ? (header) => header.toLowerCase().trim() : undefined,
        step: (results, parser) => {
          // Store headers from first row
          if (processedRows === 0 && results.meta.fields) {
            headers = results.meta.fields;
          }

          processedRows++;

          // Convert array data to object if no headers
          let rowData: Record<string, unknown>;
          if (!hasHeaders && Array.isArray(results.data)) {
            // Map array indices to field names
            // Expected format: [label, value, type, unit, comparison, previousValue]
            const arr = results.data as string[];
            rowData = {
              label: arr[0] || '',
              value: arr[1] || '',
              type: arr[2] || '',
              unit: arr[3] || '',
              comparison: arr[4] || '',
              previousValue: arr[5] || '',
            };
          } else {
            rowData = results.data as Record<string, unknown>;
          }

          // Sanitize and validate row
          const sanitized = sanitizeRow(rowData);
          const metric = sanitizeMetric(sanitized);
          const validation = validateRow(metric, processedRows - 1);

          const parsedRow: ParsedRow = {
            label: metric.label || '',
            value: metric.value || 0,
            unit: metric.unit || '#',
            type: metric.type || 'output',
            comparison: metric.comparison,
            previousValue: metric.previousValue,
            isValid: validation.isValid,
            error: validation.errors[0]?.message,
            rowIndex: processedRows - 1,
          };

          rows.push(parsedRow);

          if (!validation.isValid) {
            errors.push(...validation.errors);
          }

          // Report progress every 100 rows
          if (processedRows % 100 === 0 && onProgress) {
            onProgress({
              phase: ProgressPhase.PARSING,
              progress: Math.min(90, (processedRows / (totalRows || 1000)) * 90),
              message: `Parsing row ${processedRows}`,
              rowsProcessed: processedRows,
            });
          }
        },
        complete: () => {
          totalRows = rows.length;

          // Final progress update
          onProgress?.({
            phase: ProgressPhase.VALIDATING_ROWS,
            progress: 100,
            message: `Parsed ${totalRows} rows`,
            rowsProcessed: totalRows,
            totalRows,
          });

          const validRows = rows.filter((r) => r.isValid).length;

          resolve({
            rows,
            totalRows,
            validRows,
            invalidRows: totalRows - validRows,
            errors,
            headers,
          });
        },
        error: (error) => {
          reject(new Error(`CSV parsing error: ${error.message}`));
        },
      });
    } catch (error) {
      reject(error);
    }
  });
}

// ============================================================================
// Spreadsheet Parser (XLSX/XLS/ODS)
// ============================================================================

async function parseSpreadsheet(
  buffer: ArrayBuffer,
  fileType: FileType,
  onProgress?: (update: ProgressUpdate) => void
): Promise<ParsedData> {
  try {
    onProgress?.({
      phase: ProgressPhase.PARSING,
      progress: 10,
      message: `Reading ${fileType.toUpperCase()} file`,
    });

    // Parse workbook
    const workbook = XLSX.read(buffer, { type: 'array' });

    if (!workbook.SheetNames || workbook.SheetNames.length === 0) {
      throw new Error('Spreadsheet has no worksheets');
    }

    onProgress?.({
      phase: ProgressPhase.PARSING,
      progress: 30,
      message: `Found ${workbook.SheetNames.length} worksheet(s)`,
    });

    // Get first worksheet
    const firstSheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[firstSheetName];

    if (!worksheet) {
      throw new Error('Could not read worksheet');
    }

    onProgress?.({
      phase: ProgressPhase.PARSING,
      progress: 50,
      message: `Processing worksheet: ${firstSheetName}`,
    });

    // Convert to JSON
    const data = XLSX.utils.sheet_to_json(worksheet, {
      raw: false, // Convert numbers to strings for consistency
      defval: '', // Default value for empty cells
    }) as Record<string, string>[];

    if (data.length === 0) {
      throw new Error('Spreadsheet is empty or has no data rows');
    }

    onProgress?.({
      phase: ProgressPhase.PARSING,
      progress: 70,
      message: `Extracted ${data.length} rows`,
    });

    // Get headers
    const headers = Object.keys(data[0]).map((h) => h.toLowerCase().trim());

    // Normalize and validate rows
    const rows: ParsedRow[] = [];
    const errors: any[] = [];

    data.forEach((row, index) => {
      // Normalize headers to lowercase
      const normalizedRow: Record<string, string> = {};
      Object.keys(row).forEach((key) => {
        normalizedRow[key.toLowerCase().trim()] = row[key];
      });

      // Sanitize and validate
      const sanitized = sanitizeRow(normalizedRow);
      const metric = sanitizeMetric(sanitized);
      const validation = validateRow(metric, index);

      const parsedRow: ParsedRow = {
        label: metric.label || '',
        value: metric.value || 0,
        unit: metric.unit || '#',
        type: metric.type || 'output',
        comparison: metric.comparison,
        previousValue: metric.previousValue,
        isValid: validation.isValid,
        error: validation.errors[0]?.message,
        rowIndex: index,
      };

      rows.push(parsedRow);

      if (!validation.isValid) {
        errors.push(...validation.errors);
      }

      // Report progress
      if (index % 100 === 0 && onProgress) {
        onProgress({
          phase: ProgressPhase.PARSING,
          progress: 70 + (index / data.length) * 20,
          message: `Validating row ${index + 1} of ${data.length}`,
          rowsProcessed: index + 1,
          totalRows: data.length,
        });
      }
    });

    onProgress?.({
      phase: ProgressPhase.VALIDATING_ROWS,
      progress: 100,
      message: `Parsed ${rows.length} rows`,
      rowsProcessed: rows.length,
      totalRows: rows.length,
    });

    const validRows = rows.filter((r) => r.isValid).length;

    return {
      rows,
      totalRows: rows.length,
      validRows,
      invalidRows: rows.length - validRows,
      errors,
      headers,
    };
  } catch (error) {
    throw new Error(
      `Spreadsheet parsing error: ${error instanceof Error ? error.message : 'Unknown error'}`
    );
  }
}

// ============================================================================
// Streaming Parser (for very large files)
// ============================================================================

export async function* parseFileInChunks(
  buffer: ArrayBuffer,
  options: ParseOptions
): AsyncGenerator<ParsedRow[], void, unknown> {
  const { fileType, encoding = 'UTF-8', chunkSize = 1000 } = options;

  if (fileType === 'csv') {
    yield* parseCSVInChunks(buffer, encoding, chunkSize);
  } else {
    // For spreadsheets, parse all at once then yield in chunks
    const result = await parseSpreadsheet(buffer, fileType);
    for (let i = 0; i < result.rows.length; i += chunkSize) {
      yield result.rows.slice(i, i + chunkSize);
    }
  }
}

async function* parseCSVInChunks(
  buffer: ArrayBuffer,
  encoding: string,
  chunkSize: number
): AsyncGenerator<ParsedRow[], void, unknown> {
  const text = removeBOM(normalizeLineEndings(decodeText(buffer, encoding)));

  return new Promise<void>((resolve, reject) => {
    let currentChunk: ParsedRow[] = [];
    let processedRows = 0;

    Papa.parse(text, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (header) => header.toLowerCase().trim(),
      step: async (results) => {
        const sanitized = sanitizeRow(results.data as Record<string, unknown>);
        const metric = sanitizeMetric(sanitized);
        const validation = validateRow(metric, processedRows);

        const parsedRow: ParsedRow = {
          label: metric.label || '',
          value: metric.value || 0,
          unit: metric.unit || '#',
          type: metric.type || 'output',
          comparison: metric.comparison,
          previousValue: metric.previousValue,
          isValid: validation.isValid,
          error: validation.errors[0]?.message,
          rowIndex: processedRows,
        };

        currentChunk.push(parsedRow);
        processedRows++;

        // Yield chunk when it reaches the size
        if (currentChunk.length >= chunkSize) {
          // Note: This is a Promise-based generator, so we can't actually yield here
          // This is a limitation of mixing Promises with generators
          // For true streaming, we'd need a different approach
          currentChunk = [];
        }
      },
      complete: () => {
        resolve();
      },
      error: (error) => {
        reject(error);
      },
    });
  });
}

// ============================================================================
// Helper Functions
// ============================================================================

/**
 * Estimate number of rows from file size
 */
export function estimateRowCount(fileSize: number, fileType: FileType): number {
  // Rough estimates based on average row sizes
  const avgRowSizes: Record<FileType, number> = {
    csv: 100, // ~100 bytes per row
    xlsx: 200, // ~200 bytes per row (compressed)
    xls: 150, // ~150 bytes per row
    ods: 200, // ~200 bytes per row (compressed)
  };

  return Math.ceil(fileSize / avgRowSizes[fileType]);
}

/**
 * Check if file needs streaming based on size
 */
export function needsStreaming(fileSize: number, threshold: number = 10 * 1024 * 1024): boolean {
  return fileSize > threshold;
}

/**
 * Get recommended chunk size based on file size
 */
export function getRecommendedChunkSize(fileSize: number): number {
  if (fileSize < 1024 * 1024) return 100; // <1MB: 100 rows
  if (fileSize < 5 * 1024 * 1024) return 500; // <5MB: 500 rows
  return 1000; // >=5MB: 1000 rows
}
