/**
 * Main file upload modal - orchestrates the entire upload workflow
 * Multi-step wizard with validation, preview, and progress tracking
 */

import { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { FileDropzone } from './FileDropzone';
import { UploadProgressIndicator } from './UploadProgressIndicator';
import { ValidationErrorList } from './ValidationErrorList';
import { FilePreviewTable } from './FilePreviewTable';
import { ColumnMappingDialog } from './ColumnMappingDialog';
import { useFileParser } from './hooks/useFileParser';
import { validateFileType, getFileTypeFromExtension } from './lib/fileTypeDetection';
import { detectEncoding } from './lib/encodingDetection';
import { validateHeaders } from './lib/fileValidation';
import { autoMapColumns, applyColumnMapping } from './lib/columnMapping';
import type {
  FileUploadModalProps,
  UploadStep,
  FileMetadata,
  ColumnMappingResult,
  ProgressPhase,
} from './lib/fileUploadTypes';
import { MAX_FILE_SIZE } from './lib/fileUploadTypes';

export function FileUploadModal({ open, onOpenChange, onImport }: FileUploadModalProps) {
  const [step, setStep] = useState<UploadStep>('upload');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [fileMetadata, setFileMetadata] = useState<FileMetadata | null>(null);
  const [columnMapping, setColumnMapping] = useState<ColumnMappingResult | null>(null);
  const [showMappingDialog, setShowMappingDialog] = useState(false);

  const { parse, isLoading, progress, error, data, reset } = useFileParser({
    onError: (err) => {
      toast.error(`Parsing failed: ${err.message}`);
    },
  });

  // Reset state when modal closes
  useEffect(() => {
    if (!open) {
      setStep('upload');
      setSelectedFile(null);
      setFileMetadata(null);
      setColumnMapping(null);
      setShowMappingDialog(false);
      reset();
    }
  }, [open, reset]);

  // Handle file selection
  const handleFileSelect = useCallback(
    async (file: File) => {
      try {
        // Validate file size
        if (file.size === 0) {
          toast.error('File is empty');
          return;
        }

        if (file.size > MAX_FILE_SIZE) {
          toast.error(`File too large. Maximum size is ${Math.round(MAX_FILE_SIZE / 1024 / 1024)}MB`);
          return;
        }

        // Validate file type
        const typeValidation = await validateFileType(file);

        if (!typeValidation.isValid) {
          toast.error(typeValidation.errors[0] || 'Invalid file type');
          return;
        }

        // Show warnings if any
        typeValidation.warnings.forEach((warning) => {
          toast.warning(warning);
        });

        // Detect encoding
        const encoding = await detectEncoding(file);

        // Get file type
        const fileType = getFileTypeFromExtension(file.name);
        if (!fileType) {
          toast.error('Could not determine file type');
          return;
        }

        // Store file metadata
        const metadata: FileMetadata = {
          name: file.name,
          size: file.size,
          type: file.type,
          lastModified: file.lastModified,
          detectedMime: typeValidation.detectedMime,
          encoding,
        };

        setSelectedFile(file);
        setFileMetadata(metadata);

        // Start parsing
        const result = await parse(file, fileType, encoding);

        if (result) {
          // Validate headers
          const headerValidation = validateHeaders(result.headers);

          if (!headerValidation.isValid) {
            toast.error(headerValidation.errors[0]?.message || 'Missing required columns');
            return;
          }

          // Auto-map columns
          const mappingResult = autoMapColumns(result.headers);
          setColumnMapping(mappingResult);

          // If mapping needs manual intervention, show dialog
          if (mappingResult.needsManualMapping) {
            setShowMappingDialog(true);
          } else {
            // Proceed to preview
            setStep('preview');
          }
        }
      } catch (err) {
        console.error('File selection error:', err);
        toast.error(err instanceof Error ? err.message : 'File processing failed');
      }
    },
    [parse]
  );

  // Handle column mapping completion
  const handleMappingComplete = useCallback((mappings) => {
    setColumnMapping({ mappings, isValid: true, needsManualMapping: false });
    setShowMappingDialog(false);
    setStep('preview');
  }, []);

  // Handle import
  const handleImport = useCallback(() => {
    if (!data || !columnMapping) {
      toast.error('No data to import');
      return;
    }

    // Filter valid rows only
    const validRows = data.rows.filter((row) => row.isValid);

    if (validRows.length === 0) {
      toast.error('No valid rows to import');
      return;
    }

    // Map rows using column mappings
    const mappedRows = validRows.map((row) => {
      const rowData = applyColumnMapping(row as unknown as Record<string, unknown>, columnMapping.mappings);
      return {
        label: String(rowData.label || row.label),
        value: Number(rowData.value || row.value),
        unit: (rowData.unit || row.unit) as any,
        type: (rowData.type || row.type) as any,
        comparison: rowData.comparison as string | undefined,
        previousValue: rowData.previousValue as number | undefined,
      };
    });

    // Call onImport callback
    onImport(mappedRows);

    // Show success message
    toast.success(`Successfully imported ${validRows.length} metrics`);

    // Close modal
    onOpenChange(false);
  }, [data, columnMapping, onImport, onOpenChange]);

  // Handle back button
  const handleBack = () => {
    if (step === 'preview') {
      setStep('upload');
      reset();
      setSelectedFile(null);
      setFileMetadata(null);
      setColumnMapping(null);
    }
  };

  // Get step number for progress
  const getStepNumber = () => {
    const steps = { upload: 1, mapping: 2, preview: 2, importing: 3 };
    return steps[step];
  };

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              Import Metrics from File
            </DialogTitle>
            <DialogDescription>
              Upload a spreadsheet to import multiple metrics at once.
              Step {getStepNumber()} of 3.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Step 1: File Upload */}
            {step === 'upload' && !isLoading && (
              <FileDropzone onFileSelect={handleFileSelect} />
            )}

            {/* Loading/Progress */}
            {isLoading && progress && (
              <UploadProgressIndicator
                progress={progress}
                currentStep={getStepNumber()}
                totalSteps={3}
              />
            )}

            {/* Error State */}
            {error && (
              <div className="rounded-lg border border-red-200 bg-red-50 p-4">
                <p className="text-sm font-medium text-red-700">
                  Error: {error.message}
                </p>
              </div>
            )}

            {/* Step 2: Preview & Validate */}
            {step === 'preview' && data && (
              <div className="space-y-4">
                {/* File Info */}
                <div className="rounded-lg bg-muted/30 p-3">
                  <p className="text-sm font-medium">{fileMetadata?.name}</p>
                  <p className="text-xs text-muted-foreground">
                    {data.totalRows} rows • {data.validRows} valid • {data.invalidRows} invalid
                  </p>
                </div>

                {/* Validation Errors */}
                {data.errors.length > 0 && (
                  <ValidationErrorList errors={data.errors} totalRows={data.totalRows} />
                )}

                {/* Preview Table */}
                <div>
                  <h3 className="text-sm font-medium mb-2">Data Preview</h3>
                  <FilePreviewTable data={data.rows.slice(0, 100)} />
                  {data.rows.length > 100 && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Showing first 100 rows of {data.rows.length}
                    </p>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Actions */}
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                if (step === 'preview') {
                  handleBack();
                } else {
                  onOpenChange(false);
                }
              }}
              disabled={isLoading}
            >
              {step === 'preview' ? 'Back' : 'Cancel'}
            </Button>

            {step === 'preview' && data && (
              <Button
                onClick={handleImport}
                disabled={data.validRows === 0 || isLoading}
              >
                Import {data.validRows} {data.validRows === 1 ? 'Metric' : 'Metrics'}
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Column Mapping Dialog */}
      {columnMapping && (
        <ColumnMappingDialog
          open={showMappingDialog}
          headers={data?.headers || []}
          autoMappings={columnMapping.mappings}
          onMappingComplete={handleMappingComplete}
          onCancel={() => {
            setShowMappingDialog(false);
            setStep('upload');
            reset();
          }}
        />
      )}
    </>
  );
}
