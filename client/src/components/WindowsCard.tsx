import { forwardRef } from "react";
import { cn } from "@/lib/utils";

interface WindowsCardProps extends React.HTMLAttributes<HTMLDivElement> {
  hoverable?: boolean;
  variant?: "default" | "elevated" | "outline";
}

interface WindowsCardHeaderProps extends React.HTMLAttributes<HTMLDivElement> {}
interface WindowsCardContentProps extends React.HTMLAttributes<HTMLDivElement> {}
interface WindowsCardFooterProps extends React.HTMLAttributes<HTMLDivElement> {}

const WindowsCard = forwardRef<HTMLDivElement, WindowsCardProps>(
  ({ className, hoverable = true, variant = "default", ...props }, ref) => {
    const baseClasses = "rounded-sm transition-all duration-200";
    
    const variants = {
      default: "bg-white border border-gray-200 shadow-sm",
      elevated: "bg-white border border-gray-200 shadow-lg",
      outline: "border-2 border-gray-200 bg-transparent",
    };

    return (
      <div
        ref={ref}
        className={cn(
          baseClasses,
          variants[variant],
          hoverable && "hover:shadow-md hover:-translate-y-0.5 cursor-pointer",
          "windows-card",
          className
        )}
        style={{
          background: variant === "default" ? "linear-gradient(180deg, #ffffff 0%, #fafbfc 100%)" : undefined,
          boxShadow: variant === "default" ? "0 1px 3px rgba(0, 0, 0, 0.12), 0 1px 2px rgba(0, 0, 0, 0.24)" : undefined,
        }}
        {...props}
      />
    );
  }
);
WindowsCard.displayName = "WindowsCard";

const WindowsCardHeader = forwardRef<HTMLDivElement, WindowsCardHeaderProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-4 py-3 border-b border-gray-100", className)}
      {...props}
    />
  )
);
WindowsCardHeader.displayName = "WindowsCardHeader";

const WindowsCardContent = forwardRef<HTMLDivElement, WindowsCardContentProps>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={cn("p-4", className)} {...props} />
  )
);
WindowsCardContent.displayName = "WindowsCardContent";

const WindowsCardFooter = forwardRef<HTMLDivElement, WindowsCardFooterProps>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("px-4 py-3 border-t border-gray-100", className)}
      {...props}
    />
  )
);
WindowsCardFooter.displayName = "WindowsCardFooter";

export { WindowsCard, WindowsCardHeader, WindowsCardContent, WindowsCardFooter };