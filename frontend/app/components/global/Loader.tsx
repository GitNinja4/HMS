import React from "react";

interface LoaderProps {
  size?: "sm" | "md" | "lg";
  label?: string;
  variant?: "blue" | "white";
  ariaLabel?: string;
}

const Loader: React.FC<LoaderProps> = ({
  size = "md",
  label,
  variant = "blue",
  ariaLabel = "Loading",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4 border-2",
    md: "w-8 h-8 border-3",
    lg: "w-12 h-12 border-4",
  };

  const colorClasses = {
    blue: "border-blue-600/20 border-t-blue-600",
    white: "border-white/30 border-t-white",
  };

  return (
    <div
      className="flex flex-col items-center justify-center gap-3"
      role="status"
      aria-live="polite"
      aria-label={ariaLabel}
      aria-busy="true"
    >
      <div
        className={`${sizeClasses[size]} ${colorClasses[variant]} rounded-full animate-spin`}
        aria-hidden="true"
      />
      {label && (
        <span
          className={`text-xs font-bold tracking-wider uppercase animate-pulse ${variant === "white" ? "text-white/80" : "text-blue-600"}`}
          aria-hidden="true"
        >
          {label}
        </span>
      )}
    </div>
  );
};

export default Loader;
