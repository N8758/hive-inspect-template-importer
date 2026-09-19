"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import FileUploader from "../../components/import/FileUploader";
import ImportSummary from "../../components/import/ImportSummary";
import ImportWarnings from "../../components/import/ImportWarnings";

interface ImportWarning {
  severity: "warning" | "error" | "info";
  message: string;
  sourceLocation?: string | null;
  originalContent?: string | null;
}

interface ImportResult {
  success: boolean;
  templateId?: string;
  template?: {
    name?: string;
    sections?: Array<{
      items?: Array<{
        comments?: unknown[];
      }>;
    }>;
  } | null;
  warnings?: ImportWarning[];
  error?: string;
}

export default function ImportPage() {
  const router = useRouter();
  const [result, setResult] = useState<ImportResult | null>(null);

  function handleImportComplete(data: unknown) {
    setResult(data as ImportResult);
  }

  const sections = result?.template?.sections ?? [];

  const itemCount = sections.reduce(
    (total, section) =>
      total + (section.items?.length ?? 0),
    0
  );

  const commentCount = sections.reduce(
    (total, section) =>
      total +
      (section.items ?? []).reduce(
        (itemTotal, item) =>
          itemTotal + (item.comments?.length ?? 0),
        0
      ),
    0
  );

  const warnings = result?.warnings ?? [];

  return (
    <main className="min-h-screen bg-gray-50 px-6 py-10">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">
            Import Template
          </h1>

          <p className="mt-2 text-gray-600">
            Import a Spectora Excel template into Hive Inspect.
          </p>
        </div>

        <FileUploader
          onImportComplete={handleImportComplete}
        />

        {result && (
          <div className="mt-8 space-y-6">
            <ImportSummary
              success={result.success}
              templateName={result.template?.name}
              sections={sections.length}
              items={itemCount}
              comments={commentCount}
              warnings={warnings.length}
              error={result.error}
            />

            {result.success && (
              <>
                <ImportWarnings
                  warnings={warnings}
                />

                {result.templateId && (
                  <button
                    type="button"
                    onClick={() =>
                      router.push(
                        `/templates/${result.templateId}`
                      )
                    }
                    className="rounded-md bg-black px-5 py-3 text-sm font-medium text-white hover:bg-gray-800"
                  >
                    Open Imported Template
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </main>
  );
}