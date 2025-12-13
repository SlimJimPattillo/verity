/**
 * Accessible drag-and-drop file upload zone
 * Full keyboard navigation and screen reader support
 */

import { useState, useRef, useCallback } from 'react';
import { Upload, FileSpreadsheet, Download } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import type { FileDropzoneProps } from './lib/fileUploadTypes';
import { ALLOWED_EXTENSIONS, MAX_FILE_SIZE } from './lib/fileUploadTypes';
import { formatBytes } from './lib/fileTypeDetection';

const SAMPLE_CSV = `label,value,unit,type,comparison,previousValue
Meals Served,5000,#,output,+19% vs last year,4200
Hunger Reduction,15,%,outcome,across service area,8
Families Assisted,1250,People,output,,
Operating Efficiency,88,%,output,,`;

export function FileDropzone({
  onFileSelect,
  accept = '.csv,.xlsx,.xls,.ods',
  maxSize = MAX_FILE_SIZE,
  disabled = false,
}: FileDropzoneProps) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setIsDragging(false);

      if (disabled) return;

      const file = e.dataTransfer.files[0];
      if (file) {
        onFileSelect(file);
      }
    },
    [onFileSelect, disabled]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    if (!disabled) {
      setIsDragging(true);
    }
  }, [disabled]);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
    // Reset input value to allow selecting the same file again
    e.target.value = '';
  };

  const handleClick = () => {
    if (!disabled) {
      fileInputRef.current?.click();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === 'Enter' || e.key === ' ') && !disabled) {
      e.preventDefault();
      fileInputRef.current?.click();
    }
  };

  const downloadSample = (e: React.MouseEvent) => {
    e.stopPropagation();
    const blob = new Blob([SAMPLE_CSV], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sample-metrics.csv';
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      {/* Drop Zone */}
      <div
        role="button"
        tabIndex={disabled ? -1 : 0}
        aria-label={`Upload file. Drag and drop or press Enter to browse. Supported formats: ${ALLOWED_EXTENSIONS.join(', ')}. Maximum size: ${formatBytes(maxSize)}`}
        aria-describedby="file-dropzone-instructions"
        aria-disabled={disabled}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={handleClick}
        onKeyDown={handleKeyDown}
        className={cn(
          'relative flex flex-col items-center justify-center',
          'rounded-xl border-2 border-dashed p-8 transition-all',
          'focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2',
          disabled
            ? 'cursor-not-allowed opacity-50'
            : 'cursor-pointer hover:border-muted-foreground/50',
          isDragging
            ? 'border-primary bg-primary/5'
            : 'border-border bg-muted/30'
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept={accept}
          onChange={handleInputChange}
          disabled={disabled}
          className="absolute inset-0 cursor-pointer opacity-0"
          aria-hidden="true"
        />

        <div
          id="file-dropzone-instructions"
          className="sr-only"
        >
          Drag and drop a CSV, Excel (XLSX, XLS), or ODS file here, or press
          Enter to open file browser. Maximum file size: {formatBytes(maxSize)}
        </div>

        <div
          className={cn(
            'mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors',
            isDragging ? 'bg-primary/10' : 'bg-muted'
          )}
        >
          <Upload
            className={cn(
              'h-7 w-7 transition-colors',
              isDragging ? 'text-primary' : 'text-muted-foreground'
            )}
            aria-hidden="true"
          />
        </div>

        <p className="text-sm font-medium text-foreground">
          {isDragging ? 'Drop your file here' : 'Drag & drop your file'}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Supports CSV, XLSX, XLS, ODS • Max {formatBytes(maxSize)}
        </p>
      </div>

      {/* Sample Download */}
      <div className="flex items-center justify-center">
        <Button
          variant="ghost"
          size="sm"
          onClick={downloadSample}
          disabled={disabled}
          className="gap-2 text-muted-foreground hover:text-foreground"
        >
          <Download className="h-4 w-4" />
          Download sample template
        </Button>
      </div>

      {/* Format Info */}
      <div className="rounded-lg border border-border bg-muted/20 p-4">
        <div className="mb-2 flex items-center gap-2">
          <FileSpreadsheet className="h-4 w-4 text-primary" aria-hidden="true" />
          <p className="text-xs font-medium text-foreground">Required columns:</p>
        </div>
        <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
          <span>
            <code className="rounded bg-muted px-1 text-primary">label</code> — Metric name
          </span>
          <span>
            <code className="rounded bg-muted px-1 text-primary">value</code> — Number
          </span>
          <span>
            <code className="rounded bg-muted px-1 text-primary">unit</code> — #, $, %, People
          </span>
          <span>
            <code className="rounded bg-muted px-1 text-primary">type</code> — output/outcome
          </span>
        </div>
        <p className="mt-2 text-xs text-muted-foreground italic">
          Optional: comparison, previousValue
        </p>
      </div>
    </div>
  );
}
