import { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Metric } from "@/lib/mockData";
import { Upload, FileSpreadsheet, CheckCircle2, AlertCircle, X, Download } from "lucide-react";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

interface CSVUploadModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onImport: (metrics: Omit<Metric, "id">[]) => void;
}

interface ParsedRow {
  label: string;
  value: number;
  unit: Metric["unit"];
  type: Metric["type"];
  comparison?: string;
  previousValue?: number;
  isValid: boolean;
  error?: string;
}

const SAMPLE_CSV = `label,value,unit,type,comparison,previousValue
Meals Served,5000,#,output,+19% vs last year,4200
Hunger Reduction,15,%,outcome,across service area,8
Families Assisted,1250,People,output,,
Operating Efficiency,88,%,output,,`;

export function CSVUploadModal({ open, onOpenChange, onImport }: CSVUploadModalProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [parsedData, setParsedData] = useState<ParsedRow[]>([]);
  const [fileName, setFileName] = useState("");
  const [step, setStep] = useState<"upload" | "preview">("upload");

  const parseCSV = (text: string): ParsedRow[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map((h) => h.trim());
    const labelIdx = headers.indexOf("label");
    const valueIdx = headers.indexOf("value");
    const unitIdx = headers.indexOf("unit");
    const typeIdx = headers.indexOf("type");
    const comparisonIdx = headers.indexOf("comparison");
    const previousValueIdx = headers.indexOf("previousvalue");

    if (labelIdx === -1 || valueIdx === -1) {
      toast.error("CSV must have 'label' and 'value' columns");
      return [];
    }

    return lines.slice(1).map((line) => {
      const values = line.split(",").map((v) => v.trim());
      const label = values[labelIdx] || "";
      const valueStr = values[valueIdx] || "";
      const value = parseFloat(valueStr);
      const unitRaw = values[unitIdx]?.toLowerCase() || "#";
      const typeRaw = values[typeIdx]?.toLowerCase() || "output";
      const comparison = values[comparisonIdx] || undefined;
      const previousValueStr = values[previousValueIdx];
      const previousValue = previousValueStr ? parseFloat(previousValueStr) : undefined;

      // Validate unit
      let unit: Metric["unit"] = "#";
      if (unitRaw === "$" || unitRaw === "dollar" || unitRaw === "currency") unit = "$";
      else if (unitRaw === "%" || unitRaw === "percent") unit = "%";
      else if (unitRaw === "people" || unitRaw === "person") unit = "People";
      else unit = "#";

      // Validate type
      const type: Metric["type"] = typeRaw === "outcome" ? "outcome" : "output";

      // Determine validity
      let isValid = true;
      let error: string | undefined;

      if (!label) {
        isValid = false;
        error = "Missing label";
      } else if (isNaN(value)) {
        isValid = false;
        error = "Invalid value";
      }

      return {
        label,
        value: isNaN(value) ? 0 : value,
        unit,
        type,
        comparison,
        previousValue,
        isValid,
        error,
      };
    });
  };

  const handleFile = useCallback((file: File) => {
    if (!file.name.endsWith(".csv")) {
      toast.error("Please upload a CSV file");
      return;
    }

    setFileName(file.name);

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      if (parsed.length > 0) {
        setParsedData(parsed);
        setStep("preview");
      }
    };
    reader.readAsText(file);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, [handleFile]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const handleImport = () => {
    const validMetrics = parsedData
      .filter((row) => row.isValid)
      .map(({ label, value, unit, type, comparison, previousValue }) => ({
        label,
        value,
        unit,
        type,
        ...(comparison && { comparison }),
        ...(previousValue && { previousValue }),
      }));

    onImport(validMetrics);
    toast.success(`Imported ${validMetrics.length} metrics`);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setParsedData([]);
    setFileName("");
    setStep("upload");
  };

  const downloadSample = () => {
    const blob = new Blob([SAMPLE_CSV], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "sample-metrics.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  const validCount = parsedData.filter((r) => r.isValid).length;
  const invalidCount = parsedData.filter((r) => !r.isValid).length;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <FileSpreadsheet className="h-4 w-4 text-primary" />
            </div>
            Import from Spreadsheet
          </DialogTitle>
          <DialogDescription>
            Upload a CSV file to import multiple metrics at once
          </DialogDescription>
        </DialogHeader>

        {step === "upload" ? (
          <div className="space-y-4 py-4">
            {/* Drop Zone */}
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              className={cn(
                "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 transition-all",
                isDragging
                  ? "border-primary bg-primary/5"
                  : "border-border bg-muted/30 hover:border-muted-foreground/50"
              )}
            >
              <input
                type="file"
                accept=".csv"
                onChange={handleInputChange}
                className="absolute inset-0 cursor-pointer opacity-0"
              />
              <div className={cn(
                "mb-3 flex h-14 w-14 items-center justify-center rounded-full transition-colors",
                isDragging ? "bg-primary/10" : "bg-muted"
              )}>
                <Upload className={cn("h-7 w-7", isDragging ? "text-primary" : "text-muted-foreground")} />
              </div>
              <p className="text-sm font-medium text-foreground">
                {isDragging ? "Drop your file here" : "Drag & drop your CSV file"}
              </p>
              <p className="mt-1 text-xs text-muted-foreground">
                or click to browse
              </p>
            </div>

            {/* Sample Download */}
            <div className="flex items-center justify-center">
              <Button
                variant="ghost"
                size="sm"
                onClick={downloadSample}
                className="gap-2 text-muted-foreground hover:text-foreground"
              >
                <Download className="h-4 w-4" />
                Download sample template
              </Button>
            </div>

            {/* Format Info */}
            <div className="rounded-lg border border-border bg-muted/20 p-4">
              <p className="text-xs font-medium text-foreground mb-2">Required columns:</p>
              <div className="grid grid-cols-2 gap-x-4 gap-y-1 text-xs text-muted-foreground">
                <span><code className="text-primary">label</code> — Metric name</span>
                <span><code className="text-primary">value</code> — Number</span>
                <span><code className="text-primary">unit</code> — #, $, %, People</span>
                <span><code className="text-primary">type</code> — output/outcome</span>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4 py-4">
            {/* File Info */}
            <div className="flex items-center justify-between rounded-lg bg-muted/30 p-3">
              <div className="flex items-center gap-2">
                <FileSpreadsheet className="h-5 w-5 text-primary" />
                <span className="text-sm font-medium">{fileName}</span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleReset}>
                <X className="h-4 w-4" />
              </Button>
            </div>

            {/* Summary */}
            <div className="flex gap-3">
              <div className="flex-1 rounded-lg border border-green-200 bg-green-50 p-3 text-center">
                <div className="flex items-center justify-center gap-1.5 text-green-700">
                  <CheckCircle2 className="h-4 w-4" />
                  <span className="text-lg font-bold">{validCount}</span>
                </div>
                <p className="text-xs text-green-600">Valid rows</p>
              </div>
              {invalidCount > 0 && (
                <div className="flex-1 rounded-lg border border-red-200 bg-red-50 p-3 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-red-700">
                    <AlertCircle className="h-4 w-4" />
                    <span className="text-lg font-bold">{invalidCount}</span>
                  </div>
                  <p className="text-xs text-red-600">Will be skipped</p>
                </div>
              )}
            </div>

            {/* Preview Table */}
            <div className="max-h-48 overflow-auto rounded-lg border border-border">
              <table className="w-full text-sm">
                <thead className="bg-muted/50 text-left">
                  <tr>
                    <th className="px-3 py-2 font-medium">Label</th>
                    <th className="px-3 py-2 font-medium">Value</th>
                    <th className="px-3 py-2 font-medium">Type</th>
                    <th className="px-3 py-2 font-medium w-8"></th>
                  </tr>
                </thead>
                <tbody>
                  {parsedData.map((row, i) => (
                    <tr key={i} className={cn("border-t border-border", !row.isValid && "bg-red-50")}>
                      <td className="px-3 py-2">{row.label || "—"}</td>
                      <td className="px-3 py-2">
                        {row.unit === "$" && "$"}
                        {row.value.toLocaleString()}
                        {row.unit === "%" && "%"}
                      </td>
                      <td className="px-3 py-2 capitalize">{row.type}</td>
                      <td className="px-3 py-2">
                        {row.isValid ? (
                          <CheckCircle2 className="h-4 w-4 text-green-600" />
                        ) : (
                          <AlertCircle className="h-4 w-4 text-red-500" />
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => {
              if (step === "preview") handleReset();
              else onOpenChange(false);
            }}
            className="flex-1"
          >
            {step === "preview" ? "Back" : "Cancel"}
          </Button>
          {step === "preview" && (
            <Button
              onClick={handleImport}
              disabled={validCount === 0}
              className="flex-1"
            >
              Import {validCount} Metrics
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}