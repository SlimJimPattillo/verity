import { useState, useRef, useEffect } from "react";
import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, Hash, DollarSign, Percent } from "lucide-react";
import { MicroBarChart } from "@/components/charts/MicroBarChart";

interface EditableMetricCardProps {
  metric: Metric;
  isSelected: boolean;
  primaryColor: string;
  onSelect: () => void;
  onUpdate: (id: string, updates: Partial<Metric>) => void;
  variant?: "hero" | "grid";
}

const unitIcons = {
  "$": DollarSign,
  "%": Percent,
  "People": Users,
  "#": Hash,
};

export function EditableMetricCard({
  metric,
  isSelected,
  primaryColor,
  onSelect,
  onUpdate,
  variant = "grid",
}: EditableMetricCardProps) {
  const [isEditingLabel, setIsEditingLabel] = useState(false);
  const [isEditingValue, setIsEditingValue] = useState(false);
  const [editLabel, setEditLabel] = useState(metric.label);
  const [editValue, setEditValue] = useState(metric.value.toString());
  
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEditLabel(metric.label);
    setEditValue(metric.value.toString());
  }, [metric.label, metric.value]);

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(true);
  };

  const handleValueDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingValue(true);
  };

  const handleLabelBlur = () => {
    setIsEditingLabel(false);
    if (editLabel.trim() && editLabel !== metric.label) {
      onUpdate(metric.id, { label: editLabel.trim() });
    } else {
      setEditLabel(metric.label);
    }
  };

  const handleValueBlur = () => {
    setIsEditingValue(false);
    const numValue = parseFloat(editValue);
    if (!isNaN(numValue) && numValue !== metric.value) {
      onUpdate(metric.id, { value: numValue });
    } else {
      setEditValue(metric.value.toString());
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, type: "label" | "value") => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (type === "label") handleLabelBlur();
      else handleValueBlur();
    }
    if (e.key === "Escape") {
      if (type === "label") {
        setEditLabel(metric.label);
        setIsEditingLabel(false);
      } else {
        setEditValue(metric.value.toString());
        setIsEditingValue(false);
      }
    }
  };

  const Icon = unitIcons[metric.unit];

  if (variant === "hero") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "cursor-pointer rounded-lg border-2 border-transparent px-8 py-10 text-center transition-all",
          isSelected && "border-primary ring-2 ring-primary/20"
        )}
      >
        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Verified Impact
        </p>
        <p
          className="text-5xl font-bold"
          style={{ color: primaryColor }}
        >
          {metric.unit === "$" && "$"}
          {isEditingValue ? (
            <span
              ref={valueRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleValueBlur}
              onKeyDown={(e) => handleKeyDown(e, "value")}
              onInput={(e) => setEditValue(e.currentTarget.textContent || "")}
              className="outline-none ring-2 ring-primary/50 rounded px-1"
            >
              {editValue}
            </span>
          ) : (
            <span
              onDoubleClick={handleValueDoubleClick}
              className="cursor-text hover:bg-primary/10 rounded px-1 transition-colors"
            >
              {metric.value.toLocaleString()}
            </span>
          )}
          {metric.unit === "%" && "%"}
        </p>
        <p className="mt-2 text-lg font-medium text-slate-700">
          {isEditingLabel ? (
            <span
              ref={labelRef}
              contentEditable
              suppressContentEditableWarning
              onBlur={handleLabelBlur}
              onKeyDown={(e) => handleKeyDown(e, "label")}
              onInput={(e) => setEditLabel(e.currentTarget.textContent || "")}
              className="outline-none ring-2 ring-primary/50 rounded px-1"
            >
              {editLabel}
            </span>
          ) : (
            <span
              onDoubleClick={handleLabelDoubleClick}
              className="cursor-text hover:bg-primary/10 rounded px-1 transition-colors"
            >
              {metric.label}
            </span>
          )}
        </p>
        {metric.comparison && metric.previousValue ? (
          <div className="mx-auto mt-4 max-w-[200px]">
            <MicroBarChart
              currentValue={metric.value}
              previousValue={metric.previousValue}
              primaryColor={primaryColor}
            />
            <p className="mt-1 flex items-center justify-center gap-1 text-xs" style={{ color: primaryColor }}>
              <TrendingUp className="h-3 w-3" />
              {metric.comparison}
            </p>
          </div>
        ) : metric.comparison ? (
          <div 
            className="mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1 text-xs font-medium"
            style={{ backgroundColor: `${primaryColor}15`, color: primaryColor }}
          >
            <TrendingUp className="h-3 w-3" />
            {metric.comparison}
          </div>
        ) : null}
      </div>
    );
  }

  return (
    <div
      onClick={onSelect}
      className={cn(
        "cursor-pointer rounded-lg border-2 border-transparent border-slate-200 bg-white p-4 transition-all hover:border-primary/50",
        isSelected && "border-primary ring-2 ring-primary/20"
      )}
    >
      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: primaryColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold text-slate-800">
            {metric.unit === "$" && "$"}
            {isEditingValue ? (
              <span
                ref={valueRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleValueBlur}
                onKeyDown={(e) => handleKeyDown(e, "value")}
                onInput={(e) => setEditValue(e.currentTarget.textContent || "")}
                className="outline-none ring-2 ring-primary/50 rounded px-1"
              >
                {editValue}
              </span>
            ) : (
              <span
                onDoubleClick={handleValueDoubleClick}
                className="cursor-text hover:bg-slate-100 rounded px-1 transition-colors"
              >
                {metric.value.toLocaleString()}
              </span>
            )}
            {metric.unit === "%" && "%"}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            {isEditingLabel ? (
              <span
                ref={labelRef}
                contentEditable
                suppressContentEditableWarning
                onBlur={handleLabelBlur}
                onKeyDown={(e) => handleKeyDown(e, "label")}
                onInput={(e) => setEditLabel(e.currentTarget.textContent || "")}
                className="outline-none ring-2 ring-primary/50 rounded px-1"
              >
                {editLabel}
              </span>
            ) : (
              <span
                onDoubleClick={handleLabelDoubleClick}
                className="cursor-text hover:bg-slate-100 rounded px-1 transition-colors"
              >
                {metric.label}
              </span>
            )}
          </p>
        </div>
      </div>
      {metric.previousValue && (
        <div className="mt-3">
          <MicroBarChart
            currentValue={metric.value}
            previousValue={metric.previousValue}
            primaryColor={primaryColor}
          />
          {metric.comparison && (
            <p className="mt-1 text-[10px] text-slate-500">{metric.comparison}</p>
          )}
        </div>
      )}
    </div>
  );
}
