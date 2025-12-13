import { Plus, GripVertical, Trash2, Pencil } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { useState } from "react";

interface MetricsEditorProps {
  metrics: Metric[];
  onMetricsChange: (metrics: Metric[]) => void;
  onAddMetric: () => void;
}

function SortableMetricRow({ 
  metric, 
  onUpdate, 
  onDelete,
  isEditing,
  onEditToggle,
}: { 
  metric: Metric; 
  onUpdate: (updates: Partial<Metric>) => void;
  onDelete: () => void;
  isEditing: boolean;
  onEditToggle: () => void;
}) {
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

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={cn(
        "rounded-lg border bg-card transition-all",
        isDragging ? "shadow-lg opacity-90 z-10" : "shadow-sm",
        isEditing && "ring-2 ring-primary"
      )}
    >
      <div className="flex items-center gap-2 p-3">
        <button
          {...attributes}
          {...listeners}
          className="cursor-grab text-muted-foreground hover:text-foreground touch-none"
        >
          <GripVertical className="h-4 w-4" />
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="font-medium text-sm text-foreground truncate">
              {metric.label}
            </span>
            <span className={cn(
              "shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase",
              metric.type === "outcome" 
                ? "bg-primary/10 text-primary" 
                : "bg-muted text-muted-foreground"
            )}>
              {metric.type}
            </span>
          </div>
          <p className="text-xs text-muted-foreground">
            {metric.unit === "$" ? "$" : ""}{metric.value.toLocaleString()}{metric.unit === "%" ? "%" : ""}{metric.unit === "People" ? " people" : ""}
          </p>
        </div>

        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0"
          onClick={onEditToggle}
        >
          <Pencil className="h-3.5 w-3.5" />
        </Button>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 shrink-0 text-muted-foreground hover:text-destructive"
          onClick={onDelete}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      </div>

      {isEditing && (
        <div className="border-t p-3 space-y-3 bg-muted/30">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Label</Label>
              <Input
                value={metric.label}
                onChange={(e) => onUpdate({ label: e.target.value })}
                className="h-8 text-sm"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs text-muted-foreground">Value</Label>
              <Input
                type="number"
                value={metric.value}
                onChange={(e) => onUpdate({ value: parseFloat(e.target.value) || 0 })}
                className="h-8 text-sm"
              />
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-xs text-muted-foreground">Type</span>
            <div className="flex items-center gap-2">
              <span className={cn("text-xs", metric.type === "output" ? "text-foreground" : "text-muted-foreground")}>
                Output
              </span>
              <Switch
                checked={metric.type === "outcome"}
                onCheckedChange={(checked) => onUpdate({ type: checked ? "outcome" : "output" })}
              />
              <span className={cn("text-xs", metric.type === "outcome" ? "text-foreground" : "text-muted-foreground")}>
                Outcome
              </span>
            </div>
          </div>

          <div className="grid grid-cols-4 gap-1">
            {(["#", "$", "%", "People"] as const).map((unit) => (
              <Button
                key={unit}
                variant={metric.unit === unit ? "default" : "outline"}
                size="sm"
                className="text-xs h-7"
                onClick={() => onUpdate({ unit })}
              >
                {unit}
              </Button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function MetricsEditor({ metrics, onMetricsChange, onAddMetric }: MetricsEditorProps) {
  const [editingId, setEditingId] = useState<string | null>(null);
  
  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    if (over && active.id !== over.id) {
      const oldIndex = metrics.findIndex((m) => m.id === active.id);
      const newIndex = metrics.findIndex((m) => m.id === over.id);
      onMetricsChange(arrayMove(metrics, oldIndex, newIndex));
    }
  };

  const handleUpdate = (id: string, updates: Partial<Metric>) => {
    onMetricsChange(metrics.map((m) => (m.id === id ? { ...m, ...updates } : m)));
  };

  const handleDelete = (id: string) => {
    onMetricsChange(metrics.filter((m) => m.id !== id));
    if (editingId === id) setEditingId(null);
  };

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="text-center">
        <h2 className="text-xl font-semibold text-foreground">Review Your Data</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit, reorder, or add more metrics
        </p>
      </div>

      <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
        <DndContext
          sensors={sensors}
          collisionDetection={closestCenter}
          onDragEnd={handleDragEnd}
        >
          <SortableContext
            items={metrics.map((m) => m.id)}
            strategy={verticalListSortingStrategy}
          >
            {metrics.map((metric) => (
              <SortableMetricRow
                key={metric.id}
                metric={metric}
                onUpdate={(updates) => handleUpdate(metric.id, updates)}
                onDelete={() => handleDelete(metric.id)}
                isEditing={editingId === metric.id}
                onEditToggle={() => setEditingId(editingId === metric.id ? null : metric.id)}
              />
            ))}
          </SortableContext>
        </DndContext>

        {metrics.length === 0 && (
          <div className="flex flex-col items-center justify-center rounded-xl border-2 border-dashed border-border py-8 text-center">
            <p className="text-sm text-muted-foreground">No metrics added yet</p>
          </div>
        )}
      </div>

      <Button
        variant="outline"
        className="w-full gap-2 border-dashed"
        onClick={onAddMetric}
      >
        <Plus className="h-4 w-4" />
        Add Another Metric
      </Button>
    </div>
  );
}
