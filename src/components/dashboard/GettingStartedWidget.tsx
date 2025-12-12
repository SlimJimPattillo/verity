import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Check, Circle, Upload, FileText, Sparkles, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ChecklistItem {
  id: string;
  label: string;
  completed: boolean;
  link?: string;
}

interface GettingStartedWidgetProps {
  progressPercent: number;
  completedSteps: {
    sectorSelected: boolean;
    logoUploaded: boolean;
    reportCreated: boolean;
    grantAnswerGenerated: boolean;
  };
  onDismiss: () => void;
}

export function GettingStartedWidget({ 
  progressPercent, 
  completedSteps,
  onDismiss,
}: GettingStartedWidgetProps) {
  const navigate = useNavigate();

  const checklist: ChecklistItem[] = [
    { id: "sector", label: "Select Sector", completed: completedSteps.sectorSelected },
    { id: "logo", label: "Upload Logo", completed: completedSteps.logoUploaded, link: "/settings" },
    { id: "report", label: "Create First Report", completed: completedSteps.reportCreated, link: "/report-builder" },
    { id: "grant", label: "Generate Grant Answer", completed: completedSteps.grantAnswerGenerated, link: "/grant-copilot" },
  ];

  const handleItemClick = (item: ChecklistItem) => {
    if (item.link && !item.completed) {
      navigate(item.link);
    }
  };

  return (
    <Card className="border-primary/20 bg-gradient-to-br from-card to-primary/5">
      <CardHeader className="flex flex-row items-start justify-between pb-3">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold">Getting Started</CardTitle>
          <p className="text-sm text-muted-foreground">
            {progressPercent}% Setup Complete
          </p>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-muted-foreground hover:text-foreground"
          onClick={onDismiss}
        >
          <X className="h-4 w-4" />
        </Button>
      </CardHeader>
      <CardContent className="space-y-4">
        <Progress value={progressPercent} className="h-2" />
        
        <ul className="space-y-2">
          {checklist.map((item) => (
            <li key={item.id}>
              <button
                onClick={() => handleItemClick(item)}
                disabled={item.completed || !item.link}
                className={cn(
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left text-sm transition-colors",
                  item.completed
                    ? "text-muted-foreground"
                    : "text-foreground hover:bg-muted/50",
                  !item.completed && item.link && "cursor-pointer"
                )}
              >
                {item.completed ? (
                  <div className="flex h-5 w-5 items-center justify-center rounded-full bg-success text-success-foreground">
                    <Check className="h-3 w-3" />
                  </div>
                ) : (
                  <Circle className="h-5 w-5 text-muted-foreground/50" />
                )}
                <span className={cn(item.completed && "line-through")}>
                  {item.label}
                </span>
                {!item.completed && item.link && (
                  <span className="ml-auto text-xs text-primary">→</span>
                )}
              </button>
            </li>
          ))}
        </ul>
      </CardContent>
    </Card>
  );
}
