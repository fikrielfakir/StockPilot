import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface WindowsButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "primary" | "secondary" | "success" | "danger" | "outline";
  size?: "sm" | "md" | "lg";
}

const WindowsButton = forwardRef<HTMLButtonElement, WindowsButtonProps>(
  ({ className, variant = "default", size = "md", ...props }, ref) => {
    const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
    
    const variants = {
      default: "windows-button text-gray-700",
      primary: "windows-button-primary",
      secondary: "bg-gray-100 text-gray-700 border border-gray-300 hover:bg-gray-200",
      success: "bg-green-600 text-white border border-green-700 hover:bg-green-700",
      danger: "bg-red-600 text-white border border-red-700 hover:bg-red-700",
      outline: "border border-gray-300 text-gray-700 bg-transparent hover:bg-gray-50",
    };

    const sizes = {
      sm: "px-3 py-1.5 text-sm rounded-sm",
      md: "px-4 py-2 text-sm rounded-sm",
      lg: "px-6 py-3 text-base rounded-sm",
    };

    return (
      <button
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          sizes[size],
          className
        )}
        {...props}
      />
    );
  }
);
WindowsButton.displayName = "WindowsButton";

export { WindowsButton };