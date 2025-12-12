import { useState } from "react";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils, GraduationCap, Heart, PawPrint, Globe, ArrowRight } from "lucide-react";
import { Sector } from "@/lib/sectorData";
import { cn } from "@/lib/utils";

interface WelcomeModalProps {
  open: boolean;
  onSelectSector: (sector: Sector) => void;
  onSetUserName: (name: string) => void;
}

const sectors: { id: Sector; label: string; icon: React.ElementType; description: string }[] = [
  { id: "food", label: "Food Security", icon: Utensils, description: "Food banks, pantries, meal programs" },
  { id: "education", label: "Education & Youth", icon: GraduationCap, description: "Schools, tutoring, scholarships" },
  { id: "healthcare", label: "Healthcare", icon: Heart, description: "Clinics, wellness, mental health" },
  { id: "animal", label: "Animal Welfare", icon: PawPrint, description: "Shelters, rescue, adoption" },
  { id: "other", label: "Other", icon: Globe, description: "Community, environment, arts" },
];

export function WelcomeModal({ open, onSelectSector, onSetUserName }: WelcomeModalProps) {
  const [step, setStep] = useState<"name" | "sector">("name");
  const [name, setName] = useState("");

  const handleNameSubmit = () => {
    if (name.trim()) {
      onSetUserName(name.trim());
      setStep("sector");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && name.trim()) {
      handleNameSubmit();
    }
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="max-w-2xl gap-0 overflow-hidden p-0 [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {/* Header */}
        <div className="bg-gradient-to-br from-primary to-primary/80 px-8 py-10 text-center text-primary-foreground">
          <h1 className="text-2xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
            Welcome to Verity
          </h1>
          <p className="mt-2 text-primary-foreground/80">
            {step === "name" 
              ? "Let's start by getting to know you."
              : "We'll tailor your metrics and templates based on your mission."
            }
          </p>
        </div>

        {step === "name" ? (
          /* Name Input Step */
          <div className="p-8">
            <div className="mx-auto max-w-sm space-y-6">
              <div className="text-center">
                <p className="text-sm font-medium text-muted-foreground">
                  What's your name?
                </p>
              </div>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Enter your name"
                className="h-12 text-center text-lg"
                autoFocus
                maxLength={50}
              />
              <Button 
                onClick={handleNameSubmit}
                disabled={!name.trim()}
                className="w-full gap-2"
                size="lg"
              >
                Continue
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : (
          /* Sector Grid Step */
          <div className="p-8">
            <p className="mb-6 text-center text-sm font-medium text-muted-foreground">
              What type of organization are you?
            </p>
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
              {sectors.map((sector) => (
                <button
                  key={sector.id}
                  onClick={() => onSelectSector(sector.id)}
                  className={cn(
                    "group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-6 transition-all",
                    "hover:border-primary hover:bg-primary/5 hover:shadow-md",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2"
                  )}
                >
                  <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-muted transition-colors group-hover:bg-primary/10">
                    <sector.icon className="h-7 w-7 text-muted-foreground transition-colors group-hover:text-primary" />
                  </div>
                  <div className="text-center">
                    <p className="font-semibold text-foreground">{sector.label}</p>
                    <p className="mt-1 text-xs text-muted-foreground">{sector.description}</p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
