import type { TextareaHTMLAttributes } from "react";

export default function Textarea({
  className = "",
  ...props
}: TextareaHTMLAttributes<HTMLTextAreaElement>) {
  return (
    <textarea
      {...props}
      className={`w-full resize-y rounded-md border bg-white px-3 py-2 text-sm outline-none transition focus:ring-2 disabled:cursor-not-allowed disabled:opacity-50 ${className}`}
    />
  );
}