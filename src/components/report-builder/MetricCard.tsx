import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, Hash, DollarSign, Percent, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MetricCardProps {
  metric: Metric;
  onDelete?: (id: string) => void;
}

const unitIcons = {
  "$": DollarSign,
  "%": Percent,
  "People": Users,
  "#": Hash,
};

export function MetricCard({ metric, onDelete }: MetricCardProps) {
  const Icon = unitIcons[metric.unit];

  return (
    <div
      className={cn(
        "group flex items-center gap-3 rounded-lg border p-3 transition-all",
        metric.type === "outcome"
          ? "border-success/30 bg-success/5"
          : "border-border bg-card"
      )}
    >
      <GripVertical className="h-4 w-4 cursor-grab text-muted-foreground opacity-0 transition-opacity group-hover:opacity-100" />
      
      <div
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-lg",
          metric.type === "outcome" ? "bg-success/10" : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-5 w-5",
            metric.type === "outcome" ? "text-success" : "text-primary"
          )}
        />
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-2">
          <span className="font-semibold text-foreground">
            {metric.unit === "$" && "$"}
            {metric.value.toLocaleString()}
            {metric.unit === "%" && "%"}
          </span>
          <span className="text-sm text-muted-foreground">{metric.label}</span>
        </div>
        {metric.comparison && (
          <div className="flex items-center gap-1 text-xs text-muted-foreground">
            <TrendingUp className="h-3 w-3 text-success" />
            {metric.comparison}
          </div>
        )}
      </div>

      <div
        className={cn(
          "shrink-0 rounded px-2 py-0.5 text-xs font-medium uppercase tracking-wide",
          metric.type === "outcome"
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        )}
      >
        {metric.type}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={() => onDelete(metric.id)}
        >
          <Trash2 className="h-4 w-4 text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </div>
  );
}
