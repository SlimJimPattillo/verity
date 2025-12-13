import { Check, LayoutTemplate, Upload, Pencil, Palette, Download } from "lucide-react";
import { cn } from "@/lib/utils";

export type BuilderStep = "template" | "upload" | "edit" | "customize" | "export";

interface Step {
  id: BuilderStep;
  label: string;
  icon: React.ElementType;
}

const steps: Step[] = [
  { id: "template", label: "Template", icon: LayoutTemplate },
  { id: "upload", label: "Upload", icon: Upload },
  { id: "edit", label: "Edit", icon: Pencil },
  { id: "customize", label: "Customize", icon: Palette },
  { id: "export", label: "Export", icon: Download },
];

interface ReportBuilderStepperProps {
  currentStep: BuilderStep;
  completedSteps: BuilderStep[];
  onStepClick: (step: BuilderStep) => void;
}

export function ReportBuilderStepper({
  currentStep,
  completedSteps,
  onStepClick,
}: ReportBuilderStepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep);

  return (
    <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-card">
      {steps.map((step, index) => {
        const Icon = step.icon;
        const isCompleted = completedSteps.includes(step.id);
        const isCurrent = currentStep === step.id;
        const isClickable = isCompleted || index <= currentIndex;

        return (
          <div key={step.id} className="flex items-center">
            <button
              onClick={() => isClickable && onStepClick(step.id)}
              disabled={!isClickable}
              className={cn(
                "flex items-center gap-2 rounded-full px-3 py-1.5 transition-all",
                isCurrent && "bg-primary text-primary-foreground",
                isCompleted && !isCurrent && "bg-primary/10 text-primary hover:bg-primary/20",
                !isCurrent && !isCompleted && "text-muted-foreground",
                isClickable && !isCurrent && "cursor-pointer",
                !isClickable && "cursor-not-allowed opacity-50"
              )}
            >
              <div className={cn(
                "flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium",
                isCurrent && "bg-primary-foreground/20",
                isCompleted && !isCurrent && "bg-primary/20",
                !isCurrent && !isCompleted && "bg-muted"
              )}>
                {isCompleted && !isCurrent ? (
                  <Check className="h-3.5 w-3.5" />
                ) : (
                  <Icon className="h-3.5 w-3.5" />
                )}
              </div>
              <span className="text-sm font-medium hidden sm:inline">{step.label}</span>
            </button>

            {index < steps.length - 1 && (
              <div className={cn(
                "mx-2 h-px w-8 sm:w-12",
                index < currentIndex ? "bg-primary" : "bg-border"
              )} />
            )}
          </div>
        );
      })}
    </div>
  );
}
