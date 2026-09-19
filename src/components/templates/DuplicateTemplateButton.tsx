"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

interface DuplicateTemplateButtonProps {
  templateId: string;
}

export default function DuplicateTemplateButton({
  templateId,
}: DuplicateTemplateButtonProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleDuplicate() {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `/api/templates/${templateId}/duplicate`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to duplicate template."
        );
      }

      router.push(`/templates/${result.template.id}`);
      router.refresh();
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to duplicate template."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex items-center gap-3">
      <button
        type="button"
        onClick={handleDuplicate}
        disabled={loading}
        className="rounded-md border bg-white px-4 py-2 text-sm font-medium hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading ? "Duplicating..." : "Duplicate Template"}
      </button>

      {error && (
        <p className="text-sm text-red-600">
          {error}
        </p>
      )}
    </div>
  );
}