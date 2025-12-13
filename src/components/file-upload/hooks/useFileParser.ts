/**
 * React hook for file parsing with Web Worker support
 * Automatically chooses between main thread and worker based on file size
 */

import { useState, useEffect, useRef, useCallback } from 'react';
import { parseFile } from '../lib/fileParsers';
import type {
  ParsedData,
  ProgressUpdate,
  FileType,
  WorkerMessage,
  WorkerResponse,
} from '../lib/fileUploadTypes';
import {
  WORKER_THRESHOLD_SIZE,
  STREAMING_THRESHOLD_SIZE,
  DEFAULT_CHUNK_SIZE,
} from '../lib/fileUploadTypes';
import { getRecommendedChunkSize } from '../lib/fileParsers';

interface UseFileParserOptions {
  onProgress?: (update: ProgressUpdate) => void;
  onComplete?: (data: ParsedData) => void;
  onError?: (error: Error) => void;
}

interface ParsingStrategy {
  useWorker: boolean;
  useStreaming: boolean;
  chunkSize: number;
}

export function useFileParser(options: UseFileParserOptions = {}) {
  const { onProgress, onComplete, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState<ProgressUpdate | null>(null);
  const [error, setError] = useState<Error | null>(null);
  const [data, setData] = useState<ParsedData | null>(null);

  const workerRef = useRef<Worker | null>(null);
  const isParsingRef = useRef(false);

  // Cleanup worker on unmount
  useEffect(() => {
    return () => {
      if (workerRef.current) {
        // Send cancel message
        const message: WorkerMessage = { type: 'cancel' };
        workerRef.current.postMessage(message);

        // Terminate worker
        workerRef.current.terminate();
        workerRef.current = null;
      }
    };
  }, []);

  /**
   * Determine parsing strategy based on file size
   */
  const determineStrategy = useCallback((fileSize: number): ParsingStrategy => {
    return {
      useWorker: fileSize >= WORKER_THRESHOLD_SIZE,
      useStreaming: fileSize >= STREAMING_THRESHOLD_SIZE,
      chunkSize: getRecommendedChunkSize(fileSize),
    };
  }, []);

  /**
   * Parse file in Web Worker
   */
  const parseInWorker = useCallback(
    async (file: File, fileType: FileType, encoding: string): Promise<ParsedData> => {
      return new Promise((resolve, reject) => {
        // Create worker if not exists
        if (!workerRef.current) {
          workerRef.current = new Worker(
            new URL('../workers/fileParser.worker.ts', import.meta.url),
            { type: 'module' }
          );
        }

        const worker = workerRef.current;

        // Handle worker messages
        const handleMessage = (e: MessageEvent<WorkerResponse>) => {
          const { type, payload } = e.data;

          switch (type) {
            case 'progress':
              setProgress(payload);
              onProgress?.(payload);
              break;

            case 'complete':
              setProgress(null);
              setIsLoading(false);
              setData(payload.data);
              isParsingRef.current = false;
              resolve(payload.data);
              onComplete?.(payload.data);
              break;

            case 'error':
              const error = new Error(payload.error);
              setError(error);
              setIsLoading(false);
              setProgress(null);
              isParsingRef.current = false;
              reject(error);
              onError?.(error);
              break;
          }
        };

        worker.addEventListener('message', handleMessage);

        // Read file as ArrayBuffer
        const reader = new FileReader();

        reader.onload = (e) => {
          const buffer = e.target?.result as ArrayBuffer;

          if (!buffer) {
            const error = new Error('Failed to read file');
            setError(error);
            setIsLoading(false);
            reject(error);
            return;
          }

          // Send parse message to worker
          const message: WorkerMessage = {
            type: 'parse',
            payload: {
              file: buffer,
              fileName: file.name,
              fileType,
              encoding,
            },
          };

          worker.postMessage(message);
        };

        reader.onerror = () => {
          const error = new Error('Failed to read file');
          setError(error);
          setIsLoading(false);
          reject(error);
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [onProgress, onComplete, onError]
  );

  /**
   * Parse file on main thread (for small files)
   */
  const parseOnMainThread = useCallback(
    async (file: File, fileType: FileType, encoding: string): Promise<ParsedData> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();

        reader.onload = async (e) => {
          try {
            const buffer = e.target?.result as ArrayBuffer;

            if (!buffer) {
              throw new Error('Failed to read file');
            }

            const result = await parseFile(buffer, {
              fileName: file.name,
              fileType,
              encoding,
              onProgress: (update) => {
                setProgress(update);
                onProgress?.(update);
              },
            });

            setData(result);
            setIsLoading(false);
            setProgress(null);
            isParsingRef.current = false;
            resolve(result);
            onComplete?.(result);
          } catch (error) {
            const err = error instanceof Error ? error : new Error('Parsing failed');
            setError(err);
            setIsLoading(false);
            setProgress(null);
            isParsingRef.current = false;
            reject(err);
            onError?.(err);
          }
        };

        reader.onerror = () => {
          const error = new Error('Failed to read file');
          setError(error);
          setIsLoading(false);
          reject(error);
        };

        reader.readAsArrayBuffer(file);
      });
    },
    [onProgress, onComplete, onError]
  );

  /**
   * Main parse function - automatically chooses strategy
   */
  const parse = useCallback(
    async (file: File, fileType: FileType, encoding: string = 'UTF-8'): Promise<ParsedData> => {
      // Prevent concurrent parsing
      if (isParsingRef.current) {
        throw new Error('Parsing already in progress');
      }

      isParsingRef.current = true;
      setIsLoading(true);
      setError(null);
      setData(null);
      setProgress(null);

      try {
        const strategy = determineStrategy(file.size);

        if (strategy.useWorker) {
          console.log('Parsing with Web Worker (file size:', file.size, 'bytes)');
          return await parseInWorker(file, fileType, encoding);
        } else {
          console.log('Parsing on main thread (file size:', file.size, 'bytes)');
          return await parseOnMainThread(file, fileType, encoding);
        }
      } catch (error) {
        isParsingRef.current = false;
        throw error;
      }
    },
    [determineStrategy, parseInWorker, parseOnMainThread]
  );

  /**
   * Cancel ongoing parsing
   */
  const cancel = useCallback(() => {
    if (workerRef.current && isParsingRef.current) {
      const message: WorkerMessage = { type: 'cancel' };
      workerRef.current.postMessage(message);
      isParsingRef.current = false;
      setIsLoading(false);
      setProgress(null);
    }
  }, []);

  /**
   * Reset state
   */
  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(null);
    setError(null);
    setData(null);
    isParsingRef.current = false;
  }, []);

  return {
    parse,
    cancel,
    reset,
    isLoading,
    progress,
    error,
    data,
    isParsing: isParsingRef.current,
  };
}
