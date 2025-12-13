import { useState, useRef, DragEvent } from "react";
import { Upload, FileSpreadsheet, Plus, CheckCircle2, AlertCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Metric } from "@/lib/mockData";

interface DataUploadStepProps {
  metrics: Metric[];
  onImportMetrics: (metrics: Omit<Metric, "id">[]) => void;
  onAddManually: () => void;
}

export function DataUploadStep({ metrics, onImportMetrics, onAddManually }: DataUploadStepProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<"idle" | "success" | "error">("idle");
  const [uploadMessage, setUploadMessage] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const parseCSV = (text: string): Omit<Metric, "id">[] => {
    const lines = text.trim().split("\n");
    if (lines.length < 2) return [];

    const headers = lines[0].toLowerCase().split(",").map(h => h.trim());
    const labelIdx = headers.indexOf("label");
    const valueIdx = headers.indexOf("value");
    const typeIdx = headers.indexOf("type");
    const unitIdx = headers.indexOf("unit");
    const comparisonIdx = headers.indexOf("comparison");

    if (labelIdx === -1 || valueIdx === -1) return [];

    const results: Omit<Metric, "id">[] = [];
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(",").map(v => v.trim());
      const label = values[labelIdx];
      const value = parseFloat(values[valueIdx]);
      
      if (label && !isNaN(value)) {
        results.push({
          label,
          value,
          type: (typeIdx !== -1 && values[typeIdx]?.toLowerCase() === "outcome") ? "outcome" : "output",
          unit: (unitIdx !== -1 ? values[unitIdx] : "#") as Metric["unit"],
          comparison: comparisonIdx !== -1 ? values[comparisonIdx] : undefined,
        });
      }
    }
    return results;
  };

  const handleFile = (file: File) => {
    if (!file.name.endsWith(".csv")) {
      setUploadStatus("error");
      setUploadMessage("Please upload a CSV file");
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const text = e.target?.result as string;
      const parsed = parseCSV(text);
      
      if (parsed.length > 0) {
        onImportMetrics(parsed);
        setUploadStatus("success");
        setUploadMessage(`Successfully imported ${parsed.length} metrics`);
      } else {
        setUploadStatus("error");
        setUploadMessage("No valid data found. Check your CSV format.");
      }
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  };

  const handleDragOver = (e: DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => setIsDragging(false);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  const downloadSample = () => {
    const sample = `label,value,type,unit,comparison
Meals Served,50000,output,#,+15% vs last year
Families Helped,2500,output,People,
Hunger Reduction,23,outcome,%,`;
    const blob = new Blob([sample], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "metrics-template.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Upload className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Add Your Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Import from a spreadsheet or add metrics manually
        </p>
      </div>

      {/* Main Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={cn(
          "relative flex flex-col items-center justify-center rounded-xl border-2 border-dashed p-8 cursor-pointer transition-all duration-200",
          isDragging
            ? "border-primary bg-primary/10 scale-[1.02]"
            : "border-border hover:border-primary/50 hover:bg-muted/50"
        )}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleInputChange}
          className="hidden"
        />
        
        <div className={cn(
          "flex h-16 w-16 items-center justify-center rounded-full mb-4 transition-colors",
          isDragging ? "bg-primary/20" : "bg-muted"
        )}>
          <FileSpreadsheet className={cn(
            "h-8 w-8 transition-colors",
            isDragging ? "text-primary" : "text-muted-foreground"
          )} />
        </div>
        
        <p className="text-sm font-medium text-foreground">
          {isDragging ? "Drop your file here" : "Drag & drop your CSV file"}
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          or click to browse
        </p>
        
        <Button
          variant="link"
          size="sm"
          className="mt-3 gap-1 text-xs text-primary"
          onClick={(e) => {
            e.stopPropagation();
            downloadSample();
          }}
        >
          <Download className="h-3 w-3" />
          Download sample template
        </Button>
      </div>

      {/* Upload Status */}
      {uploadStatus !== "idle" && (
        <div className={cn(
          "flex items-center gap-2 rounded-lg p-3",
          uploadStatus === "success" 
            ? "bg-green-50 border border-green-200" 
            : "bg-red-50 border border-red-200"
        )}>
          {uploadStatus === "success" ? (
            <CheckCircle2 className="h-4 w-4 text-green-600" />
          ) : (
            <AlertCircle className="h-4 w-4 text-red-600" />
          )}
          <p className={cn(
            "text-sm",
            uploadStatus === "success" ? "text-green-800" : "text-red-800"
          )}>
            {uploadMessage}
          </p>
        </div>
      )}

      {/* Divider */}
      <div className="relative">
        <div className="absolute inset-0 flex items-center">
          <div className="w-full border-t border-border" />
        </div>
        <div className="relative flex justify-center">
          <span className="bg-card px-3 text-xs text-muted-foreground">or</span>
        </div>
      </div>

      {/* Manual Entry Button */}
      <Button
        variant="outline"
        className="w-full gap-2 h-12"
        onClick={onAddManually}
      >
        <Plus className="h-4 w-4" />
        Add Metrics Manually
      </Button>

      {/* Current Metrics Count */}
      {metrics.length > 0 && (
        <div className="flex items-center justify-center gap-2 rounded-lg bg-primary/5 border border-primary/20 p-3">
          <CheckCircle2 className="h-4 w-4 text-primary" />
          <span className="text-sm text-foreground">
            <strong>{metrics.length}</strong> metrics added
          </span>
        </div>
      )}
    </div>
  );
}
