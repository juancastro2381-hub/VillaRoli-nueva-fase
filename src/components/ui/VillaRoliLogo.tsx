import { cn } from "@/lib/utils";
import logoImage from "@/assets/villa-roli-logo.png";

interface VillaRoliLogoProps {
  className?: string;
  variant?: "light" | "dark";
  showTagline?: boolean;
}

export function VillaRoliLogo({ 
  className, 
  variant = "dark",
  showTagline = false 
}: VillaRoliLogoProps) {
  return (
    <div className={cn("flex items-center", className)}>
      <img 
        src={logoImage} 
        alt="Villa Roli - Finca de recreación y turismo"
        className="h-12 md:h-14 w-auto object-contain"
      />
    </div>
  );
}
