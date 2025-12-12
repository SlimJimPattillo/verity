import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
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
  const [showComparison, setShowComparison] = useState(false);
  const [previousValue, setPreviousValue] = useState("");
  const [comparison, setComparison] = useState("");

  const handleSave = () => {
    if (!label || !value) return;
    
    onSave({
      label,
      value: parseFloat(value),
      unit,
      type,
      comparison: showComparison ? comparison || undefined : undefined,
      previousValue: showComparison && previousValue ? parseFloat(previousValue) : undefined,
    });
    
    // Reset form
    setLabel("");
    setValue("");
    setUnit("#");
    setType("output");
    setShowComparison(false);
    setPreviousValue("");
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

          {/* Show Comparison Toggle */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="showComparison"
                checked={showComparison}
                onCheckedChange={(checked) => setShowComparison(checked === true)}
              />
              <Label htmlFor="showComparison" className="text-sm font-normal cursor-pointer">
                Show Comparison (adds micro-chart)
              </Label>
            </div>

            {showComparison && (
              <div className="grid grid-cols-2 gap-4 pl-6">
                <div className="space-y-2">
                  <Label htmlFor="previousValue">Previous Value</Label>
                  <Input
                    id="previousValue"
                    type="number"
                    placeholder="4200"
                    value={previousValue}
                    onChange={(e) => setPreviousValue(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="comparison">Context Label</Label>
                  <Input
                    id="comparison"
                    placeholder="vs last year"
                    value={comparison}
                    onChange={(e) => setComparison(e.target.value)}
                  />
                </div>
              </div>
            )}
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
