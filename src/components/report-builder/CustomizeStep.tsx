import { Palette, Type, Calendar } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface CustomizeStepProps {
  settings: {
    title: string;
    dateRange: string;
    primaryColor: string;
    secondaryColor: string;
    neutralColor: string;
  };
  onSettingsChange: (updates: Partial<{ 
    title: string; 
    dateRange: string; 
    primaryColor: string;
    secondaryColor: string;
    neutralColor: string;
  }>) => void;
}

const colorPresets = {
  primary: ["#059669", "#3B82F6", "#8B5CF6", "#EC4899", "#F59E0B"],
  secondary: ["#FFC27B", "#93C5FD", "#C4B5FD", "#FBCFE8", "#FDE68A"],
  neutral: ["#F9FAFB", "#F3F4F6", "#E5E7EB", "#1F2937", "#111827"],
};

interface ColorPickerProps {
  label: string;
  description: string;
  value: string;
  onChange: (value: string) => void;
  presets: string[];
}

function ColorPicker({ label, description, value, onChange, presets }: ColorPickerProps) {
  return (
    <div className="space-y-2">
      <div>
        <Label className="text-sm font-medium">{label}</Label>
        <p className="text-xs text-muted-foreground">{description}</p>
      </div>
      <div className="flex items-center gap-3">
        <div className="relative">
          <input
            type="color"
            value={value}
            onChange={(e) => onChange(e.target.value)}
            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
          />
          <div 
            className="h-10 w-10 rounded-lg border border-border shadow-sm cursor-pointer transition-transform hover:scale-105"
            style={{ backgroundColor: value }}
          />
        </div>
        <Input
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="h-10 w-28 font-mono text-sm uppercase"
        />
        <div className="flex gap-1.5">
          {presets.map((color) => (
            <button
              key={color}
              onClick={() => onChange(color)}
              className={`h-6 w-6 rounded-full border-2 transition-all hover:scale-110 ${
                value === color ? "border-foreground" : "border-transparent"
              }`}
              style={{ backgroundColor: color }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

export function CustomizeStep({ settings, onSettingsChange }: CustomizeStepProps) {
  return (
    <div className="space-y-6 animate-fade-in">
      <div className="text-center">
        <div className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 mb-3">
          <Palette className="h-6 w-6 text-primary" />
        </div>
        <h2 className="text-xl font-semibold text-foreground">Customize Your Report</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Add your branding and report details
        </p>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Type className="h-4 w-4 text-muted-foreground" />
            Report Title
          </Label>
          <Input
            value={settings.title}
            onChange={(e) => onSettingsChange({ title: e.target.value })}
            placeholder="e.g., 2024 Annual Impact Report"
            className="h-10"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2 text-sm font-medium">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Date Range
          </Label>
          <Input
            value={settings.dateRange}
            onChange={(e) => onSettingsChange({ dateRange: e.target.value })}
            placeholder="e.g., January - December 2024"
            className="h-10"
          />
        </div>
      </div>

      <div className="space-y-4 pt-2">
        <h3 className="text-sm font-medium flex items-center gap-2">
          <Palette className="h-4 w-4 text-muted-foreground" />
          Brand Colors
        </h3>
        
        <ColorPicker
          label="Primary"
          description="Headers, buttons, and key elements"
          value={settings.primaryColor}
          onChange={(color) => onSettingsChange({ primaryColor: color })}
          presets={colorPresets.primary}
        />
        
        <ColorPicker
          label="Secondary"
          description="Charts, icons, and accents"
          value={settings.secondaryColor}
          onChange={(color) => onSettingsChange({ secondaryColor: color })}
          presets={colorPresets.secondary}
        />
        
        <ColorPicker
          label="Neutral"
          description="Backgrounds and surfaces"
          value={settings.neutralColor}
          onChange={(color) => onSettingsChange({ neutralColor: color })}
          presets={colorPresets.neutral}
        />
      </div>
    </div>
  );
}
