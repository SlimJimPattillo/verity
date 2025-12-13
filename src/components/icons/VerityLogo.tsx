import { cn } from "@/lib/utils";
import verityLogoImg from "@/assets/verity-logo.png";

interface VerityLogoProps {
  className?: string;
  inverted?: boolean;
}

export function VerityLogo({ className, inverted = false }: VerityLogoProps) {
  return (
    <img
      src={verityLogoImg}
      alt="Verity Logo"
      className={cn("h-10 w-10 rounded-lg object-contain", className)}
    />
  );
}
