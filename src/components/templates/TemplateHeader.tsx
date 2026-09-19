"use client";

import Link from "next/link";

interface TemplateHeaderProps {
  name: string;
  source?: string;
  sourceFilename?: string | null;
  onSave?: () => void;
  saving?: boolean;
}

export default function TemplateHeader({
  name,
  source = "Spectora",
  sourceFilename,
  onSave,
  saving = false,
}: TemplateHeaderProps) {
  return (
    <div className="border-b bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between gap-6 px-6 py-5">
        <div className="min-w-0">
          <Link
            href="/templates"
            className="text-sm text-gray-500 hover:text-black"
          >
            ← Templates
          </Link>

          <h1 className="mt-2 truncate text-2xl font-bold">
            {name}
          </h1>

          <div className="mt-1 flex flex-wrap gap-2 text-sm text-gray-500">
            <span>Source: {source}</span>

            {sourceFilename && (
              <>
                <span>•</span>
                <span className="truncate">
                  {sourceFilename}
                </span>
              </>
            )}
          </div>
        </div>

        {onSave && (
          <button
            type="button"
            onClick={onSave}
            disabled={saving}
            className="shrink-0 rounded-md bg-black px-5 py-2.5 text-sm font-medium text-white disabled:opacity-50"
          >
            {saving ? "Saving..." : "Save Changes"}
          </button>
        )}
      </div>
    </div>
  );
}