"use client";

import { useState } from "react";
import type {
  Template,
  TemplateSection,
} from "../../types/template";
import TemplateHeader from "./TemplateHeader";
import SectionEditor from "./SectionEditor";
import DuplicateTemplateButton from "./DuplicateTemplateButton";

interface TemplateEditorProps {
  initialTemplate: Template;
}

export default function TemplateEditor({
  initialTemplate,
}: TemplateEditorProps) {
  const [template, setTemplate] =
    useState<Template>(initialTemplate);

  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  function updateTemplateName(name: string) {
    setTemplate((current) => ({
      ...current,
      name,
    }));
  }

  function updateSections(sections: TemplateSection[]) {
    setTemplate((current) => ({
      ...current,
      sections,
    }));
  }

  async function saveTemplate() {
    setSaving(true);
    setMessage("");
    setError("");

    try {
      const response = await fetch(
        `/api/templates/${template.id}`,
        {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            name: template.name,
            sections: template.sections,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok || !result.success) {
        throw new Error(
          result.error || "Failed to save template."
        );
      }

      setTemplate(result.template);
      setMessage("Changes saved successfully.");
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "Failed to save template."
      );
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <TemplateHeader
        name={template.name}
        source={template.source}
        sourceFilename={template.sourceFilename}
        onSave={saveTemplate}
        saving={saving}
      />

      <main className="mx-auto max-w-7xl space-y-6 px-6 py-8">
        {message && (
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            {message}
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error}
          </div>
        )}

        <div className="rounded-lg border bg-white p-6">
          <label
            htmlFor="template-name"
            className="block text-sm font-medium"
          >
            Template Name
          </label>

          <input
            id="template-name"
            type="text"
            value={template.name}
            onChange={(event) =>
              updateTemplateName(event.target.value)
            }
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />
        </div>

        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold">
              Template Structure
            </h2>

            <p className="mt-1 text-sm text-gray-500">
              Edit sections, items, and comments.
            </p>
          </div>

          <DuplicateTemplateButton
            templateId={template.id}
          />
        </div>

        <div className="space-y-4">
          {template.sections.length === 0 ? (
            <div className="rounded-lg border border-dashed bg-white p-8 text-center">
              <p className="text-sm text-gray-500">
                This template has no sections.
              </p>
            </div>
          ) : (
            template.sections.map((section, index) => (
              <SectionEditor
                key={section.id}
                section={section}
                onChange={(updatedSection) => {
                  const sections = [...template.sections];
                  sections[index] = updatedSection;
                  updateSections(sections);
                }}
              />
            ))
          )}
        </div>
      </main>
    </div>
  );
}