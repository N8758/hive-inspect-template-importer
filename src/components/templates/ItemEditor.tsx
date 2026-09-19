"use client";

import { useState } from "react";
import type {
  TemplateComment,
  TemplateItem,
} from "../../types/template";
import CommentEditor from "./CommentEditor";

interface ItemEditorProps {
  item: TemplateItem;
  onChange: (item: TemplateItem) => void;
}

export default function ItemEditor({
  item,
  onChange,
}: ItemEditorProps) {
  const [open, setOpen] = useState(false);

  function updateName(name: string) {
    onChange({
      ...item,
      name,
    });
  }

  function updateComments(comments: TemplateComment[]) {
    onChange({
      ...item,
      comments,
    });
  }

  return (
    <div className="overflow-hidden rounded-md border bg-gray-50">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="flex w-full items-center justify-between px-4 py-3 text-left hover:bg-gray-100"
      >
        <div>
          <div className="text-sm font-semibold text-gray-900">
            {item.name || "Unnamed Item"}
          </div>

          <div className="mt-1 text-xs text-gray-500">
            {item.comments.length}{" "}
            {item.comments.length === 1 ? "comment" : "comments"}
          </div>
        </div>

        <span className="text-lg text-gray-500">
          {open ? "−" : "+"}
        </span>
      </button>

      {open && (
        <div className="border-t bg-white p-4">
          <label
            htmlFor={`item-${item.id}`}
            className="block text-sm font-medium text-gray-700"
          >
            Item Name
          </label>

          <input
            id={`item-${item.id}`}
            type="text"
            value={item.name}
            onChange={(event) =>
              updateName(event.target.value)
            }
            className="mt-2 w-full rounded-md border px-3 py-2 text-sm outline-none focus:ring-2"
          />

          <div className="mt-4 space-y-3">
            {item.comments.map((comment, index) => (
              <CommentEditor
                key={comment.id}
                comment={comment}
                onChange={(updatedComment) => {
                  const comments = [...item.comments];
                  comments[index] = updatedComment;
                  updateComments(comments);
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}