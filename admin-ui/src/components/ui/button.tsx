import React from "react";
import { Loader2 } from "lucide-react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "outline" | "ghost" | "destructive" | "success" | "gradient-primary" | "gradient-secondary";
  size?: "sm" | "md" | "lg" | "icon";
  isLoading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className = "", variant = "primary", size = "md", isLoading = false, leftIcon, rightIcon, children, disabled, ...props }, ref) => {
    const baseStyles = "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 active:scale-95";

    const variants = {
      primary: "bg-primary-500 text-white hover:bg-primary-600 hover:shadow-lg hover:shadow-primary-500/30 focus-visible:ring-primary-500",
      secondary: "bg-secondary-500 text-white hover:bg-secondary-600 hover:shadow-lg hover:shadow-secondary-500/30 focus-visible:ring-secondary-500",
      success: "bg-success-500 text-white hover:bg-success-600 hover:shadow-lg hover:shadow-success-500/30 focus-visible:ring-success-500",
      outline: "border-2 border-gray-200 bg-white text-gray-700 hover:bg-gray-50 hover:border-gray-300 hover:shadow-md focus-visible:ring-gray-400",
      ghost: "text-gray-700 hover:bg-gray-100 hover:text-gray-900 focus-visible:ring-gray-400",
      destructive: "bg-danger-500 text-white hover:bg-danger-600 hover:shadow-lg hover:shadow-danger-500/30 focus-visible:ring-danger-500",
      "gradient-primary": "bg-gradient-primary text-white hover:shadow-xl hover:shadow-primary-500/40 hover:scale-105 focus-visible:ring-primary-500",
      "gradient-secondary": "bg-gradient-secondary text-white hover:shadow-xl hover:shadow-secondary-500/40 hover:scale-105 focus-visible:ring-secondary-500",
    };

    const sizes = {
      sm: "h-8 px-3 text-xs gap-1.5",
      md: "h-10 px-4 py-2 text-sm gap-2",
      lg: "h-12 px-6 text-base gap-2",
      icon: "h-10 w-10",
    };

    return (
      <button
        ref={ref}
        className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
        disabled={disabled || isLoading}
        {...props}
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        {!isLoading && leftIcon && leftIcon}
        {children}
        {!isLoading && rightIcon && rightIcon}
      </button>
    );
  }
);

Button.displayName = "Button";

