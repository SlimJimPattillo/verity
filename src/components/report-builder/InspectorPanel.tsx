import { Metric } from "@/lib/mockData";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Button } from "@/components/ui/button";
import { Trash2, FileText, Settings } from "lucide-react";

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
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Settings className="h-4 w-4 text-primary" />
            </div>
            <h3 className="font-semibold text-foreground">Metric Properties</h3>
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onDeselect}
            className="text-xs text-muted-foreground hover:text-foreground"
          >
            Done
          </Button>
        </div>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="metric-label" className="text-xs font-medium text-muted-foreground">
              Label
            </Label>
            <Input
              id="metric-label"
              value={selectedMetric.label}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { label: e.target.value })}
              className="h-9"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-value" className="text-xs font-medium text-muted-foreground">
              Value
            </Label>
            <Input
              id="metric-value"
              type="number"
              value={selectedMetric.value}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { value: parseFloat(e.target.value) || 0 })}
              className="h-9"
            />
          </div>

          <div className="space-y-3 rounded-lg border border-border bg-muted/30 p-4">
            <Label className="text-xs font-medium text-muted-foreground">Metric Type</Label>
            <div className="flex items-center justify-between">
              <span className="text-sm text-muted-foreground">Output</span>
              <Switch
                checked={selectedMetric.type === "outcome"}
                onCheckedChange={(checked) => 
                  onMetricUpdate(selectedMetric.id, { type: checked ? "outcome" : "output" })
                }
              />
              <span className="text-sm text-muted-foreground">Outcome</span>
            </div>
            <p className="text-xs text-muted-foreground">
              {selectedMetric.type === "outcome" 
                ? "Outcome metrics show impact and results" 
                : "Output metrics track activities and effort"}
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-unit" className="text-xs font-medium text-muted-foreground">
              Unit
            </Label>
            <div className="flex gap-2">
              {(["#", "$", "%", "People"] as const).map((unit) => (
                <Button
                  key={unit}
                  variant={selectedMetric.unit === unit ? "default" : "outline"}
                  size="sm"
                  onClick={() => onMetricUpdate(selectedMetric.id, { unit })}
                  className="flex-1"
                >
                  {unit}
                </Button>
              ))}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="metric-comparison" className="text-xs font-medium text-muted-foreground">
              Comparison Text (optional)
            </Label>
            <Input
              id="metric-comparison"
              value={selectedMetric.comparison || ""}
              onChange={(e) => onMetricUpdate(selectedMetric.id, { comparison: e.target.value })}
              placeholder="e.g., +15% vs last year"
              className="h-9"
            />
          </div>

          <Button
            variant="outline"
            className="w-full gap-2 text-destructive hover:bg-destructive/10 hover:text-destructive"
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
    );
  }

  // Report Settings (default view)
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex items-center gap-2">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
          <FileText className="h-4 w-4 text-primary" />
        </div>
        <h3 className="font-semibold text-foreground">Report Settings</h3>
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
          />
        </div>

        <div className="space-y-2">
          <Label className="text-xs font-medium text-muted-foreground">Primary Color</Label>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={reportSettings.primaryColor}
              onChange={(e) => onSettingsUpdate({ primaryColor: e.target.value })}
              className="h-10 w-10 cursor-pointer rounded border border-border"
            />
            <Input
              value={reportSettings.primaryColor}
              onChange={(e) => onSettingsUpdate({ primaryColor: e.target.value })}
              className="h-9 flex-1"
            />
          </div>
        </div>
      </div>

      <div className="rounded-lg border border-dashed border-border bg-muted/30 p-4">
        <p className="text-center text-xs text-muted-foreground">
          Click on a metric card in the preview to edit its properties
        </p>
      </div>
    </div>
  );
}
