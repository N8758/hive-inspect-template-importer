"use client";

import { ChangeEvent, useState } from "react";

interface FileUploaderProps {
  onImportComplete?: (result: unknown) => void;
}

export default function FileUploader({
  onImportComplete,
}: FileUploaderProps) {
  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function handleFileChange(
    event: ChangeEvent<HTMLInputElement>
  ) {
    const selectedFile =
      event.target.files?.[0] ?? null;

    setError("");

    if (!selectedFile) {
      setFile(null);
      return;
    }

    const fileName = selectedFile.name.toLowerCase();

if (!fileName.endsWith(".xlsx") && !fileName.endsWith(".xls")) {
      setFile(null);
      setError(
        "Unsupported file type. Please select a Spectora .xls or .xlsx HTML-text export."
      );
      return;
    }

    if (selectedFile.size === 0) {
      setFile(null);
      setError(
        "The selected file is empty. Please choose a valid Excel file."
      );
      return;
    }

    setFile(selectedFile);
  }

  async function handleImport() {
    if (!file) {
      setError("Please select an Excel file first.");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/import", {
        method: "POST",
        body: formData,
      });

      const result = await response.json();

      onImportComplete?.(result);

      if (!response.ok || !result.success) {
        setError(
          result.error ||
            "The template could not be imported."
        );
        return;
      }

      setFile(null);
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to import template."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="w-full max-w-xl space-y-4 rounded-lg border bg-white p-6">
      <div>
        <h2 className="text-xl font-semibold">
          Import Spectora Template
        </h2>

        <p className="mt-1 text-sm text-gray-600">
          Upload the Spectora Excel HTML-text export.
        </p>
      </div>

      <div className="rounded-md border border-dashed p-6">
        <label
          htmlFor="template-file"
          className="flex cursor-pointer flex-col items-center justify-center gap-2 text-center"
        >
          <span className="text-sm font-medium">
            Choose Excel file
          </span>

          <span className="text-xs text-gray-500">
            Spectora .xls or .xlsx HTML-text export
          </span>

          <input
            id="template-file"
            type="file"
            accept=".xls,.xlsx,application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
            onChange={handleFileChange}
            className="mt-2 block w-full text-sm"
            disabled={loading}
          />
        </label>
      </div>

      {file && (
        <div className="rounded-md bg-gray-50 p-3">
          <p className="text-sm font-medium">
            Selected file
          </p>

          <p className="mt-1 break-all text-sm text-gray-600">
            {file.name}
          </p>

          <p className="mt-1 text-xs text-gray-500">
            {(file.size / 1024).toFixed(1)} KB
          </p>
        </div>
      )}

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <button
        type="button"
        onClick={handleImport}
        disabled={!file || loading}
        className="w-full rounded-md bg-black px-4 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-50"
      >
        {loading
          ? "Importing..."
          : "Import Template"}
      </button>
    </div>
  );
}