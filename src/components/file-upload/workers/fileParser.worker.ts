/**
 * Web Worker for background file parsing
 * Keeps UI responsive during large file processing
 */

import { parseFile } from '../lib/fileParsers';
import type {
  WorkerMessage,
  WorkerResponse,
  ProgressUpdate,
} from '../lib/fileUploadTypes';

// Track current parsing operation for cancellation
let isProcessing = false;

/**
 * Handle messages from main thread
 */
self.onmessage = async (e: MessageEvent<WorkerMessage>) => {
  const { type, payload } = e.data;

  if (type === 'cancel') {
    // Cancel ongoing operation
    isProcessing = false;
    return;
  }

  if (type === 'parse') {
    isProcessing = true;

    try {
      const { file, fileName, fileType, encoding } = payload;

      // Progress callback
      const onProgress = (update: ProgressUpdate) => {
        // Check if cancelled
        if (!isProcessing) {
          throw new Error('Parsing cancelled');
        }

        // Send progress update to main thread
        const response: WorkerResponse = {
          type: 'progress',
          payload: update,
        };
        self.postMessage(response);
      };

      // Parse file
      const result = await parseFile(file, {
        fileName,
        fileType,
        encoding,
        onProgress,
      });

      // Check if cancelled before sending result
      if (!isProcessing) {
        return;
      }

      // Send completion message
      const response: WorkerResponse = {
        type: 'complete',
        payload: { data: result },
      };
      self.postMessage(response);
    } catch (error) {
      // Send error message
      const response: WorkerResponse = {
        type: 'error',
        payload: {
          error: error instanceof Error ? error.message : 'Unknown error',
          details: error,
        },
      };
      self.postMessage(response);
    } finally {
      isProcessing = false;
    }
  }
};

// Export empty object to make this a module
export {};
