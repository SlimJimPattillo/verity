import { Download, FileText, Image, Share2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

interface ExportStepProps {
  onExport: (format: "pdf" | "png" | "share") => void;
}

export function ExportStep({ onExport }: ExportStepProps) {
  const handleExport = (format: "pdf" | "png" | "share") => {
    onExport(format);
    toast.success(`Export started! Your ${format.toUpperCase()} will be ready shortly.`);
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Download className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Export Your Report</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Download or share your finished report
        </p>
      </div>

      <div className="space-y-3">
        <Button
          variant="outline"
          className="w-full h-16 justify-start gap-4 hover:border-primary hover:bg-primary/5"
          onClick={() => handleExport("pdf")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-red-100">
            <FileText className="h-5 w-5 text-red-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Download PDF</p>
            <p className="text-xs text-muted-foreground">Print-ready document</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-16 justify-start gap-4 hover:border-primary hover:bg-primary/5"
          onClick={() => handleExport("png")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-blue-100">
            <Image className="h-5 w-5 text-blue-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Download Image</p>
            <p className="text-xs text-muted-foreground">PNG for social media</p>
          </div>
        </Button>

        <Button
          variant="outline"
          className="w-full h-16 justify-start gap-4 hover:border-primary hover:bg-primary/5"
          onClick={() => handleExport("share")}
        >
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-purple-100">
            <Share2 className="h-5 w-5 text-purple-600" />
          </div>
          <div className="text-left">
            <p className="font-medium">Share Link</p>
            <p className="text-xs text-muted-foreground">Generate shareable URL</p>
          </div>
        </Button>
      </div>

      {/* Success state */}
      <div className="rounded-xl border border-primary/20 bg-primary/5 p-4">
        <div className="flex items-center gap-3">
          <CheckCircle2 className="h-5 w-5 text-primary shrink-0" />
          <div>
            <p className="text-sm font-medium text-foreground">Report Ready!</p>
            <p className="text-xs text-muted-foreground">
              Your impact report is complete and ready to share
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
