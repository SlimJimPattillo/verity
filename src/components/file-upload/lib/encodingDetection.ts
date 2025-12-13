/**
 * Character encoding detection for CSV files
 * Handles international characters and BOM markers
 */

/**
 * Detect character encoding from file buffer
 * Uses simple heuristics for browser compatibility
 */
export async function detectEncoding(file: File): Promise<string> {
  try {
    // Read first chunk of file for BOM detection
    const buffer = await file.slice(0, 4).arrayBuffer();
    const bytes = new Uint8Array(buffer);

    // Check for BOM (Byte Order Mark)
    const bom = detectBOM(bytes);
    if (bom) {
      return bom;
    }

    // For CSV files, try to detect common encodings
    // Read more of the file for better detection
    const sampleBuffer = await file.slice(0, 8192).arrayBuffer();
    const sampleBytes = new Uint8Array(sampleBuffer);

    return detectEncodingFromSample(sampleBytes);
  } catch (error) {
    console.warn('Encoding detection failed, defaulting to UTF-8:', error);
    return 'UTF-8';
  }
}

/**
 * Detect BOM (Byte Order Mark)
 */
function detectBOM(bytes: Uint8Array): string | null {
  // UTF-8 BOM: EF BB BF
  if (bytes[0] === 0xef && bytes[1] === 0xbb && bytes[2] === 0xbf) {
    return 'UTF-8';
  }

  // UTF-16 LE BOM: FF FE
  if (bytes[0] === 0xff && bytes[1] === 0xfe) {
    return 'UTF-16LE';
  }

  // UTF-16 BE BOM: FE FF
  if (bytes[0] === 0xfe && bytes[1] === 0xff) {
    return 'UTF-16BE';
  }

  // UTF-32 LE BOM: FF FE 00 00
  if (bytes[0] === 0xff && bytes[1] === 0xfe && bytes[2] === 0x00 && bytes[3] === 0x00) {
    return 'UTF-32LE';
  }

  // UTF-32 BE BOM: 00 00 FE FF
  if (bytes[0] === 0x00 && bytes[1] === 0x00 && bytes[2] === 0xfe && bytes[3] === 0xff) {
    return 'UTF-32BE';
  }

  return null;
}

/**
 * Detect encoding from sample bytes using heuristics
 */
function detectEncodingFromSample(bytes: Uint8Array): string {
  // Check if it's pure ASCII (all bytes < 128)
  const isAscii = bytes.every((byte) => byte < 128);
  if (isAscii) {
    return 'UTF-8'; // ASCII is valid UTF-8
  }

  // Check for UTF-8 patterns
  if (isLikelyUTF8(bytes)) {
    return 'UTF-8';
  }

  // Check for Windows-1252 (common in Excel exports)
  if (hasWindows1252Markers(bytes)) {
    return 'Windows-1252';
  }

  // Check for ISO-8859-1 (Latin-1)
  if (hasLatin1Markers(bytes)) {
    return 'ISO-8859-1';
  }

  // Default to UTF-8
  return 'UTF-8';
}

/**
 * Check if bytes follow UTF-8 patterns
 */
function isLikelyUTF8(bytes: Uint8Array): boolean {
  let validSequences = 0;
  let invalidSequences = 0;

  for (let i = 0; i < bytes.length; i++) {
    const byte = bytes[i];

    // 1-byte sequence (0xxxxxxx)
    if (byte < 0x80) {
      continue;
    }

    // 2-byte sequence (110xxxxx 10xxxxxx)
    if ((byte & 0xe0) === 0xc0) {
      if (i + 1 < bytes.length && (bytes[i + 1] & 0xc0) === 0x80) {
        validSequences++;
        i += 1;
      } else {
        invalidSequences++;
      }
      continue;
    }

    // 3-byte sequence (1110xxxx 10xxxxxx 10xxxxxx)
    if ((byte & 0xf0) === 0xe0) {
      if (
        i + 2 < bytes.length &&
        (bytes[i + 1] & 0xc0) === 0x80 &&
        (bytes[i + 2] & 0xc0) === 0x80
      ) {
        validSequences++;
        i += 2;
      } else {
        invalidSequences++;
      }
      continue;
    }

    // 4-byte sequence (11110xxx 10xxxxxx 10xxxxxx 10xxxxxx)
    if ((byte & 0xf8) === 0xf0) {
      if (
        i + 3 < bytes.length &&
        (bytes[i + 1] & 0xc0) === 0x80 &&
        (bytes[i + 2] & 0xc0) === 0x80 &&
        (bytes[i + 3] & 0xc0) === 0x80
      ) {
        validSequences++;
        i += 3;
      } else {
        invalidSequences++;
      }
      continue;
    }

    // Invalid UTF-8 byte
    invalidSequences++;
  }

  // If we have valid sequences and few invalid ones, likely UTF-8
  return validSequences > 0 && invalidSequences < validSequences / 10;
}

/**
 * Check for Windows-1252 specific characters
 */
function hasWindows1252Markers(bytes: Uint8Array): boolean {
  // Windows-1252 specific code points (128-159)
  const windows1252Specific = [
    0x80, 0x82, 0x83, 0x84, 0x85, 0x86, 0x87, 0x88, 0x89, 0x8a, 0x8b, 0x8c, 0x8e, 0x91, 0x92,
    0x93, 0x94, 0x95, 0x96, 0x97, 0x98, 0x99, 0x9a, 0x9b, 0x9c, 0x9e, 0x9f,
  ];

  return bytes.some((byte) => windows1252Specific.includes(byte));
}

/**
 * Check for ISO-8859-1 (Latin-1) markers
 */
function hasLatin1Markers(bytes: Uint8Array): boolean {
  // ISO-8859-1 uses full 8-bit range
  // Check for common Latin-1 accented characters (192-255)
  let accentedCount = 0;

  for (const byte of bytes) {
    if (byte >= 192 && byte <= 255) {
      accentedCount++;
    }
  }

  // If we have a decent amount of accented characters, likely Latin-1
  return accentedCount > bytes.length / 100; // >1% accented chars
}

/**
 * Decode text with specified encoding
 */
export function decodeText(buffer: ArrayBuffer, encoding: string): string {
  try {
    const decoder = new TextDecoder(encoding);
    return decoder.decode(buffer);
  } catch (error) {
    // Fallback to UTF-8 if encoding not supported
    console.warn(`Encoding ${encoding} not supported, falling back to UTF-8`);
    const decoder = new TextDecoder('UTF-8');
    return decoder.decode(buffer);
  }
}

/**
 * Remove BOM from text if present
 */
export function removeBOM(text: string): string {
  // UTF-8 BOM: \uFEFF
  if (text.charCodeAt(0) === 0xfeff) {
    return text.slice(1);
  }
  return text;
}

/**
 * Normalize line endings to \n
 */
export function normalizeLineEndings(text: string): string {
  // Convert \r\n (Windows) and \r (Mac) to \n (Unix)
  return text.replace(/\r\n/g, '\n').replace(/\r/g, '\n');
}

/**
 * Get list of supported encodings
 */
export function getSupportedEncodings(): string[] {
  return [
    'UTF-8',
    'UTF-16LE',
    'UTF-16BE',
    'Windows-1252',
    'ISO-8859-1',
    'ISO-8859-2',
    'ISO-8859-15',
  ];
}

/**
 * Validate encoding name
 */
export function isValidEncoding(encoding: string): boolean {
  try {
    new TextDecoder(encoding);
    return true;
  } catch {
    return false;
  }
}
