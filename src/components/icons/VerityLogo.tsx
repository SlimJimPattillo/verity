import verityLogoSrc from "@/assets/verity-logo.png";

export function VerityLogo({ className }: { className?: string }) {
  return (
    <img
      src={verityLogoSrc}
      alt="Verity Logo"
      className={className}
    />
  );
}
