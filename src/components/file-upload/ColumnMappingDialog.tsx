/**
 * Column mapping dialog for manual field mapping
 */

import { useState } from 'react';
import { ArrowRight } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import type { ColumnMappingDialogProps, ColumnMapping } from './lib/fileUploadTypes';
import {
  getFieldLabel,
  getFieldDescription,
  getAvailableTargets,
} from './lib/columnMapping';
import type { Metric } from '@/lib/mockData';

export function ColumnMappingDialog({
  open,
  headers,
  autoMappings,
  onMappingComplete,
  onCancel,
}: ColumnMappingDialogProps) {
  const [mappings, setMappings] = useState<ColumnMapping[]>(autoMappings);

  const updateMapping = (source: string, target: keyof Metric | 'unmapped') => {
    setMappings((prev) =>
      prev.map((m) =>
        m.source === source
          ? {
              ...m,
              target,
              // Set confidence to 1.0 for manual mappings
              confidence: target === 'unmapped' ? 0 : 1.0,
            }
          : m
      )
    );
  };

  const isValid = () => {
    const mappedTargets = mappings
      .filter((m) => m.target !== 'unmapped')
      .map((m) => m.target);
    return mappedTargets.includes('label') && mappedTargets.includes('value');
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onCancel()}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Map Columns</DialogTitle>
          <DialogDescription>
            Match your file columns to the required fields. Required fields are marked with *.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {headers.map((header) => {
            const mapping = mappings.find((m) => m.source === header);
            const availableTargets = getAvailableTargets(mappings, header);

            return (
              <div
                key={header}
                className="flex items-center gap-4 rounded-lg border p-3"
              >
                {/* Source Column */}
                <div className="flex-1 min-w-0">
                  <Label className="text-sm font-medium break-words">{header}</Label>
                  <p className="text-xs text-muted-foreground">From your file</p>
                </div>

                {/* Arrow */}
                <ArrowRight className="h-4 w-4 text-muted-foreground flex-shrink-0" aria-hidden="true" />

                {/* Target Field Selector */}
                <div className="flex-1 min-w-[200px]">
                  <Select
                    value={mapping?.target || 'unmapped'}
                    onValueChange={(value) =>
                      updateMapping(header, value as keyof Metric | 'unmapped')
                    }
                  >
                    <SelectTrigger
                      className="w-full"
                      aria-label={`Map ${header} to field`}
                    >
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {availableTargets.map((target) => {
                        const isRequired = target === 'label' || target === 'value';
                        return (
                          <SelectItem key={target} value={target}>
                            <div className="flex items-center gap-2">
                              <span>
                                {getFieldLabel(target)}
                                {isRequired && <span className="text-red-500">*</span>}
                              </span>
                            </div>
                          </SelectItem>
                        );
                      })}
                    </SelectContent>
                  </Select>
                  {mapping?.target && mapping.target !== 'unmapped' && (
                    <p className="text-xs text-muted-foreground mt-1">
                      {getFieldDescription(mapping.target)}
                    </p>
                  )}
                </div>

                {/* Confidence Badge */}
                {mapping && mapping.confidence < 1.0 && mapping.target !== 'unmapped' && (
                  <Badge variant="outline" className="flex-shrink-0">
                    {Math.round(mapping.confidence * 100)}% match
                  </Badge>
                )}
              </div>
            );
          })}
        </div>

        {/* Validation Message */}
        {!isValid() && (
          <div className="rounded-lg border border-red-200 bg-red-50 p-3">
            <p className="text-sm text-red-700">
              Please map the required fields: <strong>label</strong> and <strong>value</strong>
            </p>
          </div>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={onCancel}>
            Cancel
          </Button>
          <Button onClick={() => onMappingComplete(mappings)} disabled={!isValid()}>
            Continue with Mapping
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
