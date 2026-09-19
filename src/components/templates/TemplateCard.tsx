"use client";

import Link from "next/link";

interface Template {
  id: string;
  name: string;
  source: string;
  source_filename: string | null;
  created_at: string;
  updated_at: string;
}

interface TemplateCardProps {
  template: Template;
}

export default function TemplateCard({
  template,
}: TemplateCardProps) {
  return (
    <div className="rounded-lg border bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold">
            {template.name}
          </h3>

          <p className="mt-1 text-sm text-gray-500">
            Source: {template.source}
          </p>
        </div>

        <span className="rounded-full bg-gray-100 px-3 py-1 text-xs font-medium">
          Template
        </span>
      </div>

      {template.source_filename && (
        <p className="mt-4 truncate text-sm text-gray-600">
          {template.source_filename}
        </p>
      )}

      <p className="mt-2 text-xs text-gray-500">
        Updated{" "}
        {new Date(template.updated_at).toLocaleDateString()}
      </p>

      <Link
        href={`/templates/${template.id}`}
        className="mt-5 block rounded-md bg-black px-4 py-2 text-center text-sm font-medium text-white hover:opacity-90"
      >
        Open Template
      </Link>
    </div>
  );
}