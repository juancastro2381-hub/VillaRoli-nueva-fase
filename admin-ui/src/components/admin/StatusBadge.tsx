import { Badge } from "../ui/badge";

interface StatusBadgeProps {
    status: string;
}

export const StatusBadge = ({ status }: StatusBadgeProps) => {
    const statusConfig: Record<string, { variant: "success" | "warning" | "danger" | "default"; withDot?: boolean; pulse?: boolean }> = {
        "CONFIRMED": { variant: "success", withDot: true },
        "PENDING": { variant: "warning", withDot: true, pulse: true },
        "CANCELLED": { variant: "danger" },
        "EXPIRED": { variant: "default" },
        "COMPLETED": { variant: "success" },
    };

    const config = statusConfig[status] || { variant: "default" as const };

    return (
        <Badge {...config} className="font-medium uppercase">
            {status}
        </Badge>
    );
};

