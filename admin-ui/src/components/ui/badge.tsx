import React from "react";

interface BadgeProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "primary" | "secondary" | "success" | "warning" | "danger" | "outline";
    withDot?: boolean;
    pulse?: boolean;
}

export const Badge = ({ className = "", variant = "default", withDot = false, pulse = false, children, ...props }: BadgeProps) => {
    const baseStyles = "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-all duration-200 gap-1.5";

    const variants = {
        default: "border-gray-300 bg-gray-100 text-gray-800 hover:bg-gray-200",
        primary: "border-primary-300 bg-primary-100 text-primary-800 hover:bg-primary-200",
        secondary: "border-secondary-300 bg-secondary-100 text-secondary-800 hover:bg-secondary-200",
        success: "border-success-300 bg-success-100 text-success-800 hover:bg-success-200",
        warning: "border-warning-300 bg-warning-100 text-warning-800 hover:bg-warning-200",
        danger: "border-danger-300 bg-danger-100 text-danger-800 hover:bg-danger-200",
        outline: "border-gray-300 bg-transparent text-gray-700 hover:bg-gray-50",
    };

    const dotColors = {
        default: "bg-gray-500",
        primary: "bg-primary-500",
        secondary: "bg-secondary-500",
        success: "bg-success-500",
        warning: "bg-warning-500",
        danger: "bg-danger-500",
        outline: "bg-gray-500",
    };

    return (
        <div className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
            {withDot && (
                <span className={`h-1.5 w-1.5 rounded-full ${dotColors[variant]} ${pulse ? 'animate-pulse' : ''}`} />
            )}
            {children}
        </div>
    );
};

