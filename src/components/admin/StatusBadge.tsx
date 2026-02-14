import { Badge } from "@/components/ui/badge";

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    let variant: "default" | "secondary" | "destructive" | "outline" = "default";
    let label = status;

    switch (status) {
        case "CONFIRMED":
            variant = "default"; // Greenish usually or primary
            // If we want specific colors we might need custom classes
            // But using standard badge variants for now
            break;
        case "PENDING":
            variant = "secondary"; // Yellow/Gray
            break;
        case "CANCELLED":
            variant = "destructive"; // Red
            break;
        case "EXPIRED":
            variant = "outline"; // Gray/Border
            break;
        default:
            variant = "outline";
    }

    // Custom styling for specific statuses if Badge variants aren't enough
    const getCustomClass = (s: string) => {
        switch (s) {
            case "CONFIRMED": return "bg-green-100 text-green-800 hover:bg-green-100 border-green-200";
            case "PENDING": return "bg-yellow-100 text-yellow-800 hover:bg-yellow-100 border-yellow-200";
            case "CANCELLED": return "bg-red-100 text-red-800 hover:bg-red-100 border-red-200";
            case "EXPIRED": return "bg-gray-100 text-gray-800 hover:bg-gray-100 border-gray-200";
            default: return "";
        }
    };

    return (
        <Badge variant="outline" className={`font-medium ${getCustomClass(status)}`}>
            {label}
        </Badge>
    );
};
