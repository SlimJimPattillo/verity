import { cn } from "@/lib/utils";

interface VerityLogoProps {
  className?: string;
  inverted?: boolean;
}

export function VerityLogo({ className, inverted = false }: VerityLogoProps) {
  return (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-8 w-8", className)}
    >
      {/* Background rounded square */}
      <rect
        x="0"
        y="0"
        width="40"
        height="40"
        rx="8"
        className={inverted ? "fill-white" : "fill-primary"}
      />
      {/* V shape with upward arrow */}
      <path
        d="M20 8L20 24M20 24L12 16M20 24L28 16"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={inverted ? "stroke-primary" : "stroke-white"}
      />
      <path
        d="M10 28L20 34L30 28"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
        className={inverted ? "stroke-primary" : "stroke-white"}
      />
    </svg>
  );
}
