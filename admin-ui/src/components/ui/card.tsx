import React from "react";

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
    variant?: "default" | "glass" | "gradient" | "bordered";
    hover?: boolean;
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
    ({ className = "", variant = "default", hover = true, ...props }, ref) => {
        const variants = {
            default: "rounded-xl border border-gray-200 bg-white text-gray-950 shadow-lg",
            glass: "rounded-xl glass shadow-xl",
            gradient: "rounded-xl bg-gradient-to-br from-white to-gray-50 border border-gray-100 shadow-lg",
            bordered: "rounded-xl border-2 border-gray-200 bg-white shadow-md",
        };

        const hoverClass = hover ? "card-lift" : "";

        return (
            <div
                ref={ref}
                className={`${variants[variant]} ${hoverClass} ${className}`}
                {...props}
            />
        );
    }
);
Card.displayName = "Card";

export const CardHeader = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div ref={ref} className={`flex flex-col space-y-1.5 p-6 ${className}`} {...props} />
    )
);
CardHeader.displayName = "CardHeader";

export const CardTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
    ({ className = "", ...props }, ref) => (
        <h3 ref={ref} className={`text-xl font-semibold leading-none tracking-tight text-gray-900 ${className}`} {...props} />
    )
);
CardTitle.displayName = "CardTitle";

export const CardContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div ref={ref} className={`p-6 pt-0 ${className}`} {...props} />
    )
);
CardContent.displayName = "CardContent";

export const CardFooter = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
    ({ className = "", ...props }, ref) => (
        <div ref={ref} className={`flex items-center p-6 pt-0 ${className}`} {...props} />
    )
);
CardFooter.displayName = "CardFooter";

