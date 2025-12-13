/**
 * Type definitions for the enterprise-grade file upload system
 */

import { Metric } from "@/lib/mockData";

// ============================================================================
// File Types
// ============================================================================

export type FileType = 'csv' | 'xlsx' | 'xls' | 'ods';

export type SupportedMimeType =
  | 'text/csv'
  | 'application/vnd.ms-excel' // .xls
  | 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' // .xlsx
  | 'application/vnd.oasis.opendocument.spreadsheet'; // .ods

export type SupportedExtension = 'csv' | 'xls' | 'xlsx' | 'ods';

// ============================================================================
// File Validation
// ============================================================================

export interface FileMetadata {
  name: string;
  size: number;
  type: string;
  lastModified: number;
  detectedMime?: string | null;
  detectedExtension?: string | null;
  encoding?: string;
}

export interface FileTypeResult {
  isValid: boolean;
  detectedMime: string | null;
  extension: string | null;
  mimeType: string;
  errors: string[];
  warnings: string[];
}

export interface FileSizeValidation {
  isValid: boolean;
  error: string | null;
  needsWarning: boolean;
  warning?: string;
}

// ============================================================================
// Parsing
// ============================================================================

export interface ParsedRow {
  label: string;
  value: number;
  unit: Metric['unit'];
  type: Metric['type'];
  comparison?: string;
  previousValue?: number;
  isValid: boolean;
  error?: string;
  rowIndex?: number;
}

export interface ParsedData {
  rows: ParsedRow[];
  totalRows: number;
  validRows: number;
  invalidRows: number;
  errors: ValidationError[];
  headers: string[];
}

export interface ParsingStrategy {
  useWorker: boolean;
  useStreaming: boolean;
  chunkSize: number;
}

// ============================================================================
// Validation
// ============================================================================

export enum ErrorCode {
  // File-level errors
  FILE_TOO_LARGE = 'FILE_TOO_LARGE',
  INVALID_FILE_TYPE = 'INVALID_FILE_TYPE',
  FILE_CORRUPTED = 'FILE_CORRUPTED',
  ENCODING_ERROR = 'ENCODING_ERROR',

  // Structure errors
  MISSING_HEADERS = 'MISSING_HEADERS',
  INVALID_HEADERS = 'INVALID_HEADERS',
  EMPTY_FILE = 'EMPTY_FILE',

  // Row-level errors
  MISSING_REQUIRED_FIELD = 'MISSING_REQUIRED_FIELD',
  INVALID_DATA_TYPE = 'INVALID_DATA_TYPE',
  VALUE_OUT_OF_RANGE = 'VALUE_OUT_OF_RANGE',
  INVALID_ENUM_VALUE = 'INVALID_ENUM_VALUE',

  // Server errors
  UNAUTHORIZED = 'UNAUTHORIZED',
  RATE_LIMIT_EXCEEDED = 'RATE_LIMIT_EXCEEDED',
  SERVER_ERROR = 'SERVER_ERROR',
}

export type ValidationSeverity = 'error' | 'warning';

export interface ValidationError {
  code: ErrorCode;
  message: string;
  field?: string;
  row?: number;
  severity: ValidationSeverity;
  suggestion?: string;
  rawData?: unknown;
}

export interface ValidationResult {
  isValid: boolean;
  data: Metric | null;
  errors: ValidationError[];
}

// ============================================================================
// Column Mapping
// ============================================================================

export interface ColumnMapping {
  source: string; // Column name from file
  target: keyof Metric | 'unmapped'; // Target field in Metric
  confidence: number; // Auto-mapping confidence (0-1)
  isRequired: boolean;
}

export interface ColumnMappingResult {
  mappings: ColumnMapping[];
  isValid: boolean; // All required fields mapped
  needsManualMapping: boolean; // Low confidence, show UI
}

// ============================================================================
// Upload Progress
// ============================================================================

export enum ProgressPhase {
  IDLE = 'idle',
  SELECTING = 'selecting',
  VALIDATING_FILE = 'validating_file',
  DETECTING_ENCODING = 'detecting_encoding',
  PARSING = 'parsing',
  VALIDATING_ROWS = 'validating_rows',
  MAPPING_COLUMNS = 'mapping_columns',
  PREVIEWING = 'previewing',
  UPLOADING = 'uploading',
  COMPLETE = 'complete',
  ERROR = 'error',
}

export interface ProgressUpdate {
  phase: ProgressPhase;
  progress: number; // 0-100
  message: string;
  rowsProcessed?: number;
  totalRows?: number;
}

export interface UploadProgress {
  phase: ProgressPhase;
  progress: number;
  message: string;
  currentStep?: number;
  totalSteps?: number;
}

// ============================================================================
// Upload State
// ============================================================================

export type UploadStep = 'upload' | 'mapping' | 'preview' | 'importing';

export interface FileUploadState {
  step: UploadStep;
  file: File | null;
  fileMetadata: FileMetadata | null;
  parsedData: ParsedData | null;
  columnMapping: ColumnMappingResult | null;
  validationErrors: ValidationError[];
  progress: UploadProgress;
  serverValidationResult: ServerValidationResult | null;
}

// ============================================================================
// Server Validation
// ============================================================================

export interface ServerValidationResult {
  success: boolean;
  validatedMetrics?: Metric[];
  count?: number;
  error?: string;
  validationErrors?: Array<{
    row: number;
    errors: string[];
  }>;
}

export interface ServerValidationRequest {
  organizationId: string;
  metrics: Omit<Metric, 'id'>[];
  fileName: string;
  userId: string;
}

// ============================================================================
// Web Worker Messages
// ============================================================================

export interface WorkerParseMessage {
  type: 'parse';
  payload: {
    file: ArrayBuffer;
    fileName: string;
    fileType: FileType;
    encoding: string;
  };
}

export interface WorkerProgressMessage {
  type: 'progress';
  payload: ProgressUpdate;
}

export interface WorkerCompleteMessage {
  type: 'complete';
  payload: {
    data: ParsedData;
  };
}

export interface WorkerErrorMessage {
  type: 'error';
  payload: {
    error: string;
    details?: unknown;
  };
}

export interface WorkerCancelMessage {
  type: 'cancel';
}

export type WorkerMessage =
  | WorkerParseMessage
  | WorkerCancelMessage;

export type WorkerResponse =
  | WorkerProgressMessage
  | WorkerCompleteMessage
  | WorkerErrorMessage;

// ============================================================================
// Component Props
// ============================================================================

export interface FileUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (metrics: Omit<Metric, 'id'>[]) => void;
}

export interface FileDropzoneProps {
  onFileSelect: (file: File) => void;
  accept?: string;
  maxSize?: number;
  disabled?: boolean;
}

export interface FilePreviewTableProps {
  data: ParsedRow[];
  onRowClick?: (row: ParsedRow, index: number) => void;
}

export interface ColumnMappingDialogProps {
  open: boolean;
  headers: string[];
  autoMappings: ColumnMapping[];
  onMappingComplete: (mappings: ColumnMapping[]) => void;
  onCancel: () => void;
}

export interface ValidationErrorListProps {
  errors: ValidationError[];
  totalRows: number;
}

export interface UploadProgressIndicatorProps {
  progress: UploadProgress;
  currentStep?: number;
  totalSteps?: number;
}

// ============================================================================
// Constants
// ============================================================================

export const ALLOWED_MIME_TYPES: readonly SupportedMimeType[] = [
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  'application/vnd.oasis.opendocument.spreadsheet',
] as const;

export const ALLOWED_EXTENSIONS: readonly SupportedExtension[] = [
  'csv',
  'xls',
  'xlsx',
  'ods',
] as const;

export const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
export const LARGE_FILE_THRESHOLD = 5 * 1024 * 1024; // 5MB
export const WORKER_THRESHOLD_SIZE = 5 * 1024 * 1024; // 5MB
export const STREAMING_THRESHOLD_SIZE = 10 * 1024 * 1024; // 10MB
export const DEFAULT_CHUNK_SIZE = 1000; // rows
export const MAX_ROWS = 10000; // Hard limit

// Required Metric fields for validation
export const REQUIRED_FIELDS: readonly (keyof Metric)[] = [
  'label',
  'value',
] as const;

export const OPTIONAL_FIELDS: readonly (keyof Metric)[] = [
  'unit',
  'type',
  'comparison',
  'previousValue',
] as const;
