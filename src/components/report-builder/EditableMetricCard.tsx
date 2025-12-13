import { useState, useRef, useEffect } from "react";
import { Metric } from "@/lib/mockData";
import { cn } from "@/lib/utils";
import { TrendingUp, Users, Hash, DollarSign, Percent, Pencil } from "lucide-react";
import { MicroBarChart } from "@/components/charts/MicroBarChart";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

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
  const [showHint, setShowHint] = useState(false);
  
  const labelRef = useRef<HTMLSpanElement>(null);
  const valueRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    setEditLabel(metric.label);
    setEditValue(metric.value.toString());
  }, [metric.label, metric.value]);

  // Show hint briefly when card is first selected
  useEffect(() => {
    if (isSelected && !isEditingLabel && !isEditingValue) {
      setShowHint(true);
      const timer = setTimeout(() => setShowHint(false), 3000);
      return () => clearTimeout(timer);
    }
  }, [isSelected]);

  const handleLabelDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingLabel(true);
    setShowHint(false);
  };

  const handleValueDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditingValue(true);
    setShowHint(false);
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

  const EditableText = ({ 
    isEditing, 
    value, 
    displayValue, 
    onDoubleClick, 
    onBlur, 
    onInput, 
    onKeyDown, 
    className,
    editClassName 
  }: {
    isEditing: boolean;
    value: string;
    displayValue: string;
    onDoubleClick: (e: React.MouseEvent) => void;
    onBlur: () => void;
    onInput: (e: React.FormEvent<HTMLSpanElement>) => void;
    onKeyDown: (e: React.KeyboardEvent) => void;
    className?: string;
    editClassName?: string;
  }) => {
    if (isEditing) {
      return (
        <span
          contentEditable
          suppressContentEditableWarning
          onBlur={onBlur}
          onKeyDown={onKeyDown}
          onInput={onInput}
          className={cn(
            "outline-none ring-2 ring-primary rounded px-1 bg-white",
            editClassName
          )}
        >
          {value}
        </span>
      );
    }

    return (
      <TooltipProvider delayDuration={0}>
        <Tooltip>
          <TooltipTrigger asChild>
            <span
              onDoubleClick={onDoubleClick}
              className={cn(
                "cursor-text rounded px-1 transition-all duration-200 group/text relative inline-flex items-center gap-1",
                isSelected 
                  ? "hover:bg-primary/10 bg-primary/5" 
                  : "hover:bg-slate-100",
                className
              )}
            >
              {displayValue}
              {isSelected && (
                <Pencil className="h-3 w-3 text-primary/50 opacity-0 group-hover/text:opacity-100 transition-opacity" />
              )}
            </span>
          </TooltipTrigger>
          <TooltipContent side="top" className="text-xs">
            Double-click to edit
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  };

  if (variant === "hero") {
    return (
      <div
        onClick={onSelect}
        className={cn(
          "cursor-pointer rounded-xl border-2 px-8 py-10 text-center transition-all duration-200 relative group",
          isSelected 
            ? "border-primary ring-2 ring-primary/20 shadow-lg" 
            : "border-transparent hover:border-primary/30 hover:shadow-md"
        )}
      >
        {/* Selection indicator */}
        {isSelected && (
          <div className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-primary px-3 py-1 text-[10px] font-medium text-white shadow-sm animate-fade-in">
            Editing
          </div>
        )}
        
        {/* Inline edit hint */}
        {isSelected && showHint && (
          <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-slate-800 px-3 py-1 text-[10px] text-white shadow-lg animate-fade-in whitespace-nowrap">
            Double-click text to edit inline
          </div>
        )}

        <p className="mb-2 text-sm font-medium uppercase tracking-wide text-slate-500">
          Verified Impact
        </p>
        <p
          className="text-5xl font-bold"
          style={{ color: primaryColor }}
        >
          {metric.unit === "$" && "$"}
          <EditableText
            isEditing={isEditingValue}
            value={editValue}
            displayValue={metric.value.toLocaleString()}
            onDoubleClick={handleValueDoubleClick}
            onBlur={handleValueBlur}
            onInput={(e) => setEditValue(e.currentTarget.textContent || "")}
            onKeyDown={(e) => handleKeyDown(e, "value")}
          />
          {metric.unit === "%" && "%"}
        </p>
        <p className="mt-2 text-lg font-medium text-slate-700">
          <EditableText
            isEditing={isEditingLabel}
            value={editLabel}
            displayValue={metric.label}
            onDoubleClick={handleLabelDoubleClick}
            onBlur={handleLabelBlur}
            onInput={(e) => setEditLabel(e.currentTarget.textContent || "")}
            onKeyDown={(e) => handleKeyDown(e, "label")}
          />
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
        "cursor-pointer rounded-xl border-2 bg-white p-4 transition-all duration-200 relative group",
        isSelected 
          ? "border-primary ring-2 ring-primary/20 shadow-lg" 
          : "border-slate-200 hover:border-primary/30 hover:shadow-md"
      )}
    >
      {/* Selection indicator */}
      {isSelected && (
        <div className="absolute -top-2 -right-2 flex h-6 w-6 items-center justify-center rounded-full bg-primary text-white shadow-sm animate-scale-in">
          <Pencil className="h-3 w-3" />
        </div>
      )}

      <div className="flex items-start gap-3">
        <div
          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg transition-transform duration-200 group-hover:scale-105"
          style={{ backgroundColor: `${primaryColor}15` }}
        >
          <Icon className="h-5 w-5" style={{ color: primaryColor }} />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-2xl font-bold text-slate-800">
            {metric.unit === "$" && "$"}
            <EditableText
              isEditing={isEditingValue}
              value={editValue}
              displayValue={metric.value.toLocaleString()}
              onDoubleClick={handleValueDoubleClick}
              onBlur={handleValueBlur}
              onInput={(e) => setEditValue(e.currentTarget.textContent || "")}
              onKeyDown={(e) => handleKeyDown(e, "value")}
            />
            {metric.unit === "%" && "%"}
          </p>
          <p className="mt-1 text-xs font-medium text-slate-500">
            <EditableText
              isEditing={isEditingLabel}
              value={editLabel}
              displayValue={metric.label}
              onDoubleClick={handleLabelDoubleClick}
              onBlur={handleLabelBlur}
              onInput={(e) => setEditLabel(e.currentTarget.textContent || "")}
              onKeyDown={(e) => handleKeyDown(e, "label")}
            />
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
