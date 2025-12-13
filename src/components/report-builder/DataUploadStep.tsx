import { useState } from "react";
import { Upload, Plus, CheckCircle2, FileUp } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Metric } from "@/lib/mockData";
import { FileUploadModal } from "@/components/file-upload/FileUploadModal";

interface DataUploadStepProps {
  metrics: Metric[];
  onImportMetrics: (metrics: Omit<Metric, "id">[]) => void;
  onAddManually: () => void;
}

export function DataUploadStep({ metrics, onImportMetrics, onAddManually }: DataUploadStepProps) {
  const [fileModalOpen, setFileModalOpen] = useState(false);

  return (
    <>
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

        {/* Upload Button - Opens Enterprise File Upload Modal */}
        <Button
          variant="outline"
          className="w-full gap-2 h-16 border-2 border-dashed hover:border-primary/50 hover:bg-primary/5"
          onClick={() => setFileModalOpen(true)}
        >
          <FileUp className="h-5 w-5" />
          <div className="text-left">
            <div className="font-medium">Upload Spreadsheet</div>
            <div className="text-xs text-muted-foreground">
              Supports CSV, XLSX, XLS, ODS files
            </div>
          </div>
        </Button>

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
              <strong>{metrics.length}</strong> metrics ready
            </span>
          </div>
        )}
      </div>

      {/* Enterprise File Upload Modal */}
      <FileUploadModal
        open={fileModalOpen}
        onOpenChange={setFileModalOpen}
        onImport={onImportMetrics}
      />
    </>
  );
}
