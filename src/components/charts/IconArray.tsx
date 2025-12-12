import { User, Heart, Home, GraduationCap, Apple, Baby, Stethoscope, Leaf } from "lucide-react";

interface IconArrayProps {
  value: number;
  unit: string;
  primaryColor: string;
  maxIcons?: number;
}

const iconOptions = [User, Heart, Home, GraduationCap, Apple, Baby, Stethoscope, Leaf];

export function IconArray({
  value,
  unit,
  primaryColor,
  maxIcons = 50,
}: IconArrayProps) {
  // Calculate how many icons to show and what each represents
  let iconsToShow = value;
  let multiplier = 1;

  if (value > maxIcons) {
    multiplier = Math.ceil(value / maxIcons);
    iconsToShow = Math.min(Math.ceil(value / multiplier), maxIcons);
  }

  // Choose icon based on unit
  const Icon = unit === "People" ? User : iconOptions[0];

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap gap-1">
        {Array.from({ length: iconsToShow }).map((_, index) => (
          <Icon
            key={index}
            className="h-3 w-3"
            style={{ color: primaryColor }}
          />
        ))}
      </div>
      {multiplier > 1 && (
        <p className="text-[9px] text-slate-500">
          Each icon = {multiplier.toLocaleString()} {unit === "People" ? "people" : "units"}
        </p>
      )}
    </div>
  );
}
