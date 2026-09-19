interface ImportSummaryProps {
  success: boolean;
  templateName?: string;
  sections?: number;
  items?: number;
  comments?: number;
  warnings?: number;
  error?: string;
}

export default function ImportSummary({
  success,
  templateName,
  sections = 0,
  items = 0,
  comments = 0,
  warnings = 0,
  error,
}: ImportSummaryProps) {
  if (!success) {
    return (
      <div className="w-full max-w-xl rounded-md border border-red-200 bg-red-50 p-5">
        <h2 className="text-lg font-semibold text-red-800">
          Import failed
        </h2>

        <p className="mt-2 text-sm text-red-700">
          {error ||
            "The template could not be imported. No template was created."}
        </p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-xl rounded-md border bg-white p-5">
      <div>
        <h2 className="text-lg font-semibold">
          Import complete
        </h2>

        {templateName && (
          <p className="mt-1 break-all text-sm text-gray-600">
            {templateName}
          </p>
        )}
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-2xl font-semibold">
            {sections}
          </p>
          <p className="text-xs text-gray-500">
            Sections
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-2xl font-semibold">
            {items}
          </p>
          <p className="text-xs text-gray-500">
            Items
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-2xl font-semibold">
            {comments}
          </p>
          <p className="text-xs text-gray-500">
            Comments
          </p>
        </div>

        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-2xl font-semibold">
            {warnings}
          </p>
          <p className="text-xs text-gray-500">
            Warnings
          </p>
        </div>
      </div>

      <p className="mt-4 text-xs text-gray-500">
        Review any warnings before opening the imported template.
      </p>
    </div>
  );
}