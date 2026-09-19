"use client";

import { useState } from "react";
import type {
  TemplateItem,
  TemplateSection,
} from "../../types/template";
import ItemEditor from "./ItemEditor";

interface SectionEditorProps {
  section: TemplateSection;
  onChange: (section: TemplateSection) => void;
}

export default function SectionEditor({
  section,
  onChange,
}: SectionEditorProps) {
  const [open, setOpen] = useState(false);

  function updateName(name: string) {
    onChange({
      ...section,
      name,
    });
  }

  function updateItems(items: TemplateItem[]) {
    onChange({
      ...section,
      items,
    });
  }

  return (
    <section className="overflow-hidden rounded-lg border bg-white shadow-sm">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-5 py-4 text-left hover:bg-gray-50"
      >
        <div>
          <div className="text-base font-semibold text-gray-900">
            {section.name || "Unnamed Section"}
          </div>

          <div className="mt-1 text-sm text-gray-500">
            {section.items.length}{" "}
            {section.items.length === 1 ? "item" : "items"}
          </div>
        </div>

        <span className="text-xl text-gray-500">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t p-5">
          <div className="mb-5">
            <label
              htmlFor={`section-${section.id}`}
              className="block text-sm font-medium text-gray-700"
            >
              Section Name
            </label>

            <input
              id={`section-${section.id}`}
              type="text"
              value={section.name}
              onChange={(event) =>
                updateName(event.target.value)
              }
              className="mt-2 w-full rounded-md border px-3 py-2 text-sm font-medium outline-none focus:ring-2"
            />
          </div>

          <div className="space-y-4">
            {section.items.map((item, index) => (
              <ItemEditor
                key={item.id}
                item={item}
                onChange={(updatedItem) => {
                  const items = [...section.items];
                  items[index] = updatedItem;
                  updateItems(items);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </section>
  );
}