import { useState } from "react";
import { Dialog, DialogContent, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Utensils, GraduationCap, Heart, PawPrint, Globe, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";
import { Sector } from "@/lib/sectorData";
import { cn } from "@/lib/utils";
import { VerityLogo } from "@/components/icons/VerityLogo";

interface WelcomeModalProps {
  open: boolean;
  onSelectSector: (sector: Sector) => void;
  onSetUserName: (name: string) => void;
}

const sectors: { id: Sector; label: string; icon: React.ElementType; description: string; color: string }[] = [
  { id: "food", label: "Food Security", icon: Utensils, description: "Food banks, pantries, meal programs", color: "from-orange-500 to-amber-500" },
  { id: "education", label: "Education & Youth", icon: GraduationCap, description: "Schools, tutoring, scholarships", color: "from-blue-500 to-indigo-500" },
  { id: "healthcare", label: "Healthcare", icon: Heart, description: "Clinics, wellness, mental health", color: "from-rose-500 to-pink-500" },
  { id: "animal", label: "Animal Welfare", icon: PawPrint, description: "Shelters, rescue, adoption", color: "from-emerald-500 to-teal-500" },
  { id: "other", label: "Other", icon: Globe, description: "Community, environment, arts", color: "from-violet-500 to-purple-500" },
];

const benefits = [
  "Pre-loaded metrics tailored to your sector",
  "Grant-ready narrative templates", 
  "Professional impact report designs",
];

export function WelcomeModal({ open, onSelectSector, onSetUserName }: WelcomeModalProps) {
  const [step, setStep] = useState<"welcome" | "name" | "sector">("welcome");
  const [name, setName] = useState("");
  const [selectedSector, setSelectedSector] = useState<Sector | null>(null);

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

  const handleSectorSelect = (sectorId: Sector) => {
    setSelectedSector(sectorId);
    // Small delay for visual feedback before closing
    setTimeout(() => {
      onSelectSector(sectorId);
    }, 300);
  };

  return (
    <Dialog open={open}>
      <DialogContent 
        className="max-w-2xl gap-0 overflow-hidden border-0 p-0 shadow-2xl [&>button]:hidden"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        {step === "welcome" ? (
          /* Welcome Step */
          <div className="relative">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-primary via-primary to-emerald-600 opacity-95" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(255,255,255,0.15),transparent_50%)]" />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_70%_80%,rgba(255,255,255,0.1),transparent_40%)]" />
            
            <div className="relative px-8 py-16 text-center text-primary-foreground">
              {/* Logo */}
              <div className="mx-auto mb-8 flex h-20 w-20 items-center justify-center rounded-2xl bg-white/10 backdrop-blur-sm">
                <VerityLogo className="h-14 w-14" inverted />
              </div>

              <DialogTitle className="mb-3 text-4xl tracking-tight" style={{ fontFamily: "'Playfair Display', serif", fontWeight: 700 }}>
                Welcome to Verity
              </DialogTitle>
              <DialogDescription className="mx-auto mb-10 max-w-md text-lg text-primary-foreground/80">
                Your nonprofit's impact, beautifully told. Let's set up your workspace in 30 seconds.
              </DialogDescription>

              {/* Benefits */}
              <div className="mx-auto mb-10 max-w-sm space-y-3 text-left">
                {benefits.map((benefit, i) => (
                  <div 
                    key={benefit} 
                    className="flex items-center gap-3 rounded-lg bg-white/10 px-4 py-3 backdrop-blur-sm"
                    style={{ animationDelay: `${i * 100}ms` }}
                  >
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-secondary" />
                    <span className="text-sm font-medium">{benefit}</span>
                  </div>
                ))}
              </div>

              <Button 
                onClick={() => setStep("name")}
                size="lg"
                className="gap-2 bg-white text-primary hover:bg-white/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        ) : step === "name" ? (
          /* Name Input Step */
          <div>
            {/* Progress indicator */}
            <div className="flex gap-1.5 p-4">
              <div className="h-1 flex-1 rounded-full bg-primary" />
              <div className="h-1 flex-1 rounded-full bg-muted" />
            </div>

            <div className="p-8 pt-4">
              <div className="mx-auto max-w-sm">
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-primary/10">
                    <Sparkles className="h-6 w-6 text-primary" />
                  </div>
                  <DialogTitle className="mb-2 text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                    First, what's your name?
                  </DialogTitle>
                  <DialogDescription className="text-muted-foreground">
                    We'll personalize your dashboard experience.
                  </DialogDescription>
                </div>

                <div className="space-y-6">
                  <Input
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Enter your name"
                    className="h-14 text-center text-lg"
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
            </div>
          </div>
        ) : (
          /* Sector Grid Step */
          <div>
            {/* Progress indicator */}
            <div className="flex gap-1.5 p-4">
              <div className="h-1 flex-1 rounded-full bg-primary" />
              <div className="h-1 flex-1 rounded-full bg-primary" />
            </div>

            <div className="p-8 pt-4">
              <div className="mb-8 text-center">
                <DialogTitle className="mb-2 text-2xl font-bold text-foreground" style={{ fontFamily: "'Playfair Display', serif" }}>
                  What type of organization are you?
                </DialogTitle>
                <DialogDescription className="text-muted-foreground">
                  We'll customize your metrics, templates, and AI suggestions.
                </DialogDescription>
              </div>

              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {sectors.map((sector) => (
                  <button
                    key={sector.id}
                    onClick={() => handleSectorSelect(sector.id)}
                    disabled={selectedSector !== null}
                    className={cn(
                      "group relative flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-5 transition-all duration-200",
                      "hover:border-primary hover:shadow-lg hover:-translate-y-0.5",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "disabled:pointer-events-none",
                      selectedSector === sector.id && "border-primary bg-primary/5 ring-2 ring-primary"
                    )}
                  >
                    {/* Gradient background on hover */}
                    <div className={cn(
                      "absolute inset-0 rounded-xl bg-gradient-to-br opacity-0 transition-opacity",
                      sector.color,
                      "group-hover:opacity-5",
                      selectedSector === sector.id && "opacity-10"
                    )} />
                    
                    <div className={cn(
                      "relative flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br transition-transform duration-200 group-hover:scale-110",
                      sector.color
                    )}>
                      <sector.icon className="h-6 w-6 text-white" />
                    </div>
                    <div className="relative text-center">
                      <p className="font-semibold text-foreground">{sector.label}</p>
                      <p className="mt-0.5 text-xs text-muted-foreground line-clamp-2">{sector.description}</p>
                    </div>

                    {/* Selected checkmark */}
                    {selectedSector === sector.id && (
                      <div className="absolute right-2 top-2">
                        <CheckCircle2 className="h-5 w-5 text-primary" />
                      </div>
                    )}
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
