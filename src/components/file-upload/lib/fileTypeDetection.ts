/**
 * File type detection using MIME types and magic numbers
 * Prevents file spoofing and validates actual file content
 */

import { fileTypeFromBuffer } from 'file-type';
import type {
  FileTypeResult,
  SupportedExtension,
  SupportedMimeType,
} from './fileUploadTypes';
import { ALLOWED_MIME_TYPES, ALLOWED_EXTENSIONS } from './fileUploadTypes';

/**
 * Validate file type using multiple layers:
 * 1. File extension check
 * 2. Declared MIME type
 * 3. Actual file content (magic numbers)
 */
export async function validateFileType(file: File): Promise<FileTypeResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  // 1. Check file extension
  const extension = getFileExtension(file.name);
  if (!extension || !ALLOWED_EXTENSIONS.includes(extension as SupportedExtension)) {
    errors.push(
      `Invalid file extension: ${extension || 'none'}. Allowed: ${ALLOWED_EXTENSIONS.join(', ')}`
    );
  }

  // 2. Check declared MIME type
  if (file.type && !ALLOWED_MIME_TYPES.includes(file.type as SupportedMimeType)) {
    warnings.push(`Declared MIME type "${file.type}" is not in allowed list`);
  }

  // 3. Check actual file content (magic numbers)
  try {
    // Read first 4KB of file for magic number detection
    const buffer = await file.slice(0, 4100).arrayBuffer();
    const detectedType = await fileTypeFromBuffer(new Uint8Array(buffer));

    if (!detectedType) {
      // Could be CSV (plain text, no magic number)
      if (extension === 'csv') {
        return {
          isValid: errors.length === 0,
          detectedMime: 'text/csv',
          extension,
          mimeType: 'text/csv',
          errors,
          warnings,
        };
      } else {
        errors.push('Could not detect file type from content');
      }
    } else {
      // Verify detected type matches allowed types
      if (!ALLOWED_MIME_TYPES.includes(detectedType.mime as SupportedMimeType)) {
        errors.push(
          `File content does not match expected type. ` +
            `Detected: ${detectedType.mime}, Expected: ${ALLOWED_MIME_TYPES.join(', ')}`
        );
      }

      // Cross-check extension and detected type
      if (extension && detectedType.ext && extension !== detectedType.ext) {
        // Allow some known aliases
        const isValidAlias = checkExtensionAlias(extension, detectedType.ext);

        if (!isValidAlias) {
          warnings.push(
            `File has .${extension} extension but content appears to be .${detectedType.ext}`
          );
        }
      }

      return {
        isValid: errors.length === 0,
        detectedMime: detectedType.mime,
        extension,
        mimeType: detectedType.mime,
        errors,
        warnings,
      };
    }

    return {
      isValid: errors.length === 0,
      detectedMime: null,
      extension,
      mimeType: file.type || 'application/octet-stream',
      errors,
      warnings,
    };
  } catch (error) {
    errors.push('Failed to validate file type');
    return {
      isValid: false,
      detectedMime: null,
      extension,
      mimeType: 'application/octet-stream',
      errors,
      warnings,
    };
  }
}

/**
 * Get file extension from filename (lowercase)
 */
function getFileExtension(filename: string): string | null {
  const parts = filename.split('.');
  if (parts.length < 2) {
    return null;
  }
  return parts[parts.length - 1].toLowerCase();
}

/**
 * Check if extension is a known alias
 * (e.g., .xlsx might be detected as .zip internally)
 */
function checkExtensionAlias(extension: string, detectedExt: string): boolean {
  const aliases: Record<string, string[]> = {
    xlsx: ['zip'], // XLSX is ZIP format internally
    xls: ['ole'], // XLS is OLE format
    ods: ['zip'], // ODS is ZIP format
  };

  const allowedAliases = aliases[extension] || [];
  return allowedAliases.includes(detectedExt);
}

/**
 * Get file type from extension
 */
export function getFileTypeFromExtension(
  filename: string
): 'csv' | 'xlsx' | 'xls' | 'ods' | null {
  const extension = getFileExtension(filename);

  switch (extension) {
    case 'csv':
      return 'csv';
    case 'xlsx':
      return 'xlsx';
    case 'xls':
      return 'xls';
    case 'ods':
      return 'ods';
    default:
      return null;
  }
}

/**
 * Check if file type is supported
 */
export function isSupportedFileType(file: File): boolean {
  const extension = getFileExtension(file.name);
  return extension !== null && ALLOWED_EXTENSIONS.includes(extension as SupportedExtension);
}

/**
 * Get human-readable file type name
 */
export function getFileTypeName(fileType: string): string {
  const names: Record<string, string> = {
    csv: 'CSV (Comma Separated Values)',
    xlsx: 'Excel Workbook (XLSX)',
    xls: 'Excel 97-2003 (XLS)',
    ods: 'OpenDocument Spreadsheet (ODS)',
  };

  return names[fileType] || fileType.toUpperCase();
}

/**
 * Format bytes to human-readable string
 */
export function formatBytes(bytes: number): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const decimals = 2;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];

  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(decimals)) + ' ' + sizes[i];
}
