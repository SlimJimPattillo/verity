import { Metric } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Settings, Lightbulb, MousePointerClick } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface InspectorPanelProps {
  selectedMetric: Metric | null;
  reportSettings: {
    title: string;
    dateRange: string;
    primaryColor: string;
  };
  onMetricUpdate: (id: string, updates: Partial<Metric>) => void;
  onMetricDelete: (id: string) => void;
  onSettingsUpdate: (updates: Partial<{ title: string; dateRange: string; primaryColor: string }>) => void;
  onDeselect: () => void;
}

function HelpTip({ children }: { children: React.ReactNode }) {
  return (
    <TooltipProvider delayDuration={0}>
      <Tooltip>
        <TooltipTrigger asChild>
          <button className="ml-1 inline-flex h-4 w-4 items-center justify-center rounded-full bg-muted text-muted-foreground hover:bg-primary/10 hover:text-primary transition-colors">
            <span className="text-[10px] font-bold">?</span>
          </button>
        </TooltipTrigger>
        <TooltipContent side="right" className="max-w-[200px] text-xs">
          {children}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

export function InspectorPanel({
  selectedMetric,
  reportSettings,
  onMetricUpdate,
  onMetricDelete,
  onSettingsUpdate,
  onDeselect,
}: InspectorPanelProps) {
  if (selectedMetric) {
    return (
      <div className="space-y-6 animate-fade-in">
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
            <Settings className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="font-semibold text-foreground">Metric Properties</h3>
            <p className="text-[10px] text-muted-foreground">Changes save automatically</p>
          </div>
        </div>

        {/* Quick tip */}
        <div className="flex items-start gap-2 rounded-lg bg-amber-50 border border-amber-200 p-3">
          <Lightbulb className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-xs text-amber-800">
            <span className="font-medium">Pro tip:</span> Double-click any text in the preview to edit it directly!
          </p>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric-label" className="text-xs font-medium text-muted-foreground flex items-center">
              Label
              <HelpTip>The name of your metric (e.g., "Meals Served")</HelpTip>
            </Label>
            <Input
              id="metric-label"
              value={selectedMetric.label}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { label: e.target.value })}
              className="h-9"
              placeholder="e.g., Meals Served"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-value" className="text-xs font-medium text-muted-foreground flex items-center">
              Value
              <HelpTip>The number to display (e.g., 50000)</HelpTip>
            </Label>
            <Input
              id="metric-value"
              type="number"
              value={selectedMetric.value}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { value: parseFloat(e.target.value) || 0 })}
              className="h-9"
            />
          </div>

          <div className="space-y-3 rounded-xl border border-border bg-gradient-to-br from-muted/30 to-muted/50 p-4">
            <Label className="text-xs font-medium text-muted-foreground flex items-center">
              Metric Type
              <HelpTip>
                <strong>Outcome</strong> = Impact/Results (shows as hero)<br/>
                <strong>Output</strong> = Activities/Effort (shows in grid)
              </HelpTip>
            </Label>
            <div className="flex items-center justify-between gap-2">
              <span className={`text-sm transition-colors ${selectedMetric.type === "output" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Output
              </span>
              <Switch
                checked={selectedMetric.type === "outcome"}
                onCheckedChange={(checked) => 
                  onMetricUpdate(selectedMetric.id, { type: checked ? "outcome" : "output" })
                }
              />
              <span className={`text-sm transition-colors ${selectedMetric.type === "outcome" ? "text-foreground font-medium" : "text-muted-foreground"}`}>
                Outcome
              </span>
            </div>
            <div className="rounded-lg bg-background/50 p-2">
              <p className="text-xs text-center text-muted-foreground">
                {selectedMetric.type === "outcome" 
                  ? "✨ Shows as the headline hero metric" 
                  : "📊 Shows in the supporting metrics grid"}
              </p>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-unit" className="text-xs font-medium text-muted-foreground flex items-center">
              Unit
              <HelpTip>How the number is formatted</HelpTip>
            </Label>
            <div className="grid grid-cols-4 gap-2">
              {(["#", "$", "%", "People"] as const).map((unit) => (
                <Button
                  key={unit}
                  variant={selectedMetric.unit === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMetricUpdate(selectedMetric.id, { unit })}
                  className="text-xs"
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-comparison" className="text-xs font-medium text-muted-foreground flex items-center">
              Comparison (optional)
              <HelpTip>Shows growth or change (e.g., "+15% vs last year")</HelpTip>
            </Label>
            <Input
              id="metric-comparison"
              value={selectedMetric.comparison || ""}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { comparison: e.target.value })}
              placeholder="e.g., +15% vs last year"
              className="h-9"
            />
          </div>

          <div className="pt-2">
            <Button
              variant="outline"
              className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive hover:border-destructive/50 transition-colors"
              onClick={() => {
                onMetricDelete(selectedMetric.id);
                onDeselect();
              }}
            >
              <Trash2 className="h-4 w-4" />
              Delete Metric
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Report Settings (default view)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <div>
          <h3 className="font-semibold text-foreground">Report Settings</h3>
          <p className="text-[10px] text-muted-foreground">Customize your report</p>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="report-title" className="text-xs font-medium text-muted-foreground">
            Report Title
          </Label>
          <Input
            id="report-title"
            value={reportSettings.title}
            onChange={(e) => onSettingsUpdate({ title: e.target.value })}
            className="h-9"
            placeholder="e.g., 2024 Annual Impact Report"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="report-date" className="text-xs font-medium text-muted-foreground">
            Date Range
          </Label>
          <Input
            id="report-date"
            value={reportSettings.dateRange}
            onChange={(e) => onSettingsUpdate({ dateRange: e.target.value })}
            className="h-9"
            placeholder="e.g., January - December 2024"
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Brand Color</Label>
          <div className="flex items-center gap-3">
            <div className="relative">
              <input
                type="color"
                value={reportSettings.primaryColor}
                onChange={(e) => onSettingsUpdate({ primaryColor: e.target.value })}
                className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
              />
              <div 
                className="h-10 w-10 rounded-lg border border-border shadow-sm cursor-pointer transition-transform hover:scale-105"
                style={{ backgroundColor: reportSettings.primaryColor }}
              />
            </div>
            <Input
              value={reportSettings.primaryColor}
              onChange={(e) => onSettingsUpdate({ primaryColor: e.target.value })}
              className="h-9 flex-1 font-mono text-sm uppercase"
            />
          </div>
        </div>
      </div>

      {/* How to edit hint */}
      <div className="rounded-xl border border-dashed border-border bg-gradient-to-br from-muted/20 to-muted/40 p-5">
        <div className="flex flex-col items-center text-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10">
            <MousePointerClick className="h-5 w-5 text-primary" />
          </div>
          <div>
            <p className="text-sm font-medium text-foreground">Edit Metrics in Preview</p>
            <p className="mt-1 text-xs text-muted-foreground">
              Click any metric card in the preview to select it, then edit properties here
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
