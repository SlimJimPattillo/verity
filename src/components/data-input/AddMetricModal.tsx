import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Metric } from "@/lib/mockData";
import { Hash, DollarSign, Percent, Users, Sparkles } from "lucide-react";
import { cn } from "@/lib/utils";

interface AddMetricModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (metric: Omit<Metric, "id">) => void;
}

const unitOptions = [
  { value: "#" as const, label: "Number", icon: Hash, example: "5,000" },
  { value: "$" as const, label: "Currency", icon: DollarSign, example: "$50,000" },
  { value: "%" as const, label: "Percent", icon: Percent, example: "85%" },
  { value: "People" as const, label: "People", icon: Users, example: "1,250 people" },
];

export function AddMetricModal({ open, onOpenChange, onSave }: AddMetricModalProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Metric["unit"]>("#");
  const [type, setType] = useState<Metric["type"]>("output");
  const [comparison, setComparison] = useState("");
  const [previousValue, setPreviousValue] = useState("");
  const [showAdvanced, setShowAdvanced] = useState(false);

  const handleSave = () => {
    if (!label.trim() || !value) return;

    const metric: Omit<Metric, "id"> = {
      label: label.trim(),
      value: parseFloat(value) || 0,
      unit,
      type,
      ...(comparison && { comparison }),
      ...(previousValue && { previousValue: parseFloat(previousValue) }),
    };

    onSave(metric);
    handleReset();
    onOpenChange(false);
  };

  const handleReset = () => {
    setLabel("");
    setValue("");
    setUnit("#");
    setType("output");
    setComparison("");
    setPreviousValue("");
    setShowAdvanced(false);
  };

  const selectedUnit = unitOptions.find((u) => u.value === unit);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10">
              <Sparkles className="h-4 w-4 text-primary" />
            </div>
            Add Metric
          </DialogTitle>
          <DialogDescription>
            Add a data point to track in your reports
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-5 py-2">
          {/* Label */}
          <div className="space-y-2">
            <Label htmlFor="label" className="text-sm font-medium">
              What are you measuring?
            </Label>
            <Input
              id="label"
              placeholder="e.g., Meals Served, People Helped, Funds Raised"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-11"
              autoFocus
            />
          </div>

          {/* Value + Unit Row */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="value" className="text-sm font-medium">
                Value
              </Label>
              <Input
                id="value"
                type="number"
                placeholder="e.g., 5000"
                value={value}
                onChange={(e) => setValue(e.target.value)}
                className="h-11"
              />
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Unit</Label>
              <div className="grid grid-cols-4 gap-1">
                {unitOptions.map((opt) => (
                  <Button
                    key={opt.value}
                    type="button"
                    variant={unit === opt.value ? "default" : "outline"}
                    size="sm"
                    onClick={() => setUnit(opt.value)}
                    className="h-11 flex-col gap-0.5 px-2"
                  >
                    <opt.icon className="h-4 w-4" />
                    <span className="text-[10px]">{opt.label}</span>
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Preview */}
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs font-medium text-muted-foreground mb-2">Preview</p>
            <p className="text-2xl font-bold text-foreground">
              {unit === "$" && "$"}
              {value ? parseFloat(value).toLocaleString() : "0"}
              {unit === "%" && "%"}
              {unit === "People" && " people"}
            </p>
            <p className="text-sm text-muted-foreground">{label || "Your metric label"}</p>
          </div>

          {/* Type Toggle */}
          <div className="space-y-3 rounded-xl border border-border p-4">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">Metric Type</Label>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {type === "outcome" 
                    ? "Shows as headline hero metric" 
                    : "Shows in supporting metrics grid"}
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className={cn("text-sm", type === "output" ? "font-medium" : "text-muted-foreground")}>
                  Output
                </span>
                <Switch
                  checked={type === "outcome"}
                  onCheckedChange={(checked) => setType(checked ? "outcome" : "output")}
                />
                <span className={cn("text-sm", type === "outcome" ? "font-medium" : "text-muted-foreground")}>
                  Outcome
                </span>
              </div>
            </div>
          </div>

          {/* Advanced Options Toggle */}
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex w-full items-center justify-center gap-1 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            {showAdvanced ? "Hide" : "Show"} comparison options
            <span className="text-xs">({showAdvanced ? "−" : "+"})</span>
          </button>

          {/* Advanced Options */}
          {showAdvanced && (
            <div className="space-y-4 animate-fade-in">
              <div className="space-y-2">
                <Label htmlFor="previousValue" className="text-sm font-medium">
                  Previous Value (optional)
                </Label>
                <Input
                  id="previousValue"
                  type="number"
                  placeholder="e.g., 4200"
                  value={previousValue}
                  onChange={(e) => setPreviousValue(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Shows a comparison bar chart in reports
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="comparison" className="text-sm font-medium">
                  Comparison Text (optional)
                </Label>
                <Input
                  id="comparison"
                  placeholder="e.g., +19% vs last year"
                  value={comparison}
                  onChange={(e) => setComparison(e.target.value)}
                />
              </div>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex gap-3 pt-2">
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            className="flex-1"
          >
            Cancel
          </Button>
          <Button
            onClick={handleSave}
            disabled={!label.trim() || !value}
            className="flex-1"
          >
            Add Metric
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}