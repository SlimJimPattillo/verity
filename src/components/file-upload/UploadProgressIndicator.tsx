/**
 * Multi-stage progress indicator with screen reader support
 */

import { Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Progress } from '@/components/ui/progress';
import type { UploadProgressIndicatorProps } from './lib/fileUploadTypes';
import { ProgressPhase } from './lib/fileUploadTypes';

const PHASE_LABELS: Record<ProgressPhase, string> = {
  [ProgressPhase.IDLE]: 'Ready',
  [ProgressPhase.SELECTING]: 'Selecting file',
  [ProgressPhase.VALIDATING_FILE]: 'Validating file',
  [ProgressPhase.DETECTING_ENCODING]: 'Detecting encoding',
  [ProgressPhase.PARSING]: 'Parsing data',
  [ProgressPhase.VALIDATING_ROWS]: 'Validating rows',
  [ProgressPhase.MAPPING_COLUMNS]: 'Mapping columns',
  [ProgressPhase.PREVIEWING]: 'Preview ready',
  [ProgressPhase.UPLOADING]: 'Uploading to server',
  [ProgressPhase.COMPLETE]: 'Complete',
  [ProgressPhase.ERROR]: 'Error',
};

export function UploadProgressIndicator({
  progress,
  currentStep,
  totalSteps,
}: UploadProgressIndicatorProps) {
  const isError = progress.phase === ProgressPhase.ERROR;
  const isComplete = progress.phase === ProgressPhase.COMPLETE;
  const isActive = progress.phase !== ProgressPhase.IDLE && !isComplete && !isError;

  return (
    <div className="space-y-3">
      {/* Progress Bar */}
      <div className="relative">
        <Progress
          value={progress.progress}
          className={cn(
            'h-2',
            isError && '[&>div]:bg-destructive',
            isComplete && '[&>div]:bg-green-500'
          )}
          aria-hidden="true"
        />
      </div>

      {/* Status */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {isActive && <Loader2 className="h-4 w-4 animate-spin text-primary" aria-hidden="true" />}
          {isComplete && <CheckCircle2 className="h-4 w-4 text-green-500" aria-hidden="true" />}
          {isError && <AlertCircle className="h-4 w-4 text-destructive" aria-hidden="true" />}

          <span
            className={cn(
              'text-sm font-medium',
              isError && 'text-destructive',
              isComplete && 'text-green-600',
              isActive && 'text-foreground'
            )}
          >
            {progress.message || PHASE_LABELS[progress.phase]}
          </span>
        </div>

        <span className="text-xs text-muted-foreground">
          {progress.progress}%
        </span>
      </div>

      {/* Row Progress (if available) */}
      {progress.rowsProcessed !== undefined && progress.totalRows !== undefined && (
        <div className="text-xs text-muted-foreground">
          Processing row {progress.rowsProcessed.toLocaleString()} of{' '}
          {progress.totalRows.toLocaleString()}
        </div>
      )}

      {/* Step Indicator (if provided) */}
      {currentStep !== undefined && totalSteps !== undefined && (
        <div className="text-xs text-muted-foreground text-center">
          Step {currentStep} of {totalSteps}
        </div>
      )}

      {/* Screen Reader Announcement */}
      <div role="status" aria-live="polite" aria-atomic="true" className="sr-only">
        {progress.message || PHASE_LABELS[progress.phase]} - {progress.progress}% complete
        {progress.rowsProcessed !== undefined &&
          ` - Processing row ${progress.rowsProcessed}`}
      </div>
    </div>
  );
}
