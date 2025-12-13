import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Metric } from "@/lib/mockData";
import { Plus, Hash, DollarSign, Percent, Users, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface QuickAddBarProps {
  onAdd: (metric: Omit<Metric, "id">) => void;
  className?: string;
}

const unitOptions = [
  { value: "#" as const, label: "#", icon: Hash },
  { value: "$" as const, label: "$", icon: DollarSign },
  { value: "%" as const, label: "%", icon: Percent },
  { value: "People" as const, label: "👤", icon: Users },
];

export function QuickAddBar({ onAdd, className }: QuickAddBarProps) {
  const [label, setLabel] = useState("");
  const [value, setValue] = useState("");
  const [unit, setUnit] = useState<Metric["unit"]>("#");
  const [isFocused, setIsFocused] = useState(false);

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();
    if (!label.trim() || !value) return;

    onAdd({
      label: label.trim(),
      value: parseFloat(value) || 0,
      unit,
      type: "output", // Default to output, can be changed later
    });

    setLabel("");
    setValue("");
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && label.trim() && value) {
      handleSubmit();
    }
  };

  const selectedUnit = unitOptions.find((u) => u.value === unit);

  return (
    <form
      onSubmit={handleSubmit}
      className={cn(
        "flex items-center gap-2 rounded-xl border p-2 transition-all duration-200",
        isFocused ? "border-primary bg-background shadow-md" : "border-border bg-muted/30",
        className
      )}
    >
      <Input
        placeholder="Metric name..."
        value={label}
        onChange={(e) => setLabel(e.target.value)}
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        onKeyDown={handleKeyDown}
        className="h-9 flex-1 border-0 bg-transparent shadow-none focus-visible:ring-0"
      />
      <div className="flex items-center gap-1">
        <Input
          type="number"
          placeholder="Value"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          onKeyDown={handleKeyDown}
          className="h-9 w-24 border-0 bg-transparent text-right shadow-none focus-visible:ring-0"
        />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 gap-1 px-2">
              {selectedUnit && <selectedUnit.icon className="h-4 w-4" />}
              <ChevronDown className="h-3 w-3 text-muted-foreground" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="bg-background">
            {unitOptions.map((opt) => (
              <DropdownMenuItem
                key={opt.value}
                onClick={() => setUnit(opt.value)}
                className="gap-2"
              >
                <opt.icon className="h-4 w-4" />
                {opt.value === "People" ? "People" : opt.value}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <Button
        type="submit"
        size="sm"
        disabled={!label.trim() || !value}
        className="h-8 gap-1"
      >
        <Plus className="h-4 w-4" />
        Add
      </Button>
    </form>
  );
}