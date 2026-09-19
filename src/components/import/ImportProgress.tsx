"use client";

interface ImportProgressProps {
  isImporting: boolean;
}

export default function ImportProgress({
  isImporting,
}: ImportProgressProps) {
  if (!isImporting) {
    return null;
  }

  return (
    <div className="flex w-full max-w-xl items-center gap-3 rounded-md border p-4">
      <div className="h-5 w-5 animate-spin rounded-full border-2 border-gray-300 border-t-black" />

      <div>
        <p className="text-sm font-medium">
          Importing template
        </p>

        <p className="text-xs text-gray-500">
          Reading spreadsheet and saving template data...
        </p>
      </div>
    </div>
  );
}