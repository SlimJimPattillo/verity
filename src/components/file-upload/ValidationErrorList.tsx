/**
 * Validation error list with filtering and detailed error messages
 */

import { useState } from 'react';
import { AlertCircle, AlertTriangle, CheckCircle2, XCircle, ChevronDown, ChevronUp } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { ValidationErrorListProps } from './lib/fileUploadTypes';

export function ValidationErrorList({ errors, totalRows }: ValidationErrorListProps) {
  const [filter, setFilter] = useState<'all' | 'errors' | 'warnings'>('all');
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());

  const errorCount = errors.filter((e) => e.severity === 'error').length;
  const warningCount = errors.filter((e) => e.severity === 'warning').length;

  const filteredErrors = errors.filter((e) => {
    if (filter === 'errors') return e.severity === 'error';
    if (filter === 'warnings') return e.severity === 'warning';
    return true;
  });

  const toggleExpanded = (row: number) => {
    const newExpanded = new Set(expandedRows);
    if (newExpanded.has(row)) {
      newExpanded.delete(row);
    } else {
      newExpanded.add(row);
    }
    setExpandedRows(newExpanded);
  };

  if (errors.length === 0) {
    return (
      <div className="flex items-center gap-2 rounded-lg border border-green-200 bg-green-50 p-4">
        <CheckCircle2 className="h-5 w-5 text-green-600" aria-hidden="true" />
        <div>
          <p className="text-sm font-medium text-green-700">All rows valid</p>
          <p className="text-xs text-green-600">
            {totalRows} {totalRows === 1 ? 'row' : 'rows'} ready to import
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4" role="region" aria-label="Validation errors">
      {/* Summary */}
      <div className="flex items-center gap-4">
        {errorCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertCircle className="h-5 w-5 text-red-500" aria-hidden="true" />
            <span className="font-medium text-red-700">{errorCount} Errors</span>
          </div>
        )}
        {warningCount > 0 && (
          <div className="flex items-center gap-2 text-sm">
            <AlertTriangle className="h-5 w-5 text-yellow-500" aria-hidden="true" />
            <span className="font-medium text-yellow-700">{warningCount} Warnings</span>
          </div>
        )}
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle2 className="h-5 w-5" aria-hidden="true" />
          <span>{totalRows - errorCount} Valid</span>
        </div>
      </div>

      {/* Screen reader announcement */}
      <div role="status" aria-live="polite" className="sr-only">
        Found {errorCount} {errorCount === 1 ? 'error' : 'errors'} and {warningCount}{' '}
        {warningCount === 1 ? 'warning' : 'warnings'}
      </div>

      {/* Filter tabs */}
      <Tabs value={filter} onValueChange={(v) => setFilter(v as typeof filter)}>
        <TabsList>
          <TabsTrigger value="all">All ({errors.length})</TabsTrigger>
          <TabsTrigger value="errors">Errors ({errorCount})</TabsTrigger>
          <TabsTrigger value="warnings">Warnings ({warningCount})</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Error list */}
      <ScrollArea className="h-[300px] rounded-md border">
        <div className="p-4 space-y-2">
          {filteredErrors.length === 0 ? (
            <div className="text-center text-sm text-muted-foreground py-8">
              No {filter === 'all' ? 'issues' : filter} found
            </div>
          ) : (
            filteredErrors.map((error, index) => (
              <div
                key={`${error.row}-${error.field}-${index}`}
                className={cn(
                  'rounded-lg border p-3 transition-all',
                  error.severity === 'error' && 'border-red-200 bg-red-50',
                  error.severity === 'warning' && 'border-yellow-200 bg-yellow-50'
                )}
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      {error.severity === 'error' ? (
                        <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" aria-hidden="true" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-500 flex-shrink-0" aria-hidden="true" />
                      )}
                      {error.row !== undefined && (
                        <span className="font-medium text-sm">
                          Row {error.row + 2}
                        </span>
                      )}
                      {error.field && (
                        <Badge variant="outline" className="text-xs">
                          {error.field}
                        </Badge>
                      )}
                    </div>

                    <p className="mt-1 text-sm text-foreground break-words">
                      {error.message}
                    </p>

                    {error.suggestion && (
                      <p className="mt-1 text-xs text-muted-foreground italic">
                        💡 {error.suggestion}
                      </p>
                    )}
                  </div>

                  {error.rawData && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => error.row !== undefined && toggleExpanded(error.row)}
                      className="flex-shrink-0"
                      aria-label={expandedRows.has(error.row ?? -1) ? 'Hide details' : 'Show details'}
                    >
                      {expandedRows.has(error.row ?? -1) ? (
                        <ChevronUp className="h-4 w-4" />
                      ) : (
                        <ChevronDown className="h-4 w-4" />
                      )}
                    </Button>
                  )}
                </div>

                {error.rawData && expandedRows.has(error.row ?? -1) && (
                  <div className="mt-2 rounded bg-muted p-2 overflow-x-auto">
                    <pre className="text-xs">
                      {JSON.stringify(error.rawData, null, 2)}
                    </pre>
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  );
}
