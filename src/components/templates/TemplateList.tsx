"use client";

import { useEffect, useState } from "react";
import TemplateCard from "./TemplateCard";

interface Template {
  id: string;
  name: string;
  source: string;
  source_filename: string | null;
  created_at: string;
  updated_at: string;
}

export default function TemplateList() {
  const [templates, setTemplates] = useState<Template[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  async function loadTemplates() {
    try {
      setLoading(true);
      setError("");

      const response = await fetch("/api/templates", {
        cache: "no-store",
      });

      const data = await response.json();

      if (!response.ok || !data.success) {
        throw new Error(
          data.error || "Failed to load templates."
        );
      }

      setTemplates(
        Array.isArray(data.templates)
          ? data.templates
          : []
      );
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Failed to load templates."
      );
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    loadTemplates();
  }, []);

  if (loading) {
    return (
      <div className="rounded-lg border bg-white p-6">
        <p className="text-sm text-gray-600">
          Loading templates...
        </p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6">
        <p className="text-sm text-red-700">{error}</p>

        <button
          type="button"
          onClick={loadTemplates}
          className="mt-4 rounded-md bg-black px-4 py-2 text-sm text-white"
        >
          Try Again
        </button>
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <div className="rounded-lg border border-dashed bg-white p-8 text-center">
        <h3 className="text-lg font-semibold">
          No templates yet
        </h3>

        <p className="mt-2 text-sm text-gray-500">
          Import a Spectora template to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
      {templates.map((template) => (
        <TemplateCard
          key={template.id}
          template={template}
        />
      ))}
    </div>
  );
}