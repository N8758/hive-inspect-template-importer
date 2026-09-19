import type { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "danger";
  size?: "default" | "small" | "large";
}

export default function Button({
  variant = "default",
  size = "default",
  className = "",
  children,
  ...props
}: ButtonProps) {
  const variantClasses = {
    default: "bg-black text-white hover:opacity-90",
    outline: "border bg-white text-black hover:bg-gray-50",
    danger: "bg-red-600 text-white hover:bg-red-700",
  };

  const sizeClasses = {
    small: "px-3 py-1.5 text-xs",
    default: "px-4 py-2 text-sm",
    large: "px-5 py-2.5 text-base",
  };

  return (
    <button
      {...props}
      className={`inline-flex items-center justify-center rounded-md font-medium transition disabled:cursor-not-allowed disabled:opacity-50 ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}
    >
      {children}
    </button>
  );
}