interface ImportWarning {
  severity: "warning" | "error" | "info";
  message: string;
  sourceLocation?: string | null;
  originalContent?: string | null;
}

interface ImportWarningsProps {
  warnings?: ImportWarning[];
}

export default function ImportWarnings({
  warnings = [],
}: ImportWarningsProps) {
  if (warnings.length === 0) {
    return (
      <div className="w-full max-w-xl rounded-md border border-green-200 bg-green-50 p-4">
        <p className="text-sm font-medium text-green-800">
          No import warnings.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl space-y-3">
      <div>
        <h2 className="text-lg font-semibold">
          Import warnings
        </h2>

        <p className="text-sm text-gray-500">
          Review these messages to verify the imported content.
        </p>
      </div>

      {warnings.map((warning, index) => (
        <div
          key={`${warning.severity}-${index}`}
          className="rounded-md border p-4"
        >
          <div className="flex items-center gap-2">
            <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-medium uppercase">
              {warning.severity}
            </span>

            {warning.sourceLocation && (
              <span className="text-xs text-gray-500">
                {warning.sourceLocation}
              </span>
            )}
          </div>

          <p className="mt-2 text-sm">
            {warning.message}
          </p>

          {warning.originalContent && (
            <details className="mt-3">
              <summary className="cursor-pointer text-xs font-medium text-gray-600">
                View original content
              </summary>

              <pre className="mt-2 max-h-48 overflow-auto rounded bg-gray-50 p-3 text-xs whitespace-pre-wrap">
                {warning.originalContent}
              </pre>
            </details>
          )}
        </div>
      ))}
    </div>
  );
}