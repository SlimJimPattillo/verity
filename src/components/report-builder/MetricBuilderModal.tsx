import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { cn } from "@/lib/utils";
import { Metric } from "@/lib/mockData";

interface MetricBuilderModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metric: Omit<Metric, "id">) => void;
}

export function MetricBuilderModal({ open, onOpenChange, onSave }: MetricBuilderModalProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Metric["unit"]>("#");
  const [type, setType] = useState<Metric["type"]>("output");
  const [comparison, setComparison] = useState("");

  const handleSave = () => {
    if (!label || !value) return;
    
    onSave({
      label,
      value: parseFloat(value),
      unit,
      type,
      comparison: comparison || undefined,
    });
    
    // Reset form
    setLabel("");
    setValue("");
    setUnit("#");
    setType("output");
    setComparison("");
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">Add New Metric</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              placeholder="e.g., Meals Served, Graduation Rate"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
            />
          </div>

          {/* Value and Unit */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value">Value</Label>
              <Input
                id="value"
                type="number"
                placeholder="5000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unit</Label>
              <Select value={unit} onValueChange={(v) => setUnit(v as Metric["unit"])}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="#">Number (#)</SelectItem>
                  <SelectItem value="%">Percentage (%)</SelectItem>
                  <SelectItem value="$">Currency ($)</SelectItem>
                  <SelectItem value="People">People</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Type Toggle - The Ops Toggle */}
          <div className="space-y-3">
            <Label>Type</Label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setType("output")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all",
                  type === "output"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                <span className="text-sm font-semibold text-foreground">Output</span>
                <span className="text-xs text-muted-foreground">Activity / Effort</span>
              </button>
              <button
                type="button"
                onClick={() => setType("outcome")}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-lg border-2 p-4 transition-all",
                  type === "outcome"
                    ? "border-success bg-success/5"
                    : "border-border bg-card hover:border-muted-foreground/30"
                )}
              >
                <span className="text-sm font-semibold text-foreground">Outcome</span>
                <span className="text-xs text-muted-foreground">Result / Impact</span>
              </button>
            </div>
          </div>

          {/* Comparison (Optional) */}
          <div className="space-y-2">
            <Label htmlFor="comparison">Comparison (Optional)</Label>
            <Input
              id="comparison"
              placeholder="e.g., vs last year, across service area"
              value={comparison}
              onChange={(e) => setComparison(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={!label || !value}>
            Add Metric
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
