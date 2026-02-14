import React from "react";

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
    hasError?: boolean;
}

export const Input = React.forwardRef<HTMLInputElement, InputProps>(
    ({ className = "", hasError = false, ...props }, ref) => {
        const baseStyles = "flex h-10 w-full rounded-lg border bg-white px-3 py-2 text-sm transition-all duration-200 file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-gray-400 focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50";

        const stateStyles = hasError
            ? "border-danger-300 focus-visible:ring-2 focus-visible:ring-danger-500 focus-visible:border-danger-500"
            : "border-gray-200 focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:border-primary-500 hover:border-gray-300";

        return (
            <input
                ref={ref}
                className={`${baseStyles} ${stateStyles} ${className}`}
                {...props}
            />
        );
    }
);

Input.displayName = "Input";
