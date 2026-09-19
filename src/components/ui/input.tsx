import type { InputHTMLAttributes } from "react";

export default function Input({
  className = "",
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      {...props}
      className={`w-full rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}