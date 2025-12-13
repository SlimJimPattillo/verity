import { useSortable } from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, Hash, DollarSign, Percent, GripVertical, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";

interface SortableMetricCardProps {
  metric: Metric;
  onDelete?: (id: string) => void;
  isSelected?: boolean;
  onSelect?: () => void;
}

const unitIcons = {
  "$": DollarSign,
  "%": Percent,
  "People": Users,
  "#": Hash,
};

export function SortableMetricCard({ metric, onDelete, isSelected, onSelect }: SortableMetricCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: metric.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  const Icon = unitIcons[metric.unit];

  return (
    <div
      ref={setNodeRef}
      style={style}
      onClick={onSelect}
      className={cn(
        "group flex cursor-pointer items-center gap-2 rounded-lg border p-2 transition-all",
        metric.type === "outcome"
          ? "border-success/30 bg-success/5"
          : "border-border bg-card",
        isDragging && "opacity-50 shadow-lg",
        isSelected && "ring-2 ring-primary ring-offset-1"
      )}
    >
      <div
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none"
        onClick={(e) => e.stopPropagation()}
      >
        <GripVertical className="h-3 w-3 text-muted-foreground" />
      </div>
      
      <div
        className={cn(
          "flex h-7 w-7 shrink-0 items-center justify-center rounded",
          metric.type === "outcome" ? "bg-success/10" : "bg-primary/10"
        )}
      >
        <Icon
          className={cn(
            "h-3.5 w-3.5",
            metric.type === "outcome" ? "text-success" : "text-primary"
          )}
        />
      </div>
      
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <span className="text-xs font-semibold text-foreground">
            {metric.unit === "$" && "$"}
            {metric.value.toLocaleString()}
            {metric.unit === "%" && "%"}
          </span>
          <span className="truncate text-[10px] text-muted-foreground">{metric.label}</span>
        </div>
      </div>

      <div
        className={cn(
          "shrink-0 rounded px-1.5 py-0.5 text-[9px] font-medium uppercase tracking-wide",
          metric.type === "outcome"
            ? "bg-success/10 text-success"
            : "bg-muted text-muted-foreground"
        )}
      >
        {metric.type === "outcome" ? "out" : "in"}
      </div>

      {onDelete && (
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 transition-opacity group-hover:opacity-100"
          onClick={(e) => {
            e.stopPropagation();
            onDelete(metric.id);
          }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground hover:text-destructive" />
        </Button>
      )}
    </div>
  );
}
