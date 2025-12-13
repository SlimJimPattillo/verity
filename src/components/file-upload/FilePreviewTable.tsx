/**
 * Data preview table with validation indicators
 */

import { CheckCircle2, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FilePreviewTableProps } from './lib/fileUploadTypes';

export function FilePreviewTable({ data, onRowClick }: FilePreviewTableProps) {
  if (data.length === 0) {
    return (
      <div className="text-center text-sm text-muted-foreground py-8">
        No data to preview
      </div>
    );
  }

  return (
    <ScrollArea className="h-[400px] rounded-md border">
      <table className="w-full text-sm">
        <thead className="bg-muted/50 text-left sticky top-0 z-10">
          <tr>
            <th className="px-3 py-2 font-medium w-8" aria-label="Status">
              <span className="sr-only">Status</span>
            </th>
            <th className="px-3 py-2 font-medium min-w-[200px]">Label</th>
            <th className="px-3 py-2 font-medium min-w-[100px]">Value</th>
            <th className="px-3 py-2 font-medium w-[80px]">Unit</th>
            <th className="px-3 py-2 font-medium w-[100px]">Type</th>
            <th className="px-3 py-2 font-medium min-w-[150px]">Comparison</th>
          </tr>
        </thead>
        <tbody>
          {data.map((row, i) => (
            <tr
              key={i}
              onClick={() => onRowClick?.(row, i)}
              className={cn(
                'border-t border-border transition-colors',
                !row.isValid && 'bg-red-50',
                onRowClick && 'cursor-pointer hover:bg-muted/50'
              )}
              aria-label={row.isValid ? `Valid row ${i + 1}` : `Invalid row ${i + 1}: ${row.error}`}
            >
              <td className="px-3 py-2">
                {row.isValid ? (
                  <CheckCircle2
                    className="h-4 w-4 text-green-600"
                    aria-label="Valid"
                  />
                ) : (
                  <AlertCircle
                    className="h-4 w-4 text-red-500"
                    aria-label={`Error: ${row.error}`}
                  />
                )}
              </td>
              <td className="px-3 py-2">
                <div className="max-w-[300px]">
                  <div className="truncate" title={row.label}>
                    {row.label || '—'}
                  </div>
                  {!row.isValid && row.error && (
                    <div className="text-xs text-red-600 mt-0.5">
                      {row.error}
                    </div>
                  )}
                </div>
              </td>
              <td className="px-3 py-2 font-mono text-right">
                {row.unit === '$' && '$'}
                {row.value.toLocaleString()}
                {row.unit === '%' && '%'}
              </td>
              <td className="px-3 py-2">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium',
                  row.unit === '$' && 'bg-green-100 text-green-700',
                  row.unit === '%' && 'bg-blue-100 text-blue-700',
                  row.unit === 'People' && 'bg-purple-100 text-purple-700',
                  row.unit === '#' && 'bg-gray-100 text-gray-700'
                )}>
                  {row.unit}
                </span>
              </td>
              <td className="px-3 py-2">
                <span className={cn(
                  'inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium capitalize',
                  row.type === 'outcome' && 'bg-orange-100 text-orange-700',
                  row.type === 'output' && 'bg-cyan-100 text-cyan-700'
                )}>
                  {row.type}
                </span>
              </td>
              <td className="px-3 py-2">
                <div className="max-w-[200px] truncate text-muted-foreground" title={row.comparison}>
                  {row.comparison || '—'}
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </ScrollArea>
  );
}
